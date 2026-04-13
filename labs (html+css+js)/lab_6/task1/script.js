let state = {
    products: [
        createProduct('iPhone 17', 46799, 'Електроніка',
                'https://files.foxtrot.com.ua/PhotoNew/img_0_60_12262_0_1_YHUkWD.jpg',
                'Флагманський смартфон Apple з чіпом A19, камерою 48 МП та Dynamic Island.'),

        createProduct('Jacket Canada Goose', 56790, 'Одяг',
                'https://images.canadagoose.com/image/upload/,c_scale,f_auto,q_auto/v1754405913/product-image/2747M_61_b.jpg',
                'Тепла зимова куртка з водовідштовхувальним покриттям, підходить для -30°C.'),

        createProduct('Demon Slayer: Kimetsu no Yaiba', 260, 'Книги',
                'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcT23cxuEMDlwTqXA0jznKzvj0dkKQMf1QezyFRDygbBwUSg2kTxwJ23I33ShC2t_xwO5Z9MMBYHpjBtqhAqF3SOkIHAs9QkrPq6m08hK5_1Kri8Kh8FXk_OD9ugowHvFhqn9Oe8Pw&usqp=CAc',
                'Манга “Клинок, який знищує демонів” Том 1'),
        createProduct('Attack On Titan', 240, 'Книги',
                'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcSPbgGs6QQlGj7b8m0GkC22fGx5RlCf_ShPaFkRq-_nBPFFNfXnX1RfnbN0t02zwKw6EoMTOmk0AoxTuqTsoMyy9mITxKY4pEjbo2A4JbD-iTtet3WL9eMdnXmN5rBv6SUjbal5NoOa&usqp=CAc',
                'Манга "Атака Титанів" Том 1'),
        createProduct('Shorts NIKE', 1699, 'Одяг',
                'data:image/webp;base64,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',
                'Шорти чоловічі Nike Challenger Dri-Fit (black)'),
        createProduct('BMW M3 Competition', 8383211, 'Автомобілі',
                'https://cdn.riastatic.com/photosnewr/auto/new_auto_storage/bmw-m3__3700673-1024x768x90.webp',
                'Новий BMW M3 2025 G81(FL) Competition 3.0 M Steptronic (530 к.с.) M xDrive')
    ],
    filter:  null,
    sortKey: null,
};


function createProduct(name, price, category, image, description) {
    return {
        id:          'prod-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
        name:        name.trim(),
        price:       parseFloat(price),
        category,
        description: description ? description.trim() : '',
        image:       image || 'https://placehold.co/600x400/1f1f27/7a7a96?text=' + encodeURIComponent(name),
        createdAt:   Date.now(),
        updatedAt:   Date.now(),
    };
}

const addProduct = (products, product) => [...products, product];

const removeProduct = (products, id) => products.filter(p => p.id !== id);

const updateProduct = (products, id, changes) =>
        products.map(p => p.id === id
                ? { ...p, ...changes, updatedAt: Date.now() }
                : p
        );

const filterProducts = (products, category) =>
        category ? products.filter(p => p.category === category) : products;

const sortProducts = (products, key) => {
    if (!key) return [...products];
    return [...products].sort((a, b) =>
            key === 'price' ? a.price - b.price : a[key] - b[key]
    );
};

const getTotalPrice = products =>
        products.reduce((sum, p) => sum + p.price, 0);

const getCategories = products => [...new Set(products.map(p => p.category))];

const formatPrice = value =>
        value.toLocaleString('uk-UA', { style: 'currency', currency: 'UAH' });

const escapeHtml = str =>
        String(str)
                .replace(/&/g,'&amp;')
                .replace(/</g,'&lt;')
                .replace(/>/g,'&gt;')
                .replace(/"/g,'&quot;');


const $list       = document.getElementById('product-list');
const $emptyMsg   = document.getElementById('empty-msg');
const $totalPrice = document.getElementById('total-price');
const $filterGrp  = document.getElementById('filter-group');
const $sortGrp    = document.getElementById('sort-group');

function renderTotalPrice(products) {
    $totalPrice.innerHTML =
            `Загальна вартість: <strong>${formatPrice(getTotalPrice(products))}</strong>`;
}

const renderEmptyMessage = count => {
    $emptyMsg.style.display = count === 0 ? 'block' : 'none';
};

function createProductCard(product) {
    const li = document.createElement('li');
    li.className = 'product-card';
    li.dataset.id = product.id;

    const createdDate = new Date(product.createdAt).toLocaleDateString('uk-UA');
    const updatedDate = new Date(product.updatedAt).toLocaleDateString('uk-UA');

    li.innerHTML = `
    <img class="card-img" src="${escapeHtml(product.image)}"
         alt="${escapeHtml(product.name)}"
         onerror="this.src='https://placehold.co/600x400/1f1f27/7a7a96?text=No+Image'" />
    <div class="card-body">
      <span class="card-id">ID: ${escapeHtml(product.id)}</span>
      <span class="card-name">${escapeHtml(product.name)}</span>
      <span class="card-price">${formatPrice(product.price)}</span>
      ${product.description
            ? `<p class="card-desc">${escapeHtml(product.description)}</p>`
            : ''}
      <div class="card-meta">
        <span class="card-category">${escapeHtml(product.category)}</span>
        <span class="card-date">
          Додано: ${createdDate}
          ${product.updatedAt !== product.createdAt ? ` · Оновлено: ${updatedDate}` : ''}
        </span>
      </div>
    </div>
    <div class="card-actions">
      <button class="btn-edit"   data-id="${product.id}">✏ Редагувати</button>
      <button class="btn-delete" data-id="${product.id}">🗑 Видалити</button>
    </div>`;
    return li;
}

function renderProducts(products, filter, sortKey) {
    const visible = sortProducts(filterProducts(products, filter), sortKey);
    $list.innerHTML = '';
    visible.forEach(p => $list.appendChild(createProductCard(p)));
    renderEmptyMessage(visible.length);
    renderTotalPrice(products);
}

function renderFilters(products, activeFilter) {
    $filterGrp.innerHTML = '';
    getCategories(products).forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn' + (cat === activeFilter ? ' active' : '');
        btn.textContent = cat;
        btn.addEventListener('click', () => handleFilterClick(cat));
        $filterGrp.appendChild(btn);
    });
}

