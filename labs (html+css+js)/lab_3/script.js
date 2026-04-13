function sumFirst50NaturalNumbers() {
    let i = 1;
    let sum = 0;

    while (i <= 50) {
        sum += i;
        i++;
    }

    return sum;
}

console.log("Завдання 1: сума перших 50 натуральних чисел =", sumFirst50NaturalNumbers());


function factorialOfNumber(n) {
    let result = 1;

    for (let i = 1; i <= n; i++) {
        result *= i;
    }

    return result;
}

console.log("Завдання 2: обчислення факторіалу числа 5 =", factorialOfNumber(5));


function getMonthName(month) {
    switch (month) {
        case 1: return "January";
        case 2: return "February";
        case 3: return "March";
        case 4: return "April";
        case 5: return "May";
        case 6: return "June";
        case 7: return "July";
        case 8: return "August";
        case 9: return "September";
        case 10: return "October";
        case 11: return "November";
        case 12: return "December";
        default: return "Invalid month";
    }
}

console.log("Завдання 3: назва місяця під номером 10 -", getMonthName(10));


function sumEvenNumbers(arr) {
    let sum = 0;

    for (let i = 0; i < arr.length; i++) {
        if (arr[i] % 2 === 0) {
            sum += arr[i];
        }
    }

    return sum;
}

console.log("Завдання 4: сума всіх парних чисел масиву [1, 2, 3, 53, 52, 13, 8] =", sumEvenNumbers([1, 2, 3, 53, 52, 13, 8]));


const countOfVowels = (word) => {
    const vowels = ['a', 'e', 'i', 'o', 'u'];
    let count = 0;

    for (let i = 0; i < word.length; i++) {
        if (vowels.includes(word[i].toLowerCase())) {
            count++;
        }
    }

    return count;
};

console.log("Завдання 5: кількість голосних літер у слові Anastasiia =", countOfVowels("Anastasiia"));


function power(base, exponent) {
    let result = 1;

    for (let i = 1; i <= exponent; i++) {
        result *= base;
    }

    return result;
}

console.log("Завдання 6: піднесення числа 5 до степеня 3 =", power(5, 3));