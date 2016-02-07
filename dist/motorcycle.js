(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Motorcyle = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define('@most/hold', ['exports', 'most/lib/source/MulticastSource'], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require('most/lib/source/MulticastSource'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.MulticastSource);
        global.mostHold = mod.exports;
    }
})(this, function (exports, _MulticastSource) {
    'use strict';

    Object.defineProperty(exports, "__esModule", {
        value: true
    });

    var _MulticastSource2 = _interopRequireDefault(_MulticastSource);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var _createClass = (function () {
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
    })();

    var hold = function hold(stream) {
        return new stream.constructor(new _MulticastSource2.default(new Hold(stream.source)));
    };

    var Hold = (function () {
        function Hold(source) {
            _classCallCheck(this, Hold);

            this.source = source;
            this.time = -Infinity;
            this.value = void 0;
        }

        _createClass(Hold, [{
            key: 'run',
            value: function run(sink, scheduler) {
                if (sink._hold !== this) {
                    sink._hold = this;
                    sink._holdAdd = sink.add;
                    sink.add = holdAdd;
                    sink._holdEvent = sink.event;
                    sink.event = holdEvent;
                }

                return this.source.run(sink, scheduler);
            }
        }]);

        return Hold;
    })();

    function holdAdd(sink) {
        var len = this._holdAdd(sink);

        if (this._hold.time >= 0) {
            sink.event(this._hold.time, this._hold.value);
        }

        return len;
    }

    function holdEvent(t, x) {
        if (t >= this._hold.time) {
            this._hold.time = t;
            this._hold.value = x;
        }

        return this._holdEvent(t, x);
    }

    exports.default = hold;
});

},{"most/lib/source/MulticastSource":12}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.replay = replay;
exports.ReplaySource = ReplaySource;
var most = require('most');
var MulticastSource = require('most/lib/source/MulticastSource');
var PropagateTask = require('most/lib/scheduler/PropagateTask');
var CompoundDisposable = require('most/lib/disposable/dispose').all;
var Stream = most.Stream;

function replay(stream, maxBufferSize) {
  if (stream.source instanceof ReplaySource && source.maxBufferSize !== maxBufferSize) {
    return stream;
  }
  return new Stream(new ReplaySource(stream.source, maxBufferSize));
}

function ReplaySource(source, maxBufferSize) {
  this._buffer = [];
  this._ended = false;
  this.maxBufferSize = maxBufferSize || Infinity;
  MulticastSource.call(this, source);
}
ReplaySource.prototype = Object.create(MulticastSource.prototype);

ReplaySource.prototype._run = MulticastSource.prototype.run;
ReplaySource.prototype.run = function (sink, scheduler) {
  var buffer = this._buffer;
  var self = this;
  this.sink = sink;

  if (this._ended) {
    return replay();
  }
  if (buffer.length === 0) {
    return run();
  }
  return new CompoundDisposable([replay(), run()]);

  function replay() {
    return new BufferProducer(buffer.slice(0), sink, scheduler);
  }

  function run() {
    return self._run(sink, scheduler);
  }
};

ReplaySource.prototype._event = MulticastSource.prototype.event;
ReplaySource.prototype.event = function ReplaySource_event(t, x) {
  this._addToBuffer({ type: 0, t: t, x: x });
  this._event(t, x);
};

MulticastSource.prototype._addToBuffer = function ReplaySource_addToBuffer(event) {
  if (this._buffer.length >= this.maxBufferSize) {
    this._buffer.shift();
  }
  this._buffer.push(event);
};

MulticastSource.prototype.end = function (t, x, r) {
  MulticastSource;
  var s = this.sinks;
  if (s.length === 1) {
    s[0].end(t, x);
    return;
  }
  for (var i = 0; i < s.length; ++i) {
    if (i === s.length - 1) {
      if (r) {
        break; // don't end underlying stream
      }
    }
    s[i].end(t, x);
  };
};

ReplaySource.prototype._end = MulticastSource.prototype.end;
ReplaySource.prototype.end = function ReplaySource_end(t, x) {
  var self = this;
  this._ended = true;
  this._addToBuffer({ type: 1, t: t, x: x });
  this._end(t, x, this);
  this.add(this.sink); // add an extra sink so the last values can go through
  setTimeout(function () {
    self._end(t, x);
  }, 0); // dispose after values are propagated
};

