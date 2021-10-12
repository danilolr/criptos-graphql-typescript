import { Database } from "../database-custom"
import { BinaceService } from "./binace_service"
import { converteStringToTempoGrafico } from "./constantes"
import { QueryService } from "./query_service"

export class CriptosService {

    constructor(private binaceService: BinaceService, private database: Database, private queryService: QueryService) { }

    async importacao(idCotacaoHistorico: number, dataInicio: Date, dataFim: Date) {
        if (dataFim == null) {
            if (dataInicio == null) {
                const ultima = await this.database.obtemUltimaDataIndicador(idCotacaoHistorico)
                dataInicio = new Date(ultima.getTime() + 60000)
                dataFim = new Date()
            } else {
                dataFim = new Date()
            }
        }
        return await this.importaInterno(idCotacaoHistorico, dataInicio == null ? null : dataInicio.getTime(), dataFim == null ? null : dataFim.getTime())
    }

    async importaInterno(idCotacaoHistorico: number, dataInicio: number, dataFim: number) {
        const cotacaoHistorico = await this.queryService.queryRecord(`{
            cotacaoHistorico(id:${idCotacaoHistorico}) {
              id
              exchange {
                nome
              }
              criptoPar {
                simbolo
              }
              tempo
            }
          }
          `)
        const ch = cotacaoHistorico.record
        const historico = await this.binaceService.lerHistorico(ch['criptoPar'].simbolo, dataInicio, dataFim, converteStringToTempoGrafico(ch['tempo']))
        var maxDh = null
        for (var cotacao of historico) {
            const dataHora = new Date(cotacao[0])
            maxDh = dataHora

            const open = parseFloat(cotacao[1])
            const high = parseFloat(cotacao[2])
            const low = parseFloat(cotacao[3])
            const close = parseFloat(cotacao[4])
            const volume = parseFloat(cotacao[5])
            const closeTime = new Date(cotacao[6])
            const quoteVolume = parseFloat(cotacao[7])
            const numTrades = parseInt(cotacao[8])
            await this.database.insereCotacaoHistoricoValor({ idCotacaoHistorico: idCotacaoHistorico, dataHora: dataHora, open: open, high: high, low: low, close: close, volume: volume, closeTime: closeTime, quoteVolume: quoteVolume, numTrades: numTrades, ativo: true })
        }
        if (maxDh.getTime() < dataFim) {
            await this.importaInterno(idCotacaoHistorico, maxDh.getTime() + 1, dataFim)
        }
        return true
    }
}
