import {Component} from "./Component";
import {Vector2D} from "../../model/Utils";
import {Padding} from "./Padding";
import {HorizontalAlignment} from "./Alignment";


export class Layout implements Component {
    private context: CanvasRenderingContext2D;
    private padding: Padding;
    private _width: number;
    private _height: number;
    private components: Array<Component> = [];
    private backgroundColor: string;
    private alignment: HorizontalAlignment;

    constructor(context: CanvasRenderingContext2D) {
        this.context = context;
        this.padding = new Padding(0, 0, 0, 0);
        this._width = this.padding.left + this.padding.right;
        this._height = this.padding.top + this.padding.bottom;
        this.backgroundColor = "black";
        this.alignment = HorizontalAlignment.Center;
    }

    addComponent(component: Component): void {
        this.components.push(component);
        this._height += component.height();
        const widthCandidate = component.width() + this.padding.left + this.padding.right;
        if (this._width < widthCandidate) {
            this._width = widthCandidate;
        }
    }

    setPadding(padding: Padding): void {
        this._width -= this.padding.left + this.padding.right;
        this._width += padding.left + padding.right;
        this._height -= this.padding.top + this.padding.bottom;
        this._height += padding.top + padding.bottom;
        this.padding = padding.clone();
    }

    setBackgroundColor(color: string): void {
        this.backgroundColor = color;
    }

    setComponentsAlignment(alignment: HorizontalAlignment) : void {
        this.alignment = alignment;
    }

    width(): number {
        return this._width;
    }

    height(): number {
        return this._height;
    }

    draw(topLeftPoint: Vector2D): void {
        this.context.save();
        this.context.clearRect(topLeftPoint.x, topLeftPoint.y, this._width, this._height);
        this.context.fillStyle = this.backgroundColor;
        this.context.fillRect(topLeftPoint.x, topLeftPoint.y, this._width, this._height);

        let childTopLeftPoint = topLeftPoint.plus(new Vector2D(0, this.padding.top));
        this.components.forEach(component => {
            childTopLeftPoint.x = topLeftPoint.x + this.componentX(component.width());
            component.draw(childTopLeftPoint);
            childTopLeftPoint.y += component.height();
        });
        this.context.restore();
    }

    private componentX(componentWidth: number) : number {
        let x: number;
        switch (this.alignment) {
            case HorizontalAlignment.Left:
                x = this.padding.left;
                break;
            case HorizontalAlignment.Center:
                x = this._width / 2 - componentWidth / 2;
                break;
            case HorizontalAlignment.Right:
                x = this._width - this.padding.right - componentWidth;
                break;
        }
        return x;
    }
}