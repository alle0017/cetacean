
export default class Thread {

      static #listeners: Record<string,Function> = {};
      static #waiting: boolean = false;
      static #queue: MessageEvent<any>[] = [];
      static #postQueue: {
            message: string, 
            data: unknown, 
            id: string | undefined
      }[] = [];
      static #threads: Record<string,Worker> = {};
      static #execQueueEvents(){
            this.#queue.forEach( e =>{
                  if( 'data' in e.data ){
                        Thread.#listeners[e.data.type](e.data.data);
                  }else{
                        Thread.#listeners[e.data.type]();
                  }
            })
            this.#queue = [];
            this.#postQueue.forEach( e =>{
                  Thread.post(e.message, e.data, e.id)
            })
            this.#postQueue = [];
      }
      static #isTransferable( data: unknown ): data is Transferable {
            return data instanceof OffscreenCanvas || 
            data instanceof ImageBitmap || 
            data instanceof MessagePort ||
            data instanceof ReadableStream ||
            data instanceof WritableStream ||
            data instanceof TransformStream || 
            //data instanceof VideoFrame || 
            data instanceof ArrayBuffer;
      } 
      static #getTransferable( data: unknown ): Transferable[]{
            if( Thread.#isTransferable(data) ){
                  return [data];
            }
            if( !data || typeof data !== 'object' || !Object.keys( data ).length ){
                  return [];
            }
            const transferable: Transferable[] = [];
            Object.values( data ).forEach( e =>{
                  if( Thread.#isTransferable(e) )
                        transferable.push( e );
            })
            return transferable;
      }
      static isChildThread(): boolean {
            return typeof window == 'undefined';
      }
      static expose( message: string, transferable: Record<string,Transferable>, id?: string ){
            const exposed: Transferable[] = [];
            const values = Object.values( transferable );
            for( let i = 0; i < values.length; i++ ){
                  exposed.push( values[i] ); 
            }
            if( Thread.isChildThread() ){
                  self.postMessage({
                        type: message,
                        data: transferable,
                  }, '*', exposed );
            }else if( id && Thread.#threads[id] ){
                  Thread.#threads[id].postMessage({
                        type: message,
                        data: transferable,
                  }, exposed );
            }else{
                  Thread.error('you have to specify the thread if you are using Thread.post from window');
            }
      }
      static spawn(id: string, code: string | URL): undefined | string {
            if( this.#threads[id] ){
                  Thread.error(`thread ${id} already exists`);
                  return;
            }
            const thread = new Worker(code, {
                  type: 'module',
            });
            thread.onerror = (e)=>{
                  Thread.error(`error occurred while running thread ${id}`);
                  console.error(e)
            }
            thread.onmessageerror = (e)=>{
                  Thread.error(`error occurred while running thread ${id} (message cannot be serialized)`);
                  console.error(e)
            }
            thread.addEventListener('message', e =>{
                  if( !('type' in e.data) || !('message' in e.data) || e.data.type !== 'log' )
                        return;
            });
            thread.addEventListener('message', e =>{
                  if( !('type' in e.data) || !('message' in e.data) || e.data.type !== 'error' )
                        return;
                  Thread.error(e.data.message);
            });
            this.#threads[id] = thread;
            return id;
      }
      static listen( message: string, callback: Function, id?: string ){
            if( typeof message !== 'string' || typeof callback !== 'function' ){
                  Thread.error(`handler rejected ${message}`);
                  return;
            }
            this.#listeners[message] = callback;
            
            if( Thread.isChildThread() ){
                  self.addEventListener('message', e =>{
                        if( !('type' in e.data) || e.data.type !== message )
                              return;
                        if( Thread.#waiting ){
                              Thread.#queue.push( e );
                        }else if( 'data' in e.data ){
                              Thread.#listeners[message](e.data.data);
                        }else{
                              Thread.#listeners[message]();
                        }
                  })
            }else if( id && this.#threads[id] ){
                  this.#threads[id].addEventListener('message', e =>{
                        if( !('type' in e.data) || e.data.type !== message )
                              return;
      
                        if( Thread.#waiting ){
                              Thread.#queue.push( e );
                        }else if( 'data' in e.data ){
                              Thread.#listeners[message](e.data.data);
                        }else{
                              Thread.#listeners[message]();
                        }
                  })
            }else{
                  Thread.error('you have to specify the thread if you are using Thread.listen from window');
            }
      }
      /**
       * wait for message to be received.
       * available only for one message at time
       */
      static wait(message: string, id?: string){
            this.#waiting = true;
            if( Thread.isChildThread() ){
                  self.addEventListener('message', e =>{
                        if( 'type' in e.data && e.data.type === message ){
                              Thread.#waiting = false;
                              Thread.#execQueueEvents();
                        }
                  })
            }else if( id && Thread.#threads[id] ){
                  Thread.#threads[id].addEventListener('message', e =>{
                        if( 'type' in e.data && e.data.type === message ){
                              Thread.#waiting = false;
                              Thread.#execQueueEvents();
                        }
                  });
            }else{
                  Thread.error('you have to specify the thread if you are using Thread.wait from window');
            }
      }
      
      static post( message: string, data: unknown, id?: string ){
            if( Thread.#waiting ){
                  Thread.#postQueue.push({
                        message,
                        data,
                        id,
                  })
                  return;
            }
            if( Thread.isChildThread() ){
                  self.postMessage({
                        type: message,
                        data
                  });
            }else if( id && Thread.#threads[id] ){
                  Thread.#threads[id].postMessage({
                        type: message,
                        data
                  })
            }else{
                  Thread.error('you have to specify the thread if you are using Thread.post from window');
            }
      }
      static postCanvas(message: string, canvas: HTMLCanvasElement, id?: string): void {
            
            const offscreen = canvas.transferControlToOffscreen();

            if( id && Thread.#threads[id] && !Thread.isChildThread() ){
                  Thread.#threads[id].postMessage({
                        type: message,
                        data: offscreen,
                  }, [offscreen] );
            }else{
                  Thread.error('you have to specify the thread if you are using Thread.post from window');
            }
      }
      static log( message: any ){
            if( Thread.isChildThread() ){
                  self.postMessage({
                        type: 'log',
                        message: message,
                  });
            }else{
                  console.log(message);
            }
      }
      static error( message: any ){
            if( Thread.isChildThread() ){
                  self.postMessage({
                        type: 'error',
                        message: message,
                  });
            }else{
                  console.error(message);
            }
      }
      /**
       * kill the current thread or the child thread with the specified id 
       */
      static kill(id: string){
            if( typeof id == 'string' ){
                  if( Thread.#threads[id] ){
                        Thread.#threads[id].terminate();
                        delete Thread.#threads[id];
                  }else{
                        Thread.error(`thread ${id} doesn't exists`);
                  }
            }else if( Thread.isChildThread() ){
                  Thread.post('killed', null)
                  self.close();
            }else{
                  console.error('cannot kill the main thread');
            }
      }
      static async join(id: string): Promise<void> {
            if( typeof id !== 'string' || !Thread.#threads[id] ){
                  Thread.error(`thread ${id} doesn't exists`);
                  return;
            }
            return new Promise((resolve, reject) =>{
                        Thread.listen('killed', ()=>{
                              resolve();
                        }, id);
                  }
            );
      }
}
