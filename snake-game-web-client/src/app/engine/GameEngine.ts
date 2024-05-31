import { Food } from "../entities/Food";
import { InputController } from "../controls/InputController";
import { Snake } from "../entities/Snake";
import { SnakeDirection } from "../models/SnakeDirection";
import { TextObject } from "../entities/TextObject";
import { Timer } from "./Timer";
import { GridSystem } from "./GridSystem";

export class GameEngine {
  static GAME_START_TIME: number = 5;

  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private snakes: Map<String, Snake> = new Map();
  private gridSystem: GridSystem;
  private end: boolean = false;
  private lost: boolean = false;
  private started: boolean = false;
  private food: Food;
  private yourColorText: TextObject;
  private loseText: TextObject;
  private winText: TextObject;
  private startText: TextObject;
  private startTimer: Timer;
  private isExit: boolean = false;
  private gameEngineInstanceId = Math.random().toString(36).substring(7);
  private inputController: InputController;

  constructor(
    private uuid: string,
    private room: any,
    private bgColor: string,
    private sendEat: (data: any) => void,
    private sendMove: (data: any) => void
  ) {
    this.canvas = <HTMLCanvasElement>document.getElementById("canvas");
    this.context = this.canvas.getContext("2d");
  }

  initialize(): GameEngine {
    console.log("⏳ Starting Game Engine...");
    this.context.fillStyle = this.bgColor;
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.gridSystem = new GridSystem(
      this.canvas,
      this.context,
      30,
      30
    ).generateGrid(false);

    //).testGrid();
    this.food = new Food(
      // this.generateFoodPosition(),
      // this.generateFoodPosition(),
      this.room.food.x,
      this.room.food.y,
      this.gridSystem
    );

    this.room.players.map((player: any) => {
      this.snakes.set(
        player.id,
        new Snake(
          player.gridX,
          player.gridY,
          player.size,
          player.direction as SnakeDirection,
          this.gridSystem,
          this.food,
          player.fillColor,
          player.id == this.uuid ? this.sendEat : null,
          this.end,
          player.id == this.uuid ? this.lostListner : null
        ).init()
      );
      if (player.id == this.uuid) {
        this.yourColorText = new TextObject(
          this.context,
          `Your color ${player.fillColor}`,
          parseInt(`${this.canvas.width / 2}`) - 210,
          parseInt(`${this.canvas.height / 2}`) - 70,
          player.fillColor
        );
      }
    });
    this.loseText = new TextObject(
      this.context,
      "You Lose",
      parseInt(`${this.canvas.width / 2}`) - 100,
      parseInt(`${this.canvas.height / 2}`) - 40
    );
    this.winText = new TextObject(
      this.context,
      "You Win",
      parseInt(`${this.canvas.width / 2}`) - 85,
      parseInt(`${this.canvas.height / 2}`) - 40
    );
    this.startText = new TextObject(
      this.context,
      `Game Starts in ${GameEngine.GAME_START_TIME}`,
      parseInt(`${this.canvas.width / 2}`) - 210,
      parseInt(`${this.canvas.height / 2}`) - 10,
      "rgb(76, 86, 106)"
    );
    this.startTimer = new Timer(1000, GameEngine.GAME_START_TIME, (count) => {
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
    this.inputController = new InputController((direction: SnakeDirection) => {
      console.log("💠 Move command ⏩ ", direction);
      if (this.started) {
        this.snakes.get(this.uuid).move(direction);
        this.sendMove({
          direction,
          gridX: this.snakes.get(this.uuid).gridX,
          gridY: this.snakes.get(this.uuid).gridY,
          body: this.snakes.get(this.uuid).body,
          directionQueue: this.snakes.get(this.uuid).directionQueue,
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
    let canvas = (time: any) => {
      if (this.isExit) return;
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
      for (let snake of this.snakes.values()) {
        if (this.started) {
          snake.update();
        }
        snake.draw();
      }
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

  updatePlayer(data: any) {
    this.snakes.get(data.id).gridX = data.gridX;
    this.snakes.get(data.id).gridY = data.gridY;
    this.snakes.get(data.id).body = data.body;
    this.snakes.get(data.id).directionQueue = data.directionQueue;
    //this.snakes[data.id]= move(data.movement);
  }

  setFood(data: any) {
    this.food.x = data.food.x;
    this.food.y = data.food.y;
  }

  eaten(data: any) {
    if (data.winner == this.uuid) {
      this.snakes.get(this.uuid).eaten();
    }
  }

  lostListner = () => {
    this.lost = true;
  };

  endGame(data: any) {
    this.end = true;

    if (this.uuid == data.winner) {
      this.lost = false;
    } else {
      this.lost = true;
    }
    for (let player of this.snakes.values()) {
      player.endGame();
    }
  }

  exit() {
    this.inputController.clearInputListners();
    this.isExit = true;
  }
}
