import apiGET from "../api/apiGET";
import { MonsterProps } from "../types/monsterTypes";
const CacheHandler = require('../utils/cacheHandler');

const monsterCache = new CacheHandler();

const BOT_MESSAGE_STATUS = {
    "SUCCESS": "success",
    "MONSTER_NOT_FOUND": "monster_not_found",
    "API_ERROR": "api_error"
};

const getAbilityModifier = (abilityScore: number) => {
    const modifier = Math.floor((abilityScore - 10) / 2);
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
}

const getAbilitySavingThrows = (monster: MonsterProps) => {
    const abilityDictionary = new Map<string, number | null>();
    abilityDictionary.set("strength_save", monster.strength_save);
    abilityDictionary.set("dexterity_save", monster.dexterity_save);
    abilityDictionary.set("constitution_save", monster.constitution_save);
    abilityDictionary.set("intelligence_save", monster.intelligence_save);
    abilityDictionary.set("wisdom_save", monster.wisdom_save);
    abilityDictionary.set("charisma_save", monster.charisma_save);

    const monsterAbilitySaves = [...abilityDictionary].filter(([key, value]) => {
        return value !== null;
    });

    if (monsterAbilitySaves === null) {
        return null;
    }

    const flatMonsterAbilitySaves = monsterAbilitySaves.flat();

    let savingThrowText = "";

    for (let i = 0; i < flatMonsterAbilitySaves.length; i += 2) {
        const save = flatMonsterAbilitySaves[i] as string;
        const modifier = flatMonsterAbilitySaves[i + 1] as number;

        if (save && modifier) {
            const saveText = save.substr(0, 3);
            savingThrowText = savingThrowText + saveText + ": " + modifier + "; ";
        }
    }
    return savingThrowText;
}

const monsterSkills = (monsterSkills: { [key: string]: number }) => {
    let skills = "";
    for (const property in monsterSkills) {
        skills += property + ': ' + monsterSkills[property] + '; ';
    }
    return skills;
}

const monsterEmbedConstructor = (monster: MonsterProps) => {
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

    const monsterProficiencies = [
        ...(getAbilitySavingThrows(monster) ? [{ name: 'Saving throws', value: getAbilitySavingThrows(monster) }] : []),
        ...(monsterSkills(monster.skills) ? [{ name: 'Skills', value: monsterSkills(monster.skills) }] : []),
    ];

    const monsterTraits = [];

    const monsterActions = [];

    const monsterLegendaryActions = [];

    const monsterReactions = [];

    const monsterSpells = [];

    const monsterFields = [];

    const monsterEmbedFields = [
        ...monsterHeader,
        ...monsterDefences,
        ...monsterAbilityScores,
        ...monsterProficiencies,
        // ...monsterTraits,
        // ...monsterActions,
        // ...monsterLegendaryActions,
        // ...monsterReactions,
        // ...monsterSpells,
        // ...monsterFields
    ]

    const embed = {
        color: 0x0099ff,
        fields: [monsterEmbedFields]
    }

    return embed;
}

const botMessageResponse = (botMessage, state, config?) => {
    switch (state) {
        case BOT_MESSAGE_STATUS.SUCCESS:
            if (config.embed) {
                botMessage.edit("Found your monster!", { embed: config.embed });
            }
            else {
                console.log("Found monster, but missing embed object");
            }
            break;
        case BOT_MESSAGE_STATUS.MONSTER_NOT_FOUND:
            if (config.monsterName) {
                botMessage.edit(`Unable to find monster: ${config.monsterName}`)
            }
            break;
        case BOT_MESSAGE_STATUS.API_ERROR:
            if (config.error) {
                botMessage.edit(`API request failed: ${config.error}`);
            }
            break;
        default:
            botMessage.edit(`Unable to process command`);
            break;
    }
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

        if (monsterCache.has(monsterName)) {
            try {
                if (!monsterCache.isExpired(monsterName)) {
                    const monster = monsterCache.get(monsterName);
                    const embed = monsterEmbedConstructor(monster);
                    botMessageResponse(botMessage, BOT_MESSAGE_STATUS.SUCCESS, { embed: embed });
                    return;
                }
                else {
                    monsterCache.delete(monsterName);
                }
            }
            catch (e) {
                console.log(`Unable to get key ${monsterName} from cache`)
            }
        }

        apiGET(`https://api.open5e.com/monsters/${monsterName}`).then((monster: MonsterProps) => {
            if (monster) {
                monsterCache.set(monsterName, monster);
                const embed = monsterEmbedConstructor(monster);
                botMessageResponse(botMessage, BOT_MESSAGE_STATUS.SUCCESS, { embed: embed });
            }
            else {
                botMessageResponse(botMessage, BOT_MESSAGE_STATUS.MONSTER_NOT_FOUND, { monsterName: monsterName });
            }
        }).catch((error) => {
            botMessageResponse(botMessage, BOT_MESSAGE_STATUS.API_ERROR, { error: error });
        });
    }
};