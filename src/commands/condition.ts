import apiGET from "../api/apiGET";
import {ApiConditionResponse, ConditionProps} from "../types/conditionTypes";

const CacheHandler = require('../utils/cacheHandler');
const conditionCache = new CacheHandler();

const BOT_MESSAGE_STATUS = {
    "CONDITION_SUCCESS": "condition_success",
    "CONDITIONS_SUCCESS": "conditions_success",
    "CONDITION_NOT_FOUND": "condition_not_found",
    "API_ERROR": "api_error"
};

const botMessageResponse = (botMessage, state, response?) => {
    switch (state) {
        case BOT_MESSAGE_STATUS.CONDITION_SUCCESS:
            if (response.desc) {
                botMessage.edit(response.desc);
            }
            break;
        case BOT_MESSAGE_STATUS.CONDITIONS_SUCCESS:
            if (response.embed) {
                botMessage.edit('Conditions:', { embed: response.embed});
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
        const botMessage = await message.channel.send("fetching...");

        if (!args.length) {
            apiGET(`https://api.open5e.com/conditions/`).then((conditions: ApiConditionResponse) => {
                
                if (conditions) {
                    conditionCache.set("conditions", conditions);
                    const allConditions = conditions.results.map((condition) => {
                        return condition.slug;
                    });

                    const embed = {
                        color: 0x0099ff,
                        title: 'DnD bot',
                        url: 'https://github.com/Dodomew/DnDDiscordBot',
                        fields: [{ name: "Conditions", value: allConditions.join(", ")}],
                    };

                    botMessageResponse(botMessage, BOT_MESSAGE_STATUS.CONDITIONS_SUCCESS, { embed: embed });
                }
                else {
                    botMessageResponse(botMessage, BOT_MESSAGE_STATUS.CONDITION_NOT_FOUND);
                }
            }).catch((error) => {
                botMessageResponse(botMessage, BOT_MESSAGE_STATUS.API_ERROR, { error: error });
            });
            
            return;
        }

        const conditionName = args[0];

        if (conditionCache.has(conditionName)) {
            try {
                if (!conditionCache.isExpired(conditionName)) {
                    const condition = conditionCache.get(conditionName);
                    botMessageResponse(botMessage, BOT_MESSAGE_STATUS.CONDITION_SUCCESS, condition);
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
                botMessageResponse(botMessage, BOT_MESSAGE_STATUS.CONDITION_SUCCESS, condition);
            }
            else {
                botMessageResponse(botMessage, BOT_MESSAGE_STATUS.CONDITION_NOT_FOUND, { conditionName: conditionName });
            }
        }).catch((error) => {
            botMessageResponse(botMessage, BOT_MESSAGE_STATUS.API_ERROR, { error: error });
        });
    }
}