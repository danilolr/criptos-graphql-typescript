import { CotacaoHistoricoValor } from "../gen/model"
import { IndicadoresService } from "../service/indicadores_service"
import * as util from "../gen/util"

export abstract class Estrategia {

    public abstract inicializa(indicadores: FonteIndicadores, params: any)
    public abstract executa(candles: CotacaoHistoricoValor[], dataHora: Date, precoAtivo: number, cxt: Contexto)

}

export abstract class EstrategiaFactory {

    public abstract obtemInfoEstrategia(): any
    public abstract criaInstancia(indicadores: FonteIndicadores, params: any): Promise<Estrategia>

}

export class Indicador {

    constructor(public descricao: string, public tipoIndicador: string, public series: Serie[], public cor: string, public grafico: number) { }

    getSerie(ctx: Contexto, descSerie: string): number[] {
        for (var s of this.series) {
            if (s.nome == descSerie || descSerie == null) {
                return s.valores.slice(0, ctx.obtemPosicao() + 1)
            }
        }
        return null
    }

    getSeries() {
        return this.series
    }
}


export class Serie {

    constructor(public nome: string, public valores: number[]) { }
}

export class FonteIndicadores {

    private open = []
    private high = []
    private low = []
    private close: number[] = []
    private cached = {}

    constructor(cotacoes: CotacaoHistoricoValor[], private indicadoresService: IndicadoresService) {
        this.open = []
        this.high = []
        this.low = []
        this.close = []
        for (var cotacao of cotacoes) {
            this.open.push(cotacao.open)
            this.high.push(cotacao.high)
            this.low.push(cotacao.low)
            this.close.push(cotacao.close)
        }
    }

    async obtemMediaMovelSimples(numPeriodos: number, cor: string): Promise<Indicador> {
        const key = "mms_" + numPeriodos
        if (this.cached[key]) {
            return this.cached[key]
        }
        const series = await this.indicadoresService.calculaMediaMovelSimples(this.close, numPeriodos)
        const i = new Indicador(`MMS ${numPeriodos}`, 'MMS', series, cor, 0)
        this.cached[key] = i
        return i
    }

    async calculaIndiceForcaRelativa(numPeriodos: number, cor: string): Promise<Indicador> {
        const key = "rsi_" + numPeriodos
        if (this.cached[key]) {
            return this.cached[key]
        }
        const series = await this.indicadoresService.calculaIndiceForcaRelativa(this.close, numPeriodos)
        const i = new Indicador(`RSI ${numPeriodos}`, 'RSI', series, cor, 1)
        this.cached[key] = i
        return i
    }

    async obtemBandaBollinger(numPeriodos: number, escala: number, cores: string[]): Promise<Indicador> {
        const key = `bb_${numPeriodos}_${escala}`
        if (this.cached[key]) {
            return this.cached[key]
        }
        const series = await this.indicadoresService.calculaBandaBollinger(this.close, numPeriodos, escala)
        const i = new Indicador(`BB ${numPeriodos}`, 'BB', series, cores[0], 2)
        this.cached[key] = i
        return i

    }

    obtemIndicadores(): Indicador[] {
        const r = []
        for (const key in this.cached) {
            r.push(this.cached[key])
        }
        return r
    }

}

export enum TipoOrdem {

    COMPRA, VENDA

}

enum CompradoVendido {
    COMPRADO, VENDIDO, NEUTRO
}

type callbackOperacaoEfetuada = (dataHora: Date, tipoOrdem: TipoOrdem, valor: number, mensagem: string) => void

export class Contexto {

    posicao: number
    ordemPendente: TipoOrdem
    situacaoCompra: CompradoVendido
    ordens = []
    callback: callbackOperacaoEfetuada

    constructor() {
        this.ordemPendente = null
        this.situacaoCompra = CompradoVendido.NEUTRO
    }

    temOrdemPendente(): TipoOrdem {
        return this.ordemPendente
    }

    obtemSituacaoCompra(): CompradoVendido {
        return this.situacaoCompra
    }

    enviaOrdem(dataHora: Date, tipoOrdem: TipoOrdem, valor: number, mensagem: string) {
        this.ordemPendente = tipoOrdem
        this.ordens.push({ dataHora: util.converteDataHoraParaString(dataHora), tipo: tipoOrdem == TipoOrdem.COMPRA ? "COMPRA" : "VENDA", valor: valor })
        if (this.callback) {
            this.callback(dataHora, tipoOrdem, valor, mensagem)
        }
    }

    obtemOrdens() {
        return this.ordens
    }

    cancelaOrdem() {
        this.ordemPendente = null
    }

    setaPosicao(i: number) {
        this.posicao = i
    }

    obtemPosicao(): number {
        return this.posicao
    }


}