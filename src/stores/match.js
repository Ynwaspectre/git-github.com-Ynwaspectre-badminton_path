import { defineStore } from 'pinia'


export const useMatchStore = defineStore('match', {
    state: () => ({
        selectedType: 'NONE',
        matchTypes: [
            { value: 'NONE', label: '无' },
            { value: 'singles', label: '单打' },
            { value: 'doubles', label: '双打' }
        ]
    }),
    actions: {
        selectType(type) {
            this.selectedType = type
        }
    }
}) 