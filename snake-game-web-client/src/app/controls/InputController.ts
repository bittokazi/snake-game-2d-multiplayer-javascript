import { SnakeDirection } from "../models/SnakeDirection";

export class InputController {
  constructor(private callback: (snakeDirection: SnakeDirection) => void) {}

  init(): InputController {
    let callback = this.callback;
    document.onkeydown = function (e: KeyboardEvent) {
      console.log(e);

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
