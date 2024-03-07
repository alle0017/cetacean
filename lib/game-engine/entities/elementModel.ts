import { Game } from '../game.js';
import { Axis } from "../../enum.js";

import * as Mat from '../../math/matrix/index.js';
import { IDENTITY_4X4 } from '../../math/matrix/matrixOperations';


export const event = ( event: string )=>{
      return ( target: any, methodName: string, descriptor: PropertyDescriptor )=>{
            ElementModel.game.events.listen( event, descriptor.value )
            return descriptor.value;
      }
}

export class ElementModel {

      static readonly game: Game = Game.new();

      protected id: string;

      protected transformation: number[] = Mat.IDENTITY_4X4;
      protected angles: Float32Array = new Float32Array([0,0,0]);
      
      get x(): number { return this.transformation[12]; }
      set x(value: number) {
            if( this.transformation[12] == value )
                  return;
            this.transformation = Mat.compose( this.transformation, 4, Mat.translate({
                  x: value,
                  y: 0,
                  z: 0
            }))
      }

      get y(): number { return this.transformation[13]; }
      set y(value: number) {
            if( this.transformation[13] == value )
                  return;
            this.transformation = Mat.compose( this.transformation, 4, Mat.translate({
                  x: 0,
                  y: value,
                  z: 0
            }))
      }

      get z(): number { return this.transformation[14]; }
      set z(value: number) {
            if( this.transformation[14] == value )
                  return;
            this.transformation = Mat.translate({
                  x: 0,
                  y: 0,
                  z: value
            })
            ElementModel.game.renderer.update( this.id, [{
                  binding: 0,
                  group: 0,
                  data: {
                        transformation: this.transformation,
                  },
            }])
      }

      get xAngle(){ return this.angles[0];  }
      set xAngle(value: number){
            if( this.angles[0] === value )
                  return;
            this.angles[0] = value;
            this.transformation = Mat.compose( 
                  this.transformation, 
                  4, 
                  Mat.rotation( value, Axis.X ) 
            )
            ElementModel.game.renderer.update( this.id, [{
                  binding: 0,
                  group: 0,
                  data: {
                        transformation: this.transformation,
                  }
            }])
      }

      get yAngle(){ return this.angles[1] }
      set yAngle(value: number){
            if( this.angles[1] === value )
                  return;
            this.angles[1] = value;
            this.transformation = Mat.compose( this.transformation, 4, Mat.rotation( value, Axis.Y ) );
            ElementModel.game.renderer.update( this.id, [{
                  binding: 0,
                  group: 0,
                  data: {
                        transformation: Mat.invert( this.transformation, 4 ),
                  }
            }])
      }

      get zAngle(){ return this.angles[2] }
      set zAngle(value: number){
            if( this.angles[2] === value )
                  return;
            this.angles[2] = value;
            this.transformation = Mat.compose( this.transformation, 4, Mat.rotation( value, Axis.Z ) );
            ElementModel.game.renderer.update( this.id, [{
                  binding: 0,
                  group: 0,
                  data: {
                        transformation: this.transformation,
                  }
            }])
      }
      constructor( id: string, ){
            this.id = id;
      }
      emitEvent( signal: string, data: any ): void {
            ElementModel.game.events.emit( signal, data );
      }
}