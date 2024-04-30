import { Grid } from "../entities/Grid";

export class GridSystem {
  public grids: Grid[][] = [];

  constructor(
    private canvas: HTMLCanvasElement,
    private context: CanvasRenderingContext2D,
    private gridWidth: number,
    private gridHeight: number
  ) {}

  testGrid(): GridSystem {
    this.generateGrid(true);
    return this;
  }

  generateGrid(test: Boolean): GridSystem {
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
