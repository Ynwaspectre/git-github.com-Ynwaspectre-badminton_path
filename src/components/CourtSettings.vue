<template>
    <div class="h-full  p-4 overflow-hidden overflow-y-auto hide-scrollbar">
        <!-- 球场颜色设置 -->
        <n-card class="mb-4" size="small" style="min-height: fit-content">
            <template #header>
                <div class="flex items-center">
                    <n-icon size="18" class="mr-1">
                        <ColorPalette />
                    </n-icon>
                    <span class="font-bold text-sm">球场颜色</span>
                </div>
            </template>
            <n-grid :cols="12" :x-gap="12" :y-gap="12" class="relative">
                <div class="absolute inset-0 bg-black opacity-50"></div>
                <n-grid-item v-for="color in courtStore.courtColors" :key="color.value">
                    <n-tooltip trigger="hover" :delay="500">
                        <template #trigger>
                            <div class="cursor-pointer rounded-lg p-2 transition-all hover:scale-110 relative" :class="{
                                'border-2 border-blue-500': courtStore.selectedColor === color.value,
                                'shadow-lg transform': true
                            }" @click="handleColorSelect(color.value)">
                                <div class="w-full h-6 rounded flex items-center justify-center"
                                    :style="{ backgroundColor: color.hex }">
                                    <!-- 选中蒙层和勾 -->
                                    <div v-if="courtStore.selectedColor === color.value"
                                        class="absolute inset-0 bg-black opacity-50 rounded-lg flex items-center justify-center">
                                    </div>
                                    <n-icon v-if="courtStore.selectedColor === color.value"
                                        class="text-white text-lg flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"
                                            stroke-linecap="round" stroke-linejoin="round"
                                            style="transform: translate(0px, 2px)">
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
                        <GameController />
                    </n-icon>
                    <span class="font-bold text-sm">参数设置</span>
                </div>
            </template>

            <div class="flex space-x-4">
                <span>比赛模式</span>
                <div v-for="type in matchStore.matchTypes" :key="type.value"
                    class="cursor-pointer rounded transition-all hover:scale-105 text-center text-sm select-none"
                    style="padding: 2px 8px; min-width: 48px;" :class="{
                        'bg-green-500 text-gray-700': matchStore.selectedType === type.value,
                        'bg-gray-100 hover:bg-gray-200 text-gray-600': matchStore.selectedType !== type.value,
                        'border border-gray-200': type.value === 'NONE'
                    }" @click="handleMatchTypeChange(type.value)">
                    {{ type.label }}
                </div>
            </div>
            <n-space align="center" class="mt-4">
                <n-space align="center">
                    <span>显示点位</span>
                    <n-switch :rail-style="railStyle" v-model:value="isPreviewMode" @update:value="handlePreviewChange"
                        size="small">
                    </n-switch>
                </n-space>
                <n-space align="center">
                    <span>显示轨迹</span>
                    <n-switch :rail-style="railStyle" size="small" v-model:value="showTrajectory"
                        @update:value="handleTrajectoryVisibilityChange">
                    </n-switch>
                </n-space>
                <!-- 添加导入导出按钮 -->

            </n-space>
            <n-space align="center" class="mt-4">
                <n-button secondary type="info" size="tiny" @click="handleExportData">
                    <template #icon>
                        <n-icon>
                            <CloudDownload />
                        </n-icon>
                    </template>
                    数据导出
                </n-button>
                <n-button secondary type="info" size="tiny" @click="handleImportData">
                    <template #icon>
                        <n-icon>
                            <CloudUpload />
                        </n-icon>
                    </template>
                    数据导入
                </n-button>
            </n-space>
        </n-card>


        <n-card class="mb-4" size="small" segmented>
            <template #header>
                <div class="flex items-center">
                    <n-icon size="18" class="mr-1">
                        <LocationSharp />
                    </n-icon>
                    <span class="font-bold text-sm">击球点设计</span>
                </div>
            </template>
            <template #header-extra>
                <div class="flex justify-center items-center space-x-4 mr2">
                    <n-space align="center">
                        <n-tooltip trigger="hover">
                            <template #trigger>
                                <span class="flex items-center">
                                    点位采集
                                    <n-icon size="16" class="ml-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                                            <path
                                                d="M256 56C145.72 56 56 145.72 56 256s89.72 200 200 200 200-89.72 200-200S366.28 56 256 56zm0 82a26 26 0 11-26 26 26 26 0 0126-26zm48 226h-88a16 16 0 010-32h28v-88h-16a16 16 0 010-32h32a16 16 0 0116 16v104h28a16 16 0 010 32z"
                                                fill="currentColor" />
                                        </svg>
                                    </n-icon>
                                </span>
                            </template>
                            手动双击球场获取点位数据
                        </n-tooltip>
                        <n-switch v-model:value="isCollecting" @update:value="handleDesignModeChange" />
                    </n-space>
                    <n-space align="center">
                        <n-button secondary type="info" size="tiny" @click="showRandomPointsDialog">
                            <template #icon>
                                <n-icon>
                                    <Dice />
                                </n-icon>
                            </template>
                            随机添加
                        </n-button>
                        <n-button secondary type="error" size="tiny" @click="clearPoints">
                            <template #icon>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em"
                                    fill="#F44336">
                                    <path
                                        d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12z" />
                                </svg>
                            </template>
                            清除所有点位
                        </n-button>
                    </n-space>

                </div>
            </template>
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
                                <div class="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center">
                                    <span class="text-black text-xs font-bold">{{ index + 1 }}</span>
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
                                <n-button v-if="index === 0 || index === trajectoryPoints.length - 1" circle secondary
                                    size="small" @click="removePoint(index)">
                                    <template #icon>
                                        <n-icon class="hover:text-red-500 text-gray-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                                viewBox="0 0 24 24">
                                                <path fill="currentColor"
                                                    d="M7 21q-.825 0-1.412-.587T5 19V6q-.425 0-.712-.288T4 5t.288-.712T5 4h4q0-.425.288-.712T10 3h4q.425 0 .713.288T15 4h4q.425 0 .713.288T20 5t-.288.713T19 6v13q0 .825-.587 1.413T17 21zm3-4q.425 0 .713-.288T11 16V9q0-.425-.288-.712T10 8t-.712.288T9 9v7q0 .425.288.713T10 17m4 0q.425 0 .713-.288T15 16V9q0-.425-.288-.712T14 8t-.712.288T13 9v7q0 .425.288.713T14 17" />
                                            </svg>
                                        </n-icon>
                                    </template>
                                </n-button>
                            </n-grid-item>
                        </n-grid>
                    </div>
                </div>
            </div>


        </n-card>
        <n-button size="small" :loading="isPlaying" class="fixed text-black bg-green-400! bottom-4 right-4 z-50"
            :disabled="isPlaying || trajectoryPoints.length < 2" @click="playTrajectory">
            <template #icon>
                <n-icon>
                    <Play />
                </n-icon>
            </template>
            运行
        </n-button>
        <!-- 球员位置配置 -->
        <n-card class="mb-4" size="small" segmented>
            <template #header>
                <div class="flex items-center">
                    <n-icon size="18" class="mr-1">
                        <People />
                    </n-icon>
                    <span class="font-bold text-sm">球员初始位置</span>
                </div>
            </template>

            <!-- 初始位置设置 -->
            <div class="mb-4">
                <!-- 当没有选择比赛类型时显示Empty组件 -->
                <n-empty v-if="matchStore.selectedType === 'NONE'" description="请先选择比赛类型" />

                <!-- 使用网格布局，一行显示2个球员 -->
                <n-grid :cols="2" :x-gap="12" :y-gap="12" v-else>
                    <!-- 遍历所有球员 -->
                    <n-grid-item v-for="index in playerCount" :key="index">
                        <div class="flex items-center mb-2">
                            <div class="text-xs text-highlight font-bold text-black bg-green-500 rounded-lg px2 py0.5">
                                {{ index }}号球员
                            </div>
                        </div>

                        <div class="flex space-x-2">
                            <div>
                                <n-tooltip trigger="hover">
                                    <template #trigger>
                                        <div class="text-xs mb-1">左右位置</div>
                                    </template>
                                    <span>范围: -3.05m ~ 3.05m</span>
                                </n-tooltip>
                                <n-input-number v-model:value="playerPositions[`player${index}`].x" size="small"
                                    placeholder="左右位置" :step="0.05" :precision="2" :min="-3.05" :max="3.05" />
                            </div>
                            <div>
                                <n-tooltip trigger="hover">
                                    <template #trigger>
                                        <div class="text-xs mb-1">前后位置</div>
                                    </template>
                                    <span>范围: -6.7m ~ 6.7m</span>
                                </n-tooltip>
                                <n-input-number v-model:value="playerPositions[`player${index}`].z" size="small"
                                    placeholder="前后位置" :step="0.05" :precision="2" :min="-6.7" :max="6.7" />
                            </div>
                        </div>
                    </n-grid-item>
                </n-grid>
            </div>
        </n-card>


        <!-- 轨迹和移动点设置 -->
        <n-card class="mb-4" size="small" segmented>
            <template #header>
                <div class="flex items-center">
                    <n-icon size="18" class="mr-1">
                        <RocketSharp />
                    </n-icon>
                    <span class="font-bold text-sm">轨迹和移动点设置</span>
                </div>
            </template>
            <!-- 轨迹段设置卡片 -->
            <template v-if="trajectoryPoints.length >= 2">
                <n-grid :cols="2" :x-gap="12" :y-gap="12">
                    <n-grid-item v-for="(_, index) in trajectoryPoints.slice(0, -1)" :key="index">
                        <div class="p-4 bg-gray-100 rounded-lg">
                            <div class="flex items-center  mb-2">
                                <div class="text-xs cursor-pointer text-highlight font-bold text-black bg-yellow rounded-lg px2 py0.5 hover:bg-yellow-200 flex items-center gap-1"
                                    @click="emit('previewTrajectory', {
                                        points: trajectoryPoints.slice(index, index + 2),
                                        config: trajectoryConfigs[`P${index + 1}-P${index + 2}`]
                                    })">
                                    <span>P{{ index + 1 }}-P{{ index + 2 }}</span>
                                    <n-icon size="14">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                                            stroke="currentColor" stroke-width="2">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                            <circle cx="12" cy="12" r="3"></circle>
                                        </svg>
                                    </n-icon>
                                </div>


                                <div class="flex items-center gap-2 ml-auto">
                                    <div class="flex gap-1">
                                        <n-tooltip
                                            v-for="player in playerMoveConfigs[`P${index + 1}-P${index + 2}`]?.players"
                                            :key="player" trigger="hover" placement="top">
                                            <template #trigger>
                                                <div class="cursor-pointer px-2 py-0.5 rounded text-xs" :class="{
                                                    'bg-green-500 text-black font-bold': playerMoveConfigs[`P${index + 1}-P${index + 2}`].hitter === player,
                                                    'bg-gray-200 hover:bg-gray-300': playerMoveConfigs[`P${index + 1}-P${index + 2}`].hitter !== player
                                                }"
                                                    @click="playerMoveConfigs[`P${index + 1}-P${index + 2}`].hitter = player">
                                                    {{ player }}
                                                </div>
                                            </template>
                                            点击选择 {{ player }}号球员 作为击球球员
                                        </n-tooltip>
                                    </div>
                                </div>
                            </div>

                            <!-- 只有点位时显示基础轨迹设置 -->

                            <div class="flex gap-4">
                                <div class="w-24">
                                    <div class="text-xs mb-1">弧度系数</div>
                                    <n-input-number
                                        v-model:value="trajectoryConfigs[`P${index + 1}-P${index + 2}`].arcHeight"
                                        size="small" :step="0.05" :precision="2" :min="0" :max="1" />
                                </div>
                                <div class="w-24">
                                    <div class="text-xs mb-1">球速 (m/s)</div>
                                    <n-input-number
                                        v-model:value="trajectoryConfigs[`P${index + 1}-P${index + 2}`].speed"
                                        size="small" :step="0.5" :precision="1" :min="1" :max="30" />
                                </div>
                            </div>

                            <!-- 有点位且选择了比赛类型时显示完整设置 -->
                            <template v-if="matchStore.selectedType !== 'NONE'">


                                <!-- 球员移动设置 -->
                                <div class="mt-2">
                                    <n-grid :cols="2" :x-gap="8" :y-gap="4">
                                        <!-- 击球球员回退点 -->
                                        <n-grid-item span="2">
                                            <div class="text-xs mb-1 font-bold">击球球员回退点 (击球后退到的位置)</div>
                                        </n-grid-item>
                                        <n-grid-item>
                                            <n-tooltip trigger="hover">
                                                <template #trigger>
                                                    <div class="text-xs mb-1">左右位置</div>
                                                </template>
                                                <span>范围: -3.05m ~ 3.05m (场地左右位置)</span>
                                            </n-tooltip>
                                            <n-input-number
                                                v-model:value="playerMoveConfigs[`P${index + 1}-P${index + 2}`].hitterReturnPoint.x"
                                                size="small" placeholder="X" :step="0.1" :precision="2" :min="-3.05"
                                                :max="3.05" />
                                        </n-grid-item>
                                        <n-grid-item>
                                            <n-tooltip trigger="hover">
                                                <template #trigger>
                                                    <div class="text-xs mb-1">前后位置</div>
                                                </template>
                                                <span>范围: -6.7m ~ 6.7m (场地前后位置)</span>
                                            </n-tooltip>
                                            <n-input-number
                                                v-model:value="playerMoveConfigs[`P${index + 1}-P${index + 2}`].hitterReturnPoint.z"
                                                size="small" placeholder="Z" :step="0.1" :precision="2" :min="-6.7"
                                                :max="6.7" />
                                        </n-grid-item>

                                        <!-- 搭档站位点 -->
                                        <template v-if="matchStore.selectedType === 'doubles'">
                                            <n-grid-item span="2">
                                                <div class="text-xs font-bold mb-1">搭档站位点 (搭档在球员击球时的位置)</div>
                                            </n-grid-item>
                                            <n-grid-item>
                                                <n-tooltip trigger="hover">
                                                    <template #trigger>
                                                        <div class="text-xs mb-1">左右位置</div>
                                                    </template>
                                                    <span>范围: -3.05m ~ 3.05m (场地左右位置)</span>
                                                </n-tooltip>
                                                <n-input-number
                                                    v-model:value="playerMoveConfigs[`P${index + 1}-P${index + 2}`].partnerStandPoint.x"
                                                    size="small" placeholder="X" :step="0.1" :precision="2" :min="-3.05"
                                                    :max="3.05" />
                                            </n-grid-item>
                                            <n-grid-item>
                                                <n-tooltip trigger="hover">
                                                    <template #trigger>
                                                        <div class="text-xs mb-1">前后位置</div>
                                                    </template>
                                                    <span>范围: -6.7m ~ 6.7m (场地前后位置)</span>
                                                </n-tooltip>
                                                <n-input-number
                                                    v-model:value="playerMoveConfigs[`P${index + 1}-P${index + 2}`].partnerStandPoint.z"
                                                    size="small" placeholder="Z" :step="0.1" :precision="2" :min="-6.7"
                                                    :max="6.7" />
                                            </n-grid-item>

                                            <!-- 搭档回退点 -->
                                            <n-grid-item span="2">
                                                <div class="text-xs mb-1 font-bold">搭档回退点 (搭档在球员击球后退到的位置)</div>
                                            </n-grid-item>
                                            <n-grid-item>
                                                <n-input-number
                                                    v-model:value="playerMoveConfigs[`P${index + 1}-P${index + 2}`].partnerReturnPoint.x"
                                                    size="small" placeholder="X" :step="0.1" :precision="2" :min="-3.05"
                                                    :max="3.05" />
                                            </n-grid-item>
                                            <n-grid-item>
                                                <n-input-number
                                                    v-model:value="playerMoveConfigs[`P${index + 1}-P${index + 2}`].partnerReturnPoint.z"
                                                    size="small" placeholder="Z" :step="0.1" :precision="2" :min="-6.7"
                                                    :max="6.7" />
                                            </n-grid-item>
                                        </template>

                                    </n-grid>
                                </div>
                            </template>
                        </div>
                    </n-grid-item>
                </n-grid>
            </template>
            <template v-else>
                <n-empty description="请先设置点位" />
            </template>


        </n-card>
        <!-- 站位 -->
        <div class="h10"></div>

    </div>
