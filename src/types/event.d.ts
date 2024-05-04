import { Interaction, Message } from "discord.js"

export type EventMap = {
    "ready": []
    "messageCreate": [message: Message<boolean>]
    "interactionCreate": [interaction: Interaction]
}