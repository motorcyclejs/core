import subject from 'most-subject'
import hold from '@most/hold'

const makeSinkProxies = drivers =>
  Object.keys(drivers)
    .reduce((sinkProxies, driverName) => {
      sinkProxies[driverName] = subject()
      return sinkProxies
    }, {})

const callDrivers = (drivers, sinkProxies) =>
  Object.keys(drivers)
    .reduce((sources, driverName) => {
      sources[driverName] =
        drivers[driverName](hold(sinkProxies[driverName].stream), driverName)
      return sources
    }, {})

const runMain = (main, sources, disposableStream) => {
  const sinks = main(sources)
  return Object.keys(sinks)
    .reduce((accumulator, driverName) => {
      accumulator[driverName] = sinks[driverName].until(disposableStream)
      return accumulator
    }, {})
}

const logErrorToConsole = err => {
  if (console && console.error) {
    console.error(err.message)
  }
}

const replicateMany = (sinks, sinkProxies) =>
  setTimeout(() => {
    Object.keys(sinks)
      .filter(driverName => sinkProxies[driverName])
      .forEach(driverName => {
        sinks[driverName]
          .forEach(sinkProxies[driverName].sink.add)
          .then(sinkProxies[driverName].sink.end)
          .catch(logErrorToConsole)
      })
  }, 1)

const isObjectEmpty = object => Object.keys(object).length <= 0

const run = (main, drivers) => {
  if (typeof main !== `function`) {
    throw new Error(`First argument given to run() must be the ` +
      `'main' function.`)
  }
  if (typeof drivers !== `object` || drivers === null) {
    throw new Error(`Second argument given to run() must be an ` +
      `object with driver functions as properties.`)
  }
  if (isObjectEmpty(drivers)) {
    throw new Error(`Second argument given to run() must be an ` +
      `object with at least one driver function declared as a property.`)
  }
  const {sink: disposableSink, stream: disposableStream} = subject()
  const sinkProxies = makeSinkProxies(drivers, disposableStream)
  const sources = callDrivers(drivers, sinkProxies)
  const sinks = runMain(main, sources, disposableStream)
  replicateMany(sinks, sinkProxies)

  const dispose = () => {
    disposableSink.add(1)
    Object.keys(sinkProxies).forEach(key => sinkProxies[key].sink.end())
    disposableSink.end()
  }

  return {sinks, sources, dispose}
}

export default {run}
export {run}
