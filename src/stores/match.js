import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMatchStore = defineStore('match', {
    state: () => ({
        selectedType: 'NONE',
        matchTypes: [
            { value: 'NONE', label: '无' },
            { value: 'SINGLES', label: '单打' },
            { value: 'DOUBLES', label: '双打' }
        ]
    }),
    actions: {
        selectType(type) {
            this.selectedType = type
        }
    }
}) 