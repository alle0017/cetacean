import Engine from "../engine.js";
import WebGPU from "./webgpu.js";
import Thread from "../../../worker.js";
import { types, Topology } from "../../enums.js";
import type { ShaderMessage, AttributeDescriptor, UniformData, UniformDataDescriptor, Uniform, Drawable, GPUType } from "../../types.d.ts";

export default class WebGPUEngine extends Engine {
      /**
      * instance of the WebGPU singleton class
       */
      private static gpu: WebGPU;
      /**
       * returns new instance of the WebGPUEngine if can be created.\
       * can fail if the browser does not support WebGPU
       */
      static async new( cvs: OffscreenCanvas ){
            if( !this.gpu ){
                  const gpu = await WebGPU.get( cvs );
                  if( !gpu ){
                        WebGPU._config.debug && Thread.error(' cannot get WebGPU instance' );
                        return;
                  }
                  this.gpu = gpu;
            }
            return new WebGPUEngine();
      }
      private createVertexAttribLayout( attributes: Record<string, AttributeDescriptor>, BYTES_PER_SLOT: number ){
            

            const attribs: GPUVertexAttribute[] = [];

            let offset = 0;
            let size = 0;

            for( const v of Object.values( attributes ) ){
                  attribs.push({
                        shaderLocation: v.location,
                        offset: offset,
                        format: types[v.type].type as GPUVertexFormat,
                  });
                  offset+= types[v.type].components*BYTES_PER_SLOT;
                  size+= v.data.length*BYTES_PER_SLOT;
            }
            return {
                  size,
                  descriptor: {
                        arrayStride: offset,
                        attributes: attribs,
                  }
            }
      }
      private createVertexBuffer( attributes: Record<string, AttributeDescriptor> ){

            const BYTES_PER_SLOT = 4;
            const { size, descriptor } = this.createVertexAttribLayout( attributes, BYTES_PER_SLOT );

            const buffer = WebGPU.device.createBuffer({
                  mappedAtCreation: true,
                  usage: GPUBufferUsage.VERTEX,
                  size
            })
            this.mixArrays( buffer.getMappedRange() ,attributes, descriptor.arrayStride/BYTES_PER_SLOT );
            buffer.unmap();

            return {
                  buffer, 
                  descriptor,
            }
      }
      private createImage( image: ImageBitmap, sampled: boolean = true ): GPUTexture {
            //create the texture
            const texture = WebGPUEngine.gpu.createTexture({
                  width: image.width,
                  height: image.height,
                  format: 'rgba8unorm',
                  sampled
            });
            //copy the image over it
            WebGPU.device.queue.copyExternalImageToTexture(
                  //flipY to false to use it like webgl
                  { source: image, flipY: false, },
                  { texture, premultipliedAlpha: true },
                  { width: image.width, height: image.height },
            );
            return texture;
      }
      private writeUniformBuffer( buffer: GPUBuffer, data: Record<string, UniformDataDescriptor>, offset: number ){
            const map: Record<string, number> = {};
            for( const [k,d] of Object.entries( data ) ){
                  WebGPUEngine.gpu.writeBuffer(
                        buffer, 
                        d.data,
                        d.type,
                        offset
                  )
                  map[k] = offset;
                  offset += d.data.length*types[d.type].constructor.BYTES_PER_ELEMENT;
            }
            return {
                  offset, 
                  map
            };
      }
      private getUniformBindingSize( data: Record<string, UniformDataDescriptor> ){
            let size = 0;
            for( const v of Object.values( data ) ){
                  size += v.data.length*types[v.type].constructor.BYTES_PER_ELEMENT;
            }
            return size;
      }
      private createUniforms( uniforms: Uniform, pipeline: GPURenderPipeline  ){
            const buffer = WebGPUEngine.gpu.createBuffer({
                  label: "uniforms buffer",
                  type: "i32",
                  length: uniforms.size,
            });
            const map: Record<string,number>[][] = [];
            const bindGroups: GPUBindGroup[] = [];
            let offset = 0;

            for( let i = 0; i < uniforms.entries.length; i++ ){
                  const resources: GPUBindGroupEntry[] = [];
                  map.push([]);

                  for( let j = 0; j < uniforms.entries[i].length; j++ ){
                        if( !uniforms.entries[i][j] )
                              continue;
                        if( typeof uniforms.entries[i][j] == 'string' ){
                              resources.push({
                                    binding: j,
                                    resource: WebGPU.device.createSampler(),
                              })
                        }else if( uniforms.entries[i][j] instanceof ImageBitmap ){
                              resources.push({
                                    binding: j,
                                    resource: this.createImage( uniforms.entries[i][j] as ImageBitmap ).createView(),
                              })
                        }else{
                              resources.push({
                                    binding: j,
                                    resource: {
                                          buffer,
                                          offset,
                                          size: this.getUniformBindingSize(uniforms.entries[i][j] as Record<string, UniformDataDescriptor>),
                                    }
                              })
                              const tmp = this.writeUniformBuffer( buffer, (uniforms.entries[i][j] as Record<string, UniformDataDescriptor>), offset);
                              offset = tmp.offset;
                              map[i].push(tmp.map);
                        }
                  }
                  bindGroups.push(
                        WebGPU.device.createBindGroup({
                              layout: pipeline.getBindGroupLayout(i),
                              entries: resources,
                        })
                  );
            }
            return {
                  buffer, 
                  map,
                  bindGroups,

            }      
      }
      private createRenderFunction( pipeline: GPURenderPipeline, vBuffer: GPUBuffer, indexBuffer: GPUBuffer, bindGroups: GPUBindGroup[], nOfVertices: number ){



            if( bindGroups.length > 0 ){
                  return ( pass: GPURenderPassEncoder )=>{
                        pass.setPipeline( pipeline );
                        for( let i = 0; i < bindGroups.length; i++ )
                              pass.setBindGroup( i, bindGroups[i] );
                        pass.setIndexBuffer( indexBuffer, 'uint16' );
                        pass.setVertexBuffer( 0, vBuffer );
                        pass.drawIndexed( nOfVertices );
                  }
            }

            WebGPU._config.debug && Thread.log('no bind group found');

            return ( pass: GPURenderPassEncoder )=>{
                  pass.setPipeline( pipeline );
                  pass.setIndexBuffer( indexBuffer, 'uint16' );
                  pass.setVertexBuffer( 0, vBuffer );
                  pass.drawIndexed( nOfVertices );
            }
      }
      /**
       * create new Drawable entity
       */
      create( opt: ShaderMessage ){
            // initialize attributes-related data
            const { buffer: vBuffer, descriptor } = this.createVertexBuffer( opt.attributes );
            //creating a new rendering pipeline
            const pipeline = WebGPUEngine.gpu.createRenderPipeline( opt, descriptor );
            
            // get the number of vertices
            const numOfVertices = opt.verticesCount / this.getVertexCount( opt.topology || Topology.triangle );
            

            // create bind group and unify uniforms
            const { buffer: uBuffer, bindGroups, map: uniformMap } = this.createUniforms( opt.uniforms, pipeline );

            const indexBuffer = WebGPUEngine.gpu.createBuffer({
                  label: 'index buffer',
                  data: opt.index || this.createIndexArray( numOfVertices ),
                  usage: 'index',
                  type: 'i16x2',
            });

            // generate draw function
            const draw = this.createRenderFunction( pipeline, vBuffer, indexBuffer, bindGroups, numOfVertices );
            
            // return drawable
            return {
                  draw,
                  uBuffer,
                  uniformMap,
                  uniforms: opt.uniforms.entries,
            }
      }
      draw( objects: Drawable[] ){
            WebGPU.renderPassDescriptor = WebGPUEngine.gpu.setRenderPassDescriptorView( WebGPU.renderPassDescriptor )
            
            const encoder = WebGPU.device.createCommandEncoder();
            if( !encoder ) 
                  return;
            const pass = encoder.beginRenderPass( WebGPU.renderPassDescriptor );
            
            
            for( let i = 0; i < objects.length; i++ ){
                  objects[i].draw( pass )
            }
            pass.end()
            WebGPU.device.queue.submit( [encoder.finish()] );
      }
      write( buffer: GPUBuffer, offset: number, data: number[], type: GPUType ){
            WebGPUEngine.gpu.writeBuffer(
                  buffer, 
                  data,
                  type,
                  offset
            )
      }
}