MulticastSource.prototype.error = function (t, e, r) {
  var s = this.sinks;
  if (s.length === 1) {
    s[0].error(t, e);
    return;
  }
  for (var i = 0; i < s.length; ++i) {
    if (i === s.length - 1) {
      if (r) {
        break; // don't end underlying stream
      }
    }
    s[i].error(t, e);
  };
};

ReplaySource.prototype._error = MulticastSource.prototype.error;
ReplaySource.prototype.error = function ReplaySink_error(t, e) {
  var self = this;
  this._ended = true;
  this._buffer.push({ type: 2, t: t, x: e });
  this._error(t, e, this);
  this.add(this.sink);
  setTimeout(function () {
    self._error(t, e);
  }, 0);
};

function BufferProducer(buffer, sink, scheduler) {
  this.task = new PropagateTask(runProducer, buffer, sink);
  scheduler.asap(this.task);
}

BufferProducer.prototype.dispose = function () {
  return this.task.dispose();
};

function runProducer(t, buffer, sink) {
  var emit = function emit(item) {
    sink.event(item.t, item.x);
  };
  for (var i = 0, j = buffer.length; i < j && this.active; i++) {
    var item = buffer[i];
    switch (item.type) {
      case 0:
        emit(item);break;
      case 1:
        return this.active && sink.end(item.t, item.x);
      case 2:
        return this.active && sink.error(item.t, item.x);
    }
  }
}
},{"most":undefined,"most/lib/disposable/dispose":9,"most/lib/scheduler/PropagateTask":11,"most/lib/source/MulticastSource":12}],3:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Subscription = function () {
  function Subscription() {
    var _this = this;

    _classCallCheck(this, Subscription);

    this.run = function (sink, scheduler) {
      return _this._run(sink, scheduler);
    };
    this.add = this.next = function (x) {
      return _this._add(x);
    };
    this.error = function (err) {
      return _this._error(err);
    };
    this.end = this.complete = function (x) {
      return _this._end(x);
    };
  }

  _createClass(Subscription, [{
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
    key: "_add",
    value: function _add(x) {
      if (!this.active) {
        return;
      }
      tryEvent(this.sink, this.scheduler, x);
    }
  }, {
    key: "_error",
    value: function _error(e) {
      this.active = false;
      this.sink.error(this.scheduler.now(), e);
    }
  }, {
    key: "_end",
    value: function _end(x) {
      if (!this.active) {
        return;
      }
      this.active = false;
      tryEnd(this.sink, this.scheduler, x);
    }
  }]);

  return Subscription;
}();

function tryEvent(sink, scheduler, event) {
  try {
    sink.event(scheduler.now(), event);
  } catch (e) {
    sink.error(scheduler.now(), e);
  }
}

function tryEnd(sink, scheduler, event) {
  try {
    sink.end(scheduler.now(), event);
  } catch (e) {
    sink.error(scheduler.now(), e);
  }
}

exports.Subscription = Subscription;
},{}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.holdSubject = exports.subject = undefined;

var _most = require('most');

var _MulticastSource = require('most/lib/source/MulticastSource');

var _MulticastSource2 = _interopRequireDefault(_MulticastSource);

var _Subscription = require('./Subscription');

var _ReplaySource = require('./ReplaySource');

var _hold = require('@most/hold');

var _hold2 = _interopRequireDefault(_hold);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaults = {
  replay: false,
  bufferSize: 1
};

function create(replay, bufferSize, initialValue) {
  var sink = new _Subscription.Subscription();
  var stream = undefined;

  if (!replay) {
    stream = new _most.Stream(new _MulticastSource2.default(sink));
  } else {
    stream = bufferSize === 1 ? (0, _hold2.default)(new _most.Stream(sink)) : (0, _ReplaySource.replay)(new _most.Stream(sink), bufferSize);
  }

  stream.drain();

  if (typeof initialValue !== 'undefined') {
    sink.next(initialValue);
  }

  return { sink: sink, stream: stream, observer: sink };
}

function subject(initialValue) {
  return create(false, 1, initialValue);
}

function holdSubject() {
  var bufferSize = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];
  var initialValue = arguments[1];

  return create(true, bufferSize, initialValue);
}

exports.subject = subject;
exports.holdSubject = holdSubject;
},{"./ReplaySource":2,"./Subscription":3,"@most/hold":1,"most":undefined,"most/lib/source/MulticastSource":12}],5:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

exports.isPromise = isPromise;

function isPromise(p) {
	return p !== null && typeof p === 'object' && typeof p.then === 'function';
}

},{}],6:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

