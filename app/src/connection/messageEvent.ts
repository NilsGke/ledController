export interface newMessageEvent extends Event {
    detail: {
        message: string;
    };
}

export const receiveMessage = (message: MessageEvent) => {
    const newMessageEvent = new CustomEvent("message", {
        bubbles: true,
        detail: {
            message: message.data,
        },
    });
    wsEvents.dispatchEvent(newMessageEvent);
};

export const wsEvents = new EventTarget();
