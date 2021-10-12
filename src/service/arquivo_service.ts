 
import * as cryptoJS from "crypto-js"
import { Database } from "../database-custom"
import { Arquivo } from "../gen/model"
import { AwsS3 } from "./aws_s3_service"

interface RetornoInserirArquivo {
    ok: boolean
    arquivo?: Arquivo
    msg?: string
}

interface inputInserirArquivoNome {
    bytes: string | Buffer
    nome?: string
    type?: string
}

export class ArquivoService {

    private database: Database
    private awsS3: AwsS3;

    constructor(database: Database, awsS3: AwsS3) {
        this.database = database
        this.awsS3 = awsS3;
    }

    async inserirArquivo(dados: inputInserirArquivoNome): Promise<RetornoInserirArquivo> {
        const sha1 = cryptoJS.SHA1(cryptoJS.lib.WordArray.create(dados.bytes)).toString();
        let nome = sha1;
        if (dados.nome) {
            nome = dados.nome
        } else if (dados.type) {
            nome += `.${dados.type}`
        }
        const resp = await this.awsS3.inserirArquivo(dados.bytes);
        if (!resp.ok) {
            return {
                ok: false,
                msg: resp.msg
            }
        }
        const respInsereArquivo = await this.database.insereArquivo({ 
            sha1: sha1, 
            tamanho: 1, 
            nome: nome, 
            ativo: true 
        })
        const arquivo = await this.database.obtemArquivo(respInsereArquivo.id);
        return {
            ok: true,
            arquivo: arquivo
        }
    }
}