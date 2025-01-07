import * as THREE from 'three'
import * as TWEEN from '@tweenjs/tween.js'
import { Player } from './Player'

const FRAME_TIME = 1 / 60  // 60fps
const FRAME_RATE = 60

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
    }
    this.animating = false
    this.lastTime = null
    this.tweenGroup = new TWEEN.Group()
    this.isPlaying = false  // 添加播放状态标志
  }

  initPlayers(type) {
    this.players.forEach(player => player.dispose())
    this.players = []
    if (type === 'NONE') {
      console.log('No players needed for this type')
      return
    }
    switch (type) {
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
  }

  updateMatchType(config) {
    this.initPlayers(config.type)
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

    // 初始化动画状态
    this.animationState = {
      currentPhase: 'MOVING_TO_HIT',
      playerMovementComplete: false,
      shuttlecockMoving: false,
      returningToPosition: false
    }

    // 开始动画
    this.startAnimation(points, trajectoryConfigs, playerMoveConfigs)
  }

  startAnimation(points, trajectoryConfigs, playerMoveConfigs) {
    let currentIndex = 0
    let firstHit = true
    let ballStarted = false  // 添加标记，避免重复触发

    // 有球员的动画场景
    const animateWithPlayers = () => {
      const start = points[currentIndex]
      const key = `P${currentIndex + 1}-P${currentIndex + 2}`
      const moveConfig = playerMoveConfigs[key]

      if (firstHit) {
        const hitter = this.players[moveConfig.hitter - 1]

        if (hitter) {
          new TWEEN.Tween(hitter.position, this.tweenGroup)
            .to({ x: start.x, z: start.z }, 1000)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate(() => {
              hitter.mesh.position.copy(hitter.position)
            })
            .onComplete(() => {
              if (!ballStarted) {  // 只在第一次触发
                ballStarted = true
                console.log('第一个击球手到达击球点')
                // 创建羽毛球并设置初始位置
                this.createShuttlecock()
                this.shuttlecock.position.set(start.x, start.y, start.z)

                // 立即开始球的移动
                firstHit = false
                startBallAndNextPlayerMovement()
              }
            })
            .start()
        }
      } else {
        startBallAndNextPlayerMovement()
      }
    }

    // 球的移动和下一个接球手的移动
    const startBallAndNextPlayerMovement = () => {
      const start = points[currentIndex]
      const end = points[currentIndex + 1]
      const key = `P${currentIndex + 1}-P${currentIndex + 2}`
      const moveConfig = playerMoveConfigs[key]
      const trajectoryConfig = trajectoryConfigs[key]
      const duration = (1000 * calculateDistance(start, end)) / trajectoryConfig.speed

      // 获取当前击球手和他的队友
      const currentHitter = this.players[moveConfig.hitter - 1]
      const currentPartners = this.players.filter(p =>
        p.number !== moveConfig.hitter &&
        Math.sign(p.position.z) === Math.sign(start.z)
      )

      // 获取下一个接球手和他的队友
      const nextKey = `P${currentIndex + 2}-P${currentIndex + 3}`
      const nextMoveConfig = playerMoveConfigs[nextKey]
      const nextHitter = currentIndex + 1 < points.length - 1 ?
        this.players[nextMoveConfig.hitter - 1] : null

      // 开始球的移动
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
            animateWithPlayers()
          } else {
            // 球到达最后一个点时，先清理球和轨迹
            this.cleanupAnimation()
            // 然后开始球员回位
            this.returnPlayersToInitialPositions()
          }
        })
        .start()

      // 同时开始下一个接球手的移动，速度根据球的飞行时间计算
      if (nextHitter) {
        new TWEEN.Tween(nextHitter.position, this.tweenGroup)
          .to({ x: end.x, z: end.z }, duration)  // 使用球的飞行时间
          .easing(TWEEN.Easing.Quadratic.InOut)
          .onUpdate(() => {
            nextHitter.mesh.position.copy(nextHitter.position)
          })
          .start()
      }

      // 当前击球手和队友回退，使用配置的速度
      if (currentHitter) {
        new TWEEN.Tween(currentHitter.position, this.tweenGroup)
          .to({
            x: moveConfig.hitterReturnPoint.x,
            z: moveConfig.hitterReturnPoint.z
          }, duration)
          .easing(TWEEN.Easing.Quadratic.InOut)
          .onUpdate(() => {
            currentHitter.mesh.position.copy(currentHitter.position)
          })
          .start()
      }

      // 队友移动到站位点，使用配置的速度
      currentPartners.forEach(partner => {
        new TWEEN.Tween(partner.position, this.tweenGroup)
          .to({
            x: moveConfig.partnerStandPoint.x,
            z: moveConfig.partnerStandPoint.z
          }, duration)
          .easing(TWEEN.Easing.Quadratic.InOut)
          .onUpdate(() => {
            partner.mesh.position.copy(partner.position)
          })
          .start()
      })
    }

    // 开始动画循环
    const animate = () => {
      this.animationFrameId = requestAnimationFrame(animate)
      this.tweenGroup.update()
    }

    animateWithPlayers()
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

    this.players.forEach(player => player.dispose())
    this.players = []
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




  // 添加更新球员初始位置配置的方法
  updatePlayerPositions(positions) {
    console.log('初始位置更新', positions)

    // 启动动画循环
    this.animating = true
    this.lastTime = performance.now()

    // 更新所有球员位置
    this.players.forEach((player, index) => {
      const playerNum = index + 1
      const position = positions[`player${playerNum}`]
      if (position) {
        player.moveTo({
          x: position.x,
          y: 0,
          z: position.z
        })
      }
    })

    // 开始动画循环
    this.animate()
  }

  // 添加一个清理动画资源的方法
  cleanupAnimation() {
    // 取消所有动画帧
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }

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

  // 修改 Player 类中的 moveTo 方法
  moveTo(target, speed) {
    const distance = Math.sqrt(
      Math.pow(target.x - this.position.x, 2) +
      Math.pow(target.z - this.position.z, 2)
    )
    const duration = (distance / speed) * 1000 // 转换为毫秒

    new TWEEN.Tween(this.position, this.tweenGroup)
      .to({ x: target.x, z: target.z }, duration)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .onUpdate(() => {
        if (this.mesh) {
          this.mesh.position.copy(this.position)
        }
      })
      .start()
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

        // 为返回动画创建独立的 TWEEN Group
        const returnTweenGroup = new TWEEN.Group()
        // 使用独立的动画帧 ID
        let returnAnimationFrameId = null

        // 创建独立的动画循环
        const animate = () => {
            if (completedCount < totalPlayersCount) {
                returnAnimationFrameId = requestAnimationFrame(animate)
                returnTweenGroup.update()
            } else {
                // 只取消返回动画的帧循环，不清理其他资源
                cancelAnimationFrame(returnAnimationFrameId)
                returnAnimationFrameId = null
                if (this.onPlayComplete) {
                    this.onPlayComplete()
                }
            }
        }
        animate()

        // 让所有球员同时开始移动
        this.players.forEach((player) => {
            if (player && player.mesh && player.position) {
                const playerNum = player.number
                const initialPos = initialPositions[`player${playerNum}`]
                if (initialPos) {
                    new TWEEN.Tween(player.position, returnTweenGroup)  // 使用独立的 TWEEN Group
                        .to({
                            x: initialPos.x,
                            z: initialPos.z
                        }, 2000)
                        .easing(TWEEN.Easing.Quadratic.InOut)
                        .onUpdate(() => {
                            player.mesh.position.copy(player.position)
                        })
                        .onComplete(() => {
                            completedCount++
                        })
                        .start()
                } else {
                    completedCount++
                }
            } else {
                completedCount++
            }
        })
    } else {
        if (this.onPlayComplete) {
            this.onPlayComplete()
        }
    }
  }

} 