# Chess Game

A professional, modern chess game built with HTML, CSS, and JavaScript. Features a beautiful UI, complete chess rules implementation, and AI opponent with multiple difficulty levels.

## Features

### 🎮 Game Modes
- **Two Player Mode**: Play against a friend on the same device
- **Computer Mode**: Challenge the AI with three difficulty levels:
  - **Easy**: Random moves
  - **Medium**: Strategic moves with basic evaluation
  - **Hard**: Advanced AI with piece evaluation

### ♟️ Complete Chess Rules
- All standard chess pieces with proper movement rules
- Special moves: Castling, En Passant, Pawn Promotion
- Check and Checkmate detection
- Stalemate detection
- Valid move highlighting
- Move history tracking
- Captured pieces display

### 🎨 Modern UI/UX
- Responsive design that works on desktop and mobile
- Beautiful gradient backgrounds and modern styling
- Smooth animations and transitions
- Interactive piece selection and move highlighting
- Professional chess board with proper colors
- Game controls: Undo, Flip Board, Reset

### 🔊 Audio Feedback
- Move sounds
- Capture sounds
- Check alerts
- Checkmate celebration

### 📱 Responsive Design
- Optimized for desktop, tablet, and mobile devices
- Adaptive layout that adjusts to screen size
- Touch-friendly interface for mobile play

## How to Play

1. **Start the Game**: Open `index.html` in your web browser
2. **Select Game Mode**: Choose between Two Player or Computer mode
3. **Choose Difficulty** (if playing vs Computer): Select Easy, Medium, or Hard
4. **Make Moves**: Click on a piece to select it, then click on a valid square to move
5. **Game Controls**:
   - **Undo**: Take back the last move
   - **Flip Board**: Rotate the board 180 degrees
   - **Reset**: Start a new game

## Game Rules

### Piece Movement
- **Pawn**: Moves forward one square (two on first move), captures diagonally
- **Rook**: Moves horizontally and vertically any number of squares
- **Knight**: Moves in L-shape (2 squares in one direction, 1 square perpendicular)
- **Bishop**: Moves diagonally any number of squares
- **Queen**: Combines Rook and Bishop movement
- **King**: Moves one square in any direction

### Special Moves
- **Castling**: King moves two squares toward Rook, Rook jumps over King
- **En Passant**: Pawn captures opponent pawn that just moved two squares
- **Pawn Promotion**: Pawn becomes Queen when reaching opposite end

### Game End Conditions
- **Checkmate**: King is in check with no legal moves to escape
- **Stalemate**: Player has no legal moves but King is not in check
- **Draw**: Various conditions including insufficient material

## Technical Details

### File Structure
```
├── index.html          # Main HTML file
├── style.css           # CSS styles and responsive design
├── script.js           # JavaScript game logic
├── sounds/             # Audio files
│   ├── move.mp3        # Piece movement sound
│   ├── capture.mp3     # Piece capture sound
│   ├── check.mp3       # Check alert sound
│   └── checkmate.mp3   # Checkmate celebration sound
└── README.md           # This file
```

### Technologies Used
- **HTML5**: Semantic markup and structure
- **CSS3**: Modern styling with Flexbox, Grid, and animations
- **JavaScript ES6+**: Object-oriented programming with classes
- **Font Awesome**: Icons for UI elements
- **Google Fonts**: Inter font family for typography

### Browser Compatibility
- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)

## Installation and Setup

1. **Download**: Clone or download the project files
2. **No Dependencies**: No build process or package installation required
3. **Run**: Open `index.html` in any modern web browser
4. **Play**: Start playing immediately!

## Development

### Running Locally
```bash
# Using Python (if available)
python3 -m http.server 8000

# Using Node.js (if available)
npx http-server

# Using PHP (if available)
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

### Customization
- **Colors**: Modify CSS variables in `style.css`
- **Sounds**: Replace audio files in `sounds/` directory
- **AI Difficulty**: Adjust evaluation functions in `script.js`
- **Board Size**: Modify CSS grid properties for different board sizes

## Future Enhancements

- [ ] Save/Load game functionality
- [ ] Online multiplayer support
- [ ] Advanced AI with opening books
- [ ] Game analysis and move suggestions
- [ ] Tournament mode
- [ ] Custom piece themes
- [ ] Voice commands
- [ ] Accessibility improvements

## Contributing

Feel free to contribute to this project by:
- Reporting bugs
- Suggesting new features
- Improving the AI
- Enhancing the UI/UX
- Adding new game modes

## License

This project is open source and available under the MIT License.

## Credits

- Chess piece Unicode symbols
- Font Awesome for icons
- Google Fonts for typography
- Sound effects (placeholder files)

---

**Enjoy playing chess!** ♟️