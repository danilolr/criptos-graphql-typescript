export const typeDefs = `
    extend type Query {
        listaEstrategia: [Estrategia!]!
    }
    extend type Mutation {        
        autenticacao(emailCpf: String!, senha: String!):RetornoAutenticacao!
        importacao(idCotacaoHistorico: Int!, dataHoraInicio: String, dataHoraFim: String): Boolean!
        executaBacktest(idCotacaoHistorico: Int!, nomeEstrategia: String!): RetornoBacktest!
    }

    extend type Query {
        versao: String
    }

    type Estrategia {
        nome: String!
        parametros: [ParametroEstrategia!]!
    }

    type ParametroEstrategia {
        nome: String!
        tipo: TipoParametro!
        valorDefault: String
        comentario: String
    }

    enum TipoParametro {
        INTEGER
        FLOAT
        DATE       
    }

    type RetornoAutenticacao {
        ok: Boolean!
        token: String
        msg: String
    }

    type Operacao {
        dataHora: String
        tipo: String
        valor: Float
    }

    type RetornoBacktest {
        ok: Boolean!
        msg: String
        cotacoes: [CotacaoHistoricoValor!]!
        operacoes: [Operacao!]!
        indicadores: [Indicador!]!
        resultado: [CompraVenda!]!
    }

    type CompraVenda {
        entrada: Operacao!
        saida: Operacao!
        percResultado: Float!
    }

    type Indicador {
        descricao: String!
        cor: String
        valores: [Float]!
        grafico: Int!
    }
    `