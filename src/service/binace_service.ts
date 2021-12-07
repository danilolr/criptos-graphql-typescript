import { CotacaoHistoricoValor } from "../gen/model";
import { TempoGrafico } from "./constantes";

const { Spot } = require('@binance/connector')

export class BinaceService {

    private client;

    constructor() {
        this.client = new Spot()
        //        this.client = new Spot(process.env.CRIPTOS_BINACE_KEY, process.env.CRIPTOS_BINACE_SECRET)
    }

    async lerHistorico(simbolo: string, dataInicio: number, dataFim: number, tempoGrafico: TempoGrafico) {
        var params = { limit: 1000, startTime: dataInicio }
        if (dataFim) {
            params['endTime'] = dataFim
        }
        const lines = await this.client.klines(simbolo, '1h', params)
        return lines.data
    }

    async lerCotacoes(simbolo: string) {
        var di = new Date().getTime()
        const minutos = 30
        di = di - 1000 * 60 * 50 * minutos
        var params = { limit: 50, startTime: di }
        const lines = await this.client.klines(simbolo, '1h', params)
        var data: CotacaoHistoricoValor[] = []
        for (var cotacao of lines.data) {
            data.push({
                dataHora: new Date(cotacao[0]),
                open: parseFloat(cotacao[1]),
                high: parseFloat(cotacao[2]),
                low: parseFloat(cotacao[3]),
                close: parseFloat(cotacao[4])
            })
        }
        return data
    }

}