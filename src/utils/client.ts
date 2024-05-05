import { Client, ClientOptions, GatewayIntentBits, Partials } from "discord.js";
import { PrefixCommands, SlashCommands } from "../types/command";
import getAllFiles, { checkDirectory } from "./file";
import path from "path";
import { Option } from "./config";
import chalk from "chalk";
import { interactionCreate, messageCreate, ready, registerCommand } from "../default/defaultEvent";
import { ping, pingSlash } from "../default/defaultCommand";
import { ConfigPath, QEOption } from "../types/config";
import { EventDiscord } from "../event";

export class QEClient extends Client {
    readonly prefixCommands: PrefixCommands[] = [];
    readonly slashCommands: SlashCommands[] = [];
    readonly events: Map<string, ((...args: any[]) => any)[]> = new Map();
    /**
     * @property default prefix is qe
     */
    public prefix: string = "qe";
    private static config: Option = new Option();

    private static instance: QEClient;

    private prefixCommandIncluded = false;
    private slashCommandIncluded = false;
    private eventIncluded = false;

    private constructor(
        public token: string,
        clientOptions: ClientOptions & QEOption
    ) {
        super(clientOptions);

        if (QEClient.config.PrefixCommandPath) this.prefixCommands = [...this.getTextCommands()];
        if (QEClient.config.SlashCommandPath) this.slashCommands = [...this.getLocalCommands()];
        QEClient.config.useDefault && this.useDefault();
    }

    static createInstance(token: string, clientOptions: ClientOptions & QEOption = {
        intents: Object.keys(GatewayIntentBits) as keyof object,
        partials: Object.keys(Partials) as keyof object,
        useDefault: true
    },
        configPath?: ConfigPath
    ) {

        QEClient.config.EventPath = configPath?.EventPath;
        QEClient.config.PrefixCommandPath = configPath?.PrefixCommandPath;
        QEClient.config.SlashCommandPath = configPath?.SlashCommandPath;

        QEClient.config.useDefault = clientOptions.useDefault;

        this.instance = new QEClient(token, clientOptions);
        return QEClient.instance;
    }
    static getInstance() {
        if (!QEClient.instance) throw new Error("This client is not implement.");
        return QEClient.instance;
    }

    private useDefault() {
        this.includeEvent(ready);
        this.includeEvent(registerCommand);
        this.includeEvent(messageCreate);
        this.includeEvent(interactionCreate);

        this.includeSlashCommand(pingSlash);
        this.includePrefixCommand(ping);
    }

    /**
     * Start registering slash, event and runining bot.
     * Running without shard.
     */
    public async start() {
        try {
            await this.eventHandler();
            await this.login(this.token);
        } catch (error) {
            console.error("There was an error when running bot: ", error);
            console.error("Please fix it or it will be crashed.");
        }
    }

    /**
     * A method used for addition of custom Event, Prefix and Slash folder.
     * @param key may a "EventPath", "PrefixCommandPath" or "SlashCommandPath"
     * @param directory a folder path to key.
     * @throws exception caused by the path should be a path of folder.
     * @exception can not be used before or after using includePrefixCommand, includeEvent and includeSlashCommand
     */
    public includePath<K extends keyof ConfigPath>(key: K, directory: string) {
        const value = path.join(directory);
        checkDirectory(value);

        switch (key) {
            case "PrefixCommandPath":
                if (this.prefixCommandIncluded)
                    throw new Error("Prefix command path cannot be included after prefix commands have been set. Please choose one method of inclusion.");

                break;
            case "EventPath":
                if (this.eventIncluded)
                    throw new Error("Event path cannot be included after events have been set. Please choose one method of inclusion.");

                break;
            case "SlashCommandPath":
                if (this.slashCommandIncluded)
                    throw new Error("Slash command path cannot be included after slash commands have been set. Please choose one method of inclusion.");

                break;
            default:
                QEClient.config[key] = value.replace(/\\/g, '/');
                break;
        }
    }
    /**
     * A method used for addition of custom Prefix commands.
     * @param command  a command created by PrefixCommand class.
     * @throws can not be used if prefix command has been set by includePath
     */
    public includePrefixCommand(command: PrefixCommands) {
        if (QEClient.config.PrefixCommandPath) throw new Error("Prefix command path cannot be included after prefix path have been set. Please choose one method of inclusion.");
        this.prefixCommands.push(command);
        console.log(chalk.green(`✔️  Prefix Command ${chalk.blue.bold(command.name)} is added`))
    }
    /**
     * A method used for addition of custom Slash commands.
     * @param command  a command created by SlashCommand class.
     * @throws can not be used if slash command has been set by includePath
     */
    public includeSlashCommand(command: SlashCommands) {
        if (QEClient.config.SlashCommandPath) throw new Error("Prefix command path cannot be included after slash path have been set. Please choose one method of inclusion.");
        this.slashCommands.push(command);
        console.log(chalk.cyan(`✔️  Slash Command ${chalk.white.bold(command.name)} is added`))
    }

