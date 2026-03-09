// Oura OAuth Configuration
const OURA_CONFIG = {
    clientId: 'cd4fe21f-54d0-4d80-bfd0-b35bad347e97',
    redirectUri: window.location.origin + '/',
    authUrl: 'https://cloud.ouraring.com/oauth/authorize',
    apiBaseUrl: 'https://api.ouraring.com/v2'
};

// State Management
let accessToken = null;
let sleepData = null;
let sleepPeriods = null;

// DOM Elements
const loginScreen = document.getElementById('login-screen');
const appScreen = document.getElementById('app-screen');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const refreshBtn = document.getElementById('refresh-btn');
const setAlarmBtn = document.getElementById('set-alarm-btn');
const loadingOverlay = document.getElementById('loading-overlay');

// Initialize App
function init() {
    // Check for OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');
    
    if (error) {
        alert(`OAuth Error: ${error}`);
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
    }
    
    if (code) {
        handleOAuthCallback(code);
        return;
    }
    
    // Check for saved token
    const savedToken = localStorage.getItem('oura_access_token');
    if (savedToken) {
        accessToken = savedToken;
        showApp();
        loadSleepData();
    }
    
    // Event Listeners
    loginBtn.addEventListener('click', startOAuthFlow);
    logoutBtn.addEventListener('click', logout);
    refreshBtn.addEventListener('click', loadSleepData);
    setAlarmBtn.addEventListener('click', analyzeOptimalWakeTime);
}

// OAuth Flow
function startOAuthFlow() {
    const scope = 'daily personal email';
    const authUrl = `${OURA_CONFIG.authUrl}?` +
        `response_type=code&` +
        `client_id=${encodeURIComponent(OURA_CONFIG.clientId)}&` +
        `redirect_uri=${encodeURIComponent(OURA_CONFIG.redirectUri)}&` +
        `scope=${encodeURIComponent(scope)}`;
    
    window.location.href = authUrl;
}

