import { QEClient } from "./utils/client";

/**
* 
* @param token a token on {@link https://discord.com/developers/docs/quick-start/getting-started Discord Developer Portal}
* @returns The {@link QEClient QEClient class}
*/
export const quickEasyDiscordJs = (token: string) => {
    return QEClient.createInstance(token);
}

export type DiscordClient = QEClient;