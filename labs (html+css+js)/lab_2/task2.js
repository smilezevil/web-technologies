function isRange(el, num1, num2) {
    return el >= num1 && el <= num2;
}

console.log(isRange(5, 1, 10));
console.log(isRange(15, 1, 10));

let isActive = true;
let isActive2 = false;

isActive = !isActive;
isActive2 = !isActive2;

console.log(`isActive: ${isActive}`);
console.log(`isActive2: ${isActive2}`);