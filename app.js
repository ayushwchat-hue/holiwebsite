// --- Database Simulation ---
let db = JSON.parse(localStorage.getItem('HoliApp_2026')) || { users: {} };
// Clear all users on page load (for fresh start)
// Uncomment line below to reset on every load, comment out after first use
// db = { users: {} };
let currentUserID = null;
let currentUserName = null;
let gameRunning = false;

async function saveUserToServer(user) {
    try {
        await fetch('api/save_user.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: user.id,
                name: user.name,
                score: user.score,
                createdAt: user.createdAt
            })
        });
    } catch (error) {
        console.warn('MySQL sync skipped (save_user):', error);
    }
}

async function savePhotoToServer(id, photo) {
    try {
        await fetch('api/save_photo.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, photo })
        });
    } catch (error) {
        console.warn('MySQL sync skipped (save_photo):', error);
    }
}

// 1. User Registration/Login
function registerUser() {
    const userID = document.getElementById('userid-input').value.trim();
    const userName = document.getElementById('username-input').value.trim();
    const errorEl = document.getElementById('error-msg');

    // Validation
    if (!userID || !userName) {
        errorEl.innerText = "Please enter both ID and Name!";
        return;
    }
    
    if (userID < 1 || userID > 9999) {
        errorEl.innerText = "ID must be between 1 and 9999!";
        return;
    }
    
    const id = parseInt(userID);
    
    // Check if credentials already exist
    if (db.users[id] && db.users[id].name !== userName) {
        errorEl.innerText = "This ID already exists with different name!";
        return;
    }
    
    // Login or Register
    currentUserID = id;
    currentUserName = userName;
    
    if (!db.users[id]) {
        // New user registration
        db.users[id] = { id: id, name: userName, score: 0, photo: null, createdAt: new Date().toISOString(), sessions: [] };
    }
    
    // Log session
    db.users[id].sessions = db.users[id].sessions || [];
    db.users[id].sessions.push({ loginTime: new Date().toISOString() });
    
    saveDB();
    localStorage.setItem('CurrentUserID', id);
    saveUserToServer(db.users[id]);
    
    // Clear input and error message
    document.getElementById('userid-input').value = '';
    document.getElementById('username-input').value = '';
    errorEl.innerText = '';
    
    // Update UI and hide welcome screen
    updateProfileDisplay();
    
    // Use setTimeout to ensure DOM update is registered
    setTimeout(() => {
        const welcomeScreen = document.getElementById('welcome-screen');
        const mainApp = document.getElementById('main-app');
        
        if (welcomeScreen) {
            welcomeScreen.classList.add('hidden');
        }
        if (mainApp) {
            mainApp.classList.remove('hidden');
        }
        
        updateLeaderboard();
    }, 100);
}

function updateProfileDisplay() {
    document.getElementById('display-id').innerText = currentUserID;
    document.getElementById('display-name').innerText = currentUserName;
}

function logoutUser() {
    if (!currentUserID) return;
    
    // Log session end
    if (db.users[currentUserID] && db.users[currentUserID].sessions.length > 0) {
        db.users[currentUserID].sessions[db.users[currentUserID].sessions.length - 1].logoutTime = new Date().toISOString();
    }
    
    saveDB();
    
    // Clear session data
    currentUserID = null;
    currentUserName = null;
    localStorage.removeItem('CurrentUserID');
    
    // Reset UI
    document.getElementById('welcome-screen').classList.remove('hidden');
    document.getElementById('main-app').classList.add('hidden');
    document.getElementById('userid-input').value = '';
    document.getElementById('username-input').value = '';
    document.getElementById('error-msg').innerText = '';
    
    alert("Logged out successfully!");
}

