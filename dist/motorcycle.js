(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Motorcyle = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define('@most/multicast', ['exports', '@most/prelude'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require('@most/prelude'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.prelude);
    global.mostMulticast = mod.exports;
  }
})(this, function (exports, _prelude) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.MulticastSource = undefined;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var MulticastDisposable = function () {
    function MulticastDisposable(source, sink) {
      _classCallCheck(this, MulticastDisposable);

      this.source = source;
      this.sink = sink;
    }

    _createClass(MulticastDisposable, [{
      key: 'dispose',
      value: function dispose() {
        var s = this.source;
        var remaining = s.remove(this.sink);
        return remaining === 0 && s._dispose();
      }
    }]);

    return MulticastDisposable;
  }();

  function tryEvent(t, x, sink) {
    try {
      sink.event(t, x);
    } catch (e) {
      sink.error(t, e);
    }
  }

  function tryEnd(t, x, sink) {
    try {
      sink.end(t, x);
    } catch (e) {
      sink.error(t, e);
    }
  }

  var dispose = function dispose(disposable) {
    return disposable.dispose();
  };

  var emptyDisposable = {
    dispose: function dispose() {}
  };

  var MulticastSource = function () {
    function MulticastSource(source) {
      _classCallCheck(this, MulticastSource);

      this.source = source;
      this.sinks = [];
      this._disposable = emptyDisposable;
    }

    _createClass(MulticastSource, [{
      key: 'run',
      value: function run(sink, scheduler) {
        var n = this.add(sink);

        if (n === 1) {
          this._disposable = this.source.run(this, scheduler);
        }

        return new MulticastDisposable(this, sink);
      }
    }, {
      key: '_dispose',
      value: function _dispose() {
        var disposable = this._disposable;
        this._disposable = void 0;
        return Promise.resolve(disposable).then(dispose);
      }
    }, {
      key: 'add',
      value: function add(sink) {
        this.sinks = (0, _prelude.append)(sink, this.sinks);
        return this.sinks.length;
      }
    }, {
      key: 'remove',
      value: function remove(sink) {
        this.sinks = (0, _prelude.remove)((0, _prelude.findIndex)(sink, this.sinks), this.sinks);
        return this.sinks.length;
      }
    }, {
      key: 'event',
      value: function event(time, value) {
        var s = this.sinks;

        if (s.length === 1) {
          tryEvent(time, value, s[0]);
          return;
        }

        for (var i = 0; i < s.length; ++i) {
          tryEvent(time, value, s[i]);
        }
      }
    }, {
      key: 'end',
      value: function end(time, value) {
        var s = this.sinks;

        if (s.length === 1) {
          tryEnd(time, value, s[0]);
          return;
        }

        for (var i = 0; i < s.length; ++i) {
          tryEnd(time, value, s[i]);
        }
      }
    }, {
      key: 'error',
      value: function error(time, err) {
        var s = this.sinks;

        if (s.length === 1) {
          s[0].error(time, err);
          return;
        }

        for (var i = 0; i < s.length; ++i) {
          s[i].error(time, err);
        }
      }
    }]);

    return MulticastSource;
  }();

  function multicast(stream) {
    var source = stream.source;
    return source instanceof MulticastSource ? stream : new stream.constructor(new MulticastSource(source));
  }

  exports.MulticastSource = MulticastSource;
  exports.default = multicast;
});

},{"@most/prelude":2}],2:[function(require,module,exports){
(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define('@most/prelude', ['exports'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports);
    global.mostPrelude = mod.exports;
  }
})(this, function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  /** @license MIT License (c) copyright 2010-2016 original author or authors */

  // Non-mutating array operations

  // cons :: a -> [a] -> [a]
  // a with x prepended
  function cons(x, a) {
    var l = a.length;
    var b = new Array(l + 1);
    b[0] = x;
    for (var i = 0; i < l; ++i) {
      b[i + 1] = a[i];
    }
    return b;
  }

  // append :: a -> [a] -> [a]
  // a with x appended
  function append(x, a) {
    var l = a.length;
    var b = new Array(l + 1);
    for (var i = 0; i < l; ++i) {
      b[i] = a[i];
    }

    b[l] = x;
    return b;
  }

  // drop :: Int -> [a] -> [a]
  // drop first n elements
  function drop(n, a) {
    // eslint-disable-line complexity
    if (n < 0) {
      throw new TypeError('n must be >= 0');
    }

    var l = a.length;
    if (n === 0 || l === 0) {
      return a;
    }

    if (n >= l) {
      return [];
    }

    return unsafeDrop(n, a, l - n);
  }

  // unsafeDrop :: Int -> [a] -> Int -> [a]
  // Internal helper for drop
  function unsafeDrop(n, a, l) {
    var b = new Array(l);
    for (var i = 0; i < l; ++i) {
      b[i] = a[n + i];
    }
    return b;
  }

  // tail :: [a] -> [a]
  // drop head element
  function tail(a) {
    return drop(1, a);
  }

  // copy :: [a] -> [a]
  // duplicate a (shallow duplication)
  function copy(a) {
    var l = a.length;
    var b = new Array(l);
    for (var i = 0; i < l; ++i) {
      b[i] = a[i];
    }
    return b;
  }

  // map :: (a -> b) -> [a] -> [b]
  // transform each element with f
  function map(f, a) {
    var l = a.length;
    var b = new Array(l);
    for (var i = 0; i < l; ++i) {
      b[i] = f(a[i]);
    }
    return b;
  }

  // reduce :: (a -> b -> a) -> a -> [b] -> a
  // accumulate via left-fold
  function reduce(f, z, a) {
    var r = z;
    for (var i = 0, l = a.length; i < l; ++i) {
      r = f(r, a[i], i);
    }
    return r;
  }

  // replace :: a -> Int -> [a]
  // replace element at index
  function replace(x, i, a) {
    // eslint-disable-line complexity
    if (i < 0) {
      throw new TypeError('i must be >= 0');
    }

    var l = a.length;
    var b = new Array(l);
    for (var j = 0; j < l; ++j) {
      b[j] = i === j ? x : a[j];
    }
    return b;
  }

  // remove :: Int -> [a] -> [a]
  // remove element at index
  function remove(i, a) {
    // eslint-disable-line complexity
    if (i < 0) {
      throw new TypeError('i must be >= 0');
    }

    var l = a.length;
    if (l === 0 || i >= l) {
      // exit early if index beyond end of array
      return a;
    }

    if (l === 1) {
      // exit early if index in bounds and length === 1
      return [];
    }

    return unsafeRemove(i, a, l - 1);
  }

  // unsafeRemove :: Int -> [a] -> Int -> [a]
  // Internal helper to remove element at index
  function unsafeRemove(i, a, l) {
    var b = new Array(l);
    var j = undefined;
    for (j = 0; j < i; ++j) {
      b[j] = a[j];
    }
    for (j = i; j < l; ++j) {
      b[j] = a[j + 1];
    }

    return b;
  }

  // removeAll :: (a -> boolean) -> [a] -> [a]
  // remove all elements matching a predicate
  function removeAll(f, a) {
    var l = a.length;
    var b = new Array(l);
    var j = 0;
    for (var x, i = 0; i < l; ++i) {
      x = a[i];
      if (!f(x)) {
        b[j] = x;
        ++j;
      }
    }

    b.length = j;
    return b;
  }

  // findIndex :: a -> [a] -> Int
  // find index of x in a, from the left
  function findIndex(x, a) {
    for (var i = 0, l = a.length; i < l; ++i) {
      if (x === a[i]) {
        return i;
      }
    }
    return -1;
  }

  // isArrayLike :: * -> boolean
  // Return true iff x is array-like
  function isArrayLike(x) {
    return x != null && typeof x.length === 'number' && typeof x !== 'function';
  }

  /** @license MIT License (c) copyright 2010-2016 original author or authors */

  // id :: a -> a
  var id = function id(x) {
    return x;
  };

  // compose :: (b -> c) -> (a -> b) -> (a -> c)
  var compose = function compose(f, g) {
    return function (x) {
      return f(g(x));
    };
  };

  // apply :: (a -> b) -> a -> b
  var apply = function apply(f, x) {
    return f(x);
  };

  // curry2 :: ((a, b) -> c) -> (a -> b -> c)
  function curry2(f) {
    function curried(a, b) {
      switch (arguments.length) {
        case 0:
          return curried;
        case 1:
          return function (b) {
            return f(a, b);
          };
        default:
          return f(a, b);
      }
    }
    return curried;
  }

  // curry3 :: ((a, b, c) -> d) -> (a -> b -> c -> d)
  function curry3(f) {
    function curried(a, b, c) {
      // eslint-disable-line complexity
      switch (arguments.length) {
        case 0:
          return curried;
        case 1:
          return curry2(function (b, c) {
            return f(a, b, c);
          });
        case 2:
          return function (c) {
            return f(a, b, c);
          };
        default:
          return f(a, b, c);
      }
    }
    return curried;
  }

  exports.cons = cons;
  exports.append = append;
  exports.drop = drop;
  exports.tail = tail;
  exports.copy = copy;
  exports.map = map;
  exports.reduce = reduce;
  exports.replace = replace;
  exports.remove = remove;
  exports.removeAll = removeAll;
  exports.findIndex = findIndex;
  exports.isArrayLike = isArrayLike;
  exports.id = id;
  exports.compose = compose;
  exports.apply = apply;
  exports.curry2 = curry2;
  exports.curry3 = curry3;
});

},{}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function tryEvent(sink, scheduler, event) {
  try {
    sink.event(scheduler.now(), event);
  } catch (err) {
    sink.error(scheduler.now(), err);
  }
}

