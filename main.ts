import Renderer from "./lib/renderer/index.js";

const r = new Renderer();
const img = new Image()
img.src = '../svg(1).svg'
img.onload = async ()=>{
const bitmap = await createImageBitmap(img);
r.create({
            id: "triangle",
            verticesAttribute: 'pos',
            index: [ 
                        0, 1, 2,
                        1, 2, 3
                  ],
            attributes: {
                  pos: {
                        type: 'f32x4',
                        location: 0,
                        data: [
                              -1, 1, 0.5, 1,
                              -1, -1, 0.5, 1,
                              0, 1, 0.5, 1,
                              0, -1, 0.5, 1,
                        ],
                  },
                  coords: {
                        type: 'f32x4',
                        location: 1,
                        data: [
                              0, 1, 0, 1,
                              1, 0, 0, 1,
                        ],
                  }
            },
            uniforms: [{
                  binding: 0,
                  group: 0,
                  data: 'sampler',
            },{
                  binding: 1,
                  group: 0,
                  data: {
                        color: {
                              type: 'f32x4',
                              data: [0,0,0,1],
                        }
                  },
            },{
                  binding: 2,
                  group: 0,
                  data: bitmap,
            }],
            vertex: /*wgsl*/`

                  struct Attrib{
                        @location(0) pos: vec4<f32>,
                        @location(1) coords: vec2<f32>,
                  }
                  struct Varyings {
                        @builtin(position) position: vec4<f32>,
                        @location(0) coords: vec2<f32>,
                  }

                  @vertex
                  fn vertex_shader( a: Attrib ) -> Varyings {
                        var v: Varyings;
                        v.position = a.pos;
                        v.coords = a.coords;
                        return v;
                  }
            `,
            fragment: /*wgsl*/`

            @group(0) @binding(0) var samp: sampler;
            @group(0) @binding(1) var<uniform> color: vec4f;
            @group(0) @binding(2) var text: texture_2d<f32>;
                  @fragment
                  fn fragment_shader( v: Varyings ) -> @location(0) vec4<f32> {
                        return textureSample( text, samp, v.coords ) + color;
                  }
            `,
});
r.render();
setInterval(() => r.update('triangle', [{
      group: 0,
      binding: 1,
      data: {
            color: [0,1,0,0]
      }
}]), 1000 )
}