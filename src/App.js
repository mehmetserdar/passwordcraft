import React, { useState, useEffect, useCallback } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

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

function App() {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [settings, setSettings] = useState({
    upper: true,
    lower: true,
    number: true,
    special: true
  });

  const [level, setLevel] = useState(() => {
    const savedLevel = localStorage.getItem('arcadeLevel');
    return savedLevel ? parseInt(savedLevel) : 1;
  });
  const [mode, setMode] = useState('friendly');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [savedPasswords, setSavedPasswords] = useState([]);
  const [passwordCount, setPasswordCount] = useState();
  const [generatedPasswords, setGeneratedPasswords] = useState([]);
  
  const separators = ['-', '_', '.', '!', '@', '#', '$', '%', '&', '*'];

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
    playSound('generate');
  }, [length, settings, mode, passwordCount, mnemonicLength, bip39Words]);

  const handleSettingChange = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  useEffect(() => {
    generatePassword();
    }, [generatePassword]);

  const [strengthBadge, setStrengthBadge] = useState({
    color: '#dc3545',
    text: 'Weak'
  });

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

  const playSound = (type) => {
    if (!soundEnabled) return;
    console.log(`Playing ${type} sound`);
  };

  const arcadeStyle = {
    fontFamily: "'Press Start 2P', monospace",
    backgroundColor: '#1a1a1a',
    backgroundImage: 'linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.8))',
    color: '#00ff00',
    padding: '20px',
    borderRadius: '8px',
    border: '4px solid #4b0082',
    animation: 'glow 2s infinite',
    letterSpacing: '1px',
    lineHeight: '1.5'
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
    checkLevelUp(updatedPasswords.length);
    playSound('save');
    showNotification(`${newPasswords.length} passwords successfully saved!`, 'success');
  };

  const checkLevelUp = (count) => {
    const newLevel = Math.floor(count / 5) + 1;
    if (newLevel > level) {
      setLevel(newLevel);
      localStorage.setItem('arcadeLevel', newLevel.toString());
      playSound('levelup');
    }
  };

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
    playSound('download');
  };

  const clearAllPasswords = () => {
    setSavedPasswords([]);
    localStorage.removeItem('savedPasswords');
    setLevel(1);
    localStorage.setItem('arcadeLevel', '1');
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
        `}
      </style>

      <div className="container py-5">
        <h1 className="text-center mb-5" 
            style={{
              color: '#ff00ff', 
              textShadow: '0 0 10px #ff00ff',
              fontSize: '1.8rem',
              letterSpacing: '2px'
            }}>
          ARCADE PASSWORD GENERATOR - LEVEL {level}
        </h1>

        <div className="col-md-8 mx-auto">
          <div className="row mb-4">
            <div className="col-4">
              <button 
                className={`btn w-100 ${mode === 'friendly' ? 'btn-success' : 'btn-outline-success'}`}
                onClick={() => setMode('friendly')}
                style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '0.8rem', padding: '15px' }}
              >
                FRIENDLY
              </button>
            </div>
            <div className="col-4">
              <button 
                className={`btn w-100 ${mode === 'strong' ? 'btn-warning' : 'btn-outline-warning'}`}
                onClick={() => setMode('strong')}
                style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '0.8rem', padding: '15px' }}
              >
                STRONG
              </button>
            </div>
            <div className="col-4">
              <button 
                className={`btn w-100 ${mode === 'mnemonic' ? 'btn-info' : 'btn-outline-info'}`}
                onClick={() => setMode('mnemonic')}
                style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '0.8rem', padding: '15px' }}
              >
                MNEMONIC
              </button>
            </div>
          </div>

          {mode === 'mnemonic' ? (
            <div className="input-group mb-3 shadow-sm">
              <span className="input-group-text bg-white" style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '0.8rem' }}>
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
                  <div className="input-group-text bg-white border-end-0">
                    <input
                      type="checkbox"
                      checked={settings[type]}
                      onChange={() => handleSettingChange(type)}
                      className="form-check-input"
                    />
                  </div>
                  <input
                    type="text"
                    className="form-control border-start-0"
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

          <div className="position-fixed bottom-0 end-0 p-3">
   
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
