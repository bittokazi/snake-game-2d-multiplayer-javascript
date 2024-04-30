export class Timer {
  constructor(
    private interval: number = 1000,
    private counter: number = 5,
    private callback: (count: Number) => void = (count) => {}
  ) {}

  update() {
    setTimeout(() => {
      this.counter--;
      this.callback(this.counter);

      if (this.counter > 0) {
        this.update();
      }
    }, this.interval);
  }
  start() {
    this.update();
  }
}
