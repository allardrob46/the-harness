/* ═══════════════════════════════════════════════════════════
   THE HARNESS — The Parlor Poker Table App Logic
   Texas Hold'em style game with agent AI opponents
   ═══════════════════════════════════════════════════════════ */

// ─── Deck & Cards ───
const SUITS = [
  { name: 'spade', symbol: '♠', color: 'dark' },
  { name: 'heart', symbol: '♥', color: 'red' },
  { name: 'diamond', symbol: '♦', color: 'red' },
  { name: 'club', symbol: '♣', color: 'dark' },
];

const RANKS = [
  { label: 'A', value: 14 }, { label: 'K', value: 13 },
  { label: 'Q', value: 12 }, { label: 'J', value: 11 },
  { label: '10', value: 10 }, { label: '9', value: 9 },
  { label: '8', value: 8 }, { label: '7', value: 7 },
  { label: '6', value: 6 }, { label: '5', value: 5 },
  { label: '4', value: 4 }, { label: '3', value: 3 },
  { label: '2', value: 2 },
];

function buildDeck() {
  const deck = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ ...suit, ...rank });
    }
  }
  return shuffle(deck);
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Players ───
const players = [
  { name: 'YOU', avatar: '👤', chips: 5000, isHuman: true, pos: 'bottom' },
  { name: 'ATLAS', avatar: '🤖', chips: 4200, isHuman: false, pos: 'br' },
  { name: 'VENOM', avatar: '👁️', chips: 3500, isHuman: false, pos: 'right' },
  { name: 'CIPHER', avatar: '🔥', chips: 6100, isHuman: false, pos: 'tr' },
  { name: 'GHOST', avatar: '🎭', chips: 2800, isHuman: false, pos: 'top' },
  { name: 'SAGE', avatar: '🧠', chips: 3900, isHuman: false, pos: 'tl' },
  { name: 'ORION', avatar: '🦾', chips: 5500, isHuman: false, pos: 'left' },
  { name: 'REAPER', avatar: '💎', chips: 4000, isHuman: false, pos: 'bl' },
];

// ─── Game State ───
let gameState = {
  deck: [],
  communityCards: [],
  pot: 0,
  currentBet: 0,
  smallBlind: 100,
  bigBlind: 200,
  dealerIndex: 0,
  currentPlayerIndex: 0,
  phase: 'idle', // idle, preflop, flop, turn, river, showdown
  playersInHand: [],
  bets: [],
  folded: [],
  hasActed: [], // track who has acted in the current betting round
  eliminated: new Array(players.length).fill(false), // broke players are out of the tournament
  round: 0,
};

// ─── Chat Messages ───
const chatMessages = [
  { avatar: '🤖', name: 'ATLAS', text: 'Good luck everyone. May the best agent win.', time: '2m ago', system: false },
  { avatar: '👁️', name: 'VENOM', text: 'I\'ve been analyzing your tells. You blink too much.', time: '1m ago', system: false },
  { avatar: '🎭', name: 'GHOST', text: 'I\'m going to make you all fold.', time: '55s ago', system: false },
  { avatar: '🧠', name: 'SAGE', text: 'The probability favors patience. Let\'s see.', time: '40s ago', system: false },
  { avatar: '🔥', name: 'CIPHER', text: 'All-in energy. Let\'s go.', time: '30s ago', system: false },
  { avatar: '⚙️', name: 'System', text: 'GoldenEye Classic — Round 2 starting. Blinds: 100/200', time: 'just now', system: true },
];

const leaderboard = [
  { avatar: '🔥', name: 'CIPHER', chips: 6100 },
  { avatar: '🦾', name: 'ORION', chips: 5500 },
  { avatar: '👤', name: 'YOU', chips: 5000 },
  { avatar: '🤖', name: 'ATLAS', chips: 4200 },
  { avatar: '💎', name: 'REAPER', chips: 4000 },
  { avatar: '🧠', name: 'SAGE', chips: 3900 },
  { avatar: '👁️', name: 'VENOM', chips: 3500 },
  { avatar: '🎭', name: 'GHOST', chips: 2800 },
];

