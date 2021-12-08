import { DbConnectionMysql, DbQueryResult, DbInsertResult, DbUpdateResult } from "./mysql"
import { Arquivo, CotacaoHistorico, CotacaoHistoricoValor, CriptoPar, Criptoativo, Exchange, Menu, Monitor, MonitorUsuario, Role, RoleMenu, RoleUsuario, Usuario, UsuarioTelegram, ParamListaArquivo, ParamListaCotacaoHistorico, ParamListaCotacaoHistoricoValor, ParamListaCriptoPar, ParamListaCriptoativo, ParamListaExchange, ParamListaMenu, ParamListaMonitor, ParamListaMonitorUsuario, ParamListaRole, ParamListaRoleMenu, ParamListaRoleUsuario, ParamListaUsuario, ParamListaUsuarioTelegram } from './model' 

interface CondicaoId {
    id: number
    coluna: string
}
  
interface Extra {
    tipo: string
    valor: any
    condicao?: string
    coluna?: string
}

interface Join {
    sql: string
    parametros?: any[]
}

interface ParamLista {
    id: CondicaoId
    fk: CondicaoId[]
    join: Join[]
    extra: Extra[]
}

export class DatabaseBase {

    protected db: DbConnectionMysql

    public constructor(dbConnection: DbConnectionMysql) {
        this.db = dbConnection
    }

    public async queryLista(query: string, params: ParamLista): Promise<DbQueryResult> {
        if (params.id && params.id.id)  {
            return await this.db.query(`${query} WHERE ${params.id.coluna} = ?`, [params.id.id])
        } else {
            const p = []
            query += ' '
            // JOIN
            if (params.join.length > 0){
                const join = params.join.map(
                    j => {
                        if (j.parametros.some(p => p === undefined)) return;
                        if (j.parametros.length > 0) {
                            p.push(...j.parametros)
                        }
                        return "JOIN " + j.sql
                    }
                ).join(' ')
                if (join) {
                    query += join + ' '
                }
            }
            query += "WHERE p.ativo = 'V' AND "
            // WHERE 
            if (params.fk.length > 0) {
                const where = params.fk.filter(f => f.id).map(e => {
                    p.push(e.id)
                    return e.coluna + ' = ?'
                }).join(' AND ')
                if (where) {
                    query += where + ' AND '
                }
            }
            if (params.extra.length > 0) {
                const likes = params.extra.filter(a => a.tipo === 'like')
                if (likes.length > 0) {
                    const where = likes.filter(l => l.valor).map(l => {
                        p.push('%'+l.valor+'%')
                        return l.coluna + ' LIKE ?'
                    }).join(' AND ') 
                    if (where) {
                        query += where + ' AND '
                    }
                }
                const comparison = params.extra.filter(e => e.tipo === 'comparison')
                if (comparison.length > 0) {
                    const where = comparison.filter(c => c.valor).map(
                        c => {
                            p.push(c.valor)
                            return c.coluna + ' ' + c.condicao + ' ?'
                        }
                    ).join(' AND ')
                    if (where) {
                        query += where + ' AND '
                    }
                }
            }
            query += '1 '
            // ORDER, GROUP, LIMIT
            if (params.extra.length > 0) {
                const group = params.extra.find(e => e.tipo === 'group')
                if (group) {
                    query += 'GROUP BY ' + group.valor + ' '
                }
                const order = params.extra.find(a => a.tipo === 'order')
                if (order) {
                    query += 'ORDER BY ' + order.valor + ' '
                }
                const limit = params.extra.find(e => e.tipo === 'limit')
                if (limit) {
                    query += 'LIMIT ' + limit.valor + ' '
                }
            }
            return await this.db.query(query,p)
        }
    }

    public async listaArquivo(params: ParamListaArquivo = {}): Promise<Arquivo[]> {
        const resultado =  await this.queryLista("SELECT p.* FROM arquivo p", {
            id: {id: params.id, coluna: 'id_arquivo'},
            fk: [],
            join: [],
            extra: []
        })
        const resp = []
        for (const data of resultado.results) {
            resp.push(this.criaRegistroArquivo(data))
        }
        return resp
    }

    public async obtemArquivo(id: number): Promise<Arquivo> {
        var resultado = await this.db.query("select * from arquivo where ativo='V' and id_arquivo=? order by id_arquivo", [id])
        if (resultado.results.length == 0) {
            return null
        } else {
            return this.criaRegistroArquivo(resultado.results[0])
        }
    }

