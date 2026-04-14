let state = {
    tasks:   [
        createTask('Підготуватися до контрольної роботи'),
        { ...createTask('Здати лабораторні роботи з JS, Java, Database'), done: true },
        createTask('Сходити в зал'),
        createTask('Прочитати книгу'),
    ],
    sortKey: null,
};


function createTask(text) {
    return {
        id:        'task-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
        text:      text.trim(),
        done:      false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
    };
}

const addTask = (tasks, task) => [...tasks, task];

const removeTask = (tasks, id) => tasks.filter(t => t.id !== id);

const updateTask = (tasks, id, changes) =>
        tasks.map(t => t.id === id
                ? { ...t, ...changes, updatedAt: Date.now() }
                : t
        );

const toggleDone = (tasks, id) =>
        tasks.map(t => t.id === id
                ? { ...t, done: !t.done, updatedAt: Date.now() }
                : t
        );

const sortTasks = (tasks, key) => {
    if (!key) return [...tasks];
    if (key === 'done') {
        return [...tasks].sort((a, b) => Number(a.done) - Number(b.done));
    }
    return [...tasks].sort((a, b) => a[key] - b[key]);
};

const countDone  = tasks => tasks.filter(t => t.done).length;
const countTotal = tasks => tasks.length;

const formatDate = ts =>
        new Date(ts).toLocaleString('uk-UA', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });


const $list      = document.getElementById('task-list');
const $emptyMsg  = document.getElementById('empty-msg');
const $countTotal = document.getElementById('count-total');
const $countDone  = document.getElementById('count-done');
const $sortGrp   = document.getElementById('sort-group');

function renderCounter(tasks) {
    $countTotal.textContent = countTotal(tasks);
    $countDone.textContent  = countDone(tasks);
}

const renderEmptyMessage = count => {
    $emptyMsg.style.display = count === 0 ? 'block' : 'none';
};

function createTaskItem(task) {
    const li = document.createElement('li');
    li.className = 'task-item' + (task.done ? ' done' : '');
    li.dataset.id = task.id;

    const dateLabel = task.updatedAt !== task.createdAt
            ? `Оновлено: ${formatDate(task.updatedAt)}`
            : `Додано: ${formatDate(task.createdAt)}`;

    li.innerHTML = `
    <button class="task-checkbox" data-action="toggle" data-id="${task.id}" title="Позначити виконаним">
      ${task.done ? '✓' : ''}
    </button>
    <div class="task-content">
      <span class="task-text">${escapeHtml(task.text)}</span>
      <input class="task-edit-input"
             type="text"
             value="${escapeHtml(task.text)}"
             maxlength="120"
             required
             minlength="2" />
      <span class="task-date">${dateLabel}</span>
    </div>
    <div class="task-actions">
      <button class="btn-task btn-edit-task"   data-action="edit"   data-id="${task.id}">✏ Редагувати</button>
      <button class="btn-task btn-save-task"   data-action="save"   data-id="${task.id}">Зберегти</button>
      <button class="btn-task btn-delete-task" data-action="delete" data-id="${task.id}">🗑 Видалити</button>
    </div>`;

    return li;
}

function renderTasks(tasks, sortKey) {
    const sorted = sortTasks(tasks, sortKey);
    $list.innerHTML = '';
    sorted.forEach(t => $list.appendChild(createTaskItem(t)));
    renderEmptyMessage(tasks.length);
    renderCounter(tasks);
}

function renderSortButtons(activeSortKey) {
    const sorts = [
        { key: 'createdAt', label: 'За датою додавання' },
        { key: 'done',      label: 'За виконанням' },
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
    renderTasks(state.tasks, state.sortKey);
    renderSortButtons(state.sortKey);
}

function handleAddSubmit(e) {
    e.preventDefault();
    const input = document.getElementById('new-task-input');

    if (!input.reportValidity()) return;
    if (input.value.trim().length < 2) return;

    const task = createTask(input.value);
    state = { ...state, tasks: addTask(state.tasks, task) };
    input.value = '';
    render();
}

function handleListClick(e) {
    const action = e.target.dataset.action;
    const id     = e.target.dataset.id;
    if (!action || !id) return;

    if (action === 'toggle') {
        state = { ...state, tasks: toggleDone(state.tasks, id) };
        render();
    }

    if (action === 'edit') {
        const li        = $list.querySelector(`[data-id="${id}"]`);
        const textEl    = li.querySelector('.task-text');
        const inputEl   = li.querySelector('.task-edit-input');
        const editBtn   = li.querySelector('.btn-edit-task');
        const saveBtn   = li.querySelector('.btn-save-task');

        textEl.classList.add('hidden');
        inputEl.classList.add('active');
        saveBtn.classList.add('active');
        editBtn.style.display = 'none';
        inputEl.focus();
    }

    if (action === 'save') {
        const li      = $list.querySelector(`[data-id="${id}"]`);
        const inputEl = li.querySelector('.task-edit-input');

        if (!inputEl.reportValidity()) return;
        const newText = inputEl.value.trim();
        if (newText.length < 2) return;

        state = { ...state, tasks: updateTask(state.tasks, id, { text: newText }) };
        render();
    }

    if (action === 'delete') {
        const li = $list.querySelector(`[data-id="${id}"]`);
        if (!li) return;
        li.classList.add('removing');
        li.addEventListener('animationend', () => {
            state = { ...state, tasks: removeTask(state.tasks, id) };
            render();
        }, { once: true });
    }
}

const handleSortClick = key => {
    state = { ...state, sortKey: state.sortKey === key ? null : key };
    render();
};

function handleListKeydown(e) {
    if (e.key !== 'Enter') return;
    const inputEl = e.target.closest('.task-edit-input');
    if (!inputEl) return;
    const li = inputEl.closest('.task-item');
    const id = li.dataset.id;
    const saveBtn = li.querySelector('.btn-save-task');
    saveBtn.click();
}


const escapeHtml = str =>
        String(str)
                .replace(/&/g,'&amp;')
                .replace(/</g,'&lt;')
                .replace(/>/g,'&gt;')
                .replace(/"/g,'&quot;');


document.getElementById('add-form').addEventListener('submit', handleAddSubmit);
$list.addEventListener('click',   handleListClick);
$list.addEventListener('keydown', handleListKeydown);
document.getElementById('reset-sort-btn').addEventListener('click', () => {
    state = { ...state, sortKey: null };
    render();
});

render();