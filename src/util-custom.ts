import { enderecoServidorGraphql } from "./gen/configuracao";
import { Arquivo } from "./gen/model";

export function criarLinkMostrarArquivo(a: Arquivo) {
    return `${enderecoServidorGraphql}/file/${a.sha1}/${a.sha1}`;
}

export function criarLinkDownloadArquivo(a: Arquivo) {
    return `${enderecoServidorGraphql}/download/${a.sha1}/${a.sha1}`;
}