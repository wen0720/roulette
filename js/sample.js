import './polyfill';
import moment from "moment";
import utils from './utils';

window._times = [];
window._fps = 60;
window._frame = 1;
window.isDevMode = utils.isDevMode();


// 遊戲狀態設計模式

// Define any variables that are used in more than one function 
let cat, state;

function  setup () {

  // Create the `cat` sprite  
  cat =  new  Sprite (resources[ " images/cat.png " ]. texture );
   cat . y  =  96 ;
   cat . vx  =  0 ;
   cat . vy  =  0 ;
   app . stage . addChild (cat);

  // Set the game state  
  state = play;

  // Start the game loop 
  app . ticker . add ( delta  =>  gameLoop (delta));
}

function  gameLoop ( delta ){

  // Update the current game state: 
  state (delta);
}

function  play ( delta ) {

  // Move the cat 1 pixel to the right each frame 
  cat . vx  =  1 
  cat . x  +=  cat . vx ;
}



function CatchGame(configLevel) {
  this.supportsCanvas = !!document.createElement("canvas").getContext; // 檢查是否支援 canvas
  if (!this.supportsCanvas) {
    alert("您的瀏覽器不支援canvas 無法進行遊戲。");
    return;
  }

  this._eventListeners = {};
  /**
   * Add an event listener
   */
  CatchGame.prototype.addEventListener = function (type, handler) {
    var el = this._eventListeners;
    type = type.toLowerCase();

    if (!el.hasOwnProperty(type)) {
      el[type] = [];
    }

    if (el[type].indexOf(handler) == -1) {
      el[type].push(handler);
    }
  };

  /**
   * Dispatch an event
   */
  CatchGame.prototype.dispatchEvent = function (type) {
    var el = this._eventListeners;
    type = type.toLowerCase();

    if (!el.hasOwnProperty(type)) {
      return;
    }

    var len = el[type].length;

    for (var i = 0; i < len; i++) {
      el[type][i].call(this);
    }
  };

  this.$elLoader = document.querySelector("#js-loader"); // loader的element
  this.$elMin = document.querySelector("#js-min"); // 分的element
  this.$elSec = document.querySelector("#js-sec"); // 秒的element
  this.$elScore = document.querySelector("#js-score"); // 分數的element

  this.canvas = document.getElementById("js-canvas");
  if (this.canvas === null) {
    return;
  }
  // 設定畫布大小
  this.canvas.width = window.innerWidth * 2;
  this.canvas.height = window.innerHeight * 2;


  this.ctx = this.canvas.getContext("2d");

  this.gamePrgress = false; // true 代表開始計時跟掉落物件

  this.countDownTime = 30; // 遊戲秒數
  this.score = 0; // 分數

  this.checkerBoard = [];
  this.collisionPosScore = { x: -100, y: -100 }; // 儲存碰撞位置
  this.collisionPosTime = { x: -100, y: -100 }; // 儲存碰撞位置
  this.collisionStyleScore; // 碰撞類型（碰到什麼要產生什麼效果）
  this.collisionStyleTime;
  this.controlScore = 50; // 制吃到物件後，出現的回饋圖片，<0不畫圖，數字越大出現越久
  this.controlTime; // 制吃到時間後，出現的回饋圖片，<0不畫圖，數字越大出現越久


  this.rwd = new Rwd();
  // console.log(this.rwdParam)
  this.ratio = new Ratio();
  console.log(this.ratio, 'a')


  this.rere = new ReRe(this.canvas, this.rwd);
  // console.log( this.rere)

  this.scorePlus = new ScorePlus();
  this.timeChange = new TimeChange();
  // console.log('aaaaabbbb',this.timeChange)

  var level = {
    level_1: {
      good: {
        maxItems: 55 - this.ratio.ratioParam.good.minus,
        minScale: this.rwd.rwdParam.good.minScale,
        maxScale: this.rwd.rwdParam.good.maxScale,
        speed: (Math.random() + 3 - this.rwd.rwdParam.speedMinus) * 2,
        score: 1,
        seconds: 0,
      },
      bad: {
        maxItems: 15 - this.ratio.ratioParam.bad.minus,
        minScale: this.rwd.rwdParam.bad.minScale,
        maxScale: this.rwd.rwdParam.bad.maxScale,
        speed: (Math.random() + 1.5 - this.rwd.rwdParam.speedMinus) * 2,
        score: -1,
        seconds: 0,
      },
      bomb: {
        maxItems: 3 - this.ratio.ratioParam.bomb.minus,
        minScale: this.rwd.rwdParam.bomb.minScale,
        maxScale: this.rwd.rwdParam.bomb.maxScale,
        speed: (Math.random() + 1.5 - this.rwd.rwdParam.speedMinus) * 2,
        score: 0,
        seconds: 5,
      },
      clock: {
        maxItems: 3 - this.ratio.ratioParam.bomb.minus,
        minScale: this.rwd.rwdParam.clock.minScale,
        maxScale: this.rwd.rwdParam.clock.maxScale,
        speed: (Math.random() + 3 - this.rwd.rwdParam.speedMinus) * 2,
        score: 0,
        seconds: -5,
      }
    },

    level_2: {
      good: {
        maxItems: 45 - this.ratio.ratioParam.good.minus,
        minScale: this.rwd.rwdParam.good.minScale,
        maxScale: this.rwd.rwdParam.good.maxScale,
        speed: (Math.random() + 3 - this.rwd.rwdParam.speedMinus) * 2,
        score: 1,
        seconds: 0,
      },
      bad: {
        maxItems: 15 - this.ratio.ratioParam.bad.minus,
        minScale: this.rwd.rwdParam.bad.minScale,
        maxScale: this.rwd.rwdParam.bad.maxScale,
        speed: (Math.random() + 2 - this.rwd.rwdParam.speedMinus) * 2,
        score: -1,
        seconds: 0,
      },
      bomb: {
        maxItems: 5 - this.ratio.ratioParam.bomb.minus,
        minScale: this.rwd.rwdParam.bomb.minScale,
        maxScale: this.rwd.rwdParam.bomb.maxScale,
        speed: (Math.random() + 2 - this.rwd.rwdParam.speedMinus) * 2,
        score: 0,
        seconds: 5,
      },
      clock: {
        maxItems: 2 - this.ratio.ratioParam.bomb.minus,
        minScale: this.rwd.rwdParam.clock.minScale,
        maxScale: this.rwd.rwdParam.clock.maxScale,
        speed: (Math.random() + 3 - this.rwd.rwdParam.speedMinus) * 2,
        score: 0,
        seconds: -3,
      }
    },

    level_3: {
      good: {
        maxItems: 30 - this.ratio.ratioParam.good.minus,
        minScale: this.rwd.rwdParam.good.minScale,
        maxScale: this.rwd.rwdParam.good.maxScale,
        speed: (Math.random() + 3 - this.rwd.rwdParam.speedMinus) * 2,
        score: 1,
        seconds: 0,
      },
      bad: {
        maxItems: 25 - this.ratio.ratioParam.bad.minus,
        minScale: this.rwd.rwdParam.bad.minScale,
        maxScale: this.rwd.rwdParam.bad.maxScale,
        speed: (Math.random() + 3 - this.rwd.rwdParam.speedMinus) * 2,
        score: -1,
        seconds: 0,
      },
      bomb: {
        maxItems: 5 - this.ratio.ratioParam.bomb.minus,
        minScale: this.rwd.rwdParam.bomb.minScale,
        maxScale: this.rwd.rwdParam.bomb.maxScale,
        speed: (Math.random() + 3 - this.rwd.rwdParam.speedMinus) * 2,
        score: 0,
        seconds: 5,
      },
      clock: {
        maxItems: 2 - this.ratio.ratioParam.clock.minus,
        minScale: this.rwd.rwdParam.clock.minScale,
        maxScale: this.rwd.rwdParam.clock.maxScale,
        speed: (Math.random() + 3 - this.rwd.rwdParam.speedMinus) * 2,
        score: 0,
        seconds: -3,
      }
    },

    level_4: {
      good: {
        maxItems: 25 - this.ratio.ratioParam.good.minus,
        minScale: this.rwd.rwdParam.good.minScale,
        maxScale: this.rwd.rwdParam.good.maxScale,
        speed: (Math.random() + 4 - this.rwd.rwdParam.speedMinus) * 2,
        score: 1,
        seconds: 0,
      },
      bad: {
        maxItems: 25 - this.ratio.ratioParam.bad.minus,
        minScale: this.rwd.rwdParam.bad.minScale,
        maxScale: this.rwd.rwdParam.bad.maxScale,
        speed: (Math.random() + 4 - this.rwd.rwdParam.speedMinus) * 2,
        score: -1,
        seconds: 0,
      },
      bomb: {
        maxItems: 6 - this.ratio.ratioParam.bomb.minus,
        minScale: this.rwd.rwdParam.bomb.minScale,
        maxScale: this.rwd.rwdParam.bomb.maxScale,
        speed: (Math.random() + 4 - this.rwd.rwdParam.speedMinus) * 2,
        score: 0,
        seconds: 5,
      },
      clock: {
        maxItems: 2 - this.ratio.ratioParam.clock.minus,
        minScale: this.rwd.rwdParam.clock.minScale,
        maxScale: this.rwd.rwdParam.clock.maxScale,
        speed: (Math.random() + 4 - this.rwd.rwdParam.speedMinus) * 2,
        score: 0,
        seconds: -3,
      }
    },

    level_5: {
      good: {
        maxItems: 22 - this.ratio.ratioParam.good.minus,  //old 18
        minScale: this.rwd.rwdParam.good.minScale,
        maxScale: this.rwd.rwdParam.good.maxScale,
        speed: (Math.random() + 5 - this.rwd.rwdParam.speedMinus) * 2,
        score: 1,
        seconds: 0,
      },
      bad: {
        maxItems: 22 - this.ratio.ratioParam.bad.minus,
        minScale: this.rwd.rwdParam.bad.minScale,
        maxScale: this.rwd.rwdParam.bad.maxScale,
        speed: (Math.random() + 5 - this.rwd.rwdParam.speedMinus) * 2,
        score: -1,
        seconds: 0,
      },
      bomb: {
        maxItems: 7 - this.ratio.ratioParam.bomb.minus,
        minScale: this.rwd.rwdParam.bomb.minScale,
        maxScale: this.rwd.rwdParam.bomb.maxScale,
        speed: (Math.random() + 5 - this.rwd.rwdParam.speedMinus) * 2,
        score: 0,
        seconds: 5,
      },
      clock: {
        maxItems: 2 - this.ratio.ratioParam.clock.minus,
        minScale: this.rwd.rwdParam.clock.minScale,
        maxScale: this.rwd.rwdParam.clock.maxScale,
        speed: (Math.random() + 5 - this.rwd.rwdParam.speedMinus) * 2,
        score: 0,
        seconds: -2,
      }
    }
  }

  console.log(configLevel)
  var config = level[configLevel];
  console.log(this.rwd.rwdParam)
  console.log(config);

  //好物件的屬性
  var itemGood = {
    id: 1,
    height: 158,
    width: 175,
    items: [],
    image: [
      "img-goodGift.png",
    ],
    maxItems: config.good.maxItems,
    minScale: config.good.minScale,
    speed: config.good.speed,
    score: config.good.score,
    seconds: config.good.seconds,
  };

  //炸彈的屬性
  var bomb = {
    id: 2,
    height: 210,
    width: 123,
    items: [],
    image: ["img-bomb.png"],
    maxItems: config.bomb.maxItems,
    minScale: config.bomb.minScale,
    speed: config.bomb.speed,
    score: config.bomb.score,
    seconds: config.bomb.seconds,
  };

  //壞物件的屬性
  var itemBad = {
    id: 3,
    height: 144,
    width: 186,
    items: [],
    image: ["img-badGift.png"],
    maxItems: config.bad.maxItems,
    minScale: config.bad.minScale,
    speed: config.bad.speed,
    score: config.bad.score,
    seconds: config.bad.seconds,
  };

  // 時鐘的屬性
  var timePlus = {
    id: 4,
    height: 168,
    width: 171,
    items: [],
    image: ["img-clock.png"],
    maxItems: config.clock.maxItems,
    minScale: config.clock.minScale,
    speed: config.clock.speed,
    score: config.clock.score,
    seconds: config.clock.seconds,
  };

  this.itemGoodFall = new ItemFall(itemGood, this.canvas, this.rwd, this.checkerBoard); // 好物件
  this.bombFall = new ItemFall(bomb, this.canvas, this.rwd, this.checkerBoard); // 炸彈
  this.timePlus = new ItemFall(timePlus, this.canvas, this.rwd, this.checkerBoard);
  this.itemBadFall = new ItemFall(itemBad, this.canvas, this.rwd, this.checkerBoard); // 壞物件

  console.log(this.checkerBoard);

  /*
  設定參數
  option: {
    item, 落下物件
    scoreChange, 分數變動
    style, 碰撞到所產生的圖
    changeTime 改變時間（扣時間，要加時間就給負數）
  }
  */
  this.collisionDetection = function ({ item, styleScore, styleTime }) {
    // 碰撞探測 與 碰撞要做的事
    let fixHeight = 0.1; // 修正高度
    let fixWidth = 0.5; // 修正寬度

    let fixBadScale = 1; // 修正壞物件的煙霧範圍(此次無煙霧)

    let pxLeft = this.rere.direction === 'default' ? 0 : this.rere.direction === 'left' ? 30 : -30; // 中心水平偏移    

    //Define the variables we'll need to calculate
    let hit, combinedHalfWidths, combinedHalfHeights, vx, vy;
    let rereCenterX = (this.rere.X + this.rere.width / 2) - pxLeft;
    let rereCenterY = this.rere.Y + this.rere.height / 2;
    let rereHalfWidth = (this.rere.width * fixWidth / 2);
    let rereHalfHeight = (this.rere.height * fixHeight / 2);
    hit = false;

    var itemWhole = item.itemAll;
    itemWhole.items = itemWhole.items.filter(
      function (obj) {

        let objWidth = styleScore === 'bad' ? obj.width * fixBadScale : obj.width;
        let objHeight = styleScore === 'bad' ? obj.height * fixBadScale : obj.height;

        //Find the center points of each sprite   
        let itemCenterX = obj.x + objWidth / 2;
        // let itemCenterY = styleScore === 'bad' ? obj.y + (obj.height * 0.513) + (objHeight / 2) : obj.y + objHeight / 2;
        let itemCenterY = obj.y + objHeight / 2;

        //Find the half-widths and half-heights of each sprite   
        let itemHalfWidth = objWidth / 2;
        let itemHalfHeight = objHeight / 2;

        //Calculate the distance vector between the sprites
        vx = rereCenterX - itemCenterX;
        vy = rereCenterY - itemCenterY;

        //Figure out the combined half-widths and half-heights
        combinedHalfWidths = rereHalfWidth + itemHalfWidth;
        combinedHalfHeights = rereHalfHeight + itemHalfHeight;

        //Check for a collision on the x axis
        if (Math.abs(vx) < combinedHalfWidths) {

          //A collision might be occuring. Check for a collision on the y axis
          if (Math.abs(vy) < combinedHalfHeights) {

            //There's definitely a collision happening
            // console.log('X', this.rere.X,  rereCenterX, this.rere.width)
            // console.log('rereHalfWidth', rereHalfWidth)
            // console.log('rereHalfHeight', rereHalfHeight)
            // console.log('itemHalfWidth', itemHalfWidth)
            // console.log('itemHalfHeight', itemHalfHeight)
            // console.log('vx', vx)
            // console.log('vy', vy)
            hit = true;
          } else {

            //There's no collision on the y axis
            hit = false;
          }
        } else {

          //There's no collision on the x axis
          hit = false;
        }

        // obj.y + obj.height > this.rere.Y + pxTop &&
        // this.rere.Y + this.rere.height - pxBottom > obj.y &&
        // obj.x + obj.width > this.rere.X + pxLeft &&
        // obj.x < this.rere.X + this.rere.width + pxRight &&
        // this.rere.direction === direction
        if (hit) {
          // console.log(itemWhole.items)
          this.collisionPosScore = {
            // 碰撞位置儲存
            x: obj.x,
            y: obj.y
          };
          this.collisionPosTime = {
            // 碰撞位置儲存
            x: obj.x,
            y: obj.y
          };
          this.controlScore = 20;
          var time = document.querySelector('.js-plus');
          var bomb = document.querySelector('.js-minus');
          if (time.className === 'js-plus' || bomb.className === 'js-minus') {
            this.controlTime = 50;
          }
          // 分數變動
          this.score += itemWhole.score;
          if (this.score < 0) {
            this.score = 0;
          }

          // this.score += itemWhole.score;
          this.$elScore.textContent = this.score;

          // 碰到啥，要畫出什麼效果圖
          this.collisionStyleScore = styleScore;
          this.collisionStyleTime = styleTime;

          // 碰到啥，要做時間秒數的加或減
          this.countDownTime -= itemWhole.seconds;

          // 如果接到是要扣秒數，給他一個秒數變red的動畫
          if (itemWhole.seconds > 0) {
            this.$elSec.classList.add("red");
            var _this = this;
            setTimeout(
              function () {
                this.$elSec.classList.remove("red");
              }.bind(this),
              1000
            );
          }
          // 如果接到加秒數，給他一個秒數變yellow的動畫
          if (itemWhole.seconds < 0) {
            this.$elSec.classList.add("yel");
            setTimeout(
              function () {
                this.$elSec.classList.remove("yel");
              }.bind(this),
              1000
            );
          }

          // 碰撞倒後，更改物件status值為0(不在畫它)，然後把所有值設為0
          // var temp = Object.assign({}, obj);
          // temp.status = 0;
          // temp.width = 0;
          // temp.height = 0;
          // temp.x = 9999999;
          // temp.y = 9999999;
          // console.log(itemWhole.items)
        }
        return !hit;
      }.bind(this)
    );
  };

  // 碰撞發生時
  this.collisionHappen = function () {
    //好物件的碰撞
    this.collisionDetection({
      item: this.itemGoodFall,
      styleScore: "good",
    });

    //炸彈的碰撞
    this.collisionDetection({
      item: this.bombFall,
      styleTime: "bomb",
    });

    //壞物件的碰撞
    this.collisionDetection({
      item: this.itemBadFall,
      styleScore: "bad",
    });

    //時鐘的碰撞
    this.collisionDetection({
      item: this.timePlus,
      styleTime: "time",
    });

  };

  this.drawOnlyRere = function () {
    this.rere.drawRere(this.ctx);
  };

  this.drawCountDown = function () {
    this.checkGameEnd();
    if (this.countDownTime <= 5) {
      document.querySelector('body').classList.add('game-red');
    } else { document.querySelector('body').classList.remove('game-red'); }
    if (this.countDownTime <= 0) {
      document.querySelector('body').classList.remove('game-red');
      this.$elMin.textContent = "00";
      this.$elSec.textContent = "00";
      return;
    }
    var min = moment("1970-01-01T00:00")
      .add(this.countDownTime, "seconds")
      .format("mm");

    var sec = moment("1970-01-01T00:00")
      .add(this.countDownTime, "seconds")
      .format("ss");

    this.$elMin.textContent = min;
    this.$elSec.textContent = sec;
  };

  // 動畫主要執行函式
  this.drawStart = function () {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawCountDown();
    this.drawOnlyRere();

    if (this.countDownTime <= 0) {
      return;
    }

    if (this.gamePrgress) {

      this.itemGoodFall.draw(this.ctx);
      this.bombFall.draw(this.ctx);
      this.itemBadFall.draw(this.ctx);
      this.timePlus.draw(this.ctx);

      this.collisionHappen();

      if (this.controlScore > 0) {
        this.controlScore -= 1;
        this.scorePlus.draw(this.ctx, this.collisionPosScore, this.collisionStyleScore);
      }
      if (this.controlScore == 0) {
        // console.log('stop');
        this.scorePlus.stop();
      }
      this.timeChange.change(this.collisionStyleTime);
      if (this.controlTime > 0) {
        this.controlTime -= 1;
        // console.log(this.controlTime)
      }
      if (this.controlTime == 0) {
        var time = document.querySelector('.js-plus');
        var bomb = document.querySelector('.js-minus');
        bomb.classList.remove('active');
        time.classList.remove('active');
      }
    }



    const now = performance.now();
    while (window._times.length > 0 && window._times[0] <= now - 1000) {
      // 超過一秒的踢出Array
      window._times.shift();
    }
    window._times.push(now);
    window._fps = window._times.length; // 一秒內能塞入Array多少便是fps
    window._frame = 60 / window._fps > 2 ? 2 : 60 / window._fps;// 補幀，最多快兩倍

    if (window.isDevMode) {
      // this.ctx.font = '30px Arial';
      // this.ctx.fillText(window._fps, 10, 40);
    }

    requestAnimationFrame(this.drawStart.bind(this));
  };

  // 倒數計時器
  this.startCountDown = function () {
    setInterval(
      function () {
        this.countDownTime--;
      }.bind(this),
      1000
    );
  };



  this.checkGameEnd = function () {
    if (this.countDownTime <= 0) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      console.log('Game End');
      this.dispatchEvent('gameEnd')
      this.canvas.classList.remove('start');
      this.canvas.classList.add('end');

      document.querySelector('#js-over').classList.add('active');
      document.querySelector('#js-over em').textContent = this.score;
      setTimeout(
        function () {
          document.querySelector('.game-title').classList.add('none');
          document.querySelector('.game-button_R').classList.add('none');
          document.querySelector('.game-button_L').classList.add('none');
          setTimeout(
            function () {
              document.querySelector('#js-over').classList.add('active-second');
            }, 500
          );
        },
        500
      );
    }
  }

  this.audioInit = function () {
    // 音樂播放
    var audioList = ["./images/mainMusic.mp3"];
    this.audio = document.querySelector(".mainMusic");
    this.audio.src = audioList[0];
  };

  this.init = function () {
    this.drawStart();
  }

  this.gameStart = function () {
    // 初始化
    console.log('click');

    this.audio.play();

    // this.$elLoader.classList.remove('is-active');
    this.canvas.classList.add('start');
    document.querySelector('.game-title-readyBox').classList.add('active')
    setTimeout(
      function () {
        this.gamePrgress = true;
        this.startCountDown();
      }.bind(this),
      4000
    );
  };

  this.audioInit();
  this.init();
}

