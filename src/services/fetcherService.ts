import {Client, Guild, Message} from 'discord.js';
import guildDelete from '../commands/util/guildDelete';
import {parse, THEMES} from '../commands/util/logUtilities';
import DBotError from '../entities/errors/DBotError';
import {IUser} from '../entities/User';
import GuildRepo from '../repository/Guild';
import UserRepo from '../repository/User';
import loggerService from './loggerService';

export class FetcherService {
    constructor() {}

    isGuildOwner(idToCheck: string, message: Message): string {
        if (idToCheck === message.guild.ownerID) {
            loggerService.warning("User is a guild owner. Using bot's id to proceed");
            return message.guild.me.id;
        }
        return idToCheck;
    }

    async fetchUserFromMention(message: Message): Promise<IUser> {
        if (!message.mentions.users.first()) {
            throw new DBotError({
                messageToSend: 'No user mentioned',
                messageToLog: 'No user was mentioned',
                type: 'error',
                layer: this.constructor.name,
                discordMessage: message,
            });
        }
        const mentionedID = this.isGuildOwner(message.mentions.users.first().id, message);
        const guild = await GuildRepo.findOne({
            guildID: message.guild.id,
        });
        if (guild === null) {
            throw new DBotError({
                messageToSend:
                    "None of this guild's members are registered in system. Please register before using this command",
                messageToLog: 'User invoked this command from non-existing in DB guild',
                type: 'error',
                layer: this.constructor.name,
                discordMessage: message,
            });
        }
        const user = await UserRepo.findOne({
            guildID: guild._id,
            discordID: mentionedID,
        });
        if (user === null) {
            throw new DBotError({
                messageToSend: 'This user is not registered in system',
                messageToLog: 'Mentioned user is not registered in system',
                type: 'error',
                layer: this.constructor.name,
                discordMessage: message,
            });
        }
        return user;
    }

    async fetchAuthorAsUser(message: Message) {
        const authorID = this.isGuildOwner(message.member.user.id, message);
        const guild = await GuildRepo.findOne({
            guildID: message.guild.id,
        });
        if (guild === null) {
            throw new DBotError({
                messageToSend:
                    "None of this guild's members are registered in system. Please register before using this command",
                messageToLog: 'User invoked this command from non-existing in DB guild',
                type: 'error',
                layer: this.constructor.name,
                discordMessage: message,
            });
        }
        const user = await UserRepo.findOne({
            discordID: authorID,
            guildID: guild._id,
        });
        if (user === null) {
            throw new DBotError({
                messageToSend: 'This user is not registered in system',
                messageToLog: 'Mentioned user is not registered in system',
                type: 'error',
                layer: this.constructor.name,
                discordMessage: message,
            });
        }
        return user;
    }

    async fetchGuild(client: Client, guildID: string): Promise<Guild> {
        try {
            return await client.guilds.fetch(guildID);
        } catch (error) {
            throw new DBotError({
                messageToLog: `Couldnt reach ${parse(guildID, THEMES.NICKNAME_STYLE)} guild, removing it from database`,
                type: 'error',
                layer: this.constructor.name,
                callback: () => guildDelete(guildID),
            });
        }
    }

    async fetchMemberFromGuild(message: Message) {}
}

export default new FetcherService();
