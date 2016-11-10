import * as assert from 'assert';
import * as sinon from 'sinon';
import * as most from 'most';
import { sync } from 'most-subject';

import * as Motorcycle from '../src';

describe('Motorcycle Core', () => {
  it('has a method `run`', () => {
    assert.strictEqual(typeof Motorcycle.run, 'function');
  });

  describe('run', () => {
    it('takes a main function as it\'s first argument', () => {
      function main () {
        return {};
      }

      Motorcycle.run(main, {});
    });

    it('takes a driver\'s map as it\'s second argument', () => {
      function main () {
        return {};
      }
      const drivers = {};

      Motorcycle.run(main, drivers);
    });

    describe('given main function returning object with named keys', () => {
      it('returns an object with property `sinks` with named keys given by main return', () => {
        const test = most.of(1);

        function main () {
          return {
            test,
          };
        }

        const drivers = {};

        const { sinks } = Motorcycle.run(main, drivers);

        assert.ok(sinks.hasOwnProperty('test'));
        assert.strictEqual((sinks.test.source as any).source, test.source);
      });

      it('returns an object with property `sources` with named keys reflected from driver keys' +
        'and values reflecting the return value of the driver functions', () => {
        const test = most.of(1);

        function main () {
          return {
            test,
          };
        }

        const return1 = {};

        const drivers = {
          test: () => { return return1; },
        };

        const { sources } = Motorcycle.run<{ test: any }, any>(main, drivers);

        assert.ok(sources.hasOwnProperty('test'));
        assert.strictEqual(sources.test, return1);

        const return2 = {};

        const effects = {
          other: () => { return return2; },
        };

        const { sources: secondSources } = Motorcycle.run<{ other: any }, any>(main, effects);

        assert.ok(secondSources.hasOwnProperty('other'));
        assert.strictEqual(secondSources.other, return2);
      });

      it('returns an object with key `dispose` of type function', () => {
        const test = most.of(1);

        function main () {
          return {
            test,
          };
        }

        const drivers = {
          test: () => { return {}; },
        };

        const { dispose } = Motorcycle.run<{ test: any }, any>(main, drivers);

        assert.strictEqual(typeof dispose, 'function');
      });

      it('only subscribes to sinks with matching drivers', () => {
        let testSubscribed: boolean = false;
        let otherSubscribed: boolean = false;

        const test = most.of(1).tap(() => {
          testSubscribed = true;
        });

        const other = most.of(2).tap(() => {
          otherSubscribed = true;
        });

        function main () {
          return {
            test,
            other,
          };
        }

        const drivers = {
          test: () => { return {}; },
        };

        Motorcycle.run<{ test: any }, any>(main, drivers);

        setTimeout(() => {
          assert.ok(testSubscribed);
          assert.ok(!otherSubscribed);
        }, 10);
      });

      it('prints errors to the console', (done) => {
        const sandbox = sinon.sandbox.create();
        sandbox.stub(console, `error`);

        const main = (sources: any) => ({
          other: sources.other.map(() => {
            throw new Error('malfunction')
          })
        });

        const driver = () => most.just(`b`);

        Motorcycle.run(main, {other: driver});

        setTimeout(() => {
          sinon.assert.calledOnce(console.error as Sinon.SinonSpy);
          sandbox.restore();
          done();
        }, 10);
      });
    });

    describe('dispose', () => {
      it('stops sinks from emitting', () => {
        const test = most.periodic(100)
          .scan((x) => x + 1, 0);
          // at time 0 - scan emits seed value 0
          // at time 0 - periodic emits void incrementing value to 1
          // at time 100 - periodic emits void incrementing value to 2
          // at time 200 - ... to 3

        function main () {
          return {
            test,
          };
        }

        const drivers = {
          test: () => {},
        };

        const { sinks, dispose } =
          Motorcycle.run<any, { test: most.Stream<number> }>(main, drivers);

        const expected = [ 0, 1, 2, 3 ];

        setTimeout(() => {
          dispose();
        }, 250);

        return sinks.test.observe(n => {
          assert.strictEqual(n, expected.shift());
        });
      });

      it('stops sinkProxies from emitting', (done) => {
        const test = most.periodic(100)
          .scan((x) => x + 1, 0);
          // at time 0 - scan emits seed value 0
          // at time 0 - periodic emits void incrementing value to 1
          // at time 100 - periodic emits void incrementing value to 2
          // at time 200 - ... to 3

        function main () {
          return {
            test,
          };
        }

        const expected = [ 0, 1, 2, 3 ];

        const drivers = {
          test: (sink$: most.Stream<number>) => {
            sink$.observe(n => {
              assert.strictEqual(n, expected.shift());
              if (n === 3) {
                setTimeout(() => {
                  done();
                }, 150);
              }
            });
          },
        };

        const { sinks, dispose } =
          Motorcycle.run<any, { test: most.Stream<number> }>(main, drivers);


        setTimeout(() => {
          dispose();
        }, 250);
      });

      it('stops Sources with a `dispose` method from emitting', (done) => {
        const test = most.periodic(100)
          .scan((x) => x + 1, 0);
          // at time 0 - scan emits seed value 0
          // at time 0 - periodic emits void incrementing value to 1
          // at time 100 - periodic emits void incrementing value to 2
          // at time 200 - ... to 3

        interface Sources {
          test: {
            foo: most.Stream<number>;
            dispose(): void;
          };
        }

        function main () {
          return {
            test,
          };
        }

        const drivers = {
          test: () => {
            const subject = sync();
            const foo = test.until(subject);
            return {
              foo,
              dispose () {
                subject.next({});
              },
            };
          },
        };

        const { sources, dispose } =
          Motorcycle.run<Sources, any>(main, drivers);

         sources.test.foo
          .observe(n => {
            assert.notStrictEqual(n, 4);

            if (n === 3) {
              dispose();
            }
          })
          .then(() => done())
          .catch(done);
      });
    });
  });
});