// 物件 瑞瑞 ReRe
function ReRe(canvas, rwd) {

  var rightImg = new Image();
  var leftImg = new Image();
  var defaultImg = new Image();
  rightImg.src = "./images/img-rereRight.png";
  leftImg.src = "./images/img-rereLeft.png";
  defaultImg.src = "./images/img-rereDefault.png";

  this.image = {
    // 瑞瑞向左向右移動的圖片
    right: rightImg,
    left: leftImg,
    default: defaultImg
  };

  this.X = canvas.width / 2 - 100; // 瑞瑞的X座標
  this.Y = canvas.height - rwd.rwdParam.ReRe[1] - rwd.rwdParam.btn + 20; // 瑞瑞的Y座標

  this.rightPressed = false; // 瑞瑞向左移動
  this.leftPressed = false; // 瑞瑞向右移動
  this.direction = "default"; // 瑞瑞的方向

  this.width = rwd.rwdParam.ReRe[0]; // 瑞瑞的寬
  this.height = rwd.rwdParam.ReRe[1]; // 瑞瑞的高
  this.width_d = rwd.rwdParam.ReRe[2];
  this.height_d = rwd.rwdParam.ReRe[3];
  this.drawRere = function (ctx) {
    // 畫瑞瑞
    // if(this.rightPressed && this.leftPressed){
    //   this.X += 0;
    // }    
    if (this.rightPressed && this.X < canvas.width - this.width) {
      this.X += 16 * window._frame;
    }
    if (this.leftPressed && this.X > 0) {
      this.X -= 16 * window._frame;
    }
    if (this.X < 0) {
      this.X = 0
    }

    this.direction = !this.rightPressed && !this.leftPressed ? "default" : this.leftPressed ? 'left' : 'right';
    const img = this.image[this.direction];

    ctx.fillText(img.src, canvas.width - 10, canvas.height + 20);
    ctx.drawImage(img, this.X, this.Y, this.direction === 'default' ? this.width_d : this.width, this.direction === 'default' ? this.height_d : this.height);
  };
  this.keyDownHandler = function (e) {
    // console.log(e.target.className)
    // console.log(e.keyCode)
    if (e.keyCode == 39) {
      this.rightPressed = true;
      this.leftPressed = false;
    }
    if (e.keyCode == 37) {
      this.rightPressed = false;
      this.leftPressed = true;
    }
    if (e.target.className === "R") {
      console.log(e.touches)
      this.rightPressed = true;
      this.leftPressed = false;
    }
    if (e.target.className === "L") {
      console.log(e.touches.length)
      this.rightPressed = false;
      this.leftPressed = true;
    }
  };

  this.keyUpHandler = function (e) {
    if (e.keyCode == 39) {
      this.rightPressed = false;
      this.direction = "default";
    }
    if (e.keyCode == 37) {
      this.leftPressed = false;
      this.direction = "default";
    }
    // e.preventDefault();
    // console.log('touchend'+a)
    // console.log(e.touches.length)  && e.touches.length === 0
    if (e.target.className === "R") {
      this.rightPressed = false;
      this.direction = "default";
    }
    if (e.target.className === "L") {
      // console.log(e.target.className)
      this.leftPressed = false;
      this.direction = "default";
    }
  };

  this.rereListenerEvent = function () {
    // 註冊ReRe的相關監聽事件
    //rere 鍵盤移動監聽
    document.addEventListener("keydown", this.keyDownHandler.bind(this), false);
    document.addEventListener("keyup", this.keyUpHandler.bind(this), false);
    // rere移動監聽 - 手機touch
    document.addEventListener("touchstart", this.keyDownHandler.bind(this), false);
    document.addEventListener("touchend", this.keyUpHandler.bind(this), false);

    // document.addEventListener("click", this.keyDownHandler.bind(this), false);
  };
  // 移除android手機長按
  function absorbEvent_(event) {
    var e = event;
    // e.preventDefault && e.preventDefault();
    // e.stopPropagation && e.stopPropagation();
    // e.cancelBubble = true;
    // e.returnValue = false;
    return false;
  }

  function preventLongPressMenu(node) {
    node.ontouchstart = absorbEvent_;
    // node.ontouchmove = absorbEvent_;
    // node.ontouchend = absorbEvent_;
    // node.ontouchcancel = absorbEvent_;
  }

  preventLongPressMenu(document.querySelector(".R"));
  preventLongPressMenu(document.querySelector(".L"));

  this.rereListenerEvent();
}

