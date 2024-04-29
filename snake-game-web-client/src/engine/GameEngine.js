import { Food } from "../app/Food";
import { InputController } from "../app/InputController";
import { Snake } from "../app/Snake";
import { TextObject } from "../app/TextObject";
import { Timer } from "../app/Timer";
import { GridSystem } from "./GridSystem";

export class GameEngine {
  constructor() {
    this.canvas = document.getElementById("canvas");
    this.context = this.canvas.getContext("2d");
    return this;
  }

  initialize(bgColor, uuid, room, sendMove, sendEat) {
    console.log("⏳ Starting Game Engine...");
    const GAME_START_TIME = 5;
    this.uuid = uuid;
    this.sendEat = sendEat;
    this.snakes = {};
    this.context.fillStyle = bgColor;
    this.context.fillRect(0, 0, canvas.width, canvas.height);
    this.gridSystem = new GridSystem(
      this.canvas,
      this.context,
      30,
      30
    ).generateGrid(false);
    this.end = false;
    this.lost = false;
    this.room = room;
    this.started = false;
    //).testGrid();
    this.food = new Food(
      // this.generateFoodPosition(),
      // this.generateFoodPosition(),
      room.food.x,
      room.food.y,
      this.gridSystem
    );
    room.players.map((player) => {
      this.snakes[player.id] = new Snake(
        player.gridX,
        player.gridY,
        player.size,
        player.direction,
        this.gridSystem,
        this.food,
        player.fillColor,
        player.id == uuid ? sendEat : null,
        this.end,
        player.id == uuid ? this.lostListner : null
      ).init();
      this.yourColorText = new TextObject(
        this.context,
        `Your color ${player.fillColor}`,
        parseInt(this.canvas.width / 2) - 210,
        parseInt(this.canvas.height / 2) - 70,
        player.fillColor
      );
    });
    this.loseText = new TextObject(
      this.context,
      "You Lose",
      parseInt(this.canvas.width / 2) - 100,
      parseInt(this.canvas.height / 2) - 40
    );
    this.winText = new TextObject(
      this.context,
      "You Win",
      parseInt(this.canvas.width / 2) - 85,
      parseInt(this.canvas.height / 2) - 40
    );
    this.startText = new TextObject(
      this.context,
      `Game Starts in ${GAME_START_TIME}`,
      parseInt(this.canvas.width / 2) - 210,
      parseInt(this.canvas.height / 2) - 10,
      "rgb(76, 86, 106)"
    );
    this.startTimer = new Timer(1000, GAME_START_TIME, (count) => {
      this.startText.update(`Game Starts in ${count}`);
      console.log(`⏳ Game Starts in ${count}`);
      if (count == 0) {
        this.started = true;
      }
    });
    this.startTimer.start();
    // this.snake = new Snake(
    //   10,
    //   0,
    //   3,
    //   "right",
    //   this.gridSystem,
    //   this.food,
    //   "yellow"
    // ).init();
    new InputController((movement) => {
      console.log("💠 Move command ⏩ ", movement);
      if (this.started) {
        this.snakes[uuid].move(movement);
        sendMove({
          movement,
          gridX: this.snakes[uuid].gridX,
          gridY: this.snakes[uuid].gridY,
          body: this.snakes[uuid].body,
          directionQueue: this.snakes[uuid].directionQueue,
        });
      }
      //this.snake.move(movement);
    }).init();
    this.update();
    console.log("🚀 Game Engine Initiated");
    return this;
  }

  update() {
    const FRAMES_PER_SECOND = 30;
    const FRAME_MIN_TIME =
      (1000 / 60) * (60 / FRAMES_PER_SECOND) - (1000 / 60) * 0.5;
    let lastFrameTime = 0;
    let canvas = (time) => {
      if (time - lastFrameTime < FRAME_MIN_TIME) {
        requestAnimationFrame(canvas);
        return;
      }
      lastFrameTime = time;
      //this.context.globalCompositeOperation = "destination-over";
      this.context.save();
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height); // clear canvas
      this.context.fillStyle = "#a5d8ff";
      this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
      //this.snake.update();
      Object.values(this.snakes).map((snake) => {
        if (this.started) {
          snake.update();
        }
        snake.draw();
      });
      if (this.lost) {
        this.loseText.draw();
      } else if (this.end && !this.lost) {
        this.winText.draw();
      }
      if (!this.end) {
        this.food.draw();
      }
      if (!this.started) {
        this.startText.draw();
        this.yourColorText.draw();
      }
      this.context.restore();
      requestAnimationFrame(canvas);
    };
    requestAnimationFrame(canvas);
  }

  generateFoodPosition() {
    return Math.floor(Math.random() * 19 + 0);
  }

  updatePlayer(data) {
    this.snakes[data.id].gridX = data.gridX;
    this.snakes[data.id].gridY = data.gridY;
    this.snakes[data.id].body = data.body;
    this.snakes[data.id].directionQueue = data.directionQueue;
    //this.snakes[data.id]= move(data.movement);
  }

  setFood(data) {
    this.food.x = data.food.x;
    this.food.y = data.food.y;
  }

  eaten(data) {
    if (data.winner == this.uuid) {
      this.snakes[this.uuid].eaten();
    }
  }

  lostListner = () => {
    this.lost = true;
  };

  endGame() {
    this.end = true;

    Object.values(this.snakes).forEach((player) => {
      player.endGame();
    });
  }
}
