const ROWS = 20
const COLS = 20
const SIZE = 20

const WIDTH = ROWS * SIZE
const HEIGHT = COLS * SIZE

const INITIAL_SNAKE_LENGTH = 3

const BACKGROUND_COLOR = '#000'
const SNAKE_BODY_COLOR = '#9469d7'
const SNAKE_HEAD_COLOR = '#efbd75'
const FOOD_COLOR = '#70c2b4'

const canvas = document.createElement('canvas')
const ctx = canvas.getContext('2d')

const scoreElement = document.getElementById('score')
const highScoreElement = document.getElementById('high-score')

document.body.appendChild(canvas)
canvas.width = WIDTH
canvas.height = HEIGHT

highScoreElement.innerText = localStorage.getItem('highScore') || 0

function isSamePoint(point1, point2) {
  return point1.x === point2.x && point1.y === point2.y
}

class Point {
  constructor(x, y) {
    this.x = x
    this.y = y
  }
}

class Food {
  constructor(game) {
    this.game = game
    this.init()
  }

  init() {
    this.generate()
  }

  draw() {
    ctx.fillStyle = FOOD_COLOR
    ctx.fillRect(this.point.x * SIZE, this.point.y * SIZE, SIZE, SIZE)
  }

  generate() {
    while (true) {
      const newPoint = new Point(Math.floor(Math.random() * ROWS), Math.floor(Math.random() * COLS))
      if (!this.game.snake.isPointInSnake(newPoint)) {
        this.point = newPoint
        break
      }
    }
  }
}

class Snake {
  constructor(game) {
    this.game = game
    this.init()
    this.loop()
    this.onKey()
  }

  init() {
    this.dots = Array.from({ length: INITIAL_SNAKE_LENGTH }, (_, i) => new Point(i, 0))
    this.direction = 'right'
    this.isBlock = false
  }

  getHead() {
    return this.dots[this.dots.length - 1]
  }

  getTail() {
    return this.dots[0]
  }

  draw() {
    this.dots.forEach(dot => {
      ctx.fillStyle = isSamePoint(dot, this.getHead()) ? SNAKE_HEAD_COLOR : SNAKE_BODY_COLOR
      ctx.fillRect(dot.x * SIZE, dot.y * SIZE, SIZE, SIZE)
    })
  }

  move() {
    switch (this.direction) {
      case 'right':
        this.dots.push(new Point(this.getHead().x + 1, this.getHead().y))
        break
      case 'left':
        this.dots.push(new Point(this.getHead().x - 1, this.getHead().y))
        break
      case 'up':
        this.dots.push(new Point(this.getHead().x, this.getHead().y - 1))
        break
      case 'down':
        this.dots.push(new Point(this.getHead().x, this.getHead().y + 1))
        break
    }

    if (this.isEat()) {
      this.game.food.generate()
    } else if (this.isBiteBody() || this.isCollideWall()) {
      this.game.gameOver()
    } else {
      this.dots.shift()
    }

    const highScore = localStorage.getItem('highScore') || 0
    if (this.dots.length > highScore) {
      localStorage.setItem('highScore', this.dots.length)
      highScoreElement.innerText = this.dots.length
    }
    scoreElement.innerText = this.dots.length
  }

  isEat() {
    return isSamePoint(this.getHead(), this.game.food.point)
  }

  isBiteBody() {
    return this.dots.slice(0, -1).some(dot => isSamePoint(dot, this.getHead()))
  }

  isCollideWall() {
    return (
      this.getHead().x < 0 ||
      this.getHead().x >= ROWS ||
      this.getHead().y < 0 ||
      this.getHead().y >= COLS
    )
  }

  isPointInSnake(point) {
    return this.dots.some(dot => isSamePoint(point, dot))
  }

  onKey() {
    document.addEventListener('keydown', e => {
      if (this.isBlock) return

      switch (e.key) {
        case 'ArrowRight':
          this.direction !== 'left' && (this.direction = 'right')
          break
        case 'ArrowLeft':
          this.direction !== 'right' && (this.direction = 'left')
          break
        case 'ArrowUp':
          this.direction !== 'down' && (this.direction = 'up')
          break
        case 'ArrowDown':
          this.direction !== 'up' && (this.direction = 'down')
          break
      }
      this.isBlock = true
    })
  }

  loop() {
    this.loopRef && clearInterval(this.loopRef)

    this.loopRef = setInterval(() => {
      this.isBlock = false
      this.move()
    }, 100)
  }
}

class Game {
  constructor() {
    this.init()
    this.loop()
  }

  init() {
    this.snake = new Snake(this)
    this.food = new Food(this)
    this.isGameOver = false
  }

  gameOver() {
    this.snake.init()
    this.food.init()
  }

  draw() {
    ctx.fillStyle = BACKGROUND_COLOR
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    this.food.draw()
    this.snake.draw()
  }

  loop() {
    if (this.isGameOver) return
    this.draw()
    requestAnimationFrame(() => this.loop())
  }
}

const game = new Game()
