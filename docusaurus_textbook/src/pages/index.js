import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";
import clsx from 'clsx';

import styles from './index.module.css';

export default function Home() {
  return (
    <Layout
      title="Physical AI & Humanoid Robotics Academy"
      description="Master the cutting-edge world of AI-powered robotics, humanoid systems, and embodied intelligence with comprehensive, hands-on learning."
    >
      {/* HERO SECTION */}
      <header className={clsx('hero hero--primary gradient-bg-accent interactive-element', styles.heroBanner)}>
        <div className="container">
          <div className={styles.heroContent}>
            <div className={styles.heroText}>
              <h1 className={clsx('hero__title fade-in slide-up', styles.heroTitle)}>
                Welcome to the Future of Robotics Education
              </h1>
              <p className={clsx('hero__subtitle fade-in slide-up', styles.heroSubtitle)}>
                Transform your understanding of AI-powered robotics with our comprehensive curriculum covering humanoid systems,
                embodied intelligence, ROS 2, VLA architectures, and cutting-edge robotic technologies.
              </p>
              <div className={clsx(styles.heroButtons, 'fade-in')}>
                <Link
                  className="button button--secondary button--lg button--pulse"
                  to="/docs/introduction/intro"
                >
                  🚀 Start Learning Today
                </Link>
                <Link
                  className="button button--outline button--lg"
                  to="/docs/ros2-foundations/module-1-ros2"
                >
                  💻 Jump to ROS 2
                </Link>
              </div>
            </div>
            <div className={clsx(styles.heroVisual, 'parallax-element')}>
              <div className={clsx(styles.heroImage, 'card--hover-grow')}>
                <svg viewBox="0 0 400 300" style={{width: '100%', height: 'auto'}} fill="none">
                  <rect x="50" y="50" width="300" height="200" rx="20" fill="rgba(255,255,255,0.1)" />
                  <circle cx="200" cy="150" r="60" stroke="white" strokeWidth="2" fill="none" />
                  <rect x="180" y="120" width="40" height="60" fill="rgba(255,255,255,0.3)" />
                  <circle cx="190" cy="110" r="8" fill="white" />
                  <circle cx="210" cy="110" r="8" fill="white" />
                  <rect x="170" y="180" width="20" height="30" fill="rgba(255,255,255,0.4)" />
                  <rect x="210" y="180" width="20" height="30" fill="rgba(255,255,255,0.4)" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* FEATURES SECTION */}
      <section className={clsx(styles.featuresSection, 'fade-in')}>
        <div className="container">
          <div className={clsx(styles.sectionHeader, 'slide-up')}>
            <h2>Why Choose Our Robotics Academy?</h2>
            <p>Designed for the modern engineer who wants to lead the next wave of innovation in robotics and AI.</p>
          </div>

          <div className={styles.featuresGrid}>
            <div className={clsx('card card--animated card--hover-grow', styles.featureCard)}>
              <div className={styles.featureIcon}>🤖</div>
              <h3>Industry-Ready Curriculum</h3>
              <p>Learn the same technologies used by leading companies like Boston Dynamics, Tesla, and Figure AI in their cutting-edge humanoid robots.</p>
            </div>

            <div className={clsx('card card--animated card--hover-grow', styles.featureCard)}>
              <div className={styles.featureIcon}>💻</div>
              <h3>Hands-On Projects</h3>
              <p>Build real-world applications with ROS 2, Gazebo simulations, and VLA systems through guided, practical exercises.</p>
            </div>

            <div className={clsx('card card--animated card--hover-grow', styles.featureCard)}>
              <div className={styles.featureIcon}>🧠</div>
              <h3>Future-Forward Approach</h3>
              <p>Master Vision-Language-Action models, digital twins, and embodied AI that define tomorrow's robotics landscape.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CURRICULUM SECTION */}
      <section className={clsx(styles.curriculumSection, 'fade-in')}>
        <div className="container">
          <div className={clsx(styles.sectionHeader, 'slide-up')}>
            <h2>Complete Learning Pathway</h2>
            <p>Progress from fundamentals to advanced concepts with structured modules designed for rapid skill acquisition.</p>
          </div>

          <div className={styles.curriculumTimeline}>
            <div className={clsx('card card--animated card--hover-grow', styles.moduleCard)}>
              <div className={styles.moduleNumber}>1</div>
              <div className={styles.moduleContent}>
                <h3>ROS 2 Foundations</h3>
                <p>Master the Robot Operating System 2 - the backbone of modern robotics development. Build nodes, topics, services, and real robot workflows.</p>
                <div className={styles.moduleSkills}>
                  <span className={clsx(styles.skillTag, 'highlight--custom')}>ROS 2</span>
                  <span className={clsx(styles.skillTag, 'highlight--custom')}>Nodes & Topics</span>
                  <span className={clsx(styles.skillTag, 'highlight--custom')}>Real-time Systems</span>
                </div>
                <Link className={styles.moduleLink} to="/docs/ros2-foundations/module-1-ros2">
                  Start Module →
                </Link>
              </div>
            </div>

            <div className={clsx('card card--animated card--hover-grow', styles.moduleCard)}>
              <div className={styles.moduleNumber}>2</div>
              <div className={styles.moduleContent}>
                <h3>Simulation & Digital Twins</h3>
                <p>Develop expertise in Gazebo, Isaac Sim, and Unity Robotics for safe robot development and testing environments.</p>
                <div className={styles.moduleSkills}>
                  <span className={clsx(styles.skillTag, 'highlight--custom')}>Gazebo</span>
                  <span className={clsx(styles.skillTag, 'highlight--custom')}>Isaac Sim</span>
                  <span className={clsx(styles.skillTag, 'highlight--custom')}>Unity</span>
                </div>
                <Link className={styles.moduleLink} to="/docs/simulation/module-2-simulation">
                  Start Module →
                </Link>
              </div>
            </div>

            <div className={clsx('card card--animated card--hover-grow', styles.moduleCard)}>
              <div className={styles.moduleNumber}>3</div>
              <div className={styles.moduleContent}>
                <h3>Hardware Integration</h3>
                <p>Understand motors, actuators, sensors, and embedded systems essential for building functional robots and humanoid platforms.</p>
                <div className={styles.moduleSkills}>
                  <span className={clsx(styles.skillTag, 'highlight--custom')}>Actuators</span>
                  <span className={clsx(styles.skillTag, 'highlight--custom')}>Sensors</span>
                  <span className={clsx(styles.skillTag, 'highlight--custom')}>Embedded Systems</span>
                </div>
                <Link className={styles.moduleLink} to="/docs/hardware-basics/module-3-hardware">
                  Start Module →
                </Link>
              </div>
            </div>

            <div className={clsx('card card--animated card--hover-grow', styles.moduleCard)}>
              <div className={styles.moduleNumber}>4</div>
              <div className={styles.moduleContent}>
                <h3>Vision-Language-Action Systems</h3>
                <p>Explore the cutting-edge intersection of perception, language models, and robotic action planning.</p>
                <div className={styles.moduleSkills}>
                  <span className={clsx(styles.skillTag, 'highlight--custom')}>VLA Models</span>
                  <span className={clsx(styles.skillTag, 'highlight--custom')}>Perception</span>
                  <span className={clsx(styles.skillTag, 'highlight--custom')}>Action Planning</span>
                </div>
                <Link className={styles.moduleLink} to="/docs/vla-systems/module-4-vla-foundations">
                  Start Module →
                </Link>
              </div>
            </div>

            <div className={clsx('card card--animated card--hover-grow', styles.moduleCard)}>
              <div className={styles.moduleNumber}>5</div>
              <div className={styles.moduleContent}>
                <h3>Advanced AI Control</h3>
                <p>Dive deep into reinforcement learning, motion planning, and intelligent control algorithms for sophisticated robot behavior.</p>
                <div className={styles.moduleSkills}>
                  <span className={clsx(styles.skillTag, 'highlight--custom')}>RL</span>
                  <span className={clsx(styles.skillTag, 'highlight--custom')}>MPC</span>
                  <span className={clsx(styles.skillTag, 'highlight--custom')}>Trajectory Optimization</span>
                </div>
                <Link className={styles.moduleLink} to="/docs/advanced-ai-control/module-5-advanced-ai">
                  Start Module →
                </Link>
              </div>
            </div>

            <div className={clsx('card card--animated card--hover-grow', styles.moduleCard)}>
              <div className={styles.moduleNumber}>6</div>
              <div className={styles.moduleContent}>
                <h3>Humanoid Design Principles</h3>
                <p>Design and conceptualize humanoid robots with emphasis on mechanics, kinematics, and AI-driven locomotion.</p>
                <div className={styles.moduleSkills}>
                  <span className={clsx(styles.skillTag, 'highlight--custom')}>Kinematics</span>
                  <span className={clsx(styles.skillTag, 'highlight--custom')}>Mechanical Design</span>
                  <span className={clsx(styles.skillTag, 'highlight--custom')}>Locomotion</span>
                </div>
                <Link className={styles.moduleLink} to="/docs/humanoid-design/module-6-humanoid-design">
                  Start Module →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HARDWARE SECTION */}
      <section className={clsx(styles.hardwareSection, 'fade-in')}>
        <div className="container">
          <div className={clsx(styles.sectionHeader, 'slide-up')}>
            <h2>Hardware Platforms & Tools</h2>
            <p>Work with industry-standard platforms and tools that power real robotics development.</p>
          </div>

          <div className={styles.hardwareGrid}>
            <div className={clsx('card card--animated card--hover-grow', styles.hardwareTier)}>
              <h3>Simulation Platforms</h3>
              <ul>
                <li className="fade-in">• Gazebo Garden - Physics simulation and visualization</li>
                <li className="fade-in">• Isaac Sim - NVIDIA's robotics simulation ecosystem</li>
                <li className="fade-in">• Unity Robotics - Game engine for robotics development</li>
                <li className="fade-in">• Webots - Open-source robotics simulator</li>
              </ul>
            </div>

            <div className={clsx('card card--animated card--hover-grow', styles.hardwareTier)}>
              <h3>Development Frameworks</h3>
              <ul>
                <li className="fade-in">• ROS 2 Humble Hawksbill - Latest LTS release</li>
                <li className="fade-in">• MoveIt 2 - Motion planning framework</li>
                <li className="fade-in">• Navigation 2 - Autonomous navigation stack</li>
                <li className="fade-in">• Perception - Computer vision and sensor processing</li>
              </ul>
            </div>

            <div className={clsx('card card--animated card--hover-grow', styles.hardwareTier)}>
              <h3>AI & ML Libraries</h3>
              <ul>
                <li className="fade-in">• PyTorch - Deep learning for robotics</li>
                <li className="fade-in">• TensorFlow - Machine learning framework</li>
                <li className="fade-in">• Stable Baselines3 - Reinforcement learning</li>
                <li className="fade-in">• OpenCV - Computer vision library</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* OUTCOMES SECTION */}
      <section className={clsx(styles.outcomesSection, 'fade-in')}>
        <div className="container">
          <div className={clsx(styles.sectionHeader, 'slide-up')}>
            <h2>What You'll Achieve</h2>
            <p>Transform your career and technical skills with industry-relevant robotics expertise.</p>
          </div>

          <div className={styles.outcomesGrid}>
            <div className={clsx(styles.outcomeColumn, 'card--animated')}>
              <h3>Technical Skills</h3>
              <ul>
                <li className="fade-in">Proficiency in ROS 2 and modern robotics frameworks</li>
                <li className="fade-in">Experience with VLA systems and embodied AI</li>
                <li className="fade-in">Simulation and digital twin development</li>
                <li className="fade-in">Robot kinematics and motion planning</li>
                <li className="fade-in">Computer vision and sensor integration</li>
              </ul>
            </div>

            <div className={clsx(styles.outcomeColumn, 'card--animated')}>
              <h3>Career Opportunities</h3>
              <ul>
                <li className="fade-in">Robotics Engineer at leading tech companies</li>
                <li className="fade-in">AI Specialist for autonomous systems</li>
                <li className="fade-in">Research Scientist in embodied intelligence</li>
                <li className="fade-in">Simulation Engineer for robotics</li>
                <li className="fade-in">Entrepreneur in robotics startups</li>
              </ul>
            </div>

            <div className={clsx(styles.outcomeColumn, 'card--animated')}>
              <h3>Project Portfolio</h3>
              <ul>
                <li className="fade-in">Complete humanoid robot simulation</li>
                <li className="fade-in">VLA system for robot manipulation</li>
                <li className="fade-in">Autonomous navigation project</li>
                <li className="fade-in">Computer vision application</li>
                <li className="fade-in">Reinforcement learning robot task</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CAPSTONE SECTION */}
      <section className={clsx(styles.capstoneSection, 'gradient-bg-primary fade-in')}>
        <div className="container">
          <div className={clsx(styles.capstoneContent, 'slide-up')}>
            <div className={styles.capstoneText}>
              <h2>Capstone Project: Build Your Own Humanoid</h2>
              <p>Combine all your learning in a comprehensive capstone project where you'll design, simulate, and program your own humanoid robot system.</p>

              <ul>
                <li className="fade-in">Design robot kinematics and mechanical structure</li>
                <li className="fade-in">Implement VLA system for perception and action</li>
                <li className="fade-in">Create autonomous navigation and interaction behaviors</li>
                <li className="fade-in">Deploy and test in simulation and/or hardware</li>
              </ul>

              <Link
                className="button button--secondary button--lg button--pulse"
                to="/docs/introduction/intro"
              >
                Explore Curriculum →
              </Link>
            </div>
            <div className={clsx(styles.capstoneVisual, 'parallax-element')}>
              <div className={clsx(styles.capstoneImage, 'card--hover-grow')}>
                <svg viewBox="0 0 300 200" style={{width: '100%', height: 'auto'}} fill="none">
                  <rect x="100" y="50" width="100" height="100" rx="10" fill="white" fillOpacity="0.2" />
                  <circle cx="150" cy="70" r="15" fill="white" fillOpacity="0.3" />
                  <rect x="135" y="90" width="30" height="50" fill="white" fillOpacity="0.3" />
                  <rect x="120" y="140" width="15" height="40" fill="white" fillOpacity="0.2" />
                  <rect x="165" y="140" width="15" height="40" fill="white" fillOpacity="0.2" />
                  <rect x="140" y="45" width="20" height="10" fill="white" fillOpacity="0.4" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className={clsx(styles.ctaSection, 'fade-in')}>
        <div className="container">
          <div className={clsx(styles.ctaContent, 'slide-up')}>
            <h2>Start Your Robotics Journey Today</h2>
            <p>Join thousands of engineers transforming their careers with cutting-edge robotics education.</p>

            <div className={clsx(styles.ctaButtons, 'fade-in')}>
              <Link
                className="button button--secondary button--lg button--pulse"
                to="/docs/introduction/intro"
              >
                Begin Learning →
              </Link>
              <Link
                className="button button--outline button--lg"
                to="/docs/introduction/intro"
              >
                Curriculum Overview
              </Link>
            </div>

            <div className={styles.ctaStats}>
              <div className={clsx(styles.stat, 'fade-in')}>
                <strong>100+</strong>
                <span>Hours of Content</span>
              </div>
              <div className={clsx(styles.stat, 'fade-in')}>
                <strong>6</strong>
                <span>Core Modules</span>
              </div>
              <div className={clsx(styles.stat, 'fade-in')}>
                <strong>20+</strong>
                <span>Projects</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}