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
                                @click="handleColorSelect(color.value)">
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
  <!-- 比赛类型选择 -->
  <n-card class="mb-4" size="small" style="min-height: fit-content">
            <template #header>
                <div class="flex items-center">
                    <n-icon size="18" class="mr-1">
                        <People />
                    </n-icon>
                    <span class="font-bold">比赛类型</span>
                </div>
            </template>
            <div class="flex space-x-2">
                <div 
                    v-for="type in matchStore.matchTypes" 
                    :key="type.value"
                    class="cursor-pointer rounded transition-all hover:scale-105 text-center text-sm select-none"
                    style="padding: 2px 8px; min-width: 48px;"
                    :class="{ 
                        'bg-blue-500 text-white': matchStore.selectedType === type.value,
                        'bg-gray-100 hover:bg-gray-200 text-gray-600': matchStore.selectedType !== type.value,
                        'border border-gray-200': type.value === 'NONE'
                    }"
                    @click="handleMatchTypeChange(type.value)"
                >
                    {{ type.label }}
                </div>
            </div>
        </n-card>

        <!-- 球员位置配置 -->
        <n-card class="mb-4" size="small">
            <template #header>
                <div class="flex items-center">
                    <n-icon size="18" class="mr-1">
                        <PersonOutline />
                    </n-icon>
                    <span class="font-bold">球员位置设置</span>
                </div>
            </template>
            
            <!-- 初始位置设置 -->
            <div class="mb-4">
                <div class="flex items-center justify-between mb-2">
                    <span class="font-bold text-sm">初始位置</span>
                    <n-tooltip trigger="hover">
                        <template #trigger>
                            <n-icon size="16" class="text-gray-400">
                                <InformationCircle />
                            </n-icon>
                        </template>
                        <span>设置每个球员的初始站位位置</span>
                    </n-tooltip>
                </div>
                
                <!-- 使用网格布局，一行显示两个球员 -->
                <n-grid :cols="2" :x-gap="12" :y-gap="12">
                    <!-- 遍历所有球员 -->
                    <n-grid-item 
                        v-for="index in playerCount" 
                        :key="index"
                        v-if="matchStore.selectedType !== 'NONE'"
                    >
                        <div class="text-sm text-gray-500 mb-2">{{ index }} 号球员</div>
                        <n-grid :cols="2" :x-gap="12">
                            <n-grid-item>
                                <div class="text-xs mb-1">左右位置X</div>
                                <n-input-number 
                                    v-model:value="currentInitialPositions[`player${index}`].x"
                                    size="small"
                                    placeholder="X坐标"
                                    :step="0.1"
                                    :precision="2"
                                    :min="-3.05"
                                    :max="3.05"
                                />
                            </n-grid-item>
                            <n-grid-item>
                                <div class="text-xs mb-1">前后位置Z</div>
                                <n-input-number 
                                    v-model:value="currentInitialPositions[`player${index}`].z"
                                    size="small"
                                    placeholder="Z坐标"
                                    :step="0.1"
                                    :precision="2"
                                    :min="-6.7"
                                    :max="6.7"
                                />
                            </n-grid-item>
                        </n-grid>
                    </n-grid-item>
                </n-grid>
            </div>

            <!-- 分隔线 -->
            <n-divider>移动点设置</n-divider>

            <!-- 移动点设置 -->
            <div>
                <div class="flex items-center justify-between mb-2">
                    <span class="font-bold text-sm">移动点</span>
                    <n-tooltip trigger="hover">
                        <template #trigger>
                            <n-icon size="16" class="text-gray-400">
                                <InformationCircle />
                            </n-icon>
                        </template>
                        <span>设置每个球路中球员的移动位置和速度</span>
                    </n-tooltip>
                </div>

                <!-- 移动点设置内容 -->
                <div v-if="trajectoryPoints.length > 0" class="space-y-4">
                    <!-- 遍历每个球路 -->
                    <div v-for="(_, index) in trajectoryPoints.slice(0, -1)" :key="index">
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-sm font-medium">P{{ index + 1 }} → P{{ index + 2 }}</span>
                            <n-button size="tiny" text @click="toggleExpandPoint(index)">
                                {{ expandedPoints[index] ? '收起' : '展开' }}
                            </n-button>
                        </div>

                        <div v-show="expandedPoints[index]" class="pl-4 border-l-2 border-gray-200">
                            <!-- 双打模式设置 -->
                            <template v-if="isDoubles">
                                <!-- 击球方设置 -->
                                <div class="mb-4">
                                    <div class="text-xs text-gray-500 mb-2">击球设置</div>
                                    <!-- 选择击球员 -->
                                    <div class="mb-2">
                                        <div class="text-xs mb-1">击球人</div>
                                        <div class="flex space-x-2">
                                            <div
                                                v-for="playerId in getHitterOptions(index)"
                                                :key="playerId.value"
                                                class="cursor-pointer px-3 py-1 rounded text-sm transition-colors"
                                                :class="{
                                                    'bg-blue-500 text-white': getHitterConfig(index).hitterId === playerId.value,
                                                    'bg-gray-100 hover:bg-gray-200': getHitterConfig(index).hitterId !== playerId.value
                                                }"
                                                @click="getHitterConfig(index).hitterId = playerId.value"
                                            >
                                                {{ playerId.label }}
                                            </div>
                                        </div>
                                    </div>

                                    <!-- 击球员回退位置 -->
                                    <div class="mb-2">
                                        <div class="text-xs mb-1">击球员回退位置</div>
                                        <n-grid :cols="3" :x-gap="8">
                                            <n-grid-item>
                                                <n-input-number v-model:value="getHitterMovePoint(index).x" size="small" placeholder="X" />
                                            </n-grid-item>
                                            <n-grid-item>
                                                <n-input-number v-model:value="getHitterMovePoint(index).z" size="small" placeholder="Z" />
                                            </n-grid-item>
                                            <n-grid-item>
                                                <n-input-number v-model:value="getHitterMovePoint(index).speed" size="small" placeholder="速度" />
                                            </n-grid-item>
                                        </n-grid>
                                    </div>

                                    <!-- 伙伴击球时位置 -->
                                    <div class="mb-2">
                                        <div class="text-xs mb-1">击球过程中伙伴的移动位置</div>
                                        <n-grid :cols="3" :x-gap="8">
                                            <n-grid-item>
                                                <n-input-number v-model:value="getHitterPartnerStandPoint(index).x" size="small" placeholder="X" />
                                            </n-grid-item>
                                            <n-grid-item>
                                                <n-input-number v-model:value="getHitterPartnerStandPoint(index).z" size="small" placeholder="Z" />
                                            </n-grid-item>
                                            <n-grid-item>
                                                <n-input-number v-model:value="getHitterPartnerStandPoint(index).speed" size="small" placeholder="速度" />
                                            </n-grid-item>
                                        </n-grid>
                                    </div>

                                    <!-- 伙伴回退位置 -->
                                    <div>
                                        <div class="text-xs mb-1">伙伴回退位置</div>
                                        <n-grid :cols="3" :x-gap="8">
                                            <n-grid-item>
                                                <n-input-number v-model:value="getHitterPartnerReturnPoint(index).x" size="small" placeholder="X" />
                                            </n-grid-item>
                                            <n-grid-item>
                                                <n-input-number v-model:value="getHitterPartnerReturnPoint(index).z" size="small" placeholder="Z" />
                                            </n-grid-item>
                                            <n-grid-item>
                                                <n-input-number v-model:value="getHitterPartnerReturnPoint(index).speed" size="small" placeholder="速度" />
                                            </n-grid-item>
                                        </n-grid>
                                    </div>
                                </div>
                            </template>
                        </div>
                    </div>
                </div>
            </div>
        </n-card>

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
                                    <div class="text-xs text-gray-500 mb-1 cursor-help">球速 (3 ~ 80 m/s)</div>
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
                <n-space align="center">
                    <span>显示回位点</span>
                    <n-switch v-model:value="showReturnPoints" @update:value="handleReturnPointsVisibilityChange" />
                </n-space>
            </n-space>

            <!-- 操作按钮 -->
            <n-space align="center" class="mt-4">
                <n-button secondary type="default" @click="playTrajectory">
                    <template #icon>
                        <n-icon><Play /></n-icon>
                    </template>
                    播放轨迹
                </n-button>
                <n-button secondary type="default" @click="showRandomPointsDialog">
                    <template #icon>
                        <n-icon><Dice /></n-icon>
                    </template>
                    随机点位
                </n-button>
            </n-space>
        </n-card>

        <!-- 数据导入导出 -->
        <n-card class="mb-4" size="small">
            <template #header>
                <div class="flex items-center">
                    <n-icon size="18" class="mr-1">
                        <Save />
                    </n-icon>
                    <span class="font-bold">数据管理</span>
                </div>
            </template>
            <n-space>
                <n-button secondary type="default" @click="copyJsonData">
                    <template #icon>
                        <n-icon><Copy /></n-icon>
                    </template>
                    复制JSON
                </n-button>
                <n-button secondary type="default" @click="importData">
                    <template #icon>
                        <n-icon><CloudUpload /></n-icon>
                    </template>
                    导入数据
                </n-button>
                <n-button secondary type="default" @click="exportData">
                    <template #icon>
                        <n-icon><CloudDownload /></n-icon>
                    </template>
                    导出数据
                </n-button>
            </n-space>
        </n-card>
        </div>

