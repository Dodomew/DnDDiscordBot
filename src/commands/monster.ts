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
            savingThrowText = savingThrowText + saveText + ": +" + modifier + "; ";
        }
    }
    return savingThrowText;
}

const monsterSkills = (monsterSkills: { [key: string]: number }) => {
    let skills = "";
    for (const property in monsterSkills) {
        skills += property + ': +' + monsterSkills[property] + '; ';
    }
    return skills;
}

const monsterActionsConstructor = (abilities: Array<{ name: string, desc: string }>, title: string) => {
    if (!abilities || !abilities.length) {
        return [];
    }

    const action = [{
        name: `\n ${title}`,
        value: `\n ------------------------------`
    }];

    let amountOfExtraFields = 0;

    for (let i = 0; i < abilities.length; i++) {
        const element = abilities[i];

        if (action[amountOfExtraFields].value.length + element.desc.length > 1024) {
            amountOfExtraFields++;
            action[amountOfExtraFields] = {
                name: element.name,
                value: `\n ${element.desc} \n`
            }
            continue;
        }
        action[amountOfExtraFields].value += `\n **${element.name}** \n ${element.desc} \n`;
    }

    return action;
}

const monsterEmbedConstructor = (monster: MonsterProps) => {
    if (!monster) {
        return;
    }

    const monsterHeader = [
        { name: 'Name', value: monster.name },
        { name: 'Description', value: `${monster.size} ${monster.type}, ${monster.alignment}` }
    ];

    const monsterDefences = [
        { name: 'Defences', value: `${monster.armor_class} AC,\n ${monster.hit_points} HP (${monster.hit_dice})`, inline: true },
        { name: 'Speed', value: `${monster.speed.walk}ft ${monster.speed.swim ? `, swim ${monster.speed.swim}ft` : ''}`, inline: true },
    ];

    const monsterAbilityScores = [
        {
            name: 'Abilities', value:
                `Str ${monster.strength} (${getAbilityModifier(monster.strength)}); ` +
                `Dex ${monster.dexterity} (${getAbilityModifier(monster.dexterity)}); ` +
                `Con ${monster.constitution} (${getAbilityModifier(monster.constitution)}); \n` +
                `Int ${monster.intelligence} (${getAbilityModifier(monster.intelligence)}); ` +
                `Wis ${monster.wisdom} (${getAbilityModifier(monster.wisdom)}); ` +
                `Cha ${monster.charisma} (${getAbilityModifier(monster.charisma)})`
        }
    ];

    const monsterProficiencies = [
        ...(getAbilitySavingThrows(monster) ? [{ name: 'Saving throws', value: getAbilitySavingThrows(monster) }] : []),
        ...(monsterSkills(monster.skills) ? [{ name: 'Skills', value: monsterSkills(monster.skills) }] : []),
        ...(monster.senses) ? [{ name: 'Senses', value: monster.senses, inline: true }] : [],
        ...(monster.languages) ? [{ name: 'Languages', value: monster.languages, inline: true }] : [],
        { name: 'Challenge Rating', value: monster.challenge_rating, inline: true },
    ];

    const monsterSpells = () => {
        if (!monster.spell_list || !monster.spell_list.length) {
            return [];
        }

        const spells = [
            {
                name: `\n Spells`,
                value: `\n ------------------------------`
            }
        ]

        for (let i = 0; i < monster.spell_list.length; i++) {
            const spell = monster.spell_list[i];
            const urlParameter = spell.lastIndexOf("/?format=json");
            const APIspellLink = spell.substring(0, urlParameter);
            const spellLink = APIspellLink.replace("api.", "");


            const posA = spell.lastIndexOf("spells/");
            const posB = spell.lastIndexOf("/");
            const spellName = spell.substring(posA + 7, posB); // spells/ is 7 chars long so skip those
            const sanitizedSpellName = spellName.replace(/-/g, " "); // cure-wounds => cure wounds
            const spellNameCapitalized = sanitizedSpellName.charAt(0).toUpperCase() + sanitizedSpellName.slice(1); // cure wounds => Cure wounds

            spells[0].value += `\n [${spellNameCapitalized}](${spellLink})`;
        }
        return spells;
    }

    const monsterEmbedFields = [
        ...monsterHeader,
        ...monsterDefences,
        ...monsterAbilityScores,
        ...monsterProficiencies,
        ...monsterActionsConstructor(monster.special_abilities, "Traits"),
        ...monsterActionsConstructor(monster.actions, "Actions"),
        ...monsterActionsConstructor(monster.legendary_actions, "Legendary Actions"),
        ...monsterActionsConstructor(monster.reactions, "Reactions"),
        ...monsterSpells(),
    ];

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
            botMessage.edit(`Unable to process command. Type **!help** to see all commands.`);
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