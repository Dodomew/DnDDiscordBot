module.exports = {
    name: 'help',
    description: 'Get all info about this bot',
    async execute(message, args) {
        const embed = {
            color: 0x0099ff,
            title: 'DnD bot',
            url: 'https://github.com/Dodomew/DnDDiscordBot',
            fields: [
                {
                    name: '!roll [amount][dieFaces][operator][modifier]',
                    value: 'e.g. !roll 10d6, !roll 2d8+2, !roll 1d4 - 2'
                },
                {
                    name: '!monster [name]',
                    value: 'Get complete info about a monster. If a name has spaces in it, replace them with hyphens, e.g. !monster goblin, !monster pit-fiend',
                },
            ],
        };

        return message.channel.send({ embed: embed });
    }
}