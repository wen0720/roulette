import $ from 'jquery'

export default class touchJS {
  constructor () {
    this.onGoingTouch = [] // 同時間，所有觸控點軌跡紀錄
    this.finalPos = [] // 完成一次觸控後，起始點、中間點、結束點位置
    this.RouletteCenter = this.getRoulettePos().center // 輪盤中心位置
    this.$roulette = $('#roulette')
    this.$roulette__plate = $('#roulette__plate')
    this.totalAngle = 0 // 輪盤的總轉移角度

    $('.wrapper').on('touchstart', '#roulette__plate', null, (e) => {
      this.handleTouchStart(e)
    })

    $('.wrapper').on('touchmove', '#roulette__plate', null, (e) => {
      this.handleTouchMove(e)
    })

    $('.wrapper').on('touchend', '#roulette__plate', null, (e) => {
      this.handleTouchEnd(e)
    })

    // $('body').on('touchstart', (e) => {
    //   alert(this.boundaryRecord)
    // })
  }

  handleTouchStart (e) {
    e.preventDefault()
    e.stopPropagation()
    const touches = e.changedTouches
    for (let i = 0; i < touches.length; i++) {
      // 目前所在象限
      const quadrant = this.detectQuadrant(touches[i])
      // for 迴圈針對可能有多個觸控點
      const info = {
        // 單一 touch 軌跡資訊
        identifier: touches[i].identifier,
        start: this.copyTouch(touches[i]),
        move: [this.copyTouch(touches[i])],
        quadrant: [quadrant],
        end: {}
      }
      this.onGoingTouch.push(info)
    }
  }

  handleTouchMove (e) {
    e.preventDefault()
    e.stopPropagation()
    const touches = e.changedTouches
    // console.log(touches[0])

    for (let i = 0; i < touches.length; i++) {
      const idxInOngoingTouch = this.findOngoingTouchById(touches.identifier)[0].idx
      if (idxInOngoingTouch < 0) return

      // 目前所在象限
      const quadrant = this.detectQuadrant(touches[i])
      // 將 move 的資訊加入，形成軌跡紀錄
      this.onGoingTouch[idxInOngoingTouch].move.push(this.copyTouch(touches[i]))
      this.onGoingTouch[idxInOngoingTouch].quadrant.push(quadrant)
      // 計算
      // console.log(this.onGoingTouch[idxInOngoingTouch].move.length)
    }
    console.log(touches[0])
  }

  handleTouchEnd (e) {
    e.preventDefault()
    const touches = e.changedTouches
    for (let i = 0; i < touches.length; i++) {
      const idxInOngoingTouch = this.findOngoingTouchById(touches.identifier)[0].idx
      this.onGoingTouch[idxInOngoingTouch].end = this.copyTouch(touches[i])

      const HalfMoveLen = Math.floor(this.onGoingTouch[idxInOngoingTouch].move.length / 2)
      const pos = {
        start: this.onGoingTouch[idxInOngoingTouch].start,
        center: this.onGoingTouch[idxInOngoingTouch].move[HalfMoveLen],
        end: this.copyTouch(touches[i])
      }

      this.finalPos.push(pos)

      // 需判斷 - 如果手指都拿掉了
      // 取得角度，轉動輪盤
      let angle = this.getAngle()      
      // 取得經過的象限紀錄
      this.quadrantRecord = this.filterSameValueInArray(this.onGoingTouch[idxInOngoingTouch].quadrant)

      if (this.quadrantRecord.length > 1) {
        // 計算順逆時針（如果跨越2象限）
        this.clockwise = this.detectClockwiseAcrossQuadrant(this.quadrantRecord)
      } else {
        // 算順逆時針（如果單一象限）
        this.clockwise = this.detectClockwiseInQuadrant(
          this.quadrantRecord[0],
          this.onGoingTouch[idxInOngoingTouch].start,
          this.onGoingTouch[idxInOngoingTouch].end
        )
      }

      if (!this.clockwise) angle = angle * -1

      console.log(this.quadrantRecord)
      console.log(angle)
      this.totalAngle += angle
      this.$roulette.css('transform', `rotate(${this.totalAngle}deg)`)

      // 清空軌跡記錄
      this.onGoingTouch.splice(idxInOngoingTouch, 1)
      // 清空先前的位置資訊
      this.finalPos.length = 0
    }
  }

  // it's best to copy the bits you care about, rather than referencing the entire object.
  copyTouch (touch) {
    return {
      pageX: touch.pageX,
      pageY: touch.pageY
    }
  }