// 2. Photo Upload & Preview
document.getElementById('image-upload').addEventListener('change', function(e) {
    const reader = new FileReader();
    reader.onload = function(event) {
        const preview = document.getElementById('preview-box');
        const imgElement = document.createElement('img');
        imgElement.src = event.target.result;
        imgElement.style.animation = 'slideUp 0.5s ease-out';
        
        // Clear previous image
        preview.innerHTML = '';
        preview.appendChild(imgElement);
        
        // Function to trigger photo animation and burst balloons
        function triggerPhotoAnimation() {
            if (!imgElement.classList.contains('photo-clicked')) {
                imgElement.classList.add('photo-clicked');
                
                // Play sound effect (reuse pop sound for feedback)
                const sound = document.getElementById('pop-sound');
                sound.currentTime = 0;
                sound.play();
                
                // Remove animation class after it finishes
                setTimeout(() => {
                    imgElement.classList.remove('photo-clicked');
                }, 800);

                confetti({
                    particleCount: 90,
                    spread: 80,
                    origin: { y: 0.55 },
                    colors: ['#ff1493', '#ffd700', '#00bfff', '#32cd32', '#9370db', '#ff6347']
                });
                
                // Automatically start the balloon burst game when photo is clicked
                setTimeout(() => {
                    startBalloonWave();
                }, 300);
            }
        }
        
        // Add click animation to photo (mouse)
        imgElement.addEventListener('click', triggerPhotoAnimation);
        
        // Add touch animation for mobile devices
        imgElement.addEventListener('touchstart', (e) => {
            e.preventDefault();
            triggerPhotoAnimation();
        });
        
        document.getElementById('save-btn').classList.remove('hidden');
        db.users[currentUserID].photo = event.target.result;
        saveDB();
        savePhotoToServer(currentUserID, event.target.result);
    }
    reader.readAsDataURL(e.target.files[0]);
});

function finalizePhoto() {
    if (!db.users[currentUserID] || !db.users[currentUserID].photo) {
        alert("Please upload a photo first!");
        return;
    }
    const photo = db.users[currentUserID].photo;
    document.getElementById('display-photo').src = photo;
    document.getElementById('display-photo').classList.remove('hidden');
    document.getElementById('share-link-area').classList.remove('hidden');
    document.getElementById('link-text').innerText = `holi.fun/${currentUserID}`;
    saveDB();
    savePhotoToServer(currentUserID, photo);
    alert("Photo saved! Now share the link or start the game.");
}

// 3. Balloon Burst Game
function startBalloonWave() {
    if (gameRunning) {
        return;
    }
    gameRunning = true;
    const layer = document.getElementById('balloon-layer');
    layer.innerHTML = '';
    const colors = ['#ff1493', '#ffd700', '#00bfff', '#32cd32', '#9370db', '#ff6347', '#00ff7f', '#ff8c00', '#87ceeb', '#ff69b4'];

    let waveInterval = setInterval(() => {
        const b = document.createElement('div');
        b.className = 'balloon';
        b.style.left = Math.random() * 85 + '%';
        b.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        // Function to handle balloon pop
        function handleBalloonPop(e) {
            if (!b.classList.contains('popping')) {
                b.classList.add('popping');
                if (e) e.stopPropagation();
                popBalloon(b);
            }
        }
        
        // Smooth hover effect
        b.addEventListener('mouseenter', function() {
            if (!this.classList.contains('popping')) {
                this.style.transform = 'scale(1.15)';
                this.style.filter = 'brightness(1.3) drop-shadow(0 0 10px rgba(255,255,255,0.8))';
            }
        });
        
        b.addEventListener('mouseleave', function() {
            if (!this.classList.contains('popping')) {
                this.style.transform = 'scale(1)';
                this.style.filter = 'brightness(1)';
            }
        });
        
        // Click handler for mouse
        b.addEventListener('click', handleBalloonPop);
        
        // Touch handler for mobile
        b.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleBalloonPop();
        });
        
        layer.appendChild(b);
        setTimeout(() => { 
            if (b.parentNode && !b.classList.contains('popping')) {
                b.remove();
            }
        }, 5000);
    }, 700);

    setTimeout(() => {
        clearInterval(waveInterval);
        gameRunning = false;
        alert("Wave finished! Your final score: " + db.users[currentUserID].score);
    }, 15000);
}

