import { CotacaoHistoricoValor } from "../gen/model";
import { Estrategia, Contexto, FonteIndicadores, Indicador, EstrategiaFactory, TipoOrdem } from "./estrategia";

export class EstrategiaIndicadores extends Estrategia {

    private rsi: Indicador
    private mediaMovel: Indicador
    private bb: Indicador

    public async inicializa(indicadores: FonteIndicadores, params: any) {
        this.bb = await indicadores.obtemBandaBollinger(30, 5, ["#FF0000", "#00FF00", "#0000FF"])
        this.rsi = await indicadores.calculaIndiceForcaRelativa(14, "#00FF00")
        this.mediaMovel = await indicadores.obtemMediaMovelSimples(21, "#0000FF")
    }

    public executa(candles: CotacaoHistoricoValor[], dataHora: Date, precoAtivo: number, ctx: Contexto) {
    }
}

export class EstrategiaIndicadoresFactory extends EstrategiaFactory {

    public obtemInfoEstrategia(): any {
        return {
            nome: "INDICADORES",
            parametros: []
        }
    }

    public async criaInstancia(indicadores: FonteIndicadores, params: any): Promise<Estrategia> {
        const estrategia = new EstrategiaIndicadores()
        await estrategia.inicializa(indicadores, params)
        return estrategia
    }

}