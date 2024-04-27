export class Grid {
  constructor(
    context,
    startX,
    startY,
    gridWidth,
    gridHeight,
    fillColor = "rgb(255,255,255)"
  ) {
    this.context = context;
    this.startX = startX;
    this.startY = startY;
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;
    this.fillColor = fillColor;
  }

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
