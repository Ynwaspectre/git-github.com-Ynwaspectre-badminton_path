<template>
  <div class="w-full h-screen bg-[#121212]">
    <div class="container mx-auto p-4">
      <h1 class="text-2xl font-bold mb-4 text-white">羽毛球球路设计器</h1>
      <div class="flex gap-4">
        <div class="w-[60%] bg-[#121212] rounded-lg shadow-lg">
          <Court />
        </div>
        <div class="w-[40%] bg-[#121212] rounded-lg shadow-lg p-4">
          <div class="mb-4">
            <h2 class="text-xl font-bold mb-2 text-white">控制面板</h2>
            <!-- 添加控制按钮和选项 -->
          </div>
          <div class="mb-4">
            <h2 class="text-xl font-bold mb-2 text-white">已保存的球路</h2>
            <!-- 显示已保存的球路列表 -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Court from './components/Court.vue'
</script> 