# PasswordCraft

🔒 A powerful arcade-style password generator that makes security fun and accessible.

PasswordCraft offers three distinct modes to help you create the perfect password for any situation:

- 🎮 **Friendly Mode**: Creates memorable passwords by combining words with numbers and symbols
- 🛡️ **Strong Mode**: Generates complex passwords with maximum security
- 🗝️ **Mnemonic Mode**: Produces BIP39-compatible seed phrases for crypto wallets

## Features

- Multiple password generation modes:
  - Strong: Customizable character-based passwords
  - Friendly: Human-readable passwords with words
  - Mnemonic: BIP39 word-based passwords
- Arcade-style interface with levels and achievements
- Generate multiple passwords at once
- Save and manage password history
- Password strength indicator
- Copy to clipboard functionality
- Download saved passwords as .txt file
- Sound effects and notifications
- Responsive design with Bootstrap

## Why PasswordCraft?

- **Fun & Engaging**: Arcade-style interface makes password generation enjoyable
- **Flexible**: Multiple modes for different security needs
- **Secure**: Strong password generation algorithms
- **Feature-Rich**: Save, export, and manage your passwords
- **Modern**: Built with React and modern web technologies

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/passwordcraft.git
cd passwordcraft
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The application will open in your default browser at `http://localhost:3000`.

### Production Build

To create a production build:
```bash
npm run build
```

## Deployment

This project is configured for deployment on Netlify. Just connect your GitHub repository to Netlify and it will automatically deploy your main branch.

## Password Generation Modes

### Strong Mode
- Configurable length
- Include/exclude uppercase letters, lowercase letters, numbers, and special characters
- Advanced strength indicator

### Friendly Mode
- Creates memorable passwords using word combinations
- Automatically includes numbers and special characters
- Easy to remember, yet secure

### Mnemonic Mode
- Generates BIP39 compatible word sequences
- Choose between 3 to 24 words
- Perfect for cryptocurrency wallets and seed phrases

## Arcade Features

- Level up system based on password generation activity
- Visual feedback and notifications
- Save and track generated passwords
- Password history management
- Clear and download functionality

## Built With

- React
- Bootstrap
- Font Awesome
- Netlify
