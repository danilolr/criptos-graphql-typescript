import { Database } from "../database-custom";
import { Role, RoleMenu } from "../gen/model";

export interface RoleM extends Role {
    menus: {
        id: number,
        tipoAcesso: string
    }[]
}

export interface RetornoInserirEditarRole {
    ok: boolean
    id?: number
    msg?: string
}

export class RoleService {

    constructor(private database: Database) { }

    public async inserirRole(role: RoleM): Promise<RetornoInserirEditarRole> {
        const resp = await this.database.insereRole({
            descRole: role.descRole,
            ativo: true,
            role: role.role
        })
        if (!resp.ok) {
            return {
                ok: false,
                msg: "Erro ao inserir role"
            }
        }
        for (const m of role.menus) {
            await this.database.insereRoleMenu({
                idRole: resp.id,
                ativo: true,
                idMenu: m.id,
                tipoAcesso: m.tipoAcesso
            })
        }
        return {
            ok: true,
            id: resp.id
        }
    }

    public async atualizarRole(role: RoleM): Promise<RetornoInserirEditarRole> {
        const resp = await this.database.atualizaRole({
            id: role.id,
            descRole: role.descRole,
            ativo: true,
            role: role.role
        })
        if (!resp.ok) {
            return {
                ok: false,
                msg: "Erro ao inserir role"
            }
        }
        await this.database.desativarMenusRole(role.id);
        for (const m of role.menus) {
            const roleMenu = await this.database.obtemRoleMenuComIds(role.id, m.id);
            if (roleMenu) {
                await this.database.atualizaRoleMenu({
                    id: roleMenu.id,
                    ativo: true,
                    tipoAcesso: m.tipoAcesso
                })
            } else {
                await this.database.insereRoleMenu({
                    idMenu: m.id,
                    idRole: role.id,
                    ativo: true,
                    tipoAcesso: m.tipoAcesso
                })
            }
        }
        return {
            ok: true
        }
    }

}