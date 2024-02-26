import * as Mat from '../math/matrix/index.js';
import Renderer from '../renderer/renderer.js';
import EventSystem from './events.js';
import { Scene } from './scene.js';
import { Loader } from './cache/loader.js';

export class Game {

      private static game: Game;

      private scenes: Record<string, typeof Scene> = {};
      private currentScene: Scene;

      readonly events: EventSystem;
      readonly renderer: Renderer;
      readonly view: Mat.ViewDelegate;

      readonly loader: Loader;


      /** @hideconstructor */
      constructor(){
            this.renderer = new Renderer();
            this.renderer.render();

            this.view = new Mat.ViewDelegate( this.getResolution() );
            this.view.zFar;
            
            this.events = new EventSystem();
            this.loader = new Loader();
      }
      /** get new instance of game class */
      static new(){
            if( !this.game ){
                  this.game = new Game();
                  this.initializeServiceWorker();
            }
            return this.game;
      }
      private static initializeServiceWorker(){
            if( !('serviceWorker' in navigator) ){
                  console.warn('service worker not available');
                  return;
            }
            navigator.serviceWorker.register(
                  new URL( './cache/cache.js', import.meta.url ),
                  {
                        type: 'module'
                  }
            );
      }
      getResolution(){
            return this.renderer.cvs.width/this.renderer.cvs.height;
      }
      scene( scene: typeof Scene, id: string ){
            this.scenes[id] = scene;
      }
      changeScene( id: string ){
            if( !this.scenes[id] ){
                  console.warn( `no scene found with id ${id}` );
                  return;
            }
            if( this.currentScene ){
                  // onLeave
                  this.renderer.removeAll();
            }
            this.currentScene = new this.scenes[id]( this );
      }
      
}