export class Vector2D {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    multiply(scalar: number): Vector2D {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }

    unit(): Vector2D {
        let length = this.length();
        return new Vector2D(this.x / length, this.y / length);
    }

    changeLength(newLength: number): Vector2D {
        let length = this.length();
        this.x *= newLength / length;
        this.y *= newLength / length;
        return this;
    }

    clone(): Vector2D {
        return new Vector2D(this.x, this.y);
    }
}

export interface GridSize {
    rowCount: number;
    columnCount: number;
}

export interface Segment {
    startPoint: Vector2D,
    endPoint: Vector2D
}

export interface SphericalObject {
    position: Vector2D,
    radius: number
}

export enum CollisionType {
    Vertical,
    Horizontal,
    None
}

export enum Key {
    RightArrow,
    LeftArrow,
    None
}

export enum Direction {
    Right,
    Left,
    None
}

export interface BrickGridNumber {
    row: number;
    col: number;
}
