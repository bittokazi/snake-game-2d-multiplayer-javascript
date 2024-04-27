import { Food } from "../app/Food";
import { InputController } from "../app/InputController";
import { Snake } from "../app/Snake";
import { GridSystem } from "./GridSystem";

export class GameEngine {
  constructor() {
    this.canvas = document.getElementById("canvas");
    this.context = this.canvas.getContext("2d");
    return this;
  }

  initialize(bgColor, uuid, room, sendMove, sendEat) {
    console.log("Game Engine Initiated");
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
    this.room = room;
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
        this.end
      ).init();
    });
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
      console.log(movement);
      this.snakes[uuid].move(movement);
      sendMove({
        movement,
        gridX: this.snakes[uuid].gridX,
        gridY: this.snakes[uuid].gridY,
        body: this.snakes[uuid].body,
        directionQueue: this.snakes[uuid].directionQueue,
      });

      //this.snake.move(movement);
    }).init();
    this.update();
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
        snake.update();
        snake.draw();
      });
      this.food.draw();
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

  endGame() {
    this.end = true;

    Object.values(this.snakes).forEach((player) => {
      player.endGame();
    });
  }
}
