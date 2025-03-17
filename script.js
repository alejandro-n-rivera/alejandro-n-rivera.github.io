const colors = ['green', 'red', 'yellow', 'blue'];
const emojiMap = {
    'green': '🟢',
    'red': '🔴',
    'yellow': '🟡',
    'blue': '🔵'
};

let secretCombination = [];
let currentGuess = [];
let remainingGuesses = 5;
let guessHistory = [];

function initGame() {
    // Generate secret combination with unique colors
    secretCombination = [];
    const availableColors = [...colors];
    for (let i = 0; i < 3; i++) {
        const randomIndex = Math.floor(Math.random() * availableColors.length);
        secretCombination.push(availableColors[randomIndex]);
        availableColors.splice(randomIndex, 1);  // Remove the used color
    }
    
    // Reset game state
    currentGuess = [];
    remainingGuesses = 5;
    document.getElementById('remainingGuesses').textContent = `Remaining Guesses: ${remainingGuesses}`;
    document.getElementById('feedback').textContent = '';
    document.getElementById('gameOver').classList.add('hidden');
    clearSlots();
    document.getElementById('submitGuess').disabled = true;
    guessHistory = [];
    updateHistoryDisplay();
}

function clearSlots() {
    const slots = document.querySelectorAll('.slot');
    slots.forEach(slot => slot.removeAttribute('data-emoji'));
    currentGuess = [];
    document.getElementById('submitGuess').disabled = true;  // Disable button when clearing slots
}

function checkGuess() {
    let correctPosition = 0;
    let correctColor = 0;
    let incorrect = 0;
    
    const tempSecret = [...secretCombination];
    const tempGuess = [...currentGuess];
    
    // Check correct positions first
    for (let i = 0; i < 3; i++) {
        if (tempGuess[i] === tempSecret[i]) {
            correctPosition++;
            tempSecret[i] = null;
            tempGuess[i] = null;
        }
    }
    
    // Check correct colors in wrong positions
    for (let i = 0; i < 3; i++) {
        if (tempGuess[i] !== null) {
            const index = tempSecret.indexOf(tempGuess[i]);
            if (index !== -1) {
                correctColor++;
                tempSecret[index] = null;
            } else {
                incorrect++;
            }
        }
    }
    
    return { correctPosition, correctColor, incorrect };
}

function addToHistory(guess, result) {
    const historyItem = {
        colors: [...guess],
        result: result
    };
    guessHistory.push(historyItem);
    updateHistoryDisplay();
}

function updateHistoryDisplay() {
    const historyContainer = document.getElementById('guessHistory');
    historyContainer.innerHTML = '';
    
    guessHistory.forEach((item, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'guess-history-item';
        
        const guessColors = document.createElement('div');
        guessColors.className = 'guess-colors';
        item.colors.forEach(color => {
            const colorSpan = document.createElement('span');
            colorSpan.textContent = emojiMap[color];
            guessColors.appendChild(colorSpan);
        });
        
        const feedback = document.createElement('div');
        feedback.className = 'guess-feedback';
        feedback.textContent = `✅\u2009${item.result.correctPosition}    ❓\u2009${item.result.correctColor}    ❌\u2009${item.result.incorrect}`;
        
        historyItem.appendChild(guessColors);
        historyItem.appendChild(feedback);
        historyContainer.appendChild(historyItem);
    });
}

// Event Listeners
document.querySelectorAll('.color-btn').forEach(button => {
    button.addEventListener('click', () => {
        const color = button.dataset.color;
        const existingIndex = currentGuess.indexOf(color);
        
        if (existingIndex !== -1) {
            // Remove the existing color (undo)
            currentGuess.splice(existingIndex, 1);
            updateSlotDisplay();
        } else if (currentGuess.length < 3) {
            // Add new color only if there's room
            currentGuess.push(color);
            document.querySelectorAll('.slot')[currentGuess.length - 1].setAttribute('data-emoji', emojiMap[color]);
        }
        document.getElementById('submitGuess').disabled = currentGuess.length !== 3;
    });
});

document.getElementById('submitGuess').addEventListener('click', () => {
    const result = checkGuess();
    remainingGuesses--;
    document.getElementById('remainingGuesses').textContent = `Remaining Guesses: ${remainingGuesses}`;
    
    const feedback = `✅\u2009${result.correctPosition}    ❓\u2009${result.correctColor}    ❌\u2009${result.incorrect}`;
    document.getElementById('feedback').textContent = feedback;
    
    addToHistory(currentGuess, result);
    
    if (result.correctPosition === 3) {
        document.getElementById('gameOver').classList.remove('hidden');
        document.getElementById('gameOver').querySelector('h2').innerHTML = '<div class="game-over-text">You Won! 🎉</div>';
        document.getElementById('submitGuess').disabled = true;  // Disable button on win
    } else if (remainingGuesses === 0) {
        document.getElementById('gameOver').classList.remove('hidden');
        const gameOverMessage = document.getElementById('gameOver').querySelector('h2');
        gameOverMessage.innerHTML = '<div class="game-over-text">Game Over! 😢</div><div class="game-over-text">It was:</div>';
        
        // Add the correct combination display
        const correctCombo = document.createElement('div');
        correctCombo.style.marginTop = '10px';
        correctCombo.style.fontSize = '2rem';
        correctCombo.textContent = secretCombination.map(color => emojiMap[color]).join(' ');
        gameOverMessage.appendChild(correctCombo);
        document.getElementById('submitGuess').disabled = true;  // Disable button on loss
    } else {
        clearSlots();  // This will now also disable the button
    }
});

// Add click handlers for slots
document.querySelectorAll('.slot').forEach((slot, index) => {
    slot.addEventListener('click', () => {
        if (slot.hasAttribute('data-emoji')) {  // Only act if the slot has a color
            currentGuess.splice(index, 1);  // Remove the color at this position
            updateSlotDisplay();
            document.getElementById('submitGuess').disabled = true;
        }
    });
});

// Helper function to update slot display after removing colors
function updateSlotDisplay() {
    const slots = document.querySelectorAll('.slot');
    slots.forEach(slot => {
        slot.removeAttribute('data-emoji');
    });  // Clear all slots
    currentGuess.forEach((color, i) => {
        slots[i].setAttribute('data-emoji', emojiMap[color]);  // Set emoji using data attribute
    });
}

document.getElementById('playAgain').addEventListener('click', initGame);

// Initialize game on load
initGame(); 