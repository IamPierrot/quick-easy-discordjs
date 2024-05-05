import { ActivityOptions, ActivityType, EmbedBuilder, GuildMember, Interaction, Message } from "discord.js";
import chalk from "chalk";
import { DiscordClient } from "../QuickEasyDiscordJs";
import { areCommandsDifferent } from "../utils/checkCommand";
import { QEClient } from "../utils/client";
import { EventDiscord } from "../event";

const status: ActivityOptions[] = [
    {
        name: 'Quick and easy Discord.js 🤌',
        type: ActivityType.Streaming,
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    }
]

export const ready = new EventDiscord('ready').setListner(async (client: DiscordClient = QEClient.getInstance()) => {
    if (!client.user) throw new Error('Cook');

    setInterval(() => {
        const random = Math.floor(Math.random() * status.length);
        client.user!.setActivity(status[random]);
    }, 10000);

    console.log(chalk.green(`✔️  Logged ${chalk.magenta.bold(client.user.tag)} into discord!?!!`));
}
);
export const registerCommand = new EventDiscord('ready').setListner(
    async (client: DiscordClient = QEClient.getInstance()) => {
        try {
            const localCommands = client.slashCommands;
            const applicationCommands = await getApplicationCommands(
                client,
                ""
            );
            if (!applicationCommands) return;
            const listApllicationcommands = Array.from(applicationCommands?.cache).map(command => command[0]);
            const listExistingCommands = localCommands.map(command => command.name);

            for (const nameCommand of listApllicationcommands) {
                const command = applicationCommands?.cache.find(
                    (cmd) => cmd.name === nameCommand
                );
                if (!command) continue;
                if (!listExistingCommands.includes(nameCommand)) {
                    await applicationCommands.delete(command.id);
                    console.log(`🗑 Deleted command "${nameCommand}" cause it does not exist".`);
                }
            }

            for (const localCommand of localCommands) {
                const { name, description, options } = localCommand;

                const existingCommand = applicationCommands.cache.find(
                    (cmd) => cmd.name === name
                );

                if (existingCommand) {
                    if (localCommand.deleted) {
                        await applicationCommands.delete(existingCommand.id);
                        console.log(`🗑 Deleted command "${name}".`);
                        continue;
                    }

                    if (areCommandsDifferent(existingCommand, localCommand)) {
                        await applicationCommands.edit(existingCommand.id, {
                            description,
                            options,
                        });

                        console.log(`🔁 Edited command "${name}".`);
                    }
                } else {
                    if (localCommand.deleted) {
                        console.log(
                            `⏩ Skipping registering command "${name}" as it's set to delete.`
                        );

                        continue;
                    }

                    await applicationCommands.create({
                        name,
                        description,
                        options,
                    });
                    console.log(`👍 Registered command "${name}."`);
                }
            }

        } catch (error) {
            console.log(`There was an error in register command: ${error}`);
        }
    }
)
const getApplicationCommands = async (client: DiscordClient = QEClient.getInstance(), guildId: string) => {
    // let applicationCommands;

    const applicationCommands = client.application!.commands;
    // if (guildId !== '') {
    //      const guild = await client.guilds.fetch(guildId);
    //      applicationCommands = guild.commands;
    // } else if (configure.app.global) {
    // }

    await applicationCommands?.fetch({});
    return applicationCommands;
}
export const messageCreate = new EventDiscord('messageCreate').setListner(
    async (message: Message<boolean>, client: DiscordClient = QEClient.getInstance()) => {
        try {
            if (message.author.bot) return;

            const checkPrefix = (prefix: string): boolean => message.content.toLowerCase().startsWith(prefix.toLowerCase());

            if (!checkPrefix(client.prefix)) return;

            const args = message.content.slice(client.prefix.length).trim().split(/ +/);
            const command = args.shift()!.toLowerCase();

            const commandObject = client.prefixCommands.find(
                (cmd) => cmd.name === command || cmd.aliases?.includes(command)
            );
            if (!commandObject || !message.member) return;

            // if (commandObject?.adminOnly && (!configure.opt.idDev.includes(message.author.id))) return message.reply("Bạn không có quyền dùng lệnh này!");

            if (commandObject?.voiceChannel) {
                if (!message.member.voice.channel) return await message.reply({ embeds: [new EmbedBuilder().setColor('#ff0000').setDescription(`❌ | Bạn đang không ở trong phòng Voice`)] })
                if (message.guild!.members.me?.voice.channel && message.member.voice.channel.id !== message.guild!.members.me.voice.channel.id) return await message.reply({ embeds: [new EmbedBuilder().setColor('#ff0000').setDescription(`❌ | Bạn đang không ở cùng phòng voice với tui! `)] })
            }

            return await commandObject.callback(client, message, args);
        } catch (error) {
            console.log(`There was an error in message handler: ${error}`)
        }
    }
);

export const interactionCreate = new EventDiscord('interactionCreate').setListner(
    async (interaction: Interaction, client: DiscordClient = QEClient.getInstance()) => {
        try {
            if (!interaction.isChatInputCommand()) return;
            await interaction.deferReply();

            const commandObject = client.slashCommands.find(
                (cmd) => cmd.name === interaction.commandName
            );

            if (!commandObject) return;

            // if (commandObject?.adminOnly && !configure.opt.idDev.includes(interaction.user.id)) return await interaction.editReply({
            //     embeds: [
            //         new EmbedBuilder().setTitle("❌ | Bạn đang không có quyền dùng lệnh này!").setColor('Red')
            //     ]
            // }).then(() => { setTimeout(() => interaction.deleteReply()), 10000 });
            const member = interaction.member as GuildMember;

            if (commandObject.voiceChannel) {
                if (!member.voice.channel) {
                    return await interaction.editReply({
                        embeds: [new EmbedBuilder()
                            .setColor('#ff0000')
                            .setDescription(`❌ | Bạn đang không ở trong phòng Voice`)]
                    })

                }
                if (interaction.guild?.members?.me?.voice.channel && member.voice.channel.id !== interaction.guild.members.me.voice.channel.id) {
                    return await interaction.editReply({
                        embeds: [new EmbedBuilder()
                            .setColor('#ff0000')
                            .setDescription(`❌ | Bạn đang không ở cùng phòng voice với tui! `)],
                    })
                }
            }

            // if (commandObject.permissionsRequired?.length) {
            //      for (const permission of commandObject.permissionsRequired) {
            //           if (!interaction.member.permissions.has(permission)) {
            //                interaction.editReply({
            //                     content: 'Not enough permissions.',
            //                     ephemeral: true,
            //                });
            //                return;
            //           }
            //      }
            // }

            // if (commandObject.botPermissions?.length) {
            //      for (const permission of commandObject.botPermissions) {
            //           const bot = interaction.guild.members.me;

            //           if (!bot.permissions.has(permission)) {
            //                interaction.editReply({
            //                     content: "I don't have enough permissions.",
            //                     ephemeral: true,
            //                });
            //                return;
            //           }
            //      }
            // }
            await commandObject.callback(client, interaction);
        } catch (error) {
            console.log("There was an error in interaction: ", error);
        }
    }
);