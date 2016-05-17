import {subject, holdSubject} from 'most-subject'

function makeSinkProxies(drivers) {
  const sinkProxies = {}
  const keys = Object.keys(drivers)
  for (let i = 0; i < keys.length; i++) {
    sinkProxies[keys[i]] = holdSubject(1)
  }
  return sinkProxies
}

function callDrivers(drivers, sinkProxies) {
  const sources = {}
  const keys = Object.keys(drivers)
  for (let i = 0; i < keys.length; i++) {
    let name = keys[i]
    sources[name] = drivers[name](sinkProxies[name], name)
  }
  return sources
}

function makeHandleError(stream, onError) {
  return function handleError(err) {
    stream.error(err)
    onError(err)
  }
}

function replicateMany({sinks, sinkProxies, disposableStream, onError}) {
  const sinkKeys = Object.keys(sinks)
  for (let i = 0; i < sinkKeys.length; i++) {
    let name = sinkKeys[i]
    if (sinkProxies.hasOwnProperty(name)) {
      const stream = sinkProxies[name]
      sinks[name]
        .until(disposableStream)
        .observe(x => stream.next(x))
        .then(x => stream.complete(x))
        .catch(makeHandleError(stream, onError))
    }
  }
}

function assertSinks(sinks) {
  const keys = Object.keys(sinks)
  for (let i = 0; i < keys.length; i++) {
    if (!sinks[keys[i]] || typeof sinks[keys[i]].observe !== `function`) {
      throw new Error(`Sink '${keys[i]}' must be a most.Stream`)
    }
  }
  return sinks
}

const logErrorToConsole = typeof console !== `undefined` && console.error ?
  error => { console.error(error.stack || error) } : Function.prototype

const defaults = {
  onError: logErrorToConsole,
}

function runInputGuard({main, drivers, onError}) {
  if (typeof main !== `function`) {
    throw new Error(`First argument given to run() must be the ` +
      `'main' function.`)
  }
  if (typeof drivers !== `object` || drivers === null) {
    throw new Error(`Second argument given to run() must be an ` +
      `object with driver functions as properties.`)
  }
  if (!Object.keys(drivers).length) {
    throw new Error(`Second argument given to run() must be an ` +
      `object with at least one driver function declared as a property.`)
  }

  if (typeof onError !== `function`) {
    throw new Error(`onError must be a function`)
  }
}

function run(main, drivers, {onError = logErrorToConsole} = defaults) {
  runInputGuard({main, drivers, onError})
  const disposableStream = subject()
  const sinkProxies = makeSinkProxies(drivers)
  const sources = callDrivers(drivers, sinkProxies)
  const sinks = assertSinks(main(sources))
  replicateMany({sinks, sinkProxies, disposableStream, onError})

  function dispose() {
    disposableStream.next(1)
    disposableStream.complete()
  }

  return {sinks, sources, dispose}
}

export default {run}
export {run}