</template>

<script setup>
import { ref, computed, watch, h } from 'vue'
import { useCourtStore } from '../stores/court'
import { useMatchStore } from '../stores/match'
import { createMatchConfig, createPlayer, createPoint, createTrajectory, createHit } from '../config/matchConfig'
import {
    NScrollbar,
    NCard,
    NGrid,
    NGridItem,
    NButton,
    NSpace,
    NInputNumber,
    NIcon,
    NSwitch,
    NTooltip,
    NDivider,
    NSelect
} from 'naive-ui'
import { useDialog, useMessage } from 'naive-ui'
import { Close, InformationCircle, ColorPalette, LocationSharp, Refresh, Dice, CloudUpload, CloudDownload, Copy, People, PersonOutline, Play, Save } from '@vicons/ionicons5'

const courtStore = useCourtStore()
const matchStore = useMatchStore()
const dialog = useDialog()
const message = useMessage()
const emit = defineEmits([
    'previewPoints',
    'playTrajectory',
    'clearPoints',
    'startCollectingPoints',
    'stopCollectingPoints',
    'clearPreview',
    'matchTypeChange',
    'playerMoveToPoint',
    'updatePlayerPositions',
    'updateReturnPointsVisibility'
])

const trajectoryPoints = ref([])  // 初始时没有点位
const showTrajectory = ref(true)
const isPlaying = ref(false)
const isPreviewMode = ref(true)  // 默认开启预览
const isCollecting = ref(false)
const currentHeight = ref(1.7)
const selectedPoint = ref(null)
const trajectoryConfigs = ref({})  // 存储轨迹配置
const showReturnPoints = ref(true)  // 默认显示回位点