function renderSortButtons(activeSortKey) {
    const sorts = [
        { key: 'price',     label: 'За ціною' },
        { key: 'createdAt', label: 'За датою створення' },
        { key: 'updatedAt', label: 'За датою оновлення' },
    ];
    $sortGrp.innerHTML = '';
    sorts.forEach(({ key, label }) => {
        const btn = document.createElement('button');
        btn.className = 'sort-btn' + (key === activeSortKey ? ' active' : '');
        btn.textContent = label;
        btn.addEventListener('click', () => handleSortClick(key));
        $sortGrp.appendChild(btn);
    });
}

function render() {
    renderProducts(state.products, state.filter, state.sortKey);
    renderFilters(state.products, state.filter);
    renderSortButtons(state.sortKey);
}


const $modal      = document.getElementById('modal');
const $modalTitle = document.getElementById('modal-title');
const $fieldId    = document.getElementById('field-id');
const $fieldName  = document.getElementById('field-name');
const $fieldPrice = document.getElementById('field-price');
const $fieldCat   = document.getElementById('field-category');
const $fieldImg   = document.getElementById('field-image');
const $fieldDesc  = document.getElementById('field-desc');

const toggleModal = open => {
    $modal.classList.toggle('open', open);
    if (open) $fieldName.focus();
};

const fillModal = product => {
    $fieldId.value    = product.id;
    $fieldName.value  = product.name;
    $fieldPrice.value = product.price;
    $fieldCat.value   = product.category;
    $fieldImg.value   = product.image;
    $fieldDesc.value = product.description || '';
};

const clearModal = () => {
    [$fieldId, $fieldName, $fieldPrice, $fieldImg, $fieldDesc].forEach(el => el.value = '');
    $fieldCat.value = '';
};

const readModalFields = () => ({
    id:          $fieldId.value,
    name:        $fieldName.value,
    price:       $fieldPrice.value,
    category:    $fieldCat.value,
    image:       $fieldImg.value,
    description: $fieldDesc.value,
});

const validateFields = fields =>
        fields.name.trim().length >= 2 &&
        parseFloat(fields.price) > 0 &&
        fields.category !== '';


const $toastContainer = document.getElementById('toast-container');

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = 'toast' + (type === 'error' ? ' error' : '');
    toast.textContent = message;
    $toastContainer.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('leaving');
        toast.addEventListener('animationend', () => toast.remove(), { once: true });
    }, 2700);
}


function handleAddClick() {
    $modalTitle.textContent = 'Новий товар';
    clearModal();
    toggleModal(true);
}

function handleSaveClick() {
    const fields = readModalFields();
    const allValid = [$fieldName, $fieldPrice, $fieldCat].every(el => el.reportValidity());
    if (!allValid || !validateFields(fields)) return;

    if (fields.id) {
        state = {
            ...state,
            products: updateProduct(state.products, fields.id, {
                name:        fields.name.trim(),
                price:       parseFloat(fields.price),
                category:    fields.category,
                image:       fields.image,
                description: fields.description,
            }),
        };
        const updated = state.products.find(p => p.id === fields.id);
        showToast(`Оновлено: [${updated.id}] ${updated.name}`);
    } else {
        const newProd = createProduct(fields.name, fields.price, fields.category, fields.image, fields.description);
        state = { ...state, products: addProduct(state.products, newProd) };
        showToast(`Додано товар: ${newProd.name}`);
    }

    toggleModal(false);
    render();
}

function handleListClick(e) {
    const id = e.target.dataset.id;
    if (!id) return;

    if (e.target.classList.contains('btn-delete')) {
        const card = $list.querySelector(`[data-id="${id}"]`);
        const product = state.products.find(p => p.id === id);
        if (card) {
            card.classList.add('removing');
            card.addEventListener('animationend', () => {
                state = { ...state, products: removeProduct(state.products, id) };
                render();
                showToast(`🗑 Видалено товар: ${product.name}`);
            }, { once: true });
        }
    }

    if (e.target.classList.contains('btn-edit')) {
        const product = state.products.find(p => p.id === id);
        if (!product) return;
        $modalTitle.textContent = 'Редагувати товар';
        fillModal(product);
        toggleModal(true);
    }
}

const handleFilterClick = category => {
    state = { ...state, filter: state.filter === category ? null : category };
    render();
};

const handleSortClick = key => {
    state = { ...state, sortKey: state.sortKey === key ? null : key };
    render();
};

document.getElementById('add-btn').addEventListener('click', handleAddClick);
document.getElementById('modal-save').addEventListener('click', handleSaveClick);
document.getElementById('modal-cancel').addEventListener('click', () => toggleModal(false));
document.getElementById('reset-filter-btn').addEventListener('click', () => {
    state = { ...state, filter: null };
    render();
});
document.getElementById('reset-sort-btn').addEventListener('click', () => {
    state = { ...state, sortKey: null };
    render();
});
$list.addEventListener('click', handleListClick);
$modal.addEventListener('click', e => { if (e.target === $modal) toggleModal(false); });
document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && $modal.classList.contains('open')) toggleModal(false);
});

render();