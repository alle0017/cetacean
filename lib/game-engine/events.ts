type EventArgs = Record<string,any>;
type Handler = ( ( e: EventArgs )=> void ) | ( ()=> void );
export default class EventSystem {

      private events: Record<string,Handler[]> = {};

      emit( event: string, data?: EventArgs ){
            if( !(event in this.events) )
                  return;
            for( let i = 0; i < this.events[ event ].length; i++ ){
                  data? 
                        this.events[ event ][ i ]( data ): 
                        this.events[ event ][ i ]( {} );
            }
      }
      listen( event: string, handler: Handler ){
            if( !this.events[ event ] )
                  this.events[ event ] = [];
            this.events[ event ].push( handler );
            return handler;
      }
      remove( event: string, handler: Handler ){
            if( !(event in this.events) )
                  return;
            const handlerStr = handler.toString()
            const filtered: Handler[] = [];
            for( let i = 0; i < this.events[ event ].length; i++ ){
                  if( handlerStr !== this.events[ event ][i].toString() )
                        filtered.push( this.events[ event ][i] );
            }
            this.events[ event ] = filtered;
      }
}
