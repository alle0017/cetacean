
export class Loader {
      async image( path: string ){
            //const url = new URL( path );
            
            //postMessage({ url: url.toString(), message: 'cache' });
            
            const img = document.createElement('img');

            img.src = path;

            const promise = new Promise( ( resolve: (value: ImageBitmap) => void, reject )=>{
                  img.onload = async () => resolve( await createImageBitmap(img) );
                  img.onerror = () => reject()
            })
            return promise;
      }
}