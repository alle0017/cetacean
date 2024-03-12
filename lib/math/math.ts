/**
* Converts degrees to radians.
* @param {number} deg - Angle in degrees.
* @returns {number} - Angle in radians.
*/
export function degToRad(deg: number): number {
      return deg * Math.PI / 180; 
}
/*
 * returns random number between the specified [min, max]. the number is float.
 */
export const random = ( min: number, max: number )=>{

      const now = new Date();
      const dateRand = ( now.getHours() + now.getMinutes() + now.getSeconds() + now.getMonth() + now.getDate() + 4 )/187;
      const msRand = (now.getMilliseconds() + 1)/1000;
      const minMaxRand = Math.cos( max ) * Math.sin( min );

      const lower = 0.065;

      let seed = Math.abs( Math.random() * dateRand * minMaxRand * msRand );

      while( seed < lower ){
            seed *= 10;
      }
      const r = ( max * Math.abs( Math.cos( seed * Math.PI*2 ) ) ) + min;
      return r < max ? r: r - max;
}

