import Subject from './subject'

function makeSinkProxies(drivers) {
  let requestProxies = {}
  for (let name in drivers) {
    if (drivers.hasOwnProperty(name)) {
      requestProxies[name] = Subject()
    }
  }
  return requestProxies
}

function callDrivers(drivers, requestProxies) {
  let responses = {}
  for (let name in drivers) {
    if (drivers.hasOwnProperty(name)) {
      responses[name] = drivers[name](requestProxies[name], name)
    }
  }
  return responses
}

function replicateMany(observables, subjects) {
  setTimeout(() => {
    for (let name in observables) {
      if (observables.hasOwnProperty(name) &&
        subjects.hasOwnProperty(name))
      {
        observables[name].forEach(subjects[name].push)
      }
    }
  }, 1)
}

function isObjectEmpty(obj) {
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      return false
    }
  }
  return true
}

function run(main, drivers) {
  if (typeof main !== `function`) {
    throw new Error(`First argument given to Cycle.run() must be the 'main' ` +
      `function.`)
  }
  if (typeof drivers !== `object` || drivers === null) {
    throw new Error(`Second argument given to Cycle.run() must be an object ` +
      `with driver functions as properties.`)
  }
  if (isObjectEmpty(drivers)) {
    throw new Error(`Second argument given to Cycle.run() must be an object ` +
      `with at least one driver function declared as a property.`)
  }

  let sinkProxies = makeSinkProxies(drivers)
  let sources = callDrivers(drivers, sinkProxies)
  let sinks = main(sources)
  replicateMany(sinks, sinkProxies)
  return [sinks, sources]
}

export {run}
