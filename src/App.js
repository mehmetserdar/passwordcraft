import React, { useState, useEffect, useCallback, useMemo } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { gameSystem } from './modules/gameSystem';
import { Achievements } from './components/Achievements';

const charTypes = {
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lower: "abcdefghijklmnopqrstuvwxyz",
  number: "0123456789",
  special: "!$%^&*()-=+[]{};#:@~,./<>?",
};

const words = [
  'apple', 'banana', 'cherry', 'dragon', 'elephant', 'flamingo', 'giraffe', 
  'honey', 'iguana', 'jelly', 'koala', 'lemon', 'mango', 'ninja', 'orange',
  'panda', 'quokka', 'rainbow', 'sunshine', 'tiger', 'unicorn', 'volcano',
  'watermelon', 'xylophone', 'yellow', 'zebra'
];

const brandColors = {
  primary: '#6366f1', // Indigo
  secondary: '#8b5cf6', // Violet
  accent: '#f43f5e', // Rose
  background: '#1e1b4b', // Dark indigo
  text: '#f8fafc', // Slate light
  darkBackground: '#0f0f1a', // Daha koyu arka plan
  cardBg: '#1a1a2e', // Kart arka planı
};

function App() {
  const [strengthBadge, setStrengthBadge] = useState({
    color: '#dc3545',
    text: 'Weak'
  });

  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [settings, setSettings] = useState({
    upper: true,
    lower: true,
    number: true,
    special: true
  });

  const [gameState, setGameState] = useState(() => ({
    level: gameSystem.stats.highestLevel,
    totalPasswords: gameSystem.stats.totalPasswords
  }));
  const [mode, setMode] = useState('friendly');
  const [savedPasswords, setSavedPasswords] = useState(() => {
    const saved = localStorage.getItem('savedPasswords');
    return saved ? JSON.parse(saved) : [];
  });
  const [passwordCount, setPasswordCount] = useState(1);
  const [generatedPasswords, setGeneratedPasswords] = useState([]);
  
  const separators = useMemo(() => ['-', '_', '.', '!', '@', '#', '$', '%', '&', '*'], []);

  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  const [mnemonicLength, setMnemonicLength] = useState(12);
  const [bip39Words, setBip39Words] = useState([]);

  useEffect(() => {
    // Load BIP39 words from english.txt
    fetch('/english.txt')
      .then(response => response.text())
      .then(text => {
        const words = text.trim().split('\n');
        setBip39Words(words);
      })
      .catch(error => console.error('Error loading BIP39 wordlist:', error));
  }, []);

  const generatePassword = useCallback(() => {
    let passwords = [];
    
    for (let count = 0; count < passwordCount; count++) {
      let newPassword = '';
      
      if (mode === 'mnemonic') {
        // Use bip39Words instead of BIP39_WORDS
        const words = [];
        for (let i = 0; i < mnemonicLength; i++) {
          const randomIndex = Math.floor(Math.random() * bip39Words.length);
          words.push(bip39Words[randomIndex]);
        }
        newPassword = words.join(' ');
      } else if (mode === 'friendly') {
        const word1 = words[Math.floor(Math.random() * words.length)];
        const word2 = words[Math.floor(Math.random() * words.length)];
        const separator = separators[Math.floor(Math.random() * separators.length)];
        const num = Math.floor(Math.random() * 90) + 10;
        newPassword = `${word1}${separator}${word2}${num}`;
      } else if (mode === 'strong') {
        const charBlocks = [];
        Object.keys(settings).forEach(key => {
          if (settings[key]) {
            charBlocks.push(charTypes[key]);
          }
        });
        
        let allChars = charBlocks.join('');
        for (let i = 0; i < length; i++) {
          newPassword += allChars.charAt(Math.floor(Math.random() * allChars.length));
        }
      }
      passwords.push(newPassword);
    }
    
    setGeneratedPasswords(passwords);
    setPassword(passwords[0]); // Set first password as current

    // Şifre oluşturulduktan sonra game system'i güncelle
    const result = gameSystem.updateStats({
      strength: strengthBadge.text,
      mode,
      isSaved: false,
      batchSize: passwordCount  // Batch size'ı ekle
    });

    // UI state güncelleme
    setGameState({
      level: result.currentLevel,
      totalPasswords: gameSystem.stats.totalPasswords
    });

    if (result.levelUp) {
      setLevelUpAnimation(true);
      setTimeout(() => setLevelUpAnimation(false), 1500);
      showNotification(`Level Up! You are now level ${result.currentLevel}`, 'success');
    }
  }, [length, settings, mode, passwordCount, mnemonicLength, bip39Words, separators, strengthBadge.text]);

  const handleSettingChange = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  useEffect(() => {
    generatePassword();
    }, [generatePassword]);

  useEffect(() => {
    checkStrength(password);
  }, [password]);

  const checkStrength = (pass) => {
    if (new RegExp("(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{24,})").test(pass)) {
      setStrengthBadge({ color: '#6f42c1', text: 'Impossible' });
    } else if (new RegExp("(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{16,})").test(pass)) {
      setStrengthBadge({ color: '#198754', text: 'Very Strong' });
    } else if (new RegExp("(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{12,})").test(pass)) {
      setStrengthBadge({ color: '#0dcaf0', text: 'Strong' });
    } else if (new RegExp("((?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{6,}))").test(pass)) {
      setStrengthBadge({ color: '#ffc107', text: 'Medium' });
    } else {
      setStrengthBadge({ color: '#dc3545', text: 'Weak' });
    }
  };

  const arcadeStyle = {
    fontFamily: "'Press Start 2P', monospace",
    backgroundColor: brandColors.darkBackground,
    backgroundImage: 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3))',
    color: brandColors.text,
    padding: '20px',
    borderRadius: '12px',
    border: `2px solid ${brandColors.secondary}`,
    boxShadow: `0 0 20px rgba(139, 92, 246, 0.3)`, // Mor gölge
    letterSpacing: '1px',
    lineHeight: '1.5',
    minHeight: '100vh'
  };

  const savePassword = () => {
    const newPasswords = generatedPasswords.filter(pass => !savedPasswords.includes(pass));
    
    if (newPasswords.length === 0) {
      showNotification('These passwords are already saved!', 'warning');
      return;
    }

    const updatedPasswords = [...savedPasswords, ...newPasswords];
    setSavedPasswords(updatedPasswords);
    localStorage.setItem('savedPasswords', JSON.stringify(updatedPasswords));
    showNotification(`${newPasswords.length} passwords successfully saved!`, 'success');

    // Şifre kaydedildiğinde game system'i güncelle
    const result = gameSystem.updateStats({
      strength: strengthBadge.text,
      mode,
      isSaved: true
    });

    if (result.newAchievements.length > 0) {
      result.newAchievements.forEach(achievement => {
        showNotification(`Achievement Unlocked: ${achievement.title}!`, 'success');
      });
    }
  };

  const [levelUpAnimation, setLevelUpAnimation] = useState(false);

  const downloadPasswords = () => {
    if (savedPasswords.length === 0) return;
    const content = savedPasswords.join('\n\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'arcade-passwords.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearAllPasswords = () => {
    setSavedPasswords([]);
    localStorage.removeItem('savedPasswords');
    
    // UI'daki level bilgisini gameSystem'den tekrar al
    setGameState({
      level: gameSystem.stats.highestLevel,
      totalPasswords: gameSystem.stats.totalPasswords
    });
    
    showNotification('Saved passwords cleared', 'success');
  };

  return (
    <div style={arcadeStyle}>
      {/* Notification Component */}
      {notification.show && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '1rem',
            borderRadius: '8px',
            backgroundColor: notification.type === 'success' ? '#198754' :
                           notification.type === 'warning' ? '#ffc107' :
                           notification.type === 'error' ? '#dc3545' : '#0dcaf0',
            color: notification.type === 'warning' ? '#000' : '#fff',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '0.8rem',
            border: '2px solid',
            borderColor: notification.type === 'success' ? '#146c43' :
                        notification.type === 'warning' ? '#ffcd39' :
                        notification.type === 'error' ? '#bb2d3b' : '#3dd5f3',
            animation: 'slideIn 0.3s ease-out'
          }}
        >
          {notification.message}
        </div>
      )}

      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          
          @keyframes levelUp {
            0% { transform: scale(1); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); }
          }

          .level-badge {
            background: linear-gradient(45deg, ${brandColors.primary}, ${brandColors.secondary});
            padding: 0.5rem 1rem;
            border-radius: 1rem;
            color: white;
            display: inline-block;
            margin-left: 1rem;
            animation: ${levelUpAnimation ? 'levelUp 1.5s ease' : 'none'};
          }

          .bg-card {
            background-color: ${brandColors.cardBg} !important;
            border: 1px solid rgba(139, 92, 246, 0.2) !important;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
          }
        `}
      </style>

      <div className="container py-5">
        <div className="text-center mb-5">
          <h1 className="mb-3" 
              style={{
                color: brandColors.primary,
                textShadow: `0 0 10px ${brandColors.accent}`,
                fontSize: '2rem',
                letterSpacing: '2px'
              }}>
            PasswordCraft
          </h1>
          
          <div className="level-badge">
            <span style={{ fontSize: '0.8rem' }}>LEVEL</span>
            <span style={{ fontSize: '1.2rem', marginLeft: '0.5rem' }}>{gameState.level}</span>
          </div>

          <div style={{ fontSize: '0.8rem', color: brandColors.text, marginTop: '0.5rem' }}>
            {gameState.level < 10 ? `${gameSystem.stats.totalPasswords} passwords generated` : 'Max Level!'}
          </div>

          <p className="mt-3" style={{ color: brandColors.text, opacity: 0.8 }}>
            Craft your perfect password with our powerful arcade-style generator
          </p>
        </div>

        <div className="col-md-8 mx-auto">
          <div className="mb-4">
            <h5 style={{ color: brandColors.secondary, marginBottom: '1rem' }}>Select Your Mode</h5>
            <div className="row">
              <div className="col-4">
                <button 
                  className={`btn w-100 ${mode === 'friendly' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setMode('friendly')}
                  style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '0.8rem' }}
                >
                  <div>FRIENDLY</div>
                  <small style={{ fontSize: '0.6rem' }}>Easy to remember</small>
                </button>
              </div>
              <div className="col-4">
                <button 
                  className={`btn w-100 ${mode === 'strong' ? 'btn-warning' : 'btn-outline-warning'}`}
                  onClick={() => setMode('strong')}
                  style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '0.8rem' }}
                >
                  <div>STRONG</div>
                  <small style={{ fontSize: '0.6rem' }}>Maximum security</small>
                </button>
              </div>
              <div className="col-4">
                <button 
                  className={`btn w-100 ${mode === 'mnemonic' ? 'btn-info' : 'btn-outline-info'}`}
                  onClick={() => setMode('mnemonic')}
                  style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '0.8rem' }}
                >
                  <div>MNEMONIC</div>
                  <small style={{ fontSize: '0.6rem' }}>BIP39 compatible</small>
                </button>
              </div>
            </div>
          </div>

          {mode === 'mnemonic' ? (
            <div className="input-group mb-3 shadow-sm">
              <span className="input-group-text bg-card text-light">
                Words:
              </span>
              <select
                className="form-select"
                value={mnemonicLength}
                onChange={(e) => setMnemonicLength(parseInt(e.target.value))}
                style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '0.8rem' }}
              >
                <option value="3">3 Words</option>
                <option value="6">6 Words</option>
                <option value="9">9 Words</option>
                <option value="12">12 Words</option>
                <option value="15">15 Words</option>
                <option value="18">18 Words</option>
                <option value="21">21 Words</option>
                <option value="24">24 Words</option>
              </select>
            </div>
          ) : (
            <>
              {Object.keys(charTypes).map(type => (
                <div key={type} className="input-group mb-3 shadow-sm">
                  <div className="input-group-text bg-card text-light border-end-0">
                    <input
                      type="checkbox"
                      checked={settings[type]}
                      onChange={() => handleSettingChange(type)}
                      className="form-check-input"
                    />
                  </div>
                  <input
                    type="text"
                    className="form-control bg-card text-light border-start-0"
                    value={charTypes[type]}
                    readOnly
                  />
                </div>
              ))}

              <div className="input-group mb-3 shadow-sm">
                <span className="input-group-text bg-white" style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '0.8rem' }}>
                  Length:
                </span>
                <input
                  type="number"
                  className="form-control"
                  value={length}
                  onChange={(e) => setLength(parseInt(e.target.value))}
                  style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '0.8rem' }}
                />
                <span className="input-group-text bg-white" style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '0.8rem' }}>
                  Count:
                </span>
                <input
                  type="number"
                  className="form-control"
                  value={passwordCount}
                  min="1"
                  max="20"
                  onChange={(e) => setPasswordCount(parseInt(e.target.value))}
                  style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '0.8rem' }}
                />
              </div>
            </>
          )}

          {/* Display generated passwords */}
          {generatedPasswords.length > 0 && (
            <div className="mb-3">
              <div className="bg-dark p-3 rounded border border-secondary">
                <h6 style={{ 
                  fontFamily: "'Press Start 2P', monospace", 
                  color: '#00ff00', 
                  fontSize: '0.8rem',
                  marginBottom: '15px' 
                }}>
                  Generated Passwords:
                </h6>
                {generatedPasswords.map((pass, index) => (
                  <div key={index} className="d-flex justify-content-between align-items-center mb-2 bg-black bg-opacity-50 p-2 rounded">
                    <span style={{ 
                      fontFamily: "'Press Start 2P', monospace",
                      fontSize: '0.7rem', 
                      color: '#fff',
                      wordBreak: 'break-all'
                    }}>
                      {pass}
                    </span>
                    <button
                      className="btn btn-sm btn-outline-light ms-2"
                      onClick={() => {
                        navigator.clipboard.writeText(pass);
                        showNotification('Password copied to clipboard!', 'success');
                      }}
                    >
                      <i className="fa fa-clipboard"></i>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="input-group input-group-lg mb-3 shadow-sm">
            <input
              type="text"
              className="form-control"
              value={password}
              readOnly
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '1rem',
                letterSpacing: '2px',
                borderColor: strengthBadge.color,
                borderWidth: '2px',
                transition: 'all 0.3s ease',
                boxShadow: `0 0 0 0.1rem ${strengthBadge.color}25`
              }}
            />
            <span 
              className="input-group-text"
              style={{ 
                fontFamily: "'Press Start 2P', monospace",
                fontSize: '0.8rem',
                color: strengthBadge.color,
                borderColor: strengthBadge.color,
                borderWidth: '2px',
                transition: 'all 0.3s ease'
              }}
            >
              {strengthBadge.text}
            </span>
            <button
              className="btn"
              onClick={() => {
                navigator.clipboard.writeText(password);
                showNotification('Password copied to clipboard!', 'success');
              }}
              style={{
                color: strengthBadge.color,
                borderColor: strengthBadge.color,
                borderWidth: '2px',
                transition: 'all 0.3s ease',
                marginLeft: '-1px'
              }}
            >
              <i className="fa fa-clipboard"></i>
            </button>
          </div>

          <div className="row g-2 mb-4">
            <div className="col-6">
              <button 
                className="btn btn-lg btn-danger w-100"
                onClick={generatePassword}
                style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '0.8rem', padding: '15px' }}
              >
                🎮 GENERATE
              </button>
            </div>
            <div className="col-6">
              <button 
                className="btn btn-lg btn-success w-100"
                onClick={savePassword}
                style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '0.8rem', padding: '15px' }}
              >
                💾 SAVE
              </button>
            </div>
          </div>

          <div className="mt-4">
            <h3 style={{ 
              fontFamily: "'Press Start 2P', monospace",
              color: '#a855f7',
              fontSize: '1rem',
              marginBottom: '1rem'
            }}>
              SAVED PASSWORDS
            </h3>
            <div className="bg-dark p-3 rounded border border-secondary">
              {savedPasswords.length === 0 ? (
                <div className="text-center text-muted">No passwords saved yet</div>
              ) : (
                savedPasswords.map((pass, index) => (
                  <div key={index} className="d-flex justify-content-between align-items-center mb-2 bg-black bg-opacity-50 p-2 rounded">
                    <span style={{ 
                      fontFamily: "'Press Start 2P', monospace",
                      fontSize: '0.7rem',
                      color: '#00ff00',
                      wordBreak: 'break-all'
                    }}>
                      {pass}
                    </span>
                    <button 
                      onClick={() => {
                        const newPasswords = savedPasswords.filter((_, i) => i !== index);
                        setSavedPasswords(newPasswords);
                        localStorage.setItem('savedPasswords', JSON.stringify(newPasswords));
                      }}
                      className="btn btn-sm btn-danger ms-2"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                ))
              )}
            </div>
            <div className="mt-2">
              <button 
                className="btn btn-info me-2"
                onClick={downloadPasswords}
              >
                Download .txt
              </button>
              <button 
                className="btn btn-danger"
                onClick={clearAllPasswords}
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="mt-4">
            <Achievements />
          </div>

          <div className="position-fixed bottom-0 end-0 p-3">
   
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
