<script setup>
import { ref } from 'vue'
import * as THREE from 'three'
import { PLAYER_CONFIG } from '../settings/scene'

const props = defineProps({
  scene: {
    type: Object,
    required: true
  },
  gender: {
    type: String,
    default: 'male'
  },
  playerIndex: {
    type: Number,
    required: true
  }
})

// 创建人物模型
function createPlayer() {
  const group = new THREE.Group()
  const config = PLAYER_CONFIG[props.gender]
  const color = config.colors[props.playerIndex % 2]
  
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
  
  group.type = 'player'
  group.userData = {
    gender: props.gender,
    playerIndex: props.playerIndex
  }
  
  return group
}

const playerModel = ref(createPlayer())

// 暴露方法供父组件使用
defineExpose({
  playerModel,
  // 获取模型的配置信息
  getConfig() {
    return PLAYER_CONFIG[props.gender]
  }
})
</script>

<template>
  <!-- 这是一个纯3D组件���不需要模板 -->
</template> 