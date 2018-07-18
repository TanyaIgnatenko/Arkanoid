import {Vector2D} from "../../model/Utils";

export interface Component {
    width(): number;
    height(): number;
    draw(topLeftPoint: Vector2D): void;
}