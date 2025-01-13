import * as THREE from 'three'
import * as TWEEN from '@tweenjs/tween.js'
import { Player } from './Player'
import { PLAYER_CONFIG } from '../settings/player'



// 计算抛物线上的点
function calculateParabolicPoint(start, end, t, arcHeight) {
  // 线性插值计算 x 和 z 坐标
  const x = start.x + (end.x - start.x) * t
  const z = start.z + (end.z - start.z) * t

  // 如果弧度为0，使用直线插值
  if (arcHeight === 0) {
    const y = start.y + (end.y - start.y) * t
    return { x, y, z }
  }

  // 计算水平距离
  const distance = Math.sqrt(
    Math.pow(end.x - start.x, 2) +
    Math.pow(end.z - start.z, 2)
  )

  // 使用配置的弧度系数计算最大高度
  const maxHeight = Math.max(start.y, end.y) + distance * arcHeight

  // 使用正弦函数创建抛物线效果
  const y = start.y + (end.y - start.y) * t +
    Math.sin(Math.PI * t) * (maxHeight - Math.max(start.y, end.y))

  return { x, y, z }
}

// 计算两点间距离
function calculateDistance(start, end) {
  return Math.sqrt(
    Math.pow(end.x - start.x, 2) +
    Math.pow(end.z - start.z, 2)
  )
}

export class TrajectoryManager {
  constructor(scene, onPlayComplete) {
    this.scene = scene
    this.trajectoryLine = null
    this.shuttlecock = null
    this.animationFrameId = null
    this.markers = []
    this.currentTrajectoryPoints = []
    this.onPlayComplete = onPlayComplete
    this.isPreviewMode = false
    this.showTrajectory = true

    this.players = []
    this.playerPositions = PLAYER_CONFIG

    this.lastTime = null
    this.tweenGroup = new TWEEN.Group()
    this.isPlaying = false  // 添加播放状态标志
    this.debounceTimer = null;  // 添加防抖计时器

  }

  initPlayers(type) {
    // 清理现有球员
    this.players.forEach(player => {
      player.dispose()
    })
    this.players = []

    if (type === 'NONE') {
      console.log('No players needed for this type')
      return
    }

    const positions = this.playerPositions.initialPositions[type]
    if (!positions) {
      return
    }

    // 批量创建球员
    const playerCount = type === 'singles' ? 2 : 4

    for (let i = 1; i <= playerCount; i++) {
      const playerPos = positions[`player${i}`]
      if (playerPos) {
        const player = new Player(this.scene, {
          position: {
            x: playerPos.x,
            y: 0,
            z: playerPos.z
          },
          number: i
        })
        this.players.push(player)
      }
    }
  }

