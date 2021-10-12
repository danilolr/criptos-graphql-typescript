import * as AWS from 'aws-sdk'
import { S3 } from 'aws-sdk'
import * as cryptoJS from "crypto-js"

export interface RetornoInserirArquivo {
    ok: boolean
    msg?: string
    url?: string
}

export interface RetornoObterArquivo {
    ok: boolean
    buffer?: Buffer
    length?: number
}

export class AwsS3 {

    private s3: S3;
    private readonly bucket = "criptos.arquivo"

    constructor() {
        this.s3 = new AWS.S3({
            accessKeyId: process.env.CRIPTOS_S3_ACCESS_KEY_ID,
            secretAccessKey: process.env.CRIPTOS_S3_SECRET_ACCESS_KEY
        })
    }

    public async inserirArquivo(bytes: string | Buffer): Promise<RetornoInserirArquivo> {
        const sha1 = cryptoJS.SHA1(cryptoJS.lib.WordArray.create(bytes)).toString();
        return new Promise((resolve, reject) => {
            const params = {
                Bucket: this.bucket,
                Key: sha1,
                Body: bytes
            }
            this.s3.upload(params, async (err, data) => {
                if (err) {
                    return resolve({ok: false, msg: "Falha no upload do arquivo"})
                }
                resolve({ok: true, url: data.Location})
            })
        })
    }

    public async obterArquivo(key: string): Promise<RetornoObterArquivo> {
        return new Promise((resolve, reject) => {
            this.s3.getObject({
                Bucket: this.bucket,
                Key: key
            }, (err, data) => {
                if (err) {
                    resolve({ok: false})
                } else {
                    resolve({ ok: true, buffer: data.Body as Buffer, length: data.ContentLength})
                }
            })
        })
    }

}