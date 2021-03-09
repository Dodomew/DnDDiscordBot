// const BOT_MESSAGE_STATUS = {
//     "SUCCESS": "success",
//     "MONSTER_NOT_FOUND": "monster_not_found",
//     "API_ERROR": "api_error"
// };

class BotMessageHandler {
    botMessage: any;
    BOT_MESSAGE_STATUS: {
        "SUCCESS": "success",
        "MONSTER_NOT_FOUND": "monster_not_found",
        "API_ERROR": "api_error"
    }

    constructor(botMessage) {
        this.botMessage = botMessage;
    }

    handleResponse(state, config?) {
        switch (state) {
            case this.BOT_MESSAGE_STATUS.SUCCESS:
                if (config.embed) {
                    return this.botMessage.edit("Found your monster!", { embed: config.embed });
                }
                else {
                    console.log("Found monster, but missing embed object");
                }
                break;
            case this.BOT_MESSAGE_STATUS.MONSTER_NOT_FOUND:
                if (config.monsterName) {
                    return this.botMessage.edit(`Unable to find monster: ${config.monsterName}`)
                }
                break;
            case this.BOT_MESSAGE_STATUS.API_ERROR:
                if (config.error) {
                    return this.botMessage.edit(`API request failed: ${config.error}`);
                }
                break;
            default:
                return this.botMessage.edit(`Unable to process command`);
        }
    }
}

module.exports = BotMessageHandler;