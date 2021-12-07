import { Contexto, FonteIndicadores, TipoOrdem } from "../estrategias/estrategia"
import { EstrategiaBbRsi } from "../estrategias/estrategia_bb_rsi"
import { BinaceService } from "./binace_service"
import { IndicadoresService } from "./indicadores_service"
import { TelegramService } from "./telegram_service"

var th: MonitorService

export class MonitorService {

    constructor(private binaceService: BinaceService, private indicadoresService: IndicadoresService, private telegramService: TelegramService) {
        console.log("Inicializado monitor")
        th = this
        const minutos = 30
        setInterval(this.executaMonitor, 1000 * 60 * minutos)
    }

    async executaMonitor() {
        const cotacoes = await th.binaceService.lerCotacoes("BTCUSDT")
        const estrategia = new EstrategiaBbRsi()
        const fonte = new FonteIndicadores(cotacoes, th.indicadoresService)
        await estrategia.inicializa(fonte, null)
        const ctx = new Contexto()
        ctx.callback = th.callbackOperacao
        ctx.setaPosicao(cotacoes.length - 1)
        estrategia.executa(cotacoes, cotacoes[cotacoes.length - 1].dataHora, cotacoes[cotacoes.length - 1].open, ctx)
    }

    callbackOperacao(dataHora: Date, tipoOrdem: TipoOrdem, valor: number) {
        var descTipoOrdem
        if (tipoOrdem == TipoOrdem.COMPRA) {
            descTipoOrdem = "COMPRA"
        } else {
            descTipoOrdem = "VENDA"
        }
        th.telegramService.sendMessage(`Operacao efetuada ${descTipoOrdem} em ${dataHora} com valor ${valor}`)
    }
}