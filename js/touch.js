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
    this.lastMovePoint = null // 前一次被紀錄的移動點

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

    // document.querySelector('.wrapper').addEventListener('touchmove', (e) => {
    //   if (Array.prototype.slice.call(e.target.classList).includes('l')) {
    //     console.log(e)
    //     this.handleTouchMove(e)
    //   }
    // })

    // $('body').on('touchstart', (e) => {
    //   alert(this.boundaryRecord)
    // })
  }

  handleTouchStart (e) {
    e.preventDefault()
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

      this.startAngle = this.getAngleByTan(null, this.copyTouch(touches[i]), true)
    }
  }

  handleTouchMove (e) {
    e.preventDefault()
    const touches = e.changedTouches

    for (let i = 0; i < touches.length; i++) {
      const idxInOngoingTouch = this.findOngoingTouchById(touches.identifier)[0].idx
      if (idxInOngoingTouch < 0) return

      const MoveLength = this.onGoingTouch[idxInOngoingTouch].move.length
      const MoveLengthHalf = Math.floor(this.onGoingTouch[idxInOngoingTouch].move.length / 2)

      // 目前所在象限
      const quadrant = this.detectQuadrant(touches[i])
      // 將 move 的資訊加入，形成軌跡紀錄
      this.onGoingTouch[idxInOngoingTouch].move.push(this.copyTouch(touches[i]))
      this.onGoingTouch[idxInOngoingTouch].quadrant.push(quadrant)

      // 取得經過的象限紀錄
      this.quadrantRecord = this.filterSameValueInArray(this.onGoingTouch[idxInOngoingTouch].quadrant)

      // 目前觸控點(終點)
      const end = this.copyTouch(touches[i])

      // 目前觸控點與圓心的角度
      const angleMoveEnd = this.getAngleByTan(null, end, true)

      // 目前已轉動的角度
      this.rotation = angleMoveEnd - this.startAngle
      console.log('moveRotation', this.rotation)

      this.$roulette.css('transform', `rotate(${this.totalAngle + (this.rotation)}deg)`)
    }
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

      // 把總角度加上剛剛轉動的角度
      this.totalAngle += this.rotation

      // // 取得經過的象限紀錄
      this.quadrantRecord = this.filterSameValueInArray(this.onGoingTouch[idxInOngoingTouch].quadrant)

      const cycleArr = this.onGoingTouch[idxInOngoingTouch].quadrant
        .filter(el => el === 1 || el === 4)
        .filter((el, idx, arr) => {
          if (idx === arr.length - 1) { return true /* 若是最後一個 */ }
          return el !== arr[idx + 1]
        })
      console.log(this.quadrantRecord)

      if (cycleArr.length > 1) {
        // 至少轉了快1圈

      }

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

      let effectDeg = Math.abs(this.rotation)
      if (!this.clockwise) effectDeg = effectDeg * -1

      const _this = this
      function rotateEffect () {
        // 控制轉動的動畫
        let lastTime = +new Date()
        _this.hasRotate = 0

        function rotate () {
          // 每次轉動的值
          const perRotate = (new Date() - lastTime) / 400 * effectDeg * 2
          // 在動畫中，已經轉動了多少
          _this.hasRotate += perRotate
          // 計算從開始總共轉動的量
          _this.totalAngle += perRotate

          _this.$roulette.css('transform', `rotate(${_this.totalAngle}deg)`)
          lastTime = +new Date()

          if (_this.hasRotate <= effectDeg && _this.clockwise) {
            // 如果是順時針
            window.requestAnimationFrame(rotate)
          } else if (_this.hasRotate >= effectDeg && !_this.clockwise) {
            // 如果是逆時針
            window.requestAnimationFrame(rotate)
          } else {
            // 動畫結束
            console.log('final', _this.totalAngle)
          }
        }
        rotate()
      }
      rotateEffect()

      // 清空軌跡記錄
      this.onGoingTouch.splice(idxInOngoingTouch, 1)
      // 清空先前的位置資訊
      this.finalPos.length = 0
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

  getAngle (pointFirst, pointSecond) {
    // 三個點
    const center = this.RouletteCenter
    const point1 = this.floorNumInObj(pointFirst)
    const point2 = this.floorNumInObj(pointSecond)

    // 三邊長
    const opposite = Math.sqrt(Math.pow(Math.abs(point1.pageX - point2.pageX), 2) + Math.pow(Math.abs(point1.pageY - point2.pageY), 2))
    const side1 = Math.sqrt(Math.pow(Math.abs(point1.pageX - center.x), 2) + Math.pow(Math.abs(point1.pageY - center.y), 2))
    const side2 = Math.sqrt(Math.pow(Math.abs(point2.pageX - center.x), 2) + Math.pow(Math.abs(point2.pageY - center.y), 2))

    // ref. 餘弦定理 https://zh.wikipedia.org/wiki/%E4%B8%89%E8%A7%92%E5%BD%A2#%E5%B7%B2%E7%9F%A5%E4%B8%89%E9%82%8A%E9%95%B7
    const COSX = (Math.pow(Math.floor(side1), 2) + Math.pow(Math.floor(side2), 2) - Math.pow(Math.floor(opposite), 2)) / (2 * Math.floor(side1) * Math.floor(side2))
    const angle = Math.round(Math.acos(COSX) * (180 / Math.PI))

    return angle
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

  countMidPoint (point1, point2) {
    const x = (point1.pageX + point2.pageX) / 2
    const y = (point1.pageY + point2.pageY) / 2
    return { x, y }
  }

  directionByCenter (point) {
    return {
      isLeft: point.pageX < this.RouletteCenter.x,
      isTop: point.pageY > this.RouletteCenter.y
    }
  }

  countSlope (pointStart, pointEnd) {
    const x = pointStart.pageX - pointEnd.pageX
    const y = pointStart.pageY - pointEnd.pageY
    console.log(x, y)
    return (x / y).toFixed(3)
  }
}

// (function() {
//   var init, rotate, start, stop,
//     active = false,
//     angle = 0, // 目前總角度
//     rotation = 0, // 當次轉移角度
//     startAngle = 0,
//     center = {
//       x: 0,
//       y: 0
//     },
//     R2D = 180 / Math.PI,
//     rot = document.getElementById('rotate');

//   init = function() {
//     rot.addEventListener("mousedown", start, false);
//     $(document).bind('mousemove', function(event) {
//       if (active === true) {
//         event.preventDefault();
//         rotate(event);
//       }
//     });
//     $(document).bind('mouseup', function(event) {
//       event.preventDefault();
//       stop(event);
//     });
//   };

//   start = function(e) {
//     e.preventDefault();
//     var bb = this.getBoundingClientRect(),
//       t = bb.top,
//       l = bb.left,
//       h = bb.height,
//       w = bb.width,
//       x, y;
//     center = {
//       x: l + (w / 2),
//       y: t + (h / 2)
//     };
//     x = e.clientX - center.x;
//     y = e.clientY - center.y;
//     startAngle = R2D * Math.atan2(y, x);
//     return active = true;
//   };

//   rotate = function(e) {
//     e.preventDefault();
//     var x = e.clientX - center.x,
//       y = e.clientY - center.y,
//       d = R2D * Math.atan2(y, x);
//     rotation = d - startAngle;
//     return rot.style.webkitTransform = "rotate(" + (angle + rotation) + "deg)";
//   };

//   stop = function() {
//     angle += rotation;
//     return active = false;
//   };

//   init();

// }).call(this);
