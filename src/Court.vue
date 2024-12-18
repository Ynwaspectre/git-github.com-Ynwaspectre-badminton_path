<template>
  <div class="relative w-full h-full">
    <canvas ref="canvasRef" class="w-full h-full"></canvas>
    <!-- 添加视角切换按钮 -->
    <div class="absolute top-4 right-4">
      <n-button
        circle
        secondary
        type="primary"
        @click="setTopView"
        class="shadow-lg"
      >
        <template #icon>
          <n-icon><ArrowDown /></n-icon>
        </template>
      </n-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { TrajectoryManager } from '../utils/TrajectoryManager'
import { COURT_CONFIG, LIGHT_CONFIG } from '../settings/scene'
import { NButton, NIcon } from 'naive-ui'
import { ArrowDown } from '@vicons/ionicons5'

// 添加拖拽状态跟踪
const isDragging = ref(false)
let lastClickTime = 0
let lastClickPosition = { x: 0, y: 0 }
const DOUBLE_CLICK_DELAY = 300  // 双击间隔时间（毫秒）
const POSITION_THRESHOLD = 5    // 双击位置差异阈值（像素）

// ... 其他代码保持不变 ...

// 添加顶视图设置函数
function setTopView() {
  // 设置相机位置到正上方
  camera.position.set(0, 20, 0.0001)
  camera.lookAt(0, 0, 0)
  // 更新控制器
  controls.target.set(0, 0, 0)
  controls.update()
}

// 修改初始化相机函数
function initCamera() {
  camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  )
  // 设置初始相机位置
  camera.position.set(-8, 8, 8)
  camera.lookAt(0, 0, 0)
}

// 修改控制器初始化
function initControls() {
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  
  // 限制相机垂直角度范围
  controls.minPolarAngle = 0
  controls.maxPolarAngle = Math.PI / 2
}

// 添加鼠标事件监听
function initMouseEvents() {
  const canvas = renderer.domElement
  
  canvas.addEventListener('click', (event) => {
    const currentTime = Date.now()
    const timeDiff = currentTime - lastClickTime
    const positionDiff = Math.sqrt(
      Math.pow(event.clientX - lastClickPosition.x, 2) +
      Math.pow(event.clientY - lastClickPosition.y, 2)
    )
    
    if (timeDiff < DOUBLE_CLICK_DELAY && positionDiff < POSITION_THRESHOLD) {
      // 双击触发
      onCanvasClick(event)
      lastClickTime = 0  // 重置时间，防止连续触发
      lastClickPosition = { x: 0, y: 0 }  // 重置位置
    } else {
      lastClickTime = currentTime
      lastClickPosition = { x: event.clientX, y: event.clientY }
    }
  })
}

// 修改点击事件处理
function onCanvasClick(event) {
  // 如果正在拖拽，不处理点击
  if (isDragging.value) return
  if (!isCollecting.value) return
  
  const rect = renderer.domElement.getBoundingClientRect()
  const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  const y = -((event.clientY - rect.top) / rect.height) * 2 + 1

  raycaster.setFromCamera(new THREE.Vector2(x, y), camera)
  const intersects = raycaster.intersectObjects([
    court,
    ...trajectoryManager.markers.map(m => m.marker)
  ], true)

  if (intersects.length > 0) {
    const firstIntersect = intersects[0].object
    if (firstIntersect === court) {
      const point = intersects[0].point
      emit('pointSelected', {
        x: point.x,
        y: point.y,
        z: point.z
      })
    }
  }
}

onMounted(() => {
  init()
  initControls()
  initMouseEvents()
  animate()
})

onBeforeUnmount(() => {
  // 清理事件监听
  const canvas = renderer.domElement
  canvas.removeEventListener('click')
  controls.dispose()
  // ... 其他清理代码 ...
})
</script> 