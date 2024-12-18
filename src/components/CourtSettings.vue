<template>
    <div class="h-full  p-4 overflow-hidden overflow-y-auto">
        <!-- 球场颜色设置 -->
        <n-card class="mb-4" size="small" style="min-height: fit-content">
            <template #header>
                <div class="flex items-center">
                    <n-icon size="18" class="mr-1">
                        <ColorPalette />
                    </n-icon>
                    <span class="font-bold">球场颜色</span>
                </div>
            </template>
            <n-grid :cols="12" :x-gap="12" :y-gap="12" class="relative">
                <div class="absolute inset-0 bg-black opacity-50"></div>
                <n-grid-item v-for="color in courtStore.courtColors" :key="color.value">
                    <n-tooltip trigger="hover" :delay="500">
                        <template #trigger>
                            <div class="cursor-pointer rounded-lg p-2 transition-all hover:scale-110 relative"
                                :class="{ 
                                    'border-2 border-blue-500': courtStore.selectedColor === color.value,
                                    'shadow-lg transform': true
                                }"
                                @click="courtStore.selectColor(color.value)">
                                <div class="w-full h-6 rounded flex items-center justify-center" 
                                    :style="{ backgroundColor: color.hex }">
                                    <!-- 选中蒙层和勾 -->
                                    <div v-if="courtStore.selectedColor === color.value" 
                                        class="absolute inset-0 bg-black opacity-50 rounded-lg flex items-center justify-center">
                                    </div>
                                    <n-icon v-if="courtStore.selectedColor === color.value" 
                                        class="text-white text-lg flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" 
                                            fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" 
                                            stroke-linejoin="round" style="transform: translate(0px, 2px)">
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                    </n-icon>
                                </div>
                            </div>
                        </template>
                        <span>{{ color.name }}</span>
                    </n-tooltip>
                </n-grid-item>
            </n-grid>
        </n-card>

        <!-- 可滚动区域 -->
        <div class="  min-h-0 pr-2">
            <!-- 轨迹编辑器 -->
            <n-card class="mb-4" size="small" segmented>
                <template #header>
                    <div class="flex items-center">
                        <n-icon size="18" class="mr-1">
                            <LocationSharp />
                        </n-icon>
                        <span class="font-bold">点位设计</span>
                    </div>
                </template>
                <template #header-extra>
                    <div class="flex justify-center items-center space-x-4 mr4">
                        <n-space align="center">
                            <span>开启点位采集</span>
                            <n-switch v-model:value="isCollecting" @update:value="handleDesignModeChange"
                                 />
                        </n-space>
                        <n-space align="center">
                            <n-button secondary type="info" size="small" @click="showRandomPointsDialog">
                                <template #icon>
                                    <n-icon>
                                        <Dice />
                                    </n-icon>
                                </template>
                                随机添加
                            </n-button>
                        </n-space>
                        <n-tooltip trigger="hover">
                            <template #trigger>
                                <n-button text type="info">
                                    <template #icon>
                                        <n-icon>
                                            <InformationCircle />
                                        </n-icon>
                                    </template>
                                </n-button>
                            </template>
                            <div class="text-sm">
                                X: 场地左右位置 (-3.05m ~ 3.05m)<br>
                                Z: 场地前后位置 (-6.7m ~ 6.7m)<br>
                                Y: 高度 (0m ~ 3.2m) 初始默认高度为{{ currentHeight }}m
                            </div>
                        </n-tooltip>
                    </div>
                </template>

                <!-- 采集模式下的高度调整 -->


                <!-- 点位列表 -->
                <div class="mb-4">
                    <div class="text-sm mb-2 text-gray-500 hover:text-gray-800 transition-colors cursor-default">点位列表</div>
                    <div class="space-y-2">
                        <n-grid :cols="24" :x-gap="8">
                            <n-grid-item :span="3">
                                <n-tooltip trigger="hover">
                                    <template #trigger>
                                        <div class="text-xs text-gray-500 mb-1 cursor-help">
                                            点位号#
                                        </div>
                                    </template>
                                    <span>点位的编号</span>
                                </n-tooltip>
                            </n-grid-item>
                            <n-grid-item :span="6">
                                <n-tooltip trigger="hover">
                                    <template #trigger>
                                        <div class="text-xs text-gray-500 mb-1 cursor-pointer ">
                                            左右位置X
                                        </div>
                                    </template>
                                    <span>范围: -3.05m ~ 3.05m</span>
                                </n-tooltip>
                            </n-grid-item>
                            <n-grid-item :span="6">
                                <n-tooltip trigger="hover">
                                    <template #trigger>
                                        <div class="text-xs text-gray-500 mb-1 cursor-pointer ">
                                            前后位置Z
                                        </div>
                                    </template>
                                    <span>范围: -6.7m ~ 6.7m</span>
                                </n-tooltip>
                            </n-grid-item>
                            <n-grid-item :span="6">
                                <n-tooltip trigger="hover">
                                    <template #trigger>
                                        <div class="text-xs text-gray-500 mb-1 cursor-pointer ">
                                            高度Y
                                        </div>
                                    </template>
                                    <span>范围: 0m ~ 3.2m</span>
                                </n-tooltip>
                            </n-grid-item>
                        </n-grid>

                        <div v-for="(point, index) in trajectoryPoints" :key="index">
                            <n-grid :cols="24" :x-gap="8" class="items-center">
                                <n-grid-item :span="3">
                                    <div class="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                                        <span class="text-gray-500 font-bold">{{ index + 1 }}</span>
                                    </div>
                                </n-grid-item>

                                <n-grid-item :span="6">
                                    <n-input-number v-model:value="point.x" :placeholder="`X${index + 1}`" :step="0.1"
                                        size="small" class="!w-full" :min="-3.05" :max="3.05" />
                                </n-grid-item>
                                <n-grid-item :span="6">
                                    <n-input-number v-model:value="point.z" :placeholder="`Z${index + 1}`" :step="0.1"
                                        size="small" class="!w-full" :min="-6.7" :max="6.7" />
                                </n-grid-item>
                                <n-grid-item :span="6">
                                    <n-input-number v-model:value="point.y" :placeholder="`Y${index + 1}`" :step="0.1"
                                        size="small" class="!w-full" :min="0" :max="3.2" />
                                </n-grid-item>


                                <n-grid-item :span="3">
                                    <n-button circle secondary size="small" class="hover:text-red-500 text-gray-400"
                                        @click="removePoint(index)">
                                        <template #icon>
                                            <n-icon>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                                    viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                                    stroke-linecap="round" stroke-linejoin="round">
                                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                                </svg>
                                            </n-icon>
                                        </template>
                                    </n-button>
                                </n-grid-item>
                            </n-grid>
                        </div>
                    </div>
                </div>

                <!-- 轨迹列表 -->
                <div v-if="trajectoryPoints.length > 1" class="mt-6">
                    <div class="text-sm mb-2 text-gray-500 hover:text-gray-800 transition-colors cursor-default">轨迹列表</div>

                    <!-- 轨迹配置内容 -->
                    <div class="space-y-2">
                        <!-- 添加表头 -->
                        <n-grid :cols="24" :x-gap="8">
                            <n-grid-item :span="4">
                                <n-tooltip trigger="hover">
                                    <template #trigger>
                                        <div class="text-xs text-gray-500 mb-1 cursor-help">
                                            轨迹名
                                        </div>
                                    </template>
                                    <span>轨迹名称 点1 点2的轨迹叫P1-P2</span>
                                </n-tooltip>
                            </n-grid-item>
                            <n-grid-item :span="8">
                                <n-tooltip trigger="hover">
                                    <template #trigger>
                                        <div class="text-xs text-gray-500 mb-1 cursor-help">弧度系数 (直线 ~ 无限制)</div>
                                    </template>
                                    <span>越大弧度越高</span>
                                </n-tooltip>
                            </n-grid-item>
                            <n-grid-item :span="8">
                                <n-tooltip trigger="hover">
                                    <template #trigger>
                                        <div class="text-xs text-gray-500 mb-1 cursor-help">���速 (3 ~ 80 m/s)</div>
                                    </template>
                                    <span>每秒移动的距离</span>
                                </n-tooltip>
                            </n-grid-item>
                        </n-grid>

                        <!-- 轨迹配置列表 -->
                        <div class="space-y-2">
                            <div v-for="(config, key) in trajectoryConfigs" :key="key">
                                <n-grid :cols="24" :x-gap="8" class="items-center">
                                    <!-- 轨迹名称 -->
                                    <n-grid-item :span="4">
                                        <div class="w-16 rounded-full bg-gray-200 text-center">
                                            <span class="text-gray-500 font-medium text-xs">{{ key }}</span>
                                        </div>
                                    </n-grid-item>

                                    <!-- 弧度系数 -->
                                    <n-grid-item :span="8">
                                        <n-input-number
                                            v-model:value="config.arcHeight"
                                            :min="0"
                                            :max="Infinity"
                                            :step="0.1"
                                            :precision="2"
                                            size="small"
                                            class="!w-full"
                                        />
                                    </n-grid-item>

                                    <!-- 球速 -->
                                    <n-grid-item :span="8">
                                        <n-input-number
                                            v-model:value="config.speed"
                                            :min="3"
                                            :max="80"
                                            :step="5"
                                            size="small"
                                            class="!w-full"
                                        />
                                    </n-grid-item>

                                    <!-- 重置按钮 -->
                                    <n-grid-item :span="2">
                                        <n-button
                                            circle
                                            secondary
                                            size="small"
                                            type="info"
                                            class="hover:text-blue-500 text-gray-400"
                                            @click="resetTrajectoryConfig(key)"
                                        >
                                            <template #icon>
                                                <n-icon><Refresh /></n-icon>
                                            </template>
                                        </n-button>
                                    </n-grid-item>
                                </n-grid>
                            </div>
                        </div>

                        <!-- 如果没有轨迹配置，显示提示信息 -->
                        <div v-if="Object.keys(trajectoryConfigs).length === 0" class="text-gray-500 text-center py-4">
                            添加两个及以上点位后将显示轨迹配置
                        </div>
                    </div>
                </div>

                <!-- 操作按钮 -->
                <n-space class="mt-4">
                    <n-button secondary type="success" size="small" @click="playTrajectory" :disabled="isPlaying">
                        <template #icon>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polygon points="5 3 19 12 5 21 5 3"></polygon>
                            </svg>
                        </template>
                        预览轨迹
                    </n-button>
                    <n-button secondary type="error" size="small" @click="clearPoints">
                        <template #icon>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </template>
                        清除
                    </n-button>
                </n-space>

                <!-- 轨迹显示选择 -->
                <n-space align="center" class="mt-4">
                    <n-space align="center">
                        <span>预览点位</span>
                        <n-switch v-model:value="isPreviewMode" @update:value="handlePreviewChange" />
                    </n-space>
                    <n-space align="center">
                        <span>显示轨迹</span>
                        <n-switch v-model:value="showTrajectory" @update:value="handleTrajectoryVisibilityChange" />
                    </n-space>
                </n-space>
            </n-card>
        </div>

        <!-- 导入导出按钮 -->
        <div class=" space-x-2 mt-4 mb-20">
            <n-button secondary type="default" @click="copyJsonData">
                <template #icon>
                    <n-icon>
                        <Copy />
                    </n-icon>
                </template>
                复制JSON
            </n-button>
            <n-button secondary type="default" @click="importData">
                <template #icon>
                    <n-icon>
                        <CloudUpload />
                    </n-icon>
                </template>
                导入数据
            </n-button>
            <n-button secondary type="default" @click="exportData">
                <template #icon>
                    <n-icon>
                        <CloudDownload />
                    </n-icon>
                </template>
                导出数据
            </n-button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, h } from 'vue'