// 场地范围限制
const COURT_LIMITS = {
    x: { min: -3.05, max: 3.05 }, // 双打场地宽度范围 (6.10米)
    y: { min: 0, max: 3.2 },     // 高度限制
    z: { min: -6.7, max: 6.7 }   // 场度范围
}

// 默认配置
const DEFAULT_TRAJECTORY_CONFIG = {
    arcHeight: 0.15,  // 默认抛物线弧系数（保持2位小数）
    speed: 10       // 默认球速（米/秒）
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
function addPoint(point) {
    const newPoints = [...trajectoryPoints.value]
    newPoints.push(point)
    trajectoryPoints.value = newPoints
    
    // 同时添加对应的回位点
    const returnPoint = {
        x: 0,  // 回位到中间位置
        z: point.z < 0 ? -4 : 4  // 根据击球点所在半场决定回位位置
    }
    playerPositions.value.returnPoints.push(returnPoint)
    console.log(`添加点位 P${newPoints.length} 及其回位点:`, { point, returnPoint })
}

// 删除点位
function removePoint(index) {
    const newPoints = [...trajectoryPoints.value]
    newPoints.splice(index, 1)
    trajectoryPoints.value = newPoints
    
    // 同时删除对应的回位点
    playerPositions.value.returnPoints.splice(index, 1)
    console.log(`删除点位 P${index + 1} 及其回位点`)
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
                    ? randomInRange(0.1, 6.7)    // 后场范围
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
    isPreviewMode.value = value
    if (value) {
        emit('previewPoints', trajectoryPoints.value)
    } else {
        emit('clearPreview')
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
            // 创建轨迹配置
            const configs = {}
            for (let i = 0; i < validPoints.length - 1; i++) {
                const key = `P${i + 1}-P${i + 2}`
                configs[key] = {
                    hitConfig: {
                        hitterId: trajectoryConfigs.value[key]?.hitConfig?.hitterId || 
                                  (validPoints[i].z < 0 ? 1 : 2),
                        partnerStandPoint: trajectoryConfigs.value[key]?.hitConfig?.partnerStandPoint || {
                            x: 0,
                            z: validPoints[i].z < 0 ? -4 : 4,
                            speed: 7
                        },
                        hitterReturnPoint: trajectoryConfigs.value[key]?.hitConfig?.hitterReturnPoint || {
                            x: 0,
                            z: validPoints[i].z < 0 ? -4 : 4,
                            speed: 7
                        },
                        partnerReturnPoint: trajectoryConfigs.value[key]?.hitConfig?.partnerReturnPoint || {
                            x: 0,
                            z: validPoints[i].z < 0 ? -4 : 4,
                            speed: 7
                        }
                    }
                }
            }
            emit('playTrajectory', validPoints, showTrajectory.value, configs)
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
            playerPositions.value.returnPoints = []
            console.log('清空所有点位和回位点')
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
    console.log('CourtSettings: handlePointSelected called with point:', point)
    if (!isCollecting.value) return
    
    if (selectedPoint.value !== null) {
        // 更新已选中点位
        trajectoryPoints.value[selectedPoint.value] = point
        selectedPoint.value = null
    } else {
        // 添加新点位
        console.log('CourtSettings: Adding new point')
        addPoint(point)
    }
    
    // 无论是否预览模式，都更新预览
    emit('previewPoints', trajectoryPoints.value)
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
        const key = `P${i + 1}-P${i + 2}`
        
        // 保留现有配置或创建新配置
        newConfigs[key] = {
            ...DEFAULT_TRAJECTORY_CONFIG,
            ...trajectoryConfigs.value[key],
            hitterMovePoints: trajectoryConfigs.value[key]?.hitterMovePoints || {
                main: {
                    x: 0,
                    z: validPoints[i].z < 0 ? -4 : 4,
                    speed: 7
                }
            },
            receiverMovePoints: trajectoryConfigs.value[key]?.receiverMovePoints || {
                main: {
                    x: validPoints[i + 1].x,
                    z: validPoints[i + 1].z,
                    speed: 7
                },
                receiverId: validPoints[i + 1].z > 0 ? 2 : 4
            }
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
                    max: 100,
                    size: 'large',
                    class: 'w-full mt-2',
                    placeholder: '请输入要添加的点位数',
                    onUpdateValue: (val) => {
                        inputValue = val
                    }
                }
            )
        },
        positiveText: '确认',
        negativeText: '取消',
        onPositiveClick: () => {
            generateRandomPoints(inputValue)
        }
    })
}

