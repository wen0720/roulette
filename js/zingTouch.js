import ZingTouch from 'zingtouch'

export default class roulette {
  constructor () {       
    const parentTouchArea = document.querySelector('.wrapper')
    const touchArea = document.querySelector('#roulette')
    const region = new ZingTouch.Region(parentTouchArea, false, true)
    const customRotate = new ZingTouch.Rotate() // 客製化手勢

    this.roulette = touchArea
    // 目前輪盤角度
    this.nowRotateDeg = 0
    // 上一次輪盤角度
    this.prevRotateDeg = null
    // 單次總共角距離
    this.distanceFromOriginPublic = 0
    // true 順時針 false 逆時針
    this.clockwise = null

    customRotate.start = (param) => {
      // 儲存前一次 deg
      this.prevRotateDeg = this.nowRotateDeg
    }

    customRotate.end = (param) => {
      this.getNowTransformDeg()
      console.log('now', this.nowRotateDeg, 'prev', this.prevRotateDeg)
      this.clockwise = this.nowRotateDeg > this.prevRotateDeg
      //   this.rotateEffect()

    //   if (this.clockwise) {
    //       // 順時針
    //       this.roulette.classList.add('rotate')
    //   }
    }

    region.bind(touchArea, customRotate, (e) => {      
      const distanceFromOrigin = Math.round(e.detail.distanceFromOrigin) // 距離初始點擊處的角距離
      this.roulette.setAttribute('style', `transform: rotate(${this.nowRotateDeg + distanceFromOrigin}deg)`)
      this.distanceFromOriginPublic = distanceFromOrigin
    })    
  }

  getNowTransformDeg () {
    const rotate = window.getComputedStyle(this.roulette, null).getPropertyValue('transform')
    if (rotate !== 'none') {
      this.nowRotateDeg = this.formatMatrixToDeg(rotate)
      console.log('拖曳結束角度', this.nowRotateDeg)
    }
  }

  formatMatrixToDeg (matrix) {
    let values = matrix.split('(')[1]
    values = values.split(')')[0]
    values = values.split(',')
    console.log(values)
    const a = values[0]
    const b = values[1]
    const c = values[2]
    const d = values[3]
    // var scale = Math.sqrt(a * a + b * b)

    // arc sin, convert from radians to degrees, round
    // DO NOT USE: see update below
    // var sin = b / scale
    var angle = Math.round(Math.asin(b) * (180 / Math.PI))
    console.log('sin', b, 'angle', angle)

    // const level = Math.ceil((this.nowRotateDeg + this.distanceFromOriginPublic) / 180) - 1

    // if (this.nowRotateDeg + this.distanceFromOriginPublic > (90 + 180 * level)) {
    //     angle = (180 + 360 * level) - angle
    // }

    if (this.nowRotateDeg + this.distanceFromOriginPublic > 90) {
      angle = 180 - angle
    }
    if (this.nowRotateDeg + this.distanceFromOriginPublic > 270) {
      angle = 540 - angle
    }
    return angle
  }

  fadeIn (el) {
    var opacity = 0

    el.style.opacity = 0
    el.style.filter = ''

    var last = +new Date()
    var tick = function () {
      opacity += (new Date() - last) / 400
      el.style.opacity = opacity

      last = +new Date()

      if (opacity < 1) {
        (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16)
      }
    }

    tick()
  }

  rotateEffect () {
    // 總共角距離，現在先當我的轉動距離
    this.distanceFromOriginPublic

    // 目前角度
    let startRotate = this.nowRotateDeg
    let hasRotate = 0
    let last = +new Date()
    const tick = () => {
      const controlRotate = (new Date() - last) * 2
      startRotate += controlRotate
      hasRotate += controlRotate
      this.roulette.setAttribute('style', `transform: rotate(${startRotate}deg)`)

      last = +new Date()
      if (hasRotate <= this.distanceFromOriginPublic * 10) {
        (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16)
      }
    }

    tick()
  }
}

// passive 為 true 則永不會調用 preventDefault
// 若我們調用了 preventDefault
// 則系統報錯 Unable to preventDefault inside passive event listener due to target being treated as passive
