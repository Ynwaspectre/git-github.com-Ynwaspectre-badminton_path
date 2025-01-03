import * as THREE from 'three'
import { 
  TRAJECTORY_CONFIG, 
  calculateClearTrajectory,
  calculateDriveTrajectory,
  calculateSmashTrajectory 
} from '../settings/scene'
import { Player } from './Player'
import { PLAYER_POSITIONS } from '../settings/player'

// 计算抛物线上的点
function calculateParabolicPoint(start, end, t) {
  // 线性插值计算 x 和 z 坐标
  const x = start.x + (end.x - start.x) * t
  const z = start.z + (end.z - start.z) * t
  
  // 计算两点间的距离
  const distance = Math.sqrt(
    Math.pow(end.x - start.x, 2) +
    Math.pow(end.z - start.z, 2)
  )
  
  // 计算抛物线高度
  const maxHeight = Math.max(start.y, end.y) + distance * 0.2
  
  // 使用正弦函数创建抛物线效果
  const y = start.y + (end.y - start.y) * t +
           Math.sin(Math.PI * t) * (maxHeight - Math.max(start.y, end.y))
  
  // 确保过网高度
  if (Math.abs(z) < 0.1) {
    return { x, y: Math.max(y, 1.6), z }
  }
  
  return { x, y, z }
}

export class TrajectoryManager {
  constructor(scene, onPlayComplete) {
    this.scene = scene
    this.trajectoryLine = null
    this.shuttlecock = null
    this.animationFrameId = null
    this.markers = []
    this.returnPointMarkers = []  // 存储回位点标记
    this.currentTrajectoryPoints = []
    this.onPlayComplete = onPlayComplete
    this.isPreviewMode = false
    this.showTrajectory = true
    this.showReturnPoints = true  // 默认显示回位点
    this.players = []
    this.playerPositions = {
      initialPositions: {
        singles: {
          player1: { x: 0, z: -4 },
          player2: { x: 0, z: 4 }
        },
        doubles: {
          player1: { x: 1.5, z: -4 },
          player2: { x: 1.5, z: 4 },
          player3: { x: -1.5, z: -4 },
          player4: { x: -1.5, z: 4 }
        }
      },
      returnPoints: []
    }
    this.matchConfig = {
      isDoubles: false,
      gender: 'male'
    }
    this.initPlayers()
    this.animating = false
  }

  initPlayers() {
    console.log('Initializing players with config:', this.matchConfig)
    this.players.forEach(player => player.dispose())
    this.players = []

    if (this.matchConfig.type === 'NONE') {
      console.log('No players needed for this type')
      return
    }

    switch (this.matchConfig.type) {
      case 'SINGLES':  // 单打
        this.players.push(
          new Player(this.scene, { 
            position: { 
              x: this.playerPositions.initialPositions.singles.player1.x,
              y: 0,
              z: this.playerPositions.initialPositions.singles.player1.z
            },
            number: 1
          }),
          new Player(this.scene, { 
            position: { 
              x: this.playerPositions.initialPositions.singles.player2.x,
              y: 0,
              z: this.playerPositions.initialPositions.singles.player2.z
            },
            number: 2
          })
        )
        break

      case 'DOUBLES':  // 双打
        this.players.push(
          new Player(this.scene, { 
            position: { 
              x: this.playerPositions.initialPositions.doubles.player1.x,
              y: 0,
              z: this.playerPositions.initialPositions.doubles.player1.z
            },
            number: 1
          }),
          new Player(this.scene, { 
            position: { 
              x: this.playerPositions.initialPositions.doubles.player2.x,
              y: 0,
              z: this.playerPositions.initialPositions.doubles.player2.z
            },
            number: 2
          }),
          new Player(this.scene, { 
            position: { 
              x: this.playerPositions.initialPositions.doubles.player3.x,
              y: 0,
              z: this.playerPositions.initialPositions.doubles.player3.z
            },
            number: 3
          }),
          new Player(this.scene, { 
            position: { 
              x: this.playerPositions.initialPositions.doubles.player4.x,
              y: 0,
              z: this.playerPositions.initialPositions.doubles.player4.z
            },
            number: 4
          })
        )
        break
    }

    // 检查是否有现存的点位，如果有，移动对应球员
    this.alignPlayersWithPoints()
  }