function tryEnd(sink, scheduler, event) {
  try {
    sink.end(scheduler.now(), event);
  } catch (err) {
    sink.error(scheduler.now(), err);
  }
}

var Observer = function () {
  function Observer() {
    var _this = this;

    _classCallCheck(this, Observer);

    this.run = function (sink, scheduler) {
      return _this._run(sink, scheduler);
    };
    this.next = function (x) {
      return _this._next(x);
    };
    this.error = function (err) {
      return _this._error(err);
    };
    this.complete = function (x) {
      return _this._complete(x);
    };
  }

  _createClass(Observer, [{
    key: "_run",
    value: function _run(sink, scheduler) {
      this.sink = sink;
      this.scheduler = scheduler;
      this.active = true;
      return this;
    }
  }, {
    key: "dispose",
    value: function dispose() {
      this.active = false;
    }
  }, {
    key: "_next",
    value: function _next(value) {
      if (!this.active) {
        return;
      }
      tryEvent(this.sink, this.scheduler, value);
    }
  }, {
    key: "_error",
    value: function _error(err) {
      this.active = false;
      this.sink.error(this.scheduler.now(), err);
    }
  }, {
    key: "_complete",
    value: function _complete(value) {
      if (!this.active) {
        return;
      }
      this.active = false;
      tryEnd(this.sink, this.scheduler, value);
    }
  }]);

  return Observer;
}();

