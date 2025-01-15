import { defineStore } from 'pinia'


export const useCourtStore = defineStore('court', {
    state: () => ({
        selectedColor: '#4CAF50',
        courtColors: [
            { value: '#4CAF50', hex: '#4CAF50', name: '标准绿', key: 'COLOR1' },
            { value: '#F44336', hex: '#F44336', name: '世界羽联年终红', key: 'COLOR2' },
            { value: '#9C27B0', hex: '#9C27B0', name: '奥运紫', key: 'COLOR3' },
            //加一个粉色
            { value: '#FFB6C1', hex: '#FFB6C1', name: '笨猪粉', key: 'COLOR4' }

        ]
    }),
    actions: {
        selectColor(color) {
            this.selectedColor = color
        }
    }
}) 