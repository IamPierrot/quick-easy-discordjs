import { ClientOptions } from "discord.js";
import { QEClient } from "./utils/client";

export const quickEasyDiscordJs = (token: string, clientOptions?: ClientOptions) => {
    return QEClient.createInstance(token, clientOptions);
}

export type DiscordClient = QEClient;