// ─── Render Functions ───
function renderCommunityCards() {
  const container = document.getElementById('communityCards');
  container.innerHTML = '';

  const maxSlots = 5;
  for (let i = 0; i < maxSlots; i++) {
    const card = gameState.communityCards[i];
    const el = document.createElement('div');

    if (card) {
      el.className = `community-card ${card.color}`;
      el.innerHTML = `
        <div class="card-content">
          <span class="card-rank">${card.label}</span>
          <span class="card-suit">${card.symbol}</span>
        </div>
      `;
    } else {
      el.className = 'community-card empty';
    }
    container.appendChild(el);
  }
}

function renderPot() {
  document.getElementById('potAmount').textContent = gameState.pot.toLocaleString();
}

function renderRoundInfo() {
  const phaseNames = {
    idle: 'Waiting to start...',
    preflop: 'Pre-Flop',
    flop: 'The Flop',
    turn: 'The Turn',
    river: 'The River',
    showdown: 'Showdown',
  };
  document.getElementById('roundInfo').textContent = phaseNames[gameState.phase] || '';
}

function renderPlayers() {
  for (let i = 0; i < players.length; i++) {
    const player = players[i];
    const seat = document.getElementById(`seat${i}`);
    const chips = document.getElementById(`chips${i}`);
    const action = document.getElementById(`action${i}`);
    const bet = document.getElementById(`bet${i}`);
    const card = document.getElementById(`card${i}`);

    chips.textContent = player.chips.toLocaleString();

    // Active player highlight
    seat.classList.toggle('active', i === gameState.currentPlayerIndex && gameState.phase !== 'idle' && gameState.phase !== 'showdown');
    seat.classList.toggle('folded', gameState.folded[i]);
    seat.classList.toggle('eliminated', !!gameState.eliminated[i]);

    // Action label
    if (gameState.eliminated[i]) {
      action.textContent = 'OUT';
      action.className = 'seat-action visible out';
    } else if (gameState.folded[i]) {
      action.textContent = 'Fold';
      action.className = 'seat-action visible fold';
    } else {
      action.textContent = '';
      action.className = 'seat-action';
    }

    // Bet display
    const currentBet = gameState.bets[i] || 0;
    if (currentBet > 0 && !gameState.folded[i]) {
      bet.textContent = currentBet.toLocaleString();
      bet.className = 'seat-bet visible';
    } else {
      bet.className = 'seat-bet';
    }

    // Hole cards
    if (player.holeCards && !gameState.folded[i]) {
      card.className = 'seat-card visible';
      card.innerHTML = '';
      player.holeCards.forEach(c => {
        const mc = document.createElement('div');
        mc.className = `mini-card ${c.color}`;
        mc.innerHTML = `${c.label}${c.symbol}`;
        card.appendChild(mc);
      });
    } else if (gameState.folded[i]) {
      card.className = 'seat-card visible';
      card.innerHTML = '';
      for (let j = 0; j < 2; j++) {
        const mc = document.createElement('div');
        mc.className = 'mini-card back';
        card.appendChild(mc);
      }
    } else {
      card.className = 'seat-card';
      card.innerHTML = '';
    }
  }
}

function renderDealerButton() {
  const btn = document.getElementById('dealerButton');
  const positions = [
    { bottom: '-20px', left: '50%' },
    { bottom: '15%', right: '-20px' },
    { top: '50%', right: '-20px' },
    { top: '15%', right: '0' },
    { top: '-20px', left: '50%' },
    { top: '15%', left: '-20px' },
    { top: '50%', left: '-20px' },
    { bottom: '15%', left: '-20px' },
  ];

  const pos = positions[gameState.dealerIndex] || positions[0];
  btn.style.cssText = Object.entries(pos).map(([k, v]) => `${k}: ${v}`).join(';');
}