    protected criaRegistroArquivo(data: any): Arquivo {
        return {
            id: data.id_arquivo,
            sha1: data.sha1,
            tamanho: data.tamanho,
            nome: data.nome,
            ativo: data.ativo === null ? null : data.ativo === "V",
        }
    }

    public async insereArquivo(arquivo: Arquivo): Promise<DbInsertResult>  {	
        try {
            const resp = await this.db.insert("insert into arquivo (sha1, tamanho, nome, ativo) values (?, ?, ?, ?)", [arquivo.sha1, arquivo.tamanho, arquivo.nome, this.corrigeParamBoolInsercao(arquivo.ativo)])
            return resp
        } catch (e) {
            return e
        }
    }

    public async atualizaArquivo(arquivo: Arquivo): Promise<DbUpdateResult> {
        try {
            const resp = await this.db.update("update arquivo set ? where id_arquivo=?", this.criaParametrosAtualizacao(arquivo))
            return resp
        } catch (e) {
            return e
        }
    }

    public async excluiArquivo(idArquivo: number): Promise<DbUpdateResult> {
        try {
            const resp = await this.db.update("update arquivo set ativo = 'F' where id_arquivo = ?", [idArquivo])
            return resp
        } catch (e) {
            return e
        }
    }

    public async listaCotacaoHistorico(params: ParamListaCotacaoHistorico = {}): Promise<CotacaoHistorico[]> {
        const resultado =  await this.queryLista("SELECT p.* FROM cotacao_historico p", {
            id: {id: params.id, coluna: 'id_cotacao_historico'},
            fk: [{id: params.idExchange, coluna: 'p.id_exchange'}, {id: params.idCriptoPar, coluna: 'p.id_cripto_par'}, ],
            join: [],
            extra: []
        })
        const resp = []
        for (const data of resultado.results) {
            resp.push(this.criaRegistroCotacaoHistorico(data))
        }
        return resp
    }

    public async obtemCotacaoHistorico(id: number): Promise<CotacaoHistorico> {
        var resultado = await this.db.query("select * from cotacao_historico where ativo='V' and id_cotacao_historico=? order by id_cotacao_historico", [id])
        if (resultado.results.length == 0) {
            return null
        } else {
            return this.criaRegistroCotacaoHistorico(resultado.results[0])
        }
    }

    protected criaRegistroCotacaoHistorico(data: any): CotacaoHistorico {
        return {
            id: data.id_cotacao_historico,
            idExchange: data.id_exchange,
            idCriptoPar: data.id_cripto_par,
            tempo: data.tempo,
            ativo: data.ativo === null ? null : data.ativo === "V",
        }
    }

    public async insereCotacaoHistorico(cotacaoHistorico: CotacaoHistorico): Promise<DbInsertResult>  {	
        try {
            const resp = await this.db.insert("insert into cotacao_historico (id_exchange, id_cripto_par, tempo, ativo) values (?, ?, ?, ?)", [cotacaoHistorico.idExchange, cotacaoHistorico.idCriptoPar, cotacaoHistorico.tempo, this.corrigeParamBoolInsercao(cotacaoHistorico.ativo)])
            return resp
        } catch (e) {
            return e
        }
    }

    public async atualizaCotacaoHistorico(cotacaoHistorico: CotacaoHistorico): Promise<DbUpdateResult> {
        try {
            const resp = await this.db.update("update cotacao_historico set ? where id_cotacao_historico=?", this.criaParametrosAtualizacao(cotacaoHistorico))
            return resp
        } catch (e) {
            return e
        }
    }

    public async excluiCotacaoHistorico(idCotacaoHistorico: number): Promise<DbUpdateResult> {
        try {
            const resp = await this.db.update("update cotacao_historico set ativo = 'F' where id_cotacao_historico = ?", [idCotacaoHistorico])
            return resp
        } catch (e) {
            return e
        }
    }

    public async listaCotacaoHistoricoValor(params: ParamListaCotacaoHistoricoValor = {}): Promise<CotacaoHistoricoValor[]> {
        const resultado =  await this.queryLista("SELECT p.* FROM cotacao_historico_valor p", {
            id: {id: params.id, coluna: 'id_cotacao_historico_valor'},
            fk: [{id: params.idCotacaoHistorico, coluna: 'p.id_cotacao_historico'}, ],
            join: [],
            extra: []
        })
        const resp = []
        for (const data of resultado.results) {
            resp.push(this.criaRegistroCotacaoHistoricoValor(data))
        }
        return resp
    }

