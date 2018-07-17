import {Component} from "./Component";
import {Padding} from "./Padding";
import {Vector2D} from "../../model/Utils";

export class Button implements Component {
    private context: CanvasRenderingContext2D;
    private internalComponent: Component;
    private padding: Padding = new Padding(0, 0, 0, 0);
    private _width: number = this.padding.left + this.padding.right;
    private _height: number = this.padding.top + this.padding.bottom;
    private backgroundColor: string = "black";

    constructor(context: CanvasRenderingContext2D, child: Component) {
        this.context = context;
        this.internalComponent = child;

        this.recalculateSize();
    }

    setBackgroundColor(color: string) {
        this.backgroundColor = color;
    }

    setPadding(padding: Padding) {
        this.padding = padding.clone();
        this.recalculateSize();
    }

    width(): number {
        return this._width;
    }

    height(): number {
        return this._height;
    }

    draw(topLeftPoint: Vector2D): void {
        this.context.fillStyle = this.backgroundColor;
        this.context.fillRect(topLeftPoint.x, topLeftPoint.y, this._width, this._height);
        this.internalComponent.draw(topLeftPoint.plus(new Vector2D(this.padding.left, this.padding.top)));
    }

    private recalculateSize() :void {
        this._width = this.padding.left + this.internalComponent.width() + this.padding.right;
        this._height = this.padding.top + this.internalComponent.height() + this.padding.bottom;
    }
}