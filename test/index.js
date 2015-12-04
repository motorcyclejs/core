/* global describe, it */
import assert from 'assert';
import { run } from '../src';
import Most from 'most';

describe(`Cycle`, () => {
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
      }, /First argument given to Cycle\.run\(\) must be the 'main' function/i);
      done();
    });

    it(`should throw if the second argument is not an Object`, done => {
      assert.throws(() => {
        run(() => {}, `not an object`);
      });
      done();
    })

    it(`should throw if second argument is an empty object`, done => {
      assert.throws(() => {
        run(() => {}, {});
      }, /Second argument given to Cycle\.run\(\) must be an object with at least one/i)
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

      const {sinks, sources} = run(app, {
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
  });
});