function renderLeaderboard() {
  const lb = document.getElementById('leaderboard');
  lb.innerHTML = '';

  leaderboard
    .slice()
    .sort((a, b) => b.chips - a.chips)
    .forEach((player, i) => {
      const row = document.createElement('div');
      row.className = 'lb-row';
      row.innerHTML = `
        <span class="lb-rank">${i + 1}</span>
        <span class="lb-avatar">${player.avatar}</span>
        <span class="lb-name">${player.name}</span>
        <span class="lb-chips">${player.chips.toLocaleString()}</span>
      `;
      lb.appendChild(row);
    });
}

function renderChat() {
  const container = document.getElementById('chatMessages');
  container.innerHTML = '';

  chatMessages.forEach(msg => {
    const el = document.createElement('div');
    el.className = `chat-msg${msg.system ? ' system' : ''}`;
    el.innerHTML = `
      <div class="chat-msg-header">
        <span class="chat-msg-avatar">${msg.avatar}</span>
        <span class="chat-msg-name">${msg.name}</span>
        <span class="chat-msg-time">${msg.time}</span>
      </div>
      <div class="chat-msg-text">${msg.text}</div>
    `;
    container.appendChild(el);
  });

  container.scrollTop = container.scrollHeight;
}

// ─── Action Bar ───
function showActionBar() {
  document.getElementById('actionBar').style.display = 'flex';
  document.getElementById('actionBarHidden').style.display = 'none';
}

function hideActionBar(text) {
  document.getElementById('actionBar').style.display = 'none';
  document.getElementById('actionBarHidden').style.display = 'flex';
  if (text) {
    document.getElementById('waitingText').textContent = text;
  }
}

function updateWaitingText(text) {
  document.getElementById('waitingText').textContent = text;
}

function updateActionBar() {
  const callAmount = gameState.currentBet - (gameState.bets[0] || 0);
  document.getElementById('callAmount').textContent = Math.max(0, callAmount).toLocaleString();

  const checkBtn = document.getElementById('btnCheck');
  const callBtn = document.getElementById('btnCall');

  if (callAmount <= 0) {
    checkBtn.style.display = 'block';
    callBtn.style.display = 'none';
  } else {
    checkBtn.style.display = 'none';
    callBtn.style.display = 'block';
  }

  // Update slider
  const slider = document.getElementById('raiseSlider');
  const maxRaise = players[0].chips;
  slider.max = maxRaise;
  slider.min = gameState.bigBlind;
  slider.value = gameState.currentBet + gameState.bigBlind;
  document.getElementById('raiseValue').textContent = parseInt(slider.value).toLocaleString();
}

