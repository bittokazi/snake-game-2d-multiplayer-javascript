export class InputController {
  constructor(callback) {
    this.callback = callback;
    return this;
  }

  init() {
    let callback = this.callback;
    document.onkeydown = function (e) {
      e = e || window.event;
      if (e.keyCode == "38") {
        callback("down");
      } else if (e.keyCode == "40") {
        callback("up");
      } else if (e.keyCode == "37") {
        callback("left");
      } else if (e.keyCode == "39") {
        callback("right");
      }
    };
    this.initUiInput(callback);
    return this;
  }

  initUiInput(callback) {
    document.getElementById("up").addEventListener("click", () => {
      callback("up");
    });
    document.getElementById("down").addEventListener("click", () => {
      callback("down");
    });
    document.getElementById("left").addEventListener("click", () => {
      callback("left");
    });
    document.getElementById("right").addEventListener("click", () => {
      callback("right");
    });
  }
}
