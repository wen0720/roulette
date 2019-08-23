import * as PIXI from 'pixi.js'

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
      width: 600,
      height: 600,
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
    // this.app.ticker.add(delta => this.gameLoop(delta))
  }

  gameLoop (delta) {
    // Runs the current game `state` in a loop and renders the sprites
    this.state(delta)
  }

  play (delta) {
    // All the game logic goes here
    console.log(1)
  }

  end () {
    // All the code that should run at the end of the game
  }

  init () {
    // ctx.arc(x, y, radius, startAngle, endAngle, anticlockwise);
    const radius = 50
    const halfRadius = radius / 2
    const centerX = window.innerWidth / 2
    const centerY = window.innerheight / 2

    const arc = new this.Graphics()
    arc.beginFill(0x3333DD)
    arc.arc(centerX - halfRadius, centerY - halfRadius, radius, 2 * Math.PI, 2 * Math.PI / 6)
    arc.lineTo(centerX - halfRadius, centerY - halfRadius)
    arc.closePath()
    arc.endFill()
    console.log(arc)
    this.app.stage.addChild(arc)
  }

  /**
   * option
   * @param {*} PixiGraph
   * @param {要分幾片} pieces
   * @param {*} color
   */
  drawRoulette (PixiGraph, pieces, color) {
    PixiGraph.beginFill(color)
    PixiGraph.arc(centerX - halfRadius, centerY - halfRadius, radius, 2 * Math.PI, 2 * Math.PI / 6)
  }
}

const game = new Game()