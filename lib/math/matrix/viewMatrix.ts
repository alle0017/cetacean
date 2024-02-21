import type { TransformOpt, DrawMatrices, } from "../../types.d.ts";
import * as Matrix from './matrices.js'

export class ViewDelegate {

      private _near: number = 0.1;         
      private _far: number = 1001;               
      private _fieldOfView: number = 60;  


      private perspectiveMatrix: number[] = [];

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
      getMatrices(){
            return this.perspectiveMatrix
      }  
      /*getMatrices( opt?: TransformOpt ): DrawMatrices {
            let transformationMatrix = Matrix.IDENTITY_4X4;
            
            // If no drawing options provided, return the identity matrix
            if (!opt) return {
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
            if (opt.camera){
                  transformationMatrix = Matrix.compose(opt.camera.matrix, 4, transformationMatrix);
            }
      
            return { 
                  transform: transformationMatrix,
                  perspective: this.perspectiveMatrix
            };
      }  */
}