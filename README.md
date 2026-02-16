```markdown
# Memory Game

A fun and interactive **2-Player Memory Card Matching Game** built with **HTML, CSS, and Vanilla JavaScript**.  
Players take turns flipping cards to find matching pairs. The player with the highest score at the end wins!

---

## Demo

* **Live Demo**: (Add your live demo link here if deployed)

---

## Introduction

Memory Game is a browser-based card matching game designed for two players.

The game consists of multiple cards placed face down. Each player takes turns flipping two cards:

- If the cards match → the player earns a point and continues.
- If they do not match → the cards flip back, and the turn switches.

The game ends when all pairs are matched, and the player with the highest score is declared the winner.

---

## Table of Contents

* [Game Features](#game-features)
* [How to Play](#how-to-play)
* [Project Structure](#project-structure)
* [Game Technologies (Cards)](#game-technologies-cards)
* [Technologies Used](#technologies-used)
* [Installation](#installation)
* [Game Logic Overview](#game-logic-overview)
* [Audio Effects](#audio-effects)
* [Configuration](#configuration)
* [Responsive Design](#responsive-design)
* [Future Improvements](#future-improvements)
* [Author](#author)
* [License](#license)
* [Contributing](#contributing)

---

## Game Features

* 🎮 **Two-Player Mode**
* 🔀 **Random Card Shuffle** at the start of every game
* 🎴 **Card Flip Animation** with smooth CSS 3D transforms
* 🔊 **Sound Effects**
  * Success sound for matched cards
  * Fail sound for incorrect matches
* 🏆 **Automatic Score Tracking**
* 🔁 **Turn Switching System**
* 🎨 **Dynamic Background Change** based on current player
* 🛑 **Click Prevention** while checking mismatched cards
* 📱 **Responsive Layout** for different screen sizes
* 🔄 **Play Again Button** to reset and reshuffle the game

---

## How to Play

1. Click **Start Game**
2. Player 1 begins
3. Click on two cards to flip them
4. If the cards match:
   - Player earns a point
   - Cards remain revealed
   - Player continues
5. If the cards do not match:
   - Cards flip back
   - Turn switches to the other player
6. Continue until all pairs are matched
7. The winner is announced automatically
8. Click **Play Again** to restart

---

## Project Structure

```

MemoryGame/
├── index.html        # Game structure and layout
├── main.css          # Styling and animations
├── main.js           # Game logic and interactions
├── images/           # Technology card images
├── audio/            # Success and fail sound effects
└── README.md         # Project documentation

````

---

## Game Technologies (Cards)

The game includes matching pairs of the following technologies:

* HTML
* CSS
* Gulp
* React
* GitHub
* Jest
* Python
* Vue.js
* Angular
* MongoDB

Each technology appears twice, creating matching pairs.

---

## Technologies Used

### HTML5
* Semantic structure
* Card grid layout
* Audio elements

### CSS3
* CSS Grid for layout
* 3D flip animations using `transform`
* Responsive media queries
* Smooth transitions
* Dynamic backgrounds

### JavaScript (Vanilla)
* DOM manipulation
* Event handling
* Shuffle algorithm (Fisher-Yates)
* Game state management
* Turn switching logic
* Score calculation
* Audio control
* Game reset functionality

---

## Installation

To run the project locally:

1. Clone the repository:

```bash
git clone https://github.com/your-username/memory-game.git
````

2. Navigate into the project folder:

```bash
cd memory-game
```

3. Open `index.html` in your browser.

No additional dependencies or build tools are required.

---

## Game Logic Overview

### Card Shuffle

The game uses a shuffle function to randomize card order each time the game starts.

### Flip Logic

* Adds `is-flipped` class when clicked
* Checks if two cards are flipped
* Compares `data-technology` attributes

### Matching Logic

If matched:

* Adds `is-matched` class
* Updates current player's score
* Plays success sound

If not matched:

* Plays fail sound
* Prevents clicking temporarily
* Flips cards back after delay
* Switches player turn

### Game End Detection

The game ends when:

```
Number of matched cards === Total number of cards
```

A game over panel appears displaying:

* Winner name
* Final score
* Play Again button

---

## Audio Effects

Two audio files are used:

* `success.mp3` → Played when a match is found
* `fail.mp3` → Played when cards do not match

Audio is reset (`currentTime = 0`) before replaying to ensure immediate feedback.

---

## Configuration

You can customize:

### 🎯 Flip Duration

```javascript
let duration = 1000;
```

Controls how long mismatched cards stay flipped.

### 🎨 Player Background Colors

```javascript
AddPlayer1Background();
AddPlayer2Background();
```

Modify background colors inside these functions.

### 🃏 Add or Remove Cards

To add new technologies:

1. Duplicate a `.game-block` in `index.html`
2. Update the `data-technology` attribute
3. Add corresponding image inside `/images`

Make sure every card has exactly one matching pair.

---

## Responsive Design

The layout adapts to different screen sizes:

* 5×4 grid on large screens
* 4×5 grid on tablets
* 3×7 grid on small mobile devices
* Score positions adjust for mobile view
* Buttons scale using `clamp()` and media queries

---

## Future Improvements

* Add single-player mode
* Add timer mode
* Add difficulty levels
* Add move counter
* Add animations for winner
* Store scores in `localStorage`
* Add multiplayer (online) support

---

## Author

**Your Name Here**

---

## License

This project is open source and available under the **MIT License**.

---

## Contributing

Feel free to fork this project and submit pull requests for improvements or new features!

---

Enjoy the game! 🎴✨

```
```
