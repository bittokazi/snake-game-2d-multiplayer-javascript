export class Snake {
  constructor(
    gridX,
    gridY,
    size,
    direction,
    gridSystem,
    food,
    fillColor,
    sendEat,
    end,
    lostListner
  ) {
    this.gridX = gridX;
    this.gridY = gridY;
    this.size = size;
    this.body = [];
    this.direction = direction;
    this.gridSystem = gridSystem;
    this.directionQueue = [];
    this.SPEED = 5;
    this.updateTime = 0;
    this.food = food;
    this.updateLock = false;
    this.fillColor = fillColor;
    this.sendEat = sendEat;
    this.dead = false;
    this.end = end;
    this.lostListner = lostListner;
    return this;
  }

  init() {
    for (let i = 0; i < this.size; i++) {
      let grid = this.gridSystem.grids[this.gridX][this.gridY];
      grid.fillColor = this.fillColor;
      grid.draw();
      this.body.push({
        x: this.gridX,
        y: this.gridY,
        direction: this.direction,
      });
      if (this.direction == "right") {
        this.gridY++;
      } else if (this.direction == "left") {
        this.gridY--;
      } else if (this.direction == "up") {
        this.gridX--;
      } else if (this.direction == "down") {
        this.gridX++;
      }
    }
    return this;
  }

  move(direction) {
    if (!this.updateLock) {
      if (
        this.body[this.body.length - 1].direction == "up" &&
        direction == "down"
      ) {
        return;
      }
      if (
        this.body[this.body.length - 1].direction == "down" &&
        direction == "up"
      ) {
        return;
      }
      if (
        this.body[this.body.length - 1].direction == "right" &&
        direction == "left"
      ) {
        return;
      }
      if (
        this.body[this.body.length - 1].direction == "left" &&
        direction == "right"
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
    if (this.updateTime > 1000 / this.SPEED) {
      if (!this.dead && !this.end) {
        if (this.directionQueue.length > 0) {
          this.updateLock = true;
          for (let i = 0; i < this.directionQueue.length; i++) {
            let found = false;
            for (let j = 0; j < this.body.length; j++) {
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
        }

        for (let i = 0; i < this.body.length; i++) {
          if (this.body[i].direction == "right") {
            this.body[i].y++;
          } else if (this.body[i].direction == "left") {
            this.body[i].y--;
          } else if (this.body[i].direction == "up") {
            this.body[i].x++;
          } else if (this.body[i].direction == "down") {
            this.body[i].x--;
          }
        }
        // wall collision check
        if (
          this.gridSystem.grids.length < this.body[this.body.length - 1].x ||
          0 > this.body[this.body.length - 1].x ||
          this.gridSystem.grids[0].length < this.body[this.body.length - 1].y ||
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
      this.body[this.body.length - 1].direction == "right" &&
      this.food.x == this.body[this.body.length - 1].x &&
      this.food.y == this.body[this.body.length - 1].y
    ) {
      collision = true;
    } else if (
      this.body[this.body.length - 1].direction == "left" &&
      this.food.x == this.body[this.body.length - 1].x &&
      this.food.y == this.body[this.body.length - 1].y
    ) {
      collision = true;
    } else if (
      this.body[this.body.length - 1].direction == "up" &&
      this.food.x == this.body[this.body.length - 1].x &&
      this.food.y == this.body[this.body.length - 1].y
    ) {
      collision = true;
    } else if (
      this.body[this.body.length - 1].direction == "down" &&
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
    let p;
    if (this.body[0].direction == "right") {
      p = {
        x: this.body[0].x,
        y: this.body[0].y - 1,
      };
    } else if (this.body[0].direction == "left") {
      p = {
        x: this.body[0].x,
        y: this.body[0].y + 1,
      };
    } else if (this.body[0].direction == "up") {
      p = {
        x: this.body[0].x - 1,
        y: this.body[0].y,
      };
    } else if (this.body[0].direction == "down") {
      p = {
        x: this.body[0].x + 1,
        y: this.body[0].y,
      };
    }
    this.body = [
      {
        ...p,
        direction: this.body[0].direction,
      },
    ].concat(this.body);
  }

  endGame() {
    this.end = true;
  }
}
