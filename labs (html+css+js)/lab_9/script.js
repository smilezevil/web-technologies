'use strict';

const CITIES = {
    ukraine: ['Київ', 'Харків', 'Одеса', 'Дніпро', 'Запоріжжя', 'Львів', 'Чернівці'],
    poland:  ['Варшава', 'Краків', 'Вроцлав', 'Гданськ', 'Лодзь'],
    germany: ['Берлін', 'Мюнхен', 'Гамбург', 'Кельн', 'Франкфурт'],
    usa:     ['Нью-Йорк', 'Лос-Анджелес', 'Чикаго', 'Вашингтон', 'Фінікс'],
    france:  ['Париж', 'Марсель', 'Ліон', 'Тулуза', 'Ніцца'],
};

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const REGEX_PHONE = /^\+380\d{9}$/;

const validateName = value => {
    if (!value.trim())             return { valid: false, message: "Поле обов'язкове" };
    if (value.trim().length < 3)   return { valid: false, message: 'Мінімум 3 символи' };
    if (value.trim().length > 15)  return { valid: false, message: 'Максимум 15 символів' };
    return { valid: true, message: '' };
};

const validateEmail = value => {
    if (!value.trim())             return { valid: false, message: "Поле обов'язкове" };
    if (!REGEX_EMAIL.test(value))  return { valid: false, message: 'Невалідний email (приклад: name@mail.com)' };
    return { valid: true, message: '' };
};

const validatePassword = value => {
    if (!value)          return { valid: false, message: "Поле обов'язкове" };
    if (value.length < 6) return { valid: false, message: 'Мінімум 6 символів' };
    return { valid: true, message: '' };
};

const validateConfirm = (value, password) => {
    if (!value)            return { valid: false, message: "Поле обов'язкове" };
    if (value !== password) return { valid: false, message: 'Паролі не збігаються' };
    return { valid: true, message: '' };
};

const validatePhone = value => {
    if (!value.trim())         return { valid: false, message: "Поле обов'язкове" };
    if (!REGEX_PHONE.test(value)) return { valid: false, message: 'Формат: +380XXXXXXXXX (9 цифр після +380)' };
    return { valid: true, message: '' };
};

const validateBirth = value => {
    if (!value)                return { valid: false, message: "Поле обов'язкове" };
    const birth = new Date(value);
    const today = new Date();

    if (birth > today)         return { valid: false, message: 'Дата народження не може бути у майбутньому' };

    const age = today.getFullYear() - birth.getFullYear()
            - (today < new Date(today.getFullYear(), birth.getMonth(), birth.getDate()) ? 1 : 0);
    if (age < 12)              return { valid: false, message: 'Реєстрація доступна з 12 років' };

    return { valid: true, message: '' };
};

const validateSex = value => {
    if (!value) return { valid: false, message: "Оберіть стать" };
    return { valid: true, message: '' };
};

const validateSelect = value => {
    if (!value) return { valid: false, message: "Оберіть значення зі списку" };
    return { valid: true, message: '' };
};

const validateCity = value => {
    if (!value.trim()) return { valid: false, message: "Оберіть зі списку або впишіть місто" };
    return { valid: true, message: '' };
};

const validateUsername = value => {
    if (!value.trim()) return { valid: false, message: "Поле обов'язкове" };
    return { valid: true, message: '' };
};


const setFieldState = (input, errEl, result) => {
    input.classList.toggle('valid',   result.valid);
    input.classList.toggle('invalid', !result.valid);
    if (errEl) errEl.textContent = result.message;
};

const clearFieldState = (input, errEl) => {
    input.classList.remove('valid', 'invalid');
    if (errEl) errEl.textContent = '';
};


const tabsEl = document.querySelector('.tabs');
const tabs   = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.form-panel');

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const target = tab.dataset.tab;

        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        panels.forEach(p => p.classList.remove('active'));
        document.getElementById(`panel-${target}`).classList.add('active');

        tabsEl.dataset.active = target;
    });
});


