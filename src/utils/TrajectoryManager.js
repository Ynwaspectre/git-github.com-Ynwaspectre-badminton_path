import * as THREE from 'three'
import { 
  TRAJECTORY_CONFIG, 
  calculateClearTrajectory,
  calculateDriveTrajectory,
  calculateSmashTrajectory 
} from '../settings/scene'

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
    this.startAnimation(points)
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
      opacity: 0.8
    })

    this.trajectoryLine = new THREE.Line(geometry, material)
    this.trajectoryLine.computeLineDistances()  // 必须调用此方法才能显示虚线
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

  startAnimation(points, showTrajectory = true) {
    const shuttlecockSpeed = 3  // 米/秒
    let currentIndex = 0
    let progress = 0
    let lastTime = performance.now()
    let trajectoryPoints = []  // 始终存储点位，但只在需要时显示
    
    // 计��两点之间的抛物线
    const calculateParabolicPoint = (start, end, progress) => {
      const x = start.x + (end.x - start.x) * progress;
      const z = start.z + (end.z - start.z) * progress;
      
      // 计算水平距离
      const distance = Math.sqrt(
        Math.pow(end.x - start.x, 2) +
        Math.pow(end.z - start.z, 2)
      );
      
      // 动态计算高度系数
      const heightCoefficient = this.checkTrajectoryAndGetHeight(start, end);
      const maxHeight = Math.max(start.y, end.y) + distance * heightCoefficient;
      
      // 计算Y坐标
      const baseY = start.y + (end.y - start.y) * progress;
      const parabolicY = Math.sin(Math.PI * progress) * (maxHeight - Math.max(start.y, end.y));
      const y = baseY + parabolicY;
      
      return { x, y, z, maxHeight };
    };
    
    const animate = (currentTime) => {
      const deltaTime = (currentTime - lastTime) / 1000
      lastTime = currentTime
      
      if (currentIndex < points.length - 1) {
        const currentPoint = points[currentIndex]
        const nextPoint = points[currentIndex + 1]
        
        const distance = Math.sqrt(
          Math.pow(nextPoint.x - currentPoint.x, 2) +
          Math.pow(nextPoint.y - currentPoint.y, 2) +
          Math.pow(nextPoint.z - currentPoint.z, 2)
        )
        
        progress += (shuttlecockSpeed * deltaTime) / distance
        
        if (progress <= 1) {
          // 计算当前位置
          const currentPos = calculateParabolicPoint(currentPoint, nextPoint, progress)
          
          // 更新羽毛球位置和朝向
          if (this.shuttlecock) {
            this.shuttlecock.position.set(currentPos.x, currentPos.y, currentPos.z)
            
            // 计算移动方向
            const direction = new THREE.Vector3()
            if (progress < 1) {
              // 使用当前点到下一点的方向
              direction.subVectors(nextPoint, currentPos).normalize()
            } else {
              // 使用前一点到当前点的方向
              direction.subVectors(currentPos, currentPoint).normalize()
            }

            // 计算旋转四元数
            const quaternion = new THREE.Quaternion()
            const up = new THREE.Vector3(0, 1, 0)
            const right = new THREE.Vector3().crossVectors(up, direction).normalize()
            up.crossVectors(direction, right)

            // 创建旋转矩阵
            const rotationMatrix = new THREE.Matrix4()
            rotationMatrix.makeBasis(right, up, direction)
            quaternion.setFromRotationMatrix(rotationMatrix)

            // 用旋转
            this.shuttlecock.setRotationFromQuaternion(quaternion)
            
            // 额外旋转使球头朝动方向
            this.shuttlecock.rotateX(Math.PI / 2)
          }
          
          // 始终添加点位
          trajectoryPoints.push(currentPos)
          
          // 更新轨迹线
          if (this.trajectoryLine) {
            this.scene.remove(this.trajectoryLine)
            this.trajectoryLine.geometry.dispose()
            this.trajectoryLine.material.dispose()
          }
          
          // 创建新的轨迹线
          const geometry = new THREE.BufferGeometry()
          const vertices = []
          trajectoryPoints.forEach(point => {
            vertices.push(point.x, point.y, point.z)
          })
          geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
          
          const material = new THREE.LineDashedMaterial({
            color: 0xffffff,
            linewidth: 2,
            scale: 1,
            dashSize: 0.3,
            gapSize: 0.2,
            transparent: true,
            opacity: 0.8
          })
          
          this.trajectoryLine = new THREE.Line(geometry, material)
          this.trajectoryLine.computeLineDistances()
          this.trajectoryLine.visible = showTrajectory  // 根据 showTrajectory 控制可见性
          this.scene.add(this.trajectoryLine)
          
          this.animationFrameId = requestAnimationFrame(animate)
        } else {
          // 清除当前轨迹
          trajectoryPoints = []
          if (this.trajectoryLine) {
            this.scene.remove(this.trajectoryLine)
            this.trajectoryLine.geometry.dispose()
            this.trajectoryLine.material.dispose()
            this.trajectoryLine = null
          }
          
          // 进入下一段
          progress = 0
          currentIndex++
          
          if (currentIndex >= points.length - 1) {
            // 动画结束，清并调用回调
            cancelAnimationFrame(this.animationFrameId)
            this.animationFrameId = null
            this.cleanup(true)  // 保留标记点
            if (this.onPlayComplete) {
              this.onPlayComplete()
            }
          } else {
            // 继续下一段动画
            this.animationFrameId = requestAnimationFrame(animate)
          }
        }
      } else {
        // 移除这个 else 分支，因为它导致了重复的回调
        cancelAnimationFrame(this.animationFrameId)
        this.animationFrameId = null
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

    // 修改羽毛球的清理逻辑
    if (this.shuttlecock) {
      // 递归清理所有网格
      this.shuttlecock.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose()
          child.material.dispose()
        }
        if (child instanceof THREE.Line) {
          child.geometry.dispose()
          child.material.dispose()
        }
      })
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
    
    // 如果没有点位或只有一个点位，也要显示
    if (!points || points.length === 0) return
    
    // 创建新的标记点
    points.forEach((point, index) => {
      const marker = this.createMarker(point, index)
      this.markers.push(marker)
    })
    
    this.isPreviewMode = true
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
    const geometry = new THREE.SphereGeometry(0.1)
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
    canvas.width = 128  // 更大的画布提高清晰度
    canvas.height = 128
    const context = canvas.getContext('2d')
    context.font = 'Bold 72px Arial'  // 更大更粗的字体
    context.fillStyle = 'white'
    context.strokeStyle = 'black'
    context.lineWidth = 4
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    const text = (index + 1).toString()
    context.strokeText(text, 64, 64)  // 先绘制描边
    context.fillText(text, 64, 64)    // 再填充文字
    
    const texture = new THREE.CanvasTexture(canvas)
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture })
    const sprite = new THREE.Sprite(spriteMaterial)
    sprite.position.copy(marker.position)
    sprite.position.x += 0.15
    sprite.position.y += 0.15
    sprite.scale.set(0.25, 0.25, 1)  // 稍微调整大小
    this.scene.add(sprite)
    
    return { marker, sprite }
  }

  // 播放轨迹
  playTrajectory(points, showTrajectory = true) {
    // 清理现有内容
    this.cleanup(true);

    // 创建羽毛球和开始动画
    this.showTrajectory = showTrajectory;
    this.createShuttlecock();
    this.startAnimation(points, showTrajectory);
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
} 