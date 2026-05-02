'use strict';

const INITIAL_LANGS = [
    { id: 'js',   name: 'JavaScript', sub: 'веб / скрипти',        icon: '🟨' },
    { id: 'py',   name: 'Python',     sub: 'дані / AI',            icon: '🐍' },
    { id: 'java', name: 'Java',       sub: 'бекенд / ентерпрайз',  icon: '☕' },
    { id: 'ts',   name: 'TypeScript', sub: 'типізований JS',       icon: '🔷' },
    { id: 'rs',   name: 'Rust',       sub: 'системи / швидкість',  icon: '🦀' },
    { id: 'go',   name: 'Go',         sub: 'хмара / мікросервіси', icon: '🐹' },
    { id: 'kt',   name: 'Kotlin',     sub: 'Android / JVM',        icon: '💜' },
    { id: 'sw',   name: 'Swift',      sub: 'iOS / macOS',          icon: '🍎' },
    { id: 'cpp',  name: 'C++',        sub: 'ігри / системи',       icon: '⚡' },
    { id: 'php',  name: 'PHP',        sub: 'веб / сервер',         icon: '🐘' },
];

const removeItem    = (arr, id)              => arr.filter(i => i.id !== id);
const buildCardHTML = lang                   => `
  <button class="card-delete" aria-label="Видалити">×</button>
  <div class="card-icon">${lang.icon}</div>
  <div class="card-name">${lang.name}</div>
  <div class="card-sub">${lang.sub}</div>`;

let langs    = [...INITIAL_LANGS];
let editMode = false;


const grid    = document.getElementById('grid');
const btnEdit = document.getElementById('btn-edit');
const hintEl  = document.getElementById('toolbar-hint');


let draggingEl  = null;
let placeholder = null;


function renderGrid() {
    grid.innerHTML = '';
    grid.classList.toggle('edit-mode', editMode);

    langs.forEach((lang, idx) => {
        const el = document.createElement('div');
        el.className      = 'card';
        el.dataset.id     = lang.id;
        el.innerHTML      = buildCardHTML(lang);

        if (editMode) {
            el.style.animationDelay = `${(idx % 4) * 0.1}s`;
            el.draggable = true;

            el.querySelector('.card-delete').addEventListener('click', e => {
                e.stopPropagation();
                el.classList.add('removing');
                el.addEventListener('animationend', () => {
                    langs = removeItem(langs, lang.id);
                    renderGrid();
                }, { once: true });
            });

            el.addEventListener('dragstart', onDragStart);
            el.addEventListener('dragend',   onDragEnd);
        }

        grid.appendChild(el);
    });
}


function onDragStart(e) {
    draggingEl = e.currentTarget;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', draggingEl.dataset.id);

    setTimeout(() => {
        if (draggingEl) {
            draggingEl.classList.add('dragging');

            placeholder = document.createElement('div');
            placeholder.className = 'card card-placeholder';
            placeholder.id        = 'drag-placeholder';

            draggingEl.after(placeholder);

            draggingEl.style.display = 'none';
        }
    }, 0);
}

function onDragEnd() {
    if (draggingEl) {
        draggingEl.classList.remove('dragging');
        draggingEl.style.display = '';
    }

    if (placeholder && placeholder.parentNode) {
        placeholder.parentNode.insertBefore(draggingEl, placeholder);
        placeholder.remove();
    }

    const newOrder = [...grid.querySelectorAll('.card[data-id]')]
            .map(el => el.dataset.id);

    langs = newOrder
            .map(id => langs.find(l => l.id === id))
            .filter(Boolean);

    draggingEl  = null;
    placeholder = null;

    renderGrid();
}


grid.addEventListener('dragover', e => {
    e.preventDefault();
    if (!editMode || !draggingEl || !placeholder) return;

    const overCard = e.target.closest('.card[data-id]');
    if (!overCard || overCard === draggingEl) return;

    const allItems = [...grid.querySelectorAll('.card')];
    const placeholderIndex = allItems.indexOf(placeholder);
    const overIndex = allItems.indexOf(overCard);

    if (placeholderIndex < overIndex) {
        overCard.after(placeholder);
    } else {
        grid.insertBefore(placeholder, overCard);
    }
});

grid.addEventListener('drop', e => {
    e.preventDefault();
});

function toggleEditMode() {
    editMode = !editMode;

    if (editMode) {
        btnEdit.textContent = 'Готово';
        btnEdit.classList.add('done-mode');
        hintEl.textContent  = 'Перетягуйте картки або натискайте × щоб видалити';
    } else {
        btnEdit.textContent = 'Редагувати';
        btnEdit.classList.remove('done-mode');
        hintEl.textContent  = 'Натисніть «Редагувати» для керування картками';
    }

    renderGrid();
}

btnEdit.addEventListener('click', toggleEditMode);

renderGrid();