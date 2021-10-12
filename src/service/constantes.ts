export enum TempoGrafico {
    MINUTO_1 = "1m",
    HORA_1 = "1h",
    DIA_1 = "1d"
}

export function converteStringToTempoGrafico(s: string): TempoGrafico {
    if (s == "1m") {
        return TempoGrafico.MINUTO_1
    }
    if (s == "1h") {
        return TempoGrafico.HORA_1
    }
    if (s == "1d") {
        return TempoGrafico.DIA_1
    }
    return null
}