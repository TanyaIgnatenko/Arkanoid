import {Component} from "./Component";
import {Vector2D} from "../../model/Utils";
import {HorizontalAlignment} from "./Alignment";
import {Padding} from "./Padding";

export class Text implements Component {
    private context: CanvasRenderingContext2D;
    private text: string;
    private padding: Padding;
    private textAlignment: HorizontalAlignment;
    private textColor: string;
    private fontFamily: string;
    private fontName: string;
    private fontSize: number;
    private textWidth: number;

    constructor(context: CanvasRenderingContext2D, text: string) {
        this.context = context;
        this.text = text;
        this.padding = new Padding(0, 0, 0, 0);
        this.textAlignment = HorizontalAlignment.Left;
        this.textColor = "#000000";
        this.fontFamily = "sans serif";
        this.fontName = "Coda Caption";
        this.fontSize = 14;

        this.recalculateWidth();
    }

    width(): number {
        return this.padding.left + this.textWidth + this.padding.right;
    }

    height(): number {
        return this.padding.top + this.fontSize + this.padding.bottom;
    }

    setText(text: string): void {
        this.text = text;
        this.recalculateWidth();
    }

    setFontSize(fontSize: number): void {
        this.fontSize = fontSize;
        this.recalculateWidth();
    }

    setFontName(fontName: string): void {
        this.fontName = fontName;
        this.recalculateWidth();
    }

    setFontFamily(fontFamily: string): void {
        this.fontFamily = fontFamily;
        this.recalculateWidth();
    }

    setColor(color: string): void {
        this.textColor = color;
    }

    setAlignment(alignment: HorizontalAlignment) : void {
        this.textAlignment = alignment;
    }

    setPadding(padding: Padding) {
        this.padding = padding.clone();
    }

    draw(topLeftPoint: Vector2D): void {
        this.context.save();
        this.tuneFont();
        this.context.fillStyle = this.textColor;

        const x = topLeftPoint.x + this.textX();
        const y = topLeftPoint.y + this.padding.top;
        this.context.textBaseline = "hanging";
        this.context.fillText(this.text, x, y);

        this.context.restore();
    }

    private recalculateWidth(): void {
        this.context.save();
        this.tuneFont();
        this.textWidth = this.context.measureText(this.text).width;
        this.context.restore();
    }

    private tuneFont(): void {
        this.context.font = `${this.fontSize}px ${this.fontName}, ${this.fontFamily}`;
    }

    private textX(): number {
        let alignment: string;
        let x: number;
        switch (this.textAlignment) {
            case HorizontalAlignment.Left:
                alignment = "left";
                x = this.padding.left;
                break;
            case HorizontalAlignment.Center:
                alignment = "center";
                x = this.padding.left + this.textWidth / 2;
                break;
            case HorizontalAlignment.Right:
                alignment = "right";
                x = this.padding.left + this.textWidth;
                break;
        }
        this.context.textAlign = alignment;
        return x;
    }
}
