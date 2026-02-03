import React, { useState, useEffect } from 'react';
import './ModuleSearchPanel.css';

const ModuleSearchPanel = ({ modules = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredModules, setFilteredModules] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  // Mock data for demonstration - this would come from props or API
  const mockModules = [
    { id: 1, title: 'ROS 2 Foundations', category: 'foundations', description: 'Learn the fundamentals of Robot Operating System 2', difficulty: 'Beginner', duration: '4 hours' },
    { id: 2, title: 'Gazebo Simulation', category: 'simulation', description: 'Physics-based simulation for robotics development', difficulty: 'Intermediate', duration: '6 hours' },
    { id: 3, title: 'Vision-Language-Action Systems', category: 'vla', description: 'Multimodal AI for robotic perception and control', difficulty: 'Advanced', duration: '8 hours' },
    { id: 4, title: 'Hardware Integration', category: 'hardware', description: 'Connecting sensors, actuators, and embedded systems', difficulty: 'Intermediate', duration: '5 hours' },
    { id: 5, title: 'AI Control Systems', category: 'ai', description: 'Reinforcement learning and control theory for robots', difficulty: 'Advanced', duration: '7 hours' },
    { id: 6, title: 'Humanoid Design Principles', category: 'design', description: 'Biomechanics and kinematics for humanoid robots', difficulty: 'Advanced', duration: '9 hours' },
    { id: 7, title: 'Unity Robotics Simulation', category: 'simulation', description: 'Using Unity for advanced robotics simulation', difficulty: 'Intermediate', duration: '5 hours' },
    { id: 8, title: 'Embedded AI Systems', category: 'ai', description: 'Deploying AI models on edge devices', difficulty: 'Advanced', duration: '6 hours' },
  ];

  const categories = [
    { id: 'all', name: 'All Modules' },
    { id: 'foundations', name: 'Foundations' },
    { id: 'simulation', name: 'Simulation' },
    { id: 'vla', name: 'VLA Systems' },
    { id: 'hardware', name: 'Hardware' },
    { id: 'ai', name: 'AI Control' },
    { id: 'design', name: 'Design' }
  ];

  useEffect(() => {
    setIsLoading(true);

    // Simulate API call delay
    const timer = setTimeout(() => {
      let results = searchTerm
        ? mockModules.filter(module =>
            module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            module.description.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : mockModules;

      if (selectedCategory !== 'all') {
        results = results.filter(module => module.category === selectedCategory);
      }

      setFilteredModules(results);
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory]);

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'Beginner': return '#22c55e'; // green-500
      case 'Intermediate': return '#f59e0b'; // amber-500
      case 'Advanced': return '#ef4444'; // red-500
      default: return '#6b7280'; // gray-500
    }
  };

  return (
    <div className="module-search-panel">
      <div className="search-header">
        <h2>📚 Module Library</h2>
        <p>Search and explore all available modules in the Physical AI & Humanoid Robotics Academy</p>
      </div>

      <div className="search-controls">
        <div className="search-input-container">
          <input
            type="text"
            placeholder="Search modules by title, description, or keyword..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>

        <div className="category-filter">
          <span className="filter-label">Filter by Category:</span>
          <div className="category-buttons">
            {categories.map(category => (
              <button
                key={category.id}
                className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => handleCategoryChange(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="search-results">
        {isLoading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Searching modules...</p>
          </div>
        ) : (
          <>
            <div className="results-summary">
              <span>{filteredModules.length} module{filteredModules.length !== 1 ? 's' : ''} found</span>
            </div>

            {filteredModules.length > 0 ? (
              <div className="modules-grid">
                {filteredModules.map(module => (
                  <div key={module.id} className="module-card">
                    <div className="module-header">
                      <h3>{module.title}</h3>
                      <span
                        className="difficulty-badge"
                        style={{ backgroundColor: getDifficultyColor(module.difficulty) }}
                      >
                        {module.difficulty}
                      </span>
                    </div>
                    <p className="module-description">{module.description}</p>
                    <div className="module-meta">
                      <span className="duration">⏱️ {module.duration}</span>
                      <span className="category">🏷️ {categories.find(cat => cat.id === module.category)?.name}</span>
                    </div>
                    <button className="explore-btn">
                      Explore Module →
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-results">
                <div className="no-results-icon">📚</div>
                <h3>No modules found</h3>
                <p>Try adjusting your search terms or category filter to find what you're looking for.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ModuleSearchPanel;