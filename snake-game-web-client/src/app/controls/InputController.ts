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

    document.addEventListener(
      "touchstart",
      function (e: any) {
        e.preventDefault();
        ts.x = e.touches[0].clientX;
        ts.y = e.touches[0].clientY;
      },
      {
        passive: false,
      }
    );

    document.addEventListener("touchmove", function (e: any) {
      e.preventDefault();
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
    });
    return this;
  }
}
