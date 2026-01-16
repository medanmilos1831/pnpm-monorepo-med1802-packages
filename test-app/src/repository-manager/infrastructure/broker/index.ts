import type { IBroker } from "../../core";
import { createStore } from "../../infrastructure";
import { createScopedObserver } from "../observer";

function createBroker(): IBroker {
  let eventSources: any = {
    "user-repo": {
      // userLoggedIn: {
      //   record: [
      //     {
      //       id: 1,
      //       event: {
      //         eventName: "userLoggedIn",
      //         payload: {
      //           userId: 1,
      //         },
      //       },
      //       ack: false,
      //     },
      //   ],
      //   consumers: [
      //     () => {
      //       console.log("SUBSCRIBED CALLBACK");
      //     },
      //   ],
      // },
    },
  };
  const observer = createScopedObserver([
    {
      scope: "user-repo",
    },
    {
      scope: "company-repo",
    },
  ]);
  function createEventSource(scope: string, eventName: string) {
    if (!eventSources[scope][eventName]) {
      eventSources[scope][eventName] = {
        record: [],
        consumers: [],
      };
    }
  }
  function createId(scope: string, eventName: string) {
    return eventSources[scope][eventName].record.length + 1;
  }
  return {
    publish(params) {
      if (!eventSources[params.scope][params.eventName]) {
        createEventSource(params.scope, params.eventName);
      }
      const item: any = {
        id: createId(params.scope, params.eventName),
        event: {
          eventName: params.eventName,
          payload: params.payload,
        },
        executed() {
          observer.dispatch({
            scope: params.scope,
            eventName: params.eventName,
            payload: this.createEventObject(),
          });
        },
        createEventObject() {
          return {
            data: params.payload,
            source: params.source,
            eventName: params.eventName,
          };
        },
        getEventSource() {
          return params;
        },
      };
      eventSources[params.scope][params.eventName].record.push(item);
      if (eventSources[params.scope][params.eventName].consumers.length > 0) {
        item.executed();

        return;
      }
    },
    subscribe(params: any) {
      if (!eventSources[params.scope][params.eventName]) {
        createEventSource(params.scope, params.eventName);
      }

      let _connected = false;

      let obj = {
        get isConnected() {
          return _connected;
        },
        connect() {
          _connected = true;
        },
        run(callback: any) {
          if (!_connected) return;
          observer.subscribe({
            scope: params.scope,
            eventName: params.eventName,
            callback: (event) => {
              callback(event.payload);
            },
          });
        },
        disconnect() {
          _connected = false;
        },
      };
      eventSources[params.scope][params.eventName].consumers.push(obj);
      return obj;
    },
  };
}

export { createBroker };
