<template>
  <n-dialog-provider>
    <n-message-provider>
      <div class="h-screen flex">
        <div class="w-1/2 h-full">
          <Court 
            ref="courtRef"
            @pointSelected="handlePointSelected"
            @playComplete="handlePlayComplete"
          />
        </div>
        <div class="w-1/2">
          <CourtSettings 
            ref="settingsRef"
            @previewPoints="handlePreviewPoints"
            @playTrajectory="handlePlayTrajectory"
            @clearPoints="handleClearPoints"
            @clearPreview="handleClearPreview"
            @startCollectingPoints="handleStartCollectingPoints"
            @stopCollectingPoints="handleStopCollectingPoints"
            @matchTypeChange="handleMatchTypeChange"
            @playerMoveToPoint="handlePlayerMoveToPoint"
            @updatePlayerPositions="handleUpdatePlayerPositions"
          />
        </div>
      </div>
    </n-message-provider>
  </n-dialog-provider>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Court from './components/Court.vue'
import CourtSettings from './components/CourtSettings.vue'
import { NDialogProvider, NMessageProvider } from 'naive-ui'

const courtRef = ref(null)
const settingsRef = ref(null)

function handlePreviewPoints(points) {
  courtRef.value?.previewPoints(points)
}

function handlePlayTrajectory({points, trajectoryConfigs,playerMoveConfigs,showTrajectory}) {
  courtRef.value?.playTrajectory(points, trajectoryConfigs,playerMoveConfigs,showTrajectory)
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

function handlePlayerMoveToPoint(point) {
  console.log('App: handlePlayerMoveToPoint called with point:', point)
  courtRef.value?.movePlayerToPoint(point)
}

function handleUpdatePlayerPositions(positions) {
  courtRef.value?.updatePlayerPositions(positions)
}
</script> 