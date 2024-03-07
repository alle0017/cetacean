export const onKeyPressed = ( key: string )=>{
      if( key.length > 1 ){
            console.warn( `you can recognize only one key press at a time, the only char that will be recognized id ${ key[0] }` );
            key = key[0];
      }
      return (target: any, propertyName: string, descriptor: TypedPropertyDescriptor<Function>)=>{
            const method = descriptor.value;
            if( !method || typeof method !== 'function' )
                  return;
            window.addEventListener('keypress', function (e){
                  if( e.key != key ){
                        return;
                  }
                  method.bind(this)()
            })
      }
}
export const onSequencePressed = ( sequence: string )=>{
      let insertedKeys = '';

      return (target: any, propertyName: string, descriptor: TypedPropertyDescriptor<Function>)=>{
            const method = descriptor.value;
            if( !method || typeof method !== 'function' )
                  return;
            window.addEventListener('keypress', function (e){
                  insertedKeys += e.key;
                  if( insertedKeys.indexOf( sequence ) >= 0 ){
                        method.bind(this)()
                        insertedKeys = '';
                  }
            })
      }
}