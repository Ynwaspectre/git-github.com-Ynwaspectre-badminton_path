<template>
  <div ref="courtContainer" class="w-full h-full">
    <!-- Three.js 将在这里渲染羽毛球场地 -->
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

// 场地配置
const courtConfig = {
  // 标准尺寸（单位：米）
  dimensions: {
    width: 6.1,        // 双打场地宽度
    length: 13.4,      // 场地长度
    singlesWidth: 5.18,// 单打场地宽度
    serviceLine: 1.98, // 发球线距离
    doubleServiceLine: 0.76, // 双打发球线距离（从底线算起）
    netHeight: 1.55,   // 网高
    netWidth: 0.02,    // 网的厚度
    poleRadius: 0.05,  // 网柱半径
    lineWidth: 0.04    // 线宽
  },
  // 颜色配置
  colors: {
    court: 0x90EE90,     // 场地颜色 - 绿色
    lines: 0xFFFFFF,     // 线条颜色 - 白色
    net: 0xFFFFFF,       // 网的颜色 - 白色
    poles: 0x666666,     // 网柱颜色 - 灰色
    background: 0x121212  // 背景颜色 - 深色
  },
  // 材质配置
  materials: {
    netOpacity: 0.8,     // 调高网的透明度
    courtRoughness: 0.3, // 降低粗糙度使表面更光滑
    lineOpacity: 1,      // 线条不透明度
    metalness: 0.1,       // 添加一些金属感
    netGridSize: 0.05    // 网格大小（米）
  }
}

const courtContainer = ref()
let scene
let camera
let renderer
let controls

onMounted(() => {
  initThreeJS()
  animate()
})

onUnmounted(() => {
  renderer?.dispose()
  window.removeEventListener('resize', onWindowResize)
})

function initThreeJS() {
  scene = new THREE.Scene()
  scene.background = new THREE.Color(courtConfig.colors.background)
  
  camera = new THREE.PerspectiveCamera(
    35,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  )
  camera.position.set(0, 15, 20)
  camera.lookAt(0, 0, 0)
  
  renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    alpha: true,
    precision: 'highp'
  })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  courtContainer.value?.appendChild(renderer.domElement)
  
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.minDistance = 10
  controls.maxDistance = 30
  controls.maxPolarAngle = Math.PI / 2.1
  
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
  const court = new THREE.Mesh(courtGeometry, courtMaterial)
  court.rotation.x = -Math.PI / 2
  court.receiveShadow = true
  scene.add(court)
  
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

  // 外场线
  createLineRect(0, 0, width + lineWidth, lineWidth) // 中线
  createLineRect(-width/2, 0, lineWidth, length) // 左边线
  createLineRect(width/2, 0, lineWidth, length) // 右边线
  createLineRect(0, length/2, width + lineWidth, lineWidth) // 上底线
  createLineRect(0, -length/2, width + lineWidth, lineWidth) // 下底线

  // 单打线
  createLineRect(-singlesWidth/2, 0, lineWidth, length)
  createLineRect(singlesWidth/2, 0, lineWidth, length)

  // 发球线
  createLineRect(0, serviceLine, width, lineWidth) // 前发球线
  createLineRect(0, -serviceLine, width, lineWidth) // 后发球线
  createLineRect(0, 0, lineWidth, serviceLine * 2) // 中线

  // 双打发球线
  createLineRect(0, length/2 - doubleServiceLine, width, lineWidth) // 上双打发球线
  createLineRect(0, -length/2 + doubleServiceLine, width, lineWidth) // 下双打发球线
}

function createNet() {
  const { netHeight, width, poleRadius } = courtConfig.dimensions
  
  // 创建网柱
  const poleGeometry = new THREE.CylinderGeometry(poleRadius, poleRadius, netHeight)
  const poleMaterial = new THREE.MeshStandardMaterial({ 
    color: courtConfig.colors.poles 
  })
  
  const leftPole = new THREE.Mesh(poleGeometry, poleMaterial)
  leftPole.position.set(-width/2, netHeight/2, 0)
  leftPole.castShadow = true
  scene.add(leftPole)
  
  const rightPole = new THREE.Mesh(poleGeometry, poleMaterial)
  rightPole.position.set(width/2, netHeight/2, 0)
  rightPole.castShadow = true
  scene.add(rightPole)
  
  // 创建网格纹理
  const gridSize = courtConfig.materials.netGridSize
  const textureSize = 512
  const canvas = document.createElement('canvas')
  canvas.width = textureSize
  canvas.height = textureSize
  const ctx = canvas.getContext('2d')
  
  // 设置背景为透明
  ctx.fillStyle = 'rgba(0, 0, 0, 0)'
  ctx.fillRect(0, 0, textureSize, textureSize)
  
  // 绘制网格
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 2
  const cellSize = textureSize / 10 // 每个网格的像素大小
  
  // 绘制横线
  for (let y = 0; y <= textureSize; y += cellSize) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(textureSize, y)
    ctx.stroke()
  }
  
  // 绘制竖线
  for (let x = 0; x <= textureSize; x += cellSize) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, textureSize)
    ctx.stroke()
  }
  
  // 创建纹理
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(width / gridSize, netHeight / gridSize)
  
  // 创建网
  const netGeometry = new THREE.PlaneGeometry(width, netHeight)
  const netMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: courtConfig.materials.netOpacity,
    map: texture,
    alphaMap: texture,
    alphaTest: 0.5
  })
  
  const net = new THREE.Mesh(netGeometry, netMaterial)
  net.position.set(0, netHeight/2, 0)
  net.castShadow = true
  scene.add(net)
  
  // 添加网的上边缘线（白色）
  const edgeGeometry = new THREE.BoxGeometry(width, 0.04, 0.04)
  const edgeMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    opacity: 1
  })
  const topEdge = new THREE.Mesh(edgeGeometry, edgeMaterial)
  topEdge.position.set(0, netHeight, 0)
  scene.add(topEdge)
  
  // 添加网的上部白色带子
  const bandGeometry = new THREE.BoxGeometry(width, 0.07, 0.02)
  const bandMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    opacity: 1
  })
  const topBand = new THREE.Mesh(bandGeometry, bandMaterial)
  topBand.position.set(0, netHeight - 0.035, 0)
  scene.add(topBand)
}

function createLighting() {
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
  scene.add(ambientLight)
  
  const mainLight = new THREE.DirectionalLight(0xffffff, 0.8)
  mainLight.position.set(10, 10, 10)
  mainLight.castShadow = true
  mainLight.shadow.mapSize.width = 2048
  mainLight.shadow.mapSize.height = 2048
  mainLight.shadow.camera.near = 0.5
  mainLight.shadow.camera.far = 50
  scene.add(mainLight)
  
  const fillLight = new THREE.DirectionalLight(0xffffff, 0.4)
  fillLight.position.set(-5, 8, -10)
  scene.add(fillLight)
  
  const topLight = new THREE.DirectionalLight(0xffffff, 0.3)
  topLight.position.set(0, 15, 0)
  scene.add(topLight)
}

function onWindowResize() {
  const container = courtContainer.value
  if (!container) return
  
  const width = container.clientWidth
  const height = container.clientHeight
  
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(width, height)
}

function animate() {
  requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
}
</script> 