import { useCourtStore } from '../stores/court'
import {
    NScrollbar,
    NCard,
    NGrid,
    NGridItem,
    NButton,
    NSpace,
    NInputNumber,
    NIcon,
    useDialog,
    useMessage,
    NSwitch,
    NTooltip
} from 'naive-ui'
import { Close, InformationCircle, ColorPalette, LocationSharp, Refresh, Dice, CloudUpload, CloudDownload, Copy } from '@vicons/ionicons5'

const courtStore = useCourtStore()
const dialog = useDialog()
const message = useMessage()
const emit = defineEmits([
    'previewPoints',
    'playTrajectory',
    'clearPoints',
    'startCollectingPoints',
    'stopCollectingPoints',
    'clearPreview'
])

const trajectoryPoints = ref([])  // 初始时没有点位
const showTrajectory = ref(true)
const isPlaying = ref(false)
const isPreviewMode = ref(true)  // 默认开启预览
const isCollecting = ref(false)
const currentHeight = ref(1.7)
const selectedPoint = ref(null)
const trajectoryConfigs = ref({})  // 存储轨迹配置

// 场地范围限制
const COURT_LIMITS = {
    x: { min: -3.05, max: 3.05 }, // 双打场地宽度范围 (6.10米)
    y: { min: 0, max: 3.2 },     // 高度限制
    z: { min: -6.7, max: 6.7 }   // 场度范围
}

