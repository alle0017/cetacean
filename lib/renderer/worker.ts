import Thread from "../worker.js";
import Engine from "./engines/engine.js";
import WebGPUEngine from "./engines/webgpu/index.js";
import { Messages } from "./enums.js";
import { Drawable, ShaderMessage } from "./types.js";

class RendererWorker {
      static engine: Engine;
      static entities: Record<string, Drawable> = {};
      static frames: number;
      static boot(){
            Thread.listen( Messages.CANVAS_PASSED, (e: any)=>{
                  new RendererWorker(e.cvs);
            });
      }
      static async getEngine( offscreen: OffscreenCanvas ){
            const e = await WebGPUEngine.new( offscreen );
            if( e )
                  this.engine = e;
      }
      constructor( offscreen: OffscreenCanvas ){
            RendererWorker.getEngine( offscreen ).then( ()=> Thread.post( Messages.READY, null ) );
            Thread.listen( Messages.NEW_ENTITY, ( e: ShaderMessage )=>{
                  RendererWorker.entities[e.id] = RendererWorker.engine.create( e );
            });
            Thread.listen( Messages.START, ()=>{
                  RendererWorker.draw();
            });
      }
      static draw(){
            const render = ()=>{
                  RendererWorker.engine.draw( Object.values( RendererWorker.entities ) )
                  RendererWorker.frames = requestAnimationFrame(render);
            }
            render();
      }
}
RendererWorker.boot();