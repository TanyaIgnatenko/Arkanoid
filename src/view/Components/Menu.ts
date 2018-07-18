import {Layout} from "./Layout";
import {Padding} from "./Padding";
import {Component} from "./Component";
import {Key, Vector2D} from "../../model/Utils";
import {Redrawer} from "./Redrawer";
import {Option, TextOption} from "./Option";


export class Menu extends Layout implements Redrawer {
    private parent: Redrawer;
    private layout: Layout;
    private options: Array<Option> = [];
    private selectedOptionIdx: number;
    private activeOptionColor: string = "white";
    private notActiveOptionColor: string = "grey";

    constructor(context: CanvasRenderingContext2D, parent: Redrawer){
        super(context);
        super.setBackgroundColor('rgba(36, 41, 46, 0.7)');
        super.setPadding(new Padding(20, 20, 20, 20));
        
        this.parent = parent;
        this.selectedOptionIdx = 0;
        this.keyDownHandler = this.keyDownHandler.bind(this);
        document.addEventListener('keydown', this.keyDownHandler);
    }

    requestRedraw(child: Component) {
        this.parent.requestRedraw(this);
    }

    addOption(option: TextOption) {
        this.options.push(option);
        super.addComponent(option);
    }

    draw(topLeftPoint: Vector2D) {
        super.draw(topLeftPoint);
    }

    width(): number {
        return super.width();
    }

    height(): number {
        return super.height();
    }

    keyDownHandler(e: KeyboardEvent): void {
        console.log("hello");
        if (e.keyCode === 38 || e.keyCode === 40) {
            this.options[this.selectedOptionIdx].setSelected(false);
            if (e.keyCode === 38) {
                if (this.selectedOptionIdx - 1 >= 0) {
                    --this.selectedOptionIdx;
                } else {
                    this.selectedOptionIdx = this.options.length - 1;
                }
            } else if (e.keyCode === 40) {
                if (this.selectedOptionIdx + 1 < this.options.length) {
                    ++this.selectedOptionIdx;
                } else {
                    this.selectedOptionIdx = 0;
                }
            }
            this.options[this.selectedOptionIdx].setSelected(true);
        }
    }
}