// 默认配置
const DEFAULT_TRAJECTORY_CONFIG = {
    arcHeight: 0.15,  // 默认抛物��弧系数（保持2位小数）
    speed: 3        // 默认球速（米/秒）
}

// 创建空点位的辅助函数
function createEmptyPoint() {
    return {
        x: null,
        y: null,
        z: null
    }
}

// 添加点位
function addPoint() {
    if (trajectoryPoints.value.length < 10) {
        trajectoryPoints.value.push(createEmptyPoint())
    }
}

// 删除点位
function removePoint(index) {
    trajectoryPoints.value.splice(index, 1)
}

// 生成随机点
function generateRandomPoints(count) {
    // 一个个生成点位
    for (let i = 0; i < count; i++) {
        // 获取当前最后一个点位
        const lastPoint = trajectoryPoints.value.length > 0 
            ? trajectoryPoints.value[trajectoryPoints.value.length - 1] 
            : null;

        let point;
        if (!lastPoint) {
            // 没有现点位，随机选择一个半场
            const isBackCourt = Math.random() > 0.5;
            point = {
                x: randomInRange(COURT_LIMITS.x.min, COURT_LIMITS.x.max),
                y: randomInRange(1.5, 1.8),  // 击球高度范围
                z: isBackCourt 
                    ? randomInRange(0.1, 6.7)    // 场范围
                    : randomInRange(-6.7, -0.1)  // 前场范围
            };
        } else {
            // 根据上一个点的位置生成新点，必须在不同半场
            const isLastInBack = lastPoint.z > 0;
            point = {
                x: randomInRange(COURT_LIMITS.x.min, COURT_LIMITS.x.max),
                y: randomInRange(1.5, 1.8),  // 保持合理击球高度
                z: isLastInBack
                    ? randomInRange(-6.7, -0.1)  // 如果上一个在后场，这个就在前场
                    : randomInRange(0.1, 6.7)    // 如果上一个在前场，个就在后场
            };
        }

        // 验证点位是否合法
        if (validatePoint(point)) {
            // 添加点位
            trajectoryPoints.value.push(point);
        }
    }

    message.success(`成功添加${count}个随机点位`);
}

