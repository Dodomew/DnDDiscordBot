interface DieExpression {
    expression: string;
    operator: string;
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
}

const parseDie = (dieExpression: DieExpression): number[] => {
    const dieValues = dieExpression.expression.split(/\D/g);
    const prefix: number = parseInt(dieValues[0]);
    const postfix: number = parseInt(dieValues[1]);
    const individualRolls: number[] = [];

    if (postfix) {
        for (let i = 0; i < prefix; i++) {
            const randomDiceRoll = getRandomInt(1, postfix);
            individualRolls.push(randomDiceRoll);
        }
    }
    else {
        const intModifier = prefix;
        individualRolls.push(intModifier);
    }

    return individualRolls;
}

module.exports = {
    name: 'roll',
    description: 'Roll a die',
    async execute(message, args) {
        if (!args.length) {
            return message.reply("You did not specify a die. Type **!help** to see how to use the **!roll** command.")
        }

        const dieArgs: string = args.join("");

        const expressions = dieArgs.match(/[+-]?\d+d\d+|([+-][\d]+)/g);

        if (!expressions || dieArgs.indexOf("d") === -1) {
            return message.reply("No valid dice found.")
        }

        const botMessage = await message.channel.send("rolling...");

        const dieExpressions: DieExpression[] = [];
        for (let i = 0; i < expressions.length; i++) {
            const expression = expressions[i];
            const operator = expression.charAt(0);

            dieExpressions.push(
                {
                    expression: expression.replace(/[+-]/g, ""),
                    operator: operator === "-" ? operator : "+"
                }
            )
        }

        let totalRoll = 0;
        let numbersRolled: string[] = [];

        for (let i = 0; i < dieExpressions.length; i++) {
            const rolledDie = parseDie(dieExpressions[i]);
            for (let j = 0; j < rolledDie.length; j++) {
                const rolledAmount = rolledDie[j];

                if (dieExpressions[i].operator === "-")
                    totalRoll -= rolledAmount;
                else {
                    totalRoll += rolledAmount;
                }
            }

            const individualRollsText = rolledDie.length > 1 ? rolledDie.join(" + ") : rolledDie.join("");

            if (i !== 0) {
                const operatorText = dieExpressions[i].operator === "-" ? "-" : "+"
                numbersRolled.push(`${operatorText}`)
            }

            numbersRolled.push(`[ ${individualRollsText} ]`)
        }

        const numbersRolledText = numbersRolled.join(" ");
        botMessage.edit(`Rolled ${totalRoll} \n ${numbersRolledText}`);
    }
}
