<template>
    <div v-if="assetsStore.loading" class="loading-screen">
        <div class="loading-content">
            <div class="loading-spinner"></div>
            <div class="loading-text">资源加载中...</div>
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
    background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
}

.loading-content {
    text-align: center;
    color: white;
    padding: 2rem;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.loading-spinner {
    width: 60px;
    height: 60px;
    border: 4px solid rgba(255, 255, 255, 0.1);
    border-top: 4px solid #4CAF50;
    border-radius: 50%;
    animation: spin 0.8s ease-in-out infinite;
    margin: 0 auto 24px;
}

.loading-progress {
    font-size: 28px;
    font-weight: 600;
    margin-bottom: 12px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.loading-error {
    color: #ff6b6b;
    margin-top: 12px;
    padding: 8px 16px;
    background: rgba(255, 107, 107, 0.1);
    border-radius: 6px;
    font-size: 14px;
}

.loading-text {
    font-size: 18px;
    color: #ffffff;
    margin-bottom: 8px;
    opacity: 0.9;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
</style> 