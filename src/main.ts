import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import elementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import { createPinia } from 'pinia'
import { FcWaveFilter } from 'fancy-components'
import moment from 'moment'
import 'animate.css'

const app = createApp(App)
const pinia = createPinia()
new FcWaveFilter()

app.use(elementPlus)
app.use(pinia)
app.use
app.config.globalProperties.$moment = moment
app.config.compilerOptions.isCustomElement = tag => {
  return tag.startsWith('fc-')
}
app.mount('#app')
