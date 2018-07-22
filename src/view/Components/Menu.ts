import {Layout} from "./Layout";
import {Padding} from "./Padding";
import {Component} from "./Component";
import {Vector2D} from "../../Utils/Utils";
import {Redrawer} from "./Redrawer";
import {Option, TextOption} from "./Option";


export class Menu extends Layout implements Redrawer {
    private parent: Redrawer;
    private layout: Layout;
    private options: Array<Option> = [];
    private selectedOptionIdx: number;
    private activeOptionColor: string = "white";
    private notActiveOptionColor: string = "grey";
    private isActive: boolean;

    constructor(context: CanvasRenderingContext2D, parent: Redrawer) {
        super(context);
        this.setBackgroundColor('rgba(36, 41, 46, 0.7)');
        this.setPadding(new Padding(20, 20, 20, 20));

        this.parent = parent;
        this.selectedOptionIdx = 0;
        this.isActive = false;
        this.keyDownHandler = this.keyDownHandler.bind(this);
    }

    requestRedraw(child: Component) {
        this.parent.requestRedraw(this);
    }

    addOption(option: TextOption) {
        this.options.push(option);
        this.addComponent(option);
    }

    setIsActive(value: boolean) {
        this.isActive = value;
        if(this.isActive) {
            document.addEventListener('keydown', this.keyDownHandler);
        } else {
            document.removeEventListener('keydown', this.keyDownHandler);
        }
    }

    keyDownHandler(e: KeyboardEvent): void {
        if (e.keyCode === 38 || e.keyCode === 40) {
            this.options[this.selectedOptionIdx].setSelected(false);
            if (e.keyCode === 38) {
                this.selectedOptionIdx = (this.selectedOptionIdx - 1 + this.options.length) % this.options.length;
            } else if (e.keyCode === 40) {
                this.selectedOptionIdx = (this.selectedOptionIdx + 1) % this.options.length;
            }
            this.options[this.selectedOptionIdx].setSelected(true);
        } else if (e.keyCode === 13) {
            this.options[this.selectedOptionIdx].choose();
        }
    }
}