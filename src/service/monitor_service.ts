import { Contexto, Estrategia, FonteIndicadores, TipoOrdem } from "../estrategias/estrategia"
import { BinaceService } from "./binace_service"
import { IndicadoresService } from "./indicadores_service"
import { TelegramService } from "./telegram_service"
import { Database } from '../database-custom'
import { EstrategiaService } from './estrategia_service'
import { converteDataHoraParaString } from "../gen/util"

var cron = require('node-cron')

var th: MonitorService

export class MonitorService {

    constructor(private estrategiaService: EstrategiaService, private binaceService: BinaceService, private indicadoresService: IndicadoresService, private telegramService: TelegramService, private database: Database) {
        console.log("Inicializado monitor")
        th = this
        cron.schedule('1 * * * *', this.executaMonitor) // hora 1 minuto
    }

    async executaMonitor() {
        console.log("Executando monitor em " + new Date())

        th.telegramService.sendMessage("760422308", "Executando monitor em " + converteDataHoraParaString(new Date()))
        const cotacoes = {}
        for (var monitor of await th.database.listaMonitor()) {
            const criptoPar = await th.database.obtemCriptoPar(monitor.idCriptoPar)
            if (!cotacoes[criptoPar.simbolo]) {
                const candles = await th.binaceService.lerCotacoes(criptoPar.simbolo, monitor.tempo)
                console.log("COTACOES " + criptoPar.simbolo)
                console.log(cotacoes)
                cotacoes[criptoPar.simbolo] = candles
            }
        }
        for (var monitor of await th.database.listaMonitor()) {
            const factory = th.estrategiaService.obtemFactory(monitor.estrategia)
            const criptoPar = await th.database.obtemCriptoPar(monitor.idCriptoPar)
            const fonte = new FonteIndicadores(cotacoes[criptoPar.simbolo], th.indicadoresService)
            const estrategia = await factory.criaInstancia(fonte, monitor.params)
            await th.executaEstrategia(monitor.id, estrategia, cotacoes[criptoPar.simbolo])
        }
    }

    async callbackOperacao(idMonitor: number, dataHora: Date, tipoOrdem: TipoOrdem, valor: number, mensagem: string) {
        var descTipoOrdem
        if (tipoOrdem == TipoOrdem.COMPRA) {
            descTipoOrdem = "COMPRA"
        } else {
            descTipoOrdem = "VENDA"
        }
        const monitor = await th.database.obtemMonitor(idMonitor)
        const criptoPar = await th.database.obtemCriptoPar(monitor.idCriptoPar)
        for (var usuario of await th.database.listaUsuarioPorMonitor(idMonitor)) {
            console.log("enviando msg para usuario: " + usuario + " -> " + mensagem)
            th.telegramService.sendMessage(usuario.telegramChatId, `${mensagem}
Hor??rio: ${converteDataHoraParaString(dataHora)} 
Valor: ${valor}
Ativo: ${criptoPar.simbolo}`)
        }
    }

    async executaEstrategia(idMonitor, estrategia: Estrategia, cotacoes) {
        const monitor = await th.database.obtemMonitor(idMonitor)
        const criptoPar = await th.database.obtemCriptoPar(monitor.idCriptoPar)
        console.log(`--- Executando estrategia ${estrategia.nome} em ${criptoPar.simbolo} ---`)
        const ctx = new Contexto()
        ctx.callback = (dataHora: Date, tipoOrdem: TipoOrdem, valor: number, mensagem: string) => {
            th.callbackOperacao(idMonitor, dataHora, tipoOrdem, valor, mensagem)
        }
        ctx.setaPosicao(cotacoes.length - 1)
        estrategia.executa(cotacoes, cotacoes[cotacoes.length - 1].dataHora, cotacoes[cotacoes.length - 1].open, ctx)
        console.log(`------------------------------------------------\n`)
    }

}