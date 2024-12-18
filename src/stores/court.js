import { defineStore } from 'pinia'
import { ref } from 'vue'


export const useCourtStore = defineStore('court', () => {
    // 预设的球场颜色选项
    const courtColors = [
        { name: '标准', hex: '#4CAF50', value: 0x4CAF50 },
        { name: '深绿', hex: '#2E7D32', value: 0x2E7D32 },
        { name: '浅绿', hex: '#81C784', value: 0x81C784 },
        { name: '蓝绿', hex: '#009688', value: 0x009688 },
        //粉色
        { name: '紫红色', hex: '#FF83FA', value: 0xFF83FA },
        //红色
        { name: '年终总决赛红色', hex: '#FF4040', value: 0xFF4040 },
        //紫色
        { name: '巴黎紫', hex: '#6B0F9C', value: 0x6B0F9C },
        //黄色
        { name: '灰色', hex: '#D6D6D6', value: 0xD6D6D6 },
    ]

    // 当前选中的颜色
    const selectedColor = ref(courtColors[0].value)

    // 选择颜色的方法
    function selectColor(colorValue) {
        // 如果选择了相同的颜色，不做任何操作
        if (selectedColor.value === colorValue) return
        
        selectedColor.value = colorValue
        message.success('球场颜色已更新')
    }

    // 获取当前选中颜色的hex值
    function getCurrentColorHex() {
        const color = courtColors.find(c => c.value === selectedColor.value)
        return color ? color.hex : courtColors[0].hex
    }

    return {
        courtColors,
        selectedColor,
        selectColor,
        getCurrentColorHex,
    }
}) 