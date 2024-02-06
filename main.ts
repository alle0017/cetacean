import Renderer from "./lib/renderer/index.js";

const r = new Renderer();
r.create({
            id: "triangle",
            verticesAttribute: 'pos',
            attributes: {
                  pos: {
                        type: 'f32x4',
                        location: 0,
                        data: [
                              -1, 1, 0.5, 1,
                              -1, -1, 0.5, 1,
                              0, 1, 0.5, 1,
                        ],
                  },
                  color: {
                        type: 'f32x4',
                        location: 1,
                        data: [
                              0, 1, 0, 1,
                              1, 0, 0, 1,
                              0, 0, 1, 1,
                        ],
                  }
            },
            uniforms: [{
                  binding: 0,
                  group: 0,
                  data: {
                        delta: {
                              type: 'f32',
                              data: [0, 0, 0.4, 0]
                        }
                  }
            }],
            program: /*wgsl*/`
                  struct Attrib{
                        @location(0) pos: vec4<f32>,
                        @location(1) color: vec4<f32>,
                  }
                  struct Var{
                        @builtin(position) position: vec4f,
                        @location(0) color: vec4<f32>,
                  }
                  struct Uniforms {
                        delta: vec4f,
                  }
                  @group(0) @binding(0) var<uniform> u: Uniforms;
                  @vertex
                  fn vertex_shader( a: Attrib ) -> Var {
                        var v: Var;
                        v.position = a.pos;
                        v.color = a.color;
                        return v;
                  }
                  @fragment
                  fn fragment_shader( v: Var ) -> @location(0) vec4<f32> {
                        return v.color + u.delta;
                  }
            `,
            vertexEntry: "vertex_shader",
            fragmentEntry: "fragment_shader",
});
r.render();