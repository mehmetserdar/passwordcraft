const ACHIEVEMENTS = {
  BEGINNER: {
    id: 'beginner',
    title: 'Password Apprentice',
    description: 'Generate your first password',
    icon: '🎮'
  },
  WEAK_MASTER: {
    id: 'weak_master',
    title: 'Master of Weakness',
    description: 'Generate 10 weak passwords',
    icon: '🎯',
    requirement: 10
  },
  STRONG_MASTER: {
    id: 'strong_master',
    title: 'Security Expert',
    description: 'Generate 20 strong passwords',
    icon: '🛡️',
    requirement: 20
  },
  MNEMONIC_MASTER: {
    id: 'mnemonic_master',
    title: 'Crypto Wizard',
    description: 'Generate 5 mnemonic phrases',
    icon: '🔐',
    requirement: 5
  },
  SPEED_MASTER: {
    id: 'speed_master',
    title: 'Speed Hacker',
    description: 'Generate 10 passwords in a single batch',
    icon: '⚡',
    requirement: 10
  },
  IMPOSSIBLE_MASTER: {
    id: 'impossible_master',
    title: 'Impossible Master',
    description: 'Generate 5 impossible-strength passwords',
    icon: '🔥',
    requirement: 5
  },
  FRIENDLY_MASTER: {
    id: 'friendly_master',
    title: 'Memory Master',
    description: 'Generate 20 friendly passwords',
    icon: '🧠',
    requirement: 20
  },
  ELITE_GENERATOR: {
    id: 'elite_generator',
    title: 'Elite Generator',
    description: 'Reach level 5',
    icon: '👑',
    requirement: 5
  },
  PASSWORD_SAGE: {
    id: 'password_sage',
    title: 'Password Sage',
    description: 'Generate passwords using all modes',
    icon: '🎭',
    specialUnlock: true
  }
};

const LEVEL_THRESHOLDS = [
  0,    // Level 1
  5,    // Level 2
  15,   // Level 3
  30,   // Level 4
  50,   // Level 5
  75,   // Level 6
  105,  // Level 7
  140,  // Level 8
  180,  // Level 9
  225   // Level 10
];

class GameSystem {
  constructor() {
    this.stats = this.loadStats();
  }

  loadStats() {
    const savedStats = localStorage.getItem('gameStats');
    return savedStats ? JSON.parse(savedStats) : {
      totalPasswords: 0,
      weakPasswords: 0,
      strongPasswords: 0,
      mnemonicPhrases: 0,
      savedPasswords: 0,
      achievements: [],
      highestLevel: 1
    };
  }

  saveStats() {
    localStorage.setItem('gameStats', JSON.stringify(this.stats));
  }

  calculateLevel(totalPasswords) {
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (totalPasswords >= LEVEL_THRESHOLDS[i]) {
        return i + 1;
      }
    }
    return 1;
  }

  getNextLevelThreshold(currentLevel) {
    if (currentLevel >= LEVEL_THRESHOLDS.length) return null;
    return LEVEL_THRESHOLDS[currentLevel];
  }

  updateStats(passwordData) {
    const { strength, mode, isSaved, batchSize = 1 } = passwordData;
    
    this.stats.totalPasswords++;
    
    // Mode'a göre istatistikleri güncelle
    if (mode === 'mnemonic') {
      this.stats.mnemonicPhrases = (this.stats.mnemonicPhrases || 0) + 1;
    }

    // Güç seviyesine göre istatistikleri güncelle
    if (strength === 'Strong' || strength === 'Very Strong') {
      this.stats.strongPasswords = (this.stats.strongPasswords || 0) + 1;
    }

    // Batch size kontrolü
    if (batchSize >= 10) {
      this.stats.maxBatchSize = Math.max(this.stats.maxBatchSize || 0, batchSize);
    }

    // Mode kullanım takibi
    if (!this.stats.usedModes) {
      this.stats.usedModes = {};
    }
    this.stats.usedModes[mode] = true;

    const newLevel = this.calculateLevel(this.stats.totalPasswords);
    const levelUp = newLevel > this.stats.highestLevel;
    this.stats.highestLevel = Math.max(this.stats.highestLevel, newLevel);

    const newAchievements = this.checkAchievements();
    this.saveStats();

    return {
      currentLevel: newLevel,
      levelUp,
      nextThreshold: this.getNextLevelThreshold(newLevel),
      newAchievements
    };
  }

  checkAchievements() {
    const { stats } = this;
    const newAchievements = [];

    // Base achievement
    if (!stats.achievements.includes(ACHIEVEMENTS.BEGINNER.id)) {
      newAchievements.push(ACHIEVEMENTS.BEGINNER);
    }

    // Mnemonic achievement
    if (!stats.achievements.includes(ACHIEVEMENTS.MNEMONIC_MASTER.id) && 
        (stats.mnemonicPhrases || 0) >= ACHIEVEMENTS.MNEMONIC_MASTER.requirement) {
      newAchievements.push(ACHIEVEMENTS.MNEMONIC_MASTER);
    }

    // Strong password achievement
    if (!stats.achievements.includes(ACHIEVEMENTS.STRONG_MASTER.id) && 
        (stats.strongPasswords || 0) >= ACHIEVEMENTS.STRONG_MASTER.requirement) {
      newAchievements.push(ACHIEVEMENTS.STRONG_MASTER);
    }

    // Speed achievement
    if (!stats.achievements.includes(ACHIEVEMENTS.SPEED_MASTER.id) && 
        (stats.maxBatchSize || 0) >= ACHIEVEMENTS.SPEED_MASTER.requirement) {
      newAchievements.push(ACHIEVEMENTS.SPEED_MASTER);
    }

    // Sage achievement - tüm modları kullanma
    if (!stats.achievements.includes(ACHIEVEMENTS.PASSWORD_SAGE.id) && 
        stats.usedModes && 
        stats.usedModes.friendly && 
        stats.usedModes.strong && 
        stats.usedModes.mnemonic) {
      newAchievements.push(ACHIEVEMENTS.PASSWORD_SAGE);
    }

    // Achievement'ları kaydet
    newAchievements.forEach(achievement => {
      if (!stats.achievements.includes(achievement.id)) {
        stats.achievements.push(achievement.id);
      }
    });

    return newAchievements;
  }

  getNewAchievements() {
    return this.checkAchievements();
  }

  getAllAchievements() {
    return Object.values(ACHIEVEMENTS).map(achievement => ({
      ...achievement,
      unlocked: this.stats.achievements.includes(achievement.id)
    }));
  }
}

export const gameSystem = new GameSystem();
export { ACHIEVEMENTS, LEVEL_THRESHOLDS };
