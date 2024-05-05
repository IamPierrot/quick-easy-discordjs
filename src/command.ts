import { APIApplicationCommandBasicOption, CacheType, ChatInputCommandInteraction, Message } from "discord.js";
import { PrefixCommands, SlashCommands } from "./types/command";
import { DiscordClient } from "./QuickEasyDiscordJs";

export class PrefixCommand implements PrefixCommands {
    [x: string]: unknown;
    name: string;
    description: string;
    aliases?: string[] | undefined;
    adminOnly?: boolean | undefined;
    async callback(client: DiscordClient, message: Message<boolean>, args: string[]): Promise<unknown> {
        throw new Error("This callback is not implentation. use setCallBack to implement it.")
    }
    
    constructor(name?: string, description?: string) {
        this.name = name || "";
        this.description = description || "";
    }

    public setName(name: string) {
        this.name = name.toLowerCase();
        return this;
    }
    public setDescription(description: string) {
        this.description = description.toLowerCase();
        return this;
    }
    public setCallBack(callback: (client: DiscordClient, message: Message<boolean>, args: string[]) => Promise<unknown> ) {
        this.callback = callback;
        return this;
    }
    public setAliases(aliases: string[]) {
        this.aliases = aliases;
        return this;
    }

}
export class SlashCommand implements SlashCommands {
    [x: string]: unknown;
    name: string;
    description: string;
    adminOnly?: boolean | undefined;
    options?: APIApplicationCommandBasicOption[] | undefined;
    callback(client: DiscordClient, interaction: ChatInputCommandInteraction<CacheType>): Promise<unknown> {
        throw new Error("This callback is not implentation. use setCallBack to implement it.");
    }
    
    constructor(name?: string, description?: string) {
        this.name = name || "";
        this.description = description || "";
    }

    public setName(name: string) {
        this.name = name.toLowerCase();
        return this;
    }
    public setDescription(description: string) {
        this.description = description.toLowerCase();
        return this;
    }
    public setCallBack(callback: (client: DiscordClient, interaction: ChatInputCommandInteraction<CacheType>) => Promise<unknown> ) {
        this.callback = callback;
        return this;
    }
    public setOption(option: APIApplicationCommandBasicOption[]) {
        this.options = option;
    }

}