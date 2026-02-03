import React, { useState, useEffect } from 'react';
import './ProgressTracker.css';

const ProgressTracker = () => {
  const [progressData, setProgressData] = useState({
    completedModules: 0,
    totalModules: 12,
    completedLessons: 0,
    totalLessons: 48,
    timeSpent: 0, // in minutes
    currentStreak: 3,
    weeklyGoal: 5,
    completedGoals: 2
  });

  const [modules, setModules] = useState([
    { id: 1, title: 'ROS 2 Foundations', progress: 100, category: 'foundations', lastAccessed: '2024-01-15', timeSpent: 240 },
    { id: 2, title: 'Gazebo Simulation', progress: 75, category: 'simulation', lastAccessed: '2024-01-18', timeSpent: 180 },
    { id: 3, title: 'Vision-Language-Action Systems', progress: 40, category: 'vla', lastAccessed: '2024-01-20', timeSpent: 120 },
    { id: 4, title: 'Hardware Integration', progress: 0, category: 'hardware', lastAccessed: null, timeSpent: 0 },
    { id: 5, title: 'AI Control Systems', progress: 20, category: 'ai', lastAccessed: '2024-01-22', timeSpent: 60 },
    { id: 6, title: 'Humanoid Design Principles', progress: 0, category: 'design', lastAccessed: null, timeSpent: 0 },
  ]);

  const [activeTab, setActiveTab] = useState('overview');

  // Simulate updating time spent
  useEffect(() => {
    const interval = setInterval(() => {
      setProgressData(prev => ({
        ...prev,
        timeSpent: prev.timeSpent + 1
      }));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const getCategoryColor = (category) => {
    const colors = {
      foundations: '#3b82f6',
      simulation: '#10b981',
      vla: '#8b5cf6',
      hardware: '#f59e0b',
      ai: '#ef4444',
      design: '#ec4899'
    };
    return colors[category] || '#6b7280';
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 75) return '#22c55e';
    if (percentage >= 50) return '#f59e0b';
    if (percentage >= 25) return '#f59e0b';
    return '#ef4444';
  };

  const calculateOverallProgress = () => {
    const totalProgress = modules.reduce((sum, module) => sum + module.progress, 0);
    return Math.round(totalProgress / modules.length);
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="progress-tracker">
      <div className="tracker-header">
        <h2>📊 Learning Progress Dashboard</h2>
        <p>Track your journey through the Physical AI & Humanoid Robotics Academy</p>
      </div>

      {/* Navigation Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab ${activeTab === 'modules' ? 'active' : ''}`}
          onClick={() => setActiveTab('modules')}
        >
          Modules
        </button>
        <button
          className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="overview-section">
          {/* Progress Summary Cards */}
          <div className="summary-cards">
            <div className="card">
              <div className="card-icon">📚</div>
              <div className="card-content">
                <h3>{progressData.completedModules}/{progressData.totalModules}</h3>
                <p>Modules Completed</p>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${(progressData.completedModules / progressData.totalModules) * 100}%`,
                    backgroundColor: '#3b82f6'
                  }}
                ></div>
              </div>
            </div>

            <div className="card">
              <div className="card-icon">🎯</div>
              <div className="card-content">
                <h3>{calculateOverallProgress()}%</h3>
                <p>Overall Progress</p>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${calculateOverallProgress()}%`,
                    backgroundColor: getProgressColor(calculateOverallProgress())
                  }}
                ></div>
              </div>
            </div>

            <div className="card">
              <div className="card-icon">⏱️</div>
              <div className="card-content">
                <h3>{formatTime(progressData.timeSpent)}</h3>
                <p>Total Time Spent</p>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${Math.min((progressData.timeSpent / 1000) * 100, 100)}%`,
                    backgroundColor: '#10b981'
                  }}
                ></div>
              </div>
            </div>

            <div className="card">
              <div className="card-icon">🔥</div>
              <div className="card-content">
                <h3>{progressData.currentStreak}</h3>
                <p>Day Streak</p>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${Math.min(progressData.currentStreak * 10, 100)}%`,
                    backgroundColor: '#f59e0b'
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Weekly Goals */}
          <div className="weekly-goals">
            <h3>Weekly Learning Goals</h3>
            <div className="goal-progress">
              <div className="goal-item">
                <span>Complete {progressData.completedGoals}/{progressData.weeklyGoal} modules this week</span>
                <div className="goal-bar">
                  <div
                    className="goal-fill"
                    style={{
                      width: `${(progressData.completedGoals / progressData.weeklyGoal) * 100}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="recent-activity">
            <h3>Recent Activity</h3>
            <div className="activity-list">
              {modules
                .filter(module => module.lastAccessed)
                .sort((a, b) => new Date(b.lastAccessed) - new Date(a.lastAccessed))
                .slice(0, 3)
                .map(module => (
                  <div key={module.id} className="activity-item">
                    <div className="activity-icon">📖</div>
                    <div className="activity-details">
                      <h4>{module.title}</h4>
                      <p>Spent {formatTime(module.timeSpent)} studying • {module.lastAccessed}</p>
                    </div>
                    <div
                      className="mini-progress"
                      style={{ borderColor: getCategoryColor(module.category) }}
                    >
                      <div
                        className="mini-progress-fill"
                        style={{
                          width: `${module.progress}%`,
                          backgroundColor: getCategoryColor(module.category)
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'modules' && (
        <div className="modules-section">
          <div className="modules-grid">
            {modules.map(module => (
              <div key={module.id} className="module-progress-card">
                <div className="module-header">
                  <h3>{module.title}</h3>
                  <span
                    className="module-category"
                    style={{ backgroundColor: getCategoryColor(module.category) }}
                  >
                    {module.category.charAt(0).toUpperCase() + module.category.slice(1)}
                  </span>
                </div>

                <div className="module-progress">
                  <div className="progress-info">
                    <span>Progress: {module.progress}%</span>
                    <span>Time: {formatTime(module.timeSpent)}</span>
                  </div>
                  <div className="progress-bar-large">
                    <div
                      className="progress-fill-large"
                      style={{
                        width: `${module.progress}%`,
                        backgroundColor: getProgressColor(module.progress)
                      }}
                    ></div>
                  </div>
                </div>

                <div className="module-stats">
                  <div className="stat">
                    <span className="stat-value">{module.progress}%</span>
                    <span className="stat-label">Complete</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{formatTime(module.timeSpent)}</span>
                    <span className="stat-label">Time</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{module.lastAccessed || 'Not started'}</span>
                    <span className="stat-label">Last</span>
                  </div>
                </div>

                <button className="continue-btn">
                  {module.progress === 0 ? 'Start' : module.progress === 100 ? 'Review' : 'Continue'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="analytics-section">
          <h3>Learning Analytics</h3>

          <div className="analytics-charts">
            <div className="chart-container">
              <h4>Progress by Category</h4>
              <div className="category-breakdown">
                {['foundations', 'simulation', 'vla', 'hardware', 'ai', 'design'].map(category => {
                  const categoryModules = modules.filter(m => m.category === category);
                  const avgProgress = categoryModules.length > 0
                    ? Math.round(categoryModules.reduce((sum, m) => sum + m.progress, 0) / categoryModules.length)
                    : 0;

                  return (
                    <div key={category} className="category-item">
                      <span className="category-name">{category.charAt(0).toUpperCase() + category.slice(1)}</span>
                      <div className="category-progress">
                        <div
                          className="category-progress-fill"
                          style={{
                            width: `${avgProgress}%`,
                            backgroundColor: getCategoryColor(category)
                          }}
                        ></div>
                      </div>
                      <span className="category-percentage">{avgProgress}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="chart-container">
              <h4>Daily Activity</h4>
              <div className="daily-chart">
                {[60, 45, 90, 30, 75, 120, 40].map((minutes, index) => (
                  <div key={index} className="day-bar">
                    <div
                      className="bar-fill"
                      style={{ height: `${(minutes / 120) * 100}%` }}
                    ></div>
                    <span className="day-label">{['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressTracker;