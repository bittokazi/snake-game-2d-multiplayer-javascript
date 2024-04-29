export class TextObject {
  constructor(
    private context: CanvasRenderingContext2D,
    private text: string = "N/A",
    private x = 10,
    private y = 10,
    private fillColor = "rgb(255,255,255)",
    private font = "50px serif"
  ) {}

  draw() {
    this.context.font = this.font;
    this.context.fillStyle = this.fillColor;
    this.context.fillText(this.text, this.x, this.y);
  }

  update(text: string) {
    this.text = text;
  }
}