exports.noop = noop;
exports.identity = identity;
exports.compose = compose;
exports.apply = apply;

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

function noop() {}

function identity(x) {
	return x;
}

function compose(f, g) {
	return function(x) {
		return f(g(x));
	};
}

function apply(f, x) {
	return f(x);
}

function cons(x, array) {
	var l = array.length;
	var a = new Array(l + 1);
	a[0] = x;
	for(var i=0; i<l; ++i) {
		a[i + 1] = array[i];
	}
	return a;
}

function append(x, a) {
	var l = a.length;
	var b = new Array(l+1);
	for(var i=0; i<l; ++i) {
		b[i] = a[i];
	}

	b[l] = x;
	return b;
}

function drop(n, array) {
	var l = array.length;
	if(n >= l) {
		return [];
	}

	l -= n;
	var a = new Array(l);
	for(var i=0; i<l; ++i) {
		a[i] = array[n+i];
	}
	return a;
}

function tail(array) {
	return drop(1, array);
}

function copy(array) {
	var l = array.length;
	var a = new Array(l);
	for(var i=0; i<l; ++i) {
		a[i] = array[i];
	}
	return a;
}

function map(f, array) {
	var l = array.length;
	var a = new Array(l);
	for(var i=0; i<l; ++i) {
		a[i] = f(array[i]);
	}
	return a;
}

function reduce(f, z, array) {
	var r = z;
	for(var i=0, l=array.length; i<l; ++i) {
		r = f(r, array[i], i);
	}
	return r;
}

function replace(x, i, array) {
	var l = array.length;
	var a = new Array(l);
	for(var j=0; j<l; ++j) {
		a[j] = i === j ? x : array[j];
	}
	return a;
}

function remove(index, array) {
	var l = array.length;
	if(l === 0 || index >= array) { // exit early if index beyond end of array
		return array;
	}

	if(l === 1) { // exit early if index in bounds and length === 1
		return [];
	}

	return unsafeRemove(index, array, l-1);
}

function unsafeRemove(index, a, l) {
	var b = new Array(l);
	var i;
	for(i=0; i<index; ++i) {
		b[i] = a[i];
	}
	for(i=index; i<l; ++i) {
		b[i] = a[i+1];
	}

	return b;
}

function removeAll(f, a) {
	var l = a.length;
	var b = new Array(l);
	for(var x, i=0, j=0; i<l; ++i) {
		x = a[i];
		if(!f(x)) {
			b[j] = x;
			++j;
		}
	}

	b.length = j;
	return b;
}

function findIndex(x, a) {
	for (var i = 0, l = a.length; i < l; ++i) {
		if (x === a[i]) {
			return i;
		}
	}
	return -1;
}

function isArrayLike(x){
   return x != null && typeof x.length === 'number' && typeof x !== 'function';
}

},{}],7:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

module.exports = Disposable;

/**
 * Create a new Disposable which will dispose its underlying resource.
 * @param {function} dispose function
 * @param {*?} data any data to be passed to disposer function
 * @constructor
 */
function Disposable(dispose, data) {
	this._dispose = dispose;
	this._data = data;
}

Disposable.prototype.dispose = function() {
	return this._dispose(this._data);
};

},{}],8:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

module.exports = SettableDisposable;

function SettableDisposable() {
	this.disposable = void 0;
	this.disposed = false;
	this._resolve = void 0;

	var self = this;
	this.result = new Promise(function(resolve) {
		self._resolve = resolve;
	});
}

SettableDisposable.prototype.setDisposable = function(disposable) {
	if(this.disposable !== void 0) {
		throw new Error('setDisposable called more than once');
	}

	this.disposable = disposable;

	if(this.disposed) {
		this._resolve(disposable.dispose());
	}
};

SettableDisposable.prototype.dispose = function() {
	if(this.disposed) {
		return this.result;
	}

	this.disposed = true;

	if(this.disposable !== void 0) {
		this.result = this.disposable.dispose();
	}

	return this.result;
};

},{}],9:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var Disposable = require('./Disposable');
var SettableDisposable = require('./SettableDisposable');
var isPromise = require('../Promise').isPromise;
var base = require('../base');

var map = base.map;
var identity = base.identity;

exports.tryDispose = tryDispose;
exports.create = create;
exports.once = once;
exports.empty = empty;
exports.all = all;
exports.settable = settable;
exports.promised = promised;

