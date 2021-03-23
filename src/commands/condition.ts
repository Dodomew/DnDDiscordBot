import apiGET from "../api/apiGET";
import {ConditionProps} from "../types/conditionTypes";

const CacheHandler = require('../utils/cacheHandler');
const conditionCache = new CacheHandler();

const BOT_MESSAGE_STATUS = {
    "SUCCESS": "success",
    "CONDITION_NOT_FOUND": "condition_not_found",
    "API_ERROR": "api_error"
};

const botMessageResponse = (botMessage, state, response?) => {
    switch (state) {
        case BOT_MESSAGE_STATUS.SUCCESS:
            if (response) {
                botMessage.edit(response.desc);
            }
            break;
        case BOT_MESSAGE_STATUS.API_ERROR:
            if (response.error) {
                botMessage.edit(`API request failed: ${response.error}`);
            }
            break;
        default:
            botMessage.edit(`Unable to process command. Type **!help** to see all commands.`);
            break;
    }
}

module.exports = {
    name: 'condition',
    description: 'Get info about a condition',
    async execute(message, args) {
        if (!args.length) {
            return message.reply("You did not specify a condition.")
        }

        const conditionName = args[0];
        const botMessage = await message.channel.send("fetching...");

        if (conditionCache.has(conditionName)) {
            try {
                if (!conditionCache.isExpired(conditionName)) {
                    const condition = conditionCache.get(conditionName);
                    botMessageResponse(botMessage, BOT_MESSAGE_STATUS.SUCCESS, condition);
                    return;
                }
                else {
                    conditionCache.delete(conditionName);
                }
            }
            catch (e) {
                console.log(`Unable to get key ${conditionName} from cache`)
            }
        }

        apiGET(`https://api.open5e.com/conditions/${conditionName}`).then((condition: ConditionProps) => {
            if (condition) {
                conditionCache.set(conditionName, condition);
                botMessageResponse(botMessage, BOT_MESSAGE_STATUS.SUCCESS, condition);
            }
            else {
                botMessageResponse(botMessage, BOT_MESSAGE_STATUS.CONDITION_NOT_FOUND, { conditionName: conditionName });
            }
        }).catch((error) => {
            botMessageResponse(botMessage, BOT_MESSAGE_STATUS.API_ERROR, { error: error });
        });
    }
}