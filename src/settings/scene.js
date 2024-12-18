// 场地配置
export const COURT_CONFIG = {
  // 标准尺寸（单位：米）
  dimensions: {
    width: 6.10,        // 双打场地宽度
    length: 13.4,      // 场地长度
    singlesWidth: 5.18,// 单打场地宽度
    serviceLine: 1.98, // 发球线距离
    doubleServiceLine: 0.76, // 双打发球线距离（从底线算起）
    netHeight: 1.55,   // 网高
    netWidth: 0.02,    // 网的厚度
    poleRadius: 0.05,  // 网柱半径
    lineWidth: 0.04,    // 线宽
    height: 0.01   // 场地厚度
  },
  // 材质配置
  materials: {
    netOpacity: 0.95,
    courtRoughness: 0.7,
    lineOpacity: 1,
    metalness: 0,
    netGridSize: 0.1
  },
  colors:{
    background: 0x808080,
    court: 0x4CAF50,
    line: 0x4CAF50,
    net: 0x4CAF50,
    poles: 0x808080,
  }
}

// 玩家配置
export const PLAYER_CONFIG = {
  male: {
    height: 1.75,
    shoulderWidth: 0.45,
    colors: [
      0x2196F3,  // 第一个男球员 - 蓝色
      0x3F51B5   // 第二个男球员 - 深蓝色
    ]
  },
  female: {
    height: 1.65,
    shoulderWidth: 0.4,
    colors: [
      0xFF4081,  // 第一个女球员 - 粉色
      0xE91E63   // 第二个女球员 - 深粉色
    ]
  }
}

// 玩家初始位置配置
export const PLAYER_POSITIONS = {
  0: { // 男单
    male: [
      { x: -1, z: -4, y: 0, index: 0 },  // 上场男球员
      { x: 1, z: 4, y: 0, index: 1 }     // 下场男球员
    ]
  },
  1: { // 女单
    female: [
      { x: -1, z: -4, y: 0, index: 0 },  // 上场女球员
      { x: 1, z: 4, y: 0, index: 1 }     // 下场女球员
    ]
  },
  2: { // 男双
    male: [
      { x: -1.5, z: -4, y: 0, index: 0 },
      { x: 1.5, z: -4, y: 0, index: 0 },
      { x: -1.5, z: 4, y: 0, index: 1 },
      { x: 1.5, z: 4, y: 0, index: 1 }
    ]
  },
  3: { // 女双
    female: [
      { x: -1.5, z: -4, y: 0, index: 0 },
      { x: 1.5, z: -4, y: 0, index: 0 },
      { x: -1.5, z: 4, y: 0, index: 1 },
      { x: 1.5, z: 4, y: 0, index: 1 }
    ]
  },
  4: { // 混双
    male: [
      { x: -1.5, z: -4, y: 0, index: 0 },
      { x: -1.5, z: 4, y: 0, index: 0 }
    ],
    female: [
      { x: 1.5, z: -4, y: 0, index: 1 },
      { x: 1.5, z: 4, y: 0, index: 1 }
    ]
  }
}

// 光照配置
export const LIGHT_CONFIG = {
  ambient: {
    color: 0xffffff,
    intensity: 0.3
  },
  main: {
    color: 0xffffff,
    intensity: 0.5,
    position: { x: 10, y: 10, z: 10 },
    shadow: {
      mapSize: 4096,
      near: 0.5,
      far: 50,
      normalBias: 0.02,
      bias: -0.002
    }
  },
  fill: {
    color: 0xffffff,
    intensity: 0.3,
    position: { x: -5, y: 8, z: -10 }
  },
  top: {
    color: 0xffffff,
    intensity: 0.2,
    position: { x: 0, y: 15, z: 0 }
  }
}

// 球路配置
export const TRAJECTORY_CONFIG = {
  clear: {  // 高远球配置
    standard: {
      maxHeight: 2.5,        // 最高点高度（米）
      initialVelocity: 8,    // 初始速度
      flightTime: 1.2,       // 飞行时间（秒）
      points: 100,           // 轨迹点数量
      startArea: {
        x: [-2, 2],         // 击球点���左右范围
        y: [1.5, 1.8],      // 击球高度范围
        z: [-5, -3]         // 击球深度范围
      },
      endArea: {
        x: [-2, 2],         // 落点的左右范围
        y: [1.6, 1.8],      // 落点高度范围
        z: [3, 5]           // 落点深度范围
      }
    }
  },
  drive: {  // 平抽球配置
    standard: {
      maxHeight: 0.8,        // 最高点高度较低
      initialVelocity: 12,   // 较快的初始速度
      flightTime: 0.8,       // 较短的飞行时间
      points: 100,
      startArea: {
        x: [-2, 2],
        y: [1.4, 1.7],      // 击球点稍低
        z: [-4, -2]         // 击球位置更靠前
      },
      endArea: {
        x: [-2, 2],
        y: [1.3, 1.5],      // 落点更低
        z: [2, 4]           // 落点更靠前
      }
    }
  },
  smash: {  // 杀球配置
    standard: {
      maxHeight: 0.5,        // 增加最高点高度
      initialVelocity: 15,   // 保持快速
      flightTime: 0.5,       // 保持短时间
      points: 100,
      startArea: {
        x: [-2, 2],
        y: [2.0, 2.4],      // 提高击球点
        z: [-4, -2]
      },
      endArea: {
        x: [-2, 2],
        y: [1.2, 1.4],      // 提高落点高度，避免下网
        z: [2, 4]           // 增加落点距离
      }
    }
  }
}

// 计算高远球轨迹的函数
export function calculateClearTrajectory(start, end, maxHeight) {
  const points = []
  const segments = 50

  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    
    // 水平运动（x和z轴）- 匀速
    const x = start.x + (end.x - start.x) * t
    const z = start.z + (end.z - start.z) * t
    
    // 垂直运动（y轴）- 抛物线
    // 使用改进的抛物线公式，考虑起点和终点高度
    const y = start.y + (end.y - start.y) * t + 
             maxHeight * Math.sin(Math.PI * t) * (1 - t) * 4

    points.push({ x, y, z })
  }

  return points
}

// 计算平抽球轨迹的函数
export function calculateDriveTrajectory(start, end, maxHeight) {
  const points = []
  const segments = 50

  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    
    // 水平运动
    const x = start.x + (end.x - start.x) * t
    const z = start.z + (end.z - start.z) * t
    
    // 垂直运动 - 更平的抛物线
    const y = start.y + (end.y - start.y) * t + 
             maxHeight * Math.sin(Math.PI * t) * (1 - t) * 2  // 系数减小使轨迹更平

    points.push({ x, y, z })
  }

  return points
}

// 计算杀球轨迹的函数
export function calculateSmashTrajectory(start, end, maxHeight) {
  const points = []
  const segments = 50

  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    
    // 水平运动
    const x = start.x + (end.x - start.x) * t
    const z = start.z + (end.z - start.z) * t
    
    // 垂直运动 - 快速下降但不会下网
    const y = start.y + (end.y - start.y) * t - 
             maxHeight * Math.sin(Math.PI * t) * t  // 修改下降曲线

    // 确保不会低于网高
    const netHeight = 1.524 // 网中心高度
    if (Math.abs(z) < 0.1) { // 接近网的位置
      points.push({ x, y: Math.max(y, netHeight + 0.1), z }) // 确保过网
    } else {
      points.push({ x, y, z })
    }
  }

  return points
} 