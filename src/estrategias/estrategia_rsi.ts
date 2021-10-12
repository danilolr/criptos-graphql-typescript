import { CotacaoHistoricoValor } from "../gen/model";
import { Estrategia, Contexto, FonteIndicadores, Indicador, EstrategiaFactory } from "./estrategia";

export class EstrategiaRsi extends Estrategia {

    private rsi14: Indicador

    public async inicializa(indicadores: FonteIndicadores, params: any) {
        this.rsi14 = await indicadores.calculaIndiceForcaRelativa(14, "#00FF00")
    }

    public executa(candles: CotacaoHistoricoValor[], dataHora: Date, precoAtivo: number, cxt: Contexto) {
        //console.log("RSI " + dataHora + " " + precoAtivo)
    }

}

export class EstrategiaRsiFactory extends EstrategiaFactory {

    public obtemNome(): string {
        return "RSI"
    }

    public async criaInstancia(indicadores: FonteIndicadores, params: any): Promise<Estrategia> {
        const estrategia = new EstrategiaRsi()
        await estrategia.inicializa(indicadores, params)
        return estrategia
    }

}