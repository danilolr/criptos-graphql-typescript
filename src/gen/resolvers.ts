import { container } from "../service/container"
import { Database } from "../database-custom"
import { AutorizacaoService } from "../service/autorizacao_service"
import * as util from "./util"

const database: Database = container.cradle.database
const autorizacaoService: AutorizacaoService = container.cradle.autorizacao

export const resolvers = {
 Query: {
        arquivo: async (obj, args, ctx) => {
            autorizacaoService.verificaChamado(ctx, args)
            return await database.listaArquivo({id: args.id})
        },
        cotacaoHistorico: async (obj, args, ctx) => {
            autorizacaoService.verificaChamado(ctx, args)
            return await database.listaCotacaoHistorico({id: args.id, idExchange: args.idExchange, idCriptoPar: args.idCriptoPar})
        },
        cotacaoHistoricoValor: async (obj, args, ctx) => {
            autorizacaoService.verificaChamado(ctx, args)
            return await database.listaCotacaoHistoricoValor({id: args.id, idCotacaoHistorico: args.idCotacaoHistorico})
        },
        criptoPar: async (obj, args, ctx) => {
            autorizacaoService.verificaChamado(ctx, args)
            return await database.listaCriptoPar({id: args.id, idCriptoativoOrigem: args.idCriptoativoOrigem, idCriptoativoDestino: args.idCriptoativoDestino})
        },
        criptoativo: async (obj, args, ctx) => {
            autorizacaoService.verificaChamado(ctx, args)
            return await database.listaCriptoativo({id: args.id})
        },
        exchange: async (obj, args, ctx) => {
            autorizacaoService.verificaChamado(ctx, args)
            return await database.listaExchange({id: args.id})
        },
        menu: async (obj, args, ctx) => {
            autorizacaoService.verificaChamado(ctx, args)
            return await database.listaMenu({id: args.id, idMenuPai: args.idMenuPai})
        },
        monitor: async (obj, args, ctx) => {
            autorizacaoService.verificaChamado(ctx, args)
            return await database.listaMonitor({id: args.id, idCriptoPar: args.idCriptoPar})
        },
        monitorUsuario: async (obj, args, ctx) => {
            autorizacaoService.verificaChamado(ctx, args)
            return await database.listaMonitorUsuario({id: args.id, idMonitor: args.idMonitor, idUsuario: args.idUsuario})
        },
        role: async (obj, args, ctx) => {
            autorizacaoService.verificaChamado(ctx, args)
            return await database.listaRole({id: args.id})
        },
        roleMenu: async (obj, args, ctx) => {
            autorizacaoService.verificaChamado(ctx, args)
            return await database.listaRoleMenu({id: args.id, idRole: args.idRole, idMenu: args.idMenu})
        },
        roleUsuario: async (obj, args, ctx) => {
            autorizacaoService.verificaChamado(ctx, args)
            return await database.listaRoleUsuario({id: args.id, idRole: args.idRole, idUsuario: args.idUsuario})
        },
        usuario: async (obj, args, ctx) => {
            autorizacaoService.verificaChamado(ctx, args)
            return await database.listaUsuario({id: args.id})
        },
        usuarioTelegram: async (obj, args, ctx) => {
            autorizacaoService.verificaChamado(ctx, args)
            return await database.listaUsuarioTelegram({id: args.id})
        },
    },
    Arquivo: {
    },
    CotacaoHistorico: {
        exchange: async (cotacaoHistorico) => {
             return await database.obtemExchange(cotacaoHistorico.idExchange)
        }, 
        criptoPar: async (cotacaoHistorico) => {
             return await database.obtemCriptoPar(cotacaoHistorico.idCriptoPar)
        }, 
        listaCotacaoHistoricoValor: async (cotacaoHistorico) => {
            return database.listaCotacaoHistoricoValor({idCotacaoHistorico: cotacaoHistorico.id})
        },
    },
    CotacaoHistoricoValor: {
        cotacaoHistorico: async (cotacaoHistoricoValor) => {
             return await database.obtemCotacaoHistorico(cotacaoHistoricoValor.idCotacaoHistorico)
        }, 
        dataHora: async (cotacaoHistoricoValor) => util.converteDataHoraParaString(cotacaoHistoricoValor.dataHora),
        closeTime: async (cotacaoHistoricoValor) => util.converteDataHoraParaString(cotacaoHistoricoValor.closeTime),
    },
    CriptoPar: {
        criptoativoOrigem: async (criptoPar) => {
             return await database.obtemCriptoativo(criptoPar.idCriptoativoOrigem)
        }, 
        criptoativoDestino: async (criptoPar) => {
             return await database.obtemCriptoativo(criptoPar.idCriptoativoDestino)
        }, 
        listaCotacaoHistorico: async (criptoPar) => {
            return database.listaCotacaoHistorico({idCriptoPar: criptoPar.id})
        },
        listaMonitor: async (criptoPar) => {
            return database.listaMonitor({idCriptoPar: criptoPar.id})
        },
    },
    Criptoativo: {
        listaCriptoParDestino: async (criptoativo) => {
            return database.listaCriptoPar({idCriptoativoDestino: criptoativo.id})
        },
        listaCriptoParOrigem: async (criptoativo) => {
            return database.listaCriptoPar({idCriptoativoOrigem: criptoativo.id})
        },
    },
    Exchange: {
        listaCotacaoHistorico: async (exchange) => {
            return database.listaCotacaoHistorico({idExchange: exchange.id})
        },
    },
    Menu: {
        menuPai: async (menu) => {
             return await database.obtemMenu(menu.idMenuPai)
        }, 
        listaMenu: async (menu) => {
            return database.listaMenu({idMenuPai: menu.id})
        },
        listaRoleMenu: async (menu) => {
            return database.listaRoleMenu({idMenu: menu.id})
        },
    },
    Monitor: {
        criptoPar: async (monitor) => {
             return await database.obtemCriptoPar(monitor.idCriptoPar)
        }, 
        listaMonitorUsuario: async (monitor) => {
            return database.listaMonitorUsuario({idMonitor: monitor.id})
        },
    },
    MonitorUsuario: {
        monitor: async (monitorUsuario) => {
             return await database.obtemMonitor(monitorUsuario.idMonitor)
        }, 
        usuario: async (monitorUsuario) => {
             return await database.obtemUsuario(monitorUsuario.idUsuario)
        }, 
    },
    Role: {
        listaRoleMenu: async (role) => {
            return database.listaRoleMenu({idRole: role.id})
        },
        listaRoleUsuario: async (role) => {
            return database.listaRoleUsuario({idRole: role.id})
        },
    },
    RoleMenu: {
        role: async (roleMenu) => {
             return await database.obtemRole(roleMenu.idRole)
        }, 
        menu: async (roleMenu) => {
             return await database.obtemMenu(roleMenu.idMenu)
        }, 
    },
    RoleUsuario: {
        role: async (roleUsuario) => {
             return await database.obtemRole(roleUsuario.idRole)
        }, 
        usuario: async (roleUsuario) => {
             return await database.obtemUsuario(roleUsuario.idUsuario)
        }, 
    },
    Usuario: {
        listaMonitorUsuario: async (usuario) => {
            return database.listaMonitorUsuario({idUsuario: usuario.id})
        },
        listaRoleUsuario: async (usuario) => {
            return database.listaRoleUsuario({idUsuario: usuario.id})
        },
    },
    UsuarioTelegram: {
    },
Mutation: {
        insereArquivo: async (obj, args, ctx) => {
            return await database.insereArquivo({sha1: args.sha1, tamanho: args.tamanho, nome: args.nome, ativo: args.ativo})
        },
        atualizaArquivo: async (obj, args, ctx) => {
            return await database.atualizaArquivo({id: args.id, sha1: args.sha1, tamanho: args.tamanho, nome: args.nome, ativo: args.ativo})
        },
        excluiArquivo: async (obj, args, ctx) => {
            return await database.excluiArquivo(args.id)
        },
        insereCotacaoHistorico: async (obj, args, ctx) => {
            return await database.insereCotacaoHistorico({idExchange: args.idExchange, idCriptoPar: args.idCriptoPar, tempo: args.tempo, ativo: args.ativo})
        },
        atualizaCotacaoHistorico: async (obj, args, ctx) => {
            return await database.atualizaCotacaoHistorico({id: args.id, idExchange: args.idExchange, idCriptoPar: args.idCriptoPar, tempo: args.tempo, ativo: args.ativo})
        },
        excluiCotacaoHistorico: async (obj, args, ctx) => {
            return await database.excluiCotacaoHistorico(args.id)
        },
        insereCotacaoHistoricoValor: async (obj, args, ctx) => {
            return await database.insereCotacaoHistoricoValor({idCotacaoHistorico: args.idCotacaoHistorico, dataHora: util.converteStringParaDataHora(args.dataHora), open: args.open, close: args.close, high: args.high, low: args.low, volume: args.volume, quoteVolume: args.quoteVolume, closeTime: util.converteStringParaDataHora(args.closeTime), numTrades: args.numTrades, ativo: args.ativo})
        },
        atualizaCotacaoHistoricoValor: async (obj, args, ctx) => {
            return await database.atualizaCotacaoHistoricoValor({id: args.id, idCotacaoHistorico: args.idCotacaoHistorico, dataHora: util.converteStringParaDataHora(args.dataHora), open: args.open, close: args.close, high: args.high, low: args.low, volume: args.volume, quoteVolume: args.quoteVolume, closeTime: util.converteStringParaDataHora(args.closeTime), numTrades: args.numTrades, ativo: args.ativo})
        },
        excluiCotacaoHistoricoValor: async (obj, args, ctx) => {
            return await database.excluiCotacaoHistoricoValor(args.id)
        },
        insereCriptoPar: async (obj, args, ctx) => {
            return await database.insereCriptoPar({idCriptoativoOrigem: args.idCriptoativoOrigem, idCriptoativoDestino: args.idCriptoativoDestino, simbolo: args.simbolo, ativo: args.ativo})
        },
        atualizaCriptoPar: async (obj, args, ctx) => {
            return await database.atualizaCriptoPar({id: args.id, idCriptoativoOrigem: args.idCriptoativoOrigem, idCriptoativoDestino: args.idCriptoativoDestino, simbolo: args.simbolo, ativo: args.ativo})
        },
        excluiCriptoPar: async (obj, args, ctx) => {
            return await database.excluiCriptoPar(args.id)
        },
        insereCriptoativo: async (obj, args, ctx) => {
            return await database.insereCriptoativo({nome: args.nome, simbolo: args.simbolo, ativo: args.ativo})
        },
        atualizaCriptoativo: async (obj, args, ctx) => {
            return await database.atualizaCriptoativo({id: args.id, nome: args.nome, simbolo: args.simbolo, ativo: args.ativo})
        },
        excluiCriptoativo: async (obj, args, ctx) => {
            return await database.excluiCriptoativo(args.id)
        },
        insereExchange: async (obj, args, ctx) => {
            return await database.insereExchange({nome: args.nome, ativo: args.ativo})
        },
        atualizaExchange: async (obj, args, ctx) => {
            return await database.atualizaExchange({id: args.id, nome: args.nome, ativo: args.ativo})
        },
        excluiExchange: async (obj, args, ctx) => {
            return await database.excluiExchange(args.id)
        },
        insereMenu: async (obj, args, ctx) => {
            return await database.insereMenu({descricao: args.descricao, formulario: args.formulario, idMenuPai: args.idMenuPai, ordem: args.ordem, ativo: args.ativo})
        },
        atualizaMenu: async (obj, args, ctx) => {
            return await database.atualizaMenu({id: args.id, descricao: args.descricao, formulario: args.formulario, idMenuPai: args.idMenuPai, ordem: args.ordem, ativo: args.ativo})
        },
        excluiMenu: async (obj, args, ctx) => {
            return await database.excluiMenu(args.id)
        },
        insereMonitor: async (obj, args, ctx) => {
            return await database.insereMonitor({estrategia: args.estrategia, idCriptoPar: args.idCriptoPar, params: args.params, tempo: args.tempo, ativo: args.ativo})
        },
        atualizaMonitor: async (obj, args, ctx) => {
            return await database.atualizaMonitor({id: args.id, estrategia: args.estrategia, idCriptoPar: args.idCriptoPar, params: args.params, tempo: args.tempo, ativo: args.ativo})
        },
        excluiMonitor: async (obj, args, ctx) => {
            return await database.excluiMonitor(args.id)
        },
        insereMonitorUsuario: async (obj, args, ctx) => {
            return await database.insereMonitorUsuario({idMonitor: args.idMonitor, idUsuario: args.idUsuario, ativo: args.ativo})
        },
        atualizaMonitorUsuario: async (obj, args, ctx) => {
            return await database.atualizaMonitorUsuario({id: args.id, idMonitor: args.idMonitor, idUsuario: args.idUsuario, ativo: args.ativo})
        },
        excluiMonitorUsuario: async (obj, args, ctx) => {
            return await database.excluiMonitorUsuario(args.id)
        },
        insereRole: async (obj, args, ctx) => {
            return await database.insereRole({descRole: args.descRole, role: args.role, ativo: args.ativo})
        },
        atualizaRole: async (obj, args, ctx) => {
            return await database.atualizaRole({id: args.id, descRole: args.descRole, role: args.role, ativo: args.ativo})
        },
        excluiRole: async (obj, args, ctx) => {
            return await database.excluiRole(args.id)
        },
        insereRoleMenu: async (obj, args, ctx) => {
            return await database.insereRoleMenu({idRole: args.idRole, idMenu: args.idMenu, tipoAcesso: args.tipoAcesso, ativo: args.ativo})
        },
        atualizaRoleMenu: async (obj, args, ctx) => {
            return await database.atualizaRoleMenu({id: args.id, idRole: args.idRole, idMenu: args.idMenu, tipoAcesso: args.tipoAcesso, ativo: args.ativo})
        },
        excluiRoleMenu: async (obj, args, ctx) => {
            return await database.excluiRoleMenu(args.id)
        },
        insereRoleUsuario: async (obj, args, ctx) => {
            return await database.insereRoleUsuario({idRole: args.idRole, idUsuario: args.idUsuario, ativo: args.ativo})
        },
        atualizaRoleUsuario: async (obj, args, ctx) => {
            return await database.atualizaRoleUsuario({id: args.id, idRole: args.idRole, idUsuario: args.idUsuario, ativo: args.ativo})
        },
        excluiRoleUsuario: async (obj, args, ctx) => {
            return await database.excluiRoleUsuario(args.id)
        },
        insereUsuario: async (obj, args, ctx) => {
            return await database.insereUsuario({cpf: args.cpf, nomeUsuario: args.nomeUsuario, senha: args.senha, email: args.email, telegramChatId: args.telegramChatId, ativo: args.ativo})
        },
        atualizaUsuario: async (obj, args, ctx) => {
            return await database.atualizaUsuario({id: args.id, cpf: args.cpf, nomeUsuario: args.nomeUsuario, senha: args.senha, email: args.email, telegramChatId: args.telegramChatId, ativo: args.ativo})
        },
        excluiUsuario: async (obj, args, ctx) => {
            return await database.excluiUsuario(args.id)
        },
        insereUsuarioTelegram: async (obj, args, ctx) => {
            return await database.insereUsuarioTelegram({idUsuario: args.idUsuario, ativo: args.ativo})
        },
        atualizaUsuarioTelegram: async (obj, args, ctx) => {
            return await database.atualizaUsuarioTelegram({id: args.id, idUsuario: args.idUsuario, ativo: args.ativo})
        },
        excluiUsuarioTelegram: async (obj, args, ctx) => {
            return await database.excluiUsuarioTelegram(args.id)
        },
    }
}