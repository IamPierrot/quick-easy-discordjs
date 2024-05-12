import { ActivityOptions, ActivityType, Collection, EmbedBuilder, GuildMember, Interaction, Message, PermissionFlagsBits, PermissionsBitField } from "discord.js";
import chalk from "chalk";
import { DiscordClient } from "../QuickEasyDiscordJs";
import { areCommandsDifferent } from "../utils/checkCommand";
import { QEClient } from "../utils/client";
import { EventDiscord } from "../classes";

const status: ActivityOptions[] = [
    {
        name: 'Quick and easy Discord.js 🤌',
        type: ActivityType.Streaming,
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    }
]

export const ready = new EventDiscord('ready').setListener(async (client: DiscordClient = QEClient.getInstance()) => {
    if (!client.user) throw new Error('Cook');

    setInterval(() => {
        const random = Math.floor(Math.random() * status.length);
        client.user!.setActivity(status[random]);
    }, 10000);

    console.log(chalk.green(`✔️  Logged ${chalk.magenta.bold(client.user.tag)} into discord!?!!`));
}
);
export const registerCommand = new EventDiscord('ready').setListener(
    async (client: DiscordClient = QEClient.getInstance()) => {
        try {
            const localCommands = client.slashCommands;
            const applicationCommands = await getApplicationCommands(
                client,
                client.localGuild
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
    
    let applicationCommands;
    if (guildId !== '') {
        const guild = await client.guilds.fetch(guildId);
        applicationCommands = guild.commands;
    } else {
        applicationCommands = client.application!.commands;
    }

    await applicationCommands?.fetch({});
    return applicationCommands;
}
export const messageCreate = new EventDiscord('messageCreate').setListener(
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

            // Cooldowns
            if (!client.cooldowns.has(commandObject.name)) {
                client.cooldowns.set(commandObject.name, new Collection());
            }

            const now = Date.now();
            const timestamps = client.cooldowns.get(commandObject.name)!;
            const cooldownAmount = (commandObject.cooldowns) * 1000;

            if (timestamps.has(message.author.id)) {
                const expirationTime = timestamps.get(message.author.id)! + cooldownAmount;

                if (now < expirationTime) {
                    const timeLeftInSeconds = Math.floor((expirationTime - now) / 1000);
                    const hours = Math.floor(timeLeftInSeconds / 3600);
                    const minutes = Math.floor((timeLeftInSeconds % 3600) / 60);
                    const seconds = timeLeftInSeconds % 60;

                    let timeLeftString = "";
                    if (hours > 0) {
                        timeLeftString += `${hours} giờ `;
                    }
                    if (minutes > 0) {
                        timeLeftString += `${minutes} phút `;
                    }
                    if (seconds > 0) {
                        timeLeftString += `${seconds} giây `;
                    }

                    return message.reply(`Vui lòng chờ ${timeLeftString}để dùng lại lệnh \`${commandObject.name}\``)
                        .then((msg) => {
                            setTimeout(() => {
                                msg.delete();
                            }, 5000);
                        });;
                }
            }

            timestamps.set(message.author.id, now);
            setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

            if (commandObject?.adminOnly && (!message.member.permissions.has([PermissionFlagsBits.ManageGuild], true))) return message.reply("Bạn không có quyền dùng lệnh này!").then((msg) => setTimeout(() => msg.delete(), 3000));

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

export const interactionCreate = new EventDiscord('interactionCreate').setListener(
    async (interaction: Interaction, client: DiscordClient = QEClient.getInstance()) => {
        try {
            if (!interaction.isChatInputCommand()) return;
            await interaction.deferReply();

            const commandObject = client.slashCommands.find(
                (cmd) => cmd.name === interaction.commandName
            );

            if (!commandObject) return;

            // Cooldowns
            if (!client.cooldowns.has(commandObject.name)) {
                client.cooldowns.set(commandObject.name, new Collection());
            }

            const now = Date.now();
            const timestamps = client.cooldowns.get(commandObject.name)!;
            const cooldownAmount = (commandObject.cooldowns) * 1000;

            if (timestamps.has(interaction.user.id)) {
                const expirationTime = timestamps.get(interaction.user.id)! + cooldownAmount;

                if (now < expirationTime) {
                    const timeLeftInSeconds = Math.floor((expirationTime - now) / 1000);
                    const hours = Math.floor(timeLeftInSeconds / 3600);
                    const minutes = Math.floor((timeLeftInSeconds % 3600) / 60);
                    const seconds = timeLeftInSeconds % 60;

                    let timeLeftString = "";
                    if (hours > 0) {
                        timeLeftString += `${hours} giờ `;
                    }
                    if (minutes > 0) {
                        timeLeftString += `${minutes} phút `;
                    }
                    if (seconds > 0) {
                        timeLeftString += `${seconds} giây `;
                    }

                    return interaction.editReply(`Vui lòng chờ ${timeLeftString}để dùng lại lệnh \`${commandObject.name}\``)
                        .then((msg) => {
                            setTimeout(() => {
                                msg.delete();
                            }, 5000);
                        });;
                }
            }

            timestamps.set(interaction.user.id, now);
            setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

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
            if (commandObject?.adminOnly && interaction.member?.permissions instanceof PermissionsBitField && (!interaction.member?.permissions.has([PermissionFlagsBits.ManageGuild], true))) return interaction.editReply("Bạn không có quyền dùng lệnh này!").then((msg) => setTimeout(() => msg.delete(), 3000));

            await commandObject.callback(client, interaction);
        } catch (error) {
            console.log("There was an error in interaction: ", error);
        }
    }
);