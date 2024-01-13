export class Box {
  private _width: number;
  private _height: number;
  private _top: number;
  private _left: number;
  private _right: number;
  private _bottom: number;
  private _id: number;
  private _mark: number;
  needRemove: boolean = false;

  constructor(width = 0, height = 0, left = 0, top = 0, right = 0, bottom = 0, id = 0, mark = 0) {
    this._width = width;
    this._height = height;
    this._top = top;
    this._left = left;
    this._right = right;
    this._bottom = bottom;
    this._id = id;
    this._mark = mark;
  }

  get width(): number {
    return this._width;
  }

  get height(): number {
    return this._height;
  }

  get top(): number {
    return this._top;
  }

  get left(): number {
    return this._left;
  }

  get right(): number {
    return this._right;
  }

  get bottom(): number {
    return this._bottom;
  }

  get id(): number {
    return this._id;
  }

  set id(value: number) {
    this._id = value;
  }

  get mark(): number {
    return this._mark;
  }

  set mark(value: number) {
    this._mark = value;
  }

  static createFromSize(width: number, height: number, id = 0, mark = 0): Box {
    return new Box(width, height, 0, 0, width, height, id, mark);
  }

  static createFromCoord(left: number, top: number, right: number, bottom: number, id = 0, mark = 0): Box {
    return new Box(right - left, bottom - top, left, top, right, bottom, id, mark);
  }

  clone(): Box {
    return new Box(this.width, this.height, this.left, this.top, this.right, this.bottom, this.id, 0);
  }

  setSize(width: number, height: number) {
    this._width = width;
    this._height = height;
    this._right = this.left + width;
    this._bottom = this.top + height;
  }

  setCoord(left: number, top: number, right: number, bottom: number) {
    this._width = right - left;
    this._height = bottom - top;
    this._top = top;
    this._left = left;
    this._right = right;
    this._bottom = bottom;
  }

  square() {
    return this.width * this.height;
  }

  static isContained(a: Box, b: Box) {
    return a.left >= b.left && a.top >= b.top && a.right <= b.right && a.bottom <= b.bottom;
  }

  static isTouched(a: Box, b: Box) {
    return a.right > b.left && a.left < b.right && a.bottom > b.top && a.top < b.bottom;
  }

  static isSeparated(a: Box, b: Box) {
    return !(b.left >= a.right || b.right <= a.left || b.top >= a.bottom || b.bottom <= a.top);
  }
}
