export interface Engine {
      draw(): void;
      create(): void;
      get( cvs: OffscreenCanvas ): Promise<void>; 
}

export type GPUType =  'i32' | 
'i32x2' | 
'i32x3' | 
'i32x4' |
'i16x2' | 
'i16x4' | 
'i8x2' | 
'i8x4' | 
'u32' | 
'u32x2' | 
'u32x3' | 
'u32x4' | 
'u16x2' | 
'u16x4' | 
'u8x2' | 
'u8x4' | 
'f32' | 
'f32x2' | 
'f32x3' | 
'f32x4' |
'i8';

export type AttributeDescriptor = {
      type: GPUType,
      location: number,
      data: number[],
}
export type UniformDataDescriptor = {
      type: GPUType,
      data: number[],
}
export type UniformDescriptor = {
      binding: number,
      group: number,
      data: ImageBitmap | 'sampler' | Record<string,UniformDataDescriptor>;
}
export type ShaderDescriptor = {
      id: string,
      verticesAttribute: string,
      attributes: Record<string, AttributeDescriptor>,
      uniforms: UniformDescriptor[],
      vertex: string,
      fragment: string,
      topology?: GPUPrimitiveTopology,
      index?: number[],
}
export type AttributeData = { 
      type: GPUType, 
      data: number[] 
}
export type UniformData = ImageBitmap | 'sampler' | Record<string,UniformDataDescriptor>;

export type Uniform = {
      sizesForStruct: number[][],
      size: number,
      entries: UniformData[][]
};
export type TypedArray =  Float64Array | Float32Array | Int32Array | Int16Array | Int8Array | Uint32Array | Uint16Array | Uint8Array;
/**
 * @ignore
 */
export type ShaderMessage = {
      id: string,
      verticesCount: number,
      attributes: Record<string, AttributeDescriptor>,
      /**binding and group used as indices */
      uniforms: Uniform,
      vertex: string,
      fragment: string,
      vertexEntry: string,
      fragmentEntry: string,
      topology?: GPUPrimitiveTopology,
      index?: number[],
}

export type TextureOptions = {
      format: GPUTextureFormat, 
      sampled: boolean,
      width: number, 
      height: number,
      usage: number,
}
export type Color = {
      r: number,
      g: number,
      b: number,
      a: number,
}

export type Config = {
      antialias: 4 | 1,
      culling: boolean,
      clearColor: Color,
      debug: boolean,
      depth: boolean,
}

export type BufferOptions = {
      usage: 'vertex' | 'index',
      data: number[],
      label: string,
      type: GPUType,
} | {
      length: number,
      label: string,
      type: GPUType,
}

export type Drawable = {
      draw: (any)=>void,
      uBuffer: GPUBuffer,
      uniformMap: Record<string, number>[][],
      uniforms: UniformData[][],
}