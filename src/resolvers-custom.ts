import { AutenticacaoService } from "./service/autenticacao_service"
import { container } from "./service/container"
import { CriptosService } from "./service/criptos_service"
import * as util from "./gen/util"
import { BacktestService } from "./service/backtest_service"
import { EstrategiaService } from "./service/estrategia_service"

const autenticacao: AutenticacaoService = container.cradle.autenticacao
const criptosService: CriptosService = container.cradle.service
const backtestService: BacktestService = container.cradle.backtestService
const estrategiaService: EstrategiaService = container.cradle.estrategiaService

export const resolvers = {
    Query: {
        versao: () => "0.03",
        listaEstrategia: async (obj, args, ctx) => {
            return estrategiaService.listaEstrategias()
        },
    },
    Mutation: {
        autenticacao: async (obj, args, ctx) => {
            return await autenticacao.autenticarEmailSenha(args.emailCpf, args.senha)
        },
        importacao: async (obj, args, ctx) => {
            const dataHoraInicio = args.dataHoraInicio == null ? null : util.converteStringParaDataHora(args.dataHoraInicio)
            const dataHoraFim = args.dataHoraFim == null ? null : util.converteStringParaDataHora(args.dataHoraFim)
            return await criptosService.importacao(args.idCotacaoHistorico, dataHoraInicio, dataHoraFim)
        },
        executaBacktest: async (obj, args, ctx) => {
            return await backtestService.executa(args.idCotacaoHistorico, args.nomeEstrategia)
        },
    }
}