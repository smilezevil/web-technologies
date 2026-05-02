'use strict';

const ALL_EMOJIS = [
    '🐶','🐱','🐭','🐹','🐰','🦊',
    '🐻','🐼','🐨','🦁','🐯','🐸',
    '🐙','🦋','🦄','🐬','🦀','🐢',
    '🦉','🦚','🦜','🐳','🦈','🐝',
];

const DIFFICULTY_TIME = { easy: 180, normal: 120, hard: 60 };

const DEFAULT_SETTINGS = {
    players:    1,
    nameP1:     'Гравець 1',
    nameP2:     'Гравець 2',
    cols:       4,
    rows:       4,
    difficulty: 'easy',
    rounds:     1,
};


const shuffleArray = arr =>
        [...arr].sort(() => Math.random() - 0.5);

const createDeck = (cols, rows) => {
    const pairsCount = (cols * rows) / 2;
    const emojis = ALL_EMOJIS.slice(0, pairsCount);
    const paired = shuffleArray([...emojis, ...emojis]);
    return paired.map((emoji, idx) => ({
        id:      idx,
        emoji,
        matched: false,
        flipped: false,
    }));
};

const formatTime = secs => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
};

const calcWinner = roundStats => {
    if (roundStats.length === 0) return null;
    return roundStats.reduce((best, curr) =>
            curr.moves < best.moves ||
            (curr.moves === best.moves && curr.time < best.time)
                    ? curr : best
    );
};

const getPlayerSummary = (allRoundsStats, playerCount) =>
        Array.from({ length: playerCount }, (_, i) => ({
            name:       allRoundsStats[0]?.[i]?.name ?? `Гравець ${i+1}`,
            totalMoves: allRoundsStats.reduce((s, r) => s + (r[i]?.moves ?? 0), 0),
            totalTime:  allRoundsStats.reduce((s, r) => s + (r[i]?.time  ?? 0), 0),
        }));

let settings = { ...DEFAULT_SETTINGS };

let state = {
    deck:           [],
    flipped:        [],
    matched:        0,
    moves:          0,
    currentPlayer:  0,
    scores:         [0, 0],
    timerSecs:      0,
    timerInterval:  null,
    round:          1,
    allRoundsStats: [],
    roundStartTime: null,
    locked:         false,
};


const $ = id => document.getElementById(id);

const dom = {
    setupScreen:         $('setup-screen'),
    gameScreen:          $('game-screen'),
    board:               $('board'),
    timerDisplay:        $('timer-display'),
    roundInfo:           $('round-info'),
    movesCount:          $('moves-count'),
    currentPlayerDisplay:$('current-player-display'),
    currentPlayerName:   $('current-player-name'),
    scoresDisplay:       $('scores-display'),
    scoreP1:             $('score-p1'),
    scoreP2:             $('score-p2'),
    hudNameP1:           $('hud-name-p1'),
    hudNameP2:           $('hud-name-p2'),
    hudScoreP1:          $('hud-score-p1'),
    hudScoreP2:          $('hud-score-p2'),
    modal:               $('modal'),
    modalTitle:          $('modal-title'),
    modalBody:           $('modal-body'),
    modalNext:           $('modal-next'),
    modalSettings:       $('modal-settings'),
    nameP2Row:           $('name-p2-row'),
    roundsDisplay:       $('rounds-display'),
};


document.querySelectorAll('.btn-option').forEach(btn => {
    btn.addEventListener('click', () => {
        const group = btn.dataset.group;
        const value = btn.dataset.value;

        document.querySelectorAll(`[data-group="${group}"]`)
                .forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        if (group === 'players') {
            settings = { ...settings, players: parseInt(value) };
            dom.nameP2Row.style.display = value === '2' ? 'flex' : 'none';
        }
        if (group === 'size') {
            const [c, r] = value.split('x').map(Number);
            settings = { ...settings, cols: c, rows: r };
        }
        if (group === 'diff') {
            settings = { ...settings, difficulty: value };
        }
    });
});

