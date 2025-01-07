import * as THREE from 'three'
import { PLAYER_CONFIG } from '../settings/player'

export class Player {
  constructor(scene, config) {
    this.scene = scene
    this.number = config.number
    this.position = {
      x: config.position.x,
      y: config.position.y,
      z: config.position.z
    }
    this.targetPosition = null
    this.speed = 0
    this.isMoving = false
    this.gender = config.gender || 'male'
    this.createPlayerMesh()
  }

  createPlayerMesh() {
    const config = PLAYER_CONFIG
    const group = new THREE.Group()

    // 创建身体（圆柱体）
    const bodyGeometry = new THREE.CylinderGeometry(
      config.dimensions.shoulderWidth / 2,
      config.dimensions.shoulderWidth / 3,
      config.dimensions.height*(8/9),
      32
    )
    const bodyMaterial = new THREE.MeshPhongMaterial({
      color: config.colors.shirt || 0x2196F3
    })
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
    body.position.y = config.dimensions.height * (0.3)
    group.add(body)

    // 创建数字贴图
    const numberCanvas = document.createElement('canvas')
    numberCanvas.width = 256
    numberCanvas.height = 256
    const ctx = numberCanvas.getContext('2d')
    
    // 设置背景为透明
    ctx.clearRect(0, 0, numberCanvas.width, numberCanvas.height)
    
    // 绘制圆圈
    ctx.fillStyle = '#FFFFFF'
    ctx.beginPath()
    ctx.arc(128, 128, 100, 0, Math.PI * 2)
    ctx.fill()
    
    // 绘制数字
    ctx.fillStyle = '#000000'
    ctx.font = 'bold 160px "Arial Unicode MS"'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const circleNumbers = ['①', '②', '③', '④']
    ctx.fillText(circleNumbers[this.number - 1], 128, 128)

    const numberTexture = new THREE.CanvasTexture(numberCanvas)
    const numberPlaneGeometry = new THREE.PlaneGeometry(
      config.dimensions.shoulderWidth * 0.8,
      config.dimensions.shoulderWidth * 0.8
    )
    const numberPlaneMaterial = new THREE.MeshBasicMaterial({
      map: numberTexture,
      transparent: true,
      side: THREE.FrontSide,
      depthTest: true,
      depthWrite: true
    })

    // 创建前面的数字
    const frontNumber = new THREE.Mesh(numberPlaneGeometry, numberPlaneMaterial)
    frontNumber.position.set(0, config.dimensions.height * 0.35, config.dimensions.shoulderWidth / 2 + 0.01)
    group.add(frontNumber)

    // 创建后面的数字（旋转180度）
    const backNumber = new THREE.Mesh(numberPlaneGeometry, numberPlaneMaterial.clone())
    backNumber.position.set(0, config.dimensions.height * 0.35, -(config.dimensions.shoulderWidth / 2 + 0.01))
    backNumber.rotation.y = Math.PI
    group.add(backNumber)


    // 创建头部（球体）
    const headGeometry = new THREE.SphereGeometry(
      config.dimensions.height*(1/9)
    )
    const headMaterial = new THREE.MeshPhongMaterial({
      color: 0xFFE0BD
    })
    const head = new THREE.Mesh(headGeometry, headMaterial)
    head.position.y = config.dimensions.height * (7.5/9)
    group.add(head)

    this.mesh = group
    this.mesh.position.set(this.position.x, this.position.y, this.position.z)
    this.scene.add(this.mesh)
  }

  // 移动到指定位置
  moveTo(target, speed = 7) {
    // 确保目标位置是有效的
    if (!target || (typeof target.x === 'undefined' || typeof target.z === 'undefined')) {
      console.warn('Invalid target position:', target)
      return
    }

    this.targetPosition = {
      x: target.x,
      y: 0,  // 确保y轴为0
      z: target.z
    }
    this.speed = speed
    this.isMoving = true
    
    // 计算移动距离，用于日志
    const distance = Math.sqrt(
      Math.pow(target.x - this.position.x, 2) + 
      Math.pow(target.z - this.position.z, 2)
    )
    
  }

  // 更新位置
  update(deltaTime) {
    // 添加调试日志


    if (!this.isMoving || !this.targetPosition) return

    // 计算当前位置到目标位置的向量
    const dx = this.targetPosition.x - this.position.x
    const dz = this.targetPosition.z - this.position.z
    const distance = Math.sqrt(dx * dx + dz * dz)

    // 如果距离很小，直接到达目标位置
    if (distance < 0.01) {
      this.position.x = this.targetPosition.x
      this.position.z = this.targetPosition.z
      this.isMoving = false
      this.targetPosition = null
      return
    }

    // 计算移动方向
    const directionX = dx / distance
    const directionZ = dz / distance

    // 计算这一帧要移动的距离
    const moveDistance = Math.min(this.speed * deltaTime, distance)

    // 更新位置
    this.position.x += directionX * moveDistance
    this.position.z += directionZ * moveDistance

    // 更新网格位置
    if (this.mesh) {
      this.mesh.position.set(this.position.x, 0, this.position.z)  // 确保y轴为0
    }
  }

  dispose() {
    if (this.mesh) {
      this.scene.remove(this.mesh)
      if (this.mesh.geometry) this.mesh.geometry.dispose()
      if (this.mesh.material) this.mesh.material.dispose()
    }
  }
} 