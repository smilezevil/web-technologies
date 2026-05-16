'use strict';

const API_URL = 'https://randomuser.me/api/';
const API_SEED = 'lab10friends';
const PER_PAGE = 30;
const DEBOUNCE_MS = 400;
const LS_USER = 'ff_user';
const LS_FAVS = 'ff_favorites';

const CITIES = {
    ukraine: ['Київ', 'Харків', 'Одеса', 'Дніпро', 'Запоріжжя', 'Львів', 'Чернівці'],
    poland:  ['Варшава', 'Краків', 'Вроцлав', 'Гданськ', 'Лодзь'],
    germany: ['Берлін', 'Мюнхен', 'Гамбург', 'Кельн', 'Франкфурт'],
    usa:     ['Нью-Йорк', 'Лос-Анджелес', 'Чикаго', 'Вашингтон', 'Фінікс'],
    france:  ['Париж', 'Марсель', 'Ліон', 'Тулуза', 'Ніцца'],
};

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const REGEX_PHONE = /^\+380\d{9}$/;

let allUsers = [];

let favorites = new Set();
const savedFavs = localStorage.getItem(LS_FAVS);
if (savedFavs) {
    const parsedFavs = JSON.parse(savedFavs);
    favorites = new Set(parsedFavs);
}

let state = {
    search: '',
    sortBy: '',
    gender: 'all',
    ageMin: '',
    ageMax: '',
    birthYear: '',
    location: '',
    email: '',
    page: 1,
    loading: false,
    apiPage: 1,
    hasMore: true,
    showFavsOnly: false
};

const dom = {
    authScreen: document.getElementById('auth-screen'),
    app: document.getElementById('app'),
    cardsGrid: document.getElementById('cards-grid'),
    loadingGrid: document.getElementById('loading-grid'),
    pagination: document.getElementById('pagination'),
    resultsCount: document.getElementById('results-count'),
    pageInfo: document.getElementById('page-info'),
    errorBanner: document.getElementById('error-banner'),
    errorText: document.getElementById('error-text'),
    emptyState: document.getElementById('empty-state'),
    searchInput: document.getElementById('search-input'),
    searchClear: document.getElementById('search-clear'),
    sortSelect: document.getElementById('sort-select'),
    ageMin: document.getElementById('age-min'),
    ageMax: document.getElementById('age-max'),
    birthYear: document.getElementById('birth-year'),
    locationFilter: document.getElementById('location-filter'),
    emailFilter: document.getElementById('email-filter'),
    favCount: document.getElementById('fav-count'),
    userBadge: document.getElementById('user-badge'),
    btnLogout: document.getElementById('btn-logout'),
    btnShowFavs: document.getElementById('btn-show-favs'),
    btnShowAll: document.getElementById('btn-show-all'),
    sentinel: document.getElementById('scroll-sentinel'),
    sidebarToggle: document.getElementById('sidebar-toggle'),
    sidebarContent: document.getElementById('sidebar-content')
};

const calcAge = (dobStr) => {
    const dob = new Date(dobStr);
    const now = new Date();
    let age = now.getFullYear() - dob.getFullYear();

    const isBeforeBirthday = now < new Date(now.getFullYear(), dob.getMonth(), dob.getDate());
    if (isBeforeBirthday) {
        age = age - 1;
    }

    return age;
};