</template>

<script setup>
import { ref, computed, watch, h } from 'vue'
import { useCourtStore } from '../stores/court'
import { useMatchStore } from '../stores/match'
import {
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
    NEmpty,
    NInput

} from 'naive-ui'
import { useDialog, useMessage } from 'naive-ui'
// 图标预览网站: https://www.xicons.org/#/zh-CN/component/ionicons5
// 从 @vicons/ionicons5 导入需要的图标组件
import { ColorPalette, LocationSharp, RocketSharp, GameController, Dice, CloudUpload, CloudDownload, Copy, People, Play, Save } from '@vicons/ionicons5'
import { PLAYER_CONFIG } from '../settings/player'

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
    'updatePlayerPositions',
    'movePointsUpdate',
    'previewTrajectory'
])


// 场地范围限制
const COURT_LIMITS = {
    x: { min: -3.05, max: 3.05 }, // 双打场地宽度范围 (6.10米)
    y: { min: 0, max: 3.2 },     // 高度限制
    z: { min: -6.7, max: 6.7 }   // 场度范围
}

// 默认配置
const DEFAULT_TRAJECTORY_CONFIG = {
    arcHeight: 0.15,  // 默认抛物线弧系数（保持2位小数）
    speed: 4       // 默认球速（米/秒）
}




