import {Message} from 'discord.js';

import User from '../repository/User';

import loggerService from '../services/loggerService';
import discordService from '../services/discordService';
import DBotError from '../entities/errors/DBotError';
import steam32IDService from '../services/steam32IDService';

export default async (message: Message, body: string[]): Promise<void> => {
    loggerService.title('Edit');
    const bodyStr = body.join(' ').trim();
    const user = await discordService.getAuthorAsUser(message);
    steam32IDService.isSteam32IDExists(message, bodyStr);
    const steam32ID = steam32IDService.validateSteam32ID(message, bodyStr);
    if (!user.canEdit) {
        throw new DBotError({
            messageToLog: 'User that invoked this command is banned from editing his Steam ID',
            messageToSend: 'You were banned from editing your Steam ID',
            discordMessage: message,
            layer: 'editOwnSteam32ID',
            type: 'error',
        });
    }
    await User.updateOne({discordID: user.discordID, guildID: user.guildID}, {steam32ID});
    loggerService.log('Steam ID successfully updated');
    loggerService.separator();
    await discordService.sendMessage(message, 'Your Steam ID was updated successfully');
};