  // 新增方法：将球员与现有点位对齐
  alignPlayersWithPoints() {
    // 检查是否是单打比赛且有点位
    if (!this.matchConfig.isDoubles && 
        this.currentTrajectoryPoints && 
        this.currentTrajectoryPoints.length > 0) {
      const firstPoint = this.currentTrajectoryPoints[0]
      console.log('Aligning players with first point:', firstPoint)
      this.movePlayerToFirstPoint(firstPoint)
    }
  }

  // 移动球员到第一个点位
  movePlayerToFirstPoint(point) {
    console.log('Moving player to point:', point)
    if (!this.matchConfig.isDoubles && this.players.length > 0) {
      const isPointFrontCourt = point.z < 0
      
      // 找到对应半场的球员并移动
      this.players.forEach(player => {
        const isPlayerFrontCourt = player.position.z < 0
        if (isPlayerFrontCourt === isPointFrontCourt) {
          player.moveTo({ x: point.x, z: point.z })
        }
      })

      // 启动动画循环
      if (!this.animating) {
        this.animating = true
        this.animate()
      }
    }
  }

  // 添加独立的动画循环
  animate() {
    if (!this.animating) return
    
    const currentTime = performance.now()
    const deltaTime = (currentTime - (this.lastTime || currentTime)) / 1000
    this.lastTime = currentTime
    
    // 更新所有球员位置
    let anyPlayerMoving = false
    this.players.forEach(player => {
      player.update(deltaTime)
      if (player.isMoving) anyPlayerMoving = true
    })
    
    // 如果所有球员都停止移动，结束动画循环
    if (!anyPlayerMoving) {
      this.animating = false
      return
    }
    
    requestAnimationFrame(() => this.animate())
  }

  // 更新比赛类型
  updateMatchType(config) {
    console.log('Updating match type:', config)
    this.matchConfig = {
      ...config.config,
      type: config.type
    }
    // 保存当前点位
    const currentPoints = [...this.currentTrajectoryPoints]
    // 确保清理现有球员
    this.players.forEach(player => player.dispose())
    this.players = []
    this.initPlayers()
    // 恢复点位
    this.currentTrajectoryPoints = currentPoints
    // 重新对齐球员
    this.alignPlayersWithPoints()
  }

  createClearTrajectory() {
    this.cleanup()

    // 生成起点和终点
    const start = {
      x: -1,
      y: 1.6,
      z: -4
    }

    const end = {
      x: 1,
      y: 1.7,
      z: 4
    }

    // 计算轨迹点
    const points = this.calculateTrajectory(
      start,
      end,
      TRAJECTORY_CONFIG.clear.standard.maxHeight
    )

    // 创建轨迹线
    this.createTrajectoryLine(points)

    // 创建羽毛球
    this.createShuttlecock()

    // 开始动画
    this.startAnimation(points, this.showTrajectory)
  }

  calculateTrajectory(start, end, maxHeight) {
    const points = []
    const segments = 50

    for (let i = 0; i <= segments; i++) {
      const t = i / segments
      const x = start.x + (end.x - start.x) * t
      const z = start.z + (end.z - start.z) * t
      const y = start.y + (end.y - start.y) * t + 
                maxHeight * Math.sin(Math.PI * t) * (1 - t) * 4
      points.push({ x, y, z })
    }

    return points
  }

