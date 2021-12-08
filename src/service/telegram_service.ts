const TelegramBot = require('node-telegram-bot-api')
import { Database } from '../database-custom'

var th: TelegramService

export class TelegramService {

    private token = '5018173615:AAHV4DaKUW-1jRDx-F4NwZkWfI9e7UngkkQ'
    private bot
    private ids = []

    constructor(private database: Database) {
        th = this
        this.bot = new TelegramBot(this.token, { polling: true });
        this.bot.on('message', th.onMessage)
    }

    private onMessage(message) {
        const chatId = message.chat.id
        console.log(chatId)
        if (th.ids.indexOf(chatId) == -1) {
            th.ids.push(chatId)
        }

        console.log(message)

        th.bot.sendMessage(chatId, 'Received your message')
    }

    sendMessage(chatId: string, msg: string) {
        th.bot.sendMessage(chatId, msg)
    }
}