import {Vector2D} from "../../model/Utils";
import {Component} from "./Component";
import {Text} from "./Text";
import {Button} from "./Button";
import {Redrawer} from "./Redrawer";

export interface Option {
    choose(): void;
    setSelected(value: boolean);
    draw(topLeftPoint: Vector2D) : void;
}

export class TextOption extends Button implements Option {
    private name: Text;
    private parent: Redrawer;
    private selectedTextColor: string;
    private notSelectedTextColor: string;
    private isSelected: boolean;

    constructor(name: Text, onChosen: () => void, context: CanvasRenderingContext2D, parent: Redrawer, isSelected: boolean) {
        super(context, name);
        super.setOnClick(onChosen);

        this.name = name;
        this.parent = parent;
        this.isSelected = isSelected;
        this.selectedTextColor = "white";
        this.notSelectedTextColor = "grey";
    }

    choose(): void {
        this.onClick();
    }

    setSelected(value: boolean): void {
        this.isSelected = value;
        if(this.isSelected) this.parent.requestRedraw(this);
    }

    setActiveTextColor(color: string): void {
        this.selectedTextColor = color;
    }

    setNotActiveTextColor(color: string): void {
        this.notSelectedTextColor = color;
    }

    draw(topLeftPoint: Vector2D) : void {
        const color: string = this.isSelected ? this.selectedTextColor : this.notSelectedTextColor;
        this.name.setColor(color);
        super.draw(topLeftPoint);
    }
}