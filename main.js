// ======================
// CONFIG
// ======================

// ⚠️ SECURITY: Never hardcode API keys in client-side JS.
// Route calls through your own backend proxy instead:
// e.g. fetch("/api/gemini-move", { method: "POST", body: ... })
// and have your server attach the key server-side.
const GEMINI_API_URL =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const FLIP_DELAY     = 700;   // ms between AI's first and second flip
const MATCH_DURATION = 1000;  // ms to show a matched/unmatched pair

let turn     = 1;
let gameMode = "human";

// Tracks cards the AI has seen (flipped & not yet matched):
// { blockIndex: technology }
let revealedMemory = {};

// ======================
// SELECT ELEMENTS
// ======================

const blocksContainer = document.querySelector(".memory-game-blocks");
const blocks          = Array.from(blocksContainer.children);
const orderRange      = Array.from(Array(blocks.length).keys());

// ======================
// SHUFFLE & INIT
// ======================

shuffle(orderRange);

blocks.forEach((block, index) => {

    block.style.order = orderRange[index];

    block.addEventListener("click", function () {

        // Block player clicks during AI turn
        if (gameMode === "ai" && turn === 2) return;

        // Ignore already-open or matched cards
        if (
            block.classList.contains("is-flipped") ||
            block.classList.contains("is-matched")
        ) return;

        blocks.forEach(b => (b.style.transition = "transform 0.5s"));
        flipBlock(block);
    });
});

// ======================
// FLIP BLOCK
// ======================

function flipBlock(selectedBlock) {

    selectedBlock.classList.add("is-flipped");

    const allFlipped = blocks.filter(b => b.classList.contains("is-flipped"));

    if (allFlipped.length === 2) {
        stopClicking(MATCH_DURATION);
        checkMatchedBlocks(allFlipped[0], allFlipped[1]);
    }
}

// ======================
// STOP CLICKING
// ======================

function stopClicking(duration) {
    blocksContainer.classList.add("no-clicking");
    setTimeout(() => blocksContainer.classList.remove("no-clicking"), duration);
}

// ======================
// CHECK MATCH
// ======================

function checkMatchedBlocks(firstBlock, secondBlock) {

    const successSound = document.getElementById("success");
    const failSound    = document.getElementById("fail");

    const firstIndex  = blocks.indexOf(firstBlock);
    const secondIndex = blocks.indexOf(secondBlock);

    if (firstBlock.dataset.technology === secondBlock.dataset.technology) {

        // Remove from AI memory — no longer needed
        delete revealedMemory[firstIndex];
        delete revealedMemory[secondIndex];

        firstBlock.classList.remove("is-flipped");
        secondBlock.classList.remove("is-flipped");
        firstBlock.classList.add("is-matched");
        secondBlock.classList.add("is-matched");

        updateScore();

        successSound.currentTime = 0;
        successSound.play();

        // AI keeps going on a successful match
        if (gameMode === "ai" && turn === 2) {
            setTimeout(aiTurn, MATCH_DURATION);
        }

    } else {

        // AI memorises both cards for future turns
        revealedMemory[firstIndex]  = firstBlock.dataset.technology;
        revealedMemory[secondIndex] = secondBlock.dataset.technology;

        failSound.pause();
        failSound.currentTime = 0;
        failSound.play();

        setTimeout(() => {
            firstBlock.classList.remove("is-flipped");
            secondBlock.classList.remove("is-flipped");
            switchTurn();
        }, MATCH_DURATION);
    }

    // Check end-of-game
    setTimeout(() => {
        if (document.querySelectorAll(".is-matched").length === blocks.length) {
            finalizeGame();
        }
    }, MATCH_DURATION);
}

// ======================
// UPDATE SCORE
// ======================

function updateScore() {

    const selector = turn === 1 ? ".player1-score" : ".player2-score";
    const el = document.querySelector(selector);
    el.textContent = parseInt(el.textContent) + 1;
}

// ======================
// SWITCH TURN
// ======================

function switchTurn() {

    if (turn === 1) {
        turn = 2;
        setBackground("player2");
        if (gameMode === "ai") setTimeout(aiTurn, MATCH_DURATION);
    } else {
        turn = 1;
        setBackground("player1");
    }
}

// ======================
// AI TURN
// ======================

async function aiTurn() {

    const availableBlocks = blocks.filter(
        b => !b.classList.contains("is-matched") &&
             !b.classList.contains("is-flipped")
    );

    if (availableBlocks.length < 2) return;

    const move = await getGeminiMove(availableBlocks);
    if (!move) return;

    const firstBlock  = blocks[move.first];
    const secondBlock = blocks[move.second];

    // Validate that both blocks are real and available
    if (
        !firstBlock  || !secondBlock ||
        firstBlock   === secondBlock  ||
        firstBlock.classList.contains("is-matched")  ||
        secondBlock.classList.contains("is-matched") ||
        firstBlock.classList.contains("is-flipped")  ||
        secondBlock.classList.contains("is-flipped")
    ) {
        // Indices from Gemini were bad — fall back to random
        const fallback = getRandomMove(availableBlocks);
        if (!fallback) return;
        executeMoves(blocks[fallback.first], blocks[fallback.second]);
        return;
    }

    executeMoves(firstBlock, secondBlock);
}

function executeMoves(firstBlock, secondBlock) {
    flipBlock(firstBlock);
    setTimeout(() => flipBlock(secondBlock), FLIP_DELAY);
}

// ======================
// GEMINI API
// ======================

