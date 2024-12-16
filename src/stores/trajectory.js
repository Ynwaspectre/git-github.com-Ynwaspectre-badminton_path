import { defineStore } from 'pinia'

export const useTrajectoryStore = defineStore('trajectory', {
  state: () => ({
    trajectories: [],
    currentTrajectory: null,
  }),
  
  actions: {
    saveTrajectory(trajectory) {
      this.trajectories.push(trajectory)
    },
    
    deleteTrajectory(id) {
      this.trajectories = this.trajectories.filter(t => t.id !== id)
    },
    
    setCurrentTrajectory(trajectory) {
      this.currentTrajectory = trajectory
    },
    
    generateShareLink(id) {
      return `${window.location.origin}/share/${id}`
    }
  }
}) 