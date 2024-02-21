import { Game } from '../game.js';

export const event = ( event: string )=>{
      return ( target: any, methodName: string, descriptor: PropertyDescriptor )=>{
            ElementModel.game.events.listen( event, descriptor.value )
            return descriptor.value;
      }
}

export abstract class ElementModel {

      static readonly game: Game = Game.new();

      abstract x: number;
      abstract y: number;
      abstract z: number;

      abstract xAngle: number;
      abstract yAngle: number;
      abstract zAngle: number;

      abstract emitEvent( signal: string, data: any ): void;
}