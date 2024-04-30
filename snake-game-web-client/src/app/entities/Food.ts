import { GridSystem } from "../engine/GridSystem";

export class Food {
  constructor(
    public x: number,
    public y: number,
    private gridSystem: GridSystem
  ) {}

  draw() {
    let grid = this.gridSystem.grids[this.x][this.y];
    grid.fillColor = "red";
    grid.draw();
  }
}
