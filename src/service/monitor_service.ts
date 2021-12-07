import { Contexto, Estrategia, FonteIndicadores, TipoOrdem } from "../estrategias/estrategia"
import { EstrategiaBbRsi } from "../estrategias/estrategia_bb_rsi"
import { BinaceService } from "./binace_service"
import { IndicadoresService } from "./indicadores_service"
import { TelegramService } from "./telegram_service"
var cron = require('node-cron')

var th: MonitorService

export class MonitorService {

    constructor(private binaceService: BinaceService, private indicadoresService: IndicadoresService, private telegramService: TelegramService) {
        console.log("Inicializado monitor")
        th = this
        cron.schedule('1 * * * *', this.executaMonitor)
    }

    async executaMonitor() {
        console.log("Executando monitor em " + new Date())
        //        th.telegramService.sendMessage(`Executando monitor em ${new Date()}`)
        await th.executaEstrategia("BTCUSDT", new EstrategiaBbRsi())
    }

    callbackOperacao(dataHora: Date, tipoOrdem: TipoOrdem, valor: number) {
        var descTipoOrdem
        if (tipoOrdem == TipoOrdem.COMPRA) {
            descTipoOrdem = "COMPRA"
        } else {
            descTipoOrdem = "VENDA"
        }
        //      th.telegramService.sendMessage(`Operacao efetuada ${descTipoOrdem} em ${dataHora} com valor ${valor}`)
    }

    async executaEstrategia(pair: string, estrategia: Estrategia) {
        const cotacoes = await th.binaceService.lerCotacoes(pair)
        const fonte = new FonteIndicadores(cotacoes, th.indicadoresService)
        await estrategia.inicializa(fonte, null)
        const ctx = new Contexto()
        ctx.callback = th.callbackOperacao
        ctx.setaPosicao(cotacoes.length - 1)
        estrategia.executa(cotacoes, cotacoes[cotacoes.length - 1].dataHora, cotacoes[cotacoes.length - 1].open, ctx)
    }

}