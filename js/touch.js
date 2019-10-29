import $ from 'jquery'

export default class touchJS {
  constructor () {
    this.onGoingTouch = [] // 同時間，所有觸控點軌跡紀錄
    this.finalPos = [] // 完成一次觸控後，起始點、中間點、結束點位置
    this.RouletteCenter = this.getRoulettePos().center // 輪盤中心位置
    this.RouletteRight = this.getRoulettePos().rightCenter // 角度計算的基準點
    this.$roulette = $('#roulette')
    this.$roulette__plate = $('#roulette__plate')
    this.totalAngle = 0 // 輪盤的總轉移角度
    this.hasRotate = 0
    this.isrotating = false

    this.startAngle = 0

    $('.wrapper').on('touchstart', '#roulette__plate', null, (e) => {
      this.handleTouchStart(e)
    })

    $('.wrapper').on('touchmove', '#roulette__plate', null, (e) => {
      this.handleTouchMove(e)
    })

    $('.wrapper').on('touchend', '#roulette__plate', null, (e) => {
      this.handleTouchEnd(e)
    })
  }

  handleTouchStart (e) {
    e.preventDefault()
    if (this.isrotating) return
    document.querySelector('.content').innerHTML = ''
    // document.querySelector('.text').innerHTML = '請用手指轉輪盤獲得生日禮物<br>(免費大放送，可以重複轉)'

    const touches = e.changedTouches
    // 紀錄開始時間
    this.startTime = new Date().getTime()
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
      // 紀錄開始角度
      this.startAngle = this.getAngleByTan(null, this.copyTouch(touches[i]), true)
    }
  }

  handleTouchMove (e) {
    e.preventDefault()
    if (this.isrotating) return
    const touches = e.changedTouches

    for (let i = 0; i < touches.length; i++) {
      const idxInOngoingTouch = this.findOngoingTouchById(touches.identifier)[0].idx
      if (idxInOngoingTouch < 0) return

      // 目前所在象限
      const quadrant = this.detectQuadrant(touches[i])
      // 將 move 的資訊加入，形成軌跡紀錄
      this.onGoingTouch[idxInOngoingTouch].move.push(this.copyTouch(touches[i]))
      this.onGoingTouch[idxInOngoingTouch].quadrant.push(quadrant)

      // 取得經過的象限紀錄
      // this.quadrantRecord = this.filterSameValueInArray(this.onGoingTouch[idxInOngoingTouch].quadrant)

      // 目前觸控點(終點)
      const end = this.copyTouch(touches[i])

      // 目前觸控點與圓心的角度
      const angleMoveEnd = this.getAngleByTan(null, end, true)

      // 目前已轉動的角度
      this.rotation = angleMoveEnd - this.startAngle
      // console.log('moveRotation', this.rotation)

      this.$roulette.css('transform', `rotate(${this.totalAngle + (this.rotation)}deg)`)
      // 計算目前你經過的圈數
      this.cycle = this.calculateCycle(this.onGoingTouch[idxInOngoingTouch].quadrant)
    }
  }

  handleTouchEnd (e) {
    e.preventDefault()
    if (this.isrotating) return
    const touches = e.changedTouches
    this.endTime = new Date().getTime()
    this.period = (this.endTime - this.startTime) / 1000

    for (let i = 0; i < touches.length; i++) {
      const idxInOngoingTouch = this.findOngoingTouchById(touches.identifier)[0].idx
      // 如果只是輕點一下，又拿起來(move陣列沒塞東西)，不執行旋轉
      if (this.onGoingTouch[idxInOngoingTouch].move.length < 2) return
      this.onGoingTouch[idxInOngoingTouch].end = this.copyTouch(touches[i])

      // const HalfMoveLen = Math.floor(this.onGoingTouch[idxInOngoingTouch].move.length / 2)
      // const pos = {
      //   start: this.onGoingTouch[idxInOngoingTouch].start,
      //   center: this.onGoingTouch[idxInOngoingTouch].move[HalfMoveLen],
      //   end: this.copyTouch(touches[i])
      // }
      // this.finalPos.push(pos)

      // 把總角度加上剛剛轉動的角度
      this.totalAngle += this.rotation

      // // 取得經過的象限紀錄
      this.quadrantRecord = this.filterSameValueInArray(this.onGoingTouch[idxInOngoingTouch].quadrant)

      if (this.quadrantRecord.length > 1) {
        // 計算順逆時針（如果跨越2象限）
        this.clockwise = this.detectClockwiseAcrossQuadrant(this.quadrantRecord)
      } else {
        // 計算順逆時針（如果單一象限）
        this.clockwise = this.detectClockwiseInQuadrant(
          this.quadrantRecord[0],
          this.onGoingTouch[idxInOngoingTouch].start,
          this.onGoingTouch[idxInOngoingTouch].end
        )
      }

      // const speed = this.calculateSpeed(this.period, this.onGoingTouch[idxInOngoingTouch].move.length)
      // console.log(speed+ ' arr/s')

      // 清空軌跡記錄
      this.onGoingTouch.splice(idxInOngoingTouch, 1)

      let effectDeg = Math.abs(this.rotation)
      if (effectDeg < 15 && this.cycle === 0) return // 如果轉動幅度太小，且不到1圈，就不轉動了

      this.isrotating = true

      console.log('effectDeg', effectDeg)
      if (this.period < 0.4 && effectDeg <= 130 && this.cycle === 0) {
        // 手指滑動時間 < 0.4s，且角度 < 130，視為有力度的快速轉動
        console.log('有力度的快速轉動')
        effectDeg = effectDeg + 1080
      }

      if (this.cycle > 1) {
        this.cycle = this.cycle > 5 ? 5 : this.cycle + 1 // 最高 5 圈
        effectDeg = effectDeg + 540 * this.cycle
      } else if (this.cycle === 1) {
        // 目前已轉動的角度
        effectDeg = effectDeg + (360 * 3) // 手勢轉動一圈，就至少給他轉 3 圈
      } else if (this.cycle === 0) {
        // 如果轉不到 1 圈
        effectDeg = effectDeg + 360 // 手勢轉不到一圈，但還是給他多加至少 1 圈
      }

      if (!this.clockwise) effectDeg = effectDeg * -1
      this.rotateEffect(effectDeg)
    }
  }

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
      center: { x: offset.left + radius, y: offset.top + radius },
      rightCenter: { x: offset.left + radius * 2, y: offset.top + radius * 1 },
      leftCenter: { x: offset.left, y: offset.top + radius * 1 }
    }
    return coordinate
  }

  rotateEffect (effectDeg) {
    // 等速減緩的值
    let minus = 0
    // 已經轉動
    this.hasRotate = 0
    // 每次轉動的值
    let perRotate = 1 / 50 * effectDeg
    const constRotate = perRotate
    console.log('perRotate', perRotate, 'effectDeg', effectDeg)

    const rotate = () => {
      if (effectDeg - this.hasRotate < 180 * constRotate) {
        minus = constRotate / 120
        perRotate = perRotate - minus > 1 ? perRotate - minus : perRotate
        // console.log('perRotate', perRotate, 'minus', minus)
      }

      // 在動畫中，已經轉動了多少
      this.hasRotate += perRotate
      // 計算從開始總共轉動的量，為了下次轉動時，能夠帶入
      this.totalAngle += perRotate

      this.$roulette.css('transform', `rotate(${this.totalAngle}deg)`)
      // lastTime = +new Date()

      if (this.hasRotate <= effectDeg && this.clockwise) {
        // 如果是順時針
        window.requestAnimationFrame(rotate)
      } else if (this.hasRotate >= effectDeg && !this.clockwise) {
        // 如果是逆時針
        window.requestAnimationFrame(rotate)
      } else {
        // 動畫結束
        this.isrotating = false
        console.log('final', this.totalAngle)
      }
    }
    rotate()
  }

  getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //不含最大值，含最小值
  }

  getAngleByTan (pointStart, pointEnd, isCenter) {
    if (isCenter) {
      // 弧度
      const x = Math.atan2(pointEnd.pageY - this.RouletteCenter.y, pointEnd.pageX - this.RouletteCenter.x)
      return x * 180 / Math.PI
    }
    const x = Math.atan2(pointEnd.pageY - pointStart.pageY, pointEnd.pageX - pointStart.pageX)
    const rotation = x * 180 / Math.PI
    return rotation
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

  calculateCycle (arr) {
    // 我需要去判斷 1\2\3\4 有幾個，只取最少的計算圈數
    // 從 index 0 開始分別為 1,2,3,4象限
    const eachQuadrantTimes = [0, 0, 0, 0]
    const record = arr.filter((el, idx, arr) => {
      return idx === arr.length - 1 ? true : el !== arr[idx + 1]
    })
    record.forEach(el => {
      switch (el) {
        case 1:
          eachQuadrantTimes[0] = eachQuadrantTimes[0] + 1
          break
        case 2:
          eachQuadrantTimes[1] = eachQuadrantTimes[1] + 1
          break
        case 3:
          eachQuadrantTimes[2] = eachQuadrantTimes[2] + 1
          break
        case 4:
          eachQuadrantTimes[3] = eachQuadrantTimes[3] + 1
          break
      }
    })
    if (eachQuadrantTimes.indexOf(0) > -1) {
      return 0
    } else {
      eachQuadrantTimes.sort((a, b) => a - b)
      return eachQuadrantTimes[0]
    }
  }

  calculateSpeed (period, arrLength) {
    console.log(period + 's', arrLength)
    // 換算成每秒塞多少個陣列
    const speed = Math.round(arrLength * 1000 / period)
    return speed
  }
  // countMidPoint (point1, point2) {
  //   const x = (point1.pageX + point2.pageX) / 2
  //   const y = (point1.pageY + point2.pageY) / 2
  //   return { x, y }
  // }

  // directionByCenter (point) {
  //   return {
  //     isLeft: point.pageX < this.RouletteCenter.x,
  //     isTop: point.pageY > this.RouletteCenter.y
  //   }
  // }

  // countSlope (pointStart, pointEnd) {
  //   const x = pointStart.pageX - pointEnd.pageX
  //   const y = pointStart.pageY - pointEnd.pageY
  //   console.log(x, y)
  //   return (x / y).toFixed(3)
  // }

  // getAngle (pointFirst, pointSecond) {
  //   // 三個點
  //   const center = this.RouletteCenter
  //   const point1 = this.floorNumInObj(pointFirst)
  //   const point2 = this.floorNumInObj(pointSecond)

  //   // 三邊長
  //   const opposite = Math.sqrt(Math.pow(Math.abs(point1.pageX - point2.pageX), 2) + Math.pow(Math.abs(point1.pageY - point2.pageY), 2))
  //   const side1 = Math.sqrt(Math.pow(Math.abs(point1.pageX - center.x), 2) + Math.pow(Math.abs(point1.pageY - center.y), 2))
  //   const side2 = Math.sqrt(Math.pow(Math.abs(point2.pageX - center.x), 2) + Math.pow(Math.abs(point2.pageY - center.y), 2))

  //   // ref. 餘弦定理 https://zh.wikipedia.org/wiki/%E4%B8%89%E8%A7%92%E5%BD%A2#%E5%B7%B2%E7%9F%A5%E4%B8%89%E9%82%8A%E9%95%B7
  //   const COSX = (Math.pow(Math.floor(side1), 2) + Math.pow(Math.floor(side2), 2) - Math.pow(Math.floor(opposite), 2)) / (2 * Math.floor(side1) * Math.floor(side2))
  //   const angle = Math.round(Math.acos(COSX) * (180 / Math.PI))

  //   return angle
  // }

  // 將物件裡的數字整數化
  // floorNumInObj (obj) {
  //   const newObj = {}
  //   Object.keys(obj).forEach(prop => { newObj[prop] = Math.floor(obj[prop]) })
  //   return newObj
  // }
}
