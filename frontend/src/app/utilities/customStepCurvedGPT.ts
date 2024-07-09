// @ts-nocheck
export function Step(context: any, t: any) {
  this._context = context;
  this._t = t;
}

Step.prototype = {
  areaStart() {
    this._line = 0;
  },
  areaEnd() {
    this._line = NaN;
  },
  lineStart() {
    this._x = this._y = NaN;
    this._point = 0;
  },
  lineEnd() {
    if (this._point === 2) this._context.lineTo(this._x, this._y);
    if (this._line || (this._line !== 0 && this._point === 1)) this._context.closePath();
  },
  point(x, y) {
    x = +x;
    y = +y;
    if (this._point === 0) {
      this._point = 1;
      this._context.moveTo(x, y);
    } else {
      this._context.lineTo(x, y);
    }
    this._x = x;
    this._y = y;
  }
};

export const stepRound = function (context) {
  return new Step(context, 0.5);
};

export const stepRoundBefore = function (context) {
  return new Step(context, 0);
};

export const stepRoundAfter = function (context) {
  return new Step(context, 1);
};