$('rounds-minus').addEventListener('click', () => {
    if (settings.rounds <= 1) return;
    settings = { ...settings, rounds: settings.rounds - 1 };
    dom.roundsDisplay.textContent = settings.rounds;
});
$('rounds-plus').addEventListener('click', () => {
    if (settings.rounds >= 10) return;
    settings = { ...settings, rounds: settings.rounds + 1 };
    dom.roundsDisplay.textContent = settings.rounds;
});

$('btn-reset-settings').addEventListener('click', resetSettings);

function resetSettings() {
    settings = { ...DEFAULT_SETTINGS };

    document.querySelectorAll('.btn-option').forEach(btn => {
        btn.classList.remove('active');
        const g = btn.dataset.group;
        const v = btn.dataset.value;
        if (
                (g === 'players' && v === '1') ||
                (g === 'size'    && v === '4x4') ||
                (g === 'diff'    && v === 'easy')
        ) btn.classList.add('active');
    });

    $('name-p1').value = '';
    $('name-p2').value = '';
    dom.nameP2Row.style.display = 'none';

    dom.roundsDisplay.textContent = '1';
}

$('btn-start-game').addEventListener('click', () => {
    const nameP1 = $('name-p1').value.trim() || DEFAULT_SETTINGS.nameP1;
    const nameP2 = $('name-p2').value.trim() || DEFAULT_SETTINGS.nameP2;
    settings = { ...settings, nameP1, nameP2 };
    startGame();
});


function startGame() {
    state = {
        deck:           createDeck(settings.cols, settings.rows),
        flipped:        [],
        matched:        0,
        moves:          0,
        currentPlayer:  0,
        scores:         [0, 0],
        timerSecs:      DIFFICULTY_TIME[settings.difficulty],
        timerInterval:  null,
        round:          1,
        allRoundsStats: [],
        roundStartTime: Date.now(),
        locked:         false,
    };

    dom.setupScreen.style.display = 'none';
    dom.gameScreen.style.display  = 'flex';

    dom.hudNameP1.textContent = settings.nameP1;
    dom.hudNameP2.textContent = settings.nameP2;
    dom.scoreP2.style.display = settings.players === 2 ? 'flex' : 'none';
    dom.currentPlayerDisplay.style.display = settings.players === 2 ? 'block' : 'none';

    renderBoard();
    renderHUD();
    startTimer();
}

function startRound() {
    state = {
        ...state,
        deck:           createDeck(settings.cols, settings.rows),
        flipped:        [],
        matched:        0,
        moves:          0,
        currentPlayer:  0,
        scores:         [0, 0],
        timerSecs:      DIFFICULTY_TIME[settings.difficulty],
        roundStartTime: Date.now(),
        locked:         false,
    };

    renderBoard();
    renderHUD();
    startTimer();
}



function renderBoard() {
    dom.board.innerHTML = '';
    dom.board.style.gridTemplateColumns = `repeat(${settings.cols}, 1fr)`;

    state.deck.forEach((card, idx) => {
        const el = document.createElement('div');
        el.className = 'card' +
                (card.flipped || card.matched ? ' flipped' : '') +
                (card.matched ? ' matched' : '');
        el.dataset.idx = idx;

        el.innerHTML = `
      <div class="card-inner">
        <div class="card-back">🃏</div>
        <div class="card-front">${card.emoji}</div>
      </div>`;

        el.addEventListener('click', () => handleCardClick(idx));
        dom.board.appendChild(el);
    });
}

function renderHUD() {
    dom.timerDisplay.textContent = formatTime(state.timerSecs);
    dom.timerDisplay.classList.toggle('warning', state.timerSecs <= 10);

    dom.movesCount.textContent = state.moves;
    dom.roundInfo.textContent  = `Раунд ${state.round} / ${settings.rounds}`;

    dom.hudScoreP1.textContent = state.scores[0];
    dom.hudScoreP2.textContent = state.scores[1];

    dom.scoreP1.classList.toggle('active-player', state.currentPlayer === 0);
    dom.scoreP2.classList.toggle('active-player', state.currentPlayer === 1);

    dom.currentPlayerName.textContent =
            state.currentPlayer === 0 ? settings.nameP1 : settings.nameP2;
}