const filterUsers = (users, currentState) => {
    const searchQuery = currentState.search.toLowerCase().trim();
    const locationQuery = currentState.location.toLowerCase().trim();
    const emailQuery = currentState.email.toLowerCase().trim();

    return users.filter((user) => {
        const age = calcAge(user.dob.date);
        const fullName = `${user.name.first} ${user.name.last}`.toLowerCase();
        const fullLocation = `${user.location.city} ${user.location.country}`.toLowerCase();
        const userEmail = user.email.toLowerCase();
        const birthYear = new Date(user.dob.date).getFullYear();

        if (searchQuery) {
            const matchName = fullName.includes(searchQuery);
            const matchEmail = userEmail.includes(searchQuery);
            const matchLocation = fullLocation.includes(searchQuery);

            if (!matchName && !matchEmail && !matchLocation) {
                return false;
            }
        }

        if (currentState.gender !== 'all') {
            if (user.gender !== currentState.gender) {
                return false;
            }
        }

        if (currentState.ageMin) {
            if (age < parseInt(currentState.ageMin)) {
                return false;
            }
        }

        if (currentState.ageMax) {
            if (age > parseInt(currentState.ageMax)) {
                return false;
            }
        }

        if (currentState.birthYear) {
            if (birthYear !== parseInt(currentState.birthYear)) {
                return false;
            }
        }

        if (locationQuery) {
            if (!fullLocation.includes(locationQuery)) {
                return false;
            }
        }

        if (emailQuery) {
            if (!userEmail.includes(emailQuery)) {
                return false;
            }
        }

        if (currentState.showFavsOnly) {
            if (!favorites.has(user.login.uuid)) {
                return false;
            }
        }

        return true;
    });
};

const sortUsers = (users, sortBy) => {
    if (!sortBy) {
        return [...users];
    }

    return [...users].sort((a, b) => {
        const nameA = `${a.name.first} ${a.name.last}`;
        const nameB = `${b.name.first} ${b.name.last}`;

        if (sortBy === 'name-az') {
            return nameA.localeCompare(nameB);
        } else if (sortBy === 'name-za') {
            return nameB.localeCompare(nameA);
        } else if (sortBy === 'age-asc') {
            return calcAge(a.dob.date) - calcAge(b.dob.date);
        } else if (sortBy === 'age-desc') {
            return calcAge(b.dob.date) - calcAge(a.dob.date);
        } else if (sortBy === 'reg-asc') {
            return new Date(a.registered.date) - new Date(b.registered.date);
        } else if (sortBy === 'reg-desc') {
            return new Date(b.registered.date) - new Date(a.registered.date);
        }

        return 0;
    });
};

const paginateUsers = (users, page, perPage) => {
    const startIndex = (page - 1) * perPage;
    const endIndex = page * perPage;
    return users.slice(startIndex, endIndex);
};

const totalPages = (count, perPage) => {
    return Math.ceil(count / perPage);
};

const buildCardHTML = (user, isFav) => {
    const age = calcAge(user.dob.date);
    const regDate = new Date(user.registered.date).toLocaleDateString('uk-UA');
    const uuid = user.login.uuid;
    const name = `${user.name.first} ${user.name.last}`;
    const locationString = `${user.location.city}, ${user.location.country}`;

    let genderLabel = '♀ Female';
    let genderClass = 'gender-female';

    if (user.gender === 'male') {
        genderLabel = '♂ Male';
        genderClass = 'gender-male';
    }

    let favClass = '';
    let favIcon = '🤍';
    let favLabel = 'Додати до обраних';

    if (isFav) {
        favClass = 'fav-active';
        favIcon = '❤️';
        favLabel = 'Видалити з обраних';
    }

    return `
    <article class="user-card" data-uuid="${uuid}">
        <button class="fav-btn ${favClass}" data-uuid="${uuid}" aria-label="${favLabel}">
            ${favIcon}
        </button>
        <div class="card-top">
            <img class="user-avatar" src="${user.picture.large}" alt="${name}" loading="lazy" />
            <span class="gender-badge ${genderClass}">${genderLabel}</span>
        </div>
        <div class="card-body">
            <h3 class="user-name" title="${name}">${name}</h3>
            <div class="user-age">${age} років</div>
            <div class="user-info">
                <div class="info-row" title="${locationString}">📍 ${locationString}</div>
                <div class="info-row" title="${user.email}">✉️ ${user.email}</div>
                <div class="info-row">📞 ${user.phone}</div>
                <div class="info-row">📅 З нами з ${regDate}</div>
            </div>
        </div>
    </article>`;
};

const debounce = (fn, delay) => {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            fn(...args);
        }, delay);
    };
};

const saveFavorites = (favSet) => {
    const favArray = Array.from(favSet);
    localStorage.setItem(LS_FAVS, JSON.stringify(favArray));
};

