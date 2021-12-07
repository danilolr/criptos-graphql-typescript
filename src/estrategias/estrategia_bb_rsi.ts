import { CotacaoHistoricoValor } from "../gen/model"
import { Estrategia, Contexto, FonteIndicadores, Indicador, EstrategiaFactory, TipoOrdem } from "./estrategia"

export class EstrategiaBbRsi extends Estrategia {

    private rsi: Indicador
    private bb: Indicador

    private comprado: boolean = false

    public async inicializa(indicadores: FonteIndicadores, params: any) {
        this.bb = await indicadores.obtemBandaBollinger(20, 2, ["#FF0000", "#00FF00", "#0000FF"])
        this.rsi = await indicadores.calculaIndiceForcaRelativa(14, "#00FF00")
    }

    public executa(candles: CotacaoHistoricoValor[], dataHora: Date, precoAtivo: number, ctx: Contexto) {
        const rsiValue = this.rsi.getSerie(ctx, null)[ctx.obtemPosicao()]
        const bbHign = this.bb.getSerie(ctx, "HIGH")[ctx.obtemPosicao()]
        const bbAverage = this.bb.getSerie(ctx, "AVERAGE")[ctx.obtemPosicao()]
        const bbLow = this.bb.getSerie(ctx, "LOW")[ctx.obtemPosicao()]
        console.log(new Date() + " RSI = " + rsiValue)
        if (!this.comprado) {
            if (rsiValue < 40) {
                console.log("Enviada ordem compra " + candles[candles.length - 1].close)
                ctx.enviaOrdem(candles[candles.length - 1].dataHora, TipoOrdem.COMPRA, candles[candles.length - 1].close)
                this.comprado = true
            }
        } else if (this.comprado) {
            if (rsiValue > 60) {
                console.log("Enviada ordem venda " + candles[candles.length - 1].close)
                ctx.enviaOrdem(candles[candles.length - 1].dataHora, TipoOrdem.VENDA, candles[candles.length - 1].close)
                this.comprado = false
            }
        }
    }
}

export class EstrategiaBbRsiFactory extends EstrategiaFactory {

    public obtemInfoEstrategia(): any {
        return {
            nome: "BB_RSI",
            parametros: []
        }
    }

    public async criaInstancia(indicadores: FonteIndicadores, params: any): Promise<Estrategia> {
        const estrategia = new EstrategiaBbRsi()
        await estrategia.inicializa(indicadores, params)
        return estrategia
    }

}