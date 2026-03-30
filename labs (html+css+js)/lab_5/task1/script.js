//знаходить елемент на сторінці по класу і зберігає у змінну щоб далі з ним працювати.
const defaultBulbOn = document.querySelector('.default-on');
const defaultBulbOff = document.querySelector('.default-off');
const energySavingBulbOn = document.querySelector('.energy-saving-on');
const energySavingBulbOff = document.querySelector('.energy-saving-off');
const ledBulbOn = document.querySelector('.led-on');
const ledBulbOff = document.querySelector('.led-off');

//тип
const defaultButton = document.querySelector('.default-button');
const energySavingButton = document.querySelector('.energy-saving-button');
const ledButton = document.querySelector('.led-button');

//кнопки
const onButton = document.querySelector('.on-button');
const offButton = document.querySelector('.off-button');

const brightnessButton = document.querySelector('.brightness-button');

const statusInfo = document.querySelector('.status-info');
const brightnessInfo = document.querySelector('.brightness-info');
const timerInfo = document.querySelector('.timer-info');

//таймер
let inactivityTimer = null;
const INACTIVITY_MS = 5 * 60 * 1000;

//знімає клас active з усіх картинок
function hideAllBulbs() {
    [defaultBulbOn, defaultBulbOff,
        energySavingBulbOn, energySavingBulbOff,
        ledBulbOn, ledBulbOff
    ].forEach(el => el.classList.remove('active'));
}

//перевіряє яка картинка зараз має клас active і повертає об'єкт з трьома полями: сам елемент, тип лампочки, стан вкл/викл.
function getActiveBulb() {
    if (defaultBulbOn.classList.contains('active'))         return { el: defaultBulbOn,         type: 'default',       state: 'on'  };
    if (defaultBulbOff.classList.contains('active'))        return { el: defaultBulbOff,        type: 'default',       state: 'off' };
    if (energySavingBulbOn.classList.contains('active'))    return { el: energySavingBulbOn,    type: 'energySaving',  state: 'on'  };
    if (energySavingBulbOff.classList.contains('active'))   return { el: energySavingBulbOff,   type: 'energySaving',  state: 'off' };
    if (ledBulbOn.classList.contains('active'))             return { el: ledBulbOn,             type: 'led',           state: 'on'  };
    if (ledBulbOff.classList.contains('active'))            return { el: ledBulbOff,            type: 'led',           state: 'off' };
    return null;
}

//отримує тип лампочки і повертає картинку увімкненої лампочки цього типу.
function getOnBulbByType(type) {
    return { default: defaultBulbOn, energySaving: energySavingBulbOn, led: ledBulbOn }[type];
}

//те саме але повертає картинку вимкненої лампочки цього типу.
function getOffBulbByType(type) {
    return { default: defaultBulbOff, energySaving: energySavingBulbOff, led: ledBulbOff }[type];
}

//перетворює технічну назву типу в українську.
function getTypeName(type) {
    return { default: 'Звичайна', energySaving: 'Енергозберігаюча', led: 'Світлодіодна' }[type];
}

//оновлює текст на сторінці. Якщо нічого не обрано — "Оберіть тип". Якщо увімкнена — "УВІМКНЕНА + назва типу".
function updateStatus() {
    const active = getActiveBulb();
    if (!active) {
        statusInfo.textContent = 'Оберіть тип лампочки';
        timerInfo.textContent = '';
        brightnessInfo.textContent = '';
        return;
    }
    if (active.state === 'on') {
        statusInfo.textContent = `Лампочка УВІМКНЕНА (${getTypeName(active.type)})`;
        timerInfo.textContent = 'Таймер автовимкнення: 5 хв';
    } else {
        statusInfo.textContent = `Лампочка ВИМКНЕНА (${getTypeName(active.type)})`;
        timerInfo.textContent = '';
        brightnessInfo.textContent = '';
    }
}

//скасовує попередній таймер і запускає новий на 5 хвилин. Коли час вийде — автоматично вимикає лампочку.
function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
        const active = getActiveBulb();
        if (active && active.state === 'on') {
            hideAllBulbs();
            getOffBulbByType(active.type).classList.add('active');
            timerInfo.textContent = 'Лампочку вимкнено автоматично через 5 хв бездіяльності.';
            brightnessInfo.textContent = '';
            statusInfo.textContent = `Лампочка ВИМКНЕНА (${getTypeName(active.type)})`;
        }
    }, INACTIVITY_MS);
}

['mousemove', 'keydown', 'click', 'touchstart'].forEach(ev =>
        document.addEventListener(ev, () => {
            const active = getActiveBulb();
            if (active && active.state === 'on') resetInactivityTimer();
        })
);

//кнопки — ховають все, показують вимкнений варіант обраного типу, оновлюють текст.
defaultButton.addEventListener('click', () => {
    hideAllBulbs();
    defaultBulbOff.classList.add('active');
    updateStatus();
});

energySavingButton.addEventListener('click', () => {
    hideAllBulbs();
    energySavingBulbOff.classList.add('active');
    updateStatus();
});

ledButton.addEventListener('click', () => {
    hideAllBulbs();
    ledBulbOff.classList.add('active');
    updateStatus();
});

//якщо лампочка не обрана або вже увімкнена — нічого. Інакше: ховає все, показує увімкнену того ж типу, запускає таймер.
onButton.addEventListener('click', () => {
    const active = getActiveBulb();
    if (!active) {
        alert('Спочатку оберіть тип лампочки.');
        return;
    }
    if (active.state === 'on') return;
    hideAllBulbs();
    getOnBulbByType(active.type).classList.add('active');
    resetInactivityTimer();
    updateStatus();
});

//якщо не обрана або вже вимкнена — нічого. Інакше: ховає все, показує вимкнену того ж типу, скасовує таймер.
offButton.addEventListener('click', () => {
    const active = getActiveBulb();
    if (!active) {
        alert('Спочатку оберіть тип лампочки.');
        return;
    }
    if (active.state === 'off') return;
    hideAllBulbs();
    getOffBulbByType(active.type).classList.add('active');
    clearTimeout(inactivityTimer);
    updateStatus();
});

//якщо вимкнена або тип default — alert. Інакше: через prompt отримує число 10-100, застосовує CSS brightness(N%) на картинку.
brightnessButton.addEventListener('click', () => {
    const active = getActiveBulb();
    if (!active || active.state !== 'on') {
        alert('Спочатку увімкніть лампочку.');
        return;
    }
    if (active.type === 'default') {
        alert('Звичайна лампочка не підтримує регулювання яскравості.');
        return;
    }
    const input = prompt('Введіть яскравість від 10 до 100:', 100);
    if (input === null) return;
    const num = parseInt(input, 10);
    if (isNaN(num) || num < 10 || num > 100) {
        alert('Будь ласка, введіть ціле число від 10 до 100.');
        return;
    }
    active.el.style.filter = `brightness(${num}%)`;
    brightnessInfo.textContent = `Яскравість: ${num}%`;
    resetInactivityTimer();
});