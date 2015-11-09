'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _most = require('most');

var _most2 = _interopRequireDefault(_most);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function setImmediate(fn) {
  return setTimeout(fn, 0);
}

function Subject() {
  var initial = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

  var _add = undefined;
  var _end = undefined;
  var _error = undefined;

  var stream = _most2.default.create(function (add, end, error) {
    _add = add;
    _end = end;
    _error = error;
    return _error;
  });

  stream.push = function (v) {
    return setImmediate(function () {
      return typeof _add === 'function' ? _add(v) : void 0;
    });
  };

  stream.end = function () {
    return setImmediate(function () {
      return typeof _end === 'function' ? _end() : void 0;
    });
  };

  stream.error = function (e) {
    return setImmediate(function () {
      return typeof _error === 'function' ? _error(e) : void 0;
    });
  };

  stream.plug = function (value$) {
    var subject = Subject();
    value$.forEach(subject.push);
    subject.forEach(stream.push);
    return subject.end;
  };

  if (initial !== null) {
    stream.push(initial);
  }

  return stream;
}

exports.default = Subject;