/**
 * Call disposable.dispose.  If it returns a promise, catch promise
 * error and forward it through the provided sink.
 * @param {number} t time
 * @param {{dispose: function}} disposable
 * @param {{error: function}} sink
 * @return {*} result of disposable.dispose
 */
function tryDispose(t, disposable, sink) {
	var result = disposeSafely(disposable);
	return isPromise(result)
		? result.catch(function (e) {
			sink.error(t, e);
		})
		: result;
}

/**
 * Create a new Disposable which will dispose its underlying resource
 * at most once.
 * @param {function} dispose function
 * @param {*?} data any data to be passed to disposer function
 * @return {Disposable}
 */
function create(dispose, data) {
	return once(new Disposable(dispose, data));
}

/**
 * Create a noop disposable. Can be used to satisfy a Disposable
 * requirement when no actual resource needs to be disposed.
 * @return {Disposable|exports|module.exports}
 */
function empty() {
	return new Disposable(identity, void 0);
}

/**
 * Create a disposable that will dispose all input disposables in parallel.
 * @param {Array<Disposable>} disposables
 * @return {Disposable}
 */
function all(disposables) {
	return create(disposeAll, disposables);
}

function disposeAll(disposables) {
	return Promise.all(map(disposeSafely, disposables));
}

function disposeSafely(disposable) {
	try {
		return disposable.dispose();
	} catch(e) {
		return Promise.reject(e);
	}
}

/**
 * Create a disposable from a promise for another disposable
 * @param {Promise<Disposable>} disposablePromise
 * @return {Disposable}
 */
function promised(disposablePromise) {
	return create(disposePromise, disposablePromise);
}

function disposePromise(disposablePromise) {
	return disposablePromise.then(disposeOne);
}

function disposeOne(disposable) {
	return disposable.dispose();
}

/**
 * Create a disposable proxy that allows its underlying disposable to
 * be set later.
 * @return {SettableDisposable}
 */
function settable() {
	return new SettableDisposable();
}

/**
 * Wrap an existing disposable (which may not already have been once()d)
 * so that it will only dispose its underlying resource at most once.
 * @param {{ dispose: function() }} disposable
 * @return {Disposable} wrapped disposable
 */
function once(disposable) {
	return new Disposable(disposeMemoized, memoized(disposable));
}

function disposeMemoized(memoized) {
	if(!memoized.disposed) {
		memoized.disposed = true;
		memoized.value = disposeSafely(memoized.disposable);
		memoized.disposable = void 0;
	}

	return memoized.value;
}

function memoized(disposable) {
	return { disposed: false, disposable: disposable, value: void 0 };
}

},{"../Promise":5,"../base":6,"./Disposable":7,"./SettableDisposable":8}],10:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

module.exports = fatalError;

function fatalError (e) {
	setTimeout(function() {
		throw e;
	}, 0);
}

},{}],11:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var fatal = require('../fatalError');

module.exports = PropagateTask;

function PropagateTask(run, value, sink) {
	this._run = run;
	this.value = value;
	this.sink = sink;
	this.active = true;
}

PropagateTask.event = function(value, sink) {
	return new PropagateTask(emit, value, sink);
};

PropagateTask.end = function(value, sink) {
	return new PropagateTask(end, value, sink);
};

PropagateTask.error = function(value, sink) {
	return new PropagateTask(error, value, sink);
};

PropagateTask.prototype.dispose = function() {
	this.active = false;
};

PropagateTask.prototype.run = function(t) {
	if(!this.active) {
		return;
	}
	this._run(t, this.value, this.sink);
};

PropagateTask.prototype.error = function(t, e) {
	if(!this.active) {
		return fatal(e);
	}
	this.sink.error(t, e);
};

function error(t, e, sink) {
	sink.error(t, e);
}

function emit(t, x, sink) {
	sink.event(t, x);
}

