import Thread from "../worker.js";
import Engine from "./engines/engine.js";
import WebGPUEngine from "./engines/webgpu/index.js";
import { Messages } from "./enums.js";
import { Drawable, ShaderMessage, UniformDataDescriptor } from "./types.js";


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
            Thread.listen( Messages.UPDATE_UNIFORMS, ( e: { 
                  id: string, 
                  uniforms: { binding: number, group: number, name: string, data: number[] }[]
            })=>{
                  RendererWorker.update( e.id, e.uniforms );
            })
      }
      static draw(){
            const render = ()=>{
                  RendererWorker.engine.draw( Object.values( RendererWorker.entities ) )
                  RendererWorker.frames = requestAnimationFrame(render);
            }
            render();
      }
      static update( id: string, uniforms: { binding: number, group: number, name: string, data: number[] }[] ){
            if( !this.entities[id] ){
                  Thread.error( 'No entities found with id ' + id );
                  return;
            }
            for( const o of uniforms ){
                  this.engine.write(
                        this.entities[id].uBuffer,
                        this.entities[id].uniformMap[o.group][o.binding][o.name],
                        o.data,
                        (this.entities[id].uniforms[o.group][o.binding] as Record<string, UniformDataDescriptor> )[o.name].type
                  );
            }
      }
}
RendererWorker.boot();