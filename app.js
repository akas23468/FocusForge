document.addEventListener('DOMContentLoaded', () => {
    // --- Global Configuration and Constants ---
    const APP_ID = 'FOCUS_FORGE_V1'; // Unique ID for localStorage keys

    // Level configuration and messages
    const LEVELS = [
        { points: 3000, title: 'Krishna', message: 'You are the Master of Action! You have achieved the wisdom of Krishna.' },
        { points: 2750, title: 'Arjuna', message: 'The ultimate archer! You are Arjuna.' },
        { points: 2500, title: 'Bhishma', message: 'A vow of excellence! You stand firm like Bhishma.' },
        { points: 2250, title: 'Dronacharya', message: 'The teacher has arrived! You are Dronacharya.' },
        { points: 2000, title: 'Karna', message: 'A true warrior! Your resolve rivals Karna’s.' },
        { points: 1750, title: 'Nakul', message: 'Graceful progress! You move with the elegance of Nakul.' },
        { points: 1500, title: 'Bheema', message: 'Unstoppable! Your strength is like Bheema’s.' },
        { points: 1250, title: 'Kripacharya', message: 'Masterful! You now train with Kripacharya.' },
        { points: 1000, title: 'A.P.J. Abdul Kalam', message: 'Amazing! You have the vision of A.P.J. Abdul Kalam.' },
        { points: 750, title: 'Aryabhata', message: 'Your focus is as sharp as Aryabhata.' },
        { points: 500, title: 'Ramanujan', message: 'You’re thinking like Ramanujan!' },
        { points: 200, title: 'Chanakya', message: 'Oh — you reached 200! You are smarter like Chanakya.' },
    ].sort((a, b) => a.points - b.points); // Sort ascending by points

    const MOTIVATIONAL_QUOTES = [
        "The best way to get started is to quit talking and begin doing. - Walt Disney",
        "The journey of a thousand miles begins with a single step. - Lao Tzu",
        "The only way to do great work is to love what you do. - Steve Jobs",
        "It does not matter how slowly you go as long as you do not stop. - Confucius",
        "Our greatest weakness lies in giving up. - Thomas A. Edison"
    ];

    const SUCCESS_QUOTES = [
        "Well done! Success is the sum of small efforts, repeated day in and day out.",
        "That's how it's done! You are truly focused.",
        "Victory is sweet. Savor this success and move to the next challenge!"
    ];

    // Simple Base64 encoded WAV file for a short beep sound
    const BEEP_SOUND_BASE64 = "data:audio/wav;base64,UklGRl9vT1JXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAAABkYXRhAAH4/0k5jQAAADo0AAA+OQAAQj0AAEM+AABCQQAAPzwAAD06AAA7OQAAOjsAAEI+AABDTwAATDcAAEM9AABAPwAAQT4AAEE9AABDOAAARkAAAD05AAA7OQAAOjwAAEFCQAAW6uY=";

    // --- State Variables ---
    let state = {
        isLoggedIn: false,
        currentPage: 'dashboard',
        points: 0,
        currentLevel: 'Starter',
        tasks: {
            today: [],
            tomorrow: []
        },
        sports: [],
        notes: [],
        quotes: [],
        timerInstances: {}, // Stores setInterval IDs
    };

    // --- DOM Elements ---
    const $appContainer = document.getElementById('app-container');
    const $loginModal = document.getElementById('login-modal');
    const $authForm = document.getElementById('auth-form');
    const $loginError = document.getElementById('login-error');
    const $logoutBtn = document.getElementById('logout-btn');
    const $navItems = document.querySelectorAll('.nav-item');
    const $contentArea = document.getElementById('content-area');
    const $pageTitle = document.getElementById('page-title');
    const $pointsDisplay = document.getElementById('points-display');
    const $levelTitle = document.getElementById('level-title');
    const $progressFill = document.getElementById('progress-fill');
    const $progressBarContainer = document.querySelector('.progress-bar-container');
    const $nextLevelInfo = document.getElementById('next-level-info');
    const $universalModal = document.getElementById('universal-modal');
    const $modalHeader = document.getElementById('modal-header');
    const $modalBody = document.getElementById('modal-body');
    const $modalCloseBtn = document.getElementById('modal-close-btn');
    const $toastContainer = document.getElementById('toast-container');
    const $mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const $sidebar = document.getElementById('sidebar');

    // --- Utility Functions ---

    /**
     * Toggles the sidebar on mobile views.
     */
    const toggleSidebar = () => {
        $sidebar.classList.toggle('open');
        $mobileMenuBtn.querySelector('i').className = $sidebar.classList.contains('open') ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
    };

    /**
     * Saves the entire application state to localStorage.
     */
    const saveState = () => {
        localStorage.setItem(APP_ID, JSON.stringify({
            isLoggedIn: state.isLoggedIn,
            points: state.points,
            currentLevel: state.currentLevel,
            tasks: state.tasks,
            sports: state.sports,
            notes: state.notes,
            quotes: state.quotes
            // Timer data (remaining time/isPaused) is saved directly on the task/sport object
        }));
    };

    /**
     * Loads the application state from localStorage.
     */
    const loadState = () => {
        const savedState = localStorage.getItem(APP_ID);
        if (savedState) {
            const loaded = JSON.parse(savedState);
            state = { ...state, ...loaded };
            // Ensure timer state is properly initialized for timers to restart
            state.tasks.today.forEach(t => initTimerState(t));
            state.tasks.tomorrow.forEach(t => initTimerState(t));
            state.sports.forEach(s => initTimerState(s));
            // Start any running timers
            startAllPersistedTimers();
        } else {
            // Setup initial data if no state exists (first run)
            setupInitialData();
            // Ask for Notification permission on first run
            requestNotificationPermission();
        }
    };

    /**
     * Sets up sample data for a clean first run experience.
     */
    const setupInitialData = () => {
        const tomorrowDate = getTomorrowDateString();
        state.tasks.today = [
            { id: Date.now() + 1, name: 'Finish project documentation', scheduledTime: Date.now() + 10 * 60 * 1000, duration: 10 * 60 * 1000, date: getTodayDateString(), remainingTime: 10 * 60 * 1000, isPaused: true, isRunning: false },
            { id: Date.now() + 2, name: 'Practice 15 minutes of meditation', scheduledTime: Date.now() + 30 * 60 * 1000, duration: 30 * 60 * 1000, date: getTodayDateString(), remainingTime: 30 * 60 * 1000, isPaused: true, isRunning: false },
            { id: Date.now() + 3, name: 'Review daily goals', scheduledTime: Date.now() + 5 * 60 * 1000, duration: 5 * 60 * 1000, date: getTodayDateString(), remainingTime: 5 * 60 * 1000, isPaused: true, isRunning: false },
        ];
        state.tasks.tomorrow = [
            { id: Date.now() + 4, name: 'Schedule team meeting', scheduledTime: Date.now() + 2 * 60 * 60 * 1000, duration: 2 * 60 * 60 * 1000, date: tomorrowDate, remainingTime: 2 * 60 * 60 * 1000, isPaused: true, isRunning: false },
            { id: Date.now() + 5, name: 'Read two chapters of new book', scheduledTime: Date.now() + 1 * 60 * 60 * 1000, duration: 1 * 60 * 60 * 1000, date: tomorrowDate, remainingTime: 1 * 60 * 60 * 1000, isPaused: true, isRunning: false },
        ];
        state.sports = [
            { id: Date.now() + 6, name: 'Morning 5km Run', distance: 5, date: getTodayDateString(), duration: 30 * 60 * 1000, remainingTime: 30 * 60 * 1000, isPaused: true, isRunning: false, points: 5 },
            { id: Date.now() + 7, name: 'Evening Yoga Session', time: '18:00', date: getTodayDateString(), duration: 20 * 60 * 1000, remainingTime: 20 * 60 * 1000, isPaused: true, isRunning: false, points: 5 },
        ];
        state.notes = [
            { id: Date.now() + 8, text: 'Remember to look into new project ideas tomorrow morning.' },
            { id: Date.now() + 9, text: 'Feeling good about todays focus on high-priority tasks!' }
        ];
        state.quotes = [
            { id: Date.now() + 10, text: 'Doubt kills more dreams than failure ever will.' },
            { id: Date.now() + 11, text: 'The man who moves a mountain begins by carrying away small stones.' },
            { id: Date.now() + 12, text: 'Discipline is the bridge between goals and accomplishment.' }
        ];
        saveState();
    };


    /**
     * Checks if a timer state exists for an item and initializes defaults if not.
     * This is crucial for backward compatibility and initial setup.
     */
    const initTimerState = (item) => {
        if (item.remainingTime === undefined) {
            item.remainingTime = item.duration;
        }
        if (item.isPaused === undefined) {
            item.isPaused = true;
        }
        if (item.isRunning === undefined) {
            item.isRunning = false;
        }
    };

    /**
     * Attempts to vibrate the device (for timer completion).
     */
    const vibrate = () => {
        if ("vibrate" in navigator) {
            navigator.vibrate([200, 100, 200]);
        }
    };

    /**
     * Plays a short beep sound (for timer completion).
     */
    const playSound = () => {
        try {
            const audio = new Audio(BEEP_SOUND_BASE64);
            audio.play().catch(e => console.error("Audio playback failed:", e));
        } catch (e) {
            console.error("Error creating audio object:", e);
        }
    };

    /**
     * Requests permission for Web Notifications.
     */
    const requestNotificationPermission = () => {
        if ("Notification" in window) {
            Notification.requestPermission();
        }
    };

    /**
     * Shows a Web Notification for a completed timer.
     */
    const showNotification = (title, body) => {
        if ("Notification" in window && Notification.permission === "granted") {
            new Notification(title, { body: body, icon: '/favicon.ico' });
        } else {
            // Fallback to visual modal if permission is denied
            showUniversalModal('Timer Complete!', body);
        }
    };

    /**
     * Displays a temporary toast message.
     */
    const showToast = (message, type = 'primary') => {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        $toastContainer.prepend(toast);

        // Remove the toast after animation completes
        setTimeout(() => toast.remove(), 3000);
    };

    /**
     * Shows the universal modal for alerts and level-ups.
     */
    const showUniversalModal = (header, body) => {
        $modalHeader.textContent = header;
        $modalBody.innerHTML = body;
        $universalModal.classList.remove('hidden');
        $universalModal.setAttribute('aria-hidden', 'false');
    };

    /**
     * Closes the universal modal.
     */
    const closeModal = () => {
        $universalModal.classList.add('hidden');
        $universalModal.setAttribute('aria-hidden', 'true');
    };

    /**
     * Formats milliseconds into HH:MM:SS string.
     */
    const formatTime = (ms) => {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const pad = (num) => String(num).padStart(2, '0');

        return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    };

    /**
     * Returns today's date string (YYYY-MM-DD).
     */
    const getTodayDateString = () => new Date().toISOString().split('T')[0];

    /**
     * Returns tomorrow's date string (YYYY-MM-DD).
     */
    const getTomorrowDateString = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    };

    // --- Authentication Logic ---

    /**
     * Shows the login modal and blurs the background.
     */
    const showLoginModal = () => {
        $appContainer.classList.add('hidden');
        $appContainer.setAttribute('aria-hidden', 'true');
        $loginModal.classList.remove('hidden');
        $loginModal.setAttribute('aria-hidden', 'false');
        $loginError.textContent = '';
    };

    /**
     * Handles the client-only login process.
     */
    const handleLogin = (e) => {
        e.preventDefault();
        // In a real app, this would be an API call. Here, it's a simple local check.
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (username.length > 0 && password.length > 0) {
            state.isLoggedIn = true;
            saveState();
            $loginModal.classList.add('hidden');
            $loginModal.setAttribute('aria-hidden', 'true');
            $appContainer.classList.remove('hidden');
            $appContainer.setAttribute('aria-hidden', 'false');
            navigateTo(state.currentPage);
        } else {
            $loginError.textContent = 'Please enter a username and password.';
        }
    };

    /**
     * Handles the logout process.
     */
    const handleLogout = () => {
        state.isLoggedIn = false;
        saveState();
        // Clear all running timers before logging out
        Object.values(state.timerInstances).forEach(clearInterval);
        state.timerInstances = {};
        showLoginModal();
    };

    // --- Gamification Logic ---

    /**
     * Adds points to the user's score and checks for level-ups.
     */
    const addPoints = (amount, reason) => {
        const oldPoints = state.points;
        state.points += amount;
        if (state.points < 0) state.points = 0; // Prevent negative points
        saveState();
        checkLevelUp(oldPoints, state.points);
        updateProfileStats();
        showToast(`${amount > 0 ? '+' : ''}${amount} Points: ${reason}`, amount > 0 ? 'success' : 'danger');
    };

    /**
     * Checks if the user crossed a level threshold.
     */
    const checkLevelUp = (oldPoints, newPoints) => {
        let newLevel = state.currentLevel;

        LEVELS.forEach(level => {
            // Check if the new points crossed the threshold from below
            if (newPoints >= level.points && oldPoints < level.points) {
                newLevel = level.title;
                showLevelUpModal(level);
            }
        });

        if (newLevel !== state.currentLevel) {
            state.currentLevel = newLevel;
            saveState();
        }
    };

    /**
     * Displays a celebratory modal for reaching a new level.
     */
    const showLevelUpModal = (level) => {
        const header = `LEVEL UP! You are ${level.title}!`;
        const body = `<p class="success-message">${level.message}</p><p>You reached **${level.points}** points. Keep up the amazing work!</p>`;
        showUniversalModal(header, body);
    };

    /**
     * Updates the points, level, and progress bar in the header.
     */
    const updateProfileStats = () => {
        const currentPoints = state.points;
        const currentLevelInfo = LEVELS.slice().reverse().find(l => currentPoints >= l.points) || { points: 0, title: 'Starter' };
        const nextLevelInfo = LEVELS.find(l => currentPoints < l.points);

        state.currentLevel = currentLevelInfo.title;

        $pointsDisplay.textContent = `Points: ${currentPoints}`;
        $levelTitle.textContent = `Level: ${currentLevelInfo.title}`;

        let progressPercent = 100;
        let nextLevelGoal = 'Mastery Achieved';

        if (nextLevelInfo) {
            const nextThreshold = nextLevelInfo.points;
            const basePoints = currentLevelInfo.points;
            const range = nextThreshold - basePoints;
            const progress = currentPoints - basePoints;
            progressPercent = (progress / range) * 100;
            nextLevelGoal = `${nextThreshold} (${nextLevelInfo.title})`;
        }

        $progressFill.style.width = `${progressPercent}%`;
        $nextLevelInfo.textContent = `Next: ${nextLevelGoal}`;
        $progressBarContainer.setAttribute('aria-valuenow', Math.floor(progressPercent));
    };


    // --- Timer Logic ---

    /**
     * Persists the current timer state for an item.
     */
    const persistTimerState = (item, remaining, isPaused, isRunning) => {
        item.remainingTime = remaining;
        item.isPaused = isPaused;
        item.isRunning = isRunning;
        item.lastTickTimestamp = isRunning ? Date.now() : undefined;
        saveState();
    };

    /**
     * The core timer update function, called every second.
     */
    const updateTimerUI = (item, $timerDisplay) => {
        const now = Date.now();
        let remaining = item.remainingTime || item.duration;

        // If running, calculate how much time passed since last tick (handles page reload gap)
        if (item.isRunning && item.lastTickTimestamp) {
            const elapsed = now - item.lastTickTimestamp;
            remaining -= elapsed;
        }

        // Save last tick time for accurate next calculation
        if (item.isRunning) {
            item.lastTickTimestamp = now;
        }

        if (remaining <= 0) {
            clearInterval(state.timerInstances[item.id]);
            delete state.timerInstances[item.id];
            
            persistTimerState(item, 0, true, false); // Mark as stopped

            $timerDisplay.textContent = '00:00:00';
            $timerDisplay.closest('.task-card, .sports-entry').style.backgroundColor = 'var(--color-danger)';
            
            vibrate();
            playSound();
            
            const type = item.distance ? 'Sport Activity' : 'Task';
            showNotification('Timer Finished!', `${type} "${item.name}" is complete!`);
            showToast(`Time's up for: ${item.name}`, 'danger');
            
            // Re-render the relevant dashboard to reset controls
            if (state.currentPage === 'dashboard') renderTodayFocus();
            else if (state.currentPage === 'tomorrow') renderTomorrowPlan();
            else if (state.currentPage === 'sports') renderSports();

            return; // Exit the loop
        }

        // Update UI
        $timerDisplay.textContent = formatTime(remaining);

        // Update persistence for next tick calculation
        if (item.isRunning) {
            persistTimerState(item, remaining, false, true);
        }
    };

    /**
     * Starts, pauses, or resets a timer for a given item.
     */
    const startTimer = (item, action) => {
        const $timerDisplay = document.getElementById(`timer-display-${item.id}`);

        if (state.timerInstances[item.id]) {
            clearInterval(state.timerInstances[item.id]);
            delete state.timerInstances[item.id];
        }

        let remaining = item.remainingTime || item.duration;

        if (action === 'start') {
            item.isRunning = true;
            item.isPaused = false;
            // Set initial lastTickTimestamp to now
            item.lastTickTimestamp = Date.now();
            updateTimerUI(item, $timerDisplay); // Initial UI update
            state.timerInstances[item.id] = setInterval(() => updateTimerUI(item, $timerDisplay), 1000);
            showToast(`Timer started for ${item.name}`, 'primary');

        } else if (action === 'pause') {
            item.isRunning = false;
            item.isPaused = true;
            // Persist the current remaining time accurately
            persistTimerState(item, remaining, true, false);
            showToast(`Timer paused for ${item.name}`, 'secondary');

        } else if (action === 'reset') {
            item.isRunning = false;
            item.isPaused = true;
            item.lastTickTimestamp = undefined;
            remaining = item.duration; // Reset remaining time to full duration
            persistTimerState(item, remaining, true, false);
            $timerDisplay.textContent = formatTime(remaining);
            showToast(`Timer reset for ${item.name}`, 'danger');
            $timerDisplay.closest('.task-card, .sports-entry').style.backgroundColor = 'var(--color-surface)';
        }

        // Re-render controls to reflect state change (e.g., Start -> Pause)
        renderTaskControls(item, $timerDisplay.closest('.task-actions'));
        saveState();
    };

    /**
     * Restarts all timers that were running or paused on last save.
     */
    const startAllPersistedTimers = () => {
        [...state.tasks.today, ...state.tasks.tomorrow, ...state.sports].forEach(item => {
            // Check if the task is due
            if (item.remainingTime > 0) {
                const $timerDisplay = document.getElementById(`timer-display-${item.id}`);
                
                // If running, restart the interval loop
                if (item.isRunning && item.lastTickTimestamp) {
                    const elapsed = Date.now() - item.lastTickTimestamp;
                    item.remainingTime -= elapsed; // Compensate for time passed since last save/reload
                    
                    // Prevent negative time due to long gaps
                    if (item.remainingTime < 0) item.remainingTime = 0;

                    // Immediately start the interval again
                    startTimer(item, 'start');
                } else if (!item.isRunning && item.isPaused) {
                    // If paused, just update the UI with persisted remainingTime
                    if ($timerDisplay) {
                        $timerDisplay.textContent = formatTime(item.remainingTime);
                    }
                }
            }
        });
    };

    // --- Task Completion/Incompletion Logic ---

    /**
     * Handles the completion or incompletion of a task.
     */
    const toggleTaskCompletion = (task, isComplete) => {
        const taskList = state.tasks[task.page === 'tomorrow' ? 'tomorrow' : 'today'];
        const taskIndex = taskList.findIndex(t => t.id === task.id);
        const $taskCard = document.getElementById(`task-card-${task.id}`);

        if (taskIndex === -1 || !$taskCard) return;

        // Clear any running timers associated with the task
        if (state.timerInstances[task.id]) {
            clearInterval(state.timerInstances[task.id]);
            delete state.timerInstances[task.id];
        }

        if (isComplete) {
            // COMPLETION: +10 Points
            addPoints(10, `Completed task: ${task.name}`);
            showToast(`Task Completed! +10 Points!`, 'success');

            // Visual feedback
            const $feedback = document.createElement('span');
            $feedback.className = 'completion-feedback';
            $feedback.textContent = '🥳';
            $feedback.style.display = 'inline';
            $taskCard.querySelector('.task-info').appendChild($feedback);
            $taskCard.querySelector('.task-name').classList.add('completed');
            $taskCard.style.borderLeftColor = 'var(--color-success)';

            // Remove after a short delay
            setTimeout(() => {
                taskList.splice(taskIndex, 1);
                $taskCard.remove();
                saveState();
            }, 1500);

        } else {
            // INCOMPLETION: -5 Points and Reschedule
            const randomQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
            addPoints(-5, `Incomplete task: ${task.name}`);
            showToast(`Task Incomplete. -5 Points.`, 'danger');

            // Reschedule (add 30 minutes)
            const rescheduleTimeMs = 30 * 60 * 1000;
            const newScheduledTime = Date.now() + rescheduleTimeMs;
            const newDuration = task.duration; // Duration remains the same

            taskList[taskIndex].scheduledTime = newScheduledTime;
            taskList[taskIndex].remainingTime = newDuration; // Reset timer state
            taskList[taskIndex].isPaused = true;
            taskList[taskIndex].isRunning = false;
            
            // Visual feedback and quote
            $taskCard.style.borderLeftColor = 'var(--color-danger)';
            let $rescheduleInfo = $taskCard.querySelector('.reschedule-info');
            if (!$rescheduleInfo) {
                $rescheduleInfo = document.createElement('p');
                $rescheduleInfo.className = 'reschedule-info';
                $taskCard.appendChild($rescheduleInfo);
            }

            const newTime = new Date(newScheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            $rescheduleInfo.innerHTML = `❌ Try next time — ${randomQuote}. **Rescheduled to ${newTime}**`;

            // Reset checkbox state visually
            $taskCard.querySelector('.task-complete-btn').checked = false;

            saveState();
            renderTaskControls(task, $taskCard.querySelector('.task-actions'));
        }
    };


    // --- UI Rendering Functions (Page-Specific) ---

    /**
     * Renders the timer controls for a task or sport item.
     */
    const renderTaskControls = (item, $actionsContainer) => {
        $actionsContainer.innerHTML = ''; // Clear existing controls
        const isRunning = state.timerInstances[item.id] !== undefined;
        const isPaused = item.isPaused;
        const remainingTime = item.remainingTime || item.duration;

        // 1. Timer Display
        const $timerDisplay = document.createElement('div');
        $timerDisplay.id = `timer-display-${item.id}`;
        $timerDisplay.className = 'timer-display';
        $timerDisplay.textContent = formatTime(remainingTime);
        $actionsContainer.appendChild($timerDisplay);

        // 2. Play/Pause Button
        const $playPauseBtn = document.createElement('button');
        $playPauseBtn.className = 'btn btn-icon timer-control-btn';
        $playPauseBtn.setAttribute('aria-label', isRunning ? 'Pause timer' : 'Start timer');
        $playPauseBtn.innerHTML = `<i class="fa-solid fa-${isRunning ? 'pause' : 'play'}"></i>`;
        $playPauseBtn.onclick = () => startTimer(item, isRunning ? 'pause' : 'start');
        $actionsContainer.appendChild($playPauseBtn);

        // 3. Reset Button
        const $resetBtn = document.createElement('button');
        $resetBtn.className = 'btn btn-icon timer-control-btn';
        $resetBtn.setAttribute('aria-label', 'Reset timer');
        $resetBtn.innerHTML = '<i class="fa-solid fa-rotate-left"></i>';
        $resetBtn.onclick = () => startTimer(item, 'reset');
        $actionsContainer.appendChild($resetBtn);

        // 4. Completion Checkbox (Only for Tasks, not Sports)
        if (item.date) {
            const $checkbox = document.createElement('input');
            $checkbox.type = 'checkbox';
            $checkbox.className = 'task-complete-btn';
            $checkbox.setAttribute('aria-label', 'Mark task as completed');
            $checkbox.onchange = (e) => {
                if (e.target.checked) {
                    // Use a simple modal/prompt to ask for completion status
                    showUniversalModal(
                        'Task Status',
                        `<p>Did you **complete** "${item.name}"?</p>` +
                        `<div style="display: flex; gap: 1rem; margin-top: 1rem; justify-content: center;">` +
                            `<button id="modal-complete" class="btn btn-primary">Yes, Completed (+10)</button>` +
                            `<button id="modal-incomplete" class="btn btn-danger">No, Incomplete (-5)</button>` +
                        `</div>`
                    );

                    document.getElementById('modal-complete').onclick = () => {
                        closeModal();
                        toggleTaskCompletion(item, true);
                    };

                    document.getElementById('modal-incomplete').onclick = () => {
                        closeModal();
                        toggleTaskCompletion(item, false);
                    };
                }
            };
            $actionsContainer.appendChild($checkbox);
        }
    };

    /**
     * Renders a single task card.
     */
    const renderTaskCard = (task) => {
        const $card = document.createElement('div');
        $card.id = `task-card-${task.id}`;
        $card.className = 'task-card';

        const $info = document.createElement('div');
        $info.className = 'task-info';
        $info.innerHTML = `
            <span class="task-name">${task.name}</span>
            <span class="task-due">Due: ${task.date}</span>
        `;
        $card.appendChild($info);

        const $actions = document.createElement('div');
        $actions.className = 'task-actions';
        $card.appendChild($actions);

        // Render the timer and controls
        renderTaskControls(task, $actions);

        return $card;
    };


    // --- Dashboard: Today Focus (Main) ---
    const renderTodayFocus = () => {
        $pageTitle.textContent = 'Today Focus';
        $contentArea.innerHTML = `
            <div class="task-form-container">
                <h3>Add New Task</h3>
                <form id="today-task-form" class="task-form">
                    <div class="input-group task-name-input">
                        <label for="new-task-name">Task Name</label>
                        <input type="text" id="new-task-name" required placeholder="e.g., Complete UI integration">
                    </div>
                    <div class="controls-panel">
                        <div class="input-group">
                            <label for="task-duration">Duration (mins)</label>
                            <select id="task-duration" aria-label="Task duration preset">
                                <option value="15">15 min</option>
                                <option value="30" selected>30 min</option>
                                <option value="60">60 min</option>
                            </select>
                        </div>
                        <div class="input-group">
                            <label for="task-date">Date</label>
                            <input type="date" id="task-date" value="${getTodayDateString()}" required>
                        </div>
                        <div class="input-group add-btn-group">
                            <label>&nbsp;</label>
                            <button type="submit" class="btn btn-primary"><i class="fa-solid fa-plus"></i> Add Task</button>
                        </div>
                    </div>
                </form>
            </div>
            <div class="task-list-container">
                <h3>Your Tasks for Today</h3>
                <div id="today-task-list"></div>
            </div>
        `;

        const $form = document.getElementById('today-task-form');
        $form.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('new-task-name').value;
            const durationMinutes = parseInt(document.getElementById('task-duration').value, 10);
            const date = document.getElementById('task-date').value;

            addTask(name, durationMinutes, date, 'today');
            $form.reset(); // Clear the form
            document.getElementById('task-date').value = getTodayDateString(); // Reset date field
        });

        const $list = document.getElementById('today-task-list');
        state.tasks.today.forEach(task => {
            $list.appendChild(renderTaskCard(task));
        });
    };

    /**
     * Adds a new task to the state.
     */
    const addTask = (name, durationMinutes, date, page) => {
        const durationMs = durationMinutes * 60 * 1000;
        const newTask = {
            id: Date.now(),
            name,
            scheduledTime: Date.now(),
            duration: durationMs,
            date,
            remainingTime: durationMs,
            isPaused: true,
            isRunning: false,
            page // 'today' or 'tomorrow'
        };

        state.tasks[page].push(newTask);
        saveState();
        showToast(`New task added to ${page === 'today' ? 'Today Focus' : 'Tomorrow Plan'}!`, 'primary');

        if (page === 'today') renderTodayFocus();
        else if (page === 'tomorrow') renderTomorrowPlan();
    };


    // --- Dashboard: Tomorrow Plan ---
    const renderTomorrowPlan = () => {
        $pageTitle.textContent = 'Tomorrow Plan';
        $contentArea.innerHTML = `
            <div class="task-form-container">
                <h3>Schedule Task for Tomorrow</h3>
                <form id="tomorrow-task-form" class="task-form">
                    <div class="input-group task-name-input">
                        <label for="t-new-task-name">Task Name</label>
                        <input type="text" id="t-new-task-name" required placeholder="e.g., Prepare quarterly budget">
                    </div>
                    <div class="controls-panel">
                        <div class="input-group">
                            <label for="t-task-duration">Duration (mins)</label>
                            <select id="t-task-duration" aria-label="Task duration preset">
                                <option value="30">30 min</option>
                                <option value="60" selected>60 min</option>
                                <option value="120">120 min</option>
                            </select>
                        </div>
                        <div class="input-group">
                            <label for="t-task-date">Date</label>
                            <input type="date" id="t-task-date" value="${getTomorrowDateString()}" required>
                        </div>
                        <div class="input-group add-btn-group">
                            <label>&nbsp;</label>
                            <button type="submit" class="btn btn-primary"><i class="fa-solid fa-plus"></i> Add Task</button>
                        </div>
                    </div>
                </form>
            </div>
            <div class="task-list-container">
                <h3>Tasks for Tomorrow</h3>
                <div id="tomorrow-task-list"></div>
            </div>
        `;

        const $form = document.getElementById('tomorrow-task-form');
        $form.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('t-new-task-name').value;
            const durationMinutes = parseInt(document.getElementById('t-task-duration').value, 10);
            const date = document.getElementById('t-task-date').value;

            addTask(name, durationMinutes, date, 'tomorrow');
            $form.reset();
            document.getElementById('t-task-date').value = getTomorrowDateString();
        });

        const $list = document.getElementById('tomorrow-task-list');
        state.tasks.tomorrow.forEach(task => {
            // Task card rendering is identical, just the list location is different
            $list.appendChild(renderTaskCard(task));
        });
    };

    // --- Dashboard: Night Notes ---
    const renderNightNotes = () => {
        $pageTitle.textContent = 'Night Notes';
        $contentArea.innerHTML = `
            <div class="note-form-container">
                <h3>Add a New Note</h3>
                <form id="note-form" class="task-form" style="display: block;">
                    <div class="input-group">
                        <label for="new-note-text">Note Details</label>
                        <textarea id="new-note-text" required placeholder="Write down your thoughts, reflections, or extra-curricular notes..."></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary"><i class="fa-solid fa-plus"></i> Save Note</button>
                </form>
            </div>
            <div class="note-list-container">
                <h3>Your Saved Notes</h3>
                <div id="note-list"></div>
            </div>
        `;

        const $form = document.getElementById('note-form');
        $form.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = document.getElementById('new-note-text').value.trim();
            if (!text) return;

            state.notes.push({ id: Date.now(), text, date: new Date().toLocaleString() });
            saveState();
            showToast('Note saved!', 'success');
            renderNightNotes(); // Re-render to show new note
        });

        const $list = document.getElementById('note-list');
        state.notes.slice().reverse().forEach(note => {
            const $card = document.createElement('div');
            $card.id = `note-card-${note.id}`;
            $card.className = 'note-card';
            $card.innerHTML = `
                <p>${note.text}</p>
                <div class="note-actions">
                    <button class="btn btn-secondary btn-icon edit-note-btn" data-id="${note.id}" aria-label="Edit note"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn btn-danger btn-icon delete-note-btn" data-id="${note.id}" aria-label="Delete note"><i class="fa-solid fa-trash"></i></button>
                    <span style="font-size: 0.75rem; color: #6B7280; margin-left: auto;">${note.date}</span>
                </div>
            `;
            $list.appendChild($card);
        });

        document.querySelectorAll('.delete-note-btn').forEach(btn => {
            btn.onclick = (e) => {
                const id = parseInt(e.currentTarget.dataset.id, 10);
                state.notes = state.notes.filter(n => n.id !== id);
                saveState();
                showToast('Note deleted.', 'danger');
                renderNightNotes();
            };
        });
        
        document.querySelectorAll('.edit-note-btn').forEach(btn => {
            btn.onclick = (e) => {
                const id = parseInt(e.currentTarget.dataset.id, 10);
                const note = state.notes.find(n => n.id === id);
                if (!note) return;

                showUniversalModal(
                    'Edit Note',
                    `<textarea id="edit-note-text" style="width: 100%; min-height: 150px; margin-bottom: 1rem;">${note.text}</textarea>` +
                    `<button id="modal-save-note" class="btn btn-primary">Save Changes</button>`
                );

                document.getElementById('modal-save-note').onclick = () => {
                    const newText = document.getElementById('edit-note-text').value.trim();
                    if (newText) {
                        note.text = newText;
                        note.date = new Date().toLocaleString() + ' (Edited)';
                        saveState();
                        closeModal();
                        showToast('Note updated.', 'success');
                        renderNightNotes();
                    }
                };
            };
        });
    };

    // --- Dashboard: Sports ---
    const renderSports = () => {
        $pageTitle.textContent = 'Sports (Running & Activities)';
        $contentArea.innerHTML = `
            <div class="task-form-container">
                <h3>Add Activity</h3>
                <form id="sports-form" class="task-form">
                    <div class="input-group task-name-input">
                        <label for="new-activity-name">Activity Name</label>
                        <input type="text" id="new-activity-name" required placeholder="e.g., Morning 5km Run">
                    </div>
                    <div class="controls-panel">
                        <div class="input-group">
                            <label for="activity-duration">Target Duration (mins)</label>
                            <input type="number" id="activity-duration" value="30" min="1" required>
                        </div>
                        <div class="input-group">
                            <label for="activity-distance">Distance (optional, km)</label>
                            <input type="number" id="activity-distance" value="0" min="0" step="0.1">
                        </div>
                        <div class="input-group">
                            <label for="activity-date">Date</label>
                            <input type="date" id="activity-date" value="${getTodayDateString()}" required>
                        </div>
                        <div class="input-group add-btn-group">
                            <label>&nbsp;</label>
                            <button type="submit" class="btn btn-primary"><i class="fa-solid fa-plus"></i> Add Activity</button>
                        </div>
                    </div>
                </form>
            </div>
            <div class="task-list-container">
                <h3>Your Activities</h3>
                <div id="sports-list"></div>
            </div>
        `;

        const $form = document.getElementById('sports-form');
        $form.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('new-activity-name').value;
            const durationMinutes = parseInt(document.getElementById('activity-duration').value, 10);
            const distance = parseFloat(document.getElementById('activity-distance').value);
            const date = document.getElementById('activity-date').value;

            const durationMs = durationMinutes * 60 * 1000;
            const newActivity = {
                id: Date.now(),
                name,
                distance,
                date,
                duration: durationMs,
                remainingTime: durationMs,
                isPaused: true,
                isRunning: false,
                points: 5 // Default points for sports activity
            };

            state.sports.push(newActivity);
            saveState();
            showToast(`Activity "${name}" added!`, 'primary');
            renderSports();
        });

        const $list = document.getElementById('sports-list');
        state.sports.forEach(activity => {
            const $card = document.createElement('div');
            $card.id = `sports-card-${activity.id}`;
            $card.className = 'sports-entry task-card';
            $card.innerHTML = `
                <div class="task-info">
                    <span class="task-name">${activity.name}</span>
                    <span class="task-due">${activity.distance > 0 ? activity.distance + 'km | ' : ''} ${activity.date}</span>
                    <span class="reschedule-info" style="margin-left: var(--space-sm); color: var(--color-secondary); font-style: normal;">Points: +${activity.points}</span>
                </div>
                <div class="task-actions">
                    <!-- Timer controls will be rendered here -->
                </div>
                <button class="btn btn-danger btn-icon delete-activity-btn" data-id="${activity.id}" aria-label="Delete activity" style="margin-left: var(--space-sm);"><i class="fa-solid fa-trash"></i></button>
            `;
            $list.appendChild($card);

            // Render timer controls
            renderTaskControls(activity, $card.querySelector('.task-actions'));
        });

        document.querySelectorAll('.delete-activity-btn').forEach(btn => {
            btn.onclick = (e) => {
                const id = parseInt(e.currentTarget.dataset.id, 10);
                const index = state.sports.findIndex(s => s.id === id);
                if (index !== -1) {
                    // Clear timer if running
                    if (state.timerInstances[id]) clearInterval(state.timerInstances[id]);
                    delete state.timerInstances[id];
                    state.sports.splice(index, 1);
                    saveState();
                    showToast('Activity deleted.', 'danger');
                    renderSports();
                }
            };
        });
    };

    // --- Dashboard: Quotes ---
    const renderQuotes = () => {
        $pageTitle.textContent = 'Motivational Quotes';
        $contentArea.innerHTML = `
            <div class="task-form-container">
                <h3>Add Custom Quote</h3>
                <form id="quote-form" class="task-form" style="display: block;">
                    <div class="input-group">
                        <label for="new-quote-text">Quote Text</label>
                        <textarea id="new-quote-text" required placeholder="Enter the quote text"></textarea>
                    </div>
                    <div class="input-group">
                        <label for="new-quote-author">Author (optional)</label>
                        <input type="text" id="new-quote-author" placeholder="e.g., Confucius">
                    </div>
                    <button type="submit" class="btn btn-primary"><i class="fa-solid fa-plus"></i> Add Quote</button>
                </form>
            </div>
            <div class="quote-list-container">
                <h3>Your Collection</h3>
                <div id="quote-list"></div>
            </div>
        `;

        const $form = document.getElementById('quote-form');
        $form.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = document.getElementById('new-quote-text').value.trim();
            const author = document.getElementById('new-quote-author').value.trim() || 'Unknown';
            if (!text) return;

            state.quotes.push({ id: Date.now(), text, author });
            saveState();
            showToast('Quote added!', 'success');
            renderQuotes();
        });

        const $list = document.getElementById('quote-list');
        state.quotes.slice().reverse().forEach(quote => {
            const $card = document.createElement('div');
            $card.id = `quote-card-${quote.id}`;
            $card.className = 'quote-card';
            $card.innerHTML = `
                <p>"${quote.text}"</p>
                <cite style="display: block; text-align: right; font-size: 0.9rem; color: #6B7280;">— ${quote.author}</cite>
                <div class="quote-actions">
                    <button class="btn btn-danger btn-icon delete-quote-btn" data-id="${quote.id}" aria-label="Delete quote"><i class="fa-solid fa-trash"></i></button>
                </div>
            `;
            $list.appendChild($card);
        });

        document.querySelectorAll('.delete-quote-btn').forEach(btn => {
            btn.onclick = (e) => {
                const id = parseInt(e.currentTarget.dataset.id, 10);
                state.quotes = state.quotes.filter(q => q.id !== id);
                saveState();
                showToast('Quote deleted.', 'danger');
                renderQuotes();
            };
        });
    };

    // --- Dashboard: Profile/Stats ---
    const renderProfileStats = () => {
        $pageTitle.textContent = 'Profile & Stats';

        // Calculate total tasks completed (simple estimate since we delete completed ones)
        const totalTasks = state.tasks.today.length + state.tasks.tomorrow.length + state.sports.length + 5; // A small base number for "completed"
        const levelData = LEVELS.slice().reverse().find(l => state.points >= l.points) || { title: 'Starter', points: 0 };
        const nextLevelData = LEVELS.find(l => state.points < l.points) || { title: 'None', points: state.points };


        $contentArea.innerHTML = `
            <h2>Overall Status</h2>
            <p>Welcome back, **${localStorage.getItem(APP_ID + '_user') || 'User'}**! Keep up the great work.</p>
            
            <div class="stats-grid" style="margin-top: var(--space-md);">
                <div class="stat-card">
                    <div class="value">${state.points}</div>
                    <div class="label">Total Points Earned</div>
                </div>
                <div class="stat-card">
                    <div class="value">${levelData.title}</div>
                    <div class="label">Current Master Title</div>
                </div>
                <div class="stat-card">
                    <div class="value">${nextLevelData.points - state.points}</div>
                    <div class="label">Points to Next Level (${nextLevelData.title})</div>
                </div>
                <div class="stat-card">
                    <div class="value">${state.tasks.today.length}</div>
                    <div class="label">Pending Today Tasks</div>
                </div>
            </div>

            <h2 style="margin-top: var(--space-xl);">Development Tools</h2>
            <div class="task-form-container">
                <form id="point-adjustment-form" class="task-form" style="display: block; max-width: 400px;">
                    <div class="input-group">
                        <label for="point-amount">Adjust Points (Testing)</label>
                        <input type="number" id="point-amount" placeholder="e.g., 50 or -100" required>
                    </div>
                    <button type="submit" class="btn btn-secondary">Apply Point Change</button>
                </form>
            </div>
        `;

        // Event listener for point adjustment
        document.getElementById('point-adjustment-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const amount = parseInt(document.getElementById('point-amount').value, 10);
            if (!isNaN(amount) && amount !== 0) {
                addPoints(amount, `Manual adjustment of ${amount}`);
                renderProfileStats(); // Re-render page to show new stats
            }
        });
    };


    // --- Core Application Flow ---

    /**
     * Maps page keys to rendering functions.
     */
    const pageRenderers = {
        'dashboard': renderTodayFocus,
        'tomorrow': renderTomorrowPlan,
        'notes': renderNightNotes,
        'sports': renderSports,
        'quotes': renderQuotes,
        'profile': renderProfileStats
    };

    /**
     * Changes the view to a new page/dashboard.
     */
    const navigateTo = (page) => {
        if (!state.isLoggedIn || !pageRenderers[page]) {
            return;
        }

        // Close mobile sidebar on navigation
        if ($sidebar.classList.contains('open')) {
            toggleSidebar();
        }

        state.currentPage = page;
        saveState();

        // Update active navigation item
        $navItems.forEach(item => {
            const isCurrent = item.dataset.page === page;
            item.setAttribute('aria-current', isCurrent ? 'page' : 'false');
            item.classList.toggle('nav-item-active', isCurrent);
        });

        // Render the new page content
        pageRenderers[page]();
    };

    /**
     * Initialization function.
     */
    const init = () => {
        // 1. Load state and check authentication status
        loadState();

        if (state.isLoggedIn) {
            $appContainer.classList.remove('hidden');
            $loginModal.classList.add('hidden');
            updateProfileStats();
            navigateTo(state.currentPage);
        } else {
            showLoginModal();
        }

        // 2. Attach Global Event Listeners
        $authForm.addEventListener('submit', handleLogin);
        $logoutBtn.addEventListener('click', handleLogout);
        $modalCloseBtn.addEventListener('click', closeModal);
        $mobileMenuBtn.addEventListener('click', toggleSidebar);

        $navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const page = e.currentTarget.dataset.page;
                navigateTo(page);
            });
        });

        // 3. Setup window resize listener for responsiveness (optional, mostly handled by CSS)
        window.addEventListener('resize', () => {
            // Re-render only necessary components if the window size affects layout logic
        });
    };

    // Start the application
    init();
});
