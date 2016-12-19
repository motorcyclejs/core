import { Stream, Subscription, Subscriber } from 'most';
import { Subject, sync, next, error, complete } from 'most-subject';

export type Sink<T> = Stream<T>;
export type Source = any;

export interface Object<T> {
  [key: string]: T;
}

export interface Component<Sources extends Object<Source>, Sinks extends Object<Sink<any>>> {
  (sources: Sources): Sinks;
}

export interface DriverFn<T, R> {
  (sink: Sink<T>): R;
}

export interface Drivers {
  [key: string]: DriverFn<any, any>;
}

export function run<Sources extends Object<Source>, Sinks extends Object<Source>> (
  component: Component<Sources, Sinks>,
  drivers: Drivers)
{
  const disposableSubject: Subject<void> = sync<void>();
  const sinkProxies: Sinks = createSinkProxies<Sinks>(drivers);
  const sources: Sources = callDrivers<Sources, Sinks>(drivers, sinkProxies);
  const sinks: Sinks = callComponent<Sources, Sinks>(component, sources, disposableSubject);
  const subscriptions: Array<Subscription<any>> = replicateSinks<Sinks>(sinks, sinkProxies);

  function dispose () {
    next(void 0, disposableSubject);
    disposeSinkProxies<Sinks>(sinkProxies);
    disposeSources<Sources>(sources);
    subscriptions.forEach(unsubscribe);
  }

  return { sinks, sources, dispose };
}

function createSinkProxies<Sinks> (drivers: Drivers): Sinks {
  return Object.keys(drivers)
    .reduce(function setSinkProxies (sinkProxies: Sinks, driverName: string): Sinks {
      return set(sinkProxies, driverName, sync());
    }, {} as Sinks);
}

function callDrivers<Sources, Sinks> (drivers: Drivers, sinkProxies: Sinks): Sources {
  return Object.keys(drivers)
    .reduce(function setSources (sources: Sources, driverName: string) {
      const source: any =
        drivers[driverName](get(sinkProxies, driverName));

      return source ? set(sources, driverName, source) : sources;
    }, {} as Sources);
}

function callComponent<Sources extends Object<Source>, Sinks extends Object<Source>> (
  component: Component<Sources, Sinks>,
  sources: Sources,
  disposableSubject: Subject<any>): Sinks
{
  const sinks: Sinks = component(sources);

  return Object.keys(sinks)
    .reduce<Sinks>(function createDisposableSink (disposableSinks: Sinks, sinkName: string): Sinks {
      const disposableSink: Stream<any> =
        get<Stream<any>>(sinks, sinkName).until(disposableSubject);

      return set(disposableSinks, sinkName, disposableSink);
    }, {} as Sinks);
}

function replicateSinks<Sinks> (sinks: Sinks, sinkProxies: Sinks): Array<Subscription<any>> {
  return Object.keys(sinks)
    .filter(sinkName => get(sinkProxies, sinkName))
    .map(function createSubscription (sinkName: string): Subscription<any> {
      const sink: Stream<any> = get(sinks, sinkName);
      const sinkProxy: Subject<any> = get(sinkProxies, sinkName);

      return sink.subscribe(createSubscriber(sinkProxy, sinkName));
    });
}

function createSubscriber (subject: Subject<any>, sinkName: string): Subscriber<any> {
  return {
    next (value: any) {
      next(value, subject);
    },

    error (err: Error) {
      error(err, subject);
      logError(err, sinkName);
    },

    complete (value?: any) {
      complete(value, subject);
    },
  };
}

function logError (err: Error, driverName: string) {
  console.error(
    `${driverName} has failed for the following reason` +
    `${err.message}` +
    `${err.stack || err}`,
  );
}

function disposeSinkProxies<Sinks> (sinkProxies: Sinks) {
   Object.keys(sinkProxies)
    .forEach(function disposeSinkProxy (sinkProxyName: string) {
      get<Subject<any>>(sinkProxies, sinkProxyName).complete();
    });
}

function unsubscribe (subscription: Subscription<any>) {
  subscription.unsubscribe();
}

type DisposableSource = { dispose?: () => void };

function disposeSources<Sources> (sources: Sources) {
  Object.keys(sources)
    .forEach(function disposeSource (sourceName: string) {
      const source: DisposableSource =
        get(sources, sourceName);

      return source.dispose && source.dispose();
    });
}

function get (object: any, key: string): any;
function get<T> (object: any, key: string): T;
function get (object: any, key: string): any {
  return object[key];
}

function set (object: any, key: string, value: any) {
  object[key] = value;
  return object;
}
