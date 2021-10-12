import { Database } from "../database-custom"
import { Usuario, RetornoInsercaoAtualizacao } from "../gen/model"
import * as cryptoJS from "crypto-js"

export interface UsuarioM extends Usuario {
    idsRoles: number[]
}

export class UsuarioService {

    constructor(private database: Database) { }

    public criptografarSenha(s: string): string {
        return cryptoJS.MD5(s).toString().toUpperCase()
    }

     public async inserirUsuario(usuario: UsuarioM): Promise<RetornoInsercaoAtualizacao> {
         const resp = await this.database.insereUsuario({
             cpf: usuario.cpf,
             email: usuario.email,
             ativo: usuario.ativo,
             nomeUsuario: usuario.nomeUsuario,
             senha: this.criptografarSenha(usuario.senha)
         });
         if (!resp.ok) {
             return {
                 ok: false,
                 msg: "Erro ao inserir usuário"
             }
         }
         for (const id of usuario.idsRoles) {
             await this.database.insereRoleUsuario({
                 idRole: id,
                 idUsuario: resp.id,
                 ativo: true,
             })
         }
         return {
             ok: true,
             id: resp.id
         }
     }

     public async atualizarUsuario(usuario: UsuarioM): Promise<RetornoInsercaoAtualizacao> {
         const resp = await this.database.atualizaUsuario({
             id: usuario.id,
             cpf: usuario.cpf,
             email: usuario.email,
             ativo: usuario.ativo,
             nomeUsuario: usuario.nomeUsuario,
         });
         if (!resp.ok) {
             return {
                 ok: false,
                 msg: "Erro ao atualizar usuário"
             }
         }
         await this.database.desativarRoleUsuario(usuario.id)

         for (const id of usuario.idsRoles) {
             const roleUsuario = await this.database.obtemRoleUsuarioComIds(id, usuario.id);
             if (roleUsuario) {
                 await this.database.atualizaRoleUsuario({
                     id: roleUsuario.id,
                     ativo: true
                 })
             } else {
                 await this.database.insereRoleUsuario({
                     idRole: id,
                     idUsuario: usuario.id,
                     ativo: true
                 })
             }
         }
         return {
             ok: true
         }
     }

     public async alterarSenha(id: number, senha: string): Promise<RetornoInsercaoAtualizacao> {
        const resp = await this.database.atualizaUsuario({
             id: id,
             senha: this.criptografarSenha(senha)
         });
         if (!resp.ok) {
             return {
                 ok: false,
                 msg: "Erro ao alterar a senha do usuário"
             }
         }
         return {
             ok: true
         }
     }
}