exports.Observer = Observer;
},{}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.replay = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _most = require('most');

var _multicast = require('@most/multicast');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function pushEvents(sink, buffer) {
  var i = 0;
  for (; i < buffer.length; ++i) {
    var item = buffer[i];
    sink.event(item.time, item.value);
  }
}

function replayAdd(sink) {
  var length = this._replayAdd(sink);
  if (this._replay.buffer.length > 0) {
    pushEvents(sink, this._replay.buffer);
  }
  return length;
}

function addToBuffer(event, replay) {
  if (replay.buffer.length >= replay.bufferSize) {
    replay.buffer.shift();
  }
  replay.buffer.push(event);
}

function replayEvent(time, value) {
  if (this._replay.bufferSize > 0) {
    addToBuffer({ time: time, value: value }, this._replay);
  }
  this._replayEvent(time, value);
}

var Replay = function () {
  function Replay(bufferSize, source) {
    _classCallCheck(this, Replay);

    this.source = source;
    this.bufferSize = bufferSize;
    this.buffer = [];
  }

  _createClass(Replay, [{
    key: 'run',
    value: function run(sink, scheduler) {
      if (sink._replay !== this) {
        sink._replay = this;
        sink._replayAdd = sink.add;
        sink.add = replayAdd;

        sink._replayEvent = sink.event;
        sink.event = replayEvent;
      }

      return this.source.run(sink, scheduler);
    }
  }]);

  return Replay;
}();

var replay = function replay(bufferSize, stream) {
  return new _most.Stream(new _multicast.MulticastSource(new Replay(bufferSize, stream.source)));
};

exports.replay = replay;
},{"@most/multicast":1,"most":undefined}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.holdSubject = exports.subject = undefined;

var _most = require('most');

var _multicast = require('@most/multicast');

var _Observer = require('./Observer');

var _Replay = require('./Replay');

