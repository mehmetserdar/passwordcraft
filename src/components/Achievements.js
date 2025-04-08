import React from 'react';
import { gameSystem } from '../modules/gameSystem';

export const Achievements = () => {
  const achievements = gameSystem.getAllAchievements();

  return (
    <div className="achievements-panel">
      <h3 style={{ 
        fontFamily: "'Press Start 2P', monospace",
        color: '#a855f7',
        fontSize: '1rem',
        marginBottom: '1rem'
      }}>
        🏆 Achievements
      </h3>
      <div className="row g-2">
        {achievements.map((achievement) => (
          <div key={achievement.id} className="col-md-6">
            <div 
              className={`achievement-card p-3 rounded ${achievement.unlocked ? 'bg-success bg-opacity-25' : 'bg-dark bg-opacity-75'}`}
              style={{
                border: achievement.unlocked ? '1px solid rgba(40, 167, 69, 0.5)' : 'none',
                boxShadow: achievement.unlocked ? '0 0 10px rgba(40, 167, 69, 0.2)' : 'none'
              }}
            >
              <div className="d-flex align-items-center">
                <span className="achievement-icon me-3" style={{ fontSize: '1.5rem' }}>{achievement.icon}</span>
                <div>
                  <h6 className="mb-1" style={{ 
                    fontSize: '0.8rem',
                    color: achievement.unlocked ? '#98FB98' : '#6c757d'
                  }}>
                    {achievement.title}
                  </h6>
                  <small style={{ 
                    fontSize: '0.7rem',
                    color: achievement.unlocked ? '#E0FFFF' : '#9CA3AF'
                  }}>
                    {achievement.description}
                  </small>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
