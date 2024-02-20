export const std = {
      skinning: /* wgsl */`
      fn skinning( indices: vec4f, weights: vec4f ) -> mat4x4f {
            var m: mat4x4f = mat4x4f(
                  vec4f(0, 0, 0, 0),
                  vec4f(0, 0, 0, 0),
                  vec4f(0, 0, 0, 0),
                  vec4f(0, 0, 0, 0)
            );
            for( var i = 0; i < 4; i++ ){
                  m += bones[i32(indices[i])]*weights[i];
            }
            return m;
      }
      `,
      /**
      * vertex shader with:
      * @attributes 
      * - location 0 vec3f position 
      * - location 1 vec4f color
      * - location 2 vec3f normal
      * 
      * @uniforms
      * group(0) binding(0):
      * - perspective mat4x4f
      * - transformation mat4x4f
      * @returns Varying struct that contains:
      * - normal vec3f
      * - color: vec4f
      */
      basicVertex: /*wgsl*/`
            struct Attributes {
                  @location(0) position: vec3f,
                  @location(1) color: vec4f,
                  @location(2) normal: vec3f,
            }
            struct Varyings {
                  @builtin(position) position: vec4f,
                  @location(0) normal: vec3f,
                  @location(1) color: vec4f,
            }
            struct Uniforms {
                  perspective: mat4x4f,
                  transformation: mat4x4f,
            }
            
            @group(0) @binding(0) var<uniform> uniforms: Uniforms;
            @vertex
            fn main( attr: Attributes ) -> Varyings {
                  var v: Varyings;
                  v.position = vec4f( attr.position, 1 );
                  v.color = attr.color;
                  v.normal = attr.normal;

                  return v;
            }
      `,
      basicFragment: /*wgsl*/`
      `,
}
