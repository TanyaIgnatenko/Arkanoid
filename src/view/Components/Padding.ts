export class Padding {
    top: number;
    left: number;
    bottom: number;
    right: number;

    constructor(top: number, left: number, bottom: number, right: number) {
        this.top = top;
        this.left = left;
        this.bottom = bottom;
        this.right = right;
    }

    clone(): Padding {
        return new Padding(this.top, this.left, this.bottom, this.right);
    }
}