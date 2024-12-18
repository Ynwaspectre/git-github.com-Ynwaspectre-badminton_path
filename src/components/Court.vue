<template>
  <div ref="courtContainer" class="w-full h-full">
    <!-- Three.js 将在这里渲染羽毛球场地 -->
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { useCourtStore } from '../stores/court'

import { 
  COURT_CONFIG, 
  PLAYER_POSITIONS, 
  PLAYER_CONFIG,
  LIGHT_CONFIG,

} from '../settings/scene'
import { TrajectoryManager } from '../utils/TrajectoryManager'

// 添加 emit 定义
const emit = defineEmits(['pointSelected'])

const courtStore = useCourtStore()

// 场地配置
const courtConfig = COURT_CONFIG

const courtContainer = ref()
let scene
let camera
let renderer
let controls
let trajectoryManager

const settingsRef = ref(null)


// 添加轨迹相关的状态
const trajectoryLine = ref(null)
const shuttlecock = ref(null)

const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()
let isCollectingPoints = ref(false)  // 是否正在收集点位
let courtPlane  // 存储场地平面引用

onMounted(() => {
  initThreeJS()
  animate()
  trajectoryManager = new TrajectoryManager(
    scene,
    () => {
      // 播放完成时的回调
      settingsRef.value?.handlePlayComplete()
    }
  )
})

onUnmounted(() => {
  renderer?.dispose()
  window.removeEventListener('resize', onWindowResize)
  trajectoryManager?.dispose()
  // 清理所有动画和对象
  if (trajectoryLine.value) {
    scene.remove(trajectoryLine.value)
  }
  if (shuttlecock.value) {
    scene.remove(shuttlecock.value)
  }
  courtContainer.value?.removeEventListener('click', onMouseClick)
})

function initThreeJS() {
  scene = new THREE.Scene()
  scene.background = new THREE.Color('#404040')

  const container = courtContainer.value
  const width = container.clientWidth
  const height = container.clientHeight

  camera = new THREE.PerspectiveCamera(
    30,
    width / height,
    0.1,
    1000
  )
  camera.position.set(0, 18, 22)
  camera.lookAt(0, 0, 0)

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    precision: 'highp'
  })

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(width, height)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  courtContainer.value?.appendChild(renderer.domElement)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.minDistance = 20
  controls.maxDistance = 40
  controls.minPolarAngle = Math.PI * 0.15
  controls.maxPolarAngle = Math.PI * 0.45
  controls.target.set(0, 0.5, 0)

  controls.addEventListener('change', () => {
    const distance = camera.position.length()
    const minHeight = Math.max(5, distance * 0.3)
    if (camera.position.y < minHeight) {
      camera.position.y = minHeight
      camera.lookAt(controls.target)
    }
  })

  createCourt()
  createLighting()

  window.addEventListener('resize', onWindowResize)
}

function createCourt() {
  const courtGeometry = new THREE.PlaneGeometry(
    courtConfig.dimensions.width,
    courtConfig.dimensions.length
  )
  const courtMaterial = new THREE.MeshStandardMaterial({
    color: courtConfig.colors.court,
    side: THREE.DoubleSide,
    roughness: courtConfig.materials.courtRoughness,
    metalness: courtConfig.materials.metalness,
    flatShading: false
  })
  courtPlane = new THREE.Mesh(courtGeometry, courtMaterial)
  courtPlane.rotation.x = -Math.PI / 2
  courtPlane.receiveShadow = true
  scene.add(courtPlane)

  createCourtLines()
  createNet()
}

function createCourtLines() {
  const lineMaterial = new THREE.MeshBasicMaterial({
    color: courtConfig.colors.lines,
    opacity: courtConfig.materials.lineOpacity,
    transparent: true
  })

  const { width, length, singlesWidth, serviceLine, doubleServiceLine, lineWidth } = courtConfig.dimensions

  // 创建线条的函数
  function createLineRect(x, z, w, l) {
    const geometry = new THREE.PlaneGeometry(w, l)
    const line = new THREE.Mesh(geometry, lineMaterial)
    line.position.set(x, 0.001, z) // 略微抬高线条防止z-fighting
    line.rotation.x = -Math.PI / 2
    scene.add(line)
  }

  // 外场线（双打场地）
  createLineRect(-width / 2, 0, lineWidth, length) // 左边线
  createLineRect(width / 2, 0, lineWidth, length)  // 右边线
  createLineRect(0, length / 2, width, lineWidth)  // 上线
  createLineRect(0, -length / 2, width, lineWidth) // 下底线

  // 单打线
  createLineRect(-singlesWidth / 2, 0, lineWidth, length)
  createLineRect(singlesWidth / 2, 0, lineWidth, length)

  // 中线（从发球线到底线）
  const backCourtLength = (length / 2 - serviceLine) // 后场长度
  // 上半场中线
  createLineRect(0, length / 2 - backCourtLength / 2, lineWidth, backCourtLength)
  // 下半场中线
  createLineRect(0, -length / 2 + backCourtLength / 2, lineWidth, backCourtLength)

  // 发球线
  createLineRect(0, serviceLine, width, lineWidth)    // 前发球线
  createLineRect(0, -serviceLine, width, lineWidth)   // 后发球线

  // 双打发球线（靠近底线的短线）
  createLineRect(0, length / 2 - doubleServiceLine, width, lineWidth)  // 上双打发球线
  createLineRect(0, -length / 2 + doubleServiceLine, width, lineWidth) // 下双打发球线
}

