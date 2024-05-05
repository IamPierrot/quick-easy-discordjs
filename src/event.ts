import { Awaitable } from "discord.js";
import { QEEvents } from "./types/event";

export class EventDiscord<K extends keyof QEEvents> {
    private eventName: K | null = null;
    private listener: ((...args: QEEvents[K]) => Awaitable<void> | Promise<unknown>) | null = null;

    constructor(event: K) {
        this.eventName = event;
    }

    public setListner(listener: (...args: QEEvents[K]) => Awaitable<void> | Promise<unknown>) {
        this.listener = listener;
        return this;
    }

    public getEventName() {
        return this.eventName!;
    }
    public getListner() {
        return this.listener!;
    }
}