async function handleOAuthCallback(code) {
    showLoading('Connecting to Oura...');
    
    try {
        // Exchange code for token via Vercel serverless function
        const response = await fetch('/api/auth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                code: code,
                redirectUri: OURA_CONFIG.redirectUri
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Token exchange failed: ${errorData.error || response.status}`);
        }
        
        const data = await response.json();
        accessToken = data.access_token;
        
        // Save token
        localStorage.setItem('oura_access_token', accessToken);
        
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Show app and load data
        showApp();
        await loadSleepData();
        
    } catch (error) {
        console.error('OAuth error:', error);
        hideLoading();
        alert(`Failed to connect to Oura: ${error.message}`);
        showLogin();
    }
}

function logout() {
    accessToken = null;
    localStorage.removeItem('oura_access_token');
    showLogin();
}

// UI Functions
function showLogin() {
    loginScreen.classList.add('active');
    appScreen.classList.remove('active');
}

function showApp() {
    loginScreen.classList.remove('active');
    appScreen.classList.add('active');
}

function showLoading(message = 'Loading...') {
    loadingOverlay.querySelector('p').textContent = message;
    loadingOverlay.classList.add('active');
}

function hideLoading() {
    loadingOverlay.classList.remove('active');
}

// API Functions
async function loadSleepData() {
    showLoading('Loading sleep data...');
    
    try {
        // Get date range (last 3 days)
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        // Fetch daily sleep summary
        const dailySleepResponse = await fetch(
            `${OURA_CONFIG.apiBaseUrl}/usercollection/daily_sleep?start_date=${startDate}&end_date=${endDate}`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            }
        );
        
        if (!dailySleepResponse.ok) {
            throw new Error('Failed to fetch sleep data');
        }
        
        const dailySleepData = await dailySleepResponse.json();
        
        // Fetch detailed sleep periods
        const sleepPeriodsResponse = await fetch(
            `${OURA_CONFIG.apiBaseUrl}/usercollection/sleep?start_date=${startDate}&end_date=${endDate}`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            }
        );
        
        if (!sleepPeriodsResponse.ok) {
            throw new Error('Failed to fetch sleep periods');
        }
        
        const sleepPeriodsData = await sleepPeriodsResponse.json();
        
        // Store data
        if (dailySleepData.data && dailySleepData.data.length > 0) {
            sleepData = dailySleepData.data[dailySleepData.data.length - 1];
        }
        
        if (sleepPeriodsData.data && sleepPeriodsData.data.length > 0) {
            sleepPeriods = sleepPeriodsData.data[sleepPeriodsData.data.length - 1];
        }
        
        // Render UI
        renderSleepSummary();
        renderSleepStages();
        
        hideLoading();
        
    } catch (error) {
        console.error('Error loading sleep data:', error);
        hideLoading();
        
        const summaryContent = document.getElementById('sleep-summary-content');
        summaryContent.innerHTML = `
            <div class="error-message">
                <strong>Failed to load sleep data</strong>
                <p>Please make sure you wore your Oura Ring last night and try refreshing.</p>
            </div>
        `;
    }
}

function renderSleepSummary() {
    const container = document.getElementById('sleep-summary-content');
    
    if (!sleepData) {
        container.innerHTML = `
            <div class="error-message">
                No sleep data found. Make sure you wore your Oura Ring last night.
            </div>
        `;
        return;
    }
    
    const totalSleepHours = (sleepData.total_sleep_duration / 3600).toFixed(1);
    
    container.innerHTML = `
        <div class="sleep-summary-grid">
            <div class="stat-box">
                <div class="stat-label">Sleep Score</div>
                <div class="stat-value score">${sleepData.score || 'N/A'}</div>
            </div>
            <div class="stat-box">
                <div class="stat-label">Total Sleep</div>
                <div class="stat-value time">${totalSleepHours}h</div>
            </div>
            <div class="stat-box">
                <div class="stat-label">Efficiency</div>
                <div class="stat-value efficiency">${sleepData.efficiency || 'N/A'}%</div>
            </div>
            <div class="stat-box">
                <div class="stat-label">Restfulness</div>
                <div class="stat-value">${sleepData.restfulness || 'N/A'}%</div>
            </div>
        </div>
        <p style="color: var(--text-secondary); font-size: 14px; text-align: center;">
            Sleep session: ${sleepData.day}
        </p>
    `;
}

function renderSleepStages() {
    const container = document.getElementById('sleep-stages-chart');
    
    if (!sleepPeriods || !sleepPeriods.sleep_phase_5_min) {
        container.innerHTML = `
            <div class="error-message">
                No detailed sleep stage data available.
            </div>
        `;
        return;
    }
    
    const stages = sleepPeriods.sleep_phase_5_min;
    const stageMap = {
        '1': { name: 'deep', color: '#4f46e5' },
        '2': { name: 'light', color: '#10b981' },
        '3': { name: 'rem', color: '#f59e0b' },
        '4': { name: 'awake', color: '#ef4444' }
    };
    
    // Calculate stage durations
    const stageCounts = stages.reduce((acc, stage) => {
        const stageName = stageMap[stage]?.name || 'unknown';
        acc[stageName] = (acc[stageName] || 0) + 1;
        return acc;
    }, {});
    
    // Create timeline
    const barsHTML = stages.map(stage => {
        const stageInfo = stageMap[stage] || { name: 'unknown', color: '#94a3b8' };
        return `<div class="stage-bar ${stageInfo.name}" title="${stageInfo.name}"></div>`;
    }).join('');
    
    // Format start/end times
    const bedtimeStart = new Date(sleepPeriods.bedtime_start);
    const bedtimeEnd = new Date(sleepPeriods.bedtime_end);
    const startTime = bedtimeStart.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    const endTime = bedtimeEnd.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    
    container.innerHTML = `
        <div class="sleep-stages-timeline">
            <div class="timeline-labels">
                <span>${startTime}</span>
                <span>${endTime}</span>
            </div>
            <div class="timeline-bars">
                ${barsHTML}
            </div>
            <div class="stage-legend">
                <div class="legend-item">
                    <div class="legend-color" style="background: #4f46e5;"></div>
                    <span>Deep (${stageCounts.deep * 5 || 0} min)</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background: #10b981;"></div>
                    <span>Light (${stageCounts.light * 5 || 0} min)</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background: #f59e0b;"></div>
                    <span>REM (${stageCounts.rem * 5 || 0} min)</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background: #ef4444;"></div>
                    <span>Awake (${stageCounts.awake * 5 || 0} min)</span>
                </div>
            </div>
        </div>
    `;
}

function analyzeOptimalWakeTime() {
    if (!sleepPeriods || !sleepPeriods.sleep_phase_5_min) {
        alert('No sleep stage data available. Please refresh your sleep data.');
        return;
    }
    
    const alarmStart = document.getElementById('alarm-start').value;
    const alarmEnd = document.getElementById('alarm-end').value;
    const stages = sleepPeriods.sleep_phase_5_min;
    const stageMap = { '1': 'deep', '2': 'light', '3': 'REM', '4': 'awake' };
    
    // Find light sleep periods in the last part of the sleep session
    const lastHour = stages.slice(-12); // Last 12 intervals = last hour
    const lastStage = stageMap[stages[stages.length - 1]] || 'unknown';
    
    // Count light sleep periods near the end
    const lightSleepCount = lastHour.filter(s => stageMap[s] === 'light').length;
    
    const optimalCard = document.getElementById('optimal-time-card');
    const optimalContent = document.getElementById('optimal-time-content');
    
    if (lastStage === 'light' || lastStage === 'awake') {
        optimalContent.innerHTML = `
            <div class="optimal-result">
                <div class="stage-badge">${lastStage} sleep</div>
                <div class="time-display">${alarmStart} - ${alarmEnd}</div>
                <p>✓ Your last sleep session ended in ${lastStage} sleep, which is optimal for waking up!</p>
                <p style="margin-top: 12px; font-size: 14px; opacity: 0.9;">
                    Setting your alarm within this window would have woken you feeling refreshed.
                </p>
            </div>
        `;
        optimalCard.style.display = 'block';
    } else {
        optimalContent.innerHTML = `
            <div class="optimal-result">
                <div class="stage-badge">${lastStage} sleep</div>
                <div class="time-display">${alarmStart} - ${alarmEnd}</div>
                <p>Your last sleep session ended in ${lastStage} sleep.</p>
                <p style="margin-top: 12px; font-size: 14px; opacity: 0.9;">
                    ${lightSleepCount > 0 
                        ? `You had ${lightSleepCount} light sleep periods in the last hour. A smart alarm would try to catch one of these.`
                        : 'Not ideal for waking. A wider alarm window (30-60 min) increases chances of catching light sleep.'}
                </p>
            </div>
        `;
        optimalCard.style.display = 'block';
    }
    
    // Scroll to optimal time card
    optimalCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Start the app
init();
