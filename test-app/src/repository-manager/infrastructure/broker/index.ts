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
      eventSources[params.scope][params.eventName].record.push({
        id: createId(params.scope, params.eventName),
        event: {
          eventName: params.eventName,
          payload: params.payload,
        },
        ack: false,
        executed() {
          this.ack = true;
          observer.dispatch({
            scope: params.scope,
            eventName: params.eventName,
            payload: params.payload,
          });
        },
      });
      if (eventSources[params.scope][params.eventName].consumers.length > 0) {
        observer.dispatch({
          scope: params.scope,
          eventName: params.eventName,
          payload: params.payload,
        });

        return;
      }

      if (eventSources[params.scope][params.eventName].consumers.length === 0) {
        return;
      }
    },
    subscribe(params) {
      if (!eventSources[params.scope][params.eventName]) {
        createEventSource(params.scope, params.eventName);
      }
      const unsubscribed = observer.subscribe({
        scope: params.scope,
        eventName: params.eventName,
        callback: (payload) => {
          params.callback(payload);
        },
      });
      eventSources[params.scope][params.eventName].consumers.push(unsubscribed);
      if (eventSources[params.scope][params.eventName].record.length > 0) {
        eventSources[params.scope][params.eventName].record.forEach(
          (record: any) => {
            if (record.ack) return;
            params.callback(record.event.payload);
          }
        );
      }
      return unsubscribed;
    },
  };
}

export { createBroker };
