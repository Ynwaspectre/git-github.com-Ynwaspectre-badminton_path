<template>
    <div v-if="assetsStore.loading" class="loading-screen">
        <div class="loading-content">
            <div class="loading-spinner"></div>
            <div class="loading-progress">
                {{ Math.round(assetsStore.progress) }}%
            </div>
            <div v-if="assetsStore.error" class="loading-error">
                {{ assetsStore.error }}
            </div>
        </div>
    </div>
</template>

<script setup>
import { useAssetsStore } from '../stores/assets'

const assetsStore = useAssetsStore()
</script>

<style scoped>
.loading-screen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: #1a1a1a;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
}

.loading-content {
    text-align: center;
    color: white;
}

.loading-spinner {
    width: 50px;
    height: 50px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 20px;
}

.loading-progress {
    font-size: 24px;
    margin-bottom: 10px;
}

.loading-error {
    color: #ff4444;
    margin-top: 10px;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
</style> 