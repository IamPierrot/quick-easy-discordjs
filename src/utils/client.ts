import { Client, ClientOptions, Collection, GatewayIntentBits, Partials } from "discord.js";
import { PrefixCommands, SlashCommands } from "../types/command";
import getAllFiles, { checkDirectory, dynamicImportModule } from "./file";
import { Option } from "./option";
import chalk from "chalk";
import { interactionCreate, messageCreate, ready, registerCommand } from "../default/defaultEvent";
import { ping, pingSlash, shardSlash, slashPrefix } from "../default/defaultCommand";
import { ConfigPath, QEOption } from "../types/config";
import { QEEvents } from "../types/event";
import path from "path";
import { EventDiscord, PrefixCommand, SlashCommand } from "../classes";

export class QEClient extends Client {
    readonly prefixCommands: PrefixCommands[] = [];
    readonly slashCommands: SlashCommands[] = [];
    readonly events: Map<string, EventDiscord<any>[]> = new Map();
    readonly cooldowns: Collection<string, Collection<string, number>> = new Collection();
    /**
     * @property default prefix is qe.
     * @uses you can type qe ping in discord.
     */
    public prefix: string = "qe";
    private config: Option = new Option();
    public localGuild: string = "";

    private static instance: QEClient;

    private constructor(
        public readonly token: string,
        clientOptions: ClientOptions
    ) {
        super(clientOptions);
    }

    static createInstance(token: string) {
        // create discord client and set client option.
        this.instance = new QEClient(token, {
            intents: Object.keys(GatewayIntentBits) as keyof object,
            partials: Object.keys(Partials) as keyof object,
        });
        return QEClient.instance;
    }

    /**
     * 
     * @returns the instance of QEClient Objects. 
     */
    static getInstance() {
        if (!QEClient.instance) throw new Error("This client is not implement.");
        return this.instance;
    }
    /**
     * Method used for alteration of options.
     * @param option an option you want to change.
     * @param value a value to change the option.
     */
    public useConfig<C extends keyof QEOption>(option: C, value: QEOption[C]) {
        this.config[option] = value;
    }

    private includeDefault() {

        this.includeEvent(registerCommand);
        if (this.config.useDefaultHandler) {
            this.includeEvent(ready);
            this.includeEvent(messageCreate);
            this.includeEvent(interactionCreate);
        }

        if (this.config.useDefaultSlash) {
            this.includeSlashCommand(pingSlash);
            this.includeSlashCommand(shardSlash);
        }
        if (this.config.useDefaultPrefix) {
            this.includePrefixCommand(ping);
            this.includePrefixCommand(slashPrefix);
        }
    }

    /**
     * Start registering slash, event and runining bot.
     * Running without shard.
     */
    public async start() {
        if (this.config.uselocalCommand && !this.localGuild) throw new Error("Invalid local guild id, Use setLocalGuildId to set local guild.");
        this.config.eventFolderPath && await this.getEvent();
        this.config.prefixCommandFolderPath && await this.getTextCommands();
        this.config.slashCommandFolderPath && await this.getSlashCommands();
        this.config.useDefaultHandler && this.includeDefault();
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
     * @param key may a "eventFolderPath", "prefixCommandFolderPath" or "slashCommandFolderPath"
     * @param directory a folder path to key.
     * @throws exception caused by the path should be a path of a folder.
     * @example client.includePath('EventPath', path.join("your path here"));
     */
    public includePath<K extends keyof ConfigPath>(key: K, directory: string) {
        const mainFilePath = require.main?.filename;
        const value = path.resolve(path.dirname(mainFilePath!), directory);

        checkDirectory(value);
        this.config[key] = value.replace(/\\/g, '/');
    }
    /**
     * A method used for addition of custom Prefix commands.
     * @param command  a command created by PrefixCommand class.
     */
    public includePrefixCommand(command: PrefixCommands) {
        this.prefixCommands.push(command);
        console.log(chalk.green(`✔️  Prefix Command ${chalk.blue.bold(command.name)} is added`))
    }
    /**
     * A method used for addition of custom Slash commands.
     * @param command  a command created by SlashCommand class.
     */
    public includeSlashCommand(command: SlashCommands) {
        this.slashCommands.push(command);
        console.log(chalk.cyan(`✔️  Slash Command ${chalk.white.bold(command.name)} is added`))
    }
    /**
    * A method used for addition of custom event that have been set on discord.
    * @param event a EventDiscord class.
    * @example client.includeEvent(new EventDiscord('ready').setListener(async (client) => console.log("bot is ready!")));
    */
    public includeEvent(event: EventDiscord<any>) {
        const eventName = event.getEventName();
        if (this.events.has(eventName)) {
            this.events.get(eventName)?.push(event);
            console.log(chalk.yellow(`✔️  Event ${chalk.red.bold(eventName)} push more listener!`));
            return;
        };
        this.events.set(eventName, [event]);
        console.log(chalk.yellow(`✔️  Event ${chalk.red.bold(eventName)} is added`));
    }

    public setPrefix(prefix: string) {
        this.prefix = prefix;
        return this;
    }
    public setLocalGuildId(Id: string) {
        this.localGuild = Id;
        return this;
    }

    public async getTotalGuild() {
        if (!this.shard) throw new Error("Bot is not using shard?");
        const guild = await this.shard.fetchClientValues('guilds.cache.size') as unknown as number[];
        return guild?.reduce((total, guildacc) => total + guildacc, 0);
    }
    public async getTotalMember() {
        if (!this.shard) throw new Error("Bot is not using shard?");
        const member = await this.shard?.broadcastEval(c => c.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0));
        return member?.reduce((total, mem) => total + mem, 0)!;
    }

