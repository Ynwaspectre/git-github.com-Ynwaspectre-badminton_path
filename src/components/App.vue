<template>
    <LoadingScreen />
    <div v-show="!assetsStore.loading">
        <!-- 你的应用内容 -->
    </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAssetsStore } from '../stores/assets'
import LoadingScreen from './LoadingScreen.vue'

const assetsStore = useAssetsStore()
console.log('加载角色资源') 
onMounted(async () => {
    console.log('加载动画资源')
    await assetsStore.loadAssets()
})
</script> 