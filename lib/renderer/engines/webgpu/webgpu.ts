import Thread from '../../../worker.js';
import { types } from '../../enums.js';
import type { Config, TextureOptions, BufferOptions, ShaderMessage, GPUType } from '../../types.d.ts';

export default class WebGPU {
      private static instance: WebGPU;

      static device: GPUDevice;
      private static canvasFormat: GPUTextureFormat;
      private static ctx: GPUCanvasContext;

      private static renderTarget: GPUTexture;
      private static depthTexture: GPUTexture;

      static renderPassDescriptor: GPURenderPassDescriptor;

      private static _config: Config = {
            antialias: 4,
            culling: true,
            clearColor: { r: 0, g: 0, b: 0, a: 0 },
            debug: true,
            depth: true,
      }


      static async get( cvs?: OffscreenCanvas ){
            if( cvs && !this.instance ){
                  this.instance = new WebGPU( cvs );
                  const adapter = await navigator.gpu.requestAdapter();
                  if( !adapter ){
                        Thread.error( "No adapter available" );
                        return;
                  }
                  const ctx = cvs.getContext('webgpu');

                  if( !ctx ){
                        Thread.error('no webgpu context available');
                        return;
                  }
      
                  this.ctx = ctx;
                  
      
                  if( !navigator && !('gpu' in navigator) ){
                        Thread.error('no navigator available');
                        return;
                  }
                  const device = await adapter.requestDevice();
      
                  if( !device ){
                        Thread.error('no device available');
                        return;
                  }
      
                  this.device = device;
      
                  this.device.addEventListener('uncapturederror', e =>{
                        if( 'error' in e )
                        Thread.error(`${e.error} not captured`);
                        else 
                        Thread.error('error not captured occurred while executing webgpu commands');
                  })
      
                  this.canvasFormat = navigator.gpu.getPreferredCanvasFormat();
                  if( !this.canvasFormat ){
                        Thread.error('canvas format not available');
                        return;
                  }
      
      
                  this.depthTexture = this.instance.createTexture( {
                        format: 'depth24plus',
                        sampled: true,
                        usage: GPUTextureUsage.RENDER_ATTACHMENT
                  } );
                  this.renderTarget = this.instance.createTexture({ 
                        format: this.canvasFormat, 
                        sampled: true, 
                        usage: GPUTextureUsage.RENDER_ATTACHMENT 
                  } );
                  this.ctx.configure({
                        device: this.device,
                        format: this.canvasFormat,
                        alphaMode:'opaque'
                  });

                  this.renderPassDescriptor = this.createRenderPassDescriptor()
                  return this.instance;
                  //this.renderPassDescriptor = this.createRenderPassDescriptor();
            }else if( !this.instance ){
                  Thread.error('WebGPU not configured');
                  return;
            }else{
                  return this.instance;
            }
      }

      
      constructor( public cvs: OffscreenCanvas ){}
      private static createRenderPassDescriptor(): GPURenderPassDescriptor{
            const description: GPURenderPassDescriptor = {
                  colorAttachments: [{
                        view: WebGPU.ctx.getCurrentTexture().createView(),
                        clearValue: WebGPU._config.clearColor, //background color
                        loadOp: 'clear',
                        storeOp: 'store'
                  }],
            };
            if( WebGPU._config.antialias == 4 ){
                  (description.colorAttachments as GPURenderPassColorAttachment[])[0].view = WebGPU.renderTarget.createView() as GPUTextureView;
                  (description.colorAttachments as GPURenderPassColorAttachment[])[0].resolveTarget = WebGPU.ctx.getCurrentTexture().createView();
            }
            if( WebGPU._config.depth ) 
                  return { 
                        ...description,
                        depthStencilAttachment: {
                              view: WebGPU.depthTexture.createView() as GPUTextureView,
                              depthClearValue: 1.0,
                              depthLoadOp: 'clear',
                              depthStoreOp: "store",
                        }
                  }
            return description;
      }
      createTexture( options: Partial<TextureOptions> ): GPUTexture {
            let texture: GPUTexture;
            texture = WebGPU.device.createTexture({
                  size: [
                        options.width || WebGPU.ctx.canvas.width, 
                        options.height || WebGPU.ctx.canvas.height, 
                        1
                  ],
                  format: options.format || WebGPU.canvasFormat,
                  sampleCount: options.sampled? WebGPU._config.antialias: 1,
                  usage: options.usage || (
                                          GPUTextureUsage.TEXTURE_BINDING |
                                          GPUTextureUsage.COPY_DST |
                                          GPUTextureUsage.RENDER_ATTACHMENT
                                    ),
            });
            return texture;
      }
      writeImageOnTexture( image: ImageBitmap, texture: GPUTexture ){
            WebGPU.device.queue.copyExternalImageToTexture(
                  //flipY to false to use it like webgl
                  { source: image, flipY: false, },
                  { texture, premultipliedAlpha: true },
                  { width: image.width, height: image.height },
            );
      }
      createBuffer( opt: BufferOptions ){
            let mappedAtCreation = false;
            let usage = GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
            let size: number = types[opt.type].constructor.BYTES_PER_ELEMENT;;
            if( 'usage' in opt ){
                  mappedAtCreation = true;
                  usage = opt.usage == 'vertex'? 
                        GPUBufferUsage.VERTEX: 
                        GPUBufferUsage.INDEX;
                  size *= opt.data.length;
            }else{
                  size *= opt.length; 
            }
            const buffer = WebGPU.device.createBuffer({
                  size,
                  usage,
                  mappedAtCreation
            })
            if( 'usage' in opt ){
                  const view = new types[opt.type].constructor(buffer.getMappedRange());
                  view.set( opt.data );
                  buffer.unmap();
            }
            return buffer;
      }
      writeBuffer( buffer: GPUBuffer, data: number[], type: GPUType, offset: number = 0 ){ 
            WebGPU.device.queue.writeBuffer( 
                  buffer, 
                  offset, 
                  new types[type].constructor(data), 
                  0, 
                  data.length,
            );
      }
      createRenderPipeline( shader: ShaderMessage, layout: GPUVertexBufferLayout, ){
            const module = WebGPU.device.createShaderModule({ code: shader.program })
            return WebGPU.device.createRenderPipeline({
                  vertex: {
                        entryPoint: shader.vertexEntry,
                        module,
                        buffers: [layout],
                  },
                  fragment: {
                        module,
                        entryPoint: shader.fragmentEntry,
                        targets: [{
                              format: WebGPU.canvasFormat,
                              //used for enable alpha in images
                              blend: {
                                    alpha: {
                                          dstFactor: 'one-minus-src-alpha',
                                          srcFactor: 'src-alpha'
                                    },
                                    color: {
                                          dstFactor: 'one-minus-src-alpha',
                                          srcFactor: 'src-alpha'
                                    }
                              }
                        }],
                  },
                  primitive: {
                        topology: shader.topology,
                        cullMode: ( WebGPU._config.culling? 'back': 'none'),
                  },
                  layout: 'auto',
                  multisample: {
                        count: WebGPU._config.antialias
                  },
                  depthStencil: {
                        depthWriteEnabled: true,
                        depthCompare: 'less',
                        format: 'depth24plus',
                  }
            })
      }
      setRenderPassDescriptorView( renderPassDescriptor: GPURenderPassDescriptor ): GPURenderPassDescriptor {
            if ( WebGPU._config.antialias === 1) {
                  (renderPassDescriptor.colorAttachments as GPURenderPassColorAttachment[])[0].view = WebGPU.ctx.getCurrentTexture().createView();
                  return renderPassDescriptor;
            }
            (renderPassDescriptor.colorAttachments as GPURenderPassColorAttachment[])[0].view = WebGPU.renderTarget.createView() as GPUTextureView;
            (renderPassDescriptor.colorAttachments as GPURenderPassColorAttachment[])[0].resolveTarget = WebGPU.ctx.getCurrentTexture().createView();
            return renderPassDescriptor;
      }
}