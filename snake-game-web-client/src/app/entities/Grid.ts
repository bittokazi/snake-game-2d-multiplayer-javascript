export class Grid {
  constructor(
    private context: CanvasRenderingContext2D,
    private startX: number,
    private startY: number,
    private gridWidth: number,
    private gridHeight: number,
    public fillColor: string = "rgb(255,255,255)"
  ) {}

  draw() {
    this.context.fillStyle = this.fillColor;
    this.context.fillRect(
      this.startX,
      this.startY,
      this.gridWidth,
      this.gridHeight
    );
  }
}
