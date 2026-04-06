function transferGradeToText(grade) {
    if (grade >= 90 && grade <= 100) {
        return "Відмінно";
    }
    else if (grade >= 75) {
        return "Добре";
    }
    else if (grade >= 60) {
        return "Задовільно";
    }
    else if (grade >= 0 && grade <= 59) {
        return "Незадовільно";
    }
    else {
        return "Невірна оцінка";
    }
}

console.log(transferGradeToText(85),"\n");


function transferGradeToTextShort(grade) {
    return (grade >= 90 && grade <= 100) ? "Відмінно" :
            (grade >= 75 && grade <= 89) ? "Добре" :
                    (grade >= 60 && grade <= 74) ? "Задовільно" :
                            (grade >= 0 && grade <= 59) ? "Незадовільно" :
                                    "Невірна оцінка";
}

console.log(transferGradeToTextShort(100),"\n");


function transferSeasonToText(month) {
    if ((month >= 1 && month <= 2) || month === 12) {
        return "Зима";
    }
    else if (month>=3 && month<=5) {
        return "Весна";
    }
    else if (month>=6 && month<=8) {
        return "Літо";
    }
    else if (month>=9 && month<=11) {
        return "Осінь";
    }
    else {
        return "Невірний місяць";
    }
}

console.log(transferSeasonToText(3),"\n");


function transferSeasonToTextShort(month) {
    return ((month >= 1 && month <= 2) || month === 12) ? "Зима" :
            (month >= 3 && month <= 5) ? "Весна" :
                    (month >= 6 && month <= 8) ? "Літо" :
                            (month >= 9 && month <= 11) ? "Осінь" :
                                    "Невірний місяць";
}

console.log(transferSeasonToTextShort(6),"\n");