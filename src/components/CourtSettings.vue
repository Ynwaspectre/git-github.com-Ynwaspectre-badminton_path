<template>
  <n-scrollbar class="h-full p-4">
    <!-- 球场颜色设置 -->
    <n-card title="球场颜色" class="mb-4" size="small">
      <n-grid :cols="4" :x-gap="12" :y-gap="12">
        <n-grid-item v-for="color in courtStore.courtColors" :key="color.value">
          <div 
            class="cursor-pointer rounded-lg p-2 transition-all"
            :class="{ 'border-2 border-blue-500': courtStore.selectedColor === color.value }"
            @click="courtStore.selectColor(color.value)"
          >
            <div 
              class="w-full h-6 rounded mb-1"
              :style="{ backgroundColor: color.hex }"
            ></div>
            <div class="text-center text-sm">{{ color.name }}</div>
          </div>
        </n-grid-item>
      </n-grid>
    </n-card>

    <!-- 比赛类型选择 -->
    <n-card title="比赛类型" class="mb-4" size="small">
      <n-space vertical>
        <n-radio-group v-model:value="courtStore.selectedType" name="type">
          <n-space>
            <n-radio 
              v-for="type in courtStore.courtTypes" 
              :key="type.value"
              :value="type.value"
            >
              {{ type.name }}
            </n-radio>
          </n-space>
        </n-radio-group>
      </n-space>
    </n-card>

    <!-- 轨迹编辑器 -->
    <n-card title="轨迹编辑" class="mb-4" size="small">
      <template #header-extra>
        <n-space>
          <n-space align="center">
            <span>路线设计</span>
            <n-switch
              v-model:value="isCollecting"
              @update:value="handleDesignModeChange"
              :rail-style="railStyle"
            />
          </n-space>
          <n-tooltip trigger="hover">
              <template #trigger>
                <n-button text type="info">
                  <template #icon>
                    <n-icon><InformationCircle /></n-icon>
                  </template>
                </n-button>
              </template>
              <div class="text-sm">
                X: 场地左右位置 (-3.05m ~ 3.05m)<br>
                Z: 场地前后位置 (-6.7m ~ 6.7m)<br>
                Y: 高度 (0m ~ 3.2m)
              </div>
            </n-tooltip>
        </n-space>
      </template>

      <!-- 采集模式下的高度调整 -->
      <n-collapse-transition :show="isCollecting">
        <div class="mb-4">
          <n-alert type="info" class="mb-2">
            点击场地添加点位，当前点位高度：{{ currentHeight }}米
          </n-alert>
          <n-slider
            v-model:value="currentHeight"
            :min="0.5"
            :max="3.2"
            :step="0.1"
          />
          
        
        </div>
      </n-collapse-transition>

      <!-- 点位列表 -->
      <div class="mb-4">
        <div class="flex items-center justify-between mb-2">
          <div class="font-medium">点位列表</div>
        </div>
        <div class="space-y-2">
          <n-grid :cols="24" :x-gap="8">
            <n-grid-item :span="2">
              <div class="text-right text-gray-500"></div>
            </n-grid-item>
            <n-grid-item :span="22">
              <n-input-group>
                <n-grid :cols="3" :x-gap="8">
                  <n-grid-item>
                  
                      <n-tooltip trigger="hover">
                        <template #trigger>
                          <div class="text-xs text-gray-500 mb-1 cursor-pointer text-center">左右位置X</div>
                        </template>
                        <span>范围: -3.05m ~ 3.05m</span>
                      </n-tooltip>
                    
                  </n-grid-item>
                  <n-grid-item>
                   
                      <n-tooltip trigger="hover">
                        <template #trigger>
                          <div class="text-xs text-gray-500 mb-1 cursor-pointer text-center">前后位置Z</div>
                        </template>
                        <span>范围: -6.7m ~ 6.7m</span>
                      </n-tooltip>
                    
                  </n-grid-item>
                  <n-grid-item>
                    
                      <n-tooltip trigger="hover">
                        <template #trigger>
                          <div class="text-xs text-gray-500 mb-1 cursor-pointer text-center">高度Y</div>
                        </template>
                        <span>范围: 0m ~ 3.2m</span>
                      </n-tooltip>
                   
                  </n-grid-item>
                </n-grid>
              </n-input-group>
            </n-grid-item>
          </n-grid>

          <div v-for="(point, index) in trajectoryPoints" :key="index">
            <n-grid :cols="24" :x-gap="8" class="items-center">
              <n-grid-item :span="2">
                <div class="text-right text-gray-500">{{ index + 1 }}.</div>
              </n-grid-item>
              <n-grid-item :span="20">
                <n-input-group>
                  <n-grid :cols="3" :x-gap="8">
                    <n-grid-item>
                      <n-input-number
                        v-model:value="point.x"
                        :placeholder="`X${index + 1}`"
                        :step="0.1"
                        size="small"
                        class="!w-full"
                        :min="-3.05"
                        :max="3.05"
                      />
                    </n-grid-item>
                    <n-grid-item>
                      <n-input-number
                        v-model:value="point.z"
                        :placeholder="`Z${index + 1}`"
                        :step="0.1"
                        size="small"
                        class="!w-full"
                        :min="-6.7"
                        :max="6.7"
                      />
                    </n-grid-item>
                    <n-grid-item>
                      <n-input-number
                        v-model:value="point.y"
                        :placeholder="`Y${index + 1}`"
                        :step="0.1"
                        size="small"
                        class="!w-full"
                        :min="0"
                        :max="3.2"
                      />
                    </n-grid-item>
                  </n-grid>
                </n-input-group>
              </n-grid-item>
              <n-grid-item :span="2">
                <n-button
                  circle
                  secondary
                  size="small"
                  class="hover:text-red-500 text-gray-400"
                  @click="removePoint(index)"
                >
                  <template #icon>
                    <n-icon>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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

      <!-- 操作按钮 -->
      <n-space class="mt-4">
        <n-button
          secondary
          type="success"
          @click="playTrajectory"
          :disabled="isPlaying"
        >
          播放轨迹
        </n-button>
        <n-button
          secondary
          type="error"
          @click="clearPoints"
        >
          清除
        </n-button>
      </n-space>

      <!-- 轨迹显示选项 -->
      <n-space align="center" class="mt-4">
        <n-space align="center">
          <span>预览点位</span>
          <n-switch
            v-model:value="isPreviewMode"
            @update:value="handlePreviewChange"
          />
        </n-space>
        <n-space align="center">
          <span>显示轨迹</span>
          <n-switch
            v-model:value="showTrajectory"
            @update:value="handleTrajectoryVisibilityChange"
          />
        </n-space>
      </n-space>

      <!-- 错误提示 -->
      <n-alert
        v-if="errorMessage"
        type="error"
        class="mt-4"
      >
        {{ errorMessage }}
      </n-alert>
    </n-card>
  </n-scrollbar>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useCourtStore } from '../stores/court'
