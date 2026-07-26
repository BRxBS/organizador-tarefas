export function calcularProximoDisparo(
    diaSemana: number,
    hora: number,
    minuto: number,
): number {
    const agora = new Date();
    const resultado = new Date();
    resultado.setHours(hora, minuto, 0, 0);

    let diff = (diaSemana - agora.getDay() + 7) % 7;
    resultado.setDate(agora.getDate() + diff);

    // Se é hoje mas o horário já passou, joga pra semana que vem
    if (diff === 0 && resultado.getTime() <= agora.getTime()) {
        resultado.setDate(resultado.getDate() + 7);
    }

    return resultado.getTime();
}
