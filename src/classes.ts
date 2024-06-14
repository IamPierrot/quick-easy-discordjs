import { APIApplicationCommandBasicOption, CacheType, ChatInputCommandInteraction, Message, Awaitable } from "discord.js";
import { PrefixCommands, SlashCommands } from "./types/command";
import { DiscordClient } from "./QuickEasyDiscordJs";
import { QEEvents } from "./types/event";

///#region Classes

export class PrefixCommand implements PrefixCommands {
    [x: string]: unknown
    name: string
    description: string
    aliases?: string[] | undefined
    adminOnly?: boolean | undefined
    category: string
    cooldowns: number = 1
    async callback(client: DiscordClient, message: Message<boolean>, args: string[]): Promise<unknown> {
        throw new Error("This callback is not implentation. use setCallBack to implement it.")
    }

    constructor(name?: string, description?: string, category?: string) {
        this.name = name || "";
        this.description = description || "";
        this.category = category || "";
    }

    public setName(name: string) {
        this.name = name.toLowerCase();
        return this;
    }
    public setDescription(description: string) {
        this.description = description.toLowerCase();
        return this;
    }
    public setCallBack(callback: (client: DiscordClient, message: Message<boolean>, args: string[]) => Promise<unknown>) {
        this.callback = callback;
        return this;
    }
    public setAliases(aliases: string[]) {
        this.aliases = aliases;
        return this;
    }
    public setCategory(category: string) {
        this.category = category;
        return this;
    }
    /**
     * @param cd calculated in seconds
     * @param cd the default cooldown is 1 second.
     *
     */
    public setCooldowns(cd: number) {
        this.cooldowns = cd;
        return this;
    }

    /**
      * Set a custom attribute with the specified key and value.
      * @param key The name of the custom attribute.
      * @param value The value to assign to the custom attribute.
      */
    public setCustomAttr(key: string, value: unknown) {
        this[key] = value;
        return this;
    }
}
export class SlashCommand implements SlashCommands {
    [x: string]: unknown;
    name: string;
    description: string;
    adminOnly?: boolean | undefined;
    options?: APIApplicationCommandBasicOption[] | undefined;
    category: string;
    cooldowns: number = 1;
    callback(client: DiscordClient, interaction: ChatInputCommandInteraction<CacheType>): Promise<unknown> {
        throw new Error("This callback is not implemented. use setCallBack to implement it.");
    }

    constructor(name?: string, description?: string, category?: string) {
        this.name = name || "";
        this.description = description || "";
        this.category = category || "";
    }

    public setName(name: string) {
        this.name = name.toLowerCase();
        return this;
    }
    public setDescription(description: string) {
        this.description = description.toLowerCase();
        return this;
    }
    public setCallBack(callback: (client: DiscordClient, interaction: ChatInputCommandInteraction<CacheType>) => Promise<unknown>) {
        this.callback = callback;
        return this;
    }
    public setOption(option: APIApplicationCommandBasicOption[]) {
        this.options = option;
    }
    public setCategory(category: string) {
        this.category = category;
        return this;
    }
    /**
    * 
    * @param cd calculated in seconds
    */
    public setCooldowns(cd: number) {
        this.cooldowns = cd;
        return this;
    }
    public setCustomAttr(key: string, value: unknown) {
        this[key] = value;
        return this;
    }
}

export class EventDiscord<K extends keyof QEEvents> {
    private eventName: K | null = null;
    private _once: boolean = false;
    
    public get once() : boolean {
        return this._once;
    }
    
    
    private listener: ((...args: QEEvents[K]) => Awaitable<any> | Promise<unknown>) | null = null;

    constructor(event: K) {
        this.eventName = event;
    }

    public setListener(listener: (...args: QEEvents[K]) => Awaitable<any> | Promise<unknown>) {
        this.listener = listener;
        return this;
    }

    public getEventName() {
        return this.eventName!;
    }
    public getListener() {
        return this.listener!;
    }
    public useOnce() {
        this._once = true;
        return this;
    }
}

//#endregion Classes