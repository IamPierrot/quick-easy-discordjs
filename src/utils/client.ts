import { Awaitable, Client, ClientOptions, GatewayIntentBits, Partials } from "discord.js";
import { PrefixCommands, SlashCommands } from "../types/command";
import getAllFiles from "./getAllFiles";
import path from "path";
import { Option } from "./config";
import chalk from "chalk";
import { EventMap } from "../types/event";
import { messageCreate, ready } from "../default/defaultEvent";
import { ping } from "../default/defaultCommand";

export class QEClient extends Client {
    readonly prefixCommands: PrefixCommands[] = [];
    readonly slashCommands: SlashCommands[] = [];
    readonly events: Map<string, (...args: any[]) => any> = new Map();
    /**
     * @property default prefix is qe
     */
    public prefix: string = "qe";
    private readonly config: Option = new Option();

    private static instance: QEClient;

    private constructor(
        public token: string,
        clientOptions: ClientOptions
    ) {
        super(clientOptions);

        if (this.config.PrefixCommandPath) this.prefixCommands = [...this.getTextCommands()];
        if (this.config.SlashCommandPath) this.slashCommands = [...this.getLocalCommands()];
        this.setDefault();
    }

    static createInstance(token: string, clientOptions: ClientOptions = {
        intents: Object.keys(GatewayIntentBits) as keyof object,
        partials: Object.keys(Partials) as keyof object
    }) {
        this.instance = new QEClient(token, clientOptions);
        return QEClient.instance;
    }

    private setDefault() {
        this.includeEvent('ready' , async () => ready(this));
        this.includeEvent('messageCreate', async (message) => messageCreate(this, message))
        
        this.includePrefixCommand(ping);
    }

    public start() {
        this.eventHandler();
        this.login(this.token);
    }

    public includePath<K extends keyof Option>(key: K, value: string) {
        if (value.endsWith('.js')) throw new Error('the path should be a directory!');

        this.config[key] = path.join(value).replace(/\\/g, '/');
    }

    public includePrefixCommand(command: PrefixCommands) {
        this.prefixCommands.push(command);
        console.log(chalk.green.bold(`✔️  Command ${chalk.blue.bold(command.name)} is successfully added`))
    }

    public includeEvent<K extends keyof EventMap>(event: K, listner: (...args: EventMap[K]) => Awaitable<void> | Promise<unknown>) {
        this.events.set(event, listner);
        console.log(chalk.bold.yellow(`✔️  Event ${chalk.red.bold(event)} is successfully added`));
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

    private eventHandler() {
        if (this.config.EventPath) {
            try {
                const eventFolders: string[] | undefined = getAllFiles(this.config.EventPath, true);
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
            for (const [eventName, listner] of this.events.entries()) {
                this.on(eventName, listner);
            }
        }
    }

    private *getTextCommands(exceptions: string[] = []) {

        const commandCategories = getAllFiles(this.config.PrefixCommandPath, true);
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
        const commandCategories = getAllFiles(this.config.SlashCommandPath, true);

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