// 生成范围内的随机数
function randomInRange(min, max) {
    return +(Math.random() * (max - min) + min).toFixed(2)
}

// 修改验证点位函数添加更多具体的验证
function validatePoint(point) {
    console.log(point)
    if (!point || point.x === null || point.y === null || point.z === null) return false

    // 基本范围检查
    return point.x >= COURT_LIMITS.x.min && point.x <= COURT_LIMITS.x.max &&
        point.y >= COURT_LIMITS.y.min && point.y <= COURT_LIMITS.y.max &&
        point.z >= COURT_LIMITS.z.min && point.z <= COURT_LIMITS.z.max
}

// 修改验证点位分布函数，放宽第一个点的限制
function validatePointsDistribution(points) {
    if (points.length < 2) return true

    // 相邻点必须在不半场
    for (let i = 1; i < points.length; i++) {
        const currentZ = points[i].z
        const prevZ = points[i - 1].z
        if (Math.sign(currentZ) === Math.sign(prevZ)) {
            return false
        }
    }

    return true
}

// 修改预览状态化处理函数
function handlePreviewChange(value) {
    if (!value) {
        emit('clearPreview')
    } else {
        // 开启预览时，发送当前有效的点
        const nonEmptyPoints = trajectoryPoints.value.filter(p =>
            p.x !== null && p.y !== null && p.z !== null
        )
        emit('previewPoints', nonEmptyPoints)
    }
}

