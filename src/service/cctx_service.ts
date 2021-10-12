import { TempoGrafico } from "./constantes"

const ccxt = require('ccxt')

export class CctxService {

    constructor() {
        console.log(ccxt.exchanges)
        const exchangeId = 'binance'
    }

    async lerHistorico(exchangeId: string, dataInicio: number, dataFim: number, tempoGrafico: TempoGrafico) {
        var params = { startTime: dataInicio }
        if (dataFim) {
            params['endTime'] = dataFim
        }
        const exchange = this.getExchange(exchangeId)
        console.log(exchange)
        try {
            const data = await exchange.fetchOHLCV("BTCUSDT", "1m", { startTime: dataInicio })
            for (let candle of data) {
                console.log(new Date(candle[0]), candle)
            }

        } catch (err) {
            console.log(err)
        }
        return []
    }

    getExchange(exchangeId: string) {
        const exchangeClass = ccxt[exchangeId]
        return new exchangeClass({
            'apiKey': process.env.CRIPTOS_BINACE_KEY,
            'secret': process.env.CRIPTOS_BINACE_SECRET,
        })
    }

}