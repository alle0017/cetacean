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
        this.transformation = Mat.translate({
            x: 0,
            y: 0,
            z: value
        });
        ElementModel.game.renderer.update(this.id, [{
                binding: 0,
                group: 0,
                data: {
                    transformation: this.transformation,
                }
            }]);
    }
    get xAngle() { return this.angles[0]; }
    set xAngle(value) {
        if (this.angles[0] === value)
            return;
        this.angles[0] = value;
        this.transformation = Mat.compose(this.transformation, 4, Mat.rotation(value, Axis.X));
        ElementModel.game.renderer.update(this.id, [{
                binding: 0,
                group: 0,
                data: {
                    transformation: this.transformation,
                }
            }]);
        console.log(this.transformation);
    }
    get yAngle() { return this.angles[1]; }
    set yAngle(value) {
        if (this.angles[1] === value)
            return;
        this.angles[1] = value;
        this.transformation = Mat.compose(this.transformation, 4, Mat.rotation(value, Axis.Y));
        ElementModel.game.renderer.update(this.id, [{
                binding: 0,
                group: 0,
                data: {
                    transformation: this.transformation,
                }
            }]);
    }
    get zAngle() { return this.angles[2]; }
    set zAngle(value) {
        if (this.angles[2] === value)
            return;
        this.angles[2] = value;
        this.transformation = Mat.compose(this.transformation, 4, Mat.rotation(value, Axis.Z));
        ElementModel.game.renderer.update(this.id, [{
                binding: 0,
                group: 0,
                data: {
                    transformation: this.transformation,
                }
            }]);
    }
    constructor(id) {
        this.transformation = Mat.IDENTITY_4X4;
        this.angles = new Float32Array([0, 0, 0]);
        this.id = id;
    }
    emitEvent(signal, data) {
        ElementModel.game.events.emit(signal, data);
    }
}
ElementModel.game = Game.new();
export { ElementModel };
