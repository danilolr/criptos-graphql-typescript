import { CotacaoHistoricoValor } from "../gen/model";
import { Estrategia, Contexto, FonteIndicadores, Indicador, EstrategiaFactory, TipoOrdem } from "./estrategia";

export class EstrategiaRsi extends Estrategia {

    private rsi: Indicador

    public async inicializa(indicadores: FonteIndicadores, params: any) {
        this.rsi = await indicadores.calculaIndiceForcaRelativa(14, "#00FF00")
    }

    public executa(candles: CotacaoHistoricoValor[], dataHora: Date, precoAtivo: number, ctx: Contexto) {
        const rsiValue = this.rsi.getSerie(ctx, null)[ctx.obtemPosicao()]
        console.log(new Date() + "RSI = " + rsiValue)
        if (rsiValue < 30) {
            ctx.enviaOrdem(candles[candles.length - 1].dataHora, TipoOrdem.COMPRA, candles[candles.length - 1].close, `
            Estratégia RSI
            Ordem de compra
            RSI = ${rsiValue}
            `)
        }
        if (rsiValue > 70) {
            ctx.enviaOrdem(candles[candles.length - 1].dataHora, TipoOrdem.VENDA, candles[candles.length - 1].close, `
            Estratégia RSI
            Ordem de venda 
            RSI = ${rsiValue}
            `)
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