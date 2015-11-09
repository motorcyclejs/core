'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.run = undefined;

var _subject = require('./subject');

var _subject2 = _interopRequireDefault(_subject);

var _most = require('most');

var _most2 = _interopRequireDefault(_most);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function makeSinkProxies(drivers) {
  var requestProxies = {};
  for (var name in drivers) {
    if (drivers.hasOwnProperty(name)) {
      requestProxies[name] = (0, _subject2.default)();
    }
  }
  return requestProxies;
}

function callDrivers(drivers, requestProxies) {
  var responses = {};
  for (var name in drivers) {
    if (drivers.hasOwnProperty(name)) {
      responses[name] = drivers[name](requestProxies[name], name);
    }
  }
  return responses;
}

function replicateMany(observables, subjects) {
  setTimeout(function () {
    for (var name in observables) {
      if (observables.hasOwnProperty(name) && subjects.hasOwnProperty(name)) {
        observables[name].forEach(subjects[name].push);
      }
    }
  }, 1);
}

function isObjectEmpty(obj) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      return false;
    }
  }
  return true;
}

function run(main, drivers) {
  if (typeof main !== 'function') {
    throw new Error('First argument given to Cycle.run() must be the \'main\' ' + 'function.');
  }
  if (typeof drivers !== 'object' || drivers === null) {
    throw new Error('Second argument given to Cycle.run() must be an object ' + 'with driver functions as properties.');
  }
  if (isObjectEmpty(drivers)) {
    throw new Error('Second argument given to Cycle.run() must be an object ' + 'with at least one driver function declared as a property.');
  }

  var sinkProxies = makeSinkProxies(drivers);
  var sources = callDrivers(drivers, sinkProxies);
  var sinks = main(sources);
  replicateMany(sinks, sinkProxies);
  return [sinks, sources];
}

exports.run = run;