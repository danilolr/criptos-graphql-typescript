export interface RetornoInsercaoAtualizacao {
    ok: boolean
    msg?: string
    id?: number
}

export interface Arquivo {
    id?: number
    sha1?: string, 
    tamanho?: number, 
    nome?: string, 
    ativo?: boolean, 
}

export interface CotacaoHistorico {
    id?: number
    idExchange?: number, 
    idCriptoPar?: number, 
    tempo?: string, 
    ativo?: boolean, 
}

export interface CotacaoHistoricoValor {
    id?: number
    idCotacaoHistorico?: number, 
    dataHora?: Date, 
    open?: number, 
    close?: number, 
    high?: number, 
    low?: number, 
    volume?: number, 
    quoteVolume?: number, 
    closeTime?: Date, 
    numTrades?: number, 
    ativo?: boolean, 
}

export interface CriptoPar {
    id?: number
    idCriptoativoOrigem?: number, 
    idCriptoativoDestino?: number, 
    simbolo?: string, 
    ativo?: boolean, 
}

export interface Criptoativo {
    id?: number
    nome?: string, 
    simbolo?: string, 
    ativo?: boolean, 
}

export interface Exchange {
    id?: number
    nome?: string, 
    ativo?: boolean, 
}

export interface Menu {
    id?: number
    descricao?: string, 
    formulario?: string, 
    idMenuPai?: number, 
    ordem?: number, 
    ativo?: boolean, 
}

export interface Role {
    id?: number
    descRole?: string, 
    role?: string, 
    ativo?: boolean, 
}

export interface RoleMenu {
    id?: number
    idRole?: number, 
    idMenu?: number, 
    tipoAcesso?: string, 
    ativo?: boolean, 
}

export interface RoleUsuario {
    id?: number
    idRole?: number, 
    idUsuario?: number, 
    ativo?: boolean, 
}

export interface Usuario {
    id?: number
    cpf?: string, 
    nomeUsuario?: string, 
    senha?: string, 
    email?: string, 
    ativo?: boolean, 
}

export interface ParamListaArquivo {
    id?: number
}

export interface ParamListaCotacaoHistorico {
    id?: number
    idExchange?: number, 
    idCriptoPar?: number, 
}

export interface ParamListaCotacaoHistoricoValor {
    id?: number
    idCotacaoHistorico?: number, 
}

export interface ParamListaCriptoPar {
    id?: number
    idCriptoativoOrigem?: number, 
    idCriptoativoDestino?: number, 
}

export interface ParamListaCriptoativo {
    id?: number
}

export interface ParamListaExchange {
    id?: number
}

export interface ParamListaMenu {
    id?: number
    idMenuPai?: number, 
}

export interface ParamListaRole {
    id?: number
}

export interface ParamListaRoleMenu {
    id?: number
    idRole?: number, 
    idMenu?: number, 
}

export interface ParamListaRoleUsuario {
    id?: number
    idRole?: number, 
    idUsuario?: number, 
}

export interface ParamListaUsuario {
    id?: number
}

