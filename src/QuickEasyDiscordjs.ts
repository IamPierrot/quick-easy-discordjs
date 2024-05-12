import { ShardingManager } from "discord.js";
import { QEOption } from "./types/config";
import { QEClient } from "./utils/client";
import path from "path";
import chalk from "chalk";
/**
* 
* @param token a token on {@link https://discord.com/developers/docs/quick-start/getting-started Discord Developer Portal}
* @returns The {@link QEClient QEClient class}
*/
export const quickEasyDiscordJs = (token: string) => {
    return QEClient.createInstance(token);
}

/**
 * A method to get client everywhere in project.
 * @returns the quick and easy client has been implemented.
 * @throws error when there is not client's been found.
 */
export const useClient = () => {
    return QEClient.getInstance();
}
/**
 * 
 * @param botPath a path point to root bot file.
 * @param token a token of discord bot
 * @param shards the number of shards you want to run.
 */
export const useShard = (botPath: string, token: string, shards?: number) => {
    const mainFilePath = require.main?.filename;
    const value = path.resolve(path.dirname(mainFilePath!), botPath);
    const manager = new ShardingManager(value, { token: token, totalShards: shards || "auto" });
    manager.on('shardCreate', shard => console.log(chalk.blue.bold(`Launched shard ${chalk.bold.red((shard.id))}`)));
    manager.spawn({
        amount: manager.totalShards
    });
}

export type DiscordClient = QEClient;
export type QEConfig = QEOption;