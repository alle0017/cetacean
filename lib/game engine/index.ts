import * as Mat from '../math/matrix/index.js';
import Renderer from '../renderer/index.js';

export default class Game {

      private static game: Game;

      private renderer: Renderer;

      view: Mat.ViewDelegate;

      /** @hideconstructor */
      constructor(){
            this.renderer = new Renderer();
            this.view = new Mat.ViewDelegate( this.getResolution() );
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