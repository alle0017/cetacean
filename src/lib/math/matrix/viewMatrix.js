import * as Matrix from './matrices.js';
export class ViewDelegate {
    set zNear(zNear) {
        if (this._near === zNear)
            return;
        this._near = zNear;
        this.updatePerspectiveMatrix();
    }
    get zNear() {
        return this._near;
    }
    set zFar(zFar) {
        if (this._far === zFar)
            return;
        this._far = zFar;
        this.updatePerspectiveMatrix();
    }
    get zFar() {
        return this._far;
    }
    set fieldOfView(angle) {
        if (this._fieldOfView === angle)
            return;
        this._fieldOfView = angle;
        this.updatePerspectiveMatrix();
    }
    get fieldOfView() {
        return this._fieldOfView;
    }
    constructor(_resolution) {
        this._resolution = _resolution;
        this._near = 0.1;
        this._far = 1001;
        this._fieldOfView = 60;
        this.perspectiveMatrix = [];
        // Update the perspective matrix based on initial camera properties
        this.updatePerspectiveMatrix();
    }
    updatePerspectiveMatrix() {
        // Calculate and assign a new perspective matrix based on camera properties
        this.perspectiveMatrix = Matrix.perspective(this._fieldOfView, this._resolution, this._near, this._far);
    }
    getMatrices(opt) {
        let transformationMatrix = Matrix.IDENTITY_4X4;
        // If no drawing options provided, return the identity matrix
        if (!opt)
            return {
                transform: transformationMatrix,
                perspective: this.perspectiveMatrix,
            };
        if (opt.scale)
            transformationMatrix = Matrix.compose(transformationMatrix, 4, opt.scale);
        if (opt.translate)
            transformationMatrix = Matrix.compose(transformationMatrix, 4, opt.translate);
        if (opt.rotate)
            transformationMatrix = Matrix.compose(transformationMatrix, 4, opt.rotate);
        // If a camera is provided, combine with the transformation matrix
        if (opt.camera) {
            transformationMatrix = Matrix.compose(opt.camera.matrix, 4, transformationMatrix);
        }
        return {
            transform: transformationMatrix,
            perspective: this.perspectiveMatrix
        };
    }
}