function validatePoints() {
    // 只验证非点位
    const nonEmptyPoints = trajectoryPoints.value.filter(p =>
        p.x !== null && p.y !== null && p.z !== null
    )

    if (nonEmptyPoints.length === 0) {
        message.error('请至少添加一个点位')
        return null
    }

    // 检查是否只有一个点
    if (nonEmptyPoints.length === 1) {
        message.warning('要至少添加两个点位才能播放轨迹')
        return null
    }

    // 验证点
    const invalidPoints = nonEmptyPoints.filter(p => !validatePoint(p))
    if (invalidPoints.length > 0) {
        message.error(`第${invalidPoints.map(p => trajectoryPoints.value.indexOf(p) + 1).join('、')}号点位超出场地范围！${invalidPoints.map(p => {
            const issues = [];
            if (Math.abs(p.x) > 3.05) issues.push('左右位置');
            if (Math.abs(p.z) > 6.7) issues.push('前后位置');
            if (p.y < 0 || p.y > 3.2) issues.push('高度');
            return `(${issues.join('、')}出范围)`;
        }).join(' ')}`)
        return null
    }

    // 验证点位分布
    if (!validatePointsDistribution(nonEmptyPoints)) {
        message.error('相邻2个点必须在不同半场')
        return null
    }

    return nonEmptyPoints
}

function playTrajectory() {
    const validPoints = validatePoints()
    if (validPoints) {
        isPlaying.value = true
        try {
            emit('playTrajectory', validPoints, showTrajectory.value, trajectoryConfigs.value)
        } catch (error) {
            dialog.warning({
                title: '轨迹弧度不足',
                content: error.message,
                positiveText: '确定',
                onPositiveClick: () => {
                    // 重新预览轨迹
                    playTrajectory()
                }
            })
            isPlaying.value = false
        }
        setTimeout(() => {
            isPlaying.value = false
        }, 1000)
    }
}

// 修改播放成的处理数
function handlePlayComplete() {
    isPlaying.value = false
}

// 暴给父件的方法
defineExpose({
    handlePlayComplete,
    handlePointSelected
})

function clearPoints() {
    dialog.warning({
        title: '确认清除',
        content: '是否确认清除所有点位？',
        positiveText: '确认',
        negativeText: '取消',
        onPositiveClick: () => {
            trajectoryPoints.value = []
            trajectoryConfigs.value = {}  // 清空轨迹配置
            emit('clearPoints')
        }
    })
}

function handleDesignModeChange(value) {
    if (value) {
        dialog.warning({
            title: '点位采集',
            content: `
                双打场地添加点位：
                1. 点位高度默认为1.7米，可后续在点位列表调整
                2. 相邻点位必须在同半场
                3. 点击场地处点位，因3D视角问题，点位基本不太准确，可在点位列表优化
            `,
            positiveText: '确认',
            negativeText: '取消',
            onPositiveClick: () => {
                isCollecting.value = true
                emit('startCollectingPoints')
            },
            onNegativeClick: () => {
                isCollecting.value = false
            }
        })
    } else {
        emit('stopCollectingPoints')
    }
}

