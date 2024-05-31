import { SnakeDirection } from "../models/SnakeDirection";

export class InputController {
  constructor(private callback: (snakeDirection: SnakeDirection) => void) {}

  init(): InputController {
    let callback = this.callback;
    document.onkeydown = function (e: KeyboardEvent) {
      // e = e || window.event;
      if (e.key == "ArrowDown") {
        callback("down" as SnakeDirection);
      } else if (e.key == "ArrowUp") {
        callback("up" as SnakeDirection);
      } else if (e.key == "ArrowLeft") {
        callback("left" as SnakeDirection);
      } else if (e.key == "ArrowRight") {
        callback("right" as SnakeDirection);
      }
    };

    let ts: any = {
      x: null,
      y: null,
    };

    document.ontouchstart = function (e: any) {
      ts.x = e.touches[0].clientX;
      ts.y = e.touches[0].clientY;
    };

    document.ontouchmove = function (e: any) {
      if (!ts.x || !ts.y) {
        return;
      }

      let xUp = e.touches[0].clientX;
      let yUp = e.touches[0].clientY;

      var xDiff = ts.y - xUp;
      var yDiff = ts.y - yUp;

      if (Math.abs(xDiff) > Math.abs(yDiff)) {
        if (xDiff > 0) {
          callback("left" as SnakeDirection);
        } else {
          callback("right" as SnakeDirection);
        }
      } else {
        if (yDiff > 0) {
          callback("up" as SnakeDirection);
        } else {
          callback("down" as SnakeDirection);
        }
      }
      ts.x = null;
      ts.y = null;
    };

    this.initUiInput();
    return this;
  }

  initUiInput() {
    document.getElementById("up").addEventListener("click", () => {
      this.callback("up" as SnakeDirection);
    });
    document.getElementById("down").addEventListener("click", () => {
      this.callback("down" as SnakeDirection);
    });
    document.getElementById("left").addEventListener("click", () => {
      this.callback("left" as SnakeDirection);
    });
    document.getElementById("right").addEventListener("click", () => {
      this.callback("right" as SnakeDirection);
    });
  }
}
