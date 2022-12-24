import { useStore } from '../stores/index'

export const useShowWhich = () => {
  const store = useStore()
  const subtitles = store.subtitles
  store.slider.isPlay = true
  const intervalID = setInterval(() => {
    store.timeInterval += 100
    subtitles.some((item, index) => {
      if (
        store.timeInterval >= item.start_time &&
        store.timeInterval <= item.end_time
      ) {
        store.showSubtitles = index
        return true
      } else if (
        store.timeInterval > item.end_time &&
        store.timeInterval < subtitles[index + 1].start_time
      ) {
        store.showSubtitles = 0
        store.subtitles[0].content = '...'
        return true
      }
    })
    if (
      store.timeInterval > subtitles[subtitles.length - 1].end_time ||
      store.slider.isPlay === false
    ) {
      clearInterval(intervalID)
    }
  }, 100)
}