const eyeOpenSVG = `<svg class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
const eyeClosedSVG = `<svg class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path><line x1="2" y1="2" x2="22" y2="22"></line></svg>`;

document.querySelectorAll('.eye-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const input = document.getElementById(btn.dataset.target);
        if (!input) return;

        const isHidden = input.type === 'password';
        input.type = isHidden ? 'text' : 'password';
        btn.innerHTML = isHidden ? eyeClosedSVG : eyeOpenSVG;
    });
});


const countryEl = document.getElementById('reg-country');
const cityEl    = document.getElementById('reg-city');
const cityOptions = document.getElementById('city-options');

countryEl.addEventListener('change', () => {
    const country = countryEl.value;
    const cities  = CITIES[country] || [];

    cityOptions.innerHTML = '';
    cityEl.value = '';
    cityEl.disabled = !country;

    if (!country) {
        cityEl.placeholder = '— Спочатку оберіть країну —';
        clearFieldState(cityEl, document.getElementById('err-city'));
        return;
    }

    cityEl.placeholder = 'Оберіть або впишіть...';
    cities.forEach(city => {
        const opt = document.createElement('option');
        opt.value = city;
        cityOptions.appendChild(opt);
    });

    clearFieldState(cityEl, document.getElementById('err-city'));
});


const formRegister = document.getElementById('form-register');

function validateRegisterForm() {
    let isValid = true;

    const firstname = document.getElementById('reg-firstname');
    const lastname  = document.getElementById('reg-lastname');
    const email     = document.getElementById('reg-email');
    const password  = document.getElementById('reg-password');
    const confirm   = document.getElementById('reg-confirm');
    const phone     = document.getElementById('reg-phone');
    const birth     = document.getElementById('reg-birth');
    const country   = document.getElementById('reg-country');
    const city      = document.getElementById('reg-city');
    const sexInputs = document.querySelectorAll('input[name="sex"]');
    const sexVal    = [...sexInputs].find(r => r.checked)?.value || '';

    const fields = [
        [firstname, 'err-firstname', validateName(firstname.value)],
        [lastname,  'err-lastname',  validateName(lastname.value)],
        [email,     'err-email',     validateEmail(email.value)],
        [password,  'err-password',  validatePassword(password.value)],
        [confirm,   'err-confirm',   validateConfirm(confirm.value, password.value)],
        [phone,     'err-phone',     validatePhone(phone.value)],
        [birth,     'err-birth',     validateBirth(birth.value)],
        [country,   'err-country',   validateSelect(country.value)],
        [city,      'err-city',      validateCity(city.value)],
    ];

    fields.forEach(([input, errId, result]) => {
        setFieldState(input, document.getElementById(errId), result);
        if (!result.valid) isValid = false;
    });

    const sexErr = document.getElementById('err-sex');
    const sexResult = validateSex(sexVal);
    sexErr.textContent = sexResult.message;
    if (!sexResult.valid) isValid = false;

    return isValid;
}

formRegister.addEventListener('submit', e => {
    e.preventDefault();

    if (validateRegisterForm()) {
        const formData = new FormData(formRegister);

        console.log('Дані реєстрації:');
        for (const [key, value] of formData.entries()) {
            console.log(`  ${key}: ${value}`);
        }

        document.getElementById('success-register').style.display = 'block';

        formRegister.reset();

        cityOptions.innerHTML = '';
        cityEl.value = '';
        cityEl.placeholder = '— Спочатку оберіть країну —';
        cityEl.disabled = true;

        formRegister.querySelectorAll('input, select').forEach(el => {
            clearFieldState(el, null);
        });
        document.querySelectorAll('.error-msg').forEach(el => { el.textContent = ''; });

        setTimeout(() => {
            document.getElementById('success-register').style.display = 'none';
        }, 4000);
    }
});


const formLogin = document.getElementById('form-login');

function validateLoginForm() {
    let isValid = true;

    const username = document.getElementById('login-username');
    const password = document.getElementById('login-password');

    const fields = [
        [username, 'err-username',       validateUsername(username.value)],
        [password, 'err-login-password', validatePassword(password.value)],
    ];

    fields.forEach(([input, errId, result]) => {
        setFieldState(input, document.getElementById(errId), result);
        if (!result.valid) isValid = false;
    });

    return isValid;
}

formLogin.addEventListener('submit', e => {
    e.preventDefault();

    if (validateLoginForm()) {
        const formData = new FormData(formLogin);

        console.log('Дані входу:');
        for (const [key, value] of formData.entries()) {
            console.log(`  ${key}: ${value}`);
        }

        document.getElementById('success-login').style.display = 'block';

        formLogin.reset();
        formLogin.querySelectorAll('input').forEach(el => {
            clearFieldState(el, null);
        });
        document.getElementById('err-username').textContent       = '';
        document.getElementById('err-login-password').textContent = '';

        setTimeout(() => {
            document.getElementById('success-login').style.display = 'none';
        }, 3000);
    }
});


document.getElementById('reg-firstname').addEventListener('blur', function() {
    setFieldState(this, document.getElementById('err-firstname'), validateName(this.value));
});
document.getElementById('reg-lastname').addEventListener('blur', function() {
    setFieldState(this, document.getElementById('err-lastname'), validateName(this.value));
});
document.getElementById('reg-email').addEventListener('blur', function() {
    setFieldState(this, document.getElementById('err-email'), validateEmail(this.value));
});
document.getElementById('reg-password').addEventListener('blur', function() {
    setFieldState(this, document.getElementById('err-password'), validatePassword(this.value));
});
document.getElementById('reg-confirm').addEventListener('blur', function() {
    const pwd = document.getElementById('reg-password').value;
    setFieldState(this, document.getElementById('err-confirm'), validateConfirm(this.value, pwd));
});
document.getElementById('reg-phone').addEventListener('blur', function() {
    setFieldState(this, document.getElementById('err-phone'), validatePhone(this.value));
});
document.getElementById('reg-birth').addEventListener('blur', function() {
    setFieldState(this, document.getElementById('err-birth'), validateBirth(this.value));
});
document.getElementById('reg-country').addEventListener('blur', function() {
    setFieldState(this, document.getElementById('err-country'), validateSelect(this.value));
});
document.getElementById('reg-city').addEventListener('blur', function() {
    setFieldState(this, document.getElementById('err-city'), validateCity(this.value));
});

document.getElementById('login-username').addEventListener('blur', function() {
    setFieldState(this, document.getElementById('err-username'), validateUsername(this.value));
});
document.getElementById('login-password').addEventListener('blur', function() {
    setFieldState(this, document.getElementById('err-login-password'), validatePassword(this.value));
});