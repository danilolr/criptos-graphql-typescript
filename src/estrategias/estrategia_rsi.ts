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
        if (ctx.obtemPosicao() < 26) {
            return
        }
        const rsi = this.rsi.getData(ctx)[ctx.obtemPosicao()]

        if (this.comprado) {
            if (rsi > 70) {
                ctx.enviaOrdem(candles[candles.length - 1].dataHora, TipoOrdem.VENDA, candles[candles.length - 1].close)
                this.comprado = false
            }
        } else {
            if (rsi < 30) {
                ctx.enviaOrdem(candles[candles.length - 1].dataHora, TipoOrdem.COMPRA, candles[candles.length - 1].close)
                this.comprado = true
            }
        }
    }

}

export class EstrategiaRsiFactory extends EstrategiaFactory {

    public obtemInfoEstrategia(): any {
        return { nome: "RSI", parametros: [{ nome: "tempoRsi", tipo: "INTEGER" }] }
    }

    public async criaInstancia(indicadores: FonteIndicadores, params: any): Promise<Estrategia> {
        const estrategia = new EstrategiaRsi()
        await estrategia.inicializa(indicadores, params)
        return estrategia
    }

}