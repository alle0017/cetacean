var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import * as Mat from '../../math/matrix/index.js';
import { Axis } from "../../enum.js";
const event = () => {
    return (target, methodName, descriptor) => {
        const original = descriptor.value;
        descriptor.value = (...args) => {
        };
    };
};
export default class Element {
    get x() { return this.transformation[12]; }
    set x(value) {
        if (this.transformation[12] == value)
            return;
        this.transformation = Mat.compose(this.transformation, 4, Mat.translate({
            x: value,
            y: 0,
            z: 0
        }));
    }
    get y() { return this.transformation[13]; }
    set y(value) {
        if (this.transformation[13] == value)
            return;
        this.transformation = Mat.compose(this.transformation, 4, Mat.translate({
            x: 0,
            y: value,
            z: 0
        }));
    }
    get z() { return this.transformation[14]; }
    set z(value) {
        if (this.transformation[14] == value)
            return;
        this.transformation = Mat.compose(this.transformation, 4, Mat.translate({
            x: 0,
            y: 0,
            z: value
        }));
    }
    get xAngle() { return 0; }
    set xAngle(value) {
        if (this.angles[0] === value)
            return;
        this.angles[0] = value;
        this.transformation = Mat.compose(this.transformation, 4, Mat.rotation(value, Axis.X));
    }
    get yAngle() { return 0; }
    set yAngle(value) {
        if (this.angles[1] === value)
            return;
        this.angles[1] = value;
        this.transformation = Mat.compose(this.transformation, 4, Mat.rotation(value, Axis.Y));
    }
    get zAngle() { return 0; }
    set zAngle(value) {
        if (this.angles[2] === value)
            return;
        this.angles[2] = value;
        this.transformation = Mat.compose(this.transformation, 4, Mat.rotation(value, Axis.Z));
    }
    constructor(game, shader) {
        this.transformation = Mat.IDENTITY_4X4;
        this.angles = new Float32Array([0, 0, 0]);
        if (shader) {
        }
    }
    sendSignal(signal) {
    }
}
__decorate([
    event()
], Element.prototype, "sendSignal", null);
