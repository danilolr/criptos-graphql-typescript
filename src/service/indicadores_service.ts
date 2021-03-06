import { Serie } from "../estrategias/estrategia"

var tulind = require('tulind')

export class IndicadoresService {

    async calculaMediaMovelSimples(close: number[], periodo: number): Promise<Serie[]> {
        return new Promise<Serie[]>((resolve, reject) => {
            tulind.indicators.sma.indicator([close], [periodo], function (err, results) {
                while (results[0].length < close.length) {
                    results[0].splice(0, 0, null)
                }
                resolve([new Serie("MMS", results[0])])
            })
        })
    }

    calculaBandaBollinger(close: number[], periodo: number, escala: number): Promise<Serie[]> {
        return new Promise<Serie[]>((resolve, reject) => {
            tulind.indicators.bbands.indicator([close], [periodo, escala], function (err, results) {
                while (results[0].length < close.length) {
                    results[0].splice(0, 0, null)
                }
                while (results[1].length < close.length) {
                    results[1].splice(0, 0, null)
                }
                while (results[2].length < close.length) {
                    results[2].splice(0, 0, null)
                }
                resolve([new Serie("HIGH", results[0]), new Serie("AVERAGE", results[1]), new Serie("LOW", results[2])])
            })
        })
    }

    calculaIndiceForcaRelativa(close: number[], periodo: number): Promise<Serie[]> {
        return new Promise<Serie[]>((resolve, reject) => {
            tulind.indicators.rsi.indicator([close], [periodo], function (err, results) {
                while (results[0].length < close.length) {
                    results[0].splice(0, 0, null)
                }
                resolve([new Serie("RSI", results[0])])
            })
        })
    }
}