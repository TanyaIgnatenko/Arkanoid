export class Vector2D {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
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

export enum CollisionType {
    Vertical = 'Vertical',
    Horizontal = 'Horizontal',
    None = 'None'
}