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
export const vertex: string = /*wgsl*/`
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
            transformation: mat4x4f,
            perspective: mat4x4f,
            coords_max: vec2f,
            coords_min: vec2f,
      }
      
      @group(0) @binding(0) var<uniform> uniforms: Uniforms;

      @vertex
      fn vertex_shader( attr: Attributes ) -> Varyings {
            var v: Varyings;
            v.position = uniforms.perspective * uniforms.transformation * attr.position;
            v.tex_coords = vec2f(
                  (attr.position.x - uniforms.coords_min.x)/(uniforms.coords_max.x - uniforms.coords_min.x),
                  (attr.position.y - uniforms.coords_min.y)/(uniforms.coords_max.y - uniforms.coords_min.y)
            );
            v.normal = attr.normal;

            return v;
      }
`
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
export const textureVertex = /*wgsl*/`
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
`

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
export const fragment: string =  /*wgsl*/`

      struct FragmentUniforms {
            light_direction: vec3f,
            animation_vec: vec2f,
      }
      @group(0) @binding(1) var<uniform> fragment_uniforms: FragmentUniforms;

      @group(1) @binding(0) var texture: texture_2d<f32>;
      @group(1) @binding(1) var tex_sampler: sampler;

      @fragment
      fn fragment_shader( v: Varyings ) -> @location(0) vec4f {
            var color = textureSample(texture, tex_sampler, v.tex_coords + fragment_uniforms.animation_vec );
            return vec4f(color.rgb * dot( 
                        normalize( v.normal ), 
                        fragment_uniforms.light_direction.xyz
                        ), 
                  color.a 
            );
      }
`