function handleCardClick(idx) {
    const card = state.deck[idx];

    if (state.locked)         return;
    if (card.flipped)         return;
    if (card.matched)         return;
    if (state.flipped.length >= 2) return;

    state = {
        ...state,
        deck:    state.deck.map((c, i) => i === idx ? { ...c, flipped: true } : c),
        flipped: [...state.flipped, idx],
    };

    flipCardDOM(idx, true);

    if (state.flipped.length === 2) {
        state = { ...state, moves: state.moves + 1 };
        checkMatch();
    }
}

const flipCardDOM = (idx, isFlipped) => {
    const el = dom.board.querySelector(`[data-idx="${idx}"]`);
    if (!el) return;
    el.classList.toggle('flipped', isFlipped);
};

function checkMatch() {
    const [i1, i2] = state.flipped;
    const isMatch = state.deck[i1].emoji === state.deck[i2].emoji;

    if (isMatch) {
        handleMatch(i1, i2);
    } else {
        handleMismatch(i1, i2);
    }
}

function handleMatch(i1, i2) {
    const newScores = state.scores.map((s, i) =>
            i === state.currentPlayer ? s + 1 : s
    );

    state = {
        ...state,
        deck:    state.deck.map((c, i) =>
                i === i1 || i === i2 ? { ...c, matched: true, flipped: true } : c
        ),
        flipped: [],
        matched: state.matched + 1,
        scores:  newScores,
    };

    [i1, i2].forEach(idx => {
        const el = dom.board.querySelector(`[data-idx="${idx}"]`);
        if (el) el.classList.add('matched', 'flipped');
    });

    renderHUD();

    const totalPairs = (settings.cols * settings.rows) / 2;
    if (state.matched === totalPairs) {
        setTimeout(handleRoundEnd, 600);
    }
}

function handleMismatch(i1, i2) {
    state = { ...state, locked: true };

    [i1, i2].forEach(idx => {
        const el = dom.board.querySelector(`[data-idx="${idx}"]`);
        if (el) el.classList.add('wrong');
    });

    setTimeout(() => {
        state = {
            ...state,
            deck:    state.deck.map((c, i) =>
                    i === i1 || i === i2 ? { ...c, flipped: false } : c
            ),
            flipped:       [],
            locked:        false,
            currentPlayer: settings.players === 2
                    ? (state.currentPlayer === 0 ? 1 : 0)
                    : 0,
        };

        [i1, i2].forEach(idx => {
            const el = dom.board.querySelector(`[data-idx="${idx}"]`);
            if (el) {
                el.classList.remove('wrong', 'flipped');
            }
        });

        renderHUD();
    }, 900);
}



function startTimer() {
    clearInterval(state.timerInterval);

    const interval = setInterval(() => {
        if (state.timerSecs <= 0) {
            clearInterval(interval);
            handleTimeOut();
            return;
        }

        state = { ...state, timerSecs: state.timerSecs - 1 };
        dom.timerDisplay.textContent = formatTime(state.timerSecs);
        dom.timerDisplay.classList.toggle('warning', state.timerSecs <= 10);
    }, 1000);

    state = { ...state, timerInterval: interval };
}

const stopTimer = () => {
    clearInterval(state.timerInterval);
    state = { ...state, timerInterval: null };
};

function handleTimeOut() {
    stopTimer();
    handleRoundEnd(true); // true = час вийшов
}



function handleRoundEnd(isTimeout = false) {
    stopTimer();

    const elapsedSecs = Math.floor((Date.now() - state.roundStartTime) / 1000);

    const roundStat = settings.players === 2
            ? [
                { name: settings.nameP1, moves: state.scores[0], time: elapsedSecs },
                { name: settings.nameP2, moves: state.scores[1], time: elapsedSecs },
            ]
            : [{ name: settings.nameP1, moves: state.moves, time: elapsedSecs }];

    state = {
        ...state,
        allRoundsStats: [...state.allRoundsStats, roundStat],
    };

    const isLastRound = state.round >= settings.rounds;

    if (isLastRound) {
        showGameEndModal(isTimeout);
    } else {
        showRoundEndModal(isTimeout);
    }
}

