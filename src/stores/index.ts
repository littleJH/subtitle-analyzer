import { defineStore } from 'pinia'
import { upload } from '../api/upload'
import { reactive, ref, Ref } from 'vue'
import { useShowWhich } from '../hooks/showWhich'
import moment from 'moment'
import { ElNotification } from 'element-plus'

export const useStore = defineStore('store1', {
  state: () => {
    return {
      errors: reactive([]),
      warnings: reactive([]),
      subtitles: reactive([
        {
          id: -1,
          start_time: 0,
          end_time: 0,
          content: '请在上方上传字幕文件...'
        }
      ]),
      timeInterval: ref(0),
      showSubtitles: 0,
      slider: reactive({
        min: 0,
        max: 0,
        isPlay: false
      })
    }
  },
  getters: {
    currentTime(state) {
      return {
        second: moment.duration(state.timeInterval).seconds(),
        minute: moment.duration(state.timeInterval).minutes(),
        hour: moment.duration(state.timeInterval).hours()
      }
    },
    maxTime(state) {
      return {
        second: moment.duration(state.slider.max).seconds(),
        minute: moment.duration(state.slider.max).minutes(),
        hour: moment.duration(state.slider.max).hours()
      }
    }
  },
  actions: {
    uploadFile(file: any, text: string) {
      const formData = new FormData()
      formData.append('file', text === '上传' ? file.raw : file)
      upload(formData)
        .then(res => {
          ElNotification({
            title: 'Success',
            message: `文件${text}成功！`,
            type: 'success',
            position: 'top-left'
          })

          this.errors = res.data.data.errors
          this.subtitles.push(...res.data.data.subtitles)
          this.warnings = res.data.data.warnings
          this.slider.max =
            res.data.data.subtitles[res.data.data.subtitles.length - 1].end_time
          useShowWhich()
          this.subtitles.shift()
          if (this.warnings.length !== 0) {
            setTimeout(() => {
              this.warnings.forEach(item => {
                ElNotification({
                  title: 'Warning',
                  message: item,
                  type: 'warning',
                  duration: 10000,
                  position: 'top-left'
                })
              })
            }, 1000)
          }
          if (this.errors.length !== 0) {
            setTimeout(() => {
              this.errors.forEach(item => {
                ElNotification({
                  title: 'Error',
                  message: item,
                  type: 'error',
                  duration: 10000,
                  position: 'top-left'
                })
              })
            }, 2000)
          }
        })
        .catch(err => {
          console.log(err)
        })
    }
  }
})
