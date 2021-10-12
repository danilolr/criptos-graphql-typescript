const fs = require('fs')
import { Database } from "../database-custom"
import { CotacaoHistoricoValor } from "../gen/model"
import { Estrategia, Contexto, FonteIndicadores } from "../estrategias/estrategia"
import { IndicadoresService } from "./indicadores_service"
import { EstrategiaService } from "./estrategia_service"

export class BacktestService {


    constructor(private database: Database, private indicadoresService: IndicadoresService, private estrategiaService: EstrategiaService) {
    }

    async executa(idCotacaoHistorico: string, nomeEstrategia: string) {
        console.log("iniciando backtest " + new Date())
        var cotacoes = await this.database.obtemHistorico(idCotacaoHistorico)
        cotacoes = cotacoes.slice(0, 1000)

        const fonte = new FonteIndicadores(cotacoes, this.indicadoresService)
        var algoritmo = await this.estrategiaService.obtemEstrategia(nomeEstrategia, fonte, {})

        const ctx = new Contexto()
        for (let i = 1; i < cotacoes.length - 1; i++) {
            const candles = cotacoes.slice(0, i)
            ctx.setaPosicao(i - 1)
            algoritmo.executa(candles, cotacoes[i].dataHora, cotacoes[i].open, ctx)
        }

        const indicadores = []

        for (var indicador of fonte.obtemIndicadores()) {
            indicadores.push({ descricao: indicador.descricao, valores: indicador.data, cor: indicador.cor ? indicador.cor : null, grafico: indicador.grafico })
        }

        console.log("finalizado backtest " + new Date())
        return { ok: true, cotacoes: cotacoes, operacoes: ctx.obtemOrdens(), indicadores: indicadores, resultado: this.geraResultado(ctx.obtemOrdens()) }
    }

    geraResultado(operacoes: any[]) {
        const r = []
        var i = 0
        while (i < operacoes.length) {
            if (i < operacoes.length - 1) {
                r.push({ entrada: operacoes[i], saida: operacoes[i + 1], percResultado: ((operacoes[i + 1].valor / operacoes[i].valor) - 1) * 100 })
            }
            i += 2
        }
        return r
    }

    //     gravaGrafico(cotacoes: CotacaoHistoricoValor[], ctx: Contexto) {
    //         var s = '{\n"ohlcv": [\n'

    //         for (let i = 0; i < cotacoes.length; i++) {
    //             const cotacao = cotacoes[i]
    //             console.log(cotacao.dataHora)
    //             if (i == cotacoes.length - 1) {
    //                 s += `
    //                 [
    //                     ${cotacao.dataHora.getTime() - 3600000 * 3},
    //                     ${cotacao.open},
    //                     ${cotacao.high},
    //                     ${cotacao.low},
    //                     ${cotacao.close},
    //                     ${cotacao.volume}
    //                 ]`
    //             } else {
    //                 s += `
    //                 [
    //                     ${cotacao.dataHora.getTime() - 3600000 * 3},
    //                     ${cotacao.open},
    //                     ${cotacao.high},
    //                     ${cotacao.low},
    //                     ${cotacao.close},
    //                     ${cotacao.volume}
    //                 ],`
    //             }
    //         }

    //         // [
    //         //     1609460280000,
    //         //     1,
    //         //     29267.96,
    //         //     "Compra"
    //         // ],
    //         // [
    //         //     1609460340000,
    //         //     0,
    //         //     29267.96,
    //         //     "Venda"
    //         // ]

    //         s = s + `],    "onchart": [
    //             {
    //                 "name": "Trades",
    //                 "type": "Trades",
    //                 "data": [`

    //         const ordens = ctx.obtemOrdens()
    //         for (let i = 0; ordens.length; i++) {
    //             if (i == ordens.length - 1) {
    //             } else {

    //             }

    //         }

    //         s = s + `]
    //                 }
    //         ]
    //     }`


    //         fs.writeFileSync("/home/danilo/temp/temp/trading-vue-js/data/data.json", s)
    //     }
}