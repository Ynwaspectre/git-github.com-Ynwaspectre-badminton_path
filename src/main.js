import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import 'uno.css'
import './style.css'

// 创建应用实例
const app = createApp(App)

// 使用 Pinia
app.use(createPinia())

// 挂载应用
app.mount('#app') 