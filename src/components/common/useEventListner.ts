import React from "react";
import EventEmitter from "./EventEmitter";

function useEventListener<T extends (...params) => void, T2>(
  event: string,
  listener: T,
  deps: ReadonlyArray<T2>,
) {
  React.useEffect(() => {
    EventEmitter.addListener(event, listener);
    return () => {
      EventEmitter.removeListener(event, listener);
    };
  }, deps);
}

export function makeEventNotifier<P, T>(name: string) {
  return {
    name: name,
    notify: (param: P) => {
      EventEmitter.notify(name, param);
    },
    useEventListener: (listener: (param: P) => void, deps: ReadonlyArray<T>) =>
      useEventListener(name, listener, deps),
  };
}
