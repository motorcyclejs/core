/* global describe, it */
import assert from 'assert';
import sinon from 'sinon';
import { run } from '../src';
import Most from 'most';

const override =
  (object, methodName, callback) => {
    object[methodName] = callback(object[methodName])
  }

describe(`Motorcycle`, () => {
  describe("API", () => {
    it(`should have 'run'`, done => {
      assert.strictEqual(typeof run, `function`);
      done();
    });
  });

  describe(`run()`, () => {
    it(`should throw if the first argument is not a function`, done => {
      assert.throws(() => {
        run(`not a function`);
      }, /First argument given to run\(\) must be the 'main' function/i);
      done();
    });

    it(`should throw if the second argument is not an Object`, done => {
      assert.throws(() => {
        run(() => {}, `not an object`)
      }, /Second argument given to run\(\) must be an object with driver functions as properties/i);
      done();
    })

    it(`should throw if second argument is an empty object`, done => {
      assert.throws(() => {
        run(() => {}, {});
      }, /Second argument given to run\(\) must be an object with at least one/i)
      done();
    });

    it(`should return sources object and sinks object`, done => {
      const app = sources => ({
        other: sources.other.take(1).startWith(`a`)
      });

      const driver = () => Most.just('b');

      const { sinks, sources } = run( app, { other: driver } );

      assert.strictEqual(typeof sinks, 'object');
      assert.strictEqual(typeof sinks.other.observe, 'function');
      assert.strictEqual(typeof sources, 'object');
      assert.notStrictEqual(typeof sources.other, 'undefined');
      assert.notStrictEqual(sources.other, null);
      assert.strictEqual(typeof sources.other.observe, 'function');
      done();
    });

    it('should happen on event loop\'s next tick', done => {
      const app = () => ({
        other: Most.from([10, 20, 30])
      })

      let mutable = 'wrong'

      const driver = sink => sink.map(x => 'a' + 10)

      const {sources} = run(app, {other: driver})

      sources.other.take(1).observe(x => {
        assert.strictEqual(x, 'a10')
        assert.strictEqual(mutable, 'correct')
        done()
      })
      mutable = 'correct'
    })

    it(`should run a simple application`, done => {
      const app = sources => ({
        Handshake: Most.just('world from')
      });

      const makeDriver = ({ greeting, name }) => {
        const driver = ( source$ ) => {
          const sink$ = source$
            .map(data => {
              const meaningfulData = `${greeting}, ${data} ${name}!`;
              return meaningfulData;
            });
          return sink$;
        };
        return driver;
      }

      const {sources} = run(app, {
        Handshake: makeDriver({
          greeting: 'Hello',
          name: 'Cycle'
        })
      });

      sources.Handshake.observe(value => {
        assert.strictEqual(value, `Hello, world from Cycle!`)
        done();
      });
    });

    it('should not work after sources are disposed', done => {
      const number$ = Most.from([1, 2, 3])

      const app = () => ({other: number$})

      const {sources, dispose} = run(app, {
        other: number$ => number$.map(number => 'x' + number)
      })

      sources.other.observe(x => {
        assert.notStrictEqual(x, 'x3')
        if (x === 'x2') {
          dispose()
          setTimeout(done, 100)
        }
      })
    })

    it('should not work after sinks are disposed', done => {
      const number$ = Most.from([1, 2, 3])

      const app = () => ({other: number$})

      const {sinks, dispose} = run(app, {
        other: number$ => number$.map(number => 'x' + number)
      })

      sinks.other.observe(x => {
        assert.notStrictEqual(x, 3)
        if (x === 2) {
          dispose()
          setTimeout(done, 100)
        }
      })
    })

    it(`should work with drivers that don't return a stream`, done => {
      const number$ = Most.from([1, 2, 3])

      const app = () => ({number: number$})

      const {dispose} = run(app, {
        number: () => 1,
        object: () => ({}),
        array: () => [],
        boolean: () => true
      })

      dispose()
      done()
    })

    it(`should report errors from main() to the console`, done => {
      const sandbox = sinon.sandbox.create();
      sandbox.stub(console, `error`);

      const main = sources => ({
        other: sources.other.map(() => {
          throw new Error('malfunction')
        })
      });

      const driver = () => Most.just(`b`);

      run(main, {other: driver});

      setTimeout(() => {
        sinon.assert.calledOnce(console.error);
        const errorMessage =
        sinon.assert.calledWithExactly(
          console.error,
          sinon.match('malfunction')
        )
        sandbox.restore();
        done();
      }, 10);
    });
  });
});