// 建立物件落下的方法，讓各種物件可以套用此方法
function ItemFall(item, canvas, rwd, checkerBoard) {
  this.itemAll = item;

  // 畫出物件
  this.draw = function (ctx) {
    this.itemAll.items.forEach(function (obj, index) {
      // status為1，才繼續畫圖
      if (obj.status === 1) {
        ctx.drawImage(obj.image, obj.x, obj.y, obj.width, obj.height);
      }
    });
    this.move();
  };

  // 物件的移動
  this.move = function () {
    var _this = this;
    this.itemAll.items = this.itemAll.items.map(function (obj, index) {
      var temp = Object.assign({}, obj);
      if (temp.status === 0) {
        return temp;
      }
      temp.y += temp.ys * window._frame;
      if (temp.y > canvas.height) {
        temp.status = 0;
      }
      return temp;
    }).filter(obj => obj.status !== 0);
  };

  this.getScale = function () {
    var randomNum = Math.random() * rwd.rwdParam.maxScale;
    return randomNum < this.itemAll.minScale ? this.getScale() : randomNum;
  };

  this.initialize = function () {
    console.log("initialize ItemFall");
    //  創建產出的物件，指定好個數為maxItems個
    for (var a = 0; a < this.itemAll.maxItems * 4; a++) {
      // 定義每張圖縮放大小
      let config = this.getConfig();
      config.image = new Image();
      var style = a % this.itemAll.image.length;
      config.image.src = "./images/" + this.itemAll.image[style];

      this.itemAll.items.push(config);
    }
    console.log(this.itemAll.items);
  };

  this.getConfig = function () {
    var _this = this;
    let length = checkerBoard.length;
    let h = canvas.height / 3;
    let w = canvas.width / 4;
    let xNum = Math.floor(Math.random() * 4)
    // 這邊的length ， 控制陣列的行數不會突然爆棚
    let yNum = Math.floor(Math.random() * (length + 1))

    //如果是新的一行，先把新的一行初始化設為0,0,0,0
    if (!checkerBoard[yNum]) {
      checkerBoard[yNum] = [0, 0, 0, 0];
    }
    //確定陣列值，是此物件沒畫過的(在這行中，如果有相同物件)，是沒有別的物件畫過的（不同物件不重疊）
    let isOk = checkerBoard[yNum].every(function (item, index) {
      return (item !== _this.itemAll.id) && checkerBoard[yNum][xNum] === 0;
    });

    if (isOk) {
      checkerBoard[yNum][xNum] = this.itemAll.id;
      var scale = this.getScale();

      var height = scale * this.itemAll.height;
      var width = scale * this.itemAll.width;

      return {
        x: (xNum + 1) * w - (w / 2) - (width / 2),
        y: -((yNum + 1) * h + (height / 2)),
        width: width,
        height: height,
        checkerBoardX: xNum,
        checkerBoardY: yNum,
        ys: this.itemAll.speed,  // 移動速度
        status: 1,
      }
    } else {
      return this.getConfig();
    }
  }

  this.initialize();
}


