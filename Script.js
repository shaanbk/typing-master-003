document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-link');
    const typingInput = document.getElementById('typing-input');
    const sampleText = document.getElementById('sample-text');
    const virtualKeyboard = document.getElementById('virtual-keyboard');
    
    // Initialize app state
    let currentTest = {
        active: false,
        startTime: null,
        timer: null,
        errors: 0,
        totalTyped: 0,
        text: ''
    };

    // Initialize keyboard
    initKeyboard();
    loadSettings();
    updateLeaderboard();

    // Navigation handling
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.dataset.section;
            setActiveSection(sectionId);
        });
    });

    // Start test button
    document.getElementById('startTest').addEventListener('click', () => {
        setActiveSection('typing-test');
        initializeTest();
    });

    // Typing input handler
    typingInput.addEventListener('input', handleTyping);
    
    // Settings handlers
    document.getElementById('dark-mode').addEventListener('change', toggleDarkMode);
    document.getElementById('difficulty').addEventListener('change', saveSettings);
    document.getElementById('duration').addEventListener('change', saveSettings);

    function setActiveSection(sectionId) {
        sections.forEach(section => section.classList.remove('active'));
        document.getElementById(sectionId).classList.add('active');
    }

    function initializeTest() {
        const username = prompt('Enter your name:');
        if (!username) return;

        currentTest = {
            active: true,
            startTime: Date.now(),
            timer: parseInt(document.getElementById('duration').value),
            errors: 0,
            totalTyped: 0,
            text: generateSampleText(),
            username: username
        };

        sampleText.innerHTML = currentTest.text.split('').map(char => 
            `<span>${char}</span>`
        ).join('');
        
        typingInput.disabled = false;
        typingInput.focus();
        startTimer();
    }

    function generateSampleText() {
        const difficulty = document.getElementById('difficulty').value;
        const texts = {
            easy: ["The quick brown fox jumps...", "Practice makes perfect!"],
            medium: ["JavaScript: The Good Parts", "Responsive web design"],
            hard: ["C++ STL containers: vector, map, set", "Linux kernel development"]
        };
        return texts[difficulty][Math.floor(Math.random() * texts[difficulty].length)];
    }

    function startTimer() {
        const timerDisplay = document.getElementById('timer');
        const timerId = setInterval(() => {
            currentTest.timer--;
            timerDisplay.textContent = currentTest.timer;
            
            if (currentTest.timer <= 0) {
                clearInterval(timerId);
                endTest();
            }
        }, 1000);
    }

    function endTest() {
        currentTest.active = false;
        typingInput.disabled = true;
        saveScore();
        updateLeaderboard();
    }

    function handleTyping(e) {
        if (!currentTest.active) return;
        
        const input = e.target.value;
        currentTest.totalTyped = input.length;
        
        // Update text highlighting
        sampleText.querySelectorAll('span').forEach((charSpan, index) => {
            const char = input[index];
            if (!char) {
                charSpan.classList.remove('correct', 'error');
            } else if (char === charSpan.innerText) {
                charSpan.classList.add('correct');
                charSpan.classList.remove('error');
            } else {
                charSpan.classList.add('error');
                charSpan.classList.remove('correct');
                currentTest.errors++;
            }
        });

        // Update stats
        const timeElapsed = (Date.now() - currentTest.startTime) / 1000 / 60;
        const wpm = Math.round((currentTest.totalTyped / 5) / timeElapsed);
        const accuracy = ((currentTest.totalTyped - currentTest.errors) / currentTest.totalTyped * 100).toFixed(1);
        
        document.getElementById('wpm').textContent = wpm;
        document.getElementById('accuracy').textContent = accuracy;
    }

    function initKeyboard() {
        const keyboardLayout = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
        virtualKeyboard.innerHTML = keyboardLayout.map(row => `
            <div class="key-row">${row.split('').map(key => `
                <div class="key" data-key="${key}">${key}</div>
            `).join('')}</div>
        `).join('');
    }

    function saveScore() {
        const scores = JSON.parse(localStorage.getItem('scores') || []);
        scores.push({
            name: currentTest.username,
            wpm: document.getElementById('wpm').textContent,
            accuracy: document.getElementById('accuracy').textContent,
            date: new Date().toISOString()
        });
        localStorage.setItem('scores', JSON.stringify(scores));
    }

    function updateLeaderboard() {
        const scores = JSON.parse(localStorage.getItem('scores') || []);
        const tbody = document.querySelector('#leaderboard-table tbody');
        tbody.innerHTML = scores
            .sort((a, b) => b.wpm - a.wpm)
            .slice(0, 10)
            .map((score, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td>${score.name}</td>
                    <td>${score.wpm}</td>
                    <td>${score.accuracy}%</td>
                </tr>
            `).join('');
    }

    function toggleDarkMode(e) {
        document.body.classList.toggle('dark-mode', e.target.checked);
        localStorage.setItem('darkMode', e.target.checked);
    }

    function loadSettings() {
        const darkMode = localStorage.getItem('darkMode') === 'true';
        document.body.classList.toggle('dark-mode', darkMode);
        document.getElementById('dark-mode').checked = darkMode;
        
        document.getElementById('difficulty').value = 
            localStorage.getItem('difficulty') || 'easy';
        document.getElementById('duration').value = 
            localStorage.getItem('duration') || '60';
    }

    function saveSettings() {
        localStorage.setItem('difficulty', document.getElementById('difficulty').value);
        localStorage.setItem('duration', document.getElementById('duration').value);
    }
});