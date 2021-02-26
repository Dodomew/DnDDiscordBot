import { MessageEmbed } from "discord.js";
import apiGET, { ApiResponseProps } from "../api/apiGET";
const fetch = require('node-fetch');

interface MonsterProps {
    name: string;
    size: string;
    type: string;
    alignment: string
}

const trim = (str, max) => ((str.length > max) ? `${str.slice(0, max - 3)}...` : str);

module.exports = {
    name: 'monster',
    description: 'Get a monster',
    async execute(message, args) {
        apiGET(`https://api.open5e.com/monsters/aatxe`).then((monster) => {
            if (monster) {
                const embed = new MessageEmbed()
                    .setColor('#EFFF00')
                    .setTitle(monster.name)
                    .addFields(
                        { name: 'Size', value: monster.size },
                        { name: 'Type', value: monster.type },
                        { name: 'Alignment', value: monster.alignment },
                    );

                message.channel.send(embed);
            }
            else {
                message.channel.send("Unable to fetch monster")
            }
        });
    }
};

const monster = () => {
    console.log('i am monster');
}