import { Message } from 'discord.js'
import { readFileSync } from 'fs'
import { join } from 'path'

import dota from '../dota'
import profileData from '../interfaces/profileData'

export default async function getRank(message: Message, body: Array<string>) {
    const pathToRanks = join(process.cwd(), 'src', 'commands', 'util', 'ranks.json')
    const ranks = JSON.parse(readFileSync(pathToRanks, 'utf-8').toString())
    if(isNaN(Number(body))) {
        message.channel.send('Invalid body provided')
        return
    }
    const profileData: profileData = await dota.getProfile(Number(body)) as profileData
    if(profileData.leaderboard_rank !== null) {
        message.channel.send(profileData.leaderboard_rank)
        return
    }
    message.channel.send(ranks[profileData.rank_tier])
}