  createTrajectoryLine(points) {
    // 如果已存在轨迹线，先移除
    if (this.trajectoryLine) {
      this.scene.remove(this.trajectoryLine)
      this.trajectoryLine.geometry.dispose()
      this.trajectoryLine.material.dispose()
    }

    const geometry = new THREE.BufferGeometry()
    const vertices = []
    points.forEach(point => {
      vertices.push(point.x, point.y, point.z)
    })
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))

    const material = new THREE.LineDashedMaterial({
      color: 0xffffff,
      linewidth: 2,
      scale: 1,
      dashSize: 0.3,    // 减小虚线段长度
      gapSize: 0.2,     // 减小间隙长度
      transparent: true,
      opacity: 1
    })

    this.trajectoryLine = new THREE.Line(geometry, material)
    this.trajectoryLine.computeLineDistances()  // 必须调用此方法才能显示虚线
    this.trajectoryLine.visible = true
    this.scene.add(this.trajectoryLine)
  }

  createShuttlecock() {
    // 创建羽毛球组
    const shuttlecockGroup = new THREE.Group()

    // 球头（cork）
    const corkGeometry = new THREE.SphereGeometry(0.04)  // 增大球头尺寸
    const corkMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,  // 纯白色
      shininess: 100,
      specular: 0x666666
    })
    const cork = new THREE.Mesh(corkGeometry, corkMaterial)
    shuttlecockGroup.add(cork)

    // 创建羽毛部分（使用圆锥体）
    const featherGeometry = new THREE.ConeGeometry(0.06, 0.1, 12)  // 增大羽毛部分尺寸
    const featherMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,  // 纯白色
      shininess: 50,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide
    })
    const feathers = new THREE.Mesh(featherGeometry, featherMaterial)
    feathers.position.y = -0.05  // 调整羽毛部分位置
    shuttlecockGroup.add(feathers)

    // 添加羽毛纹理线条
    const linesMaterial = new THREE.LineBasicMaterial({ 
      color: 0xffffff,  // 白色线条
      transparent: true,
      opacity: 0.7
    })
    
    // 添加垂直线条
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2
      const lineGeometry = new THREE.BufferGeometry()
      const vertices = new Float32Array([
        0, 0, 0,
        0.06 * Math.cos(angle), -0.1, 0.06 * Math.sin(angle)
      ])
      lineGeometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
      const line = new THREE.Line(lineGeometry, linesMaterial)
      feathers.add(line)
    }

    // 添加环形线条
    const ringGeometry = new THREE.BufferGeometry()
    const ringVertices = []
    for (let i = 0; i <= 32; i++) {
      const angle = (i / 32) * Math.PI * 2
      ringVertices.push(
        0.06 * Math.cos(angle), -0.07, 0.06 * Math.sin(angle)
      )
    }
    ringGeometry.setAttribute('position', new THREE.Float32BufferAttribute(ringVertices, 3))
    const ring = new THREE.Line(ringGeometry, linesMaterial)
    feathers.add(ring)

    // 初始旋转，使球头朝前
    shuttlecockGroup.rotation.x = -Math.PI / 2

    this.shuttlecock = shuttlecockGroup
    this.scene.add(shuttlecockGroup)
  }

  // 将 checkTrajectoryAndGetHeight 移到类级别
  checkTrajectoryAndGetHeight(start, end) {
    const distance = Math.sqrt(
      Math.pow(end.x - start.x, 2) +
      Math.pow(end.z - start.z, 2)
    );
    
    // 如果不需要过网，使用正常弧度
    if (start.z * end.z >= 0) {
      return 0.15;  // 正常弧度系数
    }
    
    // 计算网处的位置
    const netProgress = -start.z / (end.z - start.z);
    const baseNetY = start.y + (end.y - start.y) * netProgress;
    
    // 从正常弧度开始尝试
    let heightCoefficient = 0.15;
    let maxHeight = Math.max(start.y, end.y) + distance * heightCoefficient;
    let heightAtNet = baseNetY + Math.sin(Math.PI * netProgress) * 
                     (maxHeight - Math.max(start.y, end.y));
    
    console.log('\n调整高度系数:');
    console.log(`- 初始网处高度: ${heightAtNet.toFixed(2)}m`);
    
    // 如果正常弧度过不了网，逐步提高直到能过网
    const NET_HEIGHT = 1.55;
    const MIN_CLEARANCE = 0.2;
    
    while (heightAtNet < NET_HEIGHT + MIN_CLEARANCE && heightCoefficient < 0.5) {
      heightCoefficient += 0.05;
      maxHeight = Math.max(start.y, end.y) + distance * heightCoefficient;
      heightAtNet = baseNetY + Math.sin(Math.PI * netProgress) * 
                   (maxHeight - Math.max(start.y, end.y));
      
      console.log(`- 系数 ${heightCoefficient.toFixed(2)}: 高度 ${heightAtNet.toFixed(2)}m`);
    }
    
    console.log(`- 最终系数: ${heightCoefficient.toFixed(2)}`);
    return heightCoefficient;
  }

  startAnimation(points, showTrajectory = true, trajectoryConfigs = {}) {
    let currentIndex = 0
    let progress = 0
    let lastTime = performance.now()
    this._hitComplete = false  // 重置击球完成状态

    const animate = (currentTime) => {
      const deltaTime = (currentTime - lastTime) / 1000
      lastTime = currentTime

      // 更新球员位置
      this.players.forEach(player => player.update(deltaTime))

      if (currentIndex < points.length - 1) {
        const start = points[currentIndex]
        const end = points[currentIndex + 1]
        
        progress += deltaTime
        const t = this.easeInOutQuad(Math.min(progress / 1, 1))
        
        // 更新羽毛球位置
        if (this.shuttlecock) {
          const pos = calculateParabolicPoint(start, end, t)
          this.shuttlecock.position.set(pos.x, pos.y, pos.z)
          
          // 计算方向向量
          const direction = new THREE.Vector3(
            end.x - start.x,
            end.y - start.y,
            end.z - start.z
          ).normalize()
          
          // 应用旋转
          this.shuttlecock.quaternion.setFromUnitVectors(
            new THREE.Vector3(0, 1, 0),
            direction
          )
        }

        // 更新轨迹线
        if (showTrajectory) {
          const linePoints = []
          // 添加当前段的部分轨迹
          const segments = 50  // 增加细分数，使轨迹更平滑
          for (let j = 0; j <= Math.floor(t * segments); j++) {
            const segmentT = j / segments
            linePoints.push(calculateParabolicPoint(start, end, segmentT))
          }
          this.createTrajectoryLine(linePoints)
        }
        
        if (progress >= 1) {
          currentIndex++
          progress = 0
          this._hitComplete = false  // 重置击球完成状态
          
          // 清除上一段轨迹
          if (this.trajectoryLine) {
            this.scene.remove(this.trajectoryLine)
            this.trajectoryLine.geometry.dispose()
            this.trajectoryLine.material.dispose()
            this.trajectoryLine = null
          }
          
          // 处理下一段轨迹的球员移动
          if (currentIndex < points.length - 1) {
            const configKey = `P${currentIndex + 1}-P${currentIndex + 2}`
            const config = trajectoryConfigs[configKey] || {}
            
            if (config.hitConfig) {
              // 直接使用配置中指定的击球员
              const actualHitterId = config.hitConfig.hitterId
              const hitter = this.players[actualHitterId - 1]
              if (hitter) {
                console.log(`${actualHitterId}号球员移动到击球点(${points[currentIndex].x.toFixed(2)}, ${points[currentIndex].z.toFixed(2)})`)
                hitter.moveTo(points[currentIndex])
              }

              // 让伙伴移动到击球时的位置
              if (this.matchConfig.isDoubles) {
                const partnerId = actualHitterId % 2 === 1 ? actualHitterId + 2 : actualHitterId + 2
                const partner = this.players[partnerId - 1]
                if (partner && config.hitConfig.partnerStandPoint) {
                  console.log(`${partnerId}号球员(伙伴)移动到站位点(${config.hitConfig.partnerStandPoint.x.toFixed(2)}, ${config.hitConfig.partnerStandPoint.z.toFixed(2)})`)
                  partner.moveTo(config.hitConfig.partnerStandPoint)
                }
              }
            }
          }
        }
        
        // 检查是否完成击球动作（进度超过50%）
        if (progress > 0.5 && !this._hitComplete) {
          this._hitComplete = true
          const config = trajectoryConfigs[`P${currentIndex + 1}-P${currentIndex + 2}`]
          
          if (config?.hitConfig) {
            console.log(`===== 击球后回退 =====`)
            // 直接使用配置中指定的击球员
            const actualHitterId = config.hitConfig.hitterId

            // 让击球员回退
            const hitter = this.players[actualHitterId - 1]
            if (hitter) {
              console.log(`${actualHitterId}号球员回退到(${config.hitConfig.hitterReturnPoint.x.toFixed(2)}, ${config.hitConfig.hitterReturnPoint.z.toFixed(2)})`)
              hitter.moveTo(config.hitConfig.hitterReturnPoint)
            }
            
            // 让伙伴回退
            if (this.matchConfig.isDoubles) {
              const partnerId = actualHitterId === 1 ? 3 : 
                              actualHitterId === 2 ? 4 :
                              actualHitterId === 3 ? 1 : 2
              const partner = this.players[partnerId - 1]
              if (partner) {
                console.log(`${partnerId}号球员(伙伴)回退到(${config.hitConfig.partnerReturnPoint.x.toFixed(2)}, ${config.hitConfig.partnerReturnPoint.z.toFixed(2)})`)
                partner.moveTo(config.hitConfig.partnerReturnPoint)
              }
            }
          }
        }
        
        this.animationFrameId = requestAnimationFrame(animate)
      } else {
        // 清除轨迹线和羽毛球
        if (this.trajectoryLine) {
          this.scene.remove(this.trajectoryLine)
          this.trajectoryLine.geometry.dispose()
          this.trajectoryLine.material.dispose()
          this.trajectoryLine = null
        }
        
        if (this.shuttlecock) {
          this.scene.remove(this.shuttlecock)
          this.shuttlecock = null
        }

        // 调用完成回调
        if (this.onPlayComplete) {
          this.onPlayComplete()
        }
      }
    }

    this.animationFrameId = requestAnimationFrame(animate)
  }

  easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
  }

  cleanup(keepMarkers = false) {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }

    if (this.trajectoryLine) {
      this.scene.remove(this.trajectoryLine)
      this.trajectoryLine.geometry.dispose()
      this.trajectoryLine.material.dispose()
      this.trajectoryLine = null
    }

    if (this.shuttlecock) {
      this.scene.remove(this.shuttlecock)
      this.shuttlecock = null
    }

    if (!keepMarkers) {
      this.markers.forEach(({ marker, sprite }) => {
        this.scene.remove(marker)
        this.scene.remove(sprite)
        marker.geometry.dispose()
        marker.material.dispose()
        sprite.material.dispose()
      })
      this.markers = []
    }
    this.currentTrajectoryPoints = []

    this.players.forEach(player => player.dispose())
    this.players = []
    this.initPlayers()

    // 清除回位点标记
    this.returnPointMarkers.forEach(marker => {
      this.scene.remove(marker)
      marker.geometry.dispose()
      marker.material.dispose()
    })
    this.returnPointMarkers = []
  }

  dispose() {
    this.cleanup()
  }

  createTrajectory(type) {
    this.cleanup()

    const config = TRAJECTORY_CONFIG[type].standard
    const start = {
      x: -1,
      y: config.startArea.y[0],
      z: config.startArea.z[0]
    }

    const end = {
      x: 1,
      y: config.endArea.y[0],
      z: config.endArea.z[1]
    }

    let points
    switch (type) {
      case 'drive':
        points = calculateDriveTrajectory(start, end, config.maxHeight)
        break
      case 'smash':
        points = calculateSmashTrajectory(start, end, config.maxHeight)
        break
      default:
        points = calculateClearTrajectory(start, end, config.maxHeight)
    }

    this.createTrajectoryLine(points)
    this.createShuttlecock()
    this.startAnimation(points)
  }

  // 预览点位
  previewPoints(points) {
    this.clearMarkers()
    
    // 如果没有点位或只有一个点位，要显示
    if (!points || points.length === 0) return
    
    // 创建新的标记点
    points.forEach((point, index) => {
      const marker = this.createMarker(point, index)
      this.markers.push(marker)
    })
    
    this.isPreviewMode = true
    this.currentTrajectoryPoints = points
  }

  // 清除预览点位
  clearPreview() {
    this.clearMarkers()
    this.isPreviewMode = false
  }

  // 只清理标记点的方法
  clearMarkers() {
    this.markers.forEach(({ marker, sprite }) => {
      this.scene.remove(marker)
      this.scene.remove(sprite)
      marker.geometry.dispose()
      marker.material.dispose()
      sprite.material.dispose()
    })
    this.markers = []
  }

  // 创建标记点
  createMarker(point, index) {
    const geometry = new THREE.SphereGeometry(0.08)  // 调整球体尺寸为0.08
    const material = new THREE.MeshBasicMaterial({ 
      color: 0xffff00,
      opacity: 0.8,
      transparent: true
    })
    const marker = new THREE.Mesh(geometry, material)
    marker.position.set(point.x, point.y, point.z)
    this.scene.add(marker)
    
    // 添加点的序号
    const canvas = document.createElement('canvas')
    canvas.width = 128
    canvas.height = 128
    const context = canvas.getContext('2d')
    context.font = 'Bold 64px Arial'
    context.fillStyle = 'white'
    context.strokeStyle = 'black'
    context.lineWidth = 4
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    const text = (index + 1).toString()
    context.strokeText(text, 64, 64)
    context.fillText(text, 64, 64)
    
    const texture = new THREE.CanvasTexture(canvas)
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture })
    const sprite = new THREE.Sprite(spriteMaterial)
    sprite.position.copy(marker.position)
    sprite.position.x += 0.15
    sprite.position.y += 0.15
    sprite.scale.set(0.2, 0.2, 1)
    this.scene.add(sprite)
    
    return { marker, sprite }
  }

  // 播放轨迹
  playTrajectory(points, configs) {
    console.log('playTrajectory',  configs)
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
    }

    // 首先让指定的击球员移动到第一个击球点
    const firstConfig = configs['P1-P2']
    console.log('firstConfig', firstConfig)
    if (firstConfig?.hitConfig) {
      // 直接使用配置中指定的击球员
      const actualHitterId = firstConfig.hitConfig.hitterId
      const hitter = this.players[actualHitterId - 1]
      if (hitter) {
        console.log(`===== 开始预览轨迹 =====`)
        console.log(`第一个击球点: P1(${points[0].x.toFixed(2)}, ${points[0].z.toFixed(2)})`)
        console.log(`${actualHitterId}号球员移动到击球点`)

        hitter.moveTo({
          x: points[0].x,
          z: points[0].z
        })

        // 如果是双打，还要移动伙伴
        if (this.matchConfig.isDoubles) {
          // 根据配置确定伙伴
          const partnerId = actualHitterId % 2 === 1 ? actualHitterId + 2 : actualHitterId + 2
          const partner = this.players[partnerId - 1]
          if (partner && firstConfig.hitConfig.partnerStandPoint) {
            console.log(`${partnerId}号球员(伙伴)移动到站位点(${firstConfig.hitConfig.partnerStandPoint.x.toFixed(2)}, ${firstConfig.hitConfig.partnerStandPoint.z.toFixed(2)})`)
            partner.moveTo(firstConfig.hitConfig.partnerStandPoint)
          }
        }
      }
    }

    // 创建羽毛球并设置初始位置
    this.createShuttlecock()
    if (this.shuttlecock) {
      const firstPoint = points[0]
      this.shuttlecock.position.set(firstPoint.x, firstPoint.y, firstPoint.z)
    }

    // 开始动画
    this.startAnimation(points, this.showTrajectory, configs)
  }

  // 添加轨迹验证方法
  checkTrajectoryConfig(start, end, config) {
    const distance = Math.sqrt(
      Math.pow(end.x - start.x, 2) +
      Math.pow(end.z - start.z, 2)
    );
    
    // 如果不需要过网，直接返回 true
    if (start.z * end.z >= 0) {
      return { valid: true };
    }
    
    // 计算网处的位置
    const netProgress = -start.z / (end.z - start.z);
    const baseNetY = start.y + (end.y - start.y) * netProgress;
    
    const maxHeight = Math.max(start.y, end.y) + distance * config.arcHeight;
    const heightAtNet = baseNetY + Math.sin(Math.PI * netProgress) * 
                       (maxHeight - Math.max(start.y, end.y));
    
    const NET_HEIGHT = 1.55;
    const MIN_CLEARANCE = 0.2;
    
    // 如果高度不够，计算所需的最小弧度
    if (heightAtNet < NET_HEIGHT + MIN_CLEARANCE) {
      let minCoefficient = config.arcHeight;
      let currentHeight = heightAtNet;
      
      while (currentHeight < NET_HEIGHT + MIN_CLEARANCE && minCoefficient < 0.5) {
        minCoefficient += 0.05;
        const newMaxHeight = Math.max(start.y, end.y) + distance * minCoefficient;
        currentHeight = baseNetY + Math.sin(Math.PI * netProgress) * 
                       (newMaxHeight - Math.max(start.y, end.y));
      }
      
      return {
        valid: false,
        minCoefficient,
        currentHeight: heightAtNet
      };
    }
    
    return { valid: true };
  }

  // 添加新方法，预先计算所有路线的弧度
  calculateTrajectoryCoefficients(points) {
    const NET_HEIGHT = 1.55;  // 网高
    const MIN_CLEARANCE = 0.2;  // 最小过网高度（20cm）
    const DEFAULT_COEFFICIENT = 0.15;  // 默认弧度系数
    const coefficients = [];

    console.log('\n预先计算所有路线弧度：');
    
    for (let i = 0; i < points.length - 1; i++) {
      const start = points[i];
      const end = points[i + 1];
      let coefficient = DEFAULT_COEFFICIENT;

      console.log(`\n分析第 ${i + 1} 段轨迹：`);
      console.log(`起点: (${start.x.toFixed(2)}, ${start.y.toFixed(2)}, ${start.z.toFixed(2)})`);
      console.log(`终点: (${end.x.toFixed(2)}, ${end.y.toFixed(2)}, ${end.z.toFixed(2)})`);

      // 检查是否需要过网
      if (start.z * end.z < 0) {
        console.log('需要过网，检查高度...');
        
        const netProgress = -start.z / (end.z - start.z);
        const distance = Math.sqrt(
          Math.pow(end.x - start.x, 2) +
          Math.pow(end.z - start.z, 2)
        );

        // 计算网处高度的函数
        const getHeightAtNet = (coef) => {
          const maxHeight = Math.max(start.y, end.y) + distance * coef;
          const baseNetY = start.y + (end.y - start.y) * netProgress;
          return baseNetY + Math.sin(Math.PI * netProgress) * 
                 (maxHeight - Math.max(start.y, end.y));
        };

        // 检查默认弧度
        let heightAtNet = getHeightAtNet(coefficient);
        console.log(`默认弧度(${coefficient.toFixed(2)})下网处高度: ${heightAtNet.toFixed(2)}m`);

        // 如果过不了网，增加弧度
        if (heightAtNet < NET_HEIGHT + MIN_CLEARANCE) {
          console.log('默认弧度无法满足过网要求，开始调整...');
          while (heightAtNet < NET_HEIGHT + MIN_CLEARANCE && coefficient < 0.5) {
            coefficient += 0.03;
            heightAtNet = getHeightAtNet(coefficient);
            console.log(`尝试系数 ${coefficient.toFixed(2)}: 网处高度 ${heightAtNet.toFixed(2)}m`);
          }
        }
      } else {
        console.log('不需要过网，使用默认弧度');
      }

      console.log(`最终使用系数: ${coefficient.toFixed(2)}`);
      coefficients.push(coefficient);
    }

    return coefficients;
  }

  // 创建平滑曲线
  createSmoothCurve(points) {
    const smoothPoints = []
    const segments = 50  // 增加细分数，使轨迹更滑
    
    for (let i = 0; i < points.length - 1; i++) {
      const start = points[i]
      const end = points[i + 1]
      const distance = Math.sqrt(
        Math.pow(end.x - start.x, 2) +
        Math.pow(end.y - start.y, 2) +
        Math.pow(end.z - start.z, 2)
      )
      
      for (let j = 0; j <= segments; j++) {
        const t = j / segments
        const x = start.x + (end.x - start.x) * t
        const z = start.z + (end.z - start.z) * t
        
        // 创建抛物线轨迹
        const midY = Math.max(start.y, end.y) + distance * 0.2
        const y = start.y + (end.y - start.y) * t +
                 Math.sin(Math.PI * t) * (midY - Math.max(start.y, end.y))
        
        // 确保过网
        if (Math.abs(z) < 0.1) {
          smoothPoints.push({ x, y: Math.max(y, 1.6), z })
        } else {
          smoothPoints.push({ x, y, z })
        }
      }
    }
    
    return smoothPoints
  }

  // 添加更新轨迹显示状态的方法
  updateTrajectoryVisibility(visible) {
    if (this.trajectoryLine) {
      this.trajectoryLine.visible = visible
    }
  }

  // 添加新方法：设置球员初始位置
  setInitialPositions() {
    // 根据比赛类型设置初始位置
    const isDoubles = this.matchConfig.isDoubles
    this.players.forEach(player => {
      const positions = isDoubles 
        ? this.playerPositions.initialPositions.doubles
        : this.playerPositions.initialPositions.singles
      const position = positions[`player${player.number}`]
      if (position) {
        player.moveTo(position)
      }
    })
  }

  // 添加新方法：重置球员到初始位置
  resetPlayersToInitialPositions() {
    if (!this.matchConfig.isDoubles) {
      this.players.forEach(player => {
        // 使用新的位置配置结构
        const position = this.playerPositions.initialPositions.singles[`player${player.number}`]
        player.moveTo(position)
      })
    } else {
      // 双打时的重置
      this.players.forEach(player => {
        const position = this.playerPositions.initialPositions.doubles[`player${player.number}`]
        player.moveTo(position)
      })
    }
  }

  // 添加更新球员位置配置的方法
  updatePlayerPositions(positions) {
    console.log('Updating player positions:', positions)
    // 处理初始位置更新
    if (positions.shouldUpdateInitialPositions) {
      // 更新配置
      if (positions.currentPositions) {
        const isDoubles = this.matchConfig.isDoubles
        if (isDoubles) {
          this.playerPositions.initialPositions.doubles = positions.currentPositions
        } else {
          this.playerPositions.initialPositions.singles = positions.currentPositions
        }
      }

      // 移动球员到新位置
      this.players.forEach(player => {
        const isDoubles = this.matchConfig.isDoubles
        const currentPositions = isDoubles 
          ? this.playerPositions.initialPositions.doubles
          : this.playerPositions.initialPositions.singles
        const playerPosition = currentPositions[`player${player.number}`]

        if (playerPosition) {
          console.log(`Moving player ${player.number} to:`, playerPosition)
          player.moveTo(playerPosition)
        }
      })

      // 启动动画循环
      if (!this.animating) {
        this.animating = true
        this.animate()
      }
      return
    }

    // 处理回位点更新
    if (positions.returnPoints) {
      console.log('更新回位点:', positions.returnPoints)
      this.playerPositions.returnPoints = positions.returnPoints
      this.updateReturnPointMarkers()  // 更新回位点标记
    }
  }

  // 更新回位点标记
  updateReturnPointMarkers() {
    console.log('开始更新回位点标记')
    
    // 清除现有的光圈
    this.returnPointMarkers.forEach(marker => {
      this.scene.remove(marker)
      marker.geometry.dispose()
      marker.material.dispose()
    })
    this.returnPointMarkers = []
    
    // 如果不显示回位点，直接返回
    if (!this.showReturnPoints) {
      console.log('回位点显示已关闭')
      return
    }
    
    // 遍历所有回位点
    this.playerPositions.returnPoints.forEach((point, index) => {
      if (!point) return
      
      // 创建永久光圈
      const geometry = new THREE.RingGeometry(0.2, 0.25, 32)
      const material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.5,  // 增加不透明度
        side: THREE.DoubleSide
      })
        
      const marker = new THREE.Mesh(geometry, material)
      marker.rotation.x = -Math.PI / 2
      marker.position.set(point.x, 0.01, point.z)
      this.scene.add(marker)
      this.returnPointMarkers.push(marker)
      console.log(`创建回位点光圈 P${index + 1}: (${point.x.toFixed(2)}, ${point.z.toFixed(2)})`)
      
      // 只记录位置信息，不包含速度
      const positionState = JSON.stringify({ x: point.x, z: point.z })
      
      // 只在位置发生变化时显示临时光圈
      if (this._lastPositions?.[index] !== positionState) {
        console.log(`更新P${index + 1}的回位点: (${point.x.toFixed(2)}, ${point.z.toFixed(2)}), 回位速度: ${point.speed}m/s`)
      
        // 创建临时的高亮效果
        const highlightGeometry = new THREE.RingGeometry(0.25, 0.3, 32)
        const highlightMaterial = new THREE.MeshBasicMaterial({
          color: 0x00ffff,
          transparent: true,
          opacity: 0.8,
          side: THREE.DoubleSide
        })
        
        const highlight = new THREE.Mesh(highlightGeometry, highlightMaterial)
        highlight.rotation.x = -Math.PI / 2
        highlight.position.set(point.x, 0.02, point.z)
        this.scene.add(highlight)
        
        console.log(`添加P${index + 1}的回位点光圈，将在0.5秒后移除`)
        // 0.5秒后移除高亮效果
        setTimeout(() => {
          this.scene.remove(highlight)
          highlightGeometry.dispose()
          highlightMaterial.dispose()
          console.log(`移除P${index + 1}的回位点光圈`)
        }, 500)
        
        // 更新状态记录
        if (!this._lastPositions) this._lastPositions = {}
        this._lastPositions[index] = positionState
      }
    })
  }

  // 更新回位点显示状态
  updateReturnPointsVisibility(visible) {
    console.log('更新回位点显示状态:', visible)
    this.showReturnPoints = visible
    if (visible) {
      console.log('显示所有回位点光圈')
    } else {
      console.log('隐藏所有回位点光圈')
    }
    this.updateReturnPointMarkers()  // 立即更新光圈显示
  }
} 