  findOngoingTouchById (id) {
    return this.onGoingTouch.map((el, idx) => {
      el.idx = idx
      return el
    }).filter((el, idx) => {
      return el.identifier === id ? idx : -1
    })
  }

  getRoulettePos () {
    const offset = $('#roulette').offset()
    const radius = Math.floor($('#roulette').width() / 2)
    const coordinate = {
      leftTop: { x: offset.left, y: offset.top },
      rightTop: { x: offset.left + radius * 2, y: offset.top },
      leftBottom: { x: offset.left, y: offset.top + radius * 2 },
      rightBottom: { x: offset.left + radius * 2, y: offset.top + radius * 2 },
      center: { x: offset.left + radius, y: offset.top + radius }
    }
    return coordinate
  }

  getAngle () {
    // 先寫死只抓第一個觸控點
    // 三個點
    const center = this.RouletteCenter
    const point1 = this.floorNumInObj(this.finalPos[0].start)
    const point2 = this.floorNumInObj(this.finalPos[0].end)

    // 三邊長
    const opposite = Math.sqrt(Math.pow(Math.abs(point1.pageX - point2.pageX), 2) + Math.pow(Math.abs(point1.pageY - point2.pageY), 2))
    const side1 = Math.sqrt(Math.pow(Math.abs(point1.pageX - center.x), 2) + Math.pow(Math.abs(point1.pageY - center.y), 2))
    const side2 = Math.sqrt(Math.pow(Math.abs(point2.pageX - center.x), 2) + Math.pow(Math.abs(point2.pageY - center.y), 2))

    // ref. 餘弦定理 https://zh.wikipedia.org/wiki/%E4%B8%89%E8%A7%92%E5%BD%A2#%E5%B7%B2%E7%9F%A5%E4%B8%89%E9%82%8A%E9%95%B7
    const COSX = (Math.pow(Math.floor(side1), 2) + Math.pow(Math.floor(side2), 2) - Math.pow(Math.floor(opposite), 2)) / (2 * Math.floor(side1) * Math.floor(side2))
    const angle = Math.round(Math.acos(COSX) * (180 / Math.PI))

    return angle
  }

  // 將物件裡的數字整數化
  floorNumInObj (obj) {
    const newObj = {}
    Object.keys(obj).forEach(prop => { newObj[prop] = Math.floor(obj[prop]) })
    return newObj
  }

  filterSameValueInArray (arr) {
    return arr.filter((el, idx, arr) => arr.indexOf(el) === idx)
  }

  detectQuadrant (point) {
    const { pageX, pageY } = point
    // const { center } = this.getRoulettePos() // 中心的通過 offset 去偵測，offset 會因為 rotate 的關係而改變數值
    const isTop = pageY <= this.RouletteCenter.y // 是距離上面的長度
    const isRight = pageX >= this.RouletteCenter.x
    const quadrant =
    isTop && isRight ? 1
      : !isTop && isRight ? 2
        : !isTop && !isRight ? 3 : 4

    return quadrant
  }

  detectClockwiseAcrossQuadrant (arr) {
    const lastEl = arr[arr.length - 1]
    const lastSecondEl = arr[arr.length - 2]

    if (lastEl === 1 && lastSecondEl === 4) return true
    else if (lastEl === 4 && lastSecondEl === 1) return false
    else if (lastEl > lastSecondEl) return true
    else return false
  }

  detectClockwiseInQuadrant (quadrant, pointStart, pointEnd) {
    const startX = pointStart.pageX
    const startY = pointStart.pageY
    const endX = pointEnd.pageX
    const endY = pointEnd.pageY
    let clockwise
    switch (quadrant) {
      case 1:
        if (startX < endX && startY < endY) clockwise = true
        if (startX > endX && startY > endY) clockwise = false
        break
      case 2:
        if (startX > endX && startY < endY) clockwise = true
        if (startX < endX && startY > endY) clockwise = false
        break
      case 3:
        if (startX > endX && startY > endY) clockwise = true
        if (startX < endX && startY < endY) clockwise = false
        break
      case 4:
        if (startX < endX && startY > endY) clockwise = true
        if (startX > endX && startY < endY) clockwise = false
        break
    }
    return clockwise
  }

  countSlope (pointStart, pointEnd) {
    const x = pointStart.pageX - pointEnd.pageX
    const y = pointStart.pageY - pointEnd.pageY
    return (x / y).toFixed(3)
  }
}