const trajectoryPoints = ref([])  // 初始时没有点位
const trajectoryConfigs = ref({})  // 存储轨迹配置
const playerMoveConfigs = ref({})  // 存储球员移动配置


const showTrajectory = ref(true) // 默认显示轨迹
const isPlaying = ref(false)
const isPreviewMode = ref(true)  // 默认开启预览
const isCollecting = ref(false)

const selectedPoint = ref(null)  //当前选中的点
const playerPositions = ref({}) //玩家坐标
const showMovePoints = ref(true)  // 默认显示移动点光标



// 添加公共的点位验证函数
function validatePoint(point) {
    // 校验点位是否在场地范围内
    if (
        point.x < COURT_LIMITS.x.min ||
        point.x > COURT_LIMITS.x.max ||
        point.y < COURT_LIMITS.y.min ||
        point.y > COURT_LIMITS.y.max ||
        point.z < COURT_LIMITS.z.min ||
        point.z > COURT_LIMITS.z.max
    ) {
        return {
            valid: false,
            message: '点位超出场地范围'
        }
    }

    // 校验是否和上一个点在不同半场
    if (trajectoryPoints.value.length > 0) {
        const lastPoint = trajectoryPoints.value[trajectoryPoints.value.length - 1]
        if (lastPoint.z * point.z > 0) { // 如果乘积大于0，说明在同一半场
            return {
                valid: false,
                message: '相邻点位必须在不同半场'
            }
        }
    }

    return {
        valid: true
    }
}

