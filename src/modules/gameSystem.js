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
  COLLECTOR: {
    id: 'collector',
    title: 'Password Collector',
    description: 'Save 50 passwords',
    icon: '💾',
    requirement: 50
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
    const { strength, mode, isSaved } = passwordData;
    
    this.stats.totalPasswords++;
    if (strength === 'Weak') this.stats.weakPasswords++;
    if (strength === 'Strong' || strength === 'Very Strong') this.stats.strongPasswords++;
    if (mode === 'mnemonic') this.stats.mnemonicPhrases++;
    if (isSaved) this.stats.savedPasswords++;

    const newLevel = this.calculateLevel(this.stats.totalPasswords);
    const levelUp = newLevel > this.stats.highestLevel;
    this.stats.highestLevel = Math.max(this.stats.highestLevel, newLevel);

    this.checkAchievements();
    this.saveStats();

    return {
      currentLevel: newLevel,
      levelUp,
      nextThreshold: this.getNextLevelThreshold(newLevel),
      newAchievements: this.getNewAchievements()
    };
  }

  checkAchievements() {
    const { stats } = this;
    const newAchievements = [];

    if (!stats.achievements.includes(ACHIEVEMENTS.BEGINNER.id) && stats.totalPasswords >= 1) {
      newAchievements.push(ACHIEVEMENTS.BEGINNER);
    }

    if (!stats.achievements.includes(ACHIEVEMENTS.WEAK_MASTER.id) && stats.weakPasswords >= ACHIEVEMENTS.WEAK_MASTER.requirement) {
      newAchievements.push(ACHIEVEMENTS.WEAK_MASTER);
    }

    // ... diğer başarılar için kontroller

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
