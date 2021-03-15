'use strict';

require('dotenv').config();

const fs = require('fs');
const Discord = require('discord.js');
const cooldowns = new Discord.Collection();

const client = new Discord.Client();
client.commands = new Discord.Collection();
const { prefix } = require('../config.json');

// Get all commands
const commandFiles = fs.readdirSync(__dirname + '/commands/').filter((file) => {
    if (file.endsWith('.ts') || file.endsWith('.js')) {
        return file;
    }
});

for (const file of commandFiles) {
    const command = require(__dirname + `/commands/${file}`);
    client.commands.set(command.name, command);
}

client.on('ready', () => {
    console.log('I am ready!');
});

client.on('message', message => {
    if (!message.content.startsWith(prefix) || message.author.bot) {
        return;
    };

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (!client.commands.has(command)) {
        message.reply('Command not recognized');
        return;
    }

    // Command spam protection : Add command to a list with an expiration on it
    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Discord.Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 3) * 1000;

    // if author already has used this command before in the past coolDownAmount seconds, return reply message
    if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            return message.reply(`Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command}\` command.`);
        }
    }

    // Add command to timestamp list and delete it after cooldownAmount again to free up the space
    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

    try {
        client.commands.get(command).execute(message, args);
    } catch (error) {
        console.error(error);
        message.reply('There was an error trying to execute that command!');
    }
});

client.login(process.env.BOT_TOKEN);