// 公共的添加点位函数
function addPoint(point) {
    const validation = validatePoint(point)
    if (!validation.valid) {
        message.error(validation.message)
        return false
    }

    trajectoryPoints.value.push(point)
    console.log(`添加点位 P${trajectoryPoints.value.length}:`, point)
    return true
}


// 修改后的 generateRandomPoints 函数
function generateRandomPoints(count) {
    for (let i = 0; i < count; i++) {
        // 获取当前最后一个点位
        const lastPoint = trajectoryPoints.value.length > 0
            ? trajectoryPoints.value[trajectoryPoints.value.length - 1]
            : null

        // 生成新的随机点
        const point = {
            x: randomInRange(COURT_LIMITS.x.min, COURT_LIMITS.x.max),
            y: randomInRange(COURT_LIMITS.y.min, COURT_LIMITS.y.max),
            z: lastPoint
                ? (lastPoint.z > 0
                    ? randomInRange(COURT_LIMITS.z.min, -0.1) // 如果上一个在后场，这个就在前场
                    : randomInRange(0.1, COURT_LIMITS.z.max))  // 如果上一个在前场，这个就在后场
                : (Math.random() > 0.5
                    ? randomInRange(0.1, COURT_LIMITS.z.max)   // 随机选择后场
                    : randomInRange(COURT_LIMITS.z.min, -0.1)) // 随机选择前场
        }

        // 添加点位
        addPoint(point)
    }

    message.success(`已添加 ${count} 个随机点位`)
}