// 处理采集的点位
function handlePointSelected(point) {
    // 如果不设计模式，直接返回
    if (!isCollecting.value) return

    // 先验证点位是否在场地范围内
    if (!validatePoint(point)) {
        message.error('选择点位超出场地范围！')
        return
    }

    // 证与上一个点位是在不同半场
    if (trajectoryPoints.value.length > 0) {
        const lastPoint = trajectoryPoints.value[trajectoryPoints.value.length - 1]
        if (lastPoint && Math.sign(point.z) === Math.sign(lastPoint.z)) {
            message.error('新点位必须与上一个点位在不同半场！')
            return
        }
    }

    selectedPoint.value = {
        ...point,
        y: currentHeight.value
    }

    // 用对话框确认点位
    dialog.info({
        title: '确认点位',
        content: `
        是否确认添加以下点位？
        X: ${point.x.toFixed(2)}
        Y: ${currentHeight.value.toFixed(2)}
        Z: ${point.z.toFixed(2)}
      `,
        positiveText: '确认',
        negativeText: '取消',
        onPositiveClick: () => {
            confirmPoint()
        },
        onNegativeClick: () => {
            cancelPoint()
        }
    })
}

// 确认采集点位
function confirmPoint() {
    if (selectedPoint.value) {
        // 直接添加到组末尾
        trajectoryPoints.value.push(selectedPoint.value)
    }
    selectedPoint.value = null
}

// 取消采集当前点位
function cancelPoint() {
    selectedPoint.value = null
}

// 添加对点位数组的监听
watch(
    trajectoryPoints,
    (newPoints) => {
        if (isPreviewMode.value) {
            const nonEmptyPoints = newPoints.filter(p =>
                p.x !== null && p.y !== null && p.z !== null
            )
            emit('previewPoints', nonEmptyPoints)
        }
        // 更新轨迹配置
        updateTrajectoryConfigs(newPoints)
    },
    { deep: true }
)

// 加轨迹显示变化处理函数
function handleTrajectoryVisibilityChange(value) {
    // 如果正在放，实时更新轨迹示状态
    if (isPlaying.value) {
        emit('playTrajectory', trajectoryPoints.value, value)
    }
}

// 更新轨迹配置
function updateTrajectoryConfigs(points) {
    const newConfigs = {}
    const validPoints = points.filter(p => 
        p.x !== null && p.y !== null && p.z !== null
    )
    
    // 为每两个相邻点位创建一个轨迹配置
    for (let i = 0; i < validPoints.length - 1; i++) {
        const key = `P${i + 1}-P${i + 2}`  // 例如: "P1-P2"
        
        // 如果已存在配置则保留否则使用默配置
        if (!trajectoryConfigs.value[key]) {
            newConfigs[key] = { ...DEFAULT_TRAJECTORY_CONFIG }
        } else {
            newConfigs[key] = { ...trajectoryConfigs.value[key] }
        }
    }
    
    trajectoryConfigs.value = newConfigs
}

// 重置个轨迹配置
function resetTrajectoryConfig(key) {
    trajectoryConfigs.value[key] = { ...DEFAULT_TRAJECTORY_CONFIG }
}

// 显示随机点位对话框
function showRandomPointsDialog() {
    dialog.info({
        title: '随机添加点位',
        content: () => {
            return h(
                NInputNumber,
                {
                    defaultValue: 1,
                    min: 1,
                    max: 5,
                    size: 'large',
                    class: 'w-full mt-2',
                    placeholder: '请输入要添加的点位数(1-5)',
                    onUpdateValue: (val) => {
                        inputValue = val
                    }
                }
            )
        },
        positiveText: '确认',
        negativeText: '取消',
        onPositiveClick: () => {
            if (inputValue && inputValue >= 1 && inputValue <= 5) {
                generateRandomPoints(inputValue)
            } else {
                message.error('请输入1-5之间的数字')
                return false
            }
        }
    })
}