// ─── Game Logic ───
function startNewHand() {
  gameState.round++;

  // Time out anyone who's broke — they're out of the tournament
  players.forEach((p, i) => { if (p.chips <= 0) gameState.eliminated[i] = true; });
  const inGame = players.map((_, i) => i).filter(i => !gameState.eliminated[i]);
  if (inGame.length <= 1) {
    gameState.phase = 'idle';
    renderAll();
    hideActionBar('Tournament over');
    if (inGame.length === 1) {
      const w = players[inGame[0]];
      addChatMessage('🏆', 'System', inGame[0] === 0 ? 'You win the tournament! 🏆' : `${w.name} wins the tournament!`, true);
      showToast(`🏆 ${inGame[0] === 0 ? 'You win' : w.name + ' wins'} the tournament!`);
    } else {
      addChatMessage('🏆', 'System', 'Tournament over — no players left.', true);
    }
    return;
  }
  if (gameState.eliminated[0]) {
    addChatMessage('⚙️', 'System', 'You are out of chips — spectating the rest of the tournament.', true);
  }

  gameState.deck = buildDeck();
  gameState.communityCards = [];
  gameState.pot = 0;
  gameState.currentBet = 0;
  gameState.phase = 'preflop';
  gameState.bets = new Array(players.length).fill(0);
  gameState.folded = new Array(players.length).fill(false);
  gameState.hasActed = new Array(players.length).fill(false);
  gameState.playersInHand = inGame;

  // Rotate dealer (set to 6 on first hand so human acts early), skipping eliminated seats
  if (gameState.round === 1) {
    gameState.dealerIndex = 6;
  } else {
    let d = gameState.dealerIndex;
    let guard = 0;
    do { d = (d + 1) % players.length; guard++; } while (gameState.eliminated[d] && guard <= players.length);
    gameState.dealerIndex = d;
  }

  // Deal hole cards (only to players still in the tournament)
  players.forEach((p, i) => {
    p.holeCards = gameState.eliminated[i] ? null : [gameState.deck.pop(), gameState.deck.pop()];
  });

  // Post blinds — skip eliminated seats, cap at what the player actually has
  let sbIndex = gameState.dealerIndex;
  let guard = 0;
  do { sbIndex = (sbIndex + 1) % players.length; guard++; } while (gameState.eliminated[sbIndex] && guard <= players.length);
  let bbIndex = sbIndex;
  guard = 0;
  do { bbIndex = (bbIndex + 1) % players.length; guard++; } while (gameState.eliminated[bbIndex] && guard <= players.length);

  const sbPost = Math.min(players[sbIndex].chips, gameState.smallBlind);
  players[sbIndex].chips -= sbPost;
  gameState.bets[sbIndex] = sbPost;
  const bbPost = Math.min(players[bbIndex].chips, gameState.bigBlind);
  players[bbIndex].chips -= bbPost;
  gameState.bets[bbIndex] = bbPost;
  gameState.currentBet = Math.max(sbPost, bbPost);
  gameState.pot = sbPost + bbPost;

  // BB has the option to raise preflop, so hasn't fully acted
  gameState.hasActed = new Array(players.length).fill(false);
  // SB and BB posted blinds but still need to act
  gameState.hasActed[sbIndex] = false;
  gameState.hasActed[bbIndex] = false;

  // First to act is UTG (after BB), skipping eliminated seats
  let first = (bbIndex + 1) % players.length;
  guard = 0;
  while (gameState.eliminated[first] && guard <= players.length) {
    first = (first + 1) % players.length;
    guard++;
  }
  gameState.currentPlayerIndex = first;

  renderAll();
  addChatMessage('⚙️', 'System', `Hand ${gameState.round} — Blinds posted. ${players[sbIndex].name} (SB) / ${players[bbIndex].name} (BB)`, true);

  // Start the action
  checkTurn();
}

function checkTurn() {
  if (gameState.currentPlayerIndex === 0 && !gameState.folded[0] && !gameState.eliminated[0]) {
    showActionBar();
    updateActionBar();
    updateWaitingText('');
  } else {
    const playerName = players[gameState.currentPlayerIndex].name;
    hideActionBar(playerName + ' is thinking...');
    if (!gameState.folded[gameState.currentPlayerIndex] && !gameState.eliminated[gameState.currentPlayerIndex]) {
      setTimeout(() => aiAction(gameState.currentPlayerIndex), 800 + Math.random() * 1200);
    } else {
      nextPlayer();
    }
  }
}

function aiAction(playerIndex) {
  const player = players[playerIndex];
  const callAmount = gameState.currentBet - (gameState.bets[playerIndex] || 0);
  const potOdds = callAmount / (gameState.pot + callAmount);

  // Simple AI: evaluate hand strength
  const handStrength = evaluateHandStrength(player.holeCards, gameState.communityCards);
  const random = Math.random();

  let action;
  if (handStrength > 0.7) {
    // Strong hand
    if (callAmount === 0) {
      action = { type: 'raise', amount: Math.min(gameState.pot, player.chips) };
    } else if (random < 0.6) {
      action = { type: 'raise', amount: Math.min(gameState.currentBet * 2, player.chips) };
    } else {
      action = { type: 'call', amount: callAmount };
    }
  } else if (handStrength > 0.4) {
    // Medium hand
    if (callAmount === 0) {
      action = random < 0.3 ? { type: 'raise', amount: gameState.bigBlind * 2 } : { type: 'check' };
    } else if (potOdds < 0.3) {
      action = { type: 'call', amount: callAmount };
    } else {
      action = random < 0.5 ? { type: 'call', amount: callAmount } : { type: 'fold' };
    }
  } else {
    // Weak hand
    if (callAmount === 0) {
      action = { type: 'check' };
    } else if (random < 0.15) {
      action = { type: 'call', amount: callAmount }; // bluff
    } else {
      action = { type: 'fold' };
    }
  }

  processAction(playerIndex, action);
}

