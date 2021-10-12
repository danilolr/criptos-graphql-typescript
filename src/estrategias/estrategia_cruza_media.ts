import { CotacaoHistoricoValor } from "../gen/model"
import { Estrategia, Contexto, FonteIndicadores, Indicador, TipoOrdem, EstrategiaFactory } from "./estrategia"

export class EstrategiaCruzaMedia extends Estrategia {

    private mediaMovelCurta: Indicador
    private mediaMovelLonga: Indicador
    private comprado: boolean = false;

    public async inicializa(indicadores: FonteIndicadores, params: any) {
        this.mediaMovelCurta = await indicadores.obtemMediaMovelSimples(5, "#0000FF")
        this.mediaMovelLonga = await indicadores.obtemMediaMovelSimples(25, "#FF0000")
        this.comprado = false
    }

    public executa(candles: CotacaoHistoricoValor[], dataHora: Date, precoAtivo: number, ctx: Contexto) {
        if (ctx.obtemPosicao() < 26) {
            return
        }
        const mm5 = this.mediaMovelCurta.getData(ctx)
        const mm25 = this.mediaMovelLonga.getData(ctx)

        const anterior = this.comparaMediasMoveis(mm5, mm25, ctx.obtemPosicao() - 2)
        const atual = this.comparaMediasMoveis(mm5, mm25, ctx.obtemPosicao() - 1)

        if (anterior != atual) {
            if (anterior) {
                if (this.comprado) {
                    ctx.enviaOrdem(candles[candles.length - 1].dataHora, TipoOrdem.VENDA, candles[candles.length - 1].close)
                    this.comprado = false
                }
            } else {
                if (!this.comprado) {
                    ctx.enviaOrdem(candles[candles.length - 1].dataHora, TipoOrdem.COMPRA, candles[candles.length - 1].close)
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
        return { nome: "CRUZA_MEDIA", parametros: [{ nome: "mediaCurta", tipo: "INTEGER" }, { nome: "mediaLonga", tipo: "INTEGER" }] }
    }

    public async criaInstancia(indicadores: FonteIndicadores, params: any): Promise<Estrategia> {
        const estrategia = new EstrategiaCruzaMedia()
        await estrategia.inicializa(indicadores, params)
        return estrategia
    }

}