// 添加输入值变量
let inputValue = 1  // 默认值为1

// 导出数据
function exportData() {
    if (trajectoryPoints.value.length === 0) {
        message.warning('没有可导出的点位数据')
        return
    }

    // 获取当前选中颜色的hex值
    const currentColor = courtStore.courtColors.find(c => c.value === courtStore.selectedColor)
    const colorHex = currentColor ? currentColor.hex : '#4CAF50'  // 默认绿色

    const data = {
        points: trajectoryPoints.value,
        configs: trajectoryConfigs.value,
        courtColor: colorHex  // 使用hex格式的颜色字符串
    }

    // 创建下载
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `trajectory_data_${new Date().toISOString().slice(0,10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    message.success('数据导出成功')
}

// 导入数据
function importData() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
        const file = e.target.files[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result)
                
                // 验证数据结构
                if (!data.points || !Array.isArray(data.points)) {
                    throw new Error('无效的点位数据')
                }

                // 验证所有点位
                const validPoints = data.points.every(point => 
                    validatePoint(point) && 
                    point.x !== null && 
                    point.y !== null && 
                    point.z !== null
                )
                if (!validPoints) {
                    throw new Error('点位数据不符合要求')
                }

                // 验证点位分布
                if (!validatePointsDistribution(data.points)) {
                    throw new Error('点位分布不符合要求')
                }

                // 验证配置数据
                if (data.configs) {
                    const validConfigs = Object.entries(data.configs).every(([key, config]) => {
                        return (
                            config.arcHeight >= 0 &&
                            config.speed >= 3 &&
                            config.speed <= 80
                        )
                    })
                    if (!validConfigs) {
                        throw new Error('轨迹配置数据不符合要求')
                    }
                }

                // 验证球场颜色
                if (data.courtColor !== undefined) {
                    // 验证颜色格式
                    if (!/^#[0-9A-F]{6}$/i.test(data.courtColor)) {
                        throw new Error('无效的球场颜色格式')
                    }
                    // 查找对应的颜色配置
                    const matchedColor = courtStore.courtColors.find(c => c.hex === data.courtColor)
                    if (!matchedColor) {
                        throw new Error('不支持的球场颜色')
                    }
                }

                // 清除所有数据
                trajectoryPoints.value = []
                trajectoryConfigs.value = {}

                // 导入新数据
                trajectoryPoints.value = data.points
                if (data.configs) {
                    trajectoryConfigs.value = data.configs
                }
                // 设置球场颜色
                if (data.courtColor !== undefined) {
                    const matchedColor = courtStore.courtColors.find(c => c.hex === data.courtColor)
                    courtStore.selectColor(matchedColor.value)
                }

                message.success('数据导入成功')
            } catch (error) {
                message.error(`导入失败: ${error.message}`)
            }
        }
        reader.readAsText(file)
    }
    input.click()
}

// 复制 JSON 数据
function copyJsonData() {
    if (trajectoryPoints.value.length === 0) {
        message.warning('没有可复制的点位数据')
        return
    }

    // 获取当前选中颜色的hex值
    const currentColor = courtStore.courtColors.find(c => c.value === courtStore.selectedColor)
    const colorHex = currentColor ? currentColor.hex : '#4CAF50'  // 默认绿色

    const data = {
        points: trajectoryPoints.value,
        configs: trajectoryConfigs.value,
        courtColor: colorHex
    }

    try {
        // 创建临时文本区域
        const textArea = document.createElement('textarea')
        textArea.value = JSON.stringify(data, null, 2)
        document.body.appendChild(textArea)
        
        // 选择文本
        textArea.select()
        textArea.setSelectionRange(0, 99999) // 兼容移动设备
        
        // 执行复制命令
        document.execCommand('copy')
        
        // 移除临时元素
        document.body.removeChild(textArea)
        
        message.success('JSON数据已复制到剪贴板')
    } catch (err) {
        message.error('复制失败，请手动复制')
    }
}
</script>

<style scoped>

</style>