function end(t, x, sink) {
	sink.end(t, x);
}

},{"../fatalError":10}],12:[function(require,module,exports){
/** @license MIT License (c) copyright 2010-2016 original author or authors */
/** @author Brian Cavalier */
/** @author John Hann */

var base = require('../base');

module.exports = MulticastSource;

function MulticastSource(source) {
	this.source = source;
	this.sinks = [];
	this._disposable = void 0;
}

MulticastSource.prototype.run = function(sink, scheduler) {
	var n = this.add(sink);
	if(n === 1) {
		this._disposable = this.source.run(this, scheduler);
	}

	return new MulticastDisposable(this, sink);
};

MulticastSource.prototype._dispose = function() {
	var disposable = this._disposable;
	this._disposable = void 0;
	return Promise.resolve(disposable).then(dispose);
};

function dispose(disposable) {
	if(disposable === void 0) {
		return;
	}
	return disposable.dispose();
}

function MulticastDisposable(source, sink) {
	this.source = source;
	this.sink = sink;
}

MulticastDisposable.prototype.dispose = function() {
	var s = this.source;
	var remaining = s.remove(this.sink);
	return remaining === 0 && s._dispose();
};

MulticastSource.prototype.add = function(sink) {
	this.sinks = base.append(sink, this.sinks);
	return this.sinks.length;
};

MulticastSource.prototype.remove = function(sink) {
	this.sinks = base.remove(base.findIndex(sink, this.sinks), this.sinks);
	return this.sinks.length;
};

MulticastSource.prototype.event = function(t, x) {
	var s = this.sinks;
	if(s.length === 1) {
		s[0].event(t, x);
		return;
	}
	for(var i=0; i<s.length; ++i) {
		s[i].event(t, x);
	}
};

MulticastSource.prototype.end = function(t, x) {
	var s = this.sinks;
	if(s.length === 1) {
		s[0].end(t, x);
		return;
	}
	for(var i=0; i<s.length; ++i) {
		s[i].end(t, x);
	}
};

MulticastSource.prototype.error = function(t, e) {
	var s = this.sinks;
	if(s.length === 1) {
		s[0].error(t, e);
		return;
	}
	for (var i=0; i<s.length; ++i) {
		s[i].error(t, e);
	}
};

},{"../base":6}],13:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.run = undefined;

var _mostSubject = require('most-subject');

var makeSinkProxies = function makeSinkProxies(drivers) {
  return Object.keys(drivers).reduce(function (sinkProxies, driverName) {
    sinkProxies[driverName] = (0, _mostSubject.holdSubject)();
    return sinkProxies;
  }, {});
};

var callDrivers = function callDrivers(drivers, sinkProxies) {
  return Object.keys(drivers).reduce(function (sources, driverName) {
    sources[driverName] = drivers[driverName](sinkProxies[driverName].stream, driverName);
    return sources;
  }, {});
};

var runMain = function runMain(main, sources, disposableStream) {
  var sinks = main(sources);
  return Object.keys(sinks).reduce(function (accumulator, driverName) {
    accumulator[driverName] = sinks[driverName].until(disposableStream);
    return accumulator;
  }, {});
};

var logErrorToConsole = function logErrorToConsole(err) {
  if (console && console.error) {
    console.error(err.message);
  }
};

var replicateMany = function replicateMany(sinks, sinkProxies) {
  return setTimeout(function () {
    Object.keys(sinks).filter(function (driverName) {
      return sinkProxies[driverName];
    }).forEach(function (driverName) {
      sinks[driverName].forEach(sinkProxies[driverName].sink.add).then(sinkProxies[driverName].sink.end).catch(logErrorToConsole);
    });
  }, 1);
};

var isObjectEmpty = function isObjectEmpty(object) {
  return Object.keys(object).length <= 0;
};

var run = function run(main, drivers) {
  if (typeof main !== 'function') {
    throw new Error('First argument given to run() must be the ' + '\'main\' function.');
  }
  if (typeof drivers !== 'object' || drivers === null) {
    throw new Error('Second argument given to run() must be an ' + 'object with driver functions as properties.');
  }
  if (isObjectEmpty(drivers)) {
    throw new Error('Second argument given to run() must be an ' + 'object with at least one driver function declared as a property.');
  }

  var _subject = (0, _mostSubject.subject)();

  var disposableSink = _subject.sink;
  var disposableStream = _subject.stream;

  var sinkProxies = makeSinkProxies(drivers, disposableStream);
  var sources = callDrivers(drivers, sinkProxies);
  var sinks = runMain(main, sources, disposableStream);
  replicateMany(sinks, sinkProxies);

  var dispose = function dispose() {
    disposableSink.add(1);
    Object.keys(sinkProxies).forEach(function (key) {
      return sinkProxies[key].sink.end();
    });
    disposableSink.end();
  };

  return { sinks: sinks, sources: sources, dispose: dispose };
};

exports.default = { run: run };
exports.run = run;

},{"most-subject":4}]},{},[13])(13)
});