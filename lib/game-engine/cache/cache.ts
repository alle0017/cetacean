import Thread from "../../worker.js";

class ServiceWorkerCache {
      static cache: Cache;
      static async new(){
            this.cache = await caches.open('serviceWorkerCache');
            this.listen();
      }
      static listen(){
            /*self.addEventListener( 'install', (e)=>{
                  if( !( 'waitUntil' in e && typeof e.waitUntil == 'function' ) )
                        return;
                  e.waitUntil(
                        this.save([
                              import.meta.url,
                        ])
                  )
            })*/
            self.addEventListener( 'fetch', (e)=>{
                  if( !( 'request' in e && 'respondWith' in e && typeof e.respondWith == 'function') )
                        return;
                  Thread.log('fetching...')
                  e.respondWith(
                        this.cCacheFirst( e.request as RequestInfo )
                  )
            })
            self.addEventListener("activate", (e) => {
                  
                  if( 
                        'waitUntil' in e 
                        && typeof e.waitUntil == 'function'
                        && 'registration' in self 
                        && self.registration 
                        && typeof self.registration == 'object' 
                        && 'navigationPreload' in self.registration
                        && self.registration.navigationPreload
                        && typeof self.registration.navigationPreload == 'object' 
                        && 'enable' in self.registration.navigationPreload
                        && typeof self.registration?.navigationPreload.enable == 'function'
                  )
                  e.waitUntil(
                        self.registration.navigationPreload.enable()
                  );
            });
            self.addEventListener( 'message',  e =>{
                  if( e.data.message == 'cache' && 'url' in e.data ){
                        this.cache.add( e.data.url );
                  }
            })
      }

      /**
       * check the cache first, if the request was already cached
       */
      static async cCacheFirst( request: RequestInfo | URL ){
            const cached = await this.cache.match( request );
            if( cached )
                  return cached
            const fetched = await fetch( request );

            await this.cache.put( request, fetched );

            return fetched;
      }
      static async save( resources: string[] ){
            this.cache.addAll( resources );
      }
}
ServiceWorkerCache.new();
