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
export const vertex: string = /*wgsl*/`
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
`
/**
* ## basic fragment shader that accepts:
* @uniforms
* ##### group(0) binding(1):
* - light_direction vec4f
* @varyings of type Varyings
* - color: vec4f
*/
export const fragment: string = /*wgsl*/`
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
`;