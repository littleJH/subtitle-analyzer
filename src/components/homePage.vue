<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { UploadFilled } from '@element-plus/icons-vue'
import Subtitles from './subtitles.vue'
import { useStore } from '../stores/index'
import { useShowWhich } from '../hooks/showWhich'
import playPng from '../assets/24gf-play.png'
import pausePng from '../assets/24gf-pause2.png'
import setting from '../assets/setting-fill.png'
import { useStarField } from '../hooks/starFields'
import moment from 'moment'
import Drawers from '../components/drawer.vue'
import { ElNotification } from 'element-plus'

const store = useStore()
const notAllow = ref('none')
const visibilityBinding = ref<boolean>(false)
const commandText = ref<string>('')
document.addEventListener('keydown', e => {
  if (e.key == ' ' && notAllow.value === 'fill') {
    store.slider.isPlay === false ? play() : pause()
  }
})
const upload = (file: any) => {
  store.uploadFile(file, '上传')
  notAllow.value = 'fill'
}

const sliderChange = (val: number) => {
  store.timeInterval = val
}

const play = () => {
  if (notAllow.value === 'fill') {
    store.slider.isPlay = true
    useShowWhich()
  } else {
    ElNotification({
      title: 'Warning',
      message: '请先上传字幕文件',
      type: 'warning',
      position: 'top-left'
    })
  }
}
const pause = () => {
  store.slider.isPlay = false
}

// const openDrawer = (command: string) => {
//   visibilityBinding.value = true
//   command === 'content'
//     ? (commandText.value = '内容')
//     : (commandText.value = '时间')
//   console.log(visibilityBinding.value)
// }
// const handleCommand = (command: string) => {
//   console.log(command)
//   openDrawer(command)
// }
const openDrawer = () => {
  if (notAllow.value === 'fill') {
    visibilityBinding.value = true
  } else {
    ElNotification({
      title: 'Warning',
      message: '请先上传字幕文件',
      type: 'warning',
      position: 'top-left'
    })
  }
}
const closeDrawer = () => {
  visibilityBinding.value = false
}

onMounted(() => {
  useStarField()
})

const format = (value: number) => {
  if (value < 60 * 1000) {
    return `00:${moment.duration(value).seconds()}`
  } else if (value >= 60 * 1000 && value < 60 * 60 * 1000) {
    return `${moment.duration(value).minutes()}:${moment
      .duration(value)
      .seconds()}`
  } else if (value >= 60 * 60 * 24 * 1000) {
    return `${moment.duration(value).hours()}:${moment
      .duration(value)
      .minutes()}:${moment.duration(value).seconds()}`
  }
}
</script>
<template>
  <canvas id="starField"></canvas>
  <div class="box">
    <div class="header">
      <el-upload
        drag
        action="none"
        :show-file-list="false"
        :auto-upload="false"
        :on-change="upload"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      </el-upload>
    </div>
    <div class="box-body">
      <Subtitles></Subtitles>
    </div>
    <div class="footer">
      <div class="imgs">
        <img :src="playPng" v-if="!store.slider.isPlay" @click="play" />
        <img :src="pausePng" v-if="store.slider.isPlay" @click="pause" />
      </div>
      <div class="slider">
        <el-slider
          v-model="store.timeInterval"
          :min="store.slider.min"
          :max="store.slider.max"
          :step="100"
          size="small"
          :format-tooltip="format"
          @input="sliderChange"
        />
      </div>

      <div class="setting">
        <!-- <el-dropdown placement="top" @command="handleCommand">
          <span>
            <img :src="setting" />
          </span>
          <template #dropdown>
            <el-dropdown-menu class="el_dropdown_menu">
              <el-dropdown-item command="content">修改字幕</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown> -->
        <el-tooltip placement="top" content="修改字幕">
          <span @click="openDrawer">
            <img :src="setting" />
          </span>
        </el-tooltip>
      </div>
      <p>
        {{
          `${store.currentTime.hour}:${store.currentTime.minute}:${store.currentTime.second} / ${store.maxTime.hour}:${store.maxTime.minute}:${store.maxTime.second}`
        }}
      </p>
    </div>
  </div>
  <el-drawer
    v-model="visibilityBinding"
    :title="`修改字幕${commandText}`"
    direction="rtl"
    size="66%"
    :modal="false"
    @closed="closeDrawer"
  >
    <!-- <template :is="commandText"></template> -->
    <Drawers @cancelDrawer="closeDrawer"></Drawers>
  </el-drawer>
</template>
<style scoped lang="less">
canvas {
  position: fixed;
  top: 0;
  left: 0;
  z-index: -1;
}
.box {
  height: 80%;
  width: 80%;
  display: flex;
  flex-direction: column;
  .header {
    width: 100%;
    /deep/.el-upload-dragger {
      background-color: rgba(0, 0, 0, 0);
      padding: 0;
      margin: 0;
    }
  }
  .box-body {
    flex: 1;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px dashed #fff;
    border-radius: 4px;
    box-sizing: border-box;
  }
  .footer {
    width: 100%;
    height: 40px;
    display: flex;
    align-items: center;
    border: 1px dashed #fff;
    border-radius: 4px;
    box-sizing: border-box;
    color: #fff;
    .imgs {
      width: auto;
      padding: 0 10px;
    }
    .slider {
      flex: 1;
      padding: 0 10px;
    }
    .setting {
      width: auto;
      padding: 0 10px;
    }
    p {
      width: auto;
      padding: 0 10px;
      text-align: center;
    }
    img {
      width: 20px;
      height: 20px;
    }

    img:hover {
      cursor: pointer;
      pointer-events: v-bind(notAllow);
    }
    .dark {
      background-color: black;
    }
  }
}
</style>
