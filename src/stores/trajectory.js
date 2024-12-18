import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTrajectoryStore = defineStore('trajectory', () => {
  // 所有保存的球路
  const trajectories = ref([])
  
  // 当前选中的球路
  const currentTrajectory = ref(null)
  
  // 球路数据结构
  function createTrajectory(data) {
    return {
      id: Date.now(),  // 唯一ID
      name: data.name || `球路 ${trajectories.value.length + 1}`,
      points: [
        {
          start: data.start,  // 起点坐标 {x, y, z}
          end: data.end,      // 终点坐标 {x, y, z}
          height: data.height, // 最高点高度
          type: data.type     // 球路类型：'clear'(高远球), 'drive'(平抽球), 'drop'(吊球), 等
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  // 添加新球路
  function addTrajectory(data) {
    const trajectory = createTrajectory(data)
    trajectories.value.push(trajectory)
    return trajectory
  }

  // 更新球路
  function updateTrajectory(id, data) {
    const index = trajectories.value.findIndex(t => t.id === id)
    if (index !== -1) {
      trajectories.value[index] = {
        ...trajectories.value[index],
        ...data,
        updatedAt: new Date()
      }
    }
  }

  // 删除球路
  function deleteTrajectory(id) {
    trajectories.value = trajectories.value.filter(t => t.id !== id)
    if (currentTrajectory.value?.id === id) {
      currentTrajectory.value = null
    }
  }

  // 选择当前球路
  function selectTrajectory(id) {
    currentTrajectory.value = trajectories.value.find(t => t.id === id)
  }

  // 获取球路列表
  function getTrajectories() {
    return trajectories.value
  }

  // 导出球路数据
  function exportTrajectories() {
    return JSON.stringify(trajectories.value)
  }

  // 导入球路数据
  function importTrajectories(data) {
    try {
      const parsed = JSON.parse(data)
      trajectories.value = parsed
    } catch (e) {
      console.error('导入球路数据失败:', e)
    }
  }

  // 保存到本地存储
  function saveToLocal() {
    localStorage.setItem('trajectories', exportTrajectories())
  }

  // 从本地存储加载
  function loadFromLocal() {
    const saved = localStorage.getItem('trajectories')
    if (saved) {
      importTrajectories(saved)
    }
  }

  // 初始化时加载本地数据
  loadFromLocal()

  return {
    trajectories,
    currentTrajectory,
    addTrajectory,
    updateTrajectory,
    deleteTrajectory,
    selectTrajectory,
    getTrajectories,
    exportTrajectories,
    importTrajectories,
    saveToLocal
  }
})