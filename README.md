# Motorcycle.js

[![Join the chat at https://gitter.im/cyclejs/core](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/cyclejs/core?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge) [![Build Status](https://travis-ci.org/motorcyclejs/core.svg?branch=develop)](https://travis-ci.org/motorcyclejs/core)

This is the core of Motorcycle.js creating your applicaton loop tied together with `most.js`.
It separates your application logic into a pure (as much as JavaScript can be) function, and your
side-effectful code into drivers.

## Install
```
$ npm install @motorcycle/core
```

## Want to Contribute?

If you found an issue or want to contribute code, please read
the [contributing guidelines](CONTRIBUTING.md).

If would like to have a repository considered for inclusion in the
Motorcycle.js Github and NPM organizations, please open an issue first to avoid
duplication of effort and further the possibility of your work being accepted.
Afterwards, please refer to our [repository guidelines](REPOSITORIES.md).

## Useful Utilities
- [most-subject](https://github.com/mostjs-community/most-subject) - A subject
implementation for most.js
- [most-proxy](https://github.com/mostjs-community/most-proxy) - Declarative circular dependencies for most.js

## API

### run(main, drivers)

###### Importing
```js
import * as Motorcycle from '@motorcycle/core'

Motorcycle.run(main, drivers)

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
[contributing]: https://github.com/motorcyclejs/motorcycle/blob/master/CONTRIBUTING.md
