import most from 'most';

function setImmediate( fn ) {
  return setTimeout( fn, 0 );
}

function Subject( initial = null ) {
  let _add;
  let _end;
  let _error;

  const stream = most.create( ( add, end, error ) => {
    _add = add;
    _end = end;
    _error = error;
    return _error;
  });

  stream.push = v => setImmediate( () => {
    return typeof _add === `function` ? _add( v ) : void 0;
  });

  stream.end = () => setImmediate( () => {
    return typeof _end === `function` ? _end() : void 0;
  });

  stream.error = e => setImmediate( () => {
    return typeof _error === `function` ? _error( e ) : void 0;
  });

  stream.plug = value$ => {
    let subject = Subject();
    value$.forEach( subject.push );
    subject.forEach( stream.push );
    return subject.end;
  };

  if ( initial !== null ) {
    stream.push( initial );
  }

  return stream;
}

export default Subject;
