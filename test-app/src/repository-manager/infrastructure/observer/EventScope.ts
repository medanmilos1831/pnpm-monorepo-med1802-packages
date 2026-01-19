class EventScope extends EventTarget {
  scopeName: string;
  subScopes: Map<string, EventScope> = new Map();
  lastEventPayloads: Map<string, any> = new Map();

  constructor(scopeName: string) {
    super();
    this.scopeName = scopeName;
  }

  private formatEventData(eventName: string, payload: any): any {
    return {
      payload,
      eventName,
      scope: this.scopeName,
    };
  }

  dispatch = ({
    eventName,
    payload = undefined,
  }: {
    eventName: string;
    payload?: any;
  }) => {
    this.lastEventPayloads.set(eventName, payload);

    const event = new CustomEvent(eventName, {
      detail: {
        payload,
      },
    });
    this.dispatchEvent(event);
  };
  subscribe = (eventName: string, callback: (e: any) => void) => {
    if (this.lastEventPayloads.has(eventName)) {
      const lastPayload = this.lastEventPayloads.get(eventName);
      callback(this.formatEventData(eventName, lastPayload));
    }

    const callbackWrapper = (e: any) => {
      callback(this.formatEventData(eventName, e.detail.payload));
    };
    this.addEventListener(eventName, callbackWrapper);
    return () => {
      this.removeEventListener(eventName, callbackWrapper);
    };
  };
}

export { EventScope };
