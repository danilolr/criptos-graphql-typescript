import * as jwt from 'jsonwebtoken'
import { Database } from "../database-custom"
import { Usuario, Menu } from '../gen/model'
import { UsuarioService } from './usuario_service'

interface AuthResult {
    ok: boolean
    token?: string
    msg?: string
}

export class AutenticacaoService {

    constructor(private database: Database,
        private usuarioService: UsuarioService) { }

    private geraToken(pessoa: Usuario, roles: string[], menus: Menu[]): string {
        return jwt.sign({ id: String(pessoa.id), nomeUsuario: pessoa.nomeUsuario, email: pessoa.email, roles: roles, menus: menus }, 'criptos');
    }

    public async autenticarEmailSenha(email: string, senha: string): Promise<AuthResult> {
        const pessoa = await this.database.obtemUsuarioPorEmail(email)
        if (!pessoa) {
            return { ok: false, msg: "Não foi possivel encontrar um usuário com este email." }
        }
        if (senha && this.usuarioService.criptografarSenha(senha) === pessoa.senha) {
            const roles = await this.database.obtemRolesUsuario(pessoa.id);
            const menus = await this.database.obtemMenusUsuario(pessoa.id);
            return {
                ok: true,
                token: this.geraToken(pessoa, roles, menus),
            }
        }
        return { ok: false, msg: "Senha incorreta." };
    }
}
