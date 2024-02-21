export namespace Vec {
      export const modulus = ( vec: number[] ): number => Math.sqrt( vec.reduce( ( p: number,c: number ) => p + c ) );
      export const normalize = ( vec: number[] ): number[] => {
            const cpy = [...vec];
            const det = modulus( cpy );
            return cpy.map( v => v/det );
      }
      export const dot = ( vec1: number[], vec2: number[] ): number[] => {
            const res: number[] = [];
            if( vec1.length >  vec2.length ){
                  vec2.forEach( (v: number, i: number) => res[i] = v*vec1[i] );
            }else{
                  vec1.forEach( (v: number, i: number) => res[i] = v*vec2[i] );
            }
            return res;
      }
      export const negate = ( vec: number[] ): number[] => vec.map( v => -v );
      export const vecDotScalar = ( vec: number[], scalar: number ): number[] => vec.map( v => v * scalar );
      export const sum = ( vec1: number[], vec2: number[] ): number[] => {
            const res: number[] = [];
            if( vec1.length >  vec2.length ){
                  vec2.forEach( (v: number, i: number) => res[i] = v+vec1[i] );
            }else{
                  vec1.forEach( (v: number, i: number) => res[i] = v+vec2[i] );
            }
            return res;
      }
      export const reflect = ( vec: number[], normals: number[] ): number[] => {
            const n = normalize( normals );

            if( vec.length > n.length ){
                  console.error(`vector ${vec} is too long for the normals array`);
                  return [...vec];
            }

            const reflection: number[] = dot( dot( vec, n ), n );
            return reflection.map( (v: number, i: number) => vec[i] - 2*v )
      }
}