const saveUser = (user) => {
    localStorage.setItem(LS_USER, JSON.stringify(user));
};

const loadUser = () => {
    const savedUser = localStorage.getItem(LS_USER);
    if (savedUser) {
        return JSON.parse(savedUser);
    }
    return null;
};

const clearUser = () => {
    localStorage.removeItem(LS_USER);
};

async function fetchUsers(page, results) {
    const url = `${API_URL}?results=${results}&page=${page}&seed=${API_SEED}`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`HTTP помилка: ${response.status}`);
    }

    const data = await response.json();
    return data.results;
}

async function loadInitialUsers() {
    dom.loadingGrid.style.display = 'grid';
    dom.cardsGrid.style.display = 'none';
    dom.errorBanner.style.display = 'none';

    try {
        const page1 = fetchUsers(1, 30);
        const page2 = fetchUsers(2, 30);
        const page3 = fetchUsers(3, 30);

        const pages = await Promise.all([page1, page2, page3]);

        allUsers = pages.flat();
        state.apiPage = 3;

        renderAll();
    } catch (err) {
        dom.errorBanner.style.display = 'flex';
        dom.errorText.textContent = `Помилка: ${err.message}`;
    } finally {
        dom.loadingGrid.style.display = 'none';
        dom.cardsGrid.style.display = 'grid';
    }
}

async function loadMoreUsers() {
    if (state.loading) {
        return;
    }

    if (!state.hasMore) {
        return;
    }

    state.loading = true;

    try {
        const nextPage = state.apiPage + 1;
        const users = await fetchUsers(nextPage, 30);

        if (users.length === 0) {
            state.hasMore = false;
            return;
        }

        allUsers = allUsers.concat(users);
        state.apiPage = nextPage;

        renderAll();
    } catch (err) {
        dom.errorBanner.style.display = 'flex';
        dom.errorText.textContent = `Помилка підвантаження: ${err.message}`;
    } finally {
        state.loading = false;
    }
}

function renderAll() {
    const filtered = filterUsers(allUsers, state);
    const sorted = sortUsers(filtered, state.sortBy);

    const pagesCount = totalPages(sorted.length, PER_PAGE);

    let safePage = state.page;
    if (safePage > pagesCount && pagesCount > 0) {
        safePage = pagesCount;
    }

    state.page = safePage;

    const visibleUsers = paginateUsers(sorted, safePage, PER_PAGE);

    let htmlString = '';
    for (let i = 0; i < visibleUsers.length; i++) {
        const user = visibleUsers[i];
        const isFavorite = favorites.has(user.login.uuid);
        htmlString += buildCardHTML(user, isFavorite);
    }

    dom.cardsGrid.innerHTML = htmlString;

    if (visibleUsers.length === 0) {
        dom.emptyState.style.display = 'block';
    } else {
        dom.emptyState.style.display = 'none';
    }

    dom.resultsCount.textContent = `Знайдено: ${filtered.length} користувачів`;

    if (pagesCount > 1) {
        dom.pageInfo.textContent = `Сторінка ${safePage} з ${pagesCount}`;
    } else {
        dom.pageInfo.textContent = '';
    }

    renderPagination(pagesCount, safePage);

    dom.favCount.textContent = favorites.size;

    syncURL();
}

function renderPagination(totalP, currentP) {
    if (totalP <= 1) {
        dom.pagination.innerHTML = '';
        return;
    }

    let pagesArray = [];

    if (totalP <= 7) {
        for (let i = 1; i <= totalP; i++) {
            pagesArray.push(i);
        }
    } else {
        pagesArray.push(1);

        if (currentP > 3) {
            pagesArray.push('...');
        }

        let start = Math.max(2, currentP - 1);
        let end = Math.min(totalP - 1, currentP + 1);

        for (let i = start; i <= end; i++) {
            pagesArray.push(i);
        }

        if (currentP < totalP - 2) {
            pagesArray.push('...');
        }

        pagesArray.push(totalP);
    }

    let paginationHTML = '';

    let prevDisabled = '';
    if (currentP <= 1) {
        prevDisabled = 'disabled';
    }
    paginationHTML += `<button class="page-btn" data-page="${currentP - 1}" ${prevDisabled}>←</button>`;

    for (let i = 0; i < pagesArray.length; i++) {
        const pageItem = pagesArray[i];

        if (pageItem === '...') {
            paginationHTML += `<span class="page-dots">…</span>`;
        } else {
            let activeClass = '';
            if (pageItem === currentP) {
                activeClass = 'active';
            }
            paginationHTML += `<button class="page-btn ${activeClass}" data-page="${pageItem}">${pageItem}</button>`;
        }
    }

    let nextDisabled = '';
    if (currentP >= totalP) {
        nextDisabled = 'disabled';
    }
    paginationHTML += `<button class="page-btn" data-page="${currentP + 1}" ${nextDisabled}>→</button>`;

    dom.pagination.innerHTML = paginationHTML;
}