function popBalloon(el) {
    // Play pop sound
    const sound = document.getElementById('pop-sound');
    sound.currentTime = 0;
    sound.play();
    
    // Add burst animation
    el.style.animation = 'burstPop 0.6s ease-out forwards';
    
    // Update score after animation starts for better feel
    db.users[currentUserID].score += 100;
    document.getElementById('score-val').innerText = db.users[currentUserID].score;
    
    // Color burst confetti on every balloon pop
    const balloonX = (parseFloat(el.style.left) || 50) / 100;
    const balloonY = 0.3;
    confetti({
        particleCount: 25,
        spread: 50,
        origin: { x: balloonX, y: balloonY },
        colors: ['#ff1493', '#ffd700', '#00bfff', '#32cd32', '#9370db', '#ff6347', '#00ff7f'],
        gravity: 0.8,
        decay: 0.92,
        scalar: 0.8
    });
    
    // Extra milestone celebration
    if (db.users[currentUserID].score % 1000 === 0) {
        confetti({ 
            particleCount: 150, 
            spread: 70, 
            origin: { y: 0.6 },
            gravity: 0.7,
            decay: 0.95
        });
    }
    
    // Remove element after animation completes
    setTimeout(() => {
        if (el.parentNode) {
            el.remove();
        }
    }, 600);
    
    saveDB();
    updateLeaderboard();
}

// 4. Database & Export
function saveDB() {
    localStorage.setItem('HoliApp_2026', JSON.stringify(db));
}

function updateLeaderboard() {
    const sorted = Object.values(db.users).sort((a, b) => b.score - a.score);
    const body = document.getElementById('leaderboard-body');
    
    body.innerHTML = sorted.map((user, i) => `
        <tr>
            <td>${i + 1}</td>
            <td>${user.name}</td>
            <td>${user.score}</td>
        </tr>
    `).join('');
}

function copyLink() {
    const link = document.getElementById('link-text').innerText;
    navigator.clipboard.writeText(link);
    alert("Link copied! Paste it in your WhatsApp groups!");
}

// Export data to CSV (Excel compatible)
function exportToCSV() {
    const users = Object.values(db.users);
    const exportTime = new Date().toISOString();
    let csv = "ID,Name,Score,Created At,Sessions,Last Login,Last Logout,Exported At\n";
    
    users.forEach(user => {
        const sessionCount = user.sessions ? user.sessions.length : 0;
        const lastSession = user.sessions && user.sessions.length > 0 ? user.sessions[user.sessions.length - 1] : null;
        const lastLogin = lastSession ? lastSession.loginTime : 'N/A';
        const lastLogout = lastSession && lastSession.logoutTime ? lastSession.logoutTime : 'Active';
        csv += `${user.id},"${user.name}",${user.score},"${user.createdAt}",${sessionCount},"${lastLogin}","${lastLogout}","${exportTime}"\n`;
    });
    
    db.lastExportAt = exportTime;
    saveDB();
    const csvContent = '\uFEFF' + csv;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'holi_users_' + new Date().toISOString().slice(0,10) + '.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    alert("Data exported successfully to Excel format!");
}

// 5. Page Initialization
window.addEventListener('DOMContentLoaded', function() {
    updateLeaderboard();
    const savedUserID = localStorage.getItem('CurrentUserID');
    
    // Check if user is already logged in - keep session until manual logout
    if (savedUserID && db.users[savedUserID]) {
        currentUserID = parseInt(savedUserID);
        currentUserName = db.users[currentUserID].name;
        updateProfileDisplay();
        document.getElementById('welcome-screen').classList.add('hidden');
        document.getElementById('main-app').classList.remove('hidden');
    } else {
        // No saved session, show login screen
        document.getElementById('welcome-screen').classList.remove('hidden');
        document.getElementById('main-app').classList.add('hidden');
    }
});