// 添加输入值变量
let inputValue = 1  // 默认值为1

// 导出数据
function exportData() {
    // 创建完整的比赛配置
    const matchConfig = createMatchConfig({
        matchType: matchStore.selectedType,
        courtColor: courtStore.selectedColor,
        players: {
            'S1': createPlayer({
                id: 'S1',
                gender: matchStore.selectedType.includes('W') ? 'female' : 'male',
                initialPosition: currentInitialPositions.value.player1
            }),
            'S2': createPlayer({
                id: 'S2',
                gender: matchStore.selectedType.includes('W') ? 'female' : 'male',
                initialPosition: currentInitialPositions.value.player2
            })
        },
        points: trajectoryPoints.value.reduce((acc, point, index) => {
            acc[`P${index + 1}`] = createPoint({
                id: `P${index + 1}`,
                position: point
            })
            return acc
        }, {}),
        trajectories: trajectoryPoints.value.slice(0, -1).reduce((acc, _, index) => {
            const key = `T${index + 1}-${index + 2}`
            acc[key] = createTrajectory({
                id: key,
                startPointId: `P${index + 1}`,
                endPointId: `P${index + 2}`,
                speed: trajectoryConfigs.value[key]?.speed || 3,
                arcHeight: trajectoryConfigs.value[key]?.arcHeight || 0.15
            })
            return acc
        }, {}),
        hits: trajectoryPoints.value.reduce((acc, point, index) => {
            acc[`H${index + 1}`] = createHit({
                id: `H${index + 1}`,
                pointId: `P${index + 1}`,
                hitterId: point.z < 0 ? 'S1' : 'S2',
                receiverId: point.z < 0 ? 'S2' : 'S1',
                returnPosition: playerPositions.value.returnPoints[index] || { x: 0, z: point.z < 0 ? -4 : 4 }
            })
            return acc
        }, {})
    })

    // 下载配置文件
    const blob = new Blob([JSON.stringify(matchConfig, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'match-config.json'
    a.click()
    URL.revokeObjectURL(url)
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

// 处理比赛类型变化
function handleMatchTypeChange(value) {
    console.log('CourtSettings: handleMatchTypeChange called with value:', value)
    const isChangingMatchType = value !== previousType
    
    if (isChangingMatchType && previousType !== 'NONE') {
        dialog.warning({
            title: '切换比赛类型',
            content: () => {
                return h('div', {}, [
                    h('p', { style: 'margin-bottom: 10px' }, '切换比赛类型将清空：'),
                    h('ul', { style: 'list-style-type: disc; padding-left: 20px; margin: 10px 0;' }, [
                        h('li', { style: 'margin-bottom: 5px' }, '所有球员位置数据'),
                        h('li', { style: 'margin-bottom: 5px' }, '所有点位数据')
                    ])
                ])
            },
            positiveText: '确认',
            negativeText: '取消',
            onPositiveClick: () => {
                // 清除点位和配置
                trajectoryPoints.value = []
                trajectoryConfigs.value = {}
                playerPositions.value.returnPoints = []
                
                // 重置球员初始位置到默认值
                const isDoubles = ['MD', 'WD', 'XD'].includes(value)
                if (isDoubles) {
                    playerPositions.value.initialPositions.doubles = {
                        player1: { x: 1.5, z: -4 },   // 1号在前场右边
                        player2: { x: 1.5, z: 4 },    // 2号在后场右边
                        player3: { x: -1.5, z: -4 },  // 3号在前场左边
                        player4: { x: -1.5, z: 4 }    // 4号在后场左边
                    }
                } else {
                    playerPositions.value.initialPositions.singles = {
                        player1: { x: 0, z: -4 },     // 1号在前场中间
                        player2: { x: 0, z: 4 }       // 2号在后场中间
                    }
                }
                
                emit('clearPoints')
                matchStore.selectType(value)
                updatePlayers(value)
                
                message.success('已切换比赛类型并清空所有数据')
            },
            onNegativeClick: () => {
                matchStore.selectType(previousType)
            }
        })
    } else {
        matchStore.selectType(value)
        updatePlayers(value)
    }
    previousType = value
}

// 更新球员
function updatePlayers(type) {
    if (type === 'NONE') {
        emit('matchTypeChange', {
            type,
            config: {
                isDoubles: false,
                gender: null
            }
        })
        return
    }

    const isDoubles = type === 'DOUBLES'
    emit('matchTypeChange', {
        type,
        config: {
            type,
            isDoubles,
            gender: null
        }
    })

    // 切换比赛类型时更新球员位置
    emit('updatePlayerPositions', {
        ...playerPositions.value,
        currentPositions: isDoubles 
            ? playerPositions.value.initialPositions.doubles 
            : playerPositions.value.initialPositions.singles,
        shouldUpdateInitialPositions: true
    })
}

// 记录上一次的类型，用于取消时恢复
let previousType = 'NONE'

// 修改点位数组的监听
watch(
    trajectoryPoints,
    (newPoints, oldPoints) => {
        console.log('CourtSettings: trajectoryPoints changed')
        // 更新预览
        if (isPreviewMode.value) {
            const nonEmptyPoints = newPoints.filter(p =>
                p.x !== null && p.y !== null && p.z !== null
            )
            emit('previewPoints', nonEmptyPoints)
        }
        
        // 更新轨迹配置
        updateTrajectoryConfigs(newPoints)
    },
    { 
        deep: true,
        immediate: true
    }
)

// 添加球员位置配置
const playerPositions = ref({
    initialPositions: {
        singles: {
            player1: { x: 0, z: -4 },
            player2: { x: 0, z: 4 }
        },
        doubles: {
            player1: { x: 1.5, z: -4 },
            player2: { x: 1.5, z: 4 },
            player3: { x: -1.5, z: -4 },
            player4: { x: -1.5, z: 4 }
        }
    },
    returnPoints: [] // 每个元素是一个 {x, z, speed} 对象
})

// 修改计算属性，确保返回正确的初始位置
const currentInitialPositions = computed(() => {
    if (matchStore.selectedType === 'NONE') {
        return {}
    }
    // 确保返回正确的位置对象
    const positions = isDoubles.value 
        ? playerPositions.value.initialPositions.doubles
        : playerPositions.value.initialPositions.singles
    
    // 验证位置对象的完整性
    if (!positions) {
        console.warn('Invalid positions object:', positions)
        return {}
    }
    
    return positions
})

// 监听点位变化，动态更新回位点数组
watch(trajectoryPoints, (newPoints) => {
    // 确保每个点位都有对应的回位点
    while (playerPositions.value.returnPoints.length < newPoints.length) {
        const point = newPoints[playerPositions.value.returnPoints.length]
        // 不在这里设置默认值，让 getReturnPoint 处理
        playerPositions.value.returnPoints.push(null)
    }
    
    // 如果需要删除多余的回位点
    if (playerPositions.value.returnPoints.length > newPoints.length) {
        playerPositions.value.returnPoints.length = newPoints.length
    }
}, { deep: true })

// 监听球员位置变化
watch(playerPositions, (newPositions) => {
    // 不在这里直接触发更新，避免重复
}, { deep: true })

// 修改监听初始位置变化的逻辑
watch(() => playerPositions.value.initialPositions, (newPositions) => {
    const isDoubles = matchStore.selectedType === 'DOUBLES'
    const currentPositions = isDoubles ? newPositions.doubles : newPositions.singles
    emit('updatePlayerPositions', {
        ...playerPositions.value,
        currentPositions,
        shouldUpdateInitialPositions: true
    })
}, { deep: true })

// 添加对单个球员位置变化的监听
watch(() => currentInitialPositions.value, (newPositions, oldPositions) => {
    if (JSON.stringify(newPositions) !== JSON.stringify(oldPositions)) {
        emit('updatePlayerPositions', {
            ...playerPositions.value,
            currentPositions: newPositions,
            shouldUpdateInitialPositions: true
        })
    }
}, { deep: true, immediate: true })

// 添加对回位点变化的监听
watch(() => playerPositions.value.returnPoints, (newReturnPoints, oldReturnPoints) => {
    if (JSON.stringify(newReturnPoints) !== JSON.stringify(oldReturnPoints)) {
        console.log('回位点发生变化:', newReturnPoints)
        emit('updatePlayerPositions', {
            ...playerPositions.value,
            shouldUpdateInitialPositions: false
        })
    }
}, { 
    deep: true,
    immediate: false
})

// 添加颜色选择处理函数
function handleColorSelect(color) {
    courtStore.selectColor(color)
    message.success('球场颜色已更新')
}

// 获取回位点
function getReturnPoint(pointIndex) {
    if (!playerPositions.value.returnPoints[pointIndex]) {
        const point = trajectoryPoints.value[pointIndex]
        const isDoubles = matchStore.selectedType === 'DOUBLES'
        let initialPosition
        
        if (isDoubles) {
            // 双打：根据点位位置判断是哪个球员
            if (point.z < 0) { // 前场
                if (point.x > 0) {
                    initialPosition = playerPositions.value.initialPositions.doubles.player1
                } else {
                    initialPosition = playerPositions.value.initialPositions.doubles.player3
                }
            } else { // 后场
                if (point.x > 0) {
                    initialPosition = playerPositions.value.initialPositions.doubles.player2
                } else {
                    initialPosition = playerPositions.value.initialPositions.doubles.player4
                }
            }
        } else {
            // 单打：根据前后场判断
            if (point.z < 0) {
                initialPosition = playerPositions.value.initialPositions.singles.player1
            } else {
                initialPosition = playerPositions.value.initialPositions.singles.player2
            }
        }
        
        // 设置回位点，包含速度
        playerPositions.value.returnPoints[pointIndex] = {
            x: initialPosition.x,
            z: initialPosition.z,
            speed: 7  // 默认回位速度
        }
    }
    // 创建代理对象，监听属性变化
    return new Proxy(playerPositions.value.returnPoints[pointIndex], {
        set(target, property, value) {
            target[property] = value
            // 当回位点的任何属性发生变化时，触发更新
            emit('updatePlayerPositions', {
                ...playerPositions.value,
                shouldUpdateInitialPositions: false
            })
            return true
        }
    })
}

// 处理回位点显示状态变化
function handleReturnPointsVisibilityChange(value) {
    emit('updateReturnPointsVisibility', value)
}

// 计算是否是双打
const isDoubles = computed(() => matchStore.selectedType === 'DOUBLES')

// 计算当前显示的球员数量
const playerCount = computed(() => {
    if (matchStore.selectedType === 'NONE') return 0
    return isDoubles.value ? 4 : 2
})

// 获取击球人移动点
function getHitterMovePoint(index) {
    const key = `P${index + 1}-P${index + 2}`
    if (!trajectoryConfigs.value[key]?.hitterMovePoints?.main) {
        trajectoryConfigs.value[key] = {
            ...trajectoryConfigs.value[key],
            hitterMovePoints: {
                main: {
                    x: 0,
                    z: trajectoryPoints.value[index].z < 0 ? -4 : 4,
                    speed: 7
                }
            }
        }
    }
    return trajectoryConfigs.value[key].hitterMovePoints.main
}

// 获取击球方搭档移动点
function getHitterPartnerMovePoint(index) {
    const key = `P${index + 1}-P${index + 2}`
    if (!trajectoryConfigs.value[key]?.hitterMovePoints?.partner) {
        trajectoryConfigs.value[key] = {
            ...trajectoryConfigs.value[key],
            hitterMovePoints: {
                ...trajectoryConfigs.value[key]?.hitterMovePoints,
                partner: {
                    x: 0,
                    z: trajectoryPoints.value[index].z < 0 ? -4 : 4,
                    speed: 7
                }
            }
        }
    }
    return trajectoryConfigs.value[key].hitterMovePoints.partner
}

// 获取击球员配置
function getHitterConfig(index) {
    const key = `P${index + 1}-P${index + 2}`
    if (!trajectoryConfigs.value[key]?.hitterConfig) {
        const point = trajectoryPoints.value[index]
        trajectoryConfigs.value[key] = {
            ...trajectoryConfigs.value[key],
            hitterConfig: {
                // 默认选择该半场的第一个球员
                hitterId: point.z < 0 ? 1 : 2
            }
        }
    }
    return trajectoryConfigs.value[key].hitterConfig
}

// 获取伙伴击球时的站位位置
function getHitterPartnerStandPoint(index) {
    const key = `P${index + 1}-P${index + 2}`
    if (!trajectoryConfigs.value[key]?.hitConfig?.partnerStandPoint) {
        const point = trajectoryPoints.value[index]
        trajectoryConfigs.value[key] = {
            ...trajectoryConfigs.value[key],
            hitConfig: {
                ...trajectoryConfigs.value[key]?.hitConfig,
                partnerStandPoint: {
                    x: 0,
                    z: point.z < 0 ? -4 : 4,
                    speed: 7
                }
            }
        }
    }
    return trajectoryConfigs.value[key].hitConfig.partnerStandPoint
}

// 获取击球员回退位置
function getHitterReturnPoint(index) {
    const key = `P${index + 1}-P${index + 2}`
    if (!trajectoryConfigs.value[key]?.hitConfig?.hitterReturnPoint) {
        const point = trajectoryPoints.value[index]
        trajectoryConfigs.value[key] = {
            ...trajectoryConfigs.value[key],
            hitConfig: {
                ...trajectoryConfigs.value[key]?.hitConfig,
                hitterReturnPoint: {
                    x: 0,
                    z: point.z < 0 ? -4 : 4,
                    speed: 7
                }
            }
        }
    }
    return trajectoryConfigs.value[key].hitConfig.hitterReturnPoint
}

// 获取伙伴回退位置
function getHitterPartnerReturnPoint(index) {
    const key = `P${index + 1}-P${index + 2}`
    if (!trajectoryConfigs.value[key]?.hitConfig?.partnerReturnPoint) {
        const point = trajectoryPoints.value[index]
        trajectoryConfigs.value[key] = {
            ...trajectoryConfigs.value[key],
            hitConfig: {
                ...trajectoryConfigs.value[key]?.hitConfig,
                partnerReturnPoint: {
                    x: 0,
                    z: point.z < 0 ? -4 : 4,
                    speed: 7
                }
            }
        }
    }
    return trajectoryConfigs.value[key].hitConfig.partnerReturnPoint
}

// 控制点位展开/收起的状态
const expandedPoints = ref({})

// 切换点位展开状态
function toggleExpandPoint(index) {
  expandedPoints.value[index] = !expandedPoints.value[index]
}

// 添加调试日志
watch(() => matchStore.selectedType, (newType) => {
  console.log('Match type changed:', newType)
  console.log('Player count:', playerCount.value)
  console.log('Current initial positions:', currentInitialPositions.value)
}, { immediate: true })

// 获取击球员选项
function getHitterOptions(index) {
  const point = trajectoryPoints.value[index]
  if (!point) return []
  
  // 根据点位所在半场返回可选的球员
  return point.z < 0 
    ? [  // 前场球员
      { label: '1号球员', value: 1 },
      { label: '3号球员', value: 3 }
    ]
    : [  // 后场球员
      { label: '2号球员', value: 2 },
      { label: '4号球员', value: 4 }
    ]
}
</script>

<style scoped>

</style>