import {
  NScrollbar,
  NCard,
  NGrid,
  NGridItem,
  NButton,
  NSpace,
  NCollapseTransition,
  NAlert,
  NSlider,
  NDescriptions,
  NDescriptionsItem,
  NInputGroup,
  NInputNumber,
  NIcon,
  NCheckbox,
  NRadioGroup,
  NRadio,
  useDialog,
  useMessage,
  NSwitch,
  NTooltip
} from 'naive-ui'
import { Close, InformationCircle } from '@vicons/ionicons5'

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
const errorMessage = ref('')
const showTrajectory = ref(true)
const isPlaying = ref(false)
const isPreviewMode = ref(true)  // 默认开启预览
const isCollecting = ref(false)
const currentHeight = ref(1.7)
const currentPointIndex = ref(0)
const selectedPoint = ref(null)

// 场地范围限制
const COURT_LIMITS = {
  x: { min: -3.05, max: 3.05 }, // 双打场地宽度范围 (6.10米)
  y: { min: 0, max: 3.2 },     // 高度限制
  z: { min: -6.7, max: 6.7 }   // 场地长度范围
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
function generateRandomPoints() {
  const newPoints = []
  // 确保第一个点在后场
  const firstHalf = 'back'
  
  for (let i = 0; i < 10; i++) {
    let point
    
    if (i === 0) {
      // 第一个点：必须在后场，高度在击球范围内
      point = {
        x: randomInRange(COURT_LIMITS.x.min, COURT_LIMITS.x.max),
        y: randomInRange(1.5, 1.8),  // 击球高度范围
        z: randomInRange(0.1, 6.7)    // 后场范围
      }
    } else {
      // 其他点：必须和前一个点在不同半场
      const prevPoint = newPoints[i - 1]
      const currentHalf = prevPoint.z > 0 ? 'front' : 'back'
      
      point = {
        x: randomInRange(COURT_LIMITS.x.min, COURT_LIMITS.x.max),
        y: randomInRange(0.5, 3.2),  // 一般高度范围
        z: currentHalf === 'front'
          ? randomInRange(-6.7, -0.1)  // 前场
          : randomInRange(0.1, 6.7)    // 后场
      }
      
      // 确保过网高度
      if (Math.abs(point.z) < 1) {  // 接近网的位置
        point.y = Math.max(point.y, 1.6)  // 确保过网
      }
    }
    
    // 验证点位是否合法
    if (!validatePoint(point)) {
      // 如果点位不合法，重新生成这个点
      i--
      continue
    }
    
    newPoints.push(point)
  }
  
  // 最后验证整体分布
  if (!validatePointsDistribution(newPoints)) {
    // 如果分布不合，重新生成所有点
    return generateRandomPoints()
  }
  
  trajectoryPoints.value = newPoints
}

// 生成范围内的随机数
function randomInRange(min, max) {
  return +(Math.random() * (max - min) + min).toFixed(2)
}

// 修改验证点位函数，添加更多具体的验证
function validatePoint(point) {
  if (!point || point.x === null || point.y === null || point.z === null) return false
  
  // 基本范围检查
  const inRange = point.x >= COURT_LIMITS.x.min && point.x <= COURT_LIMITS.x.max &&
                 point.y >= COURT_LIMITS.y.min && point.y <= COURT_LIMITS.y.max &&
                 point.z >= COURT_LIMITS.z.min && point.z <= COURT_LIMITS.z.max
  
  // 网区高度检查
  if (Math.abs(point.z) < 1) {  // 接近网区
    return inRange && point.y >= 1.6  // 必须高于网高
  }
  
  return inRange
}

// 修改验证点位分布函数，放宽第一个点的限制
function validatePointsDistribution(points) {
  if (points.length < 2) return true
  
  // 相邻点必须在不同半场
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
  }
}