  updateMatchType(config) {
    this.initPlayers(config.type)
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



  playTrajectory(points, trajectoryConfigs, playerMoveConfigs, showTrajectory) {

    // 清理旧的动画和资源
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }

    // 清理旧的羽毛球
    if (this.shuttlecock) {
      this.scene.remove(this.shuttlecock)
      this.shuttlecock.traverse((child) => {
        if (child.geometry) child.geometry.dispose()
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(material => material.dispose())
          } else {
            child.material.dispose()
          }
        }
      })
      this.shuttlecock = null
    }

    // 清理轨迹线
    if (this.trajectoryLine) {
      this.scene.remove(this.trajectoryLine)
      this.trajectoryLine.geometry.dispose()
      this.trajectoryLine.material.dispose()
      this.trajectoryLine = null
    }

    this.showTrajectory = showTrajectory

    // 开始动画
    this.startAnimation(points, trajectoryConfigs, playerMoveConfigs)
  }

  startAnimation(points, trajectoryConfigs, playerMoveConfigs) {
    let currentIndex = 0

    const animateWithPlayers = () => {
      // 执行第一段动作（初始化）
      const executeInitialMovement = () => {
        const start = points[0]
        const firstKey = 'P1-P2'
        const firstMoveConfig = playerMoveConfigs[firstKey]
        const firstHitter = this.players[firstMoveConfig.hitter - 1]
        const firstPartner = this.players.find(player =>
          player.number !== firstMoveConfig.hitter &&
          Math.sign(player.position.z) === Math.sign(start.z)
        )

        const firstDuration = 1000

        // 击球手移动到击球点
        new TWEEN.Tween(firstHitter.position, this.tweenGroup)
          .to({ x: start.x, z: start.z }, firstDuration)
          .easing(TWEEN.Easing.Quadratic.InOut)
          .onUpdate(() => {
            firstHitter.mesh.position.copy(firstHitter.position)
          })
          .onComplete(() => {
            this.createShuttlecock()
            this.shuttlecock.position.set(start.x, start.y, start.z)
            startMainLoop(0) // 开始主循环，从第二个点开始
          })
          .start()

        if (firstPartner) {
        // 搭档移动到站立点
        new TWEEN.Tween(firstPartner.position, this.tweenGroup)
          .to({ 
            x: firstMoveConfig.partnerStandPoint.x, 
            z: firstMoveConfig.partnerStandPoint.z 
          }, firstDuration)
          .easing(TWEEN.Easing.Quadratic.InOut)
          .onUpdate(() => {
            firstPartner.mesh.position.copy(firstPartner.position)
          })
            .start()
        }
      }

      // 主循环动画
      const startMainLoop = (startIndex) => {
        let currentIndex = startIndex
        console.log('开始主循环',currentIndex)
        const executeLoopMovement = () => {
          const start = points[currentIndex]
          const end = points[currentIndex + 1]
          const key = `P${currentIndex + 1}-P${currentIndex + 2}`
          const moveConfig = playerMoveConfigs[key]
          const trajectoryConfig = trajectoryConfigs[key]
          const duration = 1000 * calculateDistance(start, end) / trajectoryConfig.speed

          // 当前击球手和搭档
          const currentHitter = this.players[moveConfig.hitter - 1]
          const currentPartner = this.players.find(player =>
            player.number !== moveConfig.hitter &&
            Math.sign(player.position.z) === Math.sign(start.z)
          )

          // 下一个击球手和搭档
          const nextKey = `P${currentIndex + 2}-P${currentIndex + 3}`
          const nextMoveConfig = playerMoveConfigs[nextKey]
          const nextHitter = this.players[nextMoveConfig?.hitter - 1]
          const nextPartner = nextHitter ? this.players.find(player =>
            player.number !== nextMoveConfig.hitter &&
            Math.sign(player.position.z) === Math.sign(nextHitter.position.z)
          ) : null

          const animations = []


          const createShuttlecockAnimation = (start, end, trajectoryConfig, duration) => {
            return new TWEEN.Tween({ t: 0 }, this.tweenGroup)
              .to({ t: 1 }, duration)
              .easing(TWEEN.Easing.Linear.None)
              .onUpdate((obj) => {
                const pos = calculateParabolicPoint(
                  start, end, obj.t, trajectoryConfig?.arcHeight
                )
                this.shuttlecock.position.set(pos.x, pos.y, pos.z)
                this.updateShuttlecockRotation(start, end, pos)
                if (this.showTrajectory) {
                  this.updateTrajectoryLine(start, end, trajectoryConfig, obj.t)
                }
              })
              .onComplete(() => {
                currentIndex++
                if (currentIndex < points.length - 1) {
                  startMainLoop(currentIndex)
                }
                else {
                  console.log('动画完成')
                  this.cleanupBadmintonResources()
                  this.returnPlayersToInitialPositions()
                }
              })
          }
        
          const createNextHitterAnimation = (nextHitter, end, duration) => {
            return new TWEEN.Tween(nextHitter.position, this.tweenGroup)
              .to({ x: end.x, z: end.z }, duration)
              .easing(TWEEN.Easing.Quadratic.InOut)
              .onUpdate(() => {
                nextHitter.mesh.position.copy(nextHitter.position)
              })
          }
        
          const createNextPartnerAnimation = (nextPartner, nextMoveConfig, duration) => {
            return new TWEEN.Tween(nextPartner.position, this.tweenGroup)
              .to({ 
                x: nextMoveConfig.partnerStandPoint.x, 
                z: nextMoveConfig.partnerStandPoint.z 
              }, duration)
              .easing(TWEEN.Easing.Quadratic.InOut)
              .onUpdate(() => {
                nextPartner.mesh.position.copy(nextPartner.position)
              })
          }
        
          const createCurrentHitterReturnAnimation = (currentHitter, moveConfig, duration) => {
            return new TWEEN.Tween(currentHitter.position, this.tweenGroup)
              .to({ 
                x: moveConfig.hitterReturnPoint.x, 
                z: moveConfig.hitterReturnPoint.z 
              }, duration)
              .easing(TWEEN.Easing.Quadratic.InOut)
              .onUpdate(() => {
                currentHitter.mesh.position.copy(currentHitter.position)
              })
          }
        
          const createCurrentPartnerReturnAnimation = (currentPartner, moveConfig, duration) => {
            return new TWEEN.Tween(currentPartner.position, this.tweenGroup)
              .to({ 
                x: moveConfig.partnerReturnPoint.x, 
                z: moveConfig.partnerReturnPoint.z 
              }, duration)
              .easing(TWEEN.Easing.Quadratic.InOut)
              .onUpdate(() => {
                currentPartner.mesh.position.copy(currentPartner.position)
              })
          }

          // 添加羽毛球动画
          animations.push(createShuttlecockAnimation(start, end, trajectoryConfig, duration))

          // 添加球员动画
          if (nextHitter) animations.push(createNextHitterAnimation(nextHitter, end, duration))
          if (nextPartner) animations.push(createNextPartnerAnimation(nextPartner, nextMoveConfig, duration))
          if (currentHitter) animations.push(createCurrentHitterReturnAnimation(currentHitter, moveConfig, duration))
          if (currentPartner) animations.push(createCurrentPartnerReturnAnimation(currentPartner, moveConfig, duration))

          // 启动所有动画
          animations.forEach(animation => animation.start())
        }

        executeLoopMovement()
      }

      // 开始执行初始动作
      executeInitialMovement()
    }

    // 添加无球员的动画场景
    const animateWithoutPlayers = () => {
      // 创建羽毛球并设置初始位置
      this.createShuttlecock()
      const firstPoint = points[0]
      this.shuttlecock.position.set(firstPoint.x, firstPoint.y, firstPoint.z)

      const moveToNextPoint = () => {
        const start = points[currentIndex]
        const end = points[currentIndex + 1]
        const key = `P${currentIndex + 1}-P${currentIndex + 2}`
        const trajectoryConfig = trajectoryConfigs[key]
        const duration = (1000 * calculateDistance(start, end)) / trajectoryConfig.speed

        new TWEEN.Tween({ t: 0 }, this.tweenGroup)
          .to({ t: 1 }, duration)
          .easing(TWEEN.Easing.Linear.None)
          .onUpdate((obj) => {
            const pos = calculateParabolicPoint(
              start, end, obj.t, trajectoryConfig?.arcHeight || 0.15
            )
            this.shuttlecock.position.set(pos.x, pos.y, pos.z)
            this.updateShuttlecockRotation(start, end, pos)
            if (this.showTrajectory) {
              this.updateTrajectoryLine(start, end, trajectoryConfig, obj.t)
            }
          })
          .onComplete(() => {
            currentIndex++
            if (currentIndex < points.length - 1) {
              moveToNextPoint()
            } else {
              // 动画完成，清理资源
              this.cleanupBadmintonResources()
              if (this.animationFrameId) {
                cancelAnimationFrame(this.animationFrameId)
                this.animationFrameId = null
              }
              if (this.onPlayComplete) {
                this.onPlayComplete()
              }
            }
          })
          .start()
      }

      // 开始移动到第一个点
      moveToNextPoint()
    }

    // 开始动画循环
    const animate = () => {
      this.animationFrameId = requestAnimationFrame(animate)
      this.tweenGroup.update()
    }

    // 根据是否有球员选择动画场景
    if (this.players.length > 0) {
      animateWithPlayers()
    } else {
      animateWithoutPlayers()
    }

    animate()
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

    this.initPlayers()

  }

  dispose() {
    this.cleanup()
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

  // 添加更新轨迹显示状态的方法
  updateTrajectoryVisibility(visible) {
    if (this.trajectoryLine) {
      this.trajectoryLine.visible = visible
    }
  }

  updatePlayerPositions(positions) {
    console.log('初始位置更新', positions)

    // 创建独立的 TWEEN Group 用于位置更新
    const positionTweenGroup = new TWEEN.Group()
    let positionAnimationFrameId = null
    let completedCount = 0
    const totalPlayers = this.players.length

    // 更新所有球员位置
    this.players.forEach((player, index) => {
      const playerNum = index + 1
      const position = positions[`player${playerNum}`]
      if (position) {
        new TWEEN.Tween(player.position, positionTweenGroup)
          .to({
            x: position.x,
            y: 0,
            z: position.z
          }, 100)
          .easing(TWEEN.Easing.Quadratic.InOut)
          .onUpdate(() => {
            // 同步更新 mesh 位置
            player.mesh.position.copy(player.position)
          })
          .onComplete(() => {
            completedCount++
          })
          .start()
      } else {
        completedCount++
      }
    })

    // 创建动画循环
    const animate = () => {
      if (completedCount < totalPlayers) {
        positionAnimationFrameId = requestAnimationFrame(animate)
        positionTweenGroup.update()
      } else {
        // 动画完成后清理
        cancelAnimationFrame(positionAnimationFrameId)
        positionAnimationFrameId = null
      }
    }

    // 开始动画循环
    animate()
  }

  // 添加一个清理动画资源的方法
  cleanupBadmintonResources() {
    console.log('清理羽毛球资源')
    // 取消所有动画帧
    // 清理轨迹线
    if (this.trajectoryLine) {
      this.scene.remove(this.trajectoryLine)
      this.trajectoryLine.geometry.dispose()
      this.trajectoryLine.material.dispose()
      this.trajectoryLine = null
    }

    // 清理羽毛球
    if (this.shuttlecock) {
      this.shuttlecock.traverse((child) => {
        if (child.geometry) child.geometry.dispose()
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(material => material.dispose())
          } else {
            child.material.dispose()
          }
        }
      })
      this.scene.remove(this.shuttlecock)
      this.shuttlecock = null
    }
  }


  updateShuttlecockRotation(start, end, currentPos) {
    if (!this.shuttlecock) return

    // Calculate direction vector
    const direction = new THREE.Vector3(
      end.x - start.x,
      end.y - start.y,
      end.z - start.z
    ).normalize()

    // Make shuttlecock look in the direction of movement
    this.shuttlecock.lookAt(
      currentPos.x + direction.x,
      currentPos.y + direction.y,
      currentPos.z + direction.z
    )

    // Additional rotation to keep shuttlecock in correct orientation
    this.shuttlecock.rotateX(Math.PI / 2)
  }

  updateTrajectoryLine(start, end, trajectoryConfig, progress) {
    const linePoints = []
    const segments = 60
    // 只绘制到当前进度的轨迹
    const currentSegments = Math.floor(segments * progress)

    for (let i = 0; i <= currentSegments; i++) {
      const t = i / segments
      linePoints.push(calculateParabolicPoint(
        start,
        end,
        t,
        trajectoryConfig?.arcHeight || 0.15
      ))
    }
    this.createTrajectoryLine(linePoints)
  }

  returnPlayersToInitialPositions() {
    console.log('开始让球员回到初始位置')
    if (this.players.length > 0) {
      const isDoubles = this.players.length > 2
      const initialPositions = isDoubles ?
        this.playerPositions.initialPositions.doubles :
        this.playerPositions.initialPositions.singles

      let completedCount = 0
      const totalPlayersCount = this.players.length

      // 让所有球员同时开始移动
      this.players.forEach((player) => {
        if (player && player.mesh && player.position) {
          const playerNum = player.number
          const initialPos = initialPositions[`player${playerNum}`]
          if (initialPos) {
            new TWEEN.Tween(player.position, this.tweenGroup)
              .to({
                x: initialPos.x,
                y: 0,
                z: initialPos.z
              }, 2000)
              .easing(TWEEN.Easing.Quadratic.InOut)
              .onUpdate(() => {
                player.mesh.position.copy(player.position)
              })
              .onComplete(() => {
                completedCount++
                if (completedCount === totalPlayersCount && this.onPlayComplete) {
                  this.onPlayComplete()
                }
              })
              .start()
          } else {
            completedCount++
          }
        } else {
          completedCount++
        }
      })
    } else if (this.onPlayComplete) {
      this.onPlayComplete()
    }
  }



  // 修改光圈动画方法
  updateMovePointsLightCircle({ from, to }) {
    // 添加防抖
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this._createCrosshair(from, to);
    }, 100);  // 100ms 的防抖延迟
  }

  _createCrosshair(from, to) {
    if (!from || !to) return

    // 创建瞄准镜组
    const crosshairGroup = new THREE.Group()

    // 外圈 - 尺寸减半
    const outerRing = new THREE.Mesh(
      new THREE.RingGeometry(0.2, 0.225, 32),  // 原来是 0.4, 0.45
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8
      })
    )

    // 内圈 - 尺寸减半
    const innerRing = new THREE.Mesh(
      new THREE.RingGeometry(0.1, 0.125, 32),  // 原来是 0.2, 0.25
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8
      })
    )

    // 创建四个方向的小线段
    const createLine = (x1, y1, x2, y2) => {
      const points = [
        new THREE.Vector3(x1, y1, 0),
        new THREE.Vector3(x2, y2, 0)
      ]
      const geometry = new THREE.BufferGeometry().setFromPoints(points)
      return new THREE.Line(
        geometry,
        new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.8, transparent: true })
      )
    }

    // 添加四个方向的线段 - 尺寸减半
    const lineLength = 0.075  // 原来是 0.15
    const lineDistance = 0.225 // 原来是 0.45，与外圈对齐
    const lines = [
      createLine(0, lineDistance, 0, lineDistance + lineLength),
      createLine(0, -lineDistance, 0, -(lineDistance + lineLength)),
      createLine(lineDistance, 0, lineDistance + lineLength, 0),
      createLine(-lineDistance, 0, -(lineDistance + lineLength), 0)
    ]

    // 将所有元素添加到组中
    crosshairGroup.add(outerRing)
    crosshairGroup.add(innerRing)
    lines.forEach(line => crosshairGroup.add(line))

    // 设置组的位置和旋转
    crosshairGroup.rotation.x = -Math.PI / 2
    crosshairGroup.position.set(from.x, 0.05, from.z)
    this.scene.add(crosshairGroup)

    // 创建动画
    new TWEEN.Tween(crosshairGroup.position, this.tweenGroup)
      .to({ x: to.x, z: to.z }, 200)
      .easing(TWEEN.Easing.Quadratic.Out)
      .onComplete(() => {
        this.scene.remove(crosshairGroup)
        // 清理资源
        crosshairGroup.children.forEach(child => {
          if (child.geometry) child.geometry.dispose()
          if (child.material) child.material.dispose()
        })
      })
      .start()

    // 确保动画循环在运行
    if (!this.animationFrameId) {
      const animate = () => {
        this.animationFrameId = requestAnimationFrame(animate)
        this.tweenGroup.update()
      }
      animate()
    }
  }





} 