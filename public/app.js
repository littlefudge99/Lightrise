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
    const scope = 'email personal daily heartrate tag workout session spo2 ring_configuration stress heart_health';
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
        // Get date range — end tomorrow to avoid boundary issues, start 7 days back
        const endDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        // Fetch daily sleep summary
        const dailySleepResponse = await fetch(
            `/api/sleep/daily?start_date=${startDate}&end_date=${endDate}`,
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
            `/api/sleep/periods?start_date=${startDate}&end_date=${endDate}`,
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
            // Find the most recent day in the periods data and filter to that day only
            const latestDay = sleepPeriodsData.data.reduce((max, s) => s.day > max ? s.day : max, '');
            const allPeriods = sleepPeriodsData.data.filter(s => s.day === latestDay);

            // Sum total sleep across all periods for the day
            const totalSleepSecs = allPeriods.reduce((sum, s) => sum + (s.total_sleep_duration || 0), 0);

            // Use the long_sleep period (or longest) for stage visualisation
            sleepPeriods = allPeriods.find(s => s.type === 'long_sleep')
                || allPeriods.reduce((a, b) =>
                    (a.total_sleep_duration || 0) >= (b.total_sleep_duration || 0) ? a : b);
            sleepPeriods._totalSleepSecs = totalSleepSecs;

            // Oura returns sleep_phase_5_min as a string — convert to array
            const raw = sleepPeriods.sleep_phase_5_min;
            if (raw) {
                sleepPeriods.sleep_phase_5_min = Array.isArray(raw) ? raw : String(raw).split('');
            }
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
    
const timeInBedSecs = sleepPeriods?.bedtime_start && sleepPeriods?.bedtime_end
        ? (new Date(sleepPeriods.bedtime_end) - new Date(sleepPeriods.bedtime_start)) / 1000
        : null;
    const totalSecs = timeInBedSecs
        ? timeInBedSecs - (sleepPeriods.awake_time || 0)
        : sleepPeriods?._totalSleepSecs || sleepPeriods?.total_sleep_duration;
    const totalSleepDisplay = totalSecs
        ? `${Math.floor(totalSecs / 3600)}h ${Math.floor((totalSecs % 3600) / 60)}m`
        : 'N/A';
    const efficiency = sleepPeriods?.efficiency ?? sleepData.contributors?.efficiency ?? 'N/A';
    const restfulness = sleepData.contributors?.restfulness ?? sleepData.restfulness ?? 'N/A';

    container.innerHTML = `
        <div class="sleep-summary-grid">
            <div class="stat-box">
                <div class="stat-label">Sleep Score</div>
                <div class="stat-value score">${sleepData.score || 'N/A'}</div>
            </div>
            <div class="stat-box">
                <div class="stat-label">Total Sleep</div>
                <div class="stat-value time">${totalSleepDisplay}</div>
            </div>
            <div class="stat-box">
                <div class="stat-label">Efficiency</div>
                <div class="stat-value efficiency">${efficiency !== 'N/A' ? efficiency + '%' : 'N/A'}</div>
            </div>
            <div class="stat-box">
                <div class="stat-label">Restfulness</div>
                <div class="stat-value">${restfulness !== 'N/A' ? restfulness + '%' : 'N/A'}</div>
            </div>
        </div>
        <p style="color: var(--text-secondary); font-size: 14px; text-align: center;">
            Night of ${sleepPeriods?.bedtime_start ? new Date(sleepPeriods.bedtime_start).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : sleepData.day}
            ${sleepData.day !== new Date().toISOString().split('T')[0] ? ' <span style="color:#f59e0b">(API still processing last night — check back soon)</span>' : ''}
        </p>
    `;
}