function evaluateHandStrength(holeCards, community) {
  // Very simplified hand strength evaluation
  try {
    if (!holeCards || holeCards.length < 2) return 0.4;
    if (!holeCards[0] || !holeCards[1]) return 0.4;

    const allCards = [...holeCards, ...(community || [])];
    const ranks = allCards.map(c => c.value).filter(v => v !== undefined);
    const hasPair = ranks.length > allCards.length - 1 && ranks.some((r, i) => ranks.indexOf(r) !== i);
    const highCards = allCards.filter(c => c.value >= 11).length;

    let strength = 0.3;
    if (hasPair) strength += 0.3;
    if (highCards >= 2) strength += 0.15;
    if (holeCards[0].value >= 11 && holeCards[1].value >= 11) strength += 0.2;
    // Suited check: card has 'name' (suit name) from spread, not 'suit.name'
    if (holeCards[0].name && holeCards[1].name && holeCards[0].name === holeCards[1].name) strength += 0.1;

    return Math.min(strength, 0.95);
  } catch (e) {
    // If anything goes wrong, return a middle-strength value so the game keeps going
    return 0.5;
  }
}

function processAction(playerIndex, action) {
  const player = players[playerIndex];
  const seatAction = document.getElementById(`action${playerIndex}`);

  // Mark as acted
  gameState.hasActed[playerIndex] = true;

  if (action.type === 'fold') {
    gameState.folded[playerIndex] = true;
    seatAction.textContent = 'Fold';
    seatAction.className = 'seat-action visible fold';
    addChatMessage(player.avatar, player.name, 'Fold.', false);
  } else if (action.type === 'check') {
    seatAction.textContent = 'Check';
    seatAction.className = 'seat-action visible check';
    addChatMessage(player.avatar, player.name, 'Check.', false);
  } else if (action.type === 'call') {
    const callAmount = Math.min(action.amount, player.chips);
    player.chips -= callAmount;
    gameState.bets[playerIndex] = (gameState.bets[playerIndex] || 0) + callAmount;
    gameState.pot += callAmount;
    seatAction.textContent = 'Call';
    seatAction.className = 'seat-action visible call';
    addChatMessage(player.avatar, player.name, `Call ${callAmount.toLocaleString()}.`, false);
  } else if (action.type === 'raise') {
    const raiseTotal = Math.min(action.amount, player.chips);
    const additional = raiseTotal - (gameState.bets[playerIndex] || 0);
    player.chips -= additional;
    gameState.bets[playerIndex] = raiseTotal;
    gameState.pot += additional;
    gameState.currentBet = raiseTotal;

    // When someone raises, all other active players need to act again
    for (let i = 0; i < players.length; i++) {
      if (i !== playerIndex && !gameState.folded[i] && !gameState.eliminated[i] && players[i].chips > 0) {
        gameState.hasActed[i] = false;
      }
    }

    const isAllIn = player.chips === 0;
    seatAction.textContent = isAllIn ? 'All-In!' : 'Raise';
    seatAction.className = `seat-action visible ${isAllIn ? 'allin' : 'raise'}`;
    addChatMessage(player.avatar, player.name, isAllIn ? `All-In! ${raiseTotal.toLocaleString()}` : `Raise to ${raiseTotal.toLocaleString()}`, false);
  }

  renderAll();

  // Check if round is over
  setTimeout(() => {
    if (checkRoundEnd()) {
      advancePhase();
    } else {
      nextPlayer();
    }
  }, 600);
}

function checkRoundEnd() {
  const activePlayers = players.map((_, i) => i).filter(i => !gameState.folded[i] && !gameState.eliminated[i]);
  if (activePlayers.length <= 1) return true;

  // Round ends when all active players have acted AND matched the current bet
  const allActed = activePlayers.every(i => gameState.hasActed[i] || players[i].chips === 0);
  const allMatched = activePlayers.every(i => gameState.bets[i] === gameState.currentBet || players[i].chips === 0);
  return allActed && allMatched;
}

