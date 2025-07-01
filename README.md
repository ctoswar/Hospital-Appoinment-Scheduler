<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HealthPortal - Healthcare Management System</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        :root {
            --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            --success-gradient: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            --warning-gradient: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
            --secondary-gradient: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
            --dark-bg: #0a0a0a;
            --card-bg: rgba(255, 255, 255, 0.1);
            --text-primary: #ffffff;
            --text-secondary: #b0b0b0;
            --accent-color: #667eea;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background: var(--dark-bg);
            color: var(--text-primary);
            line-height: 1.6;
            overflow-x: hidden;
        }

        /* Animated Background */
        body::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: 
                radial-gradient(circle at 20% 50%, rgba(102, 126, 234, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(250, 112, 154, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 40% 80%, rgba(79, 172, 254, 0.1) 0%, transparent 50%);
            z-index: -1;
            animation: backgroundShift 20s ease-in-out infinite;
        }

        @keyframes backgroundShift {
            0%, 100% { transform: translateX(0) translateY(0); }
            25% { transform: translateX(-20px) translateY(-20px); }
            50% { transform: translateX(20px) translateY(-10px); }
            75% { transform: translateX(-10px) translateY(20px); }
        }

        /* Header Section */
        .header {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            position: relative;
            background: var(--primary-gradient);
            clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%);
        }

        .hero-content {
            max-width: 800px;
            padding: 2rem;
            animation: fadeInUp 1s ease-out;
        }

        .logo-animation {
            width: 120px;
            height: 120px;
            margin: 0 auto 2rem;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(10px);
            animation: pulse 2s ease-in-out infinite;
        }

        .hero-title {
            font-size: 4rem;
            font-weight: 800;
            margin-bottom: 1rem;
            background: linear-gradient(45deg, #ffffff, #f0f0f0);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: slideInLeft 1s ease-out 0.3s both;
        }

        .hero-subtitle {
            font-size: 1.5rem;
            color: rgba(255, 255, 255, 0.9);
            margin-bottom: 2rem;
            animation: slideInRight 1s ease-out 0.6s both;
        }

        .cta-button {
            background: rgba(255, 255, 255, 0.2);
            border: 2px solid rgba(255, 255, 255, 0.3);
            color: white;
            padding: 1rem 2rem;
            border-radius: 50px;
            font-size: 1.1rem;
            cursor: pointer;
            backdrop-filter: blur(10px);
            transition: all 0.3s ease;
            animation: fadeInUp 1s ease-out 0.9s both;
        }

        .cta-button:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(255, 255, 255, 0.2);
        }

        /* Navigation */
        .nav {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            display: flex;
            gap: 1rem;
        }

        .nav-item {
            background: var(--card-bg);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 25px;
            padding: 0.5rem 1rem;
            color: var(--text-primary);
            text-decoration: none;
            transition: all 0.3s ease;
            font-size: 0.9rem;
        }

        .nav-item:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: translateY(-2px);
        }

        /* Container */
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem;
        }

        /* Section Styles */
        .section {
            padding: 5rem 0;
            opacity: 0;
            transform: translateY(50px);
            animation: scrollReveal 0.8s ease-out forwards;
        }

        .section-title {
            font-size: 3rem;
            font-weight: 700;
            text-align: center;
            margin-bottom: 3rem;
            background: var(--primary-gradient);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        /* Feature Cards */
        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 2rem;
            margin-bottom: 4rem;
        }

        .feature-card {
            background: var(--card-bg);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            padding: 2rem;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }

        .feature-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: var(--primary-gradient);
            transform: scaleX(0);
            transition: transform 0.3s ease;
        }

        .feature-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 20px 40px rgba(102, 126, 234, 0.2);
        }

        .feature-card:hover::before {
            transform: scaleX(1);
        }

        .feature-icon {
            width: 60px;
            height: 60px;
            border-radius: 15px;
            background: var(--success-gradient);
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 1.5rem;
            animation: bounce 2s ease-in-out infinite;
        }

        .feature-title {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 1rem;
            color: var(--text-primary);
        }

        .feature-description {
            color: var(--text-secondary);
            line-height: 1.7;
        }

        /* Tech Stack */
        .tech-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 1.5rem;
            margin-top: 3rem;
        }

        .tech-item {
            background: var(--card-bg);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            padding: 1.5rem;
            text-align: center;
            transition: all 0.3s ease;
            cursor: pointer;
        }

        .tech-item:hover {
            transform: scale(1.05);
            background: rgba(102, 126, 234, 0.2);
        }

        .tech-icon {
            font-size: 2rem;
            margin-bottom: 0.5rem;
        }

        /* Code Blocks */
        .code-block {
            background: rgba(0, 0, 0, 0.5);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            padding: 2rem;
            margin: 2rem 0;
            position: relative;
            overflow-x: auto;
        }

        .code-block::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 1px;
            background: var(--primary-gradient);
        }

        .code-block pre {
            color: #e2e8f0;
            font-family: 'Fira Code', monospace;
            line-height: 1.6;
        }

        /* Installation Steps */
        .install-steps {
            counter-reset: step-counter;
        }

        .install-step {
            background: var(--card-bg);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            padding: 2rem;
            margin-bottom: 2rem;
            position: relative;
            counter-increment: step-counter;
        }

        .install-step::before {
            content: counter(step-counter);
            position: absolute;
            left: -15px;
            top: 20px;
            width: 40px;
            height: 40px;
            background: var(--primary-gradient);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: white;
        }

        .install-step h3 {
            margin-left: 2rem;
            margin-bottom: 1rem;
            color: var(--text-primary);
        }

        .install-step p {
            margin-left: 2rem;
            color: var(--text-secondary);
        }

        /* Animated Icons */
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }

        @keyframes bounce {
            0%, 20%, 53%, 80%, 100% { transform: translateY(0); }
            40%, 43% { transform: translateY(-10px); }
            70% { transform: translateY(-5px); }
            90% { transform: translateY(-2px); }
        }

        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes slideInLeft {
            from {
                opacity: 0;
                transform: translateX(-50px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }

        @keyframes slideInRight {
            from {
                opacity: 0;
                transform: translateX(50px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }

        @keyframes scrollReveal {
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
            .hero-title {
                font-size: 2.5rem;
            }
            
            .hero-subtitle {
                font-size: 1.2rem;
            }
            
            .features-grid {
                grid-template-columns: 1fr;
            }
            
            .nav {
                position: relative;
                top: auto;
                right: auto;
                justify-content: center;
                margin-bottom: 2rem;
            }
        }

        /* Progress Bar */
        .progress-bar {
            position: fixed;
            top: 0;
            left: 0;
            width: 0%;
            height: 4px;
            background: var(--primary-gradient);
            z-index: 1001;
            transition: width 0.3s ease;
        }

        /* Scroll to Top Button */
        .scroll-top {
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 50px;
            height: 50px;
            background: var(--primary-gradient);
            border: none;
            border-radius: 50%;
            color: white;
            cursor: pointer;
            opacity: 0;
            transition: all 0.3s ease;
            z-index: 1000;
        }

        .scroll-top.visible {
            opacity: 1;
            transform: translateY(0);
        }

        .scroll-top:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
        }
    </style>
</head>
<body>
    <div class="progress-bar" id="progressBar"></div>
    
    <nav class="nav">
        <a href="#features" class="nav-item">Features</a>
        <a href="#tech" class="nav-item">Tech Stack</a>
        <a href="#installation" class="nav-item">Installation</a>
        <a href="#api" class="nav-item">API</a>
    </nav>

    <header class="header">
        <div class="hero-content">
            <div class="logo-animation">
                <div style="font-size: 3rem;">🏥</div>
            </div>
            <h1 class="hero-title">HealthPortal</h1>
            <p class="hero-subtitle">Revolutionary Healthcare Management System</p>
            <button class="cta-button" onclick="scrollToSection('features')">
                Explore Features ✨
            </button>
        </div>
    </header>

    <main class="container">
        <section id="features" class="section">
            <h2 class="section-title">🚀 Amazing Features</h2>
            <div class="features-grid">
                <div class="feature-card">
                    <div class="feature-icon">👥</div>
                    <h3 class="feature-title">Patient Portal</h3>
                    <p class="feature-description">
                        Comprehensive dashboard with appointment management, doctor discovery, 
                        medical records access, and real-time updates via Socket.IO integration.
                    </p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">⚕️</div>
                    <h3 class="feature-title">Doctor Portal</h3>
                    <p class="feature-description">
                        Professional interface for healthcare providers to manage patient appointments, 
                        access medical records, and streamline clinical workflows.
                    </p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">🔐</div>
                    <h3 class="feature-title">Secure Authentication</h3>
                    <p class="feature-description">
                        JWT token-based authentication system with role-based access control, 
                        ensuring data security and privacy compliance.
                    </p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">📱</div>
                    <h3 class="feature-title">Responsive Design</h3>
                    <p class="feature-description">
                        Mobile-first approach with modern UI/UX, smooth animations, 
                        and seamless experience across all devices and screen sizes.
                    </p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">⚡</div>
                    <h3 class="feature-title">Real-time Updates</h3>
                    <p class="feature-description">
                        Live notifications and data synchronization using Socket.IO, 
                        keeping all users informed of appointment changes instantly.
                    </p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">🔍</div>
                    <h3 class="feature-title">Advanced Search</h3>
                    <p class="feature-description">
                        Powerful search and filtering capabilities for appointments, doctors, 
                        and medical records with intelligent matching algorithms.
                    </p>
                </div>
            </div>
        </section>

        <section id="tech" class="section">
            <h2 class="section-title">🛠️ Technology Stack</h2>
            <div class="tech-grid">
                <div class="tech-item">
                    <div class="tech-icon">⚛️</div>
                    <h4>React 18+</h4>
                </div>
                <div class="tech-item">
                    <div class="tech-icon">🎨</div>
                    <h4>CSS3</h4>
                </div>
                <div class="tech-item">
                    <div class="tech-icon">🔌</div>
                    <h4>Socket.IO</h4>
                </div>
                <div class="tech-item">
                    <div class="tech-icon">🔑</div>
                    <h4>JWT Auth</h4>
                </div>
                <div class="tech-item">
                    <div class="tech-icon">📡</div>
                    <h4>Fetch API</h4>
                </div>
                <div class="tech-item">
                    <div class="tech-icon">🎯</div>
                    <h4>Lucide Icons</h4>
                </div>
            </div>
        </section>

        <section id="installation" class="section">
            <h2 class="section-title">📦 Installation Guide</h2>
            <div class="install-steps">
                <div class="install-step">
                    <h3>Clone Repository</h3>
                    <p>Get the source code from your repository</p>
                    <div class="code-block">
                        <pre>git clone &lt;repository-url&gt;
cd healthportal</pre>
                    </div>
                </div>
                
                <div class="install-step">
                    <h3>Install Dependencies</h3>
                    <p>Install all required packages and dependencies</p>
                    <div class="code-block">
                        <pre>npm install
# or
yarn install</pre>
                    </div>
                </div>
                
                <div class="install-step">
                    <h3>Environment Setup</h3>
                    <p>Create your environment configuration file</p>
                    <div class="code-block">
                        <pre># .env file
REACT_APP_API_URL=http://localhost:5000</pre>
                    </div>
                </div>
                
                <div class="install-step">
                    <h3>Start Development</h3>
                    <p>Launch the development server</p>
                    <div class="code-block">
                        <pre>npm start
# or
yarn start</pre>
                    </div>
                </div>
            </div>
        </section>

        <section id="api" class="section">
            <h2 class="section-title">📋 API Requirements</h2>
            <div class="features-grid">
                <div class="feature-card">
                    <div class="feature-icon">🔐</div>
                    <h3 class="feature-title">Authentication</h3>
                    <div class="code-block">
                        <pre>POST /auth/login
POST /auth/register
GET  /auth/verify</pre>
                    </div>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">📅</div>
                    <h3 class="feature-title">Appointments</h3>
                    <div class="code-block">
                        <pre>GET    /api/appointments
POST   /api/appointments
PUT    /api/appointments/:id
DELETE /api/appointments/:id</pre>
                    </div>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">👨‍⚕️</div>
                    <h3 class="feature-title">Doctors & Patients</h3>
                    <div class="code-block">
                        <pre>GET /api/doctors
GET /api/patients</pre>
                    </div>
                </div>
            </div>
        </section>

        <section class="section">
            <h2 class="section-title">🔮 Future Enhancements</h2>
            <div class="features-grid">
                <div class="feature-card">
                    <div class="feature-icon">📱</div>
                    <h3 class="feature-title">Mobile App</h3>
                    <p class="feature-description">React Native version for iOS and Android platforms</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">🔔</div>
                    <h3 class="feature-title">Push Notifications</h3>
                    <p class="feature-description">Real-time push notifications for appointments and updates</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">🎥</div>
                    <h3 class="feature-title">Video Consultations</h3>
                    <p class="feature-description">Integrated video calling for remote consultations</p>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">📊</div>
                    <h3 class="feature-title">Analytics Dashboard</h3>
                    <p class="feature-description">Advanced reporting and analytics for healthcare insights</p>
                </div>
            </div>
        </section>
    </main>

    <button class="scroll-top" id="scrollTopBtn" onclick="scrollToTop()">
        ↑
    </button>

    <script>
        // Progress bar
        window.addEventListener('scroll', () => {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            document.getElementById('progressBar').style.width = scrolled + '%';
        });

        // Scroll to top button
        window.addEventListener('scroll', () => {
            const scrollTopBtn = document.getElementById('scrollTopBtn');
            if (window.pageYOffset > 300) {
                scrollTopBtn.classList.add('visible');
            } else {
                scrollTopBtn.classList.remove('visible');
            }
        });

        // Smooth scroll functions
        function scrollToSection(sectionId) {
            document.getElementById(sectionId).scrollIntoView({
                behavior: 'smooth'
            });
        }

        function scrollToTop() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }

        // Intersection Observer for animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animationDelay = Math.random() * 0.5 + 's';
                    entry.target.classList.add('animate');
                }
            });
        }, observerOptions);

        // Observe all sections
        document.querySelectorAll('.section').forEach(section => {
            observer.observe(section);
        });

        // Add stagger animation to feature cards
        document.querySelectorAll('.feature-card').forEach((card, index) => {
            card.style.animationDelay = (index * 0.1) + 's';
            card.style.animation = 'fadeInUp 0.8s ease-out forwards';
        });

        // Tech items hover effect
        document.querySelectorAll('.tech-item').forEach(item => {
            item.addEventListener('mouseenter', () => {
                item.style.transform = 'scale(1.05) rotate(2deg)';
            });
            
            item.addEventListener('mouseleave', () => {
                item.style.transform = 'scale(1) rotate(0deg)';
            });
        });

        // Add typing effect to code blocks
        function typeWriter(element, text, speed = 50) {
            let i = 0;
            element.innerHTML = '';
            function typing() {
                if (i < text.length) {
                    element.innerHTML += text.charAt(i);
                    i++;
                    setTimeout(typing, speed);
                }
            }
            typing();
        }

        // Initialize typing effects when code blocks come into view
        const codeObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const pre = entry.target.querySelector('pre');
                    if (pre && !pre.classList.contains('typed')) {
                        const originalText = pre.textContent;
                        typeWriter(pre, originalText, 30);
                        pre.classList.add('typed');
                    }
                }
            });
        });

        document.querySelectorAll('.code-block').forEach(block => {
            codeObserver.observe(block);
        });
    </script>
</body>
</html>