function showRoundEndModal(isTimeout) {
    dom.modalTitle.textContent = isTimeout ? '⏰ Час вийшов!' : '🎉 Раунд завершено!';

    const lastRound = state.allRoundsStats[state.allRoundsStats.length - 1];
    const roundWinner = settings.players === 2 ? calcWinner(lastRound) : null;

    let html = `<p style="color:var(--text-muted)">Раунд ${state.round} з ${settings.rounds}</p>`;

    if (settings.players === 2 && roundWinner) {
        html += `<div class="winner-banner">🏆 Переміг: ${roundWinner.name}</div>`;
    }

    html += buildStatsTable(lastRound);

    dom.modalBody.innerHTML = html;
    dom.modalNext.textContent = 'Наступний раунд';
    dom.modalNext.style.display = 'block';
    dom.modal.style.display = 'flex';
}

function showGameEndModal(isTimeout) {
    dom.modalTitle.textContent = isTimeout ? '⏰ Час вийшов!' : '🏆 Гра завершена!';

    let html = '';

    if (settings.players === 2 && settings.rounds > 1) {
        const summary = getPlayerSummary(state.allRoundsStats, 2);
        const overallWinner = calcWinner(summary);

        html += `<div class="winner-banner">🥇 Переможець: ${overallWinner.name}</div>`;
        html += `<table class="stats-table">
      <tr><th>Гравець</th><th>Загально ходів</th><th>Загальний час</th></tr>`;
        summary.forEach(p => {
            const isWinner = p.name === overallWinner.name;
            html += `<tr ${isWinner ? 'class="winner-row"' : ''}>
        <td>${p.name}</td>
        <td>${p.totalMoves}</td>
        <td>${formatTime(p.totalTime)}</td>
      </tr>`;
        });
        html += '</table>';

        html += '<p style="color:var(--text-muted);margin-top:.75rem;font-size:.85rem">Деталі раундів:</p>';
        state.allRoundsStats.forEach((round, i) => {
            const w = calcWinner(round);
            html += `<p style="font-size:.85rem">Раунд ${i+1}: переміг <b>${w.name}</b></p>`;
        });

    } else if (settings.players === 1) {
        const lastRound = state.allRoundsStats[state.allRoundsStats.length - 1];
        html += buildStatsTable(lastRound);
    } else {
        const lastRound = state.allRoundsStats[state.allRoundsStats.length - 1];
        const winner = calcWinner(lastRound);
        html += `<div class="winner-banner">🏆 Переміг: ${winner.name}</div>`;
        html += buildStatsTable(lastRound);
    }

    dom.modalBody.innerHTML = html;
    dom.modalNext.textContent = 'Грати ще раз';
    dom.modal.style.display = 'flex';
}

const buildStatsTable = roundStat => `
  <table class="stats-table">
    <tr><th>Гравець</th><th>Ходів</th><th>Час</th></tr>
    ${roundStat.map(p => `
      <tr>
        <td>${p.name}</td>
        <td>${p.moves}</td>
        <td>${formatTime(p.time)}</td>
      </tr>`).join('')}
  </table>`;



dom.modalNext.addEventListener('click', () => {
    dom.modal.style.display = 'none';

    const isLastRound = state.round >= settings.rounds;

    if (isLastRound) {
        startGame();
    } else {
        state = { ...state, round: state.round + 1 };
        startRound();
    }
});

dom.modalSettings.addEventListener('click', () => {
    dom.modal.style.display = 'none';
    stopTimer();
    dom.gameScreen.style.display  = 'none';
    dom.setupScreen.style.display = 'flex';
});

$('btn-restart').addEventListener('click', () => {
    stopTimer();
    state = {
        ...state,
        allRoundsStats: [],
        round: 1,
    };
    startGame();
});

$('btn-to-settings').addEventListener('click', () => {
    stopTimer();
    dom.gameScreen.style.display  = 'none';
    dom.setupScreen.style.display = 'flex';
});