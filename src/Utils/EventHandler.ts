import {Observer} from "./Observer";

export class EventHandler<T> implements Observer<T> {
    private onUpdate: (T) => void;

    constructor(onUpdate: (T) => void) {
        this.onUpdate = onUpdate;
    }

    update(data: T): void {
        this.onUpdate(data);
    }
}