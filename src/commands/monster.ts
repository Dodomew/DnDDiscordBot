const Discord = require('discord.js');
import apiGET from "../api/apiGET";

interface MonsterProps {
    name: string;
    size: string;
    type: string;
    alignment: string;
    armor_class: number,
    armor_desc: string,
    hit_points: number,
    hit_dice: string,
    speed: {
        walk: number,
        swim?: number
    },
    strength: number,
    dexterity: number,
    constitution: number,
    intelligence: number,
    wisdom: number,
    charisma: number,
    strength_save: null,
    dexterity_save: null,
    constitution_save: null,
    intelligence_save: null,
    wisdom_save: null,
    charisma_save: null,
    perception: null,
    skills: {
        athletics: number,
        intimidation: number
    },
    damage_vulnerabilities: string,
    damage_resistances: string,
    damage_immunities: string,
    condition_immunities: string,
    senses: string,
    languages: string,
    challenge_rating: string,
    actions: MonsterAttackProps[],
    reactions: MonsterReactionProps[],
    legendary_desc: string,
    legendary_actions: MonsterSpecialAbilitiesProps[],
    special_abilities: MonsterSpecialAbilitiesProps[],
    spell_list: string[],
    img_main: string,
}

interface MonsterBaseAbilitiesProps {
    name: string,
    desc: string,
}

interface MonsterAttackProps extends MonsterBaseAbilitiesProps {
    attack_bonus: number,
    damage_dice: string,
    damage_bonus: number
}

interface MonsterSpecialAbilitiesProps extends MonsterBaseAbilitiesProps { }

interface MonsterReactionProps extends MonsterBaseAbilitiesProps { }

const getAbilityModifier = (abilityScore: number) => {
    const modifier = Math.floor((abilityScore - 10) / 2);
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
}

module.exports = {
    name: 'monster',
    description: 'Get a monster',
    async execute(message, args) {
        if (!args.length) {
            return message.reply("You did not specify a monster.")
        }

        const monsterName = args[0];

        const botMessage = await message.channel.send("fetching...");

        apiGET(`https://api.open5e.com/monsters/${monsterName}`).then((monster: MonsterProps) => {
            if (monster) {
                // const monsterFields = [];

                // for (const [key, value] of Object.entries(monster)) {
                //     if (!value) {
                //         continue;
                //     }

                //     if (Array.isArray(value) && value.length === 0) {
                //         continue;
                //     }

                //     const monsterField = {
                //         name: key,
                //         value: value
                //     }
                //     monsterFields.push(monsterField);
                // }

                const monsterHeader = [
                    { name: 'Name', value: monster.name },
                    { name: 'Size', value: monster.size, inline: true },
                    { name: 'Type', value: monster.type, inline: true },
                    { name: 'Alignment', value: monster.alignment, inline: true }
                ];

                const monsterDefences = [
                    { name: 'Armor Class', value: monster.armor_class },
                    { name: 'Hit Points', value: `${monster.hit_points} (${monster.hit_dice})` },
                    { name: 'Speed', value: `${monster.speed.walk}ft ${monster.speed.swim ? `, swim ${monster.speed.swim}ft` : ''}` }
                ];

                const monsterAbilityScores = [
                    { name: 'Str', value: `${monster.strength} (${getAbilityModifier(monster.strength)})`, inline: true },
                    { name: 'Dex', value: `${monster.dexterity} (${getAbilityModifier(monster.dexterity)})`, inline: true },
                    { name: 'Con', value: `${monster.constitution} (${getAbilityModifier(monster.constitution)})`, inline: true },
                    { name: 'Int', value: `${monster.intelligence} (${getAbilityModifier(monster.intelligence)})`, inline: true },
                    { name: 'Wis', value: `${monster.wisdom} (${getAbilityModifier(monster.wisdom)})`, inline: true },
                    { name: 'Cha', value: `${monster.charisma} (${getAbilityModifier(monster.charisma)})`, inline: true }
                ];

                const monsterProficiencies = [];

                const monsterTraits = [];

                const monsterActions = [];

                const monsterLegendaryActions = [];

                const monsterReactions = [];

                const monsterSpells = [];

                const monsterFields = []

                const embed = {
                    color: 0x0099ff,
                    fields: [...monsterHeader, ...monsterDefences, ...monsterAbilityScores]
                }

                botMessage.edit("Found your monster!", { embed: embed });
            }
            else {
                botMessage.edit(`Unable to find monster: ${monsterName}`)
            }
        });
    }
};