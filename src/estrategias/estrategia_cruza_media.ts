import { CotacaoHistoricoValor } from "../gen/model"
import { Estrategia, Contexto, FonteIndicadores, Indicador, TipoOrdem, EstrategiaFactory } from "./estrategia"

export class EstrategiaCruzaMedia extends Estrategia {

    private mediaMovelCurta: Indicador
    private mediaMovelLonga: Indicador
    private comprado: boolean = false
    private mediaCurta: number
    private mediaLonga: number

    public async inicializa(indicadores: FonteIndicadores, params: any) {
        this.mediaCurta = 5
        this.mediaLonga = 25
        this.mediaMovelCurta = await indicadores.obtemMediaMovelSimples(this.mediaCurta, "#0000FF")
        this.mediaMovelLonga = await indicadores.obtemMediaMovelSimples(this.mediaLonga, "#FF0000")
        this.comprado = false
    }

    public executa(candles: CotacaoHistoricoValor[], dataHora: Date, precoAtivo: number, ctx: Contexto) {
        const mm5 = this.mediaMovelCurta.getSerie(ctx, null)
        const mm25 = this.mediaMovelLonga.getSerie(ctx, null)
        if (ctx.obtemPosicao() < this.mediaLonga) {
            return
        }

        const anterior = this.comparaMediasMoveis(mm5, mm25, ctx.obtemPosicao() - 1)
        const atual = this.comparaMediasMoveis(mm5, mm25, ctx.obtemPosicao())

        if (anterior != atual) {
            if (anterior) {
                if (this.comprado) {
                    ctx.enviaOrdem(candles[candles.length - 1].dataHora, TipoOrdem.VENDA, candles[candles.length - 1].close, `
                    Estratégia Cruzamento de médias
                    Ordem de venda
                    `)
                    this.comprado = false
                }
            } else {
                if (!this.comprado) {
                    ctx.enviaOrdem(candles[candles.length - 1].dataHora, TipoOrdem.COMPRA, candles[candles.length - 1].close, `
                    Estratégia Cruzamento de médias
                    Ordem de compra
                    `)
                    this.comprado = true
                }
            }
        }
    }

    comparaMediasMoveis(mm1: number[], mm2: number[], posicao: number): boolean {
        return mm1[posicao] > mm2[posicao]
    }

}

export class EstrategiaCruzaMediaFactory extends EstrategiaFactory {

    public obtemInfoEstrategia(): any {
        return {
            nome: "CRUZA_MEDIA",
            parametros: [
                { nome: "mediaCurta", tipo: "INTEGER", valorDefault: "5" },
                { nome: "mediaLonga", tipo: "INTEGER", valorDefault: "25" }]
        }
    }

    public async criaInstancia(indicadores: FonteIndicadores, params: any): Promise<Estrategia> {
        const estrategia = new EstrategiaCruzaMedia()
        await estrategia.inicializa(indicadores, params)
        return estrategia
    }

}