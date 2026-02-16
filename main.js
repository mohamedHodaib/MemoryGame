//Effect Duration 
let duration = 1000;
let turn = 1;

//Select Blocks
// Select Blocks Container
let blocksContainer = document.querySelector(".memory-game-blocks");

// Create Array From Game Blocks
let blocks = Array.from(blocksContainer.children);

//Create Range Of Keys
let orderRange = Array.from(Array(blocks.length).keys());

//Shuffle Blocks Order
shuffle(orderRange);


//Add Order Css Property To Game Blocks
blocks.forEach((block, index) => {
    block.style.order = orderRange[index];

    //Add Click Event
    block.addEventListener('click', function () {
        //Set transition back to  0.5s for the next game (If there was a previous game)
        blocks.forEach(block => {
            block.style.transition = 'transform 0.5s';
        });

        //Trigger The Flip Block Function
        flipBlock(block);
    });
});

//Flip Block Function
function flipBlock(selectedBlock) {
    //Add Class is-flipped
    selectedBlock.classList.add('is-flipped');

    //Collect All Flipped Cards
    let allFlippedBlocks = blocks.filter(flippedBlock => flippedBlock.classList.contains('is-flipped'));

    //If Theres Two Selected Blocks
    if (allFlippedBlocks.length === 2) {
        //Check Matched Block Function
        checkMatchedBlocks(allFlippedBlocks[0], allFlippedBlocks[1]);
    }
}

//stop Clicking Function
function stopClicking(duration) {
    //Add Class No Clicking on Main Container
    blocksContainer.classList.add('no-clicking');

    setTimeout(() => {
        //Remove Class No Clicking After The Duration
        blocksContainer.classList.remove('no-clicking');
    },duration);
}

//Check Matched Block Function
function checkMatchedBlocks(firstBlock, secondBlock) {
    //If Matched remove Class is-flipped
    if (firstBlock.dataset.technology === secondBlock.dataset.technology) {

        firstBlock.classList.remove('is-flipped');
        secondBlock.classList.remove('is-flipped');

        firstBlock.classList.add('is-matched');
        secondBlock.classList.add('is-matched');

        //Update Score
        if (turn === 1) {
            document.querySelector('.player1-score').textContent
                = parseInt(document.querySelector('.player1-score').textContent) + 1;
        } else {
            document.querySelector('.player2-score').textContent
                = parseInt(document.querySelector('.player2-score').textContent) + 1;
        }

        // Select success audio
        let successSound = document.getElementById('success');
        
        // Rewind and Play
        successSound.currentTime = 0;
        successSound.play();
    }
    else {

        // Select the audio element
        let failSound = document.getElementById('fail');

        //  Reset the audio to the start
        failSound.pause();       // Stop it if it's currently playing
        failSound.currentTime = 0; // Rewind to 0 seconds

        //  Play it
        failSound.play();

        //  Stop Clicking 
        stopClicking(duration); 

        //  Wait for the duration to finish before switching turns and resetting view
        setTimeout(() => {
            // Remove flipped class (close the cards)
            firstBlock.classList.remove('is-flipped');
            secondBlock.classList.remove('is-flipped');

            // Switch the turn logic NOW, not before
            if (turn === 1) {
                turn = 2;
                AddPlayer2Background(); 
            } else {
                turn = 1;
                AddPlayer1Background();
            }
            
        }, duration);
    }

    //Check If Game Ended
    if (document.querySelectorAll('.is-matched').length === blocks.length) {
        finalizeGame();
    }
}

//Shuffle Function
function shuffle(array) {
    let current = array.length,
        random;
    
    while (current > 0) {
        //Get Random Number
        random = Math.floor(Math.random() * current);

        //Decrease Length By One
        current--;

        //Swap Values
        [array[current], array[random]] = [array[random], array[current]];
    }
}

//Finilaze Game Function
function finalizeGame() {
    //Select Game Over Panel Elements
    let gameOverPanel = document.querySelector('.game-over-panel');
    let winnerElement = document.querySelector('.game-over-panel p:first-of-type span');
    let scoreElement = document.querySelector('.game-over-panel p:last-of-type span');

    let score = "";

    //Set Winner Text
    if (parseInt(document.querySelector('.player1-score').textContent)
        > parseInt(document.querySelector('.player2-score').textContent)) {

        winnerElement.textContent = 'Player 1';
        score = document.querySelector('.player1-score').textContent;
        gameOverPanel.style.backgroundColor = 'lightblue';

    } else if (parseInt(document.querySelector('.player1-score').textContent)
        < parseInt(document.querySelector('.player2-score').textContent)) {

        winnerElement.textContent = 'Player 2';
        score = document.querySelector('.player2-score').textContent;
        gameOverPanel.style.backgroundColor = 'lightcoral';

    } else {
        winnerElement.textContent = 'Draw';
        gameOverPanel.style.backgroundColor = 'lightgray';
    }

    //Set Score Text
    scoreElement.textContent = score;

    //Show Game Over Panel
    gameOverPanel.style.display = 'flex';
}

//add player1 background
function AddPlayer1Background() {
    document.body.style.backgroundColor = 'lightblue';
}

//add player2 background
function AddPlayer2Background() {
    document.body.style.backgroundColor = 'lightcoral';
}

function resetGame() {
    //Reset Blocks and transitions
    blocks.forEach(block => {
        block.classList.remove('is-matched');
        block.style.transition = 'none';
    });

    //Reset Scores
    document.querySelector('.player1-score').textContent = '0';
    document.querySelector('.player2-score').textContent = '0';

    //Reset Turn
    turn = 1;

    //Reset Background
    AddPlayer1Background();

    //Shuffle Blocks Order
    shuffle(orderRange);

    //Add Order Css Property To Game Blocks
    blocks.forEach((block, index) => {
        block.style.order = orderRange[index];
    });

    //Hide Game Over Panel
    document.querySelector('.game-over-panel').style.display = 'none';

}

//handel play again button click
document.querySelector('.game-over-panel .button').addEventListener('click', function () {
    resetGame();
});

//handle start game button click
document.querySelector('.control-buttons span').addEventListener('click', function () {
    document.querySelector('.control-buttons').remove();
    AddPlayer1Background();
});