function syncURL() {
    const url = new URL(window.location.href);

    if (state.search) {
        url.searchParams.set('q', state.search);
    } else {
        url.searchParams.delete('q');
    }

    if (state.sortBy) {
        url.searchParams.set('sort', state.sortBy);
    } else {
        url.searchParams.delete('sort');
    }

    if (state.gender && state.gender !== 'all') {
        url.searchParams.set('gender', state.gender);
    } else {
        url.searchParams.delete('gender');
    }

    if (state.ageMin) {
        url.searchParams.set('ageMin', state.ageMin);
    } else {
        url.searchParams.delete('ageMin');
    }

    if (state.ageMax) {
        url.searchParams.set('ageMax', state.ageMax);
    } else {
        url.searchParams.delete('ageMax');
    }

    if (state.birthYear) {
        url.searchParams.set('year', state.birthYear);
    } else {
        url.searchParams.delete('year');
    }

    if (state.location) {
        url.searchParams.set('loc', state.location);
    } else {
        url.searchParams.delete('loc');
    }

    if (state.email) {
        url.searchParams.set('email', state.email);
    } else {
        url.searchParams.delete('email');
    }

    if (state.page > 1) {
        url.searchParams.set('page', state.page);
    } else {
        url.searchParams.delete('page');
    }

    history.pushState({ ...state }, '', url.toString());
}

const setFieldState = (input, errEl, result) => {
    if (result.valid) {
        input.classList.add('valid');
        input.classList.remove('invalid');
    } else {
        input.classList.add('invalid');
        input.classList.remove('valid');
    }

    if (errEl) {
        errEl.textContent = result.message;
    }
};

const validateName = (value) => {
    if (!value.trim()) {
        return { valid: false, message: "Поле обов'язкове" };
    }
    if (value.trim().length < 3 || value.trim().length > 15) {
        return { valid: false, message: 'Від 3 до 15 символів' };
    }
    return { valid: true, message: '' };
};

const validateUsername = (value) => {
    if (value.trim()) {
        return { valid: true, message: '' };
    } else {
        return { valid: false, message: "Поле обов'язкове" };
    }
};

const validateEmail = (value) => {
    if (value.trim() && REGEX_EMAIL.test(value)) {
        return { valid: true, message: '' };
    } else {
        return { valid: false, message: 'Невалідний email' };
    }
};

const validatePassword = (value) => {
    if (value.length >= 6) {
        return { valid: true, message: '' };
    } else {
        return { valid: false, message: 'Мінімум 6 символів' };
    }
};

const validateConfirm = (value, pwd) => {
    if (value === pwd && value) {
        return { valid: true, message: '' };
    } else {
        return { valid: false, message: 'Паролі не збігаються' };
    }
};

const validatePhone = (value) => {
    if (REGEX_PHONE.test(value)) {
        return { valid: true, message: '' };
    } else {
        return { valid: false, message: 'Формат: +380XXXXXXXXX' };
    }
};

const validateBirth = (value) => {
    if (!value) {
        return { valid: false, message: "Поле обов'язкове" };
    }

    const birthDate = new Date(value);
    const today = new Date();

    if (birthDate > today) {
        return { valid: false, message: 'Дата у майбутньому' };
    }

    let age = today.getFullYear() - birthDate.getFullYear();
    if (today < new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate())) {
        age = age - 1;
    }

    if (age < 12) {
        return { valid: false, message: 'Мінімум 12 років' };
    }

    return { valid: true, message: '' };
};

