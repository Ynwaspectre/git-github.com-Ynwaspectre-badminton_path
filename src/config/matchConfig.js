// 创建默认配置
export function createMatchConfig(options = {}) {
  return {
    matchType: options.matchType || 'DOUBLES',  // 比赛类型
    courtColor: options.courtColor || '#4CAF50',  // 球场颜色
    players: options.players || {
      // 默认球员配置
      'P1': {
        id: 'P1',
        gender: 'male',
        initialPosition: { x: 1.5, z: -4 }
      },
      'P2': {
        id: 'P2',
        gender: 'male',
        initialPosition: { x: 1.5, z: 4 }
      },
      'P3': {
        id: 'P3',
        gender: 'male',
        initialPosition: { x: -1.5, z: -4 }
      },
      'P4': {
        id: 'P4',
        gender: 'male',
        initialPosition: { x: -1.5, z: 4 }
      }
    },
    points: options.points || {},  // 点位配置
    trajectories: options.trajectories || {},  // 轨迹配置
    hits: options.hits || {}  // 击球配置
  }
}

// 创建点位
export function createPoint(options = {}) {
  return {
    id: options.id || '',
    position: {
      x: options.position?.x || 0,
      y: options.position?.y || 1.7,
      z: options.position?.z || 0
    }
  }
}

// 创建轨迹
export function createTrajectory(options = {}) {
  return {
    id: options.id || '',
    startPointId: options.startPointId || '',
    endPointId: options.endPointId || '',
    speed: options.speed || 3,
    arcHeight: options.arcHeight || 0.15
  }
}

// 创建击球配置
export function createHit(options = {}) {
  return {
    id: options.id || '',
    pointId: options.pointId || '',
    hitterId: options.hitterId || '',
    returnPosition: {
      x: options.returnPosition?.x || 0,
      z: options.returnPosition?.z || 0,
      speed: options.returnPosition?.speed || 7
    },
    partnerStandPoint: options.partnerStandPoint ? {
      x: options.partnerStandPoint.x,
      z: options.partnerStandPoint.z,
      speed: options.partnerStandPoint.speed || 7
    } : null,
    partnerReturnPoint: options.partnerReturnPoint ? {
      x: options.partnerReturnPoint.x,
      z: options.partnerReturnPoint.z,
      speed: options.partnerReturnPoint.speed || 7
    } : null
  }
}

// 创建球员
export function createPlayer(options = {}) {
  return {
    id: options.id || '',
    gender: options.gender || 'male',
    initialPosition: {
      x: options.initialPosition?.x || 0,
      z: options.initialPosition?.z || 0
    }
  }
} 