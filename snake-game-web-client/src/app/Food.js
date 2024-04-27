export class Food {
  constructor(x, y, gridSystem) {
    this.x = x;
    this.y = y;
    this.gridSystem = gridSystem;
    return this;
  }

  draw() {
    let grid = this.gridSystem.grids[this.x][this.y];
    grid.fillColor = "red";
    grid.draw();
  }
}
