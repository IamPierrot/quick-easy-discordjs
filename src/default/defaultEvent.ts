import { ActivityOptions, ActivityType, EmbedBuilder, Message } from "discord.js";
import chalk from "chalk";
import { DiscordClient } from "../QuickEasyDiscordjs";

const status: ActivityOptions[] = [
    {
        name: 'Quick and easy Discord.js 🤌',
        type: ActivityType.Streaming,
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    }
]

export const ready = async (client: DiscordClient) => {
    if (!client.user) throw new Error('Cook');

    setInterval(() => {
        const random = Math.floor(Math.random() * status.length);
        client.user!.setActivity(status[random]);
    }, 10000);

    console.log(chalk.green.bold(`✔️  Logged ${chalk.magenta.bold(client.user.tag)} into discord successfully`));
}

export const messageCreate = async (client: DiscordClient, message: Message<boolean>) => {
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