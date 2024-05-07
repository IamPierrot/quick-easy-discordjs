import { Message, ChatInputCommandInteraction, APIApplicationCommandBasicOption } from "discord.js";
import { DiscordClient } from "../QuickEasyDiscordJs";


export declare interface PrefixCommands extends Record<string, unknown> {
    readonly name: string
    readonly description: string
    readonly category: string
    aliases?: Array<string>
    adminOnly?: boolean

    callback(client: DiscordClient, message: Message, args: string[]): Promise<void | unknown>
}

export declare interface SlashCommands extends Record<string, unknown> {
    readonly name: string
    readonly description: string
    readonly category: string
    options?: APIApplicationCommandBasicOption[]

    callback(client: DiscordClient, interaction: ChatInputCommandInteraction): Promise<void | unknown>
}