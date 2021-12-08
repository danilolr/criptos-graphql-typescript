    export const typeDefs = `

type Query {
     arquivo(id: Int): [Arquivo]
     cotacaoHistorico(id: Int, idExchange: Int, idCriptoPar: Int): [CotacaoHistorico]
     cotacaoHistoricoValor(id: Int, idCotacaoHistorico: Int): [CotacaoHistoricoValor]
     criptoPar(id: Int, idCriptoativoOrigem: Int, idCriptoativoDestino: Int): [CriptoPar]
     criptoativo(id: Int): [Criptoativo]
     exchange(id: Int): [Exchange]
     menu(id: Int, idMenuPai: Int): [Menu]
     monitor(id: Int, idCriptoPar: Int): [Monitor]
     monitorUsuario(id: Int, idMonitor: Int, idUsuario: Int): [MonitorUsuario]
     role(id: Int): [Role]
     roleMenu(id: Int, idRole: Int, idMenu: Int): [RoleMenu]
     roleUsuario(id: Int, idRole: Int, idUsuario: Int): [RoleUsuario]
     usuario(id: Int): [Usuario]
     usuarioTelegram(id: Int): [UsuarioTelegram]
}

type Arquivo {
    id: ID
    sha1: String, 
    tamanho: Int, 
    nome: String, 
    ativo: Boolean, 
}

type CotacaoHistorico {
    id: ID
    exchange: Exchange,
    criptoPar: CriptoPar,
    tempo: String, 
    ativo: Boolean, 
    listaCotacaoHistoricoValor : [CotacaoHistoricoValor],
}

type CotacaoHistoricoValor {
    id: ID
    cotacaoHistorico: CotacaoHistorico,
    dataHora: String, 
    open: Float, 
    close: Float, 
    high: Float, 
    low: Float, 
    volume: Float, 
    quoteVolume: Float, 
    closeTime: String, 
    numTrades: Int, 
    ativo: Boolean, 
}

type CriptoPar {
    id: ID
    criptoativoOrigem: Criptoativo,
    criptoativoDestino: Criptoativo,
    simbolo: String, 
    ativo: Boolean, 
    listaCotacaoHistorico : [CotacaoHistorico],
    listaMonitor : [Monitor],
}

type Criptoativo {
    id: ID
    nome: String, 
    simbolo: String, 
    ativo: Boolean, 
    listaCriptoParDestino : [CriptoPar],
    listaCriptoParOrigem : [CriptoPar],
}

type Exchange {
    id: ID
    nome: String, 
    ativo: Boolean, 
    listaCotacaoHistorico : [CotacaoHistorico],
}

type Menu {
    id: ID
    descricao: String, 
    formulario: String, 
    menuPai: Menu,
    ordem: Int, 
    ativo: Boolean, 
    listaMenu : [Menu],
    listaRoleMenu : [RoleMenu],
}

type Monitor {
    id: ID
    estrategia: String, 
    criptoPar: CriptoPar,
    params: String, 
    tempo: String, 
    ativo: Boolean, 
    listaMonitorUsuario : [MonitorUsuario],
}

type MonitorUsuario {
    id: ID
    monitor: Monitor,
    usuario: Usuario,
    ativo: Boolean, 
}

type Role {
    id: ID
    descRole: String, 
    role: String, 
    ativo: Boolean, 
    listaRoleMenu : [RoleMenu],
    listaRoleUsuario : [RoleUsuario],
}

type RoleMenu {
    id: ID
    role: Role,
    menu: Menu,
    tipoAcesso: String, 
    ativo: Boolean, 
}

type RoleUsuario {
    id: ID
    role: Role,
    usuario: Usuario,
    ativo: Boolean, 
}

type Usuario {
    id: ID
    cpf: String, 
    nomeUsuario: String, 
    senha: String, 
    email: String, 
    telegramChatId: String, 
    ativo: Boolean, 
    listaMonitorUsuario : [MonitorUsuario],
    listaRoleUsuario : [RoleUsuario],
}

type UsuarioTelegram {
    id: ID
    idUsuario: Int, 
    ativo: Boolean, 
}

type Mutation {
    insereArquivo(sha1: String, tamanho: Int, nome: String, ativo: Boolean): RetornoInsercaoAtualizacao
    atualizaArquivo(id: Int!, sha1: String, tamanho: Int, nome: String, ativo: Boolean): RetornoInsercaoAtualizacao
    excluiArquivo(id: Int!): RetornoInsercaoAtualizacao
    insereCotacaoHistorico(idExchange: Int, idCriptoPar: Int, tempo: String, ativo: Boolean): RetornoInsercaoAtualizacao
    atualizaCotacaoHistorico(id: Int!, idExchange: Int, idCriptoPar: Int, tempo: String, ativo: Boolean): RetornoInsercaoAtualizacao
    excluiCotacaoHistorico(id: Int!): RetornoInsercaoAtualizacao
    insereCotacaoHistoricoValor(idCotacaoHistorico: Int, dataHora: String, open: Float, close: Float, high: Float, low: Float, volume: Float, quoteVolume: Float, closeTime: String, numTrades: Int, ativo: Boolean): RetornoInsercaoAtualizacao
    atualizaCotacaoHistoricoValor(id: Int!, idCotacaoHistorico: Int, dataHora: String, open: Float, close: Float, high: Float, low: Float, volume: Float, quoteVolume: Float, closeTime: String, numTrades: Int, ativo: Boolean): RetornoInsercaoAtualizacao
    excluiCotacaoHistoricoValor(id: Int!): RetornoInsercaoAtualizacao
    insereCriptoPar(idCriptoativoOrigem: Int, idCriptoativoDestino: Int, simbolo: String, ativo: Boolean): RetornoInsercaoAtualizacao
    atualizaCriptoPar(id: Int!, idCriptoativoOrigem: Int, idCriptoativoDestino: Int, simbolo: String, ativo: Boolean): RetornoInsercaoAtualizacao
    excluiCriptoPar(id: Int!): RetornoInsercaoAtualizacao
    insereCriptoativo(nome: String, simbolo: String, ativo: Boolean): RetornoInsercaoAtualizacao
    atualizaCriptoativo(id: Int!, nome: String, simbolo: String, ativo: Boolean): RetornoInsercaoAtualizacao
    excluiCriptoativo(id: Int!): RetornoInsercaoAtualizacao
    insereExchange(nome: String, ativo: Boolean): RetornoInsercaoAtualizacao
    atualizaExchange(id: Int!, nome: String, ativo: Boolean): RetornoInsercaoAtualizacao
    excluiExchange(id: Int!): RetornoInsercaoAtualizacao
    insereMenu(descricao: String, formulario: String, idMenuPai: Int, ordem: Int, ativo: Boolean): RetornoInsercaoAtualizacao
    atualizaMenu(id: Int!, descricao: String, formulario: String, idMenuPai: Int, ordem: Int, ativo: Boolean): RetornoInsercaoAtualizacao
    excluiMenu(id: Int!): RetornoInsercaoAtualizacao
    insereMonitor(estrategia: String, idCriptoPar: Int, params: String, tempo: String, ativo: Boolean): RetornoInsercaoAtualizacao
    atualizaMonitor(id: Int!, estrategia: String, idCriptoPar: Int, params: String, tempo: String, ativo: Boolean): RetornoInsercaoAtualizacao
    excluiMonitor(id: Int!): RetornoInsercaoAtualizacao
    insereMonitorUsuario(idMonitor: Int, idUsuario: Int, ativo: Boolean): RetornoInsercaoAtualizacao
    atualizaMonitorUsuario(id: Int!, idMonitor: Int, idUsuario: Int, ativo: Boolean): RetornoInsercaoAtualizacao
    excluiMonitorUsuario(id: Int!): RetornoInsercaoAtualizacao
    insereRole(descRole: String, role: String, ativo: Boolean): RetornoInsercaoAtualizacao
    atualizaRole(id: Int!, descRole: String, role: String, ativo: Boolean): RetornoInsercaoAtualizacao
    excluiRole(id: Int!): RetornoInsercaoAtualizacao
    insereRoleMenu(idRole: Int, idMenu: Int, tipoAcesso: String, ativo: Boolean): RetornoInsercaoAtualizacao
    atualizaRoleMenu(id: Int!, idRole: Int, idMenu: Int, tipoAcesso: String, ativo: Boolean): RetornoInsercaoAtualizacao
    excluiRoleMenu(id: Int!): RetornoInsercaoAtualizacao
    insereRoleUsuario(idRole: Int, idUsuario: Int, ativo: Boolean): RetornoInsercaoAtualizacao
    atualizaRoleUsuario(id: Int!, idRole: Int, idUsuario: Int, ativo: Boolean): RetornoInsercaoAtualizacao
    excluiRoleUsuario(id: Int!): RetornoInsercaoAtualizacao
    insereUsuario(cpf: String, nomeUsuario: String, senha: String, email: String, telegramChatId: String, ativo: Boolean): RetornoInsercaoAtualizacao
    atualizaUsuario(id: Int!, cpf: String, nomeUsuario: String, senha: String, email: String, telegramChatId: String, ativo: Boolean): RetornoInsercaoAtualizacao
    excluiUsuario(id: Int!): RetornoInsercaoAtualizacao
    insereUsuarioTelegram(idUsuario: Int, ativo: Boolean): RetornoInsercaoAtualizacao
    atualizaUsuarioTelegram(id: Int!, idUsuario: Int, ativo: Boolean): RetornoInsercaoAtualizacao
    excluiUsuarioTelegram(id: Int!): RetornoInsercaoAtualizacao
}

type RetornoInsercaoAtualizacao {
    id: Int
    ok: Boolean!
    msg: String
}

    `