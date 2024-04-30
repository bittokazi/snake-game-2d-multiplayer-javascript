import { SnakeBody } from "./SnakeBody";
import { SnakeDirection } from "./SnakeDirection";

export interface SnakeMovement extends SnakeBody {
  direction: SnakeDirection;
}
