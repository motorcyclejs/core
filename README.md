# Motorcycle.js

 An official subproject of [Cycle.js](http://cycle.js.org) built
 on top [most.js](https://github.com/cujojs/most) instead of RxJS
 for its Observable/Stream implementation, and using
 [Snabbdom](https://github.com/paldepind/snabbdom) to interact
 with the DOM.

[![Join the chat at https://gitter.im/motorcyclejs/motorcycle-core](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/motorcyclejs/motorcycle-core?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge) [![Build Status](https://travis-ci.org/motorcyclejs/core.svg?branch=develop)](https://travis-ci.org/motorcyclejs/core)

## Install
```
$ npm install @motorcycle/core
```

## Is it a fork?

This is **not** a fork of Cycle.js but a sister project that will
continue to evolve and grow alongside Cycle.js for
the foreseeable future. All of the core contributors
of Motorcycle are, and continue to be, contributors
to the Cycle.js project. Advancements in one will bring
advancements in the other. Each have similar,
yet different, goals.

## Goals

The primary focus of this project is to build on the wonderful
ideas brought to us by André Medeiros, also known by @staltz,
through Cycle.js, and tune it for performance as much as possible.

 Most.js plays an incredibly huge part in that, as benchmarks
 place *Most* about 200-400x times faster than RxJS 4. *Most*
 is built with a very small core API, compared to RxJS,
 and is entirely modular and extensible. For more information
 on *Most*, please visit the [Github page](https://github.com/cujojs/most)
 or join us on the [Gitter chat room](https://gitter.im/cujojs/most).

[The standard DOM Driver][motorcycle-dom] is built using
[Snabbdom][snabbdom], a better performing virtual DOM
implementation than that used by Cycle-DOM. It continues
to implement the same APIs, with better performing alternatives
to come. Snabbdom eases many issues of using virtual DOM through
life cycle hooks to continue to use existing libraries that work
with the DOM directly. Snabbdom is also very modular
and can be extended quite easily.

## Want to Contribute?

If you found an issue or want to contribute code, please read
the [contributing guidelines][contributing]

## API

### run(main, drivers)

###### Importing
```js
//ES6 - recommended =)
import {run} from '@motorcycle/core'
//ES5
var run = require('@motorcycle-core').run
```

Takes a `main` function and circularly connects it to the given
collection of driver functions.

The `main` function takes an object of *sources* as input. Sources
are the outputs from the various drivers. To complete the cycle,
`main` should return a *sinks* object, which is a mapping
of return values from the program to the drivers, i.e., inputs
to the drivers, usually Observables/Streams.

###### Arguments:

**main** :: Function - a function that takes sources as input
and outputs a collection of sinks Observables/Streams.

**drivers** :: Object - an object where keys are driver names
and values are driver functions.

###### Return:

(Object) an object containing *sources*, *sinks*, and *dispose()* that
can be used for debugging or testing.

  *sources :: Object<most.Stream>* - The collection that is passed to your main function. The output of the drivers passed to run()

  *sinks :: Object<most.Stream>* - The collection that is returned from your main function. The input to the drivers.

  *dispose :: Function* - A function that will dispose of streams from sinks and sources.



[motorcycle-dom]: https://github.com/motorcyclejs/motorcycle-dom
[snabbdom]: https://github.com/paldepind/snabbdom
[contributing]: https://github.com/motorcyclejs/motorcycle/blob/master/CONTRIBUTING.md
