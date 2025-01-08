// 球员基础配置
export const PLAYER_CONFIG = {
  // 基础尺寸
  dimensions: {
    height: 1,         // 球员高度(米)
    shoulderWidth: 0.45,  // 肩宽(米)
    radius: 0.3          // 碰撞半径(米)
  },

  colors: {
    shirt: 0x2196F3,
    shorts: 0x1976D2
  },

  // 材质属性
  materials: {
    opacity: 0.8,
    transparent: true,
    shininess: 30
  },
  initialPositions: {
    singles: {
        player1: { x: -1, z: -4 },
        player2: { x: 1, z: 4 }
    },
    doubles : {
        player1: { x: 1.5, z: -4 },
        player2: { x: 1.5, z: 4 },
        player3: { x: -1.5, z: -4 },
        player4: { x: -1.5, z: 4 }
    }
}
}
