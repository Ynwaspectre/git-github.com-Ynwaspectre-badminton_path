import { defineStore } from 'pinia'
import { useMessage } from 'naive-ui'

export const useCourtStore = defineStore('court', {
    state: () => ({
        selectedColor: '#607D8B',
        courtColors: [
            { value: '#4CAF50', hex: '#4CAF50', name: '标准绿' },
            { value: '#2196F3', hex: '#2196F3', name: '标准蓝' },
            { value: '#F44336', hex: '#F44336', name: '标准红' },
            { value: '#9C27B0', hex: '#9C27B0', name: '标准紫' },
            { value: '#FF9800', hex: '#FF9800', name: '标准橙' },
            { value: '#795548', hex: '#795548', name: '标准棕' },
            { value: '#607D8B', hex: '#607D8B', name: '标准灰' },
            { value: '#000000', hex: '#000000', name: '标准黑' }
        ]
    }),
    actions: {
        selectColor(color) {
            this.selectedColor = color
        }
    }
}) 