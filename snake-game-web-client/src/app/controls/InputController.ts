import { SnakeDirection } from "../models/SnakeDirection";

export class InputController {
  keyDownHandler: any = null;
  touchStartHandler: any = null;
  touchMoveHandler: any = null;
  touchEndHandler: any = null;

  constructor(private callback: (snakeDirection: SnakeDirection) => void) {}

  init(): InputController {
    let callback = this.callback;

    let ts: any = {
      x: null,
      y: null,
    };

    let threshold = 150;
    let restraint = 100;
    let allowedTime = 300;

    this.keyDownHandler = function (e: KeyboardEvent) {
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

    this.touchStartHandler = function (e: any) {
      ts.x = e.touches[0].clientX;
      ts.y = e.touches[0].clientY;
    };

    this.touchMoveHandler = function (e: any) {
      e.preventDefault();
    };

    this.touchEndHandler = function (e: any) {
      let te: any = {
        x: e.changedTouches[0].clientX - ts.x,
        y: e.changedTouches[0].clientY - ts.y,
      };

      if (Math.abs(te.x) >= threshold) {
        let swipedir = te.x < 0 ? "left" : "right";
        callback(swipedir as SnakeDirection);
        e.preventDefault();
      } else if (Math.abs(te.y) >= threshold && Math.abs(te.x) <= restraint) {
        let swipedir = te.y < 0 ? "up" : "down";
        callback(swipedir as SnakeDirection);
        e.preventDefault();
      }
    };

    document.addEventListener("keydown", this.keyDownHandler);

    document.addEventListener("touchstart", this.touchStartHandler, {
      passive: false,
    });

    document.addEventListener("touchmove", this.touchMoveHandler, {
      passive: false,
    });

    document.addEventListener("touchend", this.touchEndHandler, {
      passive: false,
    });
    return this;
  }

  clearInputListners() {
    document.removeEventListener("keydown", this.keyDownHandler);
    document.removeEventListener("touchstart", this.touchStartHandler, false);
    document.removeEventListener("touchmove", this.touchMoveHandler, false);
    document.removeEventListener("touchend", this.touchEndHandler, false);
  }
}
