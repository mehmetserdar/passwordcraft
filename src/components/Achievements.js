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
            <div className={`achievement-card p-2 rounded ${achievement.unlocked ? 'bg-success bg-opacity-25' : 'bg-dark bg-opacity-50'}`}>
              <div className="d-flex align-items-center">
                <span className="achievement-icon me-2">{achievement.icon}</span>
                <div>
                  <h6 className="mb-0" style={{ fontSize: '0.8rem' }}>{achievement.title}</h6>
                  <small className="text-muted" style={{ fontSize: '0.6rem' }}>{achievement.description}</small>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
