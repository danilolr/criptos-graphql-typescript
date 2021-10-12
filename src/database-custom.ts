import { DatabaseBase } from "./gen/database"
import { CotacaoHistoricoValor, Menu, RoleMenu, RoleUsuario } from "./gen/model"
import { DbUpdateResult } from "./gen/mysql"

export class Database extends DatabaseBase {

    async obtemUsuarioPorEmail(email) {
        var resultado = await this.db.query("select * from usuario where ativo='V' and email=?", [email])
        if (resultado.results.length == 0) {
            return null
        }
        return this.criaRegistroUsuario(resultado.results[0])
    }

    async obtemRoles(idUsuario) {
        var resultado = await this.db.query("select r.codigo from role_usuario ru, role r where ru.id_usuario=? and ru.id_role=r.id_role and ru.ativo='V' and r.ativo='V'", [idUsuario])
        const resp = []
        for (var data of resultado.results) {
            resp.push(data.codigo)
        }
        return resp
    }

    async obtemRolesUsuario(idUsuario: number): Promise<string[]> {
        var resultado = await this.db.query("select distinct r.desc_role from role_usuario ru join role r on r.id_role = ru.id_role where ru.id_usuario = ?", [idUsuario])
        const resp = []
        for (var data of resultado.results) {
            resp.push(data.desc_role)
        }
        return resp
    }

    async obtemMenusUsuario(idUsuario: number): Promise<Menu[]> {
        var resultado = await this.db.query("select distinct m.* from role_menu rm join menu m on m.id_menu = rm.id_menu where rm.id_role in (select distinct id_role from role_usuario where id_usuario = ?) and rm.ativo = 'V' order by ordem", [idUsuario])
        const resp = []
        for (const data of resultado.results) {
            resp.push(this.criaRegistroMenu(data))
        }
        return resp
    }

    async desativarMenusRole(idRole: number): Promise<DbUpdateResult> {
        return await this.db.update("update role_menu set ativo = 'F' where id_role = ?", [idRole])
    }

    async desativarRoleUsuario(idUsuario: number): Promise<DbUpdateResult> {
        return await this.db.update("update role_usuario set ativo = 'F' where id_usuario = ?", [idUsuario])
    }

    async obtemRoleMenuComIds(idRole: number, idMenu: number): Promise<RoleMenu> {
        var resultado = await this.db.query("select * from role_menu where id_role=? and id_menu=?", [idRole, idMenu])
        if (resultado.results.length == 0) {
            return null
        } else {
            return this.criaRegistroRoleMenu(resultado.results[0])
        }
    }

    public async obtemRoleUsuarioComIds(idRole: number, idUsuario): Promise<RoleUsuario> {
        var resultado = await this.db.query("select * from role_usuario where id_role=? and id_usuario=? ", [idRole, idUsuario])
        if (resultado.results.length == 0) {
            return null
        } else {
            return this.criaRegistroRoleUsuario(resultado.results[0])
        }
    }

    async obtemHistorico(idCotacaoHistorico: string): Promise<CotacaoHistoricoValor[]> {
        const resultado = await this.db.query("select * from cotacao_historico_valor where id_cotacao_historico=? order by data_hora", [idCotacaoHistorico])
        const resp = []
        for (const data of resultado.results) {
            resp.push(this.criaRegistroCotacaoHistoricoValor(data))
        }
        return resp
    }

    async obtemUltimaDataIndicador(idCotacaoHistorico: number): Promise<Date> {
        var resultado = await this.db.query("select max(data_hora) as dt from cotacao_historico_valor where id_cotacao_historico=?", [idCotacaoHistorico])
        return resultado.results[0]['dt']
    }

}