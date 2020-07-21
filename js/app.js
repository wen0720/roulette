import * as PIXI from 'pixi.js'
import zingTouch from './zingTouch'
import touchJS from './touch'

class Game {
  constructor () {
    // alias
    this.Application = PIXI.Application
    this.Container = PIXI.Container
    this.Sprite = PIXI.Sprite
    this.TextureCache = PIXI.utils.TextureCache
    this.Graphics = PIXI.Graphics

    // create PIXI application
    this.app = new this.Application({
      // width: 600,
      // height: 600,
      antialias: true,
      transparent: false,
      resolution: 1
    })

    // 全螢幕
    this.app.renderer.view.style.position = 'absolute'
    this.app.renderer.view.style.display = 'block'
    this.app.renderer.autoResize = true
    this.app.renderer.resize(window.innerWidth, window.innerHeight)

    // state
    this.state = this.play

    this.loader = this.app.loader
    this.resources = this.loader.resources

    // 將 canvas 加進 html 中
    document.body.appendChild(this.app.view)

    this.loader
    // .add(image)
      .load(this.setup.bind(this))
  }

  setup () {
    // 所有的紋理集
    // const allTextures = resources["./images/treasureHunter.json"].textures
    // 先載入的會在下面

    this.init()
    this.app.ticker.add(delta => this.gameLoop(delta))
  }

  gameLoop (delta) {
    // Runs the current game `state` in a loop and renders the sprites
    this.state(delta)
  }

  play (delta) {
    // All the game logic goes here
    this.rouletteContainer.rotation += 0.01 * delta
  }

  end () {
    // All the code that should run at the end of the game
  }

  init () {
    this.rouletteContainer = new this.Container()
    this.rouletteContainer.x = this.app.screen.width / 2
    this.rouletteContainer.y = this.app.screen.height / 2
    // // 更改原始軸點為rouletteContainer中心
    // this.rouletteContainer.pivot.x = this.rouletteContainer.width / 2
    // this.rouletteContainer.pivot.y = this.rouletteContainer.height / 2
    const rouletteSetting = {
      pieces: 6,
      color: 0x3333DD,
      position: {
        x: 0,
        y: 0
      },
      radius: 100,
      stage: this.app.stage
    }
    this.drawRoulette(rouletteSetting)
  }

  /**
   * 畫輪盤出來
   *
   * option
   * @param  {PIXI} arc
   * @param  {number} pieces
   * @param  {string} color
   * @param  {boject} arcCenter // 位置
   * @param  {number} radius
   * @param  {number} angle
   */
  drawRoulette ({ pieces, color, position, radius, stage }) {
    // .arc(x座標, y座標, 半徑, start弧度, end弧度)
    const allPieces = []
    const radian = 2 * Math.PI // 一個圓的弧度
    for (let i = 0; i < pieces; i++) {
      const arc = new this.Graphics()
      arc.beginFill(color)
      arc.lineStyle(2, 0x000000, 1)
      arc.arc(position.x, position.y, radius, i * radian / pieces, (i + 1) * radian / pieces)
      arc.lineTo(position.x, position.y)
      arc.closePath()
      arc.endFill()
      allPieces.push(arc)
    }
    console.log(allPieces)
    stage.addChild(this.rouletteContainer)
    this.rouletteContainer.addChild(...allPieces)
  }
}

// const game = new Game()\

const pages = {
  'index.html': Game,
  'zingTouch.html': zingTouch,
  'touch.html': touchJS
}

const path = window.location.href.split('/').pop()
const fuc = new pages[path]()
