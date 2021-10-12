import { Database } from "../database-custom"
import { Contexto, FonteIndicadores } from "../estrategias/estrategia"
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

}