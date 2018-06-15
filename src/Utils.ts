export interface Vector2D {
    x: number;
    y: number;
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