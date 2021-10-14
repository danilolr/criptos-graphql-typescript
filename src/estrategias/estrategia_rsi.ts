import { CotacaoHistoricoValor } from "../gen/model";
import { Estrategia, Contexto, FonteIndicadores, Indicador, EstrategiaFactory, TipoOrdem } from "./estrategia";

export class EstrategiaRsi extends Estrategia {

    private rsi: Indicador
    private comprado: boolean = false;

    public async inicializa(indicadores: FonteIndicadores, params: any) {
        this.rsi = await indicadores.calculaIndiceForcaRelativa(14, "#00FF00")
        this.comprado = false
    }

    public executa(candles: CotacaoHistoricoValor[], dataHora: Date, precoAtivo: number, ctx: Contexto) {
        const rsi = this.rsi.getData(ctx)
        console.log(ctx.obtemPosicao())
        console.log(rsi.length)
        if (ctx.obtemPosicao() < 14) {
            return
        }
        const rsiValue = rsi[ctx.obtemPosicao()]

        if (this.comprado) {
            if (rsiValue > 60) {
                ctx.enviaOrdem(candles[candles.length - 1].dataHora, TipoOrdem.VENDA, candles[candles.length - 1].close)
                this.comprado = false
            }
        } else {
            if (rsiValue < 40) {
                ctx.enviaOrdem(candles[candles.length - 1].dataHora, TipoOrdem.COMPRA, candles[candles.length - 1].close)
                this.comprado = true
            }
        }
    }
}

export class EstrategiaRsiFactory extends EstrategiaFactory {

    public obtemInfoEstrategia(): any {
        return {
            nome: "RSI",
            parametros: [
                { nome: "tempoRsi", tipo: "INTEGER", valorDefault: "14" },
                { nome: "limiteCompra", tipo: "FLOAT", valorDefault: "40" },
                { nome: "limiteVenda", tipo: "FLOAT", valorDefault: "60" }]
        }
    }

    public async criaInstancia(indicadores: FonteIndicadores, params: any): Promise<Estrategia> {
        const estrategia = new EstrategiaRsi()
        await estrategia.inicializa(indicadores, params)
        return estrategia
    }

}