# Motorcycle.js

 An official subproject of [Cycle.js](http://cycle.js.org) built on top [most.js](https://github.com/cujojs/most) instead of RxJS for it's Observable/Stream implementation, and using [Snabbdom](https://github.com/paldepind/snabbdom) to interact with the DOM.

[![Join the chat at https://gitter.im/motorcyclejs/motorcycle-core](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/motorcyclejs/motorcycle-core?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

# Install
```
$ npm install @motorcycle/core
```

# Is it a fork?

This is **not** a fork of Cycle.js, but a sister project that will continue to evolve and grow alongside Cycle.js for the forseeable future. All of the core contributors of Motorcycle are, and continue to be, contributors to the Cycle.js project. Advancements in one will bring advancements in the other. Each have similar, yet different goals.

# Goals

The primary focus of this project is to build on the wonderful ideas brought to us by André Medeiros, better known by @staltz, brought to us via Cycle.js and tune it for performance as much a possible.

 Most.js plays an incredibly huge part in that, as benchmarks place *Most* about 500 times faster than RxJS 4. *Most* is built with a very small core API compared to RxJS and is entirely modular and extensible. For more information on *Most* please visit the github page [here](https://github.com/cujojs/most) and/or join us on gitter [here](https://gitter.im/cujojs/most).

Secondly, the standard DOM Driver, [motorcycle-dom](https://github.com/motorcyclejs/motorcycle-dom), is built using [Snabbdom](https://github.com/paldepind/snabbdom), a more performant virtual-dom implementation than that used by Cycle-DOM. IT continues to implement the same API's, with more performant alterntives to come. Snabbdom eases many issues of using virtual-dom via lifecycle hooks to continue to use existing libraries that work with the DOM directly. Snabbdom is also very modular and can be extended quite easily.

# API

## run(main, drivers)

###### Importing
```js
//ES6 - recommended =)
import {run} from '@motorcycle/core'
//ES5
var run = require('@motorcycle-core').run
```

Takes an main function and circularly connects it to the given collection of driver functions.

The main function expects a collection of "driver source" Observables/Streams as input, and should return a collection of "driver sink" Observables/Streams. A "collection of Observables/Streams" is a JavaScript object where keys match the driver names registered by the drivers object, and values are Observables/Streams or a collection of Observables/Streams.

###### Arguments:

**main** :: Function - a function that takes sources as input and outputs a collection of sinks Observables/Streams.

**drivers** :: Object - an object where keys are driver names and values are driver functions.

###### Return:

(Object) an object containing *sources* and *sinks* that can be used for debugging or testing.
