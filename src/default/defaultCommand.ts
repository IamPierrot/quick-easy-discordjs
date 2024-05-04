import { EmbedBuilder } from "discord.js";
import { PrefixCommand } from "../command";

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