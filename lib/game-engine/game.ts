import * as Mat from '../math/matrix/index.js';
import Renderer from '../renderer/renderer.js';
import EventSystem from './events.js';

export class Game {

      private static game: Game;

      readonly events: EventSystem;
      readonly renderer: Renderer;
      readonly view: Mat.ViewDelegate;

      /** @hideconstructor */
      constructor(){
            this.renderer = new Renderer();
            this.view = new Mat.ViewDelegate( this.getResolution() );
            this.events = new EventSystem();
      }
      /** get new instance of game class */
      static new(){
            if( !this.game )
                  this.game = new Game();
            return this.game;
      }
      getResolution(){
            return this.renderer.cvs.width/this.renderer.cvs.height;
      }
}