function renderSleepStages() {
    const container = document.getElementById('sleep-stages-chart');

    if (!sleepPeriods || !sleepPeriods.sleep_phase_5_min) {
        container.innerHTML = `<div class="error-message">No detailed sleep stage data available.</div>`;
        return;
    }

    const raw = sleepPeriods.sleep_phase_5_min;
    const stages = Array.isArray(raw) ? raw : String(raw).split('');

    const stageLabel = { '1': 'Deep', '2': 'Light', '3': 'REM', '4': 'Awake' };
    const stageColor = { '1': '#4f46e5', '2': '#10b981', '3': '#f59e0b', '4': '#ef4444' };
    // Y position: Awake at top, Deep at bottom (hypnogram style)
    const stageRow  = { '4': 0, '3': 1, '2': 2, '1': 3 };

    const bedtimeStart = new Date(sleepPeriods.bedtime_start);
    const n = stages.length;

    // SVG layout
    const W = 800, H = 220;
    const mTop = 16, mRight = 16, mBottom = 44, mLeft = 56;
    const plotW = W - mLeft - mRight;
    const plotH = H - mTop - mBottom;
    const xStep = plotW / n;
    const yStep = plotH / 3;

    // Stage duration totals for legend
    const counts = stages.reduce((a, s) => { a[s] = (a[s] || 0) + 1; return a; }, {});

    // Group consecutive same-stage runs for colored segments
    const runs = [];
    let runStart = 0;
    for (let i = 1; i <= n; i++) {
        if (i === n || stages[i] !== stages[runStart]) {
            runs.push({ stage: stages[runStart], from: runStart, to: i });
            runStart = i;
        }
    }

    // Hourly time labels on x-axis
    const totalMins = n * 5;
    const xLabels = [];
    for (let m = 0; m <= totalMins; m += 60) {
        const t = new Date(bedtimeStart.getTime() + m * 60000);
        xLabels.push({
            x: mLeft + (m / 5) * xStep,
            label: t.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
        });
    }

    // Y axis stage labels
    const yLabels = ['Awake','REM','Light','Deep'].map((l, i) => ({
        label: l, y: mTop + i * yStep
    }));

    // Build colored SVG paths: horizontal segment + vertical transition to next run
    const segmentsSVG = runs.map((run, ri) => {
        const x1 = mLeft + run.from * xStep;
        const x2 = mLeft + run.to * xStep;
        const y  = mTop + stageRow[run.stage] * yStep;
        const color = stageColor[run.stage];
        // Horizontal segment for this run
        let path = `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${color}" stroke-width="3" stroke-linecap="round"/>`;
        // Vertical transition down/up to next run
        if (ri < runs.length - 1) {
            const nextY = mTop + stageRow[runs[ri + 1].stage] * yStep;
            path += `<line x1="${x2}" y1="${y}" x2="${x2}" y2="${nextY}" stroke="${color}" stroke-width="3"/>`;
        }
        return path;
    }).join('');

    container.innerHTML = `
        <div style="position:relative;user-select:none;overflow:visible;">
            <svg id="hypnogram" viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;display:block;overflow:visible;">
                ${yLabels.map(l => `
                    <line x1="${mLeft}" y1="${l.y}" x2="${W - mRight}" y2="${l.y}" stroke="#e2e8f0" stroke-width="1"/>
                    <text x="${mLeft - 8}" y="${l.y + 4}" text-anchor="end" font-size="12" fill="#64748b">${l.label}</text>
                `).join('')}
                ${xLabels.map(l => `
                    <line x1="${l.x}" y1="${mTop}" x2="${l.x}" y2="${H - mBottom}" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="3,3"/>
                    <text x="${l.x}" y="${H - mBottom + 16}" text-anchor="middle" font-size="11" fill="#94a3b8">${l.label}</text>
                `).join('')}
                ${segmentsSVG}
                <line id="h-line" x1="0" y1="${mTop}" x2="0" y2="${H - mBottom}" stroke="#64748b" stroke-width="1" stroke-dasharray="4,3" visibility="hidden"/>
                <circle id="h-dot" cx="0" cy="0" r="5" fill="#fff" stroke="#6366f1" stroke-width="2.5" visibility="hidden"/>
                <rect id="h-overlay" x="${mLeft}" y="${mTop}" width="${plotW}" height="${plotH}" fill="transparent" style="cursor:crosshair;"/>
            </svg>
            <div id="h-tip" style="position:absolute;display:none;background:rgba(15,23,42,0.92);color:#fff;padding:8px 14px;border-radius:10px;font-size:13px;pointer-events:none;white-space:nowrap;box-shadow:0 4px 16px rgba(0,0,0,0.2);"></div>
        </div>
        <div class="stage-legend" style="margin-top:14px;">
            ${[['1','Deep'],['2','Light'],['3','REM'],['4','Awake']].map(([k, name]) => `
                <div class="legend-item">
                    <div class="legend-color" style="background:${stageColor[k]};"></div>
                    <span>${name} (${(counts[k] || 0) * 5} min)</span>
                </div>
            `).join('')}
        </div>
    `;

    // Interactivity
    const svg     = document.getElementById('hypnogram');
    const overlay = document.getElementById('h-overlay');
    const hLine   = document.getElementById('h-line');
    const hDot    = document.getElementById('h-dot');
    const tip     = document.getElementById('h-tip');

    overlay.addEventListener('mousemove', e => {
        const rect = svg.getBoundingClientRect();
        const svgX = (e.clientX - rect.left) * (W / rect.width);
        const idx = Math.max(0, Math.min(n - 1, Math.floor((svgX - mLeft) / xStep)));
        const stage = stages[idx];
        const cx = mLeft + (idx + 0.5) * xStep;
        const cy = mTop + stageRow[stage] * yStep;
        const time = new Date(bedtimeStart.getTime() + idx * 5 * 60000);
        const timeStr = time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

        hLine.setAttribute('x1', cx); hLine.setAttribute('x2', cx); hLine.setAttribute('visibility', 'visible');
        hDot.setAttribute('cx', cx); hDot.setAttribute('cy', cy); hDot.setAttribute('stroke', stageColor[stage]); hDot.setAttribute('visibility', 'visible');

        tip.style.display = 'block';
        tip.innerHTML = `<strong>${timeStr}</strong> &nbsp;<span style="color:${stageColor[stage]}">● ${stageLabel[stage]}</span>`;

        const wrap = tip.parentElement.getBoundingClientRect();
        let lx = e.clientX - wrap.left + 14;
        let ty = e.clientY - wrap.top - 52;
        if (lx + 180 > wrap.width) lx -= 190;
        tip.style.left = lx + 'px';
        tip.style.top  = ty + 'px';
    });

    overlay.addEventListener('mouseleave', () => {
        hLine.setAttribute('visibility', 'hidden');
        hDot.setAttribute('visibility', 'hidden');
        tip.style.display = 'none';
    });
}

function analyzeOptimalWakeTime() {
    if (!sleepPeriods || !sleepPeriods.sleep_phase_5_min) {
        alert('No sleep stage data available. Please refresh your sleep data.');
        return;
    }
    
    const alarmStart = document.getElementById('alarm-start').value;
    const alarmEnd = document.getElementById('alarm-end').value;
    const rawStages = sleepPeriods.sleep_phase_5_min;
    const stages = Array.isArray(rawStages) ? rawStages : String(rawStages).split('');
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
