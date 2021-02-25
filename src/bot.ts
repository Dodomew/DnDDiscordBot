'use strict';

require('dotenv').config();

// Import the discord.js module
const fs = require('fs');
const Discord = require('discord.js');


// Create an instance of a Discord client
const client = new Discord.Client();
client.commands = new Discord.Collection();
const { prefix } = require('../config.json');

// Get all commands
const commandFiles = fs.readdirSync(__dirname + '/commands/').filter(file => file.endsWith('.ts'));

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

    try {
        client.commands.get(command).execute(message, args);
    } catch (error) {
        console.error(error);
        message.reply('There was an error trying to execute that command!');
    }
});

// Log our bot in using the token from https://discord.com/developers/applications
client.login(process.env.BOT_TOKEN);