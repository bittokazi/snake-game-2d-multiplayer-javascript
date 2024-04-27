export function generatePlayer(i: Number) {
  if (i == 0) {
    return {
      gridX: 10,
      gridY: 0,
      size: 3,
      direction: "right",
      fillColor: "yellow",
    };
  }
  if (i == 1) {
    return {
      gridX: 10,
      gridY: 19,
      size: 3,
      direction: "left",
      fillColor: "green",
    };
  }
  if (i == 2) {
    return {
      gridX: 0,
      gridY: 10,
      size: 3,
      direction: "down",
      fillColor: "blue",
    };
  }
  if (i == 2) {
    return {
      gridX: 19,
      gridY: 10,
      size: 3,
      direction: "up",
      fillColor: "gray",
    };
  }
}
