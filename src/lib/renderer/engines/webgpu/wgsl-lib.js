export const std = {
    skinning: /* wgsl */ `
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
    * - location 0 vec4f position
    *
    * @uniforms
    * group(0) binding(0):
    * - perspective mat4x4f
    * - transformation mat4x4f
    */
    staticColorVertex: /* wgsl */ `

      struct Attributes {
            @location(0) position: vec4f,
      }
      struct Varyings {
            @builtin(position) position: vec4f,
      }
      struct Uniforms {
            perspective: mat4x4f,
            transformation: mat4x4f,
      }
      
      @group(0) @binding(0) var<uniform> uniforms: Uniforms;
      @vertex
      fn vertex_shader( attr: Attributes ) -> Varyings {
            var v: Varyings;
            v.position = uniforms.transformation * uniforms.perspective * attr.position;

            return v;
      }  
      `,
    /**
    * vertex shader with:
    * @attributes
    * - location 0 vec4f position
    * - location 1 vec4f color
    *
    * @uniforms
    * group(0) binding(0):
    * - perspective mat4x4f
    * - transformation mat4x4f
    * @returns Varying struct that contains:
    * - color: vec4f
    */
    basicVertex: /* wgsl */ `

      struct Attributes {
            @location(0) position: vec4f,
            @location(1) color: vec4f,
      }
      struct Varyings {
            @builtin(position) position: vec4f,
            @location(1) color: vec4f,
      }
      struct Uniforms {
            perspective: mat4x4f,
            transformation: mat4x4f,
      }
      
      @group(0) @binding(0) var<uniform> uniforms: Uniforms;
      @vertex
      fn vertex_shader( attr: Attributes ) -> Varyings {
            var v: Varyings;
            v.position = uniforms.transformation * uniforms.perspective * attr.position;
            v.color = attr.color;

            return v;
      }     
      `,
    /**
    * vertex shader with:
    * @attributes
    * - location 0 vec4f position
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
    lightVertex: /*wgsl*/ `
            struct Attributes {
                  @location(0) position: vec4f,
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
            fn vertex_shader( attr: Attributes ) -> Varyings {
                  var v: Varyings;
                  v.position = uniforms.transformation * uniforms.perspective * attr.position;
                  v.color = attr.color;
                  v.normal = ( uniforms.transformation * uniforms.perspective * vec4f( attr.normal, 1.0 ) ).xyz;

                  return v;
            }
      `,
    /**
    * basic fragment shader that accepts:
    * @varyings of type Varyings
    * - color: vec4f
     */
    basicFragment: /*wgsl*/ `
            @fragment
            fn fragment_shader( v: Varyings ) -> @location(0) vec4f {
                  return v.color;
            }
      `,
    /**
    * basic fragment shader that accepts:
    * @varyings of type Varyings
    * - color: vec4f
     */
    lightFragment: /*wgsl*/ `
            struct FragmentUniforms {
                  light_direction: vec4f,
            }
            @group(0) @binding(1) var<uniform> fragment_uniforms: FragmentUniforms;
            @fragment
            fn fragment_shader( v: Varyings ) -> @location(0) vec4f {
                  return vec4f( 
                        v.color.rgb * dot( 
                              normalize( v.normal ), 
                              fragment_uniforms.light_direction.xyz
                              ) * 0.5 + 0.5, 
                        v.color.a 
                  );
            }
      `,
    lightStaticColorFragment: (color) => /*wgsl*/ `
            struct FragmentUniforms {
                  light_direction: vec3f,
            }
            @group(0) @binding(1) var<uniform> fragment_uniforms: FragmentUniforms;
            @fragment
            fn fragment_shader(v: Varyings) -> @location(0) vec4f {
                  return vec4f( 
                        vec3f( ${color.r}, ${color.g}, ${color.b} ) * dot( 
                              normalize( v.normal ), 
                              fragment_uniforms.light_direction 
                              ) * 0.5 + 0.5, 
                        ${color.a}
                  );
            }
      `
};
