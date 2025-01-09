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

// 光照配置
export const LIGHT_CONFIG = {
  ambient: {
    color: 0xffffff,
    intensity: 0.4
  },
  main: {
    color: 0xffffff,
    intensity:1,
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
    intensity:0.4,
    position: { x: -5, y: 8, z: -10 }
  },
  top: {
    color: 0xffffff,
    intensity:0.4,
    position: { x: 0, y: 15, z: 0 }
  }
}


