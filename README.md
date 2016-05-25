# Motorcycle.js

 An official subproject of [Cycle.js](http://cycle.js.org) built
 on top [most.js](https://github.com/cujojs/most) instead of RxJS
 for its Observable/Stream implementation, and using
 [Snabbdom](https://github.com/paldepind/snabbdom) to interact
 with the DOM.

[![Join the chat at https://gitter.im/cyclejs/core](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/cyclejs/core?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge) [![Build Status](https://travis-ci.org/motorcyclejs/core.svg?branch=develop)](https://travis-ci.org/motorcyclejs/core)

## Install
```
$ npm install @motorcycle/core
```

## Merging with Cycle.js
We are in the process of merging this project with [Cycle.js](https://github.com/cyclejs). But Why?


We get to merge two wonderful communities together and focus on solving problems rather than duplicating efforts. 
Stream conversions are also now done in a mostly automatic way! 
Want to use a driver written in xstream or Rx 5? No problem if the driver is written for Cycle.js Diversity. It will be entirely seamless for you :)

#### Libraries that will continue to be maintained for most.js *only*

##### **DOM Driver**
@motorcycle/dom will continue to be the speed king that it currently is. It is at 100% feature parity with the latest Cycle.js Diversity version of @cycle/dom as of v2.0.0. However, it will **not** do any stream conversion like @cycle/dom to maximize performance to its greatest potential. @motorcycle/html has be rolled into this library for ease of maintanence going forward as well. Now imported as 

```js
import {makeHTMLDriver} from '@motorcycle/dom'
```

##### **HTTP Driver**
@motorcycle/http will soon be at feature parity with the newest version of @cycle/http and will be maintained to avoid the need to import xstream as a dependency.

##### **What about everything else that used to be here?**
- @motorcycle/core - Please use [@cycle/most-run](https://github.com/cyclejs/most-run)
- @motorcycle/history - Please use [@cycle/history](https://github.com/cyclejs/history), it is 100% stream library agnostic and will not add any unneeded dependencies.
- @motorcycle/router - Please use [cyclic-router](https://github.com/cyclejs-community/cyclic-router), it is also 100% stream agnostic and will not andd any unneeded dependencies.
@motorcycle/local-storage - This was a poorly done library to begin with, and I don't wish for anyone to reach for it. There is the very great [@cycle/storage](https://github.com/cyclejs/storage) driver, which with v3 can do stream conversions when used with @cycle/most-run. However it is written in xstream, and will require the xstream library to also be imported. local-storage as driver is very easily implemented per individual needs, please stop by the [Cycle.js gitter](https://gitter.im/cyclejs/core) or open an issue to discuss [here](https://github.com/cyclejs-community/cyclejs-community/issues/new).


## Want to Contribute?

If you found an issue or want to contribute code, please read
the [contributing guidelines](CONTRIBUTING.md).

If would like to have a repository considered for inclusion in the
Motorcycle.js Github and NPM organizations, please open an issue first to avoid
duplication of effort and further the possibility of your work being accepted.
Afterwards, please refer to our [repository guidelines](REPOSITORIES.md).

## Useful Utilities
- [most-subject](https://github.com/TylorS/most-subject) - A subject
implementation for most.js
- [most-proxy](https://github.com/Tylors/most-proxy) - Declarative circular dependencies for most.js

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

**{onError}** :: Object - an object which currently only accepts an `onError()`
function. The optional `onError()` function allows for defining a custom Function
to be called when an error occurs in a stream from your application.

###### Return:

(Object) an object containing *sources*, *sinks*, and *dispose()* that
can be used for debugging or testing.

  *sources :: Object<most.Stream>* - The collection that is passed to your main function. The output of the drivers passed to run()

  *sinks :: Object<most.Stream>* - The collection that is returned from your main function. The input to the drivers.

  *dispose :: Function* - A function that will dispose of streams from sinks and sources.



[motorcycle-dom]: https://github.com/motorcyclejs/motorcycle-dom
[snabbdom]: https://github.com/paldepind/snabbdom
[contributing]: https://github.com/motorcyclejs/motorcycle/blob/master/CONTRIBUTING.md