function ScorePlus() {
  // 特效相關動畫
  this.plusOption = {
    // width:88,
    // height:29,
    imgX: -100,
    imgY: -100,
    ys: 6,
    alpha: 10
  };

  this.plusImg = new Image();
  this.minusImg = new Image();
  // this.fireworksImg = new Image();

  this.plusImg.src = "./images/img-plus.png";
  this.minusImg.src = "./images/img-minus.png";
  // this.fireworksImg.src = "./images/fireworks.png";

  this.draw = function (ctx, collisionPos, collisionStyle) {
    this.plusOption.imgX = collisionPos.x;
    this.plusOption.imgY = collisionPos.y -= this.plusOption.ys;

    if (collisionStyle === "good") {
      ctx.drawImage(
        this.plusImg,
        this.plusOption.imgX,
        this.plusOption.imgY,
        this.plusImg.width / 1.5,
        this.plusImg.height / 1.5
      );
      // ctx.drawImage(
      //   this.fireworksImg,
      //   this.plusOption.imgX,
      //   this.plusOption.imgY + 40,
      //   this.fireworksImg.width,
      //   this.fireworksImg.height
      // );
    }
    if (collisionStyle === "bad") {
      ctx.drawImage(
        this.minusImg,
        this.plusOption.imgX,
        this.plusOption.imgY,
        this.minusImg.width / 1.5,
        this.minusImg.height / 1.5
      );
    }
  };

  this.stop = function () {
    this.plusOption.imgX = -100;
    this.plusOption.imgY = -100;
  };
}

