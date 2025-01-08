import * as THREE from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
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
    
    // 模型相关
    this.mesh = null
    this.mixer = null
    this.characterAnimation = {  // 角色自身的动画系统
        mixer: null,
        actions: {},
        current: null
    }
    
    this.createPlayerMesh()
  }

  async createPlayerMesh() {
    const loader = new FBXLoader()
    
    try {
        // 加载角色模型
        const characterFbx = await loader.loadAsync('/models/model1/character.fbx')
        characterFbx.scale.setScalar(0.01)

        // 创建角色自身的动画混合器
        this.characterAnimation.mixer = new THREE.AnimationMixer(characterFbx)
        
        // 加载并立即设置默认动画
        try {
            // 加载动画文件
            const animFbx = await loader.loadAsync('/models/model1/Idle.fbx')
            if (animFbx.animations && animFbx.animations.length > 0) {
                const clip = animFbx.animations[0]
                
                // 重新映射骨骼名称以确保动画正确应用
                clip.tracks = clip.tracks.map(track => {
                    const [boneName, property] = track.name.split('.')
                    const bone = characterFbx.getObjectByName(boneName)
                    if (!bone) {
                        // 尝试查找相似名称的骨骼
                        const similarBone = this.findSimilarBone(characterFbx, boneName)
                        if (similarBone) {
                            return new THREE.KeyframeTrack(
                                `${similarBone.name}.${property}`,
                                track.times,
                                track.values
                            )
                        }
                    }
                    return track
                }).filter(Boolean)

                // 创建动画动作
                const action = this.characterAnimation.mixer.clipAction(clip)
                
                // 配置动画
                action.setLoop(THREE.LoopRepeat)
                action.clampWhenFinished = true
                action.timeScale = 1
                
                // 立即播放动画
                action.reset().play()
                
                // 存储当前动画
                this.characterAnimation.current = action
                
                console.log('Default animation applied successfully')
            }
        } catch (animError) {
            console.error('Error loading default animation:', animError)
        }

        this.mesh = characterFbx
        this.mesh.position.set(this.position.x, this.position.y, this.position.z)
        this.scene.add(this.mesh)

    } catch (error) {
        console.error('Error loading character model:', error)
        this.createFallbackMesh()
    }
  }

  // 添加辅助方法来查找相似的骨骼名称
  findSimilarBone(model, boneName) {
    let similarBone = null
    const lowerBoneName = boneName.toLowerCase()
    
    model.traverse(node => {
        if (node.isBone) {
            const lowerNodeName = node.name.toLowerCase()
            if (lowerNodeName.includes(lowerBoneName) || 
                lowerBoneName.includes(lowerNodeName)) {
                similarBone = node
            }
        }
    })
    
    return similarBone
  }

  // 移动到指定位置（使用原有的移动系统）
  moveTo(target, speed = 7) {
    if (!target || (typeof target.x === 'undefined' || typeof target.z === 'undefined')) {
        console.warn('Invalid target position:', target)
        return
    }

    this.targetPosition = {
        x: target.x,
        y: 0,
        z: target.z
    }
    this.speed = speed
    this.isMoving = true
  }

  // 更新位置（保持原有的移动逻辑）
  update(deltaTime) {
    // 更新角色自身的动画
    if (this.characterAnimation.mixer) {
        this.characterAnimation.mixer.update(deltaTime)
    }
    
    // 原有的移动逻辑
    if (!this.isMoving || !this.targetPosition) return

    const dx = this.targetPosition.x - this.position.x
    const dz = this.targetPosition.z - this.position.z
    const distance = Math.sqrt(dx * dx + dz * dz)

    if (distance < 0.01) {
        this.position.x = this.targetPosition.x
        this.position.z = this.targetPosition.z
        this.isMoving = false
        this.targetPosition = null
        return
    }

    const directionX = dx / distance
    const directionZ = dz / distance
    const moveDistance = Math.min(this.speed * deltaTime, distance)

    this.position.x += directionX * moveDistance
    this.position.z += directionZ * moveDistance

    if (this.mesh) {
        this.mesh.position.set(this.position.x, 0, this.position.z)
        // 更新模型朝向
        const angle = Math.atan2(directionX, directionZ)
        this.mesh.rotation.y = angle
    }
  }
} 