<script setup>
import { ref } from 'vue'
import * as THREE from 'three'

const props = defineProps({
  scene: {
    type: Object,
    required: true
  }
})

// 羽毛球的参数
const SHUTTLECOCK_CONFIG = {
  cork: {
    radius: 0.025,
    height: 0.05,
    color: 0xF5F5F5
  },
  feathers: {
    topRadius: 0.06,
    bottomRadius: 0.025,
    height: 0.13,
    color: 0xFFFFFF
  }
}

// 创建羽毛球模型
function createShuttlecock() {
  const group = new THREE.Group()
  
  // 创建球托（cork）- 使用半球体
  const corkGeometry = new THREE.SphereGeometry(
    SHUTTLECOCK_CONFIG.cork.radius,
    16,
    16,
    0,
    Math.PI * 2,
    0,
    Math.PI / 2
  )
  const corkMaterial = new THREE.MeshStandardMaterial({
    color: SHUTTLECOCK_CONFIG.cork.color,
    roughness: 0.5
  })
  const cork = new THREE.Mesh(corkGeometry, corkMaterial)
  group.add(cork)
  
  // 创建羽毛部分（feathers）- 使用圆锥体
  const feathersGeometry = new THREE.ConeGeometry(
    SHUTTLECOCK_CONFIG.feathers.topRadius,
    SHUTTLECOCK_CONFIG.feathers.height,
    16
  )
  const feathersMaterial = new THREE.MeshStandardMaterial({
    color: SHUTTLECOCK_CONFIG.feathers.color,
    roughness: 0.7,
    side: THREE.DoubleSide
  })
  const feathers = new THREE.Mesh(feathersGeometry, feathersMaterial)
  feathers.position.y = SHUTTLECOCK_CONFIG.feathers.height / 2
  group.add(feathers)

  // 设置整个组的旋转，使羽毛球竖直放置
  group.rotation.x = Math.PI
  
  return group
}

// 羽毛球实例
const shuttlecock = ref(createShuttlecock())

// 暴露羽毛球实例供父组件使用
defineExpose({
  shuttlecock
})
</script>

<template>
  <!-- 这是一个纯3D组件，不需要模板 -->
</template>