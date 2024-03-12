import Thread from "../../worker.js";
import RendererWorker from "./rendering.js";
import { Messages } from "./enums.js";
import type { ShaderMessage, } from "./types.d.ts";


class Worker {

      static renderer: RendererWorker = new RendererWorker();

      static boot(){
            Thread.listen( Messages.CANVAS_PASSED, (e: any)=>{
                  RendererWorker.getEngine( e.cvs ).then(()=>{
                        Thread.post( Messages.READY, null )
                  })
                  Worker.setListeners();
            });
      }
      
      static setListeners(){
            /**
            * listen for update of uniforms actually rendered
            */
            Thread.listen( Messages.UPDATE_UNIFORMS, ( e: { 
                  id: string, 
                  uniforms: { binding: number, group: number, data: Record<string,number[]> }[],
            })=>{
                  Worker.renderer.update( e.id, e.uniforms );
            })
            /**
            * listen for new entity creation 
            */
            Thread.listen( Messages.NEW_ENTITY, ( e: ShaderMessage )=>{
                  Worker.renderer.create( e );
            });
            /**
            * listen for start rendering
            */
            Thread.listen( Messages.START, ()=>{
                  Worker.renderer.draw();
            });
            
            /**
            * listen for deletion of entities
            */
            Thread.listen( Messages.DELETE_ALL, ()=>{
                  Worker.renderer.remove();
            })

            /**
            * listen for saving entities
            */
            Thread.listen( Messages.SAVE, ( e: { id: string } )=>{
                  Worker.renderer.save( e.id );
            })

            /**
            * listen for load of saved entity
            */
            Thread.listen( Messages.LOAD_SAVED, ( e: { id: string | string[] } )=>{
                  
                  Worker.renderer.loadSavedEntity( e.id );
            })    
            /**
            * listen for sorting of entities
            */
            Thread.listen( Messages.SORT, ( e: { id: string, z: number } )=>{
                  Worker.renderer.updateZIndex(e)
            })    
      }
}
Worker.boot()