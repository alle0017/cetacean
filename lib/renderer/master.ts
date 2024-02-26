import Thread from "../worker.js";
import { Messages, } from './renderingThread/enums.js'
import type {  ShaderMessage, } from './renderingThread/types.d.ts';

/**
 * class to handle rendering thread. must be used with **Renderer** class (@see ./renderer.ts)
 */
export default class WorkerMaster {
      private static _id = 0;

      private _tid: string = 'rendering thread' + WorkerMaster._id++;

      cvs: HTMLCanvasElement;

      constructor( protected root: HTMLElement = document.body ){
            this.cvs = document.createElement('canvas');
            
            root.appendChild( this.cvs ); 

            Thread.spawn( this._tid, new URL( './renderingThread/worker.js', import.meta.url ) );
            Thread.expose( Messages.CANVAS_PASSED, { cvs: this.cvs.transferControlToOffscreen() }, this._tid );
            Thread.wait( Messages.READY, this._tid );
      }
      protected sendNewEntityToThread( opt: ShaderMessage ){
            Thread.post( Messages.NEW_ENTITY, opt, this._tid );
      }
      
      render(){
            Thread.post( Messages.START, null, this._tid );
      }
      /**
       * save entity with specified id for later use after remove ( @see remove )
       */
      save( id: string ){
            Thread.post( Messages.SAVE, {
                  id
            }, this._tid );
      }
      loadSavedEntities( id: string | string[] ){
            Thread.post( Messages.LOAD_SAVED, {
                  id
            }, this._tid );
      }
      update( id: string, uniforms: { binding: number, group: number, data: Record<string,number[]> }[] ){
            Thread.post( Messages.UPDATE_UNIFORMS, {
                  id: id,
                  uniforms,
            }, this._tid );
      }
      /**
       * remove all entities actually rendered 
       * they need to be re-created to be rendered again
       */
      removeAll(){
            Thread.post( Messages.DELETE_ALL, null, this._tid );
      }
}

