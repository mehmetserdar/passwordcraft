import React, { useState, useEffect, useCallback } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const charTypes = {
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lower: "abcdefghijklmnopqrstuvwxyz",
  number: "0123456789",
  special: "!$%^&*()-=+[]{};#:@~,./<>?",
};

function App() {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [settings, setSettings] = useState({
    upper: true,
    lower: true,
    number: true,
    special: true
  });
  
  const generatePassword = useCallback(() => {
    const charBlocks = [];
    Object.keys(settings).forEach(key => {
      if (settings[key]) {
        charBlocks.push(charTypes[key]);
      }
    });
    
    let allChars = charBlocks.join('');
    let newPassword = '';
    for (let i = 0; i < length; i++) {
      newPassword += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }
    setPassword(newPassword);
  }, [length, settings]);

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

  return (
    <div className="bg-light min-vh-100">
      <div className="container py-5">
        <h1 className="text-primary text-center mb-5">Strong Password Generator</h1>

        <div className="col-md-6 mx-auto">
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
            <span className="input-group-text bg-white">Length:</span>
            <input
              type="number"
              className="form-control"
              value={length}
              onChange={(e) => setLength(parseInt(e.target.value))}
            />
            <button 
              className="btn btn-primary"
              onClick={generatePassword}
            >
              🔒 Generate
            </button>
          </div>

          <div className="input-group input-group-lg mb-3 shadow-sm">
            <input
              type="text"
              className="form-control"
              value={password}
              readOnly
              style={{
                borderColor: strengthBadge.color,
                borderWidth: '2px',
                transition: 'all 0.3s ease',
                boxShadow: `0 0 0 0.1rem ${strengthBadge.color}25`
              }}
            />
            <span 
              className="input-group-text"
              style={{ 
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
                alert('Password copied!');
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
        </div>
      </div>
    </div>
  );
}

export default App;