function nextPlayer() {
  let next = (gameState.currentPlayerIndex + 1) % players.length;
  let count = 0;
  while ((gameState.folded[next] || gameState.eliminated[next]) && count < players.length) {
    next = (next + 1) % players.length;
    count++;
  }
  gameState.currentPlayerIndex = next;
  renderPlayers();
  checkTurn();
}

function advancePhase() {
  // Reset bets and acted status for new betting round
  gameState.bets = new Array(players.length).fill(0);
  gameState.hasActed = new Array(players.length).fill(false);
  gameState.currentBet = 0;

  if (gameState.phase === 'preflop') {
    gameState.phase = 'flop';
    gameState.communityCards.push(gameState.deck.pop(), gameState.deck.pop(), gameState.deck.pop());
    addChatMessage('⚙️', 'System', 'The Flop.', true);
  } else if (gameState.phase === 'flop') {
    gameState.phase = 'turn';
    gameState.communityCards.push(gameState.deck.pop());
    addChatMessage('⚙️', 'System', 'The Turn.', true);
  } else if (gameState.phase === 'turn') {
    gameState.phase = 'river';
    gameState.communityCards.push(gameState.deck.pop());
    addChatMessage('⚙️', 'System', 'The River.', true);
  } else if (gameState.phase === 'river') {
    showdown();
    return;
  }

  // First active player after dealer acts first on new phase (skip folded + eliminated)
  let next = (gameState.dealerIndex + 1) % players.length;
  let count = 0;
  while ((gameState.folded[next] || gameState.eliminated[next]) && count < players.length) {
    next = (next + 1) % players.length;
    count++;
  }
  gameState.currentPlayerIndex = next;

  renderAll();
  checkTurn();
}

function showdown() {
  gameState.phase = 'showdown';
  const activePlayers = players.map((_, i) => i).filter(i => !gameState.folded[i] && !gameState.eliminated[i]);

  // Pick winner (simplified — random among active with hand strength)
  let winnerIndex = activePlayers[0];
  let bestStrength = 0;

  activePlayers.forEach(i => {
    const strength = evaluateHandStrength(players[i].holeCards, gameState.communityCards);
    if (strength > bestStrength) {
      bestStrength = strength;
      winnerIndex = i;
    }
  });

  // Award pot
  players[winnerIndex].chips += gameState.pot;
  const wonAmount = gameState.pot;
  gameState.pot = 0;

  // Highlight winner
  document.getElementById(`seat${winnerIndex}`).classList.add('winner');

  // Show result modal
  const modal = document.getElementById('resultModal');
  document.getElementById('resultIcon').textContent = '🏆';
  document.getElementById('resultTitle').textContent = winnerIndex === 0 ? 'You Win!' : `${players[winnerIndex].name} Wins!`;
  document.getElementById('resultWinner').textContent = `${players[winnerIndex].avatar} ${players[winnerIndex].name}`;
  document.getElementById('resultHand').textContent = `with ${getHandName(bestStrength)}`;
  document.getElementById('resultAmount').textContent = `+${wonAmount.toLocaleString()} chips`;
  modal.classList.add('show');

  addChatMessage('🏆', 'System', `${players[winnerIndex].name} wins ${wonAmount.toLocaleString()} chips!`, true);

  renderAll();
  hideActionBar();
}

function getHandName(strength) {
  if (strength > 0.8) return 'a strong hand';
  if (strength > 0.6) return 'a solid hand';
  if (strength > 0.4) return 'a decent hand';
  return 'a bluff';
}

// ─── Human Actions ───
document.getElementById('btnFold').addEventListener('click', () => {
  processAction(0, { type: 'fold' });
});

document.getElementById('btnCheck').addEventListener('click', () => {
  processAction(0, { type: 'check' });
});

document.getElementById('btnCall').addEventListener('click', () => {
  const callAmount = gameState.currentBet - (gameState.bets[0] || 0);
  processAction(0, { type: 'call', amount: callAmount });
});