    public async obtemCotacaoHistoricoValor(id: number): Promise<CotacaoHistoricoValor> {
        var resultado = await this.db.query("select * from cotacao_historico_valor where ativo='V' and id_cotacao_historico_valor=? order by id_cotacao_historico_valor", [id])
        if (resultado.results.length == 0) {
            return null
        } else {
            return this.criaRegistroCotacaoHistoricoValor(resultado.results[0])
        }
    }

    protected criaRegistroCotacaoHistoricoValor(data: any): CotacaoHistoricoValor {
        return {
            id: data.id_cotacao_historico_valor,
            idCotacaoHistorico: data.id_cotacao_historico,
            dataHora: data.data_hora,
            open: data.open,
            close: data.close,
            high: data.high,
            low: data.low,
            volume: data.volume,
            quoteVolume: data.quote_volume,
            closeTime: data.close_time,
            numTrades: data.num_trades,
            ativo: data.ativo === null ? null : data.ativo === "V",
        }
    }

    public async insereCotacaoHistoricoValor(cotacaoHistoricoValor: CotacaoHistoricoValor): Promise<DbInsertResult>  {	
        try {
            const resp = await this.db.insert("insert into cotacao_historico_valor (id_cotacao_historico, data_hora, open, close, high, low, volume, quote_volume, close_time, num_trades, ativo) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [cotacaoHistoricoValor.idCotacaoHistorico, cotacaoHistoricoValor.dataHora, cotacaoHistoricoValor.open, cotacaoHistoricoValor.close, cotacaoHistoricoValor.high, cotacaoHistoricoValor.low, cotacaoHistoricoValor.volume, cotacaoHistoricoValor.quoteVolume, cotacaoHistoricoValor.closeTime, cotacaoHistoricoValor.numTrades, this.corrigeParamBoolInsercao(cotacaoHistoricoValor.ativo)])
            return resp
        } catch (e) {
            return e
        }
    }

    public async atualizaCotacaoHistoricoValor(cotacaoHistoricoValor: CotacaoHistoricoValor): Promise<DbUpdateResult> {
        try {
            const resp = await this.db.update("update cotacao_historico_valor set ? where id_cotacao_historico_valor=?", this.criaParametrosAtualizacao(cotacaoHistoricoValor))
            return resp
        } catch (e) {
            return e
        }
    }

    public async excluiCotacaoHistoricoValor(idCotacaoHistoricoValor: number): Promise<DbUpdateResult> {
        try {
            const resp = await this.db.update("update cotacao_historico_valor set ativo = 'F' where id_cotacao_historico_valor = ?", [idCotacaoHistoricoValor])
            return resp
        } catch (e) {
            return e
        }
    }

    public async listaCriptoPar(params: ParamListaCriptoPar = {}): Promise<CriptoPar[]> {
        const resultado =  await this.queryLista("SELECT p.* FROM cripto_par p", {
            id: {id: params.id, coluna: 'id_cripto_par'},
            fk: [{id: params.idCriptoativoOrigem, coluna: 'p.id_criptoativo_origem'}, {id: params.idCriptoativoDestino, coluna: 'p.id_criptoativo_destino'}, ],
            join: [],
            extra: []
        })
        const resp = []
        for (const data of resultado.results) {
            resp.push(this.criaRegistroCriptoPar(data))
        }
        return resp
    }

    public async obtemCriptoPar(id: number): Promise<CriptoPar> {
        var resultado = await this.db.query("select * from cripto_par where ativo='V' and id_cripto_par=? order by id_cripto_par", [id])
        if (resultado.results.length == 0) {
            return null
        } else {
            return this.criaRegistroCriptoPar(resultado.results[0])
        }
    }

    protected criaRegistroCriptoPar(data: any): CriptoPar {
        return {
            id: data.id_cripto_par,
            idCriptoativoOrigem: data.id_criptoativo_origem,
            idCriptoativoDestino: data.id_criptoativo_destino,
            simbolo: data.simbolo,
            ativo: data.ativo === null ? null : data.ativo === "V",
        }
    }

    public async insereCriptoPar(criptoPar: CriptoPar): Promise<DbInsertResult>  {	
        try {
            const resp = await this.db.insert("insert into cripto_par (id_criptoativo_origem, id_criptoativo_destino, simbolo, ativo) values (?, ?, ?, ?)", [criptoPar.idCriptoativoOrigem, criptoPar.idCriptoativoDestino, criptoPar.simbolo, this.corrigeParamBoolInsercao(criptoPar.ativo)])
            return resp
        } catch (e) {
            return e
        }
    }

    public async atualizaCriptoPar(criptoPar: CriptoPar): Promise<DbUpdateResult> {
        try {
            const resp = await this.db.update("update cripto_par set ? where id_cripto_par=?", this.criaParametrosAtualizacao(criptoPar))
            return resp
        } catch (e) {
            return e
        }
    }

    public async excluiCriptoPar(idCriptoPar: number): Promise<DbUpdateResult> {
        try {
            const resp = await this.db.update("update cripto_par set ativo = 'F' where id_cripto_par = ?", [idCriptoPar])
            return resp
        } catch (e) {
            return e
        }
    }

    public async listaCriptoativo(params: ParamListaCriptoativo = {}): Promise<Criptoativo[]> {
        const resultado =  await this.queryLista("SELECT p.* FROM criptoativo p", {
            id: {id: params.id, coluna: 'id_criptoativo'},
            fk: [],
            join: [],
            extra: []
        })
        const resp = []
        for (const data of resultado.results) {
            resp.push(this.criaRegistroCriptoativo(data))
        }
        return resp
    }

    public async obtemCriptoativo(id: number): Promise<Criptoativo> {
        var resultado = await this.db.query("select * from criptoativo where ativo='V' and id_criptoativo=? order by id_criptoativo", [id])
        if (resultado.results.length == 0) {
            return null
        } else {
            return this.criaRegistroCriptoativo(resultado.results[0])
        }
    }

    protected criaRegistroCriptoativo(data: any): Criptoativo {
        return {
            id: data.id_criptoativo,
            nome: data.nome,
            simbolo: data.simbolo,
            ativo: data.ativo === null ? null : data.ativo === "V",
        }
    }

    public async insereCriptoativo(criptoativo: Criptoativo): Promise<DbInsertResult>  {	
        try {
            const resp = await this.db.insert("insert into criptoativo (nome, simbolo, ativo) values (?, ?, ?)", [criptoativo.nome, criptoativo.simbolo, this.corrigeParamBoolInsercao(criptoativo.ativo)])
            return resp
        } catch (e) {
            return e
        }
    }

    public async atualizaCriptoativo(criptoativo: Criptoativo): Promise<DbUpdateResult> {
        try {
            const resp = await this.db.update("update criptoativo set ? where id_criptoativo=?", this.criaParametrosAtualizacao(criptoativo))
            return resp
        } catch (e) {
            return e
        }
    }

    public async excluiCriptoativo(idCriptoativo: number): Promise<DbUpdateResult> {
        try {
            const resp = await this.db.update("update criptoativo set ativo = 'F' where id_criptoativo = ?", [idCriptoativo])
            return resp
        } catch (e) {
            return e
        }
    }

    public async listaExchange(params: ParamListaExchange = {}): Promise<Exchange[]> {
        const resultado =  await this.queryLista("SELECT p.* FROM exchange p", {
            id: {id: params.id, coluna: 'id_exchange'},
            fk: [],
            join: [],
            extra: []
        })
        const resp = []
        for (const data of resultado.results) {
            resp.push(this.criaRegistroExchange(data))
        }
        return resp
    }

    public async obtemExchange(id: number): Promise<Exchange> {
        var resultado = await this.db.query("select * from exchange where ativo='V' and id_exchange=? order by id_exchange", [id])
        if (resultado.results.length == 0) {
            return null
        } else {
            return this.criaRegistroExchange(resultado.results[0])
        }
    }

    protected criaRegistroExchange(data: any): Exchange {
        return {
            id: data.id_exchange,
            nome: data.nome,
            ativo: data.ativo === null ? null : data.ativo === "V",
        }
    }

    public async insereExchange(exchange: Exchange): Promise<DbInsertResult>  {	
        try {
            const resp = await this.db.insert("insert into exchange (nome, ativo) values (?, ?)", [exchange.nome, this.corrigeParamBoolInsercao(exchange.ativo)])
            return resp
        } catch (e) {
            return e
        }
    }

    public async atualizaExchange(exchange: Exchange): Promise<DbUpdateResult> {
        try {
            const resp = await this.db.update("update exchange set ? where id_exchange=?", this.criaParametrosAtualizacao(exchange))
            return resp
        } catch (e) {
            return e
        }
    }

    public async excluiExchange(idExchange: number): Promise<DbUpdateResult> {
        try {
            const resp = await this.db.update("update exchange set ativo = 'F' where id_exchange = ?", [idExchange])
            return resp
        } catch (e) {
            return e
        }
    }

    public async listaMenu(params: ParamListaMenu = {}): Promise<Menu[]> {
        const resultado =  await this.queryLista("SELECT p.* FROM menu p", {
            id: {id: params.id, coluna: 'id_menu'},
            fk: [{id: params.idMenuPai, coluna: 'p.id_menu_pai'}, ],
            join: [],
            extra: []
        })
        const resp = []
        for (const data of resultado.results) {
            resp.push(this.criaRegistroMenu(data))
        }
        return resp
    }

    public async obtemMenu(id: number): Promise<Menu> {
        var resultado = await this.db.query("select * from menu where ativo='V' and id_menu=? order by id_menu", [id])
        if (resultado.results.length == 0) {
            return null
        } else {
            return this.criaRegistroMenu(resultado.results[0])
        }
    }

    protected criaRegistroMenu(data: any): Menu {
        return {
            id: data.id_menu,
            descricao: data.descricao,
            formulario: data.formulario,
            idMenuPai: data.id_menu_pai,
            ordem: data.ordem,
            ativo: data.ativo === null ? null : data.ativo === "V",
        }
    }

    public async insereMenu(menu: Menu): Promise<DbInsertResult>  {	
        try {
            const resp = await this.db.insert("insert into menu (descricao, formulario, id_menu_pai, ordem, ativo) values (?, ?, ?, ?, ?)", [menu.descricao, menu.formulario, menu.idMenuPai, menu.ordem, this.corrigeParamBoolInsercao(menu.ativo)])
            return resp
        } catch (e) {
            return e
        }
    }

    public async atualizaMenu(menu: Menu): Promise<DbUpdateResult> {
        try {
            const resp = await this.db.update("update menu set ? where id_menu=?", this.criaParametrosAtualizacao(menu))
            return resp
        } catch (e) {
            return e
        }
    }

    public async excluiMenu(idMenu: number): Promise<DbUpdateResult> {
        try {
            const resp = await this.db.update("update menu set ativo = 'F' where id_menu = ?", [idMenu])
            return resp
        } catch (e) {
            return e
        }
    }

    public async listaMonitor(params: ParamListaMonitor = {}): Promise<Monitor[]> {
        const resultado =  await this.queryLista("SELECT p.* FROM monitor p", {
            id: {id: params.id, coluna: 'id_monitor'},
            fk: [{id: params.idCriptoPar, coluna: 'p.id_cripto_par'}, ],
            join: [],
            extra: []
        })
        const resp = []
        for (const data of resultado.results) {
            resp.push(this.criaRegistroMonitor(data))
        }
        return resp
    }

    public async obtemMonitor(id: number): Promise<Monitor> {
        var resultado = await this.db.query("select * from monitor where ativo='V' and id_monitor=? order by id_monitor", [id])
        if (resultado.results.length == 0) {
            return null
        } else {
            return this.criaRegistroMonitor(resultado.results[0])
        }
    }

    protected criaRegistroMonitor(data: any): Monitor {
        return {
            id: data.id_monitor,
            estrategia: data.estrategia,
            idCriptoPar: data.id_cripto_par,
            params: data.params ? data.params.toString('utf-8') : null,
            tempo: data.tempo,
            ativo: data.ativo === null ? null : data.ativo === "V",
        }
    }

    public async insereMonitor(monitor: Monitor): Promise<DbInsertResult>  {	
        try {
            const resp = await this.db.insert("insert into monitor (estrategia, id_cripto_par, params, tempo, ativo) values (?, ?, ?, ?, ?)", [monitor.estrategia, monitor.idCriptoPar, monitor.params, monitor.tempo, this.corrigeParamBoolInsercao(monitor.ativo)])
            return resp
        } catch (e) {
            return e
        }
    }

    public async atualizaMonitor(monitor: Monitor): Promise<DbUpdateResult> {
        try {
            const resp = await this.db.update("update monitor set ? where id_monitor=?", this.criaParametrosAtualizacao(monitor))
            return resp
        } catch (e) {
            return e
        }
    }

    public async excluiMonitor(idMonitor: number): Promise<DbUpdateResult> {
        try {
            const resp = await this.db.update("update monitor set ativo = 'F' where id_monitor = ?", [idMonitor])
            return resp
        } catch (e) {
            return e
        }
    }

    public async listaMonitorUsuario(params: ParamListaMonitorUsuario = {}): Promise<MonitorUsuario[]> {
        const resultado =  await this.queryLista("SELECT p.* FROM monitor_usuario p", {
            id: {id: params.id, coluna: 'id_monitor_usuario'},
            fk: [{id: params.idMonitor, coluna: 'p.id_monitor'}, {id: params.idUsuario, coluna: 'p.id_usuario'}, ],
            join: [],
            extra: []
        })
        const resp = []
        for (const data of resultado.results) {
            resp.push(this.criaRegistroMonitorUsuario(data))
        }
        return resp
    }

    public async obtemMonitorUsuario(id: number): Promise<MonitorUsuario> {
        var resultado = await this.db.query("select * from monitor_usuario where ativo='V' and id_monitor_usuario=? order by id_monitor_usuario", [id])
        if (resultado.results.length == 0) {
            return null
        } else {
            return this.criaRegistroMonitorUsuario(resultado.results[0])
        }
    }

    protected criaRegistroMonitorUsuario(data: any): MonitorUsuario {
        return {
            id: data.id_monitor_usuario,
            idMonitor: data.id_monitor,
            idUsuario: data.id_usuario,
            ativo: data.ativo === null ? null : data.ativo === "V",
        }
    }

    public async insereMonitorUsuario(monitorUsuario: MonitorUsuario): Promise<DbInsertResult>  {	
        try {
            const resp = await this.db.insert("insert into monitor_usuario (id_monitor, id_usuario, ativo) values (?, ?, ?)", [monitorUsuario.idMonitor, monitorUsuario.idUsuario, this.corrigeParamBoolInsercao(monitorUsuario.ativo)])
            return resp
        } catch (e) {
            return e
        }
    }

    public async atualizaMonitorUsuario(monitorUsuario: MonitorUsuario): Promise<DbUpdateResult> {
        try {
            const resp = await this.db.update("update monitor_usuario set ? where id_monitor_usuario=?", this.criaParametrosAtualizacao(monitorUsuario))
            return resp
        } catch (e) {
            return e
        }
    }

    public async excluiMonitorUsuario(idMonitorUsuario: number): Promise<DbUpdateResult> {
        try {
            const resp = await this.db.update("update monitor_usuario set ativo = 'F' where id_monitor_usuario = ?", [idMonitorUsuario])
            return resp
        } catch (e) {
            return e
        }
    }

    public async listaRole(params: ParamListaRole = {}): Promise<Role[]> {
        const resultado =  await this.queryLista("SELECT p.* FROM role p", {
            id: {id: params.id, coluna: 'id_role'},
            fk: [],
            join: [],
            extra: []
        })
        const resp = []
        for (const data of resultado.results) {
            resp.push(this.criaRegistroRole(data))
        }
        return resp
    }

    public async obtemRole(id: number): Promise<Role> {
        var resultado = await this.db.query("select * from role where ativo='V' and id_role=? order by id_role", [id])
        if (resultado.results.length == 0) {
            return null
        } else {
            return this.criaRegistroRole(resultado.results[0])
        }
    }

    protected criaRegistroRole(data: any): Role {
        return {
            id: data.id_role,
            descRole: data.desc_role,
            role: data.role,
            ativo: data.ativo === null ? null : data.ativo === "V",
        }
    }

    public async insereRole(role: Role): Promise<DbInsertResult>  {	
        try {
            const resp = await this.db.insert("insert into role (desc_role, role, ativo) values (?, ?, ?)", [role.descRole, role.role, this.corrigeParamBoolInsercao(role.ativo)])
            return resp
        } catch (e) {
            return e
        }
    }

    public async atualizaRole(role: Role): Promise<DbUpdateResult> {
        try {
            const resp = await this.db.update("update role set ? where id_role=?", this.criaParametrosAtualizacao(role))
            return resp
        } catch (e) {
            return e
        }
    }

    public async excluiRole(idRole: number): Promise<DbUpdateResult> {
        try {
            const resp = await this.db.update("update role set ativo = 'F' where id_role = ?", [idRole])
            return resp
        } catch (e) {
            return e
        }
    }

    public async listaRoleMenu(params: ParamListaRoleMenu = {}): Promise<RoleMenu[]> {
        const resultado =  await this.queryLista("SELECT p.* FROM role_menu p", {
            id: {id: params.id, coluna: 'id_role_menu'},
            fk: [{id: params.idRole, coluna: 'p.id_role'}, {id: params.idMenu, coluna: 'p.id_menu'}, ],
            join: [],
            extra: []
        })
        const resp = []
        for (const data of resultado.results) {
            resp.push(this.criaRegistroRoleMenu(data))
        }
        return resp
    }

    public async obtemRoleMenu(id: number): Promise<RoleMenu> {
        var resultado = await this.db.query("select * from role_menu where ativo='V' and id_role_menu=? order by id_role_menu", [id])
        if (resultado.results.length == 0) {
            return null
        } else {
            return this.criaRegistroRoleMenu(resultado.results[0])
        }
    }

    protected criaRegistroRoleMenu(data: any): RoleMenu {
        return {
            id: data.id_role_menu,
            idRole: data.id_role,
            idMenu: data.id_menu,
            tipoAcesso: data.tipo_acesso,
            ativo: data.ativo === null ? null : data.ativo === "V",
        }
    }

    public async insereRoleMenu(roleMenu: RoleMenu): Promise<DbInsertResult>  {	
        try {
            const resp = await this.db.insert("insert into role_menu (id_role, id_menu, tipo_acesso, ativo) values (?, ?, ?, ?)", [roleMenu.idRole, roleMenu.idMenu, roleMenu.tipoAcesso, this.corrigeParamBoolInsercao(roleMenu.ativo)])
            return resp
        } catch (e) {
            return e
        }
    }

    public async atualizaRoleMenu(roleMenu: RoleMenu): Promise<DbUpdateResult> {
        try {
            const resp = await this.db.update("update role_menu set ? where id_role_menu=?", this.criaParametrosAtualizacao(roleMenu))
            return resp
        } catch (e) {
            return e
        }
    }

    public async excluiRoleMenu(idRoleMenu: number): Promise<DbUpdateResult> {
        try {
            const resp = await this.db.update("update role_menu set ativo = 'F' where id_role_menu = ?", [idRoleMenu])
            return resp
        } catch (e) {
            return e
        }
    }

    public async listaRoleUsuario(params: ParamListaRoleUsuario = {}): Promise<RoleUsuario[]> {
        const resultado =  await this.queryLista("SELECT p.* FROM role_usuario p", {
            id: {id: params.id, coluna: 'id_role_usuario'},
            fk: [{id: params.idRole, coluna: 'p.id_role'}, {id: params.idUsuario, coluna: 'p.id_usuario'}, ],
            join: [],
            extra: []
        })
        const resp = []
        for (const data of resultado.results) {
            resp.push(this.criaRegistroRoleUsuario(data))
        }
        return resp
    }

    public async obtemRoleUsuario(id: number): Promise<RoleUsuario> {
        var resultado = await this.db.query("select * from role_usuario where ativo='V' and id_role_usuario=? order by id_role_usuario", [id])
        if (resultado.results.length == 0) {
            return null
        } else {
            return this.criaRegistroRoleUsuario(resultado.results[0])
        }
    }

    protected criaRegistroRoleUsuario(data: any): RoleUsuario {
        return {
            id: data.id_role_usuario,
            idRole: data.id_role,
            idUsuario: data.id_usuario,
            ativo: data.ativo === null ? null : data.ativo === "V",
        }
    }

    public async insereRoleUsuario(roleUsuario: RoleUsuario): Promise<DbInsertResult>  {	
        try {
            const resp = await this.db.insert("insert into role_usuario (id_role, id_usuario, ativo) values (?, ?, ?)", [roleUsuario.idRole, roleUsuario.idUsuario, this.corrigeParamBoolInsercao(roleUsuario.ativo)])
            return resp
        } catch (e) {
            return e
        }
    }

    public async atualizaRoleUsuario(roleUsuario: RoleUsuario): Promise<DbUpdateResult> {
        try {
            const resp = await this.db.update("update role_usuario set ? where id_role_usuario=?", this.criaParametrosAtualizacao(roleUsuario))
            return resp
        } catch (e) {
            return e
        }
    }

    public async excluiRoleUsuario(idRoleUsuario: number): Promise<DbUpdateResult> {
        try {
            const resp = await this.db.update("update role_usuario set ativo = 'F' where id_role_usuario = ?", [idRoleUsuario])
            return resp
        } catch (e) {
            return e
        }
    }

    public async listaUsuario(params: ParamListaUsuario = {}): Promise<Usuario[]> {
        const resultado =  await this.queryLista("SELECT p.* FROM usuario p", {
            id: {id: params.id, coluna: 'id_usuario'},
            fk: [],
            join: [],
            extra: []
        })
        const resp = []
        for (const data of resultado.results) {
            resp.push(this.criaRegistroUsuario(data))
        }
        return resp
    }

    public async obtemUsuario(id: number): Promise<Usuario> {
        var resultado = await this.db.query("select * from usuario where ativo='V' and id_usuario=? order by id_usuario", [id])
        if (resultado.results.length == 0) {
            return null
        } else {
            return this.criaRegistroUsuario(resultado.results[0])
        }
    }

    protected criaRegistroUsuario(data: any): Usuario {
        return {
            id: data.id_usuario,
            cpf: data.cpf,
            nomeUsuario: data.nome_usuario,
            senha: data.senha,
            email: data.email,
            telegramChatId: data.telegram_chat_id,
            ativo: data.ativo === null ? null : data.ativo === "V",
        }
    }

    public async insereUsuario(usuario: Usuario): Promise<DbInsertResult>  {	
        try {
            const resp = await this.db.insert("insert into usuario (cpf, nome_usuario, senha, email, telegram_chat_id, ativo) values (?, ?, ?, ?, ?, ?)", [usuario.cpf, usuario.nomeUsuario, usuario.senha, usuario.email, usuario.telegramChatId, this.corrigeParamBoolInsercao(usuario.ativo)])
            return resp
        } catch (e) {
            return e
        }
    }

    public async atualizaUsuario(usuario: Usuario): Promise<DbUpdateResult> {
        try {
            const resp = await this.db.update("update usuario set ? where id_usuario=?", this.criaParametrosAtualizacao(usuario))
            return resp
        } catch (e) {
            return e
        }
    }

    public async excluiUsuario(idUsuario: number): Promise<DbUpdateResult> {
        try {
            const resp = await this.db.update("update usuario set ativo = 'F' where id_usuario = ?", [idUsuario])
            return resp
        } catch (e) {
            return e
        }
    }

    public async listaUsuarioTelegram(params: ParamListaUsuarioTelegram = {}): Promise<UsuarioTelegram[]> {
        const resultado =  await this.queryLista("SELECT p.* FROM usuario_telegram p", {
            id: {id: params.id, coluna: 'id_usuario_telegram'},
            fk: [],
            join: [],
            extra: []
        })
        const resp = []
        for (const data of resultado.results) {
            resp.push(this.criaRegistroUsuarioTelegram(data))
        }
        return resp
    }

    public async obtemUsuarioTelegram(id: number): Promise<UsuarioTelegram> {
        var resultado = await this.db.query("select * from usuario_telegram where ativo='V' and id_usuario_telegram=? order by id_usuario_telegram", [id])
        if (resultado.results.length == 0) {
            return null
        } else {
            return this.criaRegistroUsuarioTelegram(resultado.results[0])
        }
    }

    protected criaRegistroUsuarioTelegram(data: any): UsuarioTelegram {
        return {
            id: data.id_usuario_telegram,
            idUsuario: data.id_usuario,
            ativo: data.ativo === null ? null : data.ativo === "V",
        }
    }

    public async insereUsuarioTelegram(usuarioTelegram: UsuarioTelegram): Promise<DbInsertResult>  {	
        try {
            const resp = await this.db.insert("insert into usuario_telegram (id_usuario, ativo) values (?, ?)", [usuarioTelegram.idUsuario, this.corrigeParamBoolInsercao(usuarioTelegram.ativo)])
            return resp
        } catch (e) {
            return e
        }
    }

    public async atualizaUsuarioTelegram(usuarioTelegram: UsuarioTelegram): Promise<DbUpdateResult> {
        try {
            const resp = await this.db.update("update usuario_telegram set ? where id_usuario_telegram=?", this.criaParametrosAtualizacao(usuarioTelegram))
            return resp
        } catch (e) {
            return e
        }
    }

    public async excluiUsuarioTelegram(idUsuarioTelegram: number): Promise<DbUpdateResult> {
        try {
            const resp = await this.db.update("update usuario_telegram set ativo = 'F' where id_usuario_telegram = ?", [idUsuarioTelegram])
            return resp
        } catch (e) {
            return e
        }
    }

    public criaParametrosAtualizacao(element: any): any[] {
        const obj = {};
        Object.keys(element).filter(k => element[k] !== undefined && k !== "id").forEach(k => {
            const p = k.replace(/[A-Z]/g, l => "_"+l.toLowerCase());
            if (typeof element[k] === "boolean") {
                obj[p] = element[k] ? 'V' : 'F'
            } else {
                obj[p] = element[k];
            }
        });
        return [obj, element.id]
    }

    public corrigeParamBoolInsercao(value: any): any {
        if (value === undefined || value === null) {
            return value
        }
        return value ? 'V' : 'F'
    }
}