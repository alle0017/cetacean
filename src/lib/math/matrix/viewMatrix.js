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
    getMatrices() {
        return this.perspectiveMatrix;
    }
}
