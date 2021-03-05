export interface MonsterProps {
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