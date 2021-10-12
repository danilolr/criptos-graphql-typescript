import { TempoGrafico } from "./constantes";

const { Spot } = require('@binance/connector')

export class BinaceService {

    private client;

    constructor() {
        this.client = new Spot(process.env.CRIPTOS_BINACE_KEY, process.env.CRIPTOS_BINACE_SECRET)
    }

    async lerHistorico(simbolo: string, dataInicio: number, dataFim: number, tempoGrafico: TempoGrafico) {
        var params = { limit: 1000, startTime: dataInicio }
        if (dataFim) {
            params['endTime'] = dataFim
        }
        const lines = await this.client.klines(simbolo, '1h', params)
        return lines.data
    }

}