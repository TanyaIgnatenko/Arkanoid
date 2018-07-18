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
    private preferredWidth: number = 0;

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

    setPreferredWidth(preferredWidth: number) {
        this.preferredWidth = preferredWidth;
        if (preferredWidth > this._width) this._width = preferredWidth;
    }

    width(): number {
        return this._width;
    }

    height(): number {
        return this._height;
    }

    draw(topLeftPoint: Vector2D): void {
        this.context.save();
        this.context.fillStyle = this.backgroundColor;
        this.context.fillRect(topLeftPoint.x, topLeftPoint.y, this._width, this._height);

        const topLeftInternalComponentPoint: Vector2D = topLeftPoint.plus(
            new Vector2D((this._width - this.internalComponent.width()) / 2, this.padding.top));

        this.internalComponent.draw(topLeftInternalComponentPoint);
        this.context.restore();
    }

    private recalculateSize(): void {
        this._width = this.padding.left + this.internalComponent.width() + this.padding.right;
        this._height = this.padding.top + this.internalComponent.height() + this.padding.bottom;
        this.setPreferredWidth(this.preferredWidth);
    }
}