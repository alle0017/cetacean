import type { TransformOpt, DrawMatrices, } from "../../types.d.ts";
import * as Matrix from './matrices.js'

export class ViewDelegate {

      private _near: number = 0.1;         
      private _far: number = 1001;               
      private _fieldOfView: number = 60;  


      perspectiveMatrix: number[] = [];

      set zNear(zNear: number) {
            if (this._near === zNear) return;
            this._near = zNear;
            this.updatePerspectiveMatrix();
      }

      get zNear() {
            return this._near;
      }

      set zFar(zFar: number) {
            if (this._far === zFar) return;
            this._far = zFar;
            this.updatePerspectiveMatrix();
      }

      get zFar(): number {
            return this._far;
      }

      set fieldOfView(angle: number) {
            if (this._fieldOfView === angle) return;
            this._fieldOfView = angle;
            this.updatePerspectiveMatrix();
      }

      get fieldOfView(): number {
            return this._fieldOfView;
      }

      constructor(private _resolution: number) {
            // Update the perspective matrix based on initial camera properties
            this.updatePerspectiveMatrix();
      }
      
      private updatePerspectiveMatrix() {
            // Calculate and assign a new perspective matrix based on camera properties
            this.perspectiveMatrix = Matrix.perspective(this._fieldOfView, this._resolution, this._near, this._far);
      }
}