function createNet() {
  const { width, poleRadius } = courtConfig.dimensions
  const netHeightPoles = 1.55    // 网柱处的高度（1.55米）
  const netHeightCenter = 1.524  // 网中心的高度（1.524米）
  const netBottomHeight = 0.76   // 网底部距离地面的高度（0.76米）

  // 柱
  const poleGeometry = new THREE.CylinderGeometry(poleRadius, poleRadius, netHeightPoles)
  const poleMaterial = new THREE.MeshPhongMaterial({
    color: courtConfig.colors.poles,
    shininess: 30
  })

  const leftPole = new THREE.Mesh(poleGeometry, poleMaterial)
  leftPole.position.set(-width / 2, netHeightPoles / 2, 0)
  leftPole.castShadow = false
  scene.add(leftPole)

  const rightPole = new THREE.Mesh(poleGeometry, poleMaterial)
  rightPole.position.set(width / 2, netHeightPoles / 2, 0)
  rightPole.castShadow = false
  scene.add(rightPole)

  // 创建网格
  const netGroup = new THREE.Group()

  // 格参数 - 调整网格大小和范围
  const gridWidth = width - 0.1  // 略微缩小网格宽度，避免超出网柱
  const gridHeight = netHeightPoles - netBottomHeight
  const gridSize = 0.1  // 每个格子10厘米

  // 计算需要的网格数量
  const verticalCount = Math.floor(gridWidth / gridSize)  // 使用 floor 避免超出
  const horizontalCount = Math.floor(gridHeight / gridSize)

  // 创建横线
  for (let i = 0; i <= horizontalCount; i++) {
    const y = netBottomHeight + i * gridSize
    const geometry = new THREE.BufferGeometry()
    const points = []

    // 只有顶部的线有弧度，其他都是直线
    if (i === horizontalCount) {
      // 顶部线有轻微弧度
      for (let j = 0; j <= 20; j++) {
        const x = -gridWidth / 2 + (j / 20) * gridWidth
        const ratio = 1 - Math.pow(Math.abs(x) / (gridWidth / 2), 2)
        const height = netHeightPoles - ratio * (netHeightPoles - netHeightCenter)
        points.push(new THREE.Vector3(x, height, 0))
      }
    } else {
      // 其他线条都是直的
      points.push(new THREE.Vector3(-gridWidth / 2, y, 0))
      points.push(new THREE.Vector3(gridWidth / 2, y, 0))
    }

    geometry.setFromPoints(points)
    const line = new THREE.Line(
      geometry,
      new THREE.LineBasicMaterial({
        color: 0x000000,
        linewidth: 0.1,
        transparent: true,
        opacity: 0.7
      })
    )
    netGroup.add(line)
  }

  // 创建竖线
  for (let i = 0; i <= verticalCount; i++) {
    const x = -gridWidth / 2 + i * gridSize
    const geometry = new THREE.BufferGeometry()
    const points = [
      new THREE.Vector3(x, netBottomHeight, 0),
      new THREE.Vector3(x, netHeightPoles, 0)
    ]

    geometry.setFromPoints(points)
    const line = new THREE.Line(
      geometry,
      new THREE.LineBasicMaterial({
        color: 0x000000,
        linewidth: 0.1,
        transparent: true,
        opacity: 0.7
      })
    )
    netGroup.add(line)
  }

  scene.add(netGroup)

  // 添加网的上边缘白带
  const bandGeometry = new THREE.BoxGeometry(width, 0.07, 0.02)
  const bandMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff
  })
  const topBand = new THREE.Mesh(bandGeometry, bandMaterial)
  topBand.position.set(0, netHeightPoles - 0.035, 0)
  scene.add(topBand)
}

