import Thread from "../../worker.js";
import Engine from "../engines/engine.js";
import WebGPUEngine from "../engines/webgpuEngine.js";

import type { Drawable, ShaderMessage, } from "./types.d.ts";

type DrawableWeakRef = {
      id: string,
      z: number,
}
/**
 * class delegate to send commands to the rendering engine
 */
export default class RendererWorker {

      static engine: Engine;
      
      entities: Record<string, Drawable> = {};
      
      private sortedRef: DrawableWeakRef[] = [];
      private sorted: Drawable[] = [];
      private needResort: boolean = false;
      private saved: Record<string, Drawable> = {};

      frames: number;

      static async getEngine( offscreen: OffscreenCanvas ){
            const e = await WebGPUEngine.new( offscreen );
            if( e )
                  this.engine = e;
            else{
                  Thread.log('cannot use webgpu')
            }
      }
      constructor(){}

      

      save( id: string ){
            if( !this.entities[id] )
                  return;
            this.saved[id] = this.entities[id];
      }
      loadSavedEntity( id: string | string[] ){
            if( typeof id == 'string' ){
                  this.saved[id] && ( this.entities[id] = this.saved[id] );
                  return;
            }
            for( let i = 0; i < id.length; i++ ){
                  this.saved[id[i]] && ( this.entities[id[i]] = this.saved[id[i]] );
            }
      }
      draw(){
            const render = (()=>{
                  RendererWorker.engine.draw( this.sortDrawableForZ() );
                  this.frames = requestAnimationFrame(render);
            }).bind(this)
            render();
      }
      /** removes all entities from the renderer. called to free memory between scenes */
      remove(){
            this.entities = {};
      }
      update( id: string, uniforms: { binding: number, group: number, data: Record<string,number[]> }[], z?: number ){
            
            if( !this.entities[id] ){
                  Thread.error( 'No entities found with id ' + id );
                  return;
            }
            if( z ){

            }
            for( let i = 0; i < uniforms.length; i++ ){
                  const entries = Object.entries( uniforms[i].data );
                  
                  for( let j = 0; j < entries.length; j++ ){
                        RendererWorker.engine.write(
                              this.entities[id].uBuffer,
                              this.entities[id].uniformMap[uniforms[i].group][uniforms[i].binding][entries[j][0]].offset,
                              entries[j][1],
                              this.entities[id].uniformMap[uniforms[i].group][uniforms[i].binding][entries[j][0]].type
                        );
                  }
            }
      }
      updateZIndex( update: DrawableWeakRef ){
            for( let i = 0; i < this.sorted.length; i++ ){
                  if( this.sortedRef[i].id == update.id ){
                        this.sortedRef[i].z = update.z;
                  }
            }
            this.needResort = true;
      }
      sortDrawableForZ(){
            if( !this.needResort )
                  return this.sorted;
            
            this.sortedRef.sort( ( a: DrawableWeakRef, b: DrawableWeakRef ) => a.z - b.z );
            this.needResort = false;
            this.sorted = this.sortedRef.map( (value) => this.entities[value.id] );
            return this.sorted;
      }
      create( shader: ShaderMessage ){
            this.entities[shader.id] = RendererWorker.engine.create( shader );
            this.sortedRef.push( { id: shader.id, z: shader.minZ } );
            this.needResort = true;
      }
}