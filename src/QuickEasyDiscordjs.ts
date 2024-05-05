import { ClientOptions } from "discord.js";
import { QEClient } from "./utils/client";
import { QEOption } from "./types/config";

export const quickEasyDiscordJs = (token: string, clientOptions?: ClientOptions & QEOption) => {
    return QEClient.createInstance(token, clientOptions);
}

export type DiscordClient = QEClient;