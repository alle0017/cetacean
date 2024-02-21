import { Game } from "../game.js";
import { ElementModel } from "./elementModel.js";

import * as Mat from '../../math/matrix/index.js';

import { Axis } from "../../enum.js";
import { ShaderDescriptor } from "lib/renderer/types.js";


export class Element implements ElementModel {

      static readonly game: Game = Game.new();
      
      private transformation: number[] = Mat.IDENTITY_4X4;
      private angles: Float32Array = new Float32Array([0,0,0]);
      
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
            this.transformation = Mat.compose( this.transformation, 4, Mat.translate({
                  x: 0,
                  y: 0,
                  z: value
            }))
      }

      get xAngle(){ return 0 }
      set xAngle(value: number){
            if( this.angles[0] === value )
                  return;
            this.angles[0] = value;
            this.transformation = Mat.compose( this.transformation, 4, Mat.rotation( value, Axis.X ) );
      }

      get yAngle(){ return 0 }
      set yAngle(value: number){
            if( this.angles[1] === value )
                  return;
            this.angles[1] = value;
            this.transformation = Mat.compose( this.transformation, 4, Mat.rotation( value, Axis.Y ) );
      }

      get zAngle(){ return 0 }
      set zAngle(value: number){
            if( this.angles[2] === value )
                  return;
            this.angles[2] = value;
            this.transformation = Mat.compose( this.transformation, 4, Mat.rotation( value, Axis.Z ) );
      }

      constructor( game: Game, shader?: ShaderDescriptor ){
            if( shader ){

            }
      }
      emitEvent( signal: string ): void {
            Element.game.events.emit( signal );
      }
}