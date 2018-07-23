import {Vector2D} from "../../Utils/Utils";

export interface Component {
    width(): number;
    height(): number;
    draw(topLeftPoint: Vector2D): void;
}