// 辅助函数：生成指定范围内的随机数
function randomInRange(min, max) {
    return Number((Math.random() * (max - min) + min).toFixed(2))
}


// 删除点位
function removePoint(index) {
    // 只允许移除第一个或最后一个点位
    if (index !== 0 && index !== trajectoryPoints.value.length - 1) {
        message.warning('只能移除首尾点位')
        return
    }

    const newPoints = [...trajectoryPoints.value]
    newPoints.splice(index, 1)
    trajectoryPoints.value = newPoints
    console.log(`删除点位 P${index + 1}`)
}

function clearPoints() {
    dialog.warning({
        title: '确认清除',
        content: '是否确认清除所有点位？',
        positiveText: '确认',
        negativeText: '取消',
        onPositiveClick: () => {
            trajectoryPoints.value = [] // 清空点位
            trajectoryConfigs.value = {}  // 清空轨迹配置
            playerMoveConfigs.value = {} // 清空球员移动配置
            console.log('清空所有点位和移动点')
            emit('clearPoints')
            message.success('已清除所有点位')
        }
    })
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


function playTrajectory() {
    if (trajectoryPoints.value.length < 2) {
        message.warning('至少需要两个点位才能播放轨迹')
        return
    }
    isPlaying.value = true
    try {
        //校验数据弧度
        validateAndAdjustTrajectories()
        emit('playTrajectory', {
            points: trajectoryPoints.value,
            trajectoryConfigs: trajectoryConfigs.value,
            playerMoveConfigs: playerMoveConfigs.value,
            showTrajectory: showTrajectory.value
        })
    } catch (error) {
        console.log(error)
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
}

// 修改播放成的处理数
function handlePlayComplete() {
    console.log('播放完成')
    isPlaying.value = false
}


function handleDesignModeChange(value) {
    if (value) {
        dialog.warning({
            title: '点位采集',
            content: () => {
                return h('div', {}, [
                    h('p', { style: 'margin-bottom: 8px' }, '场地添加点位：'),
                    h('ul', { style: 'list-style-type: disc; padding-left: 20px' }, [
                        h('li', { style: 'margin-bottom: 8px' }, h('strong', {}, '双击采集点位')),
                        h('li', { style: 'margin-bottom: 8px' }, h('strong', {}, '点位高度默认为1.7米，可后续在点位列表调整')),
                        h('li', { style: 'margin-bottom: 8px' }, '相邻点位必须在同半场'),
                        h('li', { style: 'margin-bottom: 8px' }, '点击场地处点位，因3D视角问题，点位基本不太准确，可在点位列表优化')
                    ])
                ])
            },
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
function updateTrajectoryConfigs() {
    let points = trajectoryPoints.value
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
        }
    }

    trajectoryConfigs.value = newConfigs
}

// 更新球员移动点配置
function updatePlayerMoveConfigs() {
    // 检查必要的值是否存在
    if (!trajectoryPoints.value || !playerPositions.value) {
        console.log('Missing required values:', {
            trajectoryPoints: !!trajectoryPoints.value,
            playerPositions: !!playerPositions.value
        })
        return
    }

    const points = trajectoryPoints.value
    const validPoints = points.filter(p =>
        p.x !== null && p.y !== null && p.z !== null
    )

    const newConfigs = {}

    // 为每个点创建一个移动点配置
    for (let i = 0; i < validPoints.length; i++) {
        const key = `P${i + 1}-P${i + 2}`
        const point = validPoints[i]

        // 获取和当前点在同一半场的球员
        const sameCourtPlayers = Object.entries(playerPositions.value).filter(([_, position]) => {
            return (position.z < 0 && point.z < 0) || (position.z > 0 && point.z > 0)
        }).map(([playerId]) => parseInt(playerId.replace('player', '')))

        newConfigs[key] = {
            players: sameCourtPlayers,
            hitter: sameCourtPlayers[0],
            hitterReturnPoint: {
                x: 0,
                z: point.z < 0 ? -4 : 4
            },
            partnerReturnPoint: {
                x: 0,
                z: point.z < 0 ? -4 : 4
            },
            partnerStandPoint: {
                x: 0,
                z: point.z < 0 ? -4 : 4
            }
        }
    }

    playerMoveConfigs.value = newConfigs
    console.log('Updated playerMoveConfigs:', playerMoveConfigs.value)
}


// 添加输入值变量
let inputValue = 5  // 默认值为1
// 显示随机点位对话框
function showRandomPointsDialog() {
    dialog.info({
        title: '随机添加点位',
        content: () => {
            return h(
                NInputNumber,
                {
                    defaultValue: inputValue,
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
                        h('li', { style: 'margin-bottom: 5px' }, '所有点位数据'),
                        h('li', { style: 'margin-bottom: 5px' }, '所有球员移动点数据'),
                        h('li', { style: 'margin-bottom: 5px' }, '所有轨迹配置')
                    ])
                ])
            },
            positiveText: '确认',
            negativeText: '取消',
            onPositiveClick: () => {
                // 清除点位和配置
                trajectoryPoints.value = []
                trajectoryConfigs.value = {}
                playerMoveConfigs.value = {}
                emit('clearPoints')
                matchStore.selectType(value)
                initPlayers(value)
                message.success('已切换比赛类型并清空所有数据')
            },
            onNegativeClick: () => {
                matchStore.selectType(previousType)
            }
        })
    } else {
        matchStore.selectType(value)
        initPlayers(value)
    }
    previousType = value
}

// 更新球员
function initPlayers(type) {
    console.log(type, '比赛类型')
    // 深拷贝初始位置配置
    playerPositions.value = JSON.parse(JSON.stringify(PLAYER_CONFIG.initialPositions[type]))
    console.log(playerPositions.value, 'playerPositions.value')
    updatePlayerMoveConfigs()
    emit('matchTypeChange', {
        type
    })
}

// 记录上一次的类型，用于取消时恢复
let previousType = 'NONE'

// 添加轨迹验证和自动调整函数
function validateAndAdjustTrajectories() {
    const points = trajectoryPoints.value
    if (points.length < 2) return
    let message = ''
    const NET_HEIGHT = 1.55  // 网高
    const MIN_CLEARANCE = 0.05  // 最小净空高度
    const MAX_ARC_HEIGHT = 100  // 最大弧度
    const ARC_HEIGHT_STEP = 0.01 // 弧度调整步长

    for (let i = 0; i < points.length - 1; i++) {
        const key = `P${i + 1}-P${i + 2}`
        const start = points[i]
        const end = points[i + 1]

        // 只检查需要过网的轨迹
        if (start.z * end.z < 0) {
            // 获取当前轨迹的配置
            const currentConfig = trajectoryConfigs.value[key]
            if (!currentConfig) continue // 如果没有配置，跳过这段轨迹

            // 计算网处的相对位置
            const netProgress = Math.abs(start.z) / Math.abs(end.z - start.z)
            const distance = Math.sqrt(
                Math.pow(end.x - start.x, 2) +
                Math.pow(end.z - start.z, 2)
            )

            // 计算网处高度的函数
            const calculateHeightAtNet = (arcHeight) => {
                const maxHeight = Math.max(start.y, end.y) + distance * arcHeight
                const baseNetY = start.y + (end.y - start.y) * netProgress
                return baseNetY + Math.sin(Math.PI * netProgress) *
                    (maxHeight - Math.max(start.y, end.y))
            }

            // 使用配置中的弧度计算
            const currentHeight = calculateHeightAtNet(currentConfig.arcHeight)

            // 只有当当前弧度无法满足过网要求时才调整
            if (currentHeight < NET_HEIGHT + MIN_CLEARANCE) {
                let arcHeight = currentConfig.arcHeight
                let heightAtNet = currentHeight

                // 逐步增加弧度直到满足要求
                while (heightAtNet < NET_HEIGHT + MIN_CLEARANCE && arcHeight < MAX_ARC_HEIGHT) {
                    arcHeight += ARC_HEIGHT_STEP
                    heightAtNet = calculateHeightAtNet(arcHeight)
                }

                // 更新配置
                trajectoryConfigs.value[key] = {
                    ...currentConfig,
                    arcHeight: Number(arcHeight.toFixed(2))  // 保留2位小数
                }

                // 生成调整信息
                if (arcHeight >= MAX_ARC_HEIGHT && heightAtNet < NET_HEIGHT + MIN_CLEARANCE) {
                    message += `警告：轨迹 ${key} 即使在最大弧度下也无法达到理想过网高度。\n`
                        + `当前网处高度: ${heightAtNet.toFixed(2)}米，需要高度: ${(NET_HEIGHT + MIN_CLEARANCE).toFixed(2)}米\n`
                } else {
                    message += `轨迹 ${key} 弧度已从 ${currentConfig.arcHeight.toFixed(2)} 调整为 ${arcHeight.toFixed(2)}，`
                        + `网处高度: ${heightAtNet.toFixed(2)}米，`
                        + `超过网: ${(heightAtNet - NET_HEIGHT).toFixed(2)}米\n`
                }
            }
        }
    }

    if (message) {
        throw new Error(message)
    }
}

// 修改 watch 函数，添加轨迹验证
watch(
    trajectoryPoints,
    (newPoints) => {
        console.log('CourtSettings: trajectoryPoints changed')
        if (isPreviewMode.value) {
            const nonEmptyPoints = newPoints.filter(p =>
                p.x !== null && p.y !== null && p.z !== null
            )
            emit('previewPoints', nonEmptyPoints)
        }
        updateTrajectoryConfigs()
        updatePlayerMoveConfigs()
    },
    {
        deep: true,
        immediate: true
    }
)




// 创建一个计算属性，返回配置的字符串表示
const playerMoveConfigsString = computed(() =>
    JSON.stringify(playerMoveConfigs.value)
)

// 监听字符串的变化
watch(
    playerMoveConfigsString,
    (newConfigString, oldConfigString) => {
        // 将字符串解析回对象
        const newConfigs = JSON.parse(newConfigString);
        const oldConfigs = JSON.parse(oldConfigString);

        console.log('New configs:', newConfigs);
        console.log('Old configs:', oldConfigs);

        if (showMovePoints.value && oldConfigs) {
            const changedPoints = findChangedPoints(newConfigs, oldConfigs);
            console.log('Changed points:', changedPoints);
            if (changedPoints) {
                emit('movePointsUpdate', changedPoints);
            }
        }
    }
);

// 添加查找变化坐标的函数
function findChangedPoints(newConfigs, oldConfigs) {
    for (const key in newConfigs) {
        console.log(key, 'key')
        const newConfig = newConfigs[key]
        const oldConfig = oldConfigs[key]

        // 检查击球点变化
        if (hasPointChanged(newConfig.hitterStandPoint, oldConfig?.hitterStandPoint)) {
            return {
                from: oldConfig.hitterStandPoint,
                to: newConfig.hitterStandPoint
            }
        }

        // 检查回退点变化
        if (hasPointChanged(newConfig.hitterReturnPoint, oldConfig?.hitterReturnPoint)) {
            return {
                from: oldConfig.hitterReturnPoint,
                to: newConfig.hitterReturnPoint
            }
        }

        // 检查伙伴站位点变化
        if (hasPointChanged(newConfig.partnerStandPoint, oldConfig?.partnerStandPoint)) {
            return {
                from: oldConfig.partnerStandPoint,
                to: newConfig.partnerStandPoint
            }
        }

        // 检查伙伴回退点变化
        if (hasPointChanged(newConfig.partnerReturnPoint, oldConfig?.partnerReturnPoint)) {
            return {
                from: oldConfig.partnerReturnPoint,
                to: newConfig.partnerReturnPoint
            }
        }
    }
    return null
}

// 辅助函数：检查点位是否发生变化
function hasPointChanged(newPoint, oldPoint) {
    if (!newPoint || !oldPoint) return false
    console.log(newPoint, oldPoint, 'newPoint, oldPoint')
    return newPoint.x !== oldPoint.x || newPoint.z !== oldPoint.z
}

//监听playerPositions 来更新球员的位置
watch(playerPositions, (newPositions) => {
    console.log('CourtSettings: playerPositions changed:', newPositions)
    emit('updatePlayerPositions', newPositions)
}, { deep: true, immediate: true })






// 添加颜色选择处理函数
function handleColorSelect(color) {
    courtStore.selectColor(color)
    message.success('球场颜色已更新')
}



// 处理移动点显示状态变化
function handleMovePointsVisibilityChange(value) {
    emit('updateReturnPointsVisibility', value)
}

// 计算是否是双打
const isDoubles = computed(() => matchStore.selectedType === 'doubles')

// 计算当前显示的球员数量
const playerCount = computed(() => {
    if (matchStore.selectedType === 'NONE') return 0
    return isDoubles.value ? 4 : 2
})



const railStyle = ({
    focused,
    checked
}) => {
    const style = {};
    if (checked) {
        style.background = "#4CAF50";
        if (focused) {
            style.boxShadow = "0 0 0 2px #4CAF50";
        }
    } else {
        style.background = "#808080";
        if (focused) {
            style.boxShadow = "0 0 0 2px #80808040";
        }
    }
    return style;
}

// 监听 showMovePoints 的变化
watch(showMovePoints, (newValue) => {
    if (newValue) {
        emit('movePointsUpdate', playerMoveConfigs.value)
    } else {
        emit('movePointsUpdate', {})  // 传空对象来清除光圈
    }
})

// 暴给父件的方法
defineExpose({
    handlePlayComplete,
    handlePointSelected
})

// 添加数据管理相关函数
function handleExportData() {
    try {
        const exportData = {
            version: '1.0',
            matchType: matchStore.selectedType,
            trajectoryPoints: trajectoryPoints.value,
            trajectoryConfigs: trajectoryConfigs.value,
            playerPositions: playerPositions.value,
            playerMoveConfigs: playerMoveConfigs.value
        }

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `court-data-${new Date().toISOString().slice(0, 10)}.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        message.success('数据导出成功')
    } catch (error) {
        message.error('数据导出失败：' + error.message)
    }
}

function handleImportData() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (event) => {
        const file = event.target.files[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (e) => {
            try {
                importDataFromJson(e.target.result)
            } catch (error) {
                message.error('数据导入失败：' + error.message)
            }
        }
        reader.readAsText(file)
    }
    input.click()
}

function importDataFromJson(jsonString) {
    const data = JSON.parse(jsonString)

    // 验证数据版本和格式
    if (!data.version || !data.matchType) {
        throw new Error('无效的数据格式')
    }

    // 先设置比赛类型并初始化球员
    matchStore.selectType(data.matchType)
    initPlayers(data.matchType)

    // 导入数据
    trajectoryPoints.value = data.trajectoryPoints || []
    trajectoryConfigs.value = data.trajectoryConfigs || {}

    // 确保在设置球员位置之前已经初始化了默认位置
    if (data.playerPositions) {
        // 合并导入的球员位置与默认位置
        playerPositions.value = {
            ...PLAYER_CONFIG.initialPositions[data.matchType],
            ...data.playerPositions
        }
    }

    playerMoveConfigs.value = data.playerMoveConfigs || {}

    // 更新预览
    if (isPreviewMode.value) {
        emit('previewPoints', trajectoryPoints.value)
    }

    // 确保更新球员位置
    emit('updatePlayerPositions', playerPositions.value)
}



</script>

<style scoped>
/* 方法 1: 直接隐藏滚动条 */
.hide-scrollbar::-webkit-scrollbar {
    display: none;
}

/* 方法 2: 更好的跨浏览器兼容性 */
.hide-scrollbar {
    -ms-overflow-style: none;
    /* IE and Edge */
    scrollbar-width: none;
    /* Firefox */
}

.hide-scrollbar::-webkit-scrollbar {
    display: none;
    /* Chrome, Safari and Opera */
}
</style>