function create(hold, bufferSize, initialValue) {
  var observer = new _Observer.Observer();
  var stream = hold ? (0, _Replay.replay)(bufferSize, new _most.Stream(observer)) : new _most.Stream(new _multicast.MulticastSource(observer));

  stream.drain();

  if (typeof initialValue !== 'undefined') {
    observer.next(initialValue);
  }

  return { stream: stream, observer: observer };
}

function subject() {
  return create(false, 0);
}

function holdSubject() {
  var bufferSize = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];
  var initialValue = arguments[1];

  if (bufferSize < 1) {
    throw new Error('First argument to holdSubject is expected to be an ' + 'integer greater than or equal to 1');
  }
  return create(true, bufferSize, initialValue);
}

exports.subject = subject;
exports.holdSubject = holdSubject;
},{"./Observer":3,"./Replay":4,"@most/multicast":1,"most":undefined}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.run = undefined;

var _mostSubject = require('most-subject');

function makeSinkProxies(drivers) {
  var sinkProxies = {};
  var keys = Object.keys(drivers);
  for (var i = 0; i < keys.length; i++) {
    sinkProxies[keys[i]] = (0, _mostSubject.holdSubject)(1);
  }
  return sinkProxies;
}

function callDrivers(drivers, sinkProxies) {
  var sources = {};
  var keys = Object.keys(drivers);
  for (var i = 0; i < keys.length; i++) {
    var name = keys[i];
    sources[name] = drivers[name](sinkProxies[name].stream, name);
  }
  return sources;
}

function makeHandleError(observer, onError) {
  return function handleError(err) {
    observer.error(err);
    onError(err);
  };
}

function replicateMany(_ref) {
  var sinks = _ref.sinks;
  var sinkProxies = _ref.sinkProxies;
  var disposableStream = _ref.disposableStream;
  var onError = _ref.onError;

  var sinkKeys = Object.keys(sinks);
  for (var i = 0; i < sinkKeys.length; i++) {
    var name = sinkKeys[i];
    if (sinkProxies.hasOwnProperty(name)) {
      var observer = sinkProxies[name].observer;

      sinks[name].until(disposableStream).observe(observer.next).then(observer.complete).catch(makeHandleError(observer, onError));
    }
  }
}

function assertSinks(sinks) {
  var keys = Object.keys(sinks);
  for (var i = 0; i < keys.length; i++) {
    if (!sinks[keys[i]] || typeof sinks[keys[i]].observe !== 'function') {
      throw new Error('Sink \'' + keys[i] + '\' must be a most.Stream');
    }
  }
  return sinks;
}

var logErrorToConsole = typeof console !== 'undefined' && console.error ? function (error) {
  console.error(error.stack || error);
} : Function.prototype;

var defaults = {
  onError: logErrorToConsole
};

function runInputGuard(_ref2) {
  var main = _ref2.main;
  var drivers = _ref2.drivers;
  var onError = _ref2.onError;

  if (typeof main !== 'function') {
    throw new Error('First argument given to run() must be the ' + '\'main\' function.');
  }
  if (typeof drivers !== 'object' || drivers === null) {
    throw new Error('Second argument given to run() must be an ' + 'object with driver functions as properties.');
  }
  if (!Object.keys(drivers).length) {
    throw new Error('Second argument given to run() must be an ' + 'object with at least one driver function declared as a property.');
  }

  if (typeof onError !== 'function') {
    throw new Error('onError must be a function');
  }
}

function run(main, drivers) {
  var _ref3 = arguments.length <= 2 || arguments[2] === undefined ? defaults : arguments[2];

  var _ref3$onError = _ref3.onError;
  var onError = _ref3$onError === undefined ? logErrorToConsole : _ref3$onError;

  runInputGuard({ main: main, drivers: drivers, onError: onError });

  var _subject = (0, _mostSubject.subject)();

  var disposableObserver = _subject.observer;
  var disposableStream = _subject.stream;

  var sinkProxies = makeSinkProxies(drivers);
  var sources = callDrivers(drivers, sinkProxies);
  var sinks = assertSinks(main(sources));
  replicateMany({ sinks: sinks, sinkProxies: sinkProxies, disposableStream: disposableStream, onError: onError });

  function dispose() {
    disposableObserver.next(1);
    disposableObserver.complete();
  }

  return { sinks: sinks, sources: sources, dispose: dispose };
}

exports.default = { run: run };
exports.run = run;

},{"most-subject":5}]},{},[6])(6)
});