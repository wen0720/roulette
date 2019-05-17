import * as PIXI from 'pixi.js'
import { randomInt, lcm, getItems } from './util'
import data from './data'

class game {
    constructor (data) {
        // alias
        this.Application = PIXI.Application,
        this.Container = PIXI.Container,
        this.Sprite = PIXI.Sprite,
        this.TextureCache = PIXI.utils.TextureCache;               

        // game
        this.fallListData
        this.fallListFinal = []
        this.fallContainer = new this.Container()
        this.state = this.play
        this.hasDrawlist = []
        this.noworder = 0

        this.col
        this.colWidth 

        // create PIXI application 
        this.app = new this.Application({
            width: 600,
            height: 600,
            antialias: true,
            transparent: false,
            resolution: 1
        })

        // data from argument
        this.data = data        

        // 全螢幕
        this.app.renderer.view.style.position = "absolute";
        this.app.renderer.view.style.display = "block";
        this.app.renderer.autoResize = true;
        this.app.renderer.resize(window.innerWidth, window.innerHeight);
        
        this.loader = this.app.loader;
        this.resources = this.loader.resources;

        // 將 canvas 加進 html 中
        document.body.appendChild(this.app.view)

        // // 加載圖片(用new 出來的 app)
        const image = this.data.fallObj.map(el => ({name: el.name, url: el.url}))

        this.loader
        .add(image)
        .load(this.setup.bind(this))                

        
    }


    setup () {
        // 所有的紋理集
        // const allTextures = resources["./images/treasureHunter.json"].textures                
        // 先載入的會在下面        

        // console.log(this.resources)
        // let good = new this.Sprite(this.resources['good'].texture)        
        // good.x = 50
        // this.app.stage.addChild(good)        
        this.init(this.data)
        // this.app.ticker.add(delta => this.gameLoop(delta))
    }
    
    // func 加入舞台
    // func 讓東西掉下來
    // func 檢查是否掉一半    
    // data 紀錄現在的掉落順序

    gameLoop ( delta ) {
        // Runs the current game `state` in a loop and renders the sprites             
        this.state(delta)
    }
    
    play ( delta ) {
        // All the game logic goes here   
        const _this = this             
        
        function draw(stage, fallList, order) {
            if (_this.hasDrawlist.indexOf(order) === -1) {                
                const container = fallList[order].container;                
                container.children[0].x = _this.colWidth * fallList[order].xNum + _this.colWidth/2 - container.width/2
                container.children[0].y = 0                                       
                stage.addChild(container)
                
                _this.hasDrawlist.push(order)                                                                     
            }            
        }
        
        function fall (fallList, order) {            
            const el = fallList[order].container;
            let vy = fallList[order].speed
            el.children[0].y += vy                        
        }


        draw(this.fallContainer, this.fallListFinal, this.noworder)
        fall(this.fallListFinal, this.noworder)                

    }
    
    end () {
        // All the code that should run at the end of the game
    }

    init (config) {
        const _this = this

        // 設定
        const setting = config.fallConfig
        const imagelist = config.fallObj

        // 視窗寬高
        const winWith = window.innerWidth;
        const winHeight = window.innerHeight

        this.col = setting.col
        this.colWidth = Math.floor(winWith / this.col)                
                         
        // 掉落集合 config
        // let fallContainer = new this.Container();                
        let col = this.col
        let colWidth = this.colWidth
        let colGutter = setting.colGutter
        let style = setting.style  // 掉落物種類
        let items = getItems(col, style, col)   // 最小一組的個數，且4行以上       
        let itemsRow = items / col        

        // 掉落物各類別資訊
        this.fallListData = imagelist.map((el, idx) => {
            let keys = Object.keys(this.resources)
            el.id = idx + 1                         // id
            el.resource = this.resources[keys[idx]] // texture
            el.total = Math.round(items*el.density) // 數量
            return el
        }).sort((a, b ) => b.total-a.total)                   

        console.log('items', items, 'itemsRow', itemsRow)        
        console.log('fallListData', this.fallListData)        
                
        // let fallListFinal = []

        // 將掉落資訊依個數轉換為每一個不同的掉落 container 物件
        let fallListBasic = []        
        this.fallListData.forEach(el => {
            for (let i=0; i<el.total; i++) {
                let fallObjConfig = Object.assign({}, el)
                let Container = new this.Container();
                let sprite = new this.Sprite(el.resource.texture)                    
                let scale = colWidth*0.8 > sprite.width ? 1 : colWidth/sprite.width*0.8  //乘.8是不想讓物件直接貼著邊            
                sprite.scale.y = sprite.scale.x = sprite.scale.x*scale
                                                
                Container.addChild(sprite)
                fallObjConfig.container = Container                  
                fallListBasic.push(fallObjConfig)
            }
        })
        console.log(fallListBasic)        

        // 以最小組個數，算出最初掉，個別掉落物位於哪一col(x值)，掉落順序（y值）
        let fallOrderConfig = []
        fallOrderConfig.length = fallListBasic.length;

        function getRandomXY (col, rowTotal) {
            let x = randomInt(col-1, 0)
            let y = randomInt(rowTotal-1, 0)
            return {x, y}
        } 
        
        function setFallConfig (fallOrderConfig, el) {                        
            let {x, y} = getRandomXY(col, fallListBasic.length)
            if(fallOrderConfig[y] === undefined) {                
                fallOrderConfig[y] = []                                
                for (let i=0; i<col; i++) {
                    fallOrderConfig[y].push(0)
                }
                let config = {
                    xNum: x,
                    yNum: y,
                    container: el.container,
                    speed: el.speed
                }
                fallOrderConfig[y][x] = el.id          
                _this.fallListFinal.push(config)
                _this.fallListFinal.sort((a, b) => a.yNum-b.yNum)       
            }else {
                setFallConfig(fallOrderConfig, el)
            }
        }

        fallListBasic.forEach(el => {             
            setFallConfig(fallOrderConfig, el)
        })        

        console.log('fallOrderConfig', fallOrderConfig)
        console.log('this.fallListFinal', this.fallListFinal)        
    }

    check (randomId, checkBoard, style, col) {                                   
        return checkBoard.indexOf(randomId) === -1 ? randomId : this.check(randomInt(style-1, 0), checkBoard, style, col)
    }

}


new game(data);




function draw(stage, fallList, order) {
    if (_this.hasDrawlist.indexOf(order) === -1) {                
        const container = fallList[order].container;                
        container.children[0].x = _this.colWidth * fallList[order].xNum + _this.colWidth/2 - container.width/2
        container.children[0].y = 0                                       
        stage.addChild(container)
        
        _this.hasDrawlist.push(order)                                                                     
    }            
}

function fall (fallList, order) {            
    const el = fallList[order].container;
    let vy = fallList[order].speed
    el.children[0].y += vy                        
}
