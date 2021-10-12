import { container } from "./service/container"
import { ArquivoService } from "./service/arquivo_service"
import { criarLinkMostrarArquivo } from "./util-custom"
import { AwsS3 } from "./service/aws_s3_service"

const arquivoService: ArquivoService = container.cradle.arquivoService
const awsS3: AwsS3 = container.cradle.awsS3

export function adicionaCustomHandlers(app) {
    app.post('/upload/', upload)
    app.get('/file/:sha1/:file_name', mostarArquivo)
    app.get('/download/:sha1/:file_name', downloadArquivo)
}

async function mostarArquivo(req, res): Promise<void> {
    const sha1 = req.params.sha1
    const resp = await awsS3.obterArquivo(sha1)
    if (!resp.ok) {
        res.writeHead(404).end()
    }
    res.end(resp.buffer)
}

async function downloadArquivo(req, res): Promise<void> {
    const sha1 = req.params.sha1
    const resp = await awsS3.obterArquivo(sha1)
    if (!resp.ok) {
        res.writeHead(404).end()
    }
    res.writeHead(200, {
        'Content-Disposition': `attachment; filename="${req.params.file_name}"`,
    })
    res.end(resp.buffer)
}

async function upload(req, res): Promise<void> {
    if (!req.files.arquivo) {
        return res.status(400).send({
            ok: false,
            msg: "É necessário enviar um arquivo para o upload."
        })
    }
    if (!req.body.nome) {
        return res.status(400).send({
            ok: false,
            msg: "É necessário fornecer um nome para o arquivo."
        })
    }

    const chunks = []
    req.files.arquivo.on("data", function (chunk) {
        chunks.push(chunk)
    })
    req.files.arquivo.on("end", async () => {
        const data = Buffer.concat(chunks);
        const resp = await arquivoService.inserirArquivo({
            bytes: data,
            nome: req.body.nome
        })
        if (!resp.ok) {
            return res.send(JSON.stringify({
                ok: false
            }))
        }
        return res.send(JSON.stringify({
            ok: true,
            url: criarLinkMostrarArquivo(resp.arquivo),
            id: resp.arquivo.id
        }))
    })
}