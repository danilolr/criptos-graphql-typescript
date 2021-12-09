import { CotacaoHistoricoValor } from "../gen/model";
import { Estrategia, Contexto, FonteIndicadores, Indicador, EstrategiaFactory, TipoOrdem } from "./estrategia";

export class EstrategiaComStopRsi extends Estrategia {

    private rsi: Indicador
    private comprado: boolean = false;
    private valorStop: number;

    public async inicializa(indicadores: FonteIndicadores, params: any) {
        this.rsi = await indicadores.calculaIndiceForcaRelativa(14, "#00FF00")
        this.comprado = false
    }

    public executa(candles: CotacaoHistoricoValor[], dataHora: Date, precoAtivo: number, ctx: Contexto) {
        const rsi = this.rsi.getSerie(ctx, null)
        if (ctx.obtemPosicao() < 14) {
            return
        }
        const rsiValue = rsi[ctx.obtemPosicao()]

        if (this.comprado) {
            if (rsiValue > 60) {
                const precoVenda = candles[candles.length - 1].close
                ctx.enviaOrdem(candles[candles.length - 1].dataHora, TipoOrdem.VENDA, precoVenda, '')
                this.comprado = false
            } else {
                if (candles[candles.length - 1].low < this.valorStop) {
                    ctx.enviaOrdem(candles[candles.length - 1].dataHora, TipoOrdem.VENDA, this.valorStop, '')
                    this.comprado = false
                }
            }
        } else {
            if (rsiValue < 40) {
                const precoCompra = candles[candles.length - 1].close
                ctx.enviaOrdem(candles[candles.length - 1].dataHora, TipoOrdem.COMPRA, candles[candles.length - 1].close, '')
                this.valorStop = precoCompra * 0.95
                this.comprado = true
            }
        }
    }
}

export class EstrategiaRsiComStopFactory extends EstrategiaFactory {

    public obtemInfoEstrategia(): any {
        return {
            nome: "RSI_STOP",
            parametros: [
                { nome: "tempoRsi", tipo: "INTEGER", valorDefault: "14" },
                { nome: "limiteCompra", tipo: "FLOAT", valorDefault: "40" },
                { nome: "limiteVenda", tipo: "FLOAT", valorDefault: "60" },
                { nome: "percStop", tipo: "FLOAT", valorDefault: "5" }]
        }
    }

    public async criaInstancia(indicadores: FonteIndicadores, params: any): Promise<Estrategia> {
        const estrategia = new EstrategiaComStopRsi()
        await estrategia.inicializa(indicadores, params)
        estrategia.nome = "RSI_STOP"
        return estrategia
    }

}