function validatePoints() {
  // 只验证非空点位
  const nonEmptyPoints = trajectoryPoints.value.filter(p => 
    p.x !== null && p.y !== null && p.z !== null
  )
  
  if (nonEmptyPoints.length === 0) {
    message.error('请至少添加一个点位')
    return null
  }
  
  // 检查是否只有一个点
  if (nonEmptyPoints.length === 1) {
    message.warning('要至少两个点位才能播放轨迹')
    return null
  }
  
  // 验证所有点
  const invalidPoints = nonEmptyPoints.filter(p => !validatePoint(p))
  if (invalidPoints.length > 0) {
    message.error(`第${invalidPoints.map(p => trajectoryPoints.value.indexOf(p) + 1).join('、')}号点位超出场地范围！${invalidPoints.map(p => {
      const issues = [];
      if (Math.abs(p.x) > 3.05) issues.push('左右位置');
      if (Math.abs(p.z) > 6.7) issues.push('前后位置'); 
      if (p.y < 0 || p.y > 3.2) issues.push('高度');
      return `(${issues.join('、')}超出范围)`;
    }).join(' ')}`)
    return null
  }
  
  // 验证点位分布
  if (!validatePointsDistribution(nonEmptyPoints)) {
    message.error('每隔2个点必须在不同半场！')
    return null
  }
  
  errorMessage.value = ''
  return nonEmptyPoints
}

function playTrajectory() {
  const validPoints = validatePoints()
  if (validPoints) {
    isPlaying.value = true
    emit('playTrajectory', validPoints, showTrajectory.value)
    setTimeout(() => {
      isPlaying.value = false
    }, 5000)
  }
}

// 修改播放完成的处理函数
function handlePlayComplete() {
  isPlaying.value = false
}

// 暴露给父件的方法
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
      // 完全清空点位数组
      trajectoryPoints.value = []
      errorMessage.value = ''
      // 不改变预览模式
      emit('clearPoints')
    }
  })
}

function handleDesignModeChange(value) {
  if (value) {
    emit('startCollectingPoints')
  } else {
    emit('stopCollectingPoints')
    currentPointIndex.value = 0
  }
}

// 处理采集的点位
function handlePointSelected(point) {
  // 如果不在设计模式，直接返回
  if (!isCollecting.value) return
  
  // 先验证点位是否在场地范围内
  if (!validatePoint(point)) {
    message.error('选择的点位超出场地范围！')
    return
  }
  
  // 验证与上一个点位是否在不同半场
  if (currentPointIndex.value > 0) {
    const lastPoint = trajectoryPoints.value[currentPointIndex.value - 1]
    if (lastPoint && Math.sign(point.z) === Math.sign(lastPoint.z)) {
      message.error('新点位必须与上一个点位在不同半场！')
      return
    }
  }
  
  // 清除错误信息
  errorMessage.value = ''
  
  selectedPoint.value = {
    ...point,
    y: currentHeight.value
  }

  // 使用对话框确认点位
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
    // 如果当前索引超出范围，添加新的点位
    if (currentPointIndex.value >= trajectoryPoints.value.length) {
      trajectoryPoints.value.push(selectedPoint.value)
    } else {
      trajectoryPoints.value[currentPointIndex.value] = selectedPoint.value
    }
    currentPointIndex.value++
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
  () => {
    if (isPreviewMode.value) {
      const nonEmptyPoints = trajectoryPoints.value.filter(p => 
        p.x !== null && p.y !== null && p.z !== null
      )
      emit('previewPoints', nonEmptyPoints)
    }
  },
  { deep: true }  // 深度监听数组内部变化
)

// 添加轨迹显示变化处理函数
function handleTrajectoryVisibilityChange(value) {
  // 如果正在播放，实时更新轨迹显示状态
  if (isPlaying.value) {
    emit('playTrajectory', trajectoryPoints.value, value)
  }
}

// 添加 switch 样式
const railStyle = ({ focused, checked }) => {
  const style = {}
  if (checked) {
    style.background = '#d03050'  // 红色
  } else {
    style.background = '#909399'  // 灰色
  }
  return style
}
</script>

<style scoped>
.border-primary {
  border: 2px solid var(--primary-color);
}
</style>