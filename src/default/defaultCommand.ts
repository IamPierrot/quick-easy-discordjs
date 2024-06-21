import { EmbedBuilder } from "discord.js";
import { PrefixCommand, SlashCommand } from "../classes";
import { QEClient } from "../utils/client";
import { table } from "table";

export const ping = new PrefixCommand()
    .setName("ping")
    .setDescription("xem ping")
    .setCallBack(async (client, message, args) => {
        const ping = client.ws.ping;

        if (!client.user || !message.guild) throw new Error("error in commands");
        const pingEmbed = new EmbedBuilder()
            .setColor('Blurple')
            .setAuthor({ name: `${client.user.username}`, iconURL: client.user.displayAvatarURL() })
            .setDescription(` \`\`\`elm\nAPI Latency (Websocket) : ${Math.round(ping)}ms \nMessage Latency         : ${Math.abs(Date.now() - message.createdTimestamp)}ms\`\`\` `)
            .setFooter({ text: `${message.guild.name}`, iconURL: message.guild.iconURL() || undefined });

        await message.reply({ embeds: [pingEmbed] });
    });
export const pingSlash = new SlashCommand()
    .setName("ping")
    .setDescription("xem ping của bot")
    .setCallBack(async (client, interaction) => {
        const ping = client.ws.ping;

        if (!client.user || !interaction.guild) throw new Error("error in commands");
        const pingEmbed = new EmbedBuilder()
            .setColor('Blurple')
            .setAuthor({ name: `${client.user.username}`, iconURL: client.user.displayAvatarURL() })
            .setDescription(` \`\`\`elm\nAPI Latency (Websocket) : ${Math.round(ping)}ms \nMessage Latency         : ${Math.abs(Date.now() - interaction.createdTimestamp)}ms\`\`\` `)
            .setFooter({ text: `${interaction.guild.name}`, iconURL: interaction.guild.iconURL() || undefined });

        await interaction.editReply({ embeds: [pingEmbed] });
    });
export const shardPrefix = new PrefixCommand()
    .setName("shard")
    .setAliases(["shards", "bot"])
    .setDescription("Xem shard của bot")
    .setCallBack(async (client, message, args) => {
        if (!client.shard) return message.reply({
            embeds: [
                new EmbedBuilder().setTitle("Bot is not using sharding!").setColor("Red")
            ]
        });
        const table = await getShardInfo(client);
        await message.reply(`\`\`\`elm\n${table}\`\`\``);

    })
export const shardSlash = new SlashCommand()
    .setName("shard")
    .setDescription("Shards of Mine")
    .setCallBack(async (client, interaction) => {
        if (!client.shard) return interaction.editReply({
            embeds: [
                new EmbedBuilder().setTitle("Bot is not using sharding!").setColor("Red")
            ]
        });
        const table = await getShardInfo(client);
        await interaction.editReply(`\`\`\`elm\n${table}\`\`\``);
    })
const getShardInfo = async (client: QEClient) => {

    const totalGuilds = await client.getTotalGuild();
    const totalMembers = await client.getTotalMember();

    const upTime = client.uptime!;

    const day = Math.floor(upTime / (3600 * 24));
    const hour = Math.floor(upTime % (3600 * 24) / 3600);
    const minute = Math.floor(upTime % 3600 / 60);
    const second = Math.floor(upTime % 60);
    const dDisplay = day > 0 ? day + (day === 1 ? "d" : "d") : "";
    const hDisplay = hour > 0 ? hour + (hour === 1 ? ":" : ":") : "";
    const mDisplay = minute > 0 ? minute + (minute === 1 ? ":" : ":") : "";
    const sDisplay = second > 0 ? second + (second === 1 ? "s" : "s") : "";

    const data: any[] = [
        ['SID', 'Server', 'Members', 'UpTime', 'Ping', 'Ram', 'HRam'],
    ];

    const promise = await client.shard!.broadcastEval(c => {
        return [c.shard?.ids[0], c.guilds.cache.size, c.guilds.cache.reduce((prev, guild) => prev + guild.memberCount, 0), c.channels.cache.size, c.uptime, c.ws.ping, process.memoryUsage().heapUsed, process.memoryUsage().heapTotal]
    });


    let totalram = 0
    let totalHram = 0
    for (const i in promise) {
        const j = promise[i];
        totalram += j[6]!;
        totalHram += j[7]!;
        data.push([j[0], j[1]!.toLocaleString('En-us'), j[2]!.toLocaleString('En-us'), '', j[5] + 'ms', formatBytes(j[6]!), formatBytes(j[7]!)])
    }
    data.push(['TOTAL', totalGuilds.toLocaleString('En-us'), totalMembers.toLocaleString('En-us'), `${dDisplay + hDisplay + mDisplay + sDisplay}`, "", formatBytes(totalram), formatBytes(totalHram)]);

    const tableResult = table(data, {
        header: {
            alignment: "center",
            content: "Shards\nThis is the table about shards used"
        },
        columnDefault: {
            alignment: 'center'
        }
    });

    return tableResult;
}

function formatBytes(bytes: number) {
    if (bytes === 0) return '0 Bytes';
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
}