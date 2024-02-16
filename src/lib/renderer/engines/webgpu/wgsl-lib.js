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
};
