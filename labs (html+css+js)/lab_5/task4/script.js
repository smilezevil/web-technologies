let products = new Map();

function addProduct(id, name, price, count) {
    products.set(id, { name, price, count });
}

deleteProduct = (id) => {
    if (products.has(id)) {
        products.delete(id);
    } else {
        console.log(`Product with id ${id} does not exist.`);
    }
}

function updateProduct(id, price, count) {
    if (products.has(id)) {
        const product = products.get(id);
        products.set(id, { ...product, price, count });
        addHistory(product, new Date());
    } else {
        console.log(`Product with id ${id} does not exist.`);
    }
}

function findByName(name) {
    for (let [id, product] of products) {
        if (product.name === name) {
            return { id, ...product };
        }
    }
    console.log(`Product with name ${name} does not exist.`);
    return null;
}

function isBought(id) {
    if (products.has(id)) {
        const product = products.get(id);
        product.count--;
        products.set(id, product);
        return product.count > 0;
    } else {
        console.log(`Product with id ${id} does not exist.`);
        return false;
    }
}

let orderedProducts = new Set();

function isBoughtOneMore(id) {
    if (!products.has(id)) {
        console.log(`Product with id ${id} does not exist.`);
        return false;
    }
    const product = products.get(id);
    if (orderedProducts.has(product)) {
        console.log(`Product with id ${id} has already been bought.`);
    }
    orderedProducts.add(product);
    product.count--;
    products.set(id, product);
    return product.count > 0;
}

let history = new WeakMap();
function addHistory(product, date) {
    if (!history.has(product)) {
        history.set(product, []);
    }
    history.get(product).push(date);}

// demo

// додаємо продукти
addProduct(1, 'Mouse', 10, 4);
addProduct(2, 'Keyboard', 20, 12);
addProduct(3, 'Headphones', 15, 10);
console.log('--- Каталог після додавання ---');
products.forEach((p, id) => console.log(`[${id}] ${p.name} | ціна: ${p.price} | кількість: ${p.count}`));

// пошук за назвою
console.log('\n--- Пошук "Keyboard" ---');
console.log(findByName('Keyboard'));

// оновлення продукту
console.log('\n--- Оновлення Mouse ---');
updateProduct(1, 12, 5);
const Mouse = products.get(1);
console.log(`Mouse -> ціна: ${Mouse.price}, кількість: ${Mouse.count}`);

// замовлення
console.log('\n--- Замовлення Headphones ---');
isBought(3);
const Headphones = products.get(3);
console.log(`Headphones після замовлення -> кількість: ${Headphones.count}`);

// замовлення з відстеженням у set
console.log('\n--- Замовлення Keyboard через isBoughtOneMore ---');
isBoughtOneMore(2);
console.log('Замовлені продукти:', [...orderedProducts].map(p => p.name).join(', '));

// видалення
console.log('\n--- Видалення продукту з id = 2 ---');
deleteProduct(2);
console.log('Каталог після видалення:');
products.forEach((p, id) => console.log(`[${id}] ${p.name} | ціна: ${p.price} | кількість: ${p.count}`));

// пошук видаленого
console.log('\n--- Пошук видаленого "Keyboard" ---');
findByName('Keyboard');