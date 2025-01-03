// 球员配置
export const PLAYER_CONFIG = {
  male: {
    height: 1.75,
    shoulderWidth: 0.45,
    colors: {
      shirt: 0x2196F3,
      shorts: 0x1976D2
    }
  },
  female: {
    height: 1.65,
    shoulderWidth: 0.4,
    colors: {
      shirt: 0xFF4081,
      shorts: 0xE91E63
    }
  }
}

// 球员位置配置
export const PLAYER_POSITIONS = {
  frontCourt: { x: 0, y: 0, z: -3 },  // 前场位置
  backCourt: { x: 0, y: 0, z: 3 }     // 后场位置
} 