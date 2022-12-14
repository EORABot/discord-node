import {ILobbyUpdate, IPlayer} from './interfaces/lobby';
import IProfileData from './interfaces/profileData';

import loggerService from './services/loggerService';

const dota = require('dota2');

class Dota {
    private Client: any;

    async connect(steamClient: any): Promise<string> {
        this.Client = new dota.Dota2Client(steamClient, false);
        return new Promise((resolve) => {
            this.Client.launch();
            this.Client.once('ready', () => {
                loggerService.title('Dota ready');
                resolve('Dota client is ready');
            });
        });
    }

    async disconnect() {
        this.Client.exit();
        loggerService.title('Dota disconnected');
    }

    async getProfile(
        id: number,
        // | number[]
    ): Promise<IProfileData> {
        // if(Array.isArray(id)) {

        // }
        return new Promise((resolve) => {
            this.Client.requestProfileCard(id, (accountID: number, profileData: IProfileData) => {
                resolve(profileData);
            });
        });
    }

    async createLobby() {
        return new Promise((resolve, reject) => {
            this.Client.createPracticeLobby(
                {
                    game_name: 'Gh0ultegralLobby',
                    server_region: dota.ServerRegion.Luxembourg,
                    gamemode: dota.schema.DOTA_GameMode.DOTA_GAMEMODE_1V1MID,
                    series_type: 2,
                    game_version: 1,
                    allow_cheats: true,
                    fill_with_bots: false,
                    allow_spectating: true,
                    pass_key: 'f4c02405',
                    allchat: true,
                },
                // eslint-disable-next-line
                (err: Error, practiceLobbyUpdate: ILobbyUpdate) => {
                    if (err) {
                        reject(err);
                    } else {
                        this.Client.joinPracticeLobbyTeam(
                            0,
                            4,
                            (err: Error, update: ILobbyUpdate) => {
                                if (err) {
                                    reject(err);
                                }
                                resolve(update);
                            },
                        );
                    }
                },
            );
        });
    }

    async destroyLobby() {
        return new Promise((resolve) => {
            this.Client.destroyLobby();
            this.Client.once('lobbyDestroyed', () => {
                resolve('Lobby destroyed');
            });
        });
    }

    async inviteToLobby(steam64ID: string) {
        return new Promise((resolve) => {
            this.Client.inviteToLobby(steam64ID);
            loggerService.log(`Sent invite to ${steam64ID}`);
            resolve(null);
            // this.Client.once('practiceLobbyUpdate', (update: ILobbyUpdate) => {
            //     console.log(update.all_members);
            //     // console.log(update.all_members.forEach((member) => {
            //     //     const long = new Long(member.id.low, member.id.high, member.id.unsigned)
            //     //     console.log(long.toInt())
            //     // }))

            //     console.log('Joined');
            //     resolve('Joined');
            // });
        });
    }

    async kickPlayer(id: number) {
        return new Promise((resolve, reject) => {
            this.Client.practiceLobbyKick(id, (err: Error, update: ILobbyUpdate) => {
                if (err) {
                    reject(err);
                }
                resolve(update);
            });
        });
    }

    // Will be rebuild
    async waitForPlayersSlot(...ids: string[]) {
        ids.push(String(76561198122182030)); // white-lists bot in lobby
        return new Promise((resolve) => {
            this.Client.on('practiceLobbyUpdate', async (update: ILobbyUpdate) => {
                const players: IPlayer[] = [];
                update.all_members.forEach((member) => {
                    if (member.id === null) {
                        // Sometimes undefined member sneaks into lobby
                        return;
                    }
                    players.push({
                        id: member.id.toNumber(),
                        nickname: member.name,
                        team: member.team,
                    });
                });
                console.log(players);
                const unallowedPlayer = players.find((player) => !ids.includes(String(player.id)));
                if (unallowedPlayer) {
                    await this.kickPlayer(unallowedPlayer.id);
                }
                resolve('');
            });
        });
    }

    async startLobby() {
        this.Client.launchPracticeLobby();
    }
}

const instance = new Dota();

export default instance;