const validateSelect = (value) => {
    if (value) {
        return { valid: true, message: '' };
    } else {
        return { valid: false, message: "Оберіть зі списку" };
    }
};

const authTabs = document.querySelectorAll('.tab');
for (let i = 0; i < authTabs.length; i++) {
    const tab = authTabs[i];

    tab.addEventListener('click', () => {
        for (let j = 0; j < authTabs.length; j++) {
            authTabs[j].classList.remove('active');
        }

        const formPanels = document.querySelectorAll('.form-panel');
        for (let k = 0; k < formPanels.length; k++) {
            formPanels[k].classList.remove('active');
        }

        tab.classList.add('active');

        const targetPanelId = `panel-${tab.dataset.tab}`;
        document.getElementById(targetPanelId).classList.add('active');

        document.querySelector('.tabs').dataset.active = tab.dataset.tab;
    });
}

const eyeOpenSVG = `<svg class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
const eyeClosedSVG = `<svg class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path><line x1="2" y1="2" x2="22" y2="22"></line></svg>`;

const eyeButtons = document.querySelectorAll('.eye-btn');
for (let i = 0; i < eyeButtons.length; i++) {
    const btn = eyeButtons[i];

    btn.addEventListener('click', () => {
        const inputId = btn.dataset.target;
        const inputElement = document.getElementById(inputId);

        if (inputElement.type === 'password') {
            inputElement.type = 'text';
            btn.innerHTML = eyeClosedSVG;
        } else {
            inputElement.type = 'password';
            btn.innerHTML = eyeOpenSVG;
        }
    });
}

const countrySelect = document.getElementById('reg-country');
const cityInput = document.getElementById('reg-city');
const cityDatalist = document.getElementById('city-options');

countrySelect.addEventListener('change', () => {
    const selectedCountry = countrySelect.value;
    const citiesArray = CITIES[selectedCountry] || [];

    cityDatalist.innerHTML = '';
    cityInput.value = '';

    if (selectedCountry) {
        cityInput.disabled = false;
        cityInput.placeholder = 'Оберіть або впишіть...';

        for (let i = 0; i < citiesArray.length; i++) {
            const option = document.createElement('option');
            option.value = citiesArray[i];
            cityDatalist.appendChild(option);
        }
    } else {
        cityInput.disabled = true;
        cityInput.placeholder = '— Спочатку оберіть країну —';
    }

    const cityErrorElement = document.getElementById('err-city');
    setFieldState(cityInput, cityErrorElement, { valid: true, message: '' });
});

document.getElementById('form-login').addEventListener('submit', (e) => {
    e.preventDefault();

    let isValid = true;

    const usernameInput = document.getElementById('login-username');
    const usernameError = document.getElementById('err-login-username');
    const usernameValidation = validateUsername(usernameInput.value);
    setFieldState(usernameInput, usernameError, usernameValidation);
    if (!usernameValidation.valid) {
        isValid = false;
    }

    const passwordInput = document.getElementById('login-password');
    const passwordError = document.getElementById('err-login-password');
    const passwordValidation = validatePassword(passwordInput.value);
    setFieldState(passwordInput, passwordError, passwordValidation);
    if (!passwordValidation.valid) {
        isValid = false;
    }

    if (isValid) {
        const userData = {
            username: usernameInput.value,
            loggedIn: true
        };
        saveUser(userData);
        showApp();
        loadInitialUsers();
    }
});

document.getElementById('form-register').addEventListener('submit', (e) => {
    e.preventDefault();

    let isValid = true;

    const firstnameInput = document.getElementById('reg-firstname');
    const firstnameValidation = validateName(firstnameInput.value);
    setFieldState(firstnameInput, document.getElementById('err-firstname'), firstnameValidation);
    if (!firstnameValidation.valid) isValid = false;

    const lastnameInput = document.getElementById('reg-lastname');
    const lastnameValidation = validateName(lastnameInput.value);
    setFieldState(lastnameInput, document.getElementById('err-lastname'), lastnameValidation);
    if (!lastnameValidation.valid) isValid = false;

    const usernameInput = document.getElementById('reg-username');
    const usernameValidation = validateUsername(usernameInput.value);
    setFieldState(usernameInput, document.getElementById('err-reg-username'), usernameValidation);
    if (!usernameValidation.valid) isValid = false;

    const emailInput = document.getElementById('reg-email');
    const emailValidation = validateEmail(emailInput.value);
    setFieldState(emailInput, document.getElementById('err-email'), emailValidation);
    if (!emailValidation.valid) isValid = false;

    const passwordInput = document.getElementById('reg-password');
    const passwordValidation = validatePassword(passwordInput.value);
    setFieldState(passwordInput, document.getElementById('err-password'), passwordValidation);
    if (!passwordValidation.valid) isValid = false;

    const confirmInput = document.getElementById('reg-confirm');
    const confirmValidation = validateConfirm(confirmInput.value, passwordInput.value);
    setFieldState(confirmInput, document.getElementById('err-confirm'), confirmValidation);
    if (!confirmValidation.valid) isValid = false;

    const phoneInput = document.getElementById('reg-phone');
    const phoneValidation = validatePhone(phoneInput.value);
    setFieldState(phoneInput, document.getElementById('err-phone'), phoneValidation);
    if (!phoneValidation.valid) isValid = false;

    const birthInput = document.getElementById('reg-birth');
    const birthValidation = validateBirth(birthInput.value);
    setFieldState(birthInput, document.getElementById('err-birth'), birthValidation);
    if (!birthValidation.valid) isValid = false;

    const countryInput = document.getElementById('reg-country');
    const countryValidation = validateSelect(countryInput.value);
    setFieldState(countryInput, document.getElementById('err-country'), countryValidation);
    if (!countryValidation.valid) isValid = false;

    const cityInput = document.getElementById('reg-city');
    const cityValidation = validateSelect(cityInput.value);
    setFieldState(cityInput, document.getElementById('err-city'), cityValidation);
    if (!cityValidation.valid) isValid = false;

    const checkedSex = document.querySelector('input[name="sex"]:checked');
    const sexError = document.getElementById('err-sex');
    if (!checkedSex) {
        sexError.textContent = "Оберіть стать";
        isValid = false;
    } else {
        sexError.textContent = "";
    }

    if (isValid) {
        const userData = {
            username: usernameInput.value,
            loggedIn: true
        };
        saveUser(userData);
        showApp();
        loadInitialUsers();
    }
});

function showApp() {
    dom.authScreen.style.display = 'none';
    dom.app.style.display = 'block';

    const currentUser = loadUser();
    if (currentUser) {
        dom.userBadge.textContent = `👤 ${currentUser.username}`;
    }
}

dom.btnLogout.addEventListener('click', () => {
    clearUser();
    allUsers = [];
    dom.cardsGrid.innerHTML = '';

    dom.app.style.display = 'none';
    dom.authScreen.style.display = 'flex';
});

const handleSearchInput = debounce((e) => {
    state.search = e.target.value;
    state.page = 1;

    if (e.target.value) {
        dom.searchClear.style.display = 'block';
    } else {
        dom.searchClear.style.display = 'none';
    }

    renderAll();
}, DEBOUNCE_MS);

dom.searchInput.addEventListener('input', handleSearchInput);

dom.searchClear.addEventListener('click', () => {
    dom.searchInput.value = '';
    state.search = '';
    state.page = 1;
    dom.searchClear.style.display = 'none';
    renderAll();
});

dom.sortSelect.addEventListener('change', () => {
    state.sortBy = dom.sortSelect.value;
    state.page = 1;
    renderAll();
});

const genderRadios = document.querySelectorAll('input[name="gender"]');
for (let i = 0; i < genderRadios.length; i++) {
    genderRadios[i].addEventListener('change', (e) => {
        state.gender = e.target.value;
        state.page = 1;
        renderAll();
    });
}

const handleFilterInputs = debounce(() => {
    state.ageMin = dom.ageMin.value;
    state.ageMax = dom.ageMax.value;
    state.birthYear = dom.birthYear.value;
    state.location = dom.locationFilter.value;
    state.email = dom.emailFilter.value;
    state.page = 1;

    renderAll();
}, 500);

dom.ageMin.addEventListener('input', handleFilterInputs);
dom.ageMax.addEventListener('input', handleFilterInputs);
dom.birthYear.addEventListener('input', handleFilterInputs);
dom.locationFilter.addEventListener('input', handleFilterInputs);
dom.emailFilter.addEventListener('input', handleFilterInputs);

document.getElementById('btn-reset-filters').addEventListener('click', () => {
    state.search = '';
    state.sortBy = '';
    state.gender = 'all';
    state.ageMin = '';
    state.ageMax = '';
    state.birthYear = '';
    state.location = '';
    state.email = '';
    state.page = 1;
    state.showFavsOnly = false;

    dom.sortSelect.value = '';
    dom.ageMin.value = '';
    dom.ageMax.value = '';
    dom.birthYear.value = '';
    dom.locationFilter.value = '';
    dom.emailFilter.value = '';
    dom.searchInput.value = '';

    dom.searchClear.style.display = 'none';

    const allGenderRadio = document.querySelector('input[name="gender"][value="all"]');
    if (allGenderRadio) {
        allGenderRadio.checked = true;
    }

    dom.btnShowFavs.style.display = 'block';
    dom.btnShowAll.style.display = 'none';

    renderAll();
});

dom.pagination.addEventListener('click', (e) => {
    const btn = e.target.closest('.page-btn');

    if (!btn) {
        return;
    }

    if (btn.disabled) {
        return;
    }

    const newPage = parseInt(btn.dataset.page);
    state.page = newPage;

    renderAll();
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

dom.cardsGrid.addEventListener('click', (e) => {
    const btn = e.target.closest('.fav-btn');

    if (!btn) {
        return;
    }

    const uuid = btn.dataset.uuid;

    if (favorites.has(uuid)) {
        favorites.delete(uuid);
    } else {
        favorites.add(uuid);
    }

    saveFavorites(favorites);
    dom.favCount.textContent = favorites.size;

    if (state.showFavsOnly) {
        renderAll();
    } else {
        const isFav = favorites.has(uuid);

        if (isFav) {
            btn.textContent = '❤️';
            btn.classList.add('fav-active');
            btn.setAttribute('aria-label', 'Видалити з обраних');
        } else {
            btn.textContent = '🤍';
            btn.classList.remove('fav-active');
            btn.setAttribute('aria-label', 'Додати до обраних');
        }
    }
});

dom.btnShowFavs.addEventListener('click', () => {
    state.showFavsOnly = true;
    state.page = 1;
    dom.btnShowFavs.style.display = 'none';
    dom.btnShowAll.style.display = 'block';
    renderAll();
});

dom.btnShowAll.addEventListener('click', () => {
    state.showFavsOnly = false;
    state.page = 1;
    dom.btnShowFavs.style.display = 'block';
    dom.btnShowAll.style.display = 'none';
    renderAll();
});

dom.sidebarToggle.addEventListener('click', () => {
    dom.sidebarContent.classList.toggle('open');
});

const handleIntersection = (entries) => {
    const firstEntry = entries[0];

    if (firstEntry.isIntersecting) {
        if (state.loading) {
            return;
        }

        if (!state.hasMore) {
            return;
        }

        const filteredList = filterUsers(allUsers, Object.assign({}, state, { favorites: favorites }));
        const totalP = totalPages(filteredList.length, PER_PAGE);

        if (totalP <= state.page) {
            loadMoreUsers();
        }
    }
};

const scrollObserver = new IntersectionObserver(handleIntersection, { threshold: 0.1 });
scrollObserver.observe(dom.sentinel);

const existingUser = loadUser();
if (existingUser && existingUser.loggedIn) {
    showApp();
    loadInitialUsers();
} else {
    dom.authScreen.style.display = 'flex';
}