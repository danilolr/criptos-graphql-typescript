import { Estrategia, EstrategiaFactory, FonteIndicadores } from "../estrategias/estrategia"
import { EstrategiaCruzaMediaFactory } from "../estrategias/estrategia_cruza_media"
import { EstrategiaRsiFactory } from "../estrategias/estrategia_rsi"

export class EstrategiaService {

    private estrategiasDisponiveis: EstrategiaFactory[]

    constructor() {
        this.estrategiasDisponiveis = [
            new EstrategiaCruzaMediaFactory(),
            new EstrategiaRsiFactory()
        ]

    }

    listaEstrategias() {
        const r = []
        for (let factory of this.estrategiasDisponiveis) {
            r.push(factory.obtemInfoEstrategia())
        }
        return r
    }

    public async obtemEstrategia(nomeEstrategia: string, fonte: FonteIndicadores, params: any): Promise<Estrategia> {
        const factory = this.obtemFactory(nomeEstrategia)
        const estrategia = await factory.criaInstancia(fonte, params)
        return estrategia

    }

    private obtemFactory(nomeEstrategia: string): EstrategiaFactory {
        for (let factory of this.estrategiasDisponiveis) {
            if (factory.obtemInfoEstrategia().nome == nomeEstrategia) {
                return factory
            }
        }
        return null
    }

}