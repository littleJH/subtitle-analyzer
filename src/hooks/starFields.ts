export const useStarField = () => {
  const canvas = document.getElementById('starField') as HTMLCanvasElement
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  let context = canvas.getContext('2d') as CanvasRenderingContext2D
  let stars = Array()
  let stars_count = 3000

  function init() {
    context = canvas.getContext('2d') as CanvasRenderingContext2D
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    stars = Array()
    stars_count = 3000
    clearInterval(intervalID)
  }
  function makeStars() {
    for (let i = 0; i < stars_count; i++) {
      const x = Math.random() * canvas.offsetWidth
      const y = Math.random() * canvas.offsetHeight
      const radius = Math.random()
      const color =
        'rgba(' +
        Math.random() * 255 +
        ',' +
        Math.random() * 255 +
        ',' +
        Math.random() * 255 +
        ',0.8)'
      const speed = Math.random() * 0.5
      const arr = { x: x, y: y, radius: radius, color: color, speed: speed }
      stars.push(arr)
    }
  }

  function drawStars() {
    context.fillStyle = '#0e1729'
    context.fillRect(0, 0, canvas.width, canvas.height)
    for (let i = 0; i < stars.length; i++) {
      let x = stars[i]['x'] - stars[i]['speed']
      if (x < -2 * stars[i]['radius']) x = canvas.width
      stars[i]['x'] = x
      const y = stars[i]['y']
      const radius = stars[i]['radius']
      context.beginPath()
      context.arc(x, y, radius, 0, 2 * Math.PI)
      context.fillStyle =
        'rgba(' +
        Math.random() * 255 +
        ',' +
        Math.random() * 255 +
        ',' +
        Math.random() * 255 +
        ',0.8)'
      context.fill()
    }
  }

  let intervalID = setInterval(() => drawStars(), 50)
  makeStars()
  window.onresize = function () {
    //窗口大小发生变化时重新随机生成星星数据
    init()
    makeStars()
    intervalID = setInterval(function () {
      drawStars()
    }, 50)
  }
}
