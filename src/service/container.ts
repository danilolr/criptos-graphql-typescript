import * as awilix from 'awilix'
import { AutenticacaoService } from "./autenticacao_service"
import { AutorizacaoService } from './autorizacao_service'
import { DbConnectionMysql } from "../gen/mysql"
import { Database } from "../database-custom"
import { DatabaseBase } from "../gen/database"
import { CriptosService } from './criptos_service'
import { BinaceService } from './binace_service'
import { CctxService } from './cctx_service'
import { BacktestService } from './backtest_service'
import { IndicadoresService } from './indicadores_service'
import { UsuarioService } from './usuario_service'
import { ArquivoService } from './arquivo_service'
import { AwsS3 } from './aws_s3_service'
import { QueryService } from './query_service'
import { EstrategiaService } from './estrategia_service'

const container = awilix.createContainer({
    injectionMode: awilix.InjectionMode.CLASSIC
})

container.register({
    service: awilix.asClass(CriptosService).singleton(),
    awsS3: awilix.asClass(AwsS3).singleton(),
    arquivoService: awilix.asClass(ArquivoService).singleton(),
    autorizacao: awilix.asClass(AutorizacaoService).singleton(),
    autenticacao: awilix.asClass(AutenticacaoService).singleton(),
    dbConnection: awilix.asClass(DbConnectionMysql).singleton(),
    database: awilix.asClass(Database).singleton(),
    usuarioService: awilix.asClass(UsuarioService).singleton(),
    binaceService: awilix.asClass(BinaceService).singleton(),
    databaseBase: awilix.asClass(DatabaseBase).singleton(),
    backtestService: awilix.asClass(BacktestService).singleton(),
    indicadoresService: awilix.asClass(IndicadoresService).singleton(),
    cctxService: awilix.asClass(CctxService).singleton(),
    queryService: awilix.asClass(QueryService).singleton(),
    estrategiaService: awilix.asClass(EstrategiaService).singleton(),
})

export { container }