async function getGeminiMove(availableBlocks) {

    try {
        // Build game state — technology is only revealed for cards the AI
        // has already seen (previously flipped and unmatched).
        const gameState = availableBlocks.map(block => {
            const idx = blocks.indexOf(block);
            return {
                index:      idx,
                technology: revealedMemory[idx] ?? "unknown"
            };
        });

        const prompt = `
You are playing a memory card game. You can only see cards you have previously flipped.

Rules:
- Choose TWO different index values from the list below.
- If you see two cards with the same technology, pick those — they are a match.
- Otherwise pick any two "unknown" cards to reveal them.
- Return ONLY raw JSON with no markdown, no explanation.

Available cards (technology is "unknown" if you haven't seen the card yet):
${JSON.stringify(gameState)}

Response format exactly:
{"first":<index>,"second":<index>}
`;

        const response = await fetch(`${GEMINI_API_URL}?key=${getApiKey()}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        if (!response.ok) {
            throw new Error(`Gemini HTTP error: ${response.status}`);
        }

        const data = await response.json();
        console.log("Gemini response:", data);

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error("Empty Gemini response");

        const match = text.match(/\{[\s\S]*?\}/);
        if (!match) throw new Error("No JSON in Gemini response");

        const move = JSON.parse(match[0]);
        move.first  = Number(move.first);
        move.second = Number(move.second);

        // Validate that returned indices are in the available set
        const availableIndices = availableBlocks.map(b => blocks.indexOf(b));
        if (
            !availableIndices.includes(move.first) ||
            !availableIndices.includes(move.second) ||
            move.first === move.second
        ) {
            throw new Error(`Invalid Gemini indices: ${move.first}, ${move.second}`);
        }

        return move;

    } catch (error) {
        console.warn("Gemini error — using random fallback:", error);
        return getRandomMove(availableBlocks);
    }
}

// ======================
// API KEY HELPER
// ======================

// Replace this with a call to your own backend endpoint.
// e.g. const { key } = await fetch("/api/key").then(r => r.json());
function getApiKey() {
    // TODO: fetch from backend — do NOT store the key here
    return window.__GEMINI_KEY__ ?? "";
}

// ======================
// RANDOM FALLBACK
// ======================

function getRandomMove(availableBlocks) {

    if (availableBlocks.length < 2) return null;

    // First: try to find a known matching pair from memory
    const seen = Object.entries(revealedMemory);
    for (let i = 0; i < seen.length; i++) {
        for (let j = i + 1; j < seen.length; j++) {
            const [idxA, techA] = seen[i];
            const [idxB, techB] = seen[j];
            if (
                techA === techB &&
                blocks[idxA] && !blocks[idxA].classList.contains("is-matched") &&
                blocks[idxB] && !blocks[idxB].classList.contains("is-matched")
            ) {
                return { first: Number(idxA), second: Number(idxB) };
            }
        }
    }

    // Otherwise pick two random available cards
    const shuffled = [...availableBlocks].sort(() => Math.random() - 0.5);
    return {
        first:  blocks.indexOf(shuffled[0]),
        second: blocks.indexOf(shuffled[1])
    };
}

// ======================
// SHUFFLE
// ======================

function shuffle(array) {
    let current = array.length;
    while (current > 0) {
        const random = Math.floor(Math.random() * current--);
        [array[current], array[random]] = [array[random], array[current]];
    }
}

// ======================
// FINALIZE GAME
// ======================

function finalizeGame() {

    const gameOverPanel  = document.querySelector(".game-over-panel");
    const winnerElement  = document.querySelector(".game-over-panel p:first-of-type span");
    const scoreElement   = document.querySelector(".game-over-panel p:last-of-type span");

    const player1 = parseInt(document.querySelector(".player1-score").textContent);
    const player2 = parseInt(document.querySelector(".player2-score").textContent);

    if (player1 > player2) {
        winnerElement.textContent          = "Player 1";
        scoreElement.textContent           = player1;
        gameOverPanel.style.backgroundColor = "lightblue";
    } else if (player2 > player1) {
        winnerElement.textContent          = gameMode === "ai" ? "Gemini AI" : "Player 2";
        scoreElement.textContent           = player2;
        gameOverPanel.style.backgroundColor = "lightcoral";
    } else {
        winnerElement.textContent          = "Draw";
        scoreElement.textContent           = player1;
        gameOverPanel.style.backgroundColor = "lightgray";
    }

    gameOverPanel.style.display = "flex";
}

// ======================
// BACKGROUNDS
// ======================

function setBackground(player) {
    document.body.style.backgroundColor =
        player === "player1" ? "lightblue" : "lightcoral";
}

// ======================
// RESET GAME
// ======================

function resetGame() {

    blocks.forEach(block => {
        block.classList.remove("is-matched", "is-flipped");
        block.style.transition = "none";
    });

    document.querySelector(".player1-score").textContent = "0";
    document.querySelector(".player2-score").textContent = "0";

    revealedMemory = {};
    turn = 1;

    setBackground("player1");
    shuffle(orderRange);
    blocks.forEach((block, index) => (block.style.order = orderRange[index]));

    document.querySelector(".game-over-panel").style.display = "none";
}

// ======================
// EVENT LISTENERS
// ======================

document.querySelector(".game-over-panel .button").addEventListener("click", resetGame);

document.querySelector(".control-buttons .button").addEventListener("click", function () {
    gameMode = document.querySelector("#opponent-type").value;
    document.querySelector(".control-buttons").remove();
    setBackground("player1");
});