import apiGET from "../api/apiGET";
const CacheHandler = require('../utils/cacheHandler');

const monsterCache = new CacheHandler();

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

    const flatMonsterAbilitySaves = monsterAbilitySaves.flat();

    let savingThrowText = "";

    for (let i = 0; i < flatMonsterAbilitySaves.length; i += 2) {
        const save = flatMonsterAbilitySaves[i] as string;
        const modifier = flatMonsterAbilitySaves[i + 1] as number;

        if (save && modifier) {
            const saveText = save.substr(0, 3);
            savingThrowText = savingThrowText + saveText + " " + modifier + (i + 2 >= flatMonsterAbilitySaves.length ? "" : ", ");
        }
    }
    return savingThrowText;
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
        { name: 'Saving throws', value: getAbilitySavingThrows(monster) }
    ]

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
        ...monsterTraits,
        ...monsterActions,
        ...monsterLegendaryActions,
        ...monsterReactions,
        ...monsterSpells,
        ...monsterFields
    ]

    const embed = {
        color: 0x0099ff,
        fields: [monsterEmbedFields]
    }

    return embed;
}

const botMessageResponse = (botMessage, config) => {
    if (config.embed) {
        botMessage.edit("Found your monster!", { embed: config.embed });
    }
    else if (config.monsterName) {
        botMessage.edit(`Unable to find monster: ${config.monsterName}`)
    }
    else {
        botMessage.edit(`Unable to process command`);
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
                    console.log("not expired, returning monster")
                    const monster = monsterCache.get(monsterName);
                    const embed = monsterEmbedConstructor(monster);
                    botMessageResponse(botMessage, { embed: embed });
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
            console.log("apiGET done")
            if (monster) {
                monsterCache.set(monsterName, monster);
                const embed = monsterEmbedConstructor(monster);
                botMessageResponse(botMessage, { embed: embed });
            }
            else {
                botMessageResponse(botMessage, { monsterName: monsterName });
            }
        }).catch((error) => {
            console.log(error)
            botMessageResponse(botMessage, { monsterName: monsterName, error: error });
        });
    }
};