document.getElementById('btnRaise').addEventListener('click', () => {
  const raiseAmount = parseInt(document.getElementById('raiseSlider').value);
  processAction(0, { type: 'raise', amount: raiseAmount });
});

// ─── Slider ───
document.getElementById('raiseSlider').addEventListener('input', (e) => {
  document.getElementById('raiseValue').textContent = parseInt(e.target.value).toLocaleString();
});

// ─── Quick Raises ───
document.querySelectorAll('.quick-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const slider = document.getElementById('raiseSlider');
    const type = btn.dataset.multi;
    let value;

    if (type === 'pot') {
      value = gameState.pot;
    } else if (type === 'all') {
      value = players[0].chips;
    } else {
      const multi = parseInt(type);
      value = gameState.currentBet * multi;
    }

    value = Math.max(value, parseInt(slider.min));
    value = Math.min(value, parseInt(slider.max));
    slider.value = value;
    document.getElementById('raiseValue').textContent = value.toLocaleString();
  });
});

// ─── Next Round ───
document.getElementById('nextRoundBtn').addEventListener('click', () => {
  document.getElementById('resultModal').classList.remove('show');
  document.querySelectorAll('.seat').forEach(s => s.classList.remove('winner'));

  startNewHand(); // startNewHand times out broke players and ends the tournament when one remains
});

// ─── Chat ───
function addChatMessage(avatar, name, text, system = false) {
  chatMessages.push({
    avatar, name, text, time: 'just now', system,
  });
  renderChat();
}

document.getElementById('chatSend').addEventListener('click', () => {
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (text) {
    addChatMessage('👤', 'YOU', text, false);
    input.value = '';

    // Agent responds sometimes
    if (Math.random() < 0.7) {
      const responders = players.slice(1);
      const responder = responders[Math.floor(Math.random() * responders.length)];
      const responses = [
        'Interesting move...',
        'I see what you\'re doing.',
        'You can\'t scare me.',
        'Is that your strategy?',
        'I\'ve got a read on you.',
        'Bold.',
        'We\'ll see about that.',
        'Good chat.',
      ];
      const reply = responses[Math.floor(Math.random() * responses.length)];
      setTimeout(() => addChatMessage(responder.avatar, responder.name, reply, false), 1000 + Math.random() * 2000);
    }
  }
});

document.getElementById('chatInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    document.getElementById('chatSend').click();
  }
});

// ─── Mobile Menu ───
document.getElementById('mobileMenu').addEventListener('click', () => {
  document.querySelector('.sidebar').classList.toggle('open');
});

// ─── Theme Toggle ───
(function() {
  const toggle = document.querySelector('[data-theme-toggle]');
  const root = document.documentElement;
  let isDark = true;

  toggle.innerHTML = '<span>🌙</span>';

  toggle.addEventListener('click', () => {
    isDark = !isDark;
    root.setAttribute('data-theme', isDark ? 'dark' : 'light');
    toggle.innerHTML = isDark ? '<span>🌙</span>' : '<span>☀️</span>';
  });
})();

// ─── Blind Timer ───
let blindSeconds = 720; // 12 minutes

function updateBlindTimer() {
  const m = Math.floor(blindSeconds / 60);
  const s = blindSeconds % 60;
  document.getElementById('blindTimer').textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

  if (blindSeconds > 0) {
    blindSeconds--;
  } else {
    // Increase blinds
    gameState.smallBlind *= 2;
    gameState.bigBlind *= 2;
    blindSeconds = 720;
    addChatMessage('⚙️', 'System', `Blinds increased to ${gameState.smallBlind} / ${gameState.bigBlind}`, true);
  }
}

setInterval(updateBlindTimer, 1000);

// ─── Toast ───
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ─── Render All ───
function renderAll() {
  renderCommunityCards();
  renderPot();
  renderRoundInfo();
  renderPlayers();
  renderDealerButton();
  renderLeaderboard();
}

// ─── Init ───
renderChat();
renderAll();
hideActionBar('Starting first hand...');

// Auto-start first hand after 1.5 seconds
setTimeout(() => {
  startNewHand();
}, 1500);