function TimeChange() {
  this.change = function (collisionStyle) {
    var bomb = document.querySelector('.js-minus');
    var time = document.querySelector('.js-plus');
    // console.log(collisionStyle)
    if (collisionStyle === "bomb") {
      bomb.classList.add('active');
      // setTimeout(bomb.classList.remove('active'),2000);
    } else if (collisionStyle === "time") {
      time.classList.add('active');
      // setTimeout(time.classList.remove('active'),2000);
    }
  }
}

// rwd偵測，調整大小
function Rwd() {
  this.rwd = [
    {
      width: 414,
      ReRe: [200, 255, 200, 285],
      btn: 200,
      maxScale: 0.8,
      speedMinus: 0,
      good: {
        minScale: 0.6,
        score: 1,
        seconds: 0
      },
      bad: {
        minScale: 0.6,
        score: -1,
        seconds: 0
      },
      bomb: {
        minScale: 0.6,
        score: 0,
        seconds: 5
      },
      clock: {
        minScale: 0.6,
        score: 0,
        seconds: -3
      }
    },

    {
      width: 360,
      ReRe: [150, 190, 150, 214],
      btn: 150,
      maxScale: 0.7,
      speedMinus: 0,
      good: {
        minScale: 0.5,
        score: 1,
        seconds: 0
      },
      bad: {
        minScale: 0.5,
        score: -1,
        seconds: 0
      },
      bomb: {
        minScale: 0.5,
        score: 0,
        seconds: 5
      },
      clock: {
        minScale: 0.5,
        score: 0,
        seconds: -3
      }
    },

    {
      width: 320,
      ReRe: [120, 152, 120, 170],
      btn: 150,
      maxScale: 0.6,
      speedMinus: 1,
      good: {
        minScale: 0.4,
        score: 1,
        seconds: 0
      },
      bad: {
        minScale: 0.4,
        score: -1,
        seconds: 0
      },
      bomb: {
        minScale: 0.4,
        score: 0,
        seconds: 5
      },
      clock: {
        minScale: 0.4,
        score: 0,
        seconds: -3
      }
    }
  ]

  this.rwdParam = this.rwd.find(
    function (obj) {
      var W = window.innerWidth;
      return W >= obj.width
    }
  );

}


// 視窗比例偵測
function Ratio() {
  this.ratio = [
    {
      ratio: 0.67,
      good: {
        minus: 8,
      },
      bad: {
        minus: 7,
      },
      bomb: {
        minus: 2,
      },
      clock: {
        minus: 1,
      },
    },
    {
      ratio: 0.4,
      good: {
        minus: 0,
      },
      bad: {
        minus: 0,
      },
      bomb: {
        minus: 0,
      },
      clock: {
        minus: 0,
      },
    }
  ];

  this.ratioParam = this.ratio.find(
    function (obj) {
      var H = window.innerHeight;
      var W = window.innerWidth;
      //越接近1，代表裝置越正方形
      var clientRatio = (W / H).toFixed(4);
      console.log('aaa', clientRatio)
      return clientRatio > obj.ratio
    }
  );
}

// var catchGame = new CatchGame('level_4');
// catchGame.gameStart();

export default CatchGame;
