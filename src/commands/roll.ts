function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

const parseDie = (dieExpression: string): number => {
    console.log(dieExpression);
    const dieValues = dieExpression.split(/\D/g);
    const prefix: number = parseInt(dieValues[0]);
    const postfix: number = parseInt(dieValues[1]);

    let dieModifierText = "";
    let totalRoll = 0;

    if (postfix) {

        for (let i = 0; i < prefix; i++) {
            const randomDiceRoll = getRandomInt(1, postfix);
            console.log(randomDiceRoll)
            totalRoll += randomDiceRoll;
        }
    }
    else {
        const intModifier = prefix;
        totalRoll += intModifier;
    }

    return totalRoll;
}

module.exports = {
    name: 'roll',
    description: 'Roll a die',
    async execute(message, args) {
        if (!args.length) {
            return message.reply("You did not specify a die.")
        }

        const botMessage = await message.channel.send("rolling...");
        const dieArgs: string = args.join("");

        // if (isNaN(parseInt(dieArgs.charAt(0)))) {
        //     return message.reply("You did not specify a correct amount of die to roll.")
        // }

        const dieExpressions = dieArgs.split(/[+-]/g);
        console.log(dieExpressions);

        let totalRoll = 0;
        let numbersRolled = [];

        for (let i = 0; i < dieExpressions.length; i++) {
            const rolledDie = parseDie(dieExpressions[i]);
            //todo: figure out if the rolledDie needs to be added, or subtracted!
            totalRoll += rolledDie;
            numbersRolled.push(rolledDie)
        }

        //todo: How to make the text look nice? Maybe we can pass in a 'log array' for registration?
        const numbersRolledText = numbersRolled.join(" + ");

        botMessage.edit(`Rolled ${totalRoll} \n (${numbersRolledText})`);
    }
}