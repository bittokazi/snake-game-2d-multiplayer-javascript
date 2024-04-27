import { Grid } from "./Grid";

export class GridSystem {
  constructor(canvas, context, gridWidth, gridHeight) {
    this.canvas = canvas;
    this.context = context;
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;
    this.grids = [];
    return this;
  }

  testGrid() {
    this.generateGrid(true);
    return this;
  }

  generateGrid(test) {
    let startY = 0;
    for (let i = 0; i < this.canvas.width / this.gridWidth; i++) {
      let startX = 0;
      this.grids[i] = [];
      for (let j = 0; j < this.canvas.height / this.gridHeight; j++) {
        let grid = new Grid(
          this.context,
          startX,
          startY,
          this.gridWidth,
          this.gridHeight,
          `rgb(${this.generate1to255()}, ${this.generate1to255()}, ${this.generate1to255()})`
        );
        if (test) grid.draw();
        this.grids[i][j] = grid;
        startX += this.gridWidth;
      }
      startY += this.gridHeight;
    }
    return this;
  }

  generate1to255() {
    return Math.floor(Math.random() * 255 + 1);
  }
}
