<template>
  <LoadingScreen v-if="assetsStore.loading" />
  <div v-else>
    <n-dialog-provider>
      <n-message-provider>
        <div class="h-screen flex">
          <div class="w-7/12 h-full">
            <Court ref="courtRef" @pointSelected="handlePointSelected" @playComplete="handlePlayComplete" />
          </div>
          <div class="w-5/12">
            <CourtSettings ref="settingsRef" @previewPoints="handlePreviewPoints" @playTrajectory="handlePlayTrajectory"
              @clearPoints="handleClearPoints" @clearPreview="handleClearPreview"
              @startCollectingPoints="handleStartCollectingPoints" @stopCollectingPoints="handleStopCollectingPoints"
              @matchTypeChange="handleMatchTypeChange" @updatePlayerPositions="handleUpdatePlayerPositions"
              @movePointsUpdate="handleMovePointsUpdate" />
          </div>
        </div>
      </n-message-provider>
    </n-dialog-provider>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Court from './components/Court.vue'
import CourtSettings from './components/CourtSettings.vue'
import { NDialogProvider, NMessageProvider } from 'naive-ui'
import { useAssetsStore } from './stores/assets'
import LoadingScreen from './components/LoadingScreen.vue'

const assetsStore = useAssetsStore()
console.log('加载角色资源')
onMounted(async () => {
  console.log('加载动画资源')
  await assetsStore.loadAssets()
})

const courtRef = ref(null)
const settingsRef = ref(null)

function handlePreviewPoints(points) {
  courtRef.value?.previewPoints(points)
}

function handlePlayTrajectory({ points, trajectoryConfigs, playerMoveConfigs, showTrajectory }) {
  courtRef.value?.playTrajectory(points, trajectoryConfigs, playerMoveConfigs, showTrajectory)
}

function handleClearPoints() {
  courtRef.value?.clearPoints()
}

function handlePointSelected(point) {
  console.log('App: handlePointSelected called with point:', point)
  settingsRef.value?.handlePointSelected(point)
}

function handleStartCollectingPoints() {
  courtRef.value?.startCollectingPoints()
}

function handleStopCollectingPoints() {
  courtRef.value?.stopCollectingPoints()
}

function handleClearPreview() {
  courtRef.value?.clearPreview()
}

function handlePlayComplete() {
  settingsRef.value?.handlePlayComplete()
}

function handleMatchTypeChange(config) {
  courtRef.value?.updateMatchType(config)
}



function handleUpdatePlayerPositions(positions) {
  courtRef.value?.updatePlayerPositions(positions)
}

function handleMovePointsUpdate(moveConfigs) {
  courtRef.value?.updateMovePointsLightCircle(moveConfigs)
}
</script>