     /**
     * A method used for addition of custom event that have been set on discord.
     * @param event a event name. if you are using code IDE it may suggest you event name.
     * @param listner a call back for that event.
     * @throws can not be used if event has been set by includePath
     * @example client.includeEvent('ready', async () => console.log("Bot is ready!"));
     */
    public includeEvent(event: EventDiscord<any>) {
        const eventName = event.getEventName();
        const eventListener = event.getListner();
        if (QEClient.config.EventPath) throw new Error("Event path cannot be included after events have been set. Please choose one method of inclusion.");
        if (this.events.has(eventName)) {
            this.events.get(eventName)?.push(eventListener);
            console.log(chalk.yellow(`✔️  Event ${chalk.red.bold(eventName)} push more listener!`));
            return;
        };
        this.events.set(eventName, [eventListener]);
        console.log(chalk.yellow(`✔️  Event ${chalk.red.bold(eventName)} is added`));
    }

    public setPrefix(prefix: string) {
        this.prefix = prefix;
    }

    public async getTotalGuild() {
        const guild = await this.shard?.fetchClientValues('guilds.cache.size') as unknown as number[];
        return guild?.reduce((total, guildacc) => total + guildacc, 0);
    }
    public async getTotalMember() {
        const member = await this.shard?.broadcastEval(c => c.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0));
        return member?.reduce((total, mem) => total + mem, 0)!;
    }

    private async eventHandler() {
        if (QEClient.config.EventPath) {
            try {
                const eventFolders: string[] | undefined = getAllFiles(QEClient.config.EventPath, true);
                if (!eventFolders) throw new Error('No folders events have been found');
                for (const eventFolder of eventFolders) {
                    const eventFiles = getAllFiles(eventFolder);
                    eventFiles.sort((a, b) => a > b ? 1 : 0);

                    const eventName = eventFolder.replace(/\\/g, '/').split('/').pop();
                    if (!eventName) throw new Error('Invalid eventName');

                    this.on(eventName, async (...args: unknown[]) => {
                        for (const eventFile of eventFiles) {
                            const eventFunction = require(eventFile);
                            await eventFunction(this, ...args);
                        }
                    });
                }
            } catch (error) {
                console.log("There was an error in event handle", error);
            }
        } else {
            for (const [eventName, listeners] of this.events.entries()) {
                for (const listener of listeners) {
                    this.on(eventName, listener);
                }
            }
        }
    }

    private *getTextCommands(exceptions: string[] = []) {

        const commandCategories = getAllFiles(QEClient.config.PrefixCommandPath!, true);
        for (const commandCategory of commandCategories) {
            const commandFiles = getAllFiles(commandCategory);

            for (const commandFile of commandFiles) {
                const commandObject: PrefixCommands = require(commandFile);
                if (exceptions.includes(commandObject.name)) {
                    continue;
                }
                yield commandObject;
            }
        }
    }

    private *getLocalCommands(exceptions: string[] = []) {
        const commandCategories = getAllFiles(QEClient.config.SlashCommandPath!, true);

        for (const commandCategory of commandCategories) {
            const commandFiles = getAllFiles(commandCategory);


            for (const commandFile of commandFiles) {
                const commandObject: SlashCommands = require(commandFile);

                if (exceptions.includes(commandObject.name)) {
                    continue;
                }
                yield commandObject;
            }
        }
    }
}