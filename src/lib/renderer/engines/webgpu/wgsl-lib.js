export const std = {
    /**
     * ## skinning function
     * @name skinning
     * accepts
     * @params
     * - indices vec4f indices array of each bone
     * - weights vec4f weight of each bone
     * @returns mat4x4f
     * @example
     * ```wgsl
     *    \@vertex
     *    fn vertex()-> \@builtin(position) vec4f {
     *          skinning(indices, weights);
     *    }
     * ```
     */
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
    * ## vertex shader with:
    * @attributes
    * - location 0 vec4f position
    *
    * @uniforms
    * ##### group(0) binding(0):
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
    * ## vertex shader with:
    * @attributes
    * - location 0 vec4f position
    * - location 1 vec4f color
    *
    * @uniforms
    * ##### group(0) binding(0):
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
    * ## vertex shader with:
    * @attributes
    * - location 0 vec4f position
    * - location 1 vec4f color
    * - location 2 vec3f normal
    *
    * @uniforms
    * ##### group(0) binding(0):
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
                  v.position = uniforms.perspective * uniforms.transformation * attr.position;
                  v.color = attr.color;
                  v.normal = ( uniforms.transformation * uniforms.perspective * vec4f( attr.normal, 1.0 ) ).xyz;

                  return v;
            }
      `,
    /**
    * ## vertex shader for 3D textures, usable with textureFragment:
    * @attributes
    * - location 0 vec4f position
    * - location 1 vec3f normal
    *
    * @uniforms
    * ##### group(0) binding(0):
    * - perspective mat4x4f
    * - transformation mat4x4f
    * - coords_max vec2f
    * - coords_min vec2f
    * @returns Varying struct that contains:
    * - normal vec3f
    * - tex_coords: vec42f
    */
    texture3DVertex: /*wgsl*/ `
      struct Attributes {
            @location(0) position: vec4f,
            @location(1) normal: vec3f,
      }
      struct Varyings {
            @builtin(position) position: vec4f,
            @location(0) normal: vec3f,
            @location(1) tex_coords: vec2f,
      }
      struct Uniforms {
            perspective: mat4x4f,
            transformation: mat4x4f,
            coords_max: vec2f,
            coords_min: vec2f,
      }
      
      @group(0) @binding(0) var<uniform> uniforms: Uniforms;

      @vertex
      fn vertex_shader( attr: Attributes ) -> Varyings {
            var v: Varyings;
            v.position = uniforms.transformation * uniforms.perspective * attr.position;
            v.tex_coords = vec2f(
                  (attr.position.x - uniforms.coords_min.x)/(uniforms.coords_max.x - uniforms.coords_min.x),
                  (attr.position.y - uniforms.coords_min.y)/(uniforms.coords_max.y - uniforms.coords_min.y)
            );
            v.normal = attr.normal;

            return v;
      }
      `,
    /**
    * ## vertex shader with:
    * @attributes
    * - location 0 vec4f position
    * - location 1 vec2f tex_coords
    * - location 2 vec3f normal
    *
    * @uniforms
    * ##### group(0) binding(0):
    * - perspective mat4x4f
    * - transformation mat4x4f
    * @returns Varying struct that contains:
    * - normal vec3f
    * - tex_coords: vec42f
    */
    textureVertex: /*wgsl*/ `
      struct Attributes {
            @location(0) position: vec4f,
            @location(1) tex_coords: vec2f,
            @location(2) normal: vec3f,
      }
      struct Varyings {
            @builtin(position) position: vec4f,
            @location(0) normal: vec3f,
            @location(1) tex_coords: vec2f,
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
            v.tex_coords = attr.tex_coords;
            v.normal = attr.normal;

            return v;
      }
      `,
    /**
    * ## basic fragment shader that accepts:
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
    * ## basic fragment shader that accepts:
    * @uniforms
    * ##### group(0) binding(1):
    * - light_direction vec4f
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
                  return vec4f( v.color.rgb * dot( 
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
      `,
    /**
    * ## fragment for textures:
    * @uniforms
    * ##### group(0) binding(1):
    * - light_direction vec4f
    * ##### group(1) binding(0)
    * - texture: texture_2d<f32>
    * ##### group(1) binding(1)
    * - tex_sampler: sampler
    * @varyings of type Varyings
    * - tex_coords: vec2f
     */
    textureFragment: /*wgsl*/ `

      struct FragmentUniforms {
            light_direction: vec4f,
      }
      @group(0) @binding(1) var<uniform> fragment_uniforms: FragmentUniforms;

      @group(1) @binding(0) var texture: texture_2d<f32>;
      @group(1) @binding(1) var tex_sampler: sampler;

      @fragment
      fn fragment_shader( v: Varyings ) -> @location(0) vec4f {
            var color = textureSample(texture, tex_sampler, v.tex_coords);
            return vec4f(color.rgb * dot( 
                        normalize( v.normal ), 
                        fragment_uniforms.light_direction.xyz
                        ), 
                  color.a 
            );
      }
      `,
};
