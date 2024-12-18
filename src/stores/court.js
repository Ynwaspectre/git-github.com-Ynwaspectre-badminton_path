import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCourtStore = defineStore('court', () => {
    // 预设的球场颜色选项
    const courtColors = [
        { name: '标准绿', hex: '#4CAF50', value: 0x4CAF50 },
        { name: '深绿', hex: '#2E7D32', value: 0x2E7D32 },
        { name: '浅绿', hex: '#81C784', value: 0x81C784 },
        { name: '蓝绿', hex: '#009688', value: 0x009688 },
        //粉色
        { name: '粉色', hex: '#FFC0CB', value: 0xFFC0CB },
        //红色
        { name: '红色', hex: '#FF4D4D', value: 0xFF4D4D },
        //紫色
        { name: '紫色', hex: '#800080', value: 0x800080 },
    ]

    // 当前选中的颜色
    const selectedColor = ref(courtColors[0].value)

    // 选择颜色的方法
    function selectColor(colorValue) {
        selectedColor.value = colorValue
    }

    // 获取当前选中颜色的hex值
    function getCurrentColorHex() {
        const color = courtColors.find(c => c.value === selectedColor.value)
        return color ? color.hex : courtColors[0].hex
    }
    //球路类型
    const courtTypes = ref([
        { name: '男单', value: 0 },
        { name: '女单', value: 1 },
        { name: '男双', value: 2 },
        { name: '女双', value: 3 },
        { name: '混双', value: 4 },
        { name: '都不选', value: 5 },
    ])
    //selectedType
    const selectedType = ref(courtTypes.value[0].value)
    //selectType
    function selectType(typeValue) {
        selectedType.value = typeValue
    }

    return {
        courtColors,
        selectedColor,
        selectColor,
        getCurrentColorHex,
        courtTypes,
        selectedType,
        selectType
    }
}) 