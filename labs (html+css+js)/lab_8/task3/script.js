'use strict';

const INITIAL_CARDS = [
    {
        id:       'card-1',
        col:      'todo',
        title:    'Налаштувати CI/CD pipeline',
        desc:     'Підключити GitHub Actions для автодеплою',
        priority: 'high',
        tags:     ['DevOps', 'GitHub'],
        assignee: 'Nastya',
    },
    {
        id:       'card-2',
        col:      'todo',
        title:    'Написати unit тести',
        desc:     'Покрити основні функції тестами Jest',
        priority: 'medium',
        tags:     ['Testing', 'Jest'],
        assignee: 'Vanya',
    },
    {
        id:       'card-3',
        col:      'todo',
        title:    'Оновити документацію API',
        priority: 'low',
        tags:     ['Docs'],
        assignee: 'Nastya',
    },
    {
        id:       'card-4',
        col:      'todo',
        title:    'Додати темну тему',
        desc:     'Реалізувати перемикач light/dark mode',
        priority: 'low',
        tags:     ['UI', 'CSS'],
        assignee: 'Kate',
    },
    {
        id:       'card-5',
        col:      'progress',
        title:    'Розробити компонент слайдера',
        desc:     'Карусель з autoplay та dot-навігацією',
        priority: 'high',
        tags:     ['JS', 'UI'],
        assignee: 'Nastya',
    },
    {
        id:       'card-6',
        col:      'progress',
        title:    'Оптимізація зображень',
        desc:     'WebP конвертація, lazy loading',
        priority: 'medium',
        tags:     ['Performance'],
        assignee: 'Vanya',
    },
    {
        id:       'card-7',
        col:      'progress',
        title:    'Рефакторинг Auth модуля',
        priority: 'high',
        tags:     ['Backend', 'Security'],
        assignee: 'Vanya',
    },
    {
        id:       'card-8',
        col:      'review',
        title:    'Memory Pair Game',
        desc:     'Перевірити логіку пар та таймер',
        priority: 'medium',
        tags:     ['Game', 'JS'],
        assignee: 'Nastya',
    },
    {
        id:       'card-9',
        col:      'review',
        title:    'Адаптивна верстка лендінгу',
        desc:     'Перевірити на мобільних пристроях',
        priority: 'medium',
        tags:     ['CSS', 'Mobile'],
        assignee: 'Kate',
    },
    {
        id:       'card-10',
        col:      'done',
        title:    'Kanban Board (Drag & Drop)',
        desc:     'Реалізовано HTML Drag and Drop API',
        priority: 'high',
        tags:     ['JS', 'UI'],
        assignee: 'Nastya',
    },
    {
        id:       'card-11',
        col:      'done',
        title:    'Налаштувати ESLint',
        priority: 'low',
        tags:     ['DX'],
        assignee: 'Vanya',
    },
    {
        id:       'card-12',
        col:      'done',
        title:    'Деплой на GitHub Pages',
        desc:     'Всі лабораторні опубліковані',
        priority: 'medium',
        tags:     ['DevOps'],
        assignee: 'Nastya',
    },
];


let state = {
    cards:       INITIAL_CARDS,
    draggingId:  null,
    dragOverCol: null,
};



const getCardsByCol = (cards, col) =>
        cards.filter(c => c.col === col);

const moveCard = (cards, cardId, newCol) =>
        cards.map(c => c.id === cardId ? { ...c, col: newCol } : c);

const buildCardHTML = card => `
  <div class="card-header">
    <span class="card-title">${card.title}</span>
    <span class="card-priority priority-${card.priority}">
      ${card.priority === 'high' ? 'High' : card.priority === 'medium' ? 'Med' : 'Low'}
    </span>
  </div>
  ${card.desc ? `<p class="card-desc">${card.desc}</p>` : ''}
  ${card.tags?.length ? `
    <div class="card-tags">
      ${card.tags.map(t => `<span class="card-tag">${t}</span>`).join('')}
    </div>` : ''}
  ${card.assignee ? `
    <div class="card-footer">
      <span class="card-assignee">👤 ${card.assignee}</span>
    </div>` : ''}`;



const COLUMNS = ['todo', 'progress', 'review', 'done'];

function renderBoard() {
    COLUMNS.forEach(col => {
        const body  = document.getElementById(`body-${col}`);
        const count = document.getElementById(`count-${col}`);
        const cards = getCardsByCol(state.cards, col);

        body.innerHTML  = '';
        count.textContent = cards.length;

        cards.forEach(card => {
            const el = createCardElement(card);
            body.appendChild(el);
        });
    });
}

function createCardElement(card) {
    const el = document.createElement('div');
    el.className    = 'card';
    el.id           = card.id;
    el.draggable    = true;
    el.innerHTML    = buildCardHTML(card);
    el.dataset.id   = card.id;
    el.dataset.col  = card.col;


    el.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', card.id);
        e.dataTransfer.effectAllowed = 'move';

        state = { ...state, draggingId: card.id };

        setTimeout(() => el.classList.add('dragging'), 0);
    });

    el.addEventListener('dragend', () => {
        el.classList.remove('dragging');
        removePlaceholder();
        removeAllDragOver();
        state = { ...state, draggingId: null, dragOverCol: null };
    });

    return el;
}

function initColumnEvents() {
    COLUMNS.forEach(col => {
        const body   = document.getElementById(`body-${col}`);
        const column = document.getElementById(`col-${col}`);


        body.addEventListener('dragover', e => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';

            if (state.dragOverCol !== col) {
                state = { ...state, dragOverCol: col };
                removeAllDragOver();
                column.classList.add('drag-over');
                showPlaceholder(body);
            }
        });


        body.addEventListener('dragleave', e => {
            if (!body.contains(e.relatedTarget)) {
                column.classList.remove('drag-over');
                removePlaceholder();
                state = { ...state, dragOverCol: null };
            }
        });

        body.addEventListener('drop', e => {
            e.preventDefault();

            const cardId = e.dataTransfer.getData('text/plain');
            if (!cardId) return;

            const card = state.cards.find(c => c.id === cardId);
            if (card && card.col !== col) {
                state = {
                    ...state,
                    cards: moveCard(state.cards, cardId, col),
                };
                renderBoard();
                initColumnEvents();
            }

            column.classList.remove('drag-over');
            removePlaceholder();
            state = { ...state, dragOverCol: null };
        });
    });
}

function showPlaceholder(body) {
    removePlaceholder(); // спочатку прибираємо старий
    const ph = document.createElement('div');
    ph.className = 'card-placeholder';
    ph.id        = 'drag-placeholder';
    body.appendChild(ph);
}

function removePlaceholder() {
    const ph = document.getElementById('drag-placeholder');
    if (ph) ph.remove();
}

const removeAllDragOver = () => {
    document.querySelectorAll('.column').forEach(c =>
            c.classList.remove('drag-over')
    );
};


renderBoard();
initColumnEvents();