function createLighting() {
  // 环境光
  const ambientLight = new THREE.AmbientLight(LIGHT_CONFIG.ambient.color, LIGHT_CONFIG.ambient.intensity)
  scene.add(ambientLight)

  // 主光源
  const mainLight = new THREE.DirectionalLight(LIGHT_CONFIG.main.color, LIGHT_CONFIG.main.intensity)
  mainLight.position.set(LIGHT_CONFIG.main.position.x, LIGHT_CONFIG.main.position.y, LIGHT_CONFIG.main.position.z)
  mainLight.castShadow = true

  mainLight.shadow.mapSize.width = LIGHT_CONFIG.main.shadow.mapSize
  mainLight.shadow.mapSize.height = LIGHT_CONFIG.main.shadow.mapSize
  mainLight.shadow.camera.near = LIGHT_CONFIG.main.shadow.near
  mainLight.shadow.camera.far = LIGHT_CONFIG.main.shadow.far
  mainLight.shadow.normalBias = LIGHT_CONFIG.main.shadow.normalBias
  mainLight.shadow.bias = LIGHT_CONFIG.main.shadow.bias

  scene.add(mainLight)

  // 补光
  const fillLight = new THREE.DirectionalLight(LIGHT_CONFIG.fill.color, LIGHT_CONFIG.fill.intensity)
  fillLight.position.set(LIGHT_CONFIG.fill.position.x, LIGHT_CONFIG.fill.position.y, LIGHT_CONFIG.fill.position.z)
  scene.add(fillLight)

  // 顶光
  const topLight = new THREE.DirectionalLight(LIGHT_CONFIG.top.color, LIGHT_CONFIG.top.intensity)
  topLight.position.set(LIGHT_CONFIG.top.position.x, LIGHT_CONFIG.top.position.y, LIGHT_CONFIG.top.position.z)
  scene.add(topLight)
}

function onWindowResize() {
  const container = courtContainer.value
  if (!container) return

  const width = container.clientWidth
  const height = container.clientHeight

  camera.aspect = width / height
  camera.updateProjectionMatrix()

  renderer.setSize(width, height)
}

function animate() {
  requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
}

// 监听颜色变化
watch(() => courtStore.selectedColor, (newColor) => {
  if (scene) {
    // 更新球场材质颜色
    courtConfig.colors.court = newColor
    // 重新创球场
    createCourt()
  }
}, { immediate: true })


// 修改 watch 函数中的玩家建逻辑
watch(() => courtStore.selectedType, (newType) => {
  // ... 清除现有玩家的代码保持不变 ...
  if (newType !== 5 && scene) { // 5 是"都不"选项
    // 清除现有球员
    const playerGroups = scene.children.filter(child => child.type === 'player')
    playerGroups.forEach(player => {
      scene.remove(player)
    })
  }
  // 创建员 根据setting.js中的PLAYER_POSITIONS
  const positions = PLAYER_POSITIONS[newType]
  if (positions) {
    positions.forEach(pos => {
      const playerInstance = createPlayer({
        gender: pos.gender,
        position: pos.position,
        playerIndex: pos.index
      })
      scene.add(playerInstance)
    })
  }

})

// 创建球员的辅助函数
function createPlayer(playerData) {
  const group = new THREE.Group()
  const config = PLAYER_CONFIG[playerData.gender]
  const color = config.colors[playerData.playerIndex % 2]

  // 创建头部
  const headGeometry = new THREE.SphereGeometry(0.12, 16, 16)
  const headMaterial = new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.7
  })
  const head = new THREE.Mesh(headGeometry, headMaterial)
  head.position.y = config.height - 0.12
  group.add(head)

  // 创建身体
  const bodyGeometry = new THREE.CylinderGeometry(
    config.shoulderWidth / 2,
    config.shoulderWidth / 3,
    config.height - 0.24,
    8
  )
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: color,
    roughness: 0.7
  })
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
  body.position.y = (config.height - 0.24) / 2
  group.add(body)

  // 设置位置
  group.position.set(playerData.position.x, playerData.position.y || 0, playerData.position.z)
  group.type = 'player'
  group.userData = {
    gender: playerData.gender,
    playerIndex: playerData.playerIndex
  }
  return group
}

// 修改 createClearTrajectory 函数名为更��用的名称
function showTrajectory(type) {
  trajectoryManager.createTrajectory(type)
}

// 添加预览点位方法
function previewPoints(points) {
  trajectoryManager.previewPoints(points)
}

// 添加清除预览方法
function clearPreview() {
  trajectoryManager.clearPreview()
}

// 添加播放轨迹方法
function playTrajectory(points) {
  trajectoryManager.playTrajectory(points)
}

// 添加清除方法
function clearPoints() {
  trajectoryManager.cleanup()
}

// 添加鼠标点击事件处理
function onMouseClick(event) {
  if (!isCollectingPoints.value) return

  // 计算鼠标在场景中的位置
  const rect = courtContainer.value.getBoundingClientRect()
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

  raycaster.setFromCamera(mouse, camera)
  
  // 与场地平面相交
  const intersects = raycaster.intersectObject(courtPlane)
  
  if (intersects.length > 0) {
    const point = intersects[0].point
    // 发送选中的点位数据到父组件
    emit('pointSelected', {
      x: Number(point.x.toFixed(2)),
      y: 1.7,  // 默认高度
      z: Number(point.z.toFixed(2))
    })
  }
}

// 添加开始/停止收集点位的方法
function startCollectingPoints() {
  isCollectingPoints.value = true
  courtContainer.value.addEventListener('click', onMouseClick)
}

function stopCollectingPoints() {
  isCollectingPoints.value = false
  courtContainer.value.removeEventListener('click', onMouseClick)
}

// 暴露方法供父组件使用
defineExpose({
  showTrajectory,
  previewPoints,
  clearPreview,
  playTrajectory,
  clearPoints,
  startCollectingPoints,
  stopCollectingPoints
})
</script>