    private async eventHandler() {
        try {
            for (const [eventName, eventObjects] of this.events.entries()) {
                for (const eventObject of eventObjects) {
                    if (eventObject.once) this.once(eventName, eventObject.getListener());
                    else this.on(eventName, eventObject.getListener());
                }
            }
        } catch (error) {
            console.log(chalk.red('There was an error while running events: ', error));
            console.log(chalk.red('Please fix as soon as possible.'))
        }
    }

    private async getEvent(exception: string[] = []) {
        const eventFolders: string[] = getAllFiles(this.config.eventFolderPath, true);
        if (!eventFolders || eventFolders.length === 0) {
            throw new Error('No folders events have been found');
        }

        await Promise.all(eventFolders.map(async (eventFolder) => {
            const eventFiles = getAllFiles(eventFolder);
            if (!eventFiles) return;

            const eventName = eventFolder.replace(/\\/g, '/').split('/').pop() as keyof QEEvents;
            if (!eventName || exception.includes(eventName)) return;
            const eventObjects: EventDiscord<any>[] = await Promise.all(eventFiles.map(file => dynamicImportModule(file)));

            for (const eventObject of eventObjects) {
                this.includeEvent(this.config.useFolderNameAsCategory ?
                    new EventDiscord(eventName).setListener(eventObject.getListener()) :
                    eventObject);
            }
        }));
    }


    private async getTextCommands(exceptions: string[] = []) {
        const commandCategories = getAllFiles(this.config.prefixCommandFolderPath, true);

        await Promise.all(commandCategories.map(async commandCategory => {
            const commandFiles = getAllFiles(commandCategory);
            const commandCategoryName = commandCategory.replace(/\\/g, '/').split('/').pop();

            const commandObjects: PrefixCommand[] = await Promise.all(commandFiles.map(file => dynamicImportModule(file)));
            for (const commandObject of commandObjects) {
                if (exceptions.includes(commandObject.name)) continue;
                this.config.useFolderNameAsCategory && commandObject.setCategory(commandCategoryName!);
                this.includePrefixCommand(commandObject);
            }

        }));
    }

    private async getSlashCommands(exceptions: string[] = []) {
        const commandCategories = getAllFiles(this.config.slashCommandFolderPath, true);

        await Promise.all(commandCategories.map(async commandCategory => {
            const commandFiles = getAllFiles(commandCategory);
            const commandCategoryName = commandCategory.replace(/\\/g, '/').split('/').pop();

            const commandObjects: SlashCommand[] = await Promise.all(commandFiles.map(file => dynamicImportModule(file)));
            for (const commandObject of commandObjects) {
                if (exceptions.includes(commandObject.name)) continue;
                this.config.useFolderNameAsCategory && commandObject.setCategory(commandCategoryName!);
                this.includeSlashCommand(commandObject);
            }

        }));
    }
}