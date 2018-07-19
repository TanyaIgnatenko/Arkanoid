import {Component} from "./Component";

export interface Redrawer {
    requestRedraw(child: Component): void;
}