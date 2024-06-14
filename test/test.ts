import { quickEasyDiscordJs, PrefixCommand } from '../dist/index';
const client = quickEasyDiscordJs("");

const prefix = new PrefixCommand().setName('concac').setCustomAttr('adminOnly', true);
console.log(prefix.adminOnly);
client.start();