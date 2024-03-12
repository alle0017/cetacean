import { Game } from '../game.js';
import { Axis } from "../../enum.js";

import * as Mat from '../../math/matrix/index.js';


export const event = ( event: string )=>{
      return ( target: any, methodName: string, descriptor: PropertyDescriptor )=>{
            ElementModel.game.events.listen( event, descriptor.value )
            return descriptor.value;
      }
}

export class ElementModel {

      static readonly game: Game = Game.new();

      protected id: string;

      private _camera: Mat.Camera;
      private _transformation: number[] = Mat.IDENTITY_4X4;
      private _minZ = 0;
      private _maxZ = 0;

      protected angles: Float32Array = new Float32Array([0,0,0]);

      private get zIndex(){
            const cameraZ = this._camera? this._camera.matrix[15]: 0;
            const max = this._maxZ + this.transformation[15] + cameraZ;
            const min = this._minZ + this.transformation[15] + cameraZ;

            return max > min ? min : max;
      }
      private set zIndex( value: number ){}

      get transformation(){
            return this._transformation;
      }
      set transformation( value: number[] ){
            if( value.length != 16 ){
                  console.warn( 'invalid transformation matrix assignment' );
                  return;
            }
            this._transformation = value;
      }
      
      get x(): number { return this._transformation[12]; }
      set x(value: number) {
            if( this._transformation[12] == value )
                  return;
            this._transformation = Mat.compose( this._transformation, 4, Mat.translate({
                  x: value,
                  y: 0,
                  z: 0
            }))
      }

      get y(): number { return this._transformation[13]; }
      set y(value: number) {
            if( this._transformation[13] == value )
                  return;
            this._transformation = Mat.compose( this._transformation, 4, Mat.translate({
                  x: 0,
                  y: value,
                  z: 0
            }))
      }

      get z(): number { return this._transformation[14]; }
      set z(value: number) {
            if( this._transformation[14] == value )
                  return;
            this._transformation = Mat.translate({
                  x: 0,
                  y: 0,
                  z: value
            })
            ElementModel.game.renderer.update( this.id, [{
                  binding: 0,
                  group: 0,
                  data: {
                        transformation: this._transformation,
                  },
            }])
            ElementModel.game.renderer.updateZIndex( this.id, this.zIndex );
      }

      get xAngle(){ return this.angles[0];  }
      set xAngle(value: number){
            if( this.angles[0] === value )
                  return;
            this.angles[0] = value;
            this._transformation = Mat.compose( 
                  this._transformation, 
                  4, 
                  Mat.rotation( value, Axis.X ) 
            )
            ElementModel.game.renderer.update( this.id, [{
                  binding: 0,
                  group: 0,
                  data: {
                        transformation: this._transformation,
                  }
            }])
            ElementModel.game.renderer.updateZIndex( this.id, this.zIndex );
      }

      get yAngle(){ return this.angles[1] }
      set yAngle(value: number){
            if( this.angles[1] === value )
                  return;
            this.angles[1] = value;
            this._transformation = Mat.compose( this._transformation, 4, Mat.rotation( value, Axis.Y ) );
            ElementModel.game.renderer.update( this.id, [{
                  binding: 0,
                  group: 0,
                  data: {
                        transformation: Mat.invert( this._transformation, 4 ),
                  }
            }])
            ElementModel.game.renderer.updateZIndex( this.id, this.zIndex );
      }

      get zAngle(){ return this.angles[2] }
      set zAngle(value: number){
            if( this.angles[2] === value )
                  return;
            this.angles[2] = value;
            this._transformation = Mat.compose( this._transformation, 4, Mat.rotation( value, Axis.Z ) );
            ElementModel.game.renderer.update( this.id, [{
                  binding: 0,
                  group: 0,
                  data: {
                        transformation: this._transformation,
                  }
            }])
            ElementModel.game.renderer.updateZIndex( this.id, this.zIndex );
      }
      constructor( id: string, vertices: number[] ){
            this.id = id;
            let max = vertices[3];
            let min = vertices[3];
            for( let i = 7; i < vertices.length; i+= 4 ){
                  if( vertices[i] > max ){
                        max = vertices[i];
                  }else if( vertices[i] < min ){
                        min = vertices[i]
                  }
            }
            this._maxZ = max;
            this._minZ = min;
      }
      emitEvent( signal: string, data: any ): void {
            ElementModel.game.events.emit( signal, data );
      }
      bindCamera( camera: Mat.Camera ): void{
            if( this._camera )
                  this._camera.removeListener( this.id );
            
            this._camera = camera;

            camera.onUpdate( this.id, (() => ElementModel.game.renderer.updateZIndex( this.id, this.zIndex )).bind(this))
            ElementModel.game.renderer.updateZIndex( this.id, this.zIndex );
      }
}