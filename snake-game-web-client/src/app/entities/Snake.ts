import { GridSystem } from "../engine/GridSystem";
import { Food } from "./Food";
import { SnakeBody } from "../models/SnakeBody";
import { SnakeDirection } from "../models/SnakeDirection";
import { SnakeMovement } from "../models/SnakeMovement";

export class Snake {
  private static SPEED = 5;
  public body: SnakeBody[] = [];
  public directionQueue: SnakeMovement[] = [];

  private updateTime: number = 0;
  private updateLock: boolean = false;
  private dead: boolean = false;
  private eatingLock: boolean = false;
  private newBodyPart: SnakeBody[] = [];

  constructor(
    public gridX: number,
    public gridY: number,
    private size: number,
    private direction: SnakeDirection,
    private gridSystem: GridSystem,
    private food: Food,
    private fillColor: string,
    private sendEat: (data: any) => void,
    private end: boolean,
    private lostListner: () => void
  ) {}

  init(): Snake {
    for (let i = 0; i < this.size; i++) {
      let grid = this.gridSystem.grids[this.gridX][this.gridY];
      grid.fillColor = this.fillColor;
      grid.draw();
      this.body.push({
        x: this.gridX,
        y: this.gridY,
        direction: this.direction,
      });
      if (this.direction == SnakeDirection.RIGHT) {
        this.gridY++;
      } else if (this.direction == SnakeDirection.LEFT) {
        this.gridY--;
      } else if (this.direction == SnakeDirection.UP) {
        this.gridX--;
      } else if (this.direction == SnakeDirection.DOWN) {
        this.gridX++;
      }
    }
    return this;
  }

  move(direction: SnakeDirection) {
    if (!this.updateLock && !this.eatingLock) {
      if (
        this.body[this.body.length - 1].direction == SnakeDirection.UP &&
        direction == SnakeDirection.DOWN
      ) {
        return;
      }
      if (
        this.body[this.body.length - 1].direction == SnakeDirection.DOWN &&
        direction == SnakeDirection.UP
      ) {
        return;
      }
      if (
        this.body[this.body.length - 1].direction == SnakeDirection.RIGHT &&
        direction == SnakeDirection.LEFT
      ) {
        return;
      }
      if (
        this.body[this.body.length - 1].direction == SnakeDirection.LEFT &&
        direction == SnakeDirection.RIGHT
      ) {
        return;
      }
      let movement = {
        ...this.body[this.body.length - 1],
        direction,
      };
      this.directionQueue.push(movement);
    }
  }

  update() {
    if (this.updateTime > 1000 / Snake.SPEED) {
      if (!this.dead && !this.end) {
        let addNewBody = () => {
          if (this.newBodyPart.length > 0) {
            for (let k = 0; k < this.newBodyPart.length; k++) {
              this.body = [
                {
                  ...this.newBodyPart[k],
                },
              ].concat(this.body);
              this.newBodyPart.splice(k, 1);
              k--;
            }
          }
        };
        if (this.directionQueue.length > 0) {
          this.updateLock = true;
          addNewBody();
          for (let i = 0; i < this.directionQueue.length; i++) {
            let found = false;
            for (let j = this.body.length - 1; j >= 0; j--) {
              if (
                this.directionQueue[i].x == this.body[j].x &&
                this.directionQueue[i].y == this.body[j].y
              ) {
                found = true;
                this.body[j].direction = this.directionQueue[i].direction;
              }
            }

            if (!found) {
              this.directionQueue.splice(i, 1);
              i--;
            }
          }
          this.updateLock = false;
        } else {
          this.updateLock = true;
          addNewBody();
          this.updateLock = false;
        }

        for (let i = this.body.length - 1; i >= 0; i--) {
          if (this.body[i].direction == SnakeDirection.RIGHT) {
            this.body[i].y++;
          } else if (this.body[i].direction == SnakeDirection.LEFT) {
            this.body[i].y--;
          } else if (this.body[i].direction == SnakeDirection.UP) {
            this.body[i].x--;
          } else if (this.body[i].direction == SnakeDirection.DOWN) {
            this.body[i].x++;
          }
        }
        // wall collision check
        if (
          this.gridSystem.grids.length - 1 <
            this.body[this.body.length - 1].x ||
          0 > this.body[this.body.length - 1].x ||
          this.gridSystem.grids[0].length - 1 <
            this.body[this.body.length - 1].y ||
          0 > this.body[this.body.length - 1].y
        ) {
          this.dead = true;
          if (this.lostListner) this.lostListner();
        }
      }

      this.updateTime = 0;
    }
    this.updateTime += 30;
  }

  draw() {
    for (let i = 0; i < this.body.length; i++) {
      if (
        this.gridSystem.grids[this.body[i].x] &&
        this.gridSystem.grids[this.body[i].x][this.body[i].y]
      ) {
        let grid = this.gridSystem.grids[this.body[i].x][this.body[i].y];
        grid.fillColor = this.fillColor;
        grid.draw();
      }
    }
    // for (let i = 0; i < this.body.length; i++) {
    let collision = false;
    if (
      this.body[this.body.length - 1].direction == SnakeDirection.RIGHT &&
      this.food.x == this.body[this.body.length - 1].x &&
      this.food.y == this.body[this.body.length - 1].y
    ) {
      collision = true;
    } else if (
      this.body[this.body.length - 1].direction == SnakeDirection.LEFT &&
      this.food.x == this.body[this.body.length - 1].x &&
      this.food.y == this.body[this.body.length - 1].y
    ) {
      collision = true;
    } else if (
      this.body[this.body.length - 1].direction == SnakeDirection.UP &&
      this.food.x == this.body[this.body.length - 1].x &&
      this.food.y == this.body[this.body.length - 1].y
    ) {
      collision = true;
    } else if (
      this.body[this.body.length - 1].direction == SnakeDirection.DOWN &&
      this.food.x == this.body[this.body.length - 1].x &&
      this.food.y == this.body[this.body.length - 1].y
    ) {
      collision = true;
    }
    if (collision) {
      if (this.sendEat)
        this.sendEat({
          x: this.body[this.body.length - 1].x,
          y: this.body[this.body.length - 1].y,
        });
    }
    if (collision) {
      // this.food.x = this.generateFoodPosition();
      // this.food.y = this.generateFoodPosition();
    }
    // }
  }

  generateFoodPosition() {
    return Math.floor(Math.random() * 19 + 0);
  }

  eaten() {
    this.eatingLock = true;
    let p;
    let x = this.body[0].x;
    let y = this.body[0].y;
    let direction = this.body[0].direction;
    if (direction == SnakeDirection.RIGHT) {
      p = {
        x,
        y: y - 1,
      };
    } else if (direction == SnakeDirection.LEFT) {
      p = {
        x,
        y: y + 1,
      };
    } else if (direction == SnakeDirection.UP) {
      p = {
        x: x + 1,
        y,
      };
    } else if (direction == SnakeDirection.DOWN) {
      p = {
        x: x - 1,
        y,
      };
    }
    this.newBodyPart.push({
      ...p,
      direction: direction,
    });
    this.eatingLock = false;
  }

  endGame() {
    this.end = true;
  }
}
