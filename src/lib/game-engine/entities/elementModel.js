import { Game } from '../game.js';
import { Axis } from "../../enum.js";
import * as Mat from '../../math/matrix/index.js';
export const event = (event) => {
    return (target, methodName, descriptor) => {
        ElementModel.game.events.listen(event, descriptor.value);
        return descriptor.value;
    };
};
class ElementModel {
    get zIndex() {
        const cameraZ = this._camera ? this._camera.matrix[15] : 0;
        const max = this._maxZ + this.transformation[15] + cameraZ;
        const min = this._minZ + this.transformation[15] + cameraZ;
        return max > min ? min : max;
    }
    set zIndex(value) { }
    get transformation() {
        return this._transformation;
    }
    set transformation(value) {
        if (value.length != 16) {
            console.warn('invalid transformation matrix assignment');
            return;
        }
        this._transformation = value;
    }
    get x() { return this._transformation[12]; }
    set x(value) {
        if (this._transformation[12] == value)
            return;
        this._transformation = Mat.compose(this._transformation, 4, Mat.translate({
            x: value,
            y: 0,
            z: 0
        }));
    }
    get y() { return this._transformation[13]; }
    set y(value) {
        if (this._transformation[13] == value)
            return;
        this._transformation = Mat.compose(this._transformation, 4, Mat.translate({
            x: 0,
            y: value,
            z: 0
        }));
    }
    get z() { return this._transformation[14]; }
    set z(value) {
        if (this._transformation[14] == value)
            return;
        this._transformation = Mat.translate({
            x: 0,
            y: 0,
            z: value
        });
        ElementModel.game.renderer.update(this.id, [{
                binding: 0,
                group: 0,
                data: {
                    transformation: this._transformation,
                },
            }]);
        ElementModel.game.renderer.updateZIndex(this.id, this.zIndex);
    }
    get xAngle() { return this.angles[0]; }
    set xAngle(value) {
        if (this.angles[0] === value)
            return;
        this.angles[0] = value;
        this._transformation = Mat.compose(this._transformation, 4, Mat.rotation(value, Axis.X));
        ElementModel.game.renderer.update(this.id, [{
                binding: 0,
                group: 0,
                data: {
                    transformation: this._transformation,
                }
            }]);
        ElementModel.game.renderer.updateZIndex(this.id, this.zIndex);
    }
    get yAngle() { return this.angles[1]; }
    set yAngle(value) {
        if (this.angles[1] === value)
            return;
        this.angles[1] = value;
        this._transformation = Mat.compose(this._transformation, 4, Mat.rotation(value, Axis.Y));
        ElementModel.game.renderer.update(this.id, [{
                binding: 0,
                group: 0,
                data: {
                    transformation: Mat.invert(this._transformation, 4),
                }
            }]);
        ElementModel.game.renderer.updateZIndex(this.id, this.zIndex);
    }
    get zAngle() { return this.angles[2]; }
    set zAngle(value) {
        if (this.angles[2] === value)
            return;
        this.angles[2] = value;
        this._transformation = Mat.compose(this._transformation, 4, Mat.rotation(value, Axis.Z));
        ElementModel.game.renderer.update(this.id, [{
                binding: 0,
                group: 0,
                data: {
                    transformation: this._transformation,
                }
            }]);
        ElementModel.game.renderer.updateZIndex(this.id, this.zIndex);
    }
    constructor(id, vertices) {
        this._transformation = Mat.IDENTITY_4X4;
        this._minZ = 0;
        this._maxZ = 0;
        this.angles = new Float32Array([0, 0, 0]);
        this.id = id;
        let max = vertices[3];
        let min = vertices[3];
        for (let i = 7; i < vertices.length; i += 4) {
            if (vertices[i] > max) {
                max = vertices[i];
            }
            else if (vertices[i] < min) {
                min = vertices[i];
            }
        }
        this._maxZ = max;
        this._minZ = min;
    }
    emitEvent(signal, data) {
        ElementModel.game.events.emit(signal, data);
    }
    bindCamera(camera) {
        if (this._camera)
            this._camera.removeListener(this.id);
        this._camera = camera;
        camera.onUpdate(this.id, (() => ElementModel.game.renderer.updateZIndex(this.id, this.zIndex)).bind(this));
        ElementModel.game.renderer.updateZIndex(this.id, this.zIndex);
    }
}
ElementModel.game = Game.new();
export { ElementModel };
