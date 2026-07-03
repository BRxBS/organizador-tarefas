export const DAYS_DATA = [
    { id: "0", title: "DOMINGO" },
    { id: "1", title: "SEGUNDA" },
    { id: "2", title: "TERÇA" },
    { id: "3", title: "QUARTA" },
    { id: "4", title: "QUINTA" },
    { id: "5", title: "SEXTA" },
    { id: "6", title: "SÁBADO" },
];

export const DAY_HOJE = -1;
export const DAY_AMANHA = -2;

// export const getFrequencyText = (days: number[]) => {
//     if (days.length === 7) return "TODOS OS DIAS";
//     if (days.includes(-1)) return "HOJE";
//     if (days.includes(-2)) return "AMANHÃ";

//     const workDays = [1, 2, 3, 4, 5];
//     const isWorkDays =
//         days.length === 5 && workDays.every((d) => days.includes(d));
//     if (isWorkDays) return "DIAS ÚTEIS";

//     // Mapeamento simples para outros casos
//     const names: any = {
//         0: "DOM",
//         1: "SEG",
//         2: "TER",
//         3: "QUA",
//         4: "QUI",
//         5: "SEX",
//         6: "SAB",
//     };
//     return days.map((d) => names[d]).join(", ");
// };

export const getFrequencyText = (days: number[]) => {
    if (days.length === 7) return "TODOS OS DIAS";
    if (days.includes(-1)) return "HOJE";
    if (days.includes(-2)) return "AMANHÃ";

    const workDays = [1, 2, 3, 4, 5];
    const isWorkDays =
        days.length === 5 && workDays.every((d) => days.includes(d));
    if (isWorkDays) return "DIAS ÚTEIS";

    const names: any = {
        0: "DOM",
        1: "SEG",
        2: "TER",
        3: "QUA",
        4: "QUI",
        5: "SEX",
        6: "SAB",
    };
    return days
        .sort()
        .map((d) => names[d])
        .join(", ");
};
