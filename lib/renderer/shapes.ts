import type { Point3D, ShapeDescriptor } from "../types.d.ts";
export const Shapes = Object.freeze({

      rectangle( center: Point3D = { x: 0, y: 0, z: 0 }, width: number = 1, height: number = 1 ): ShapeDescriptor {
            const w = width;
            const h = height;
            const coords = [

                  w, -h, 1, 1,
                  -w, h, 1, 1,
                  w, h, 1, 1,
                  -w, -h, 1, 1,
            ];
            if( center.x || center.y || center.z ){
                  for( let i = 0; i < 4; i++ ){
                        coords[i*4] += center.x;
                        coords[i*4+1] += center.y;
                        coords[i*4+2] += center.z;
                  }
            }
            return {
                  vertices: coords,
                  normals: [ 
                        1, 0, 0, 
                        1, 0, 0,
                        1, 0, 0,
                        1, 0, 0,
                  ],
                  indices: [
                        0, 2, 3,
                        2, 1, 3
                  ]
            }
      }
});