// NGL Service dengan API yang benar
class NGLService {
    async sendMessage(username, message, count) {
        const results = [];
        const progressBar = document.getElementById('send-progress');
        
        for (let i = 0; i < count; i++) {
            try {
                // NGL API endpoint yang benar
                const formData = new URLSearchParams();
                formData.append('username', username);
                formData.append('question', message);
                formData.append('deviceId', `device_${Date.now()}_${i}`);
                formData.append('gameSlug', '');
                formData.append('referrer', '');

                const response = await fetch('https://ngl.link/api/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: formData
                });

                if (response.ok) {
                    results.push({
                        index: i + 1,
                        success: true,
                        timestamp: new Date().toLocaleTimeString()
                    });
                    addTerminalLine('ngl-terminal', `✅ Message ${i + 1}/${count} sent successfully`);
                } else {
                    throw new Error(`HTTP ${response.status}`);
                }
            } catch (error) {
                results.push({
                    index: i + 1,
                    success: false,
                    error: error.message,
                    timestamp: new Date().toLocaleTimeString()
                });
                addTerminalLine('ngl-terminal', `❌ Message ${i + 1}/${count} failed: ${error.message}`);
            }

            // Update progress
            const progress = ((i + 1) / count) * 100;
            progressBar.style.width = progress + '%';
            
            // Delay antar pesan
            if (i < count - 1) {
                await new Promise(resolve => setTimeout(resolve, 1500));
            }
        }

        return results;
    }
}

// IP Service dengan detail lengkap
class IPService {
    async getIPInfo(ip = '') {
        // Jika tidak ada IP yang diberikan, ambil IP publik user
        let targetIP = ip;
        if (!targetIP) {
            const ipResponse = await fetch('https://api.ipify.org?format=json');
            const ipData = await ipResponse.json();
            targetIP = ipData.ip;
        }

        // Gunakan ipapi.co untuk data lengkap
        const response = await fetch(`https://ipapi.co/${targetIP}/json/`);
        if (!response.ok) {
            throw new Error('Failed to fetch IP information');
        }
        const data = await response.json();

        return {
            ip: data.ip || '-',
            country: data.country_name || '-',
            region: data.region || '-',
            city: data.city || '-',
            zip: data.postal || '-',
            lat: data.latitude || '-',
            lon: data.longitude || '-',
            timezone: data.timezone || '-',
            isp: data.org || '-',
            org: data.org || '-',
            as: data.asn || '-',
            continent: data.continent_code || '-',
            currency: data.currency || '-',
            languages: data.languages || '-',
            calling: data.country_calling_code || '-'
        };
    }
}

// Inisialisasi services
const nglService = new NGLService();
const ipService = new IPService();

// Tab switching
document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        button.classList.add('active');
        document.getElementById(button.dataset.tab).classList.add('active');
    });
});

// Mode selector untuk IP checker
let ipMode = 'self';
document.querySelectorAll('.mode-option').forEach(option => {
    option.addEventListener('click', () => {
        document.querySelectorAll('.mode-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        option.classList.add('selected');
        ipMode = option.dataset.mode;
        
        const otherIpInput = document.getElementById('other-ip-input');
        if (ipMode === 'other') {
            otherIpInput.style.display = 'block';
            addTerminalLine('ip-terminal', '🎯 MODE: Target IP scan selected');
        } else {
            otherIpInput.style.display = 'none';
            addTerminalLine('ip-terminal', '🖥️ MODE: Self IP scan selected');
        }
    });
});

// Counter functionality untuk NGL
const nglCountInput = document.getElementById('ngl-count');

document.getElementById('increase-ngl').addEventListener('click', () => {
    let value = parseInt(nglCountInput.value);
    if (value < 50) {
        nglCountInput.value = value + 1;
    }
});

document.getElementById('decrease-ngl').addEventListener('click', () => {
    let value = parseInt(nglCountInput.value);
    if (value > 1) {
        nglCountInput.value = value - 1;
    }
});

nglCountInput.addEventListener('change', function() {
    let value = parseInt(this.value);
    if (value < 1) this.value = 1;
    if (value > 50) this.value = 50;
});

// Send NGL messages
document.getElementById('send-ngl').addEventListener('click', async () => {
    const username = document.getElementById('ngl-username').value.trim();
    const message = document.getElementById('ngl-message').value.trim();
    const count = parseInt(nglCountInput.value);
    const sendButton = document.getElementById('send-ngl');

    // Validasi input
    if (!username) {
        addTerminalLine('ngl-terminal', '❌ ERROR: NGL username required');
        return;
    }
    
    if (!message) {
        addTerminalLine('ngl-terminal', '❌ ERROR: Message content required');
        return;
    }

    if (count < 1 || count > 50) {
        addTerminalLine('ngl-terminal', '❌ ERROR: Message count must be between 1-50');
        return;
    }

    sendButton.disabled = true;
    sendButton.textContent = '⏳ SENDING...';

    addTerminalLine('ngl-terminal', `🚀 STARTING: Sending ${count} messages to ${username}`);
    addTerminalLine('ngl-terminal', `📝 MESSAGE: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`);

    try {
        const startTime = Date.now();
        const results = await nglService.sendMessage(username, message, count);
        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(1);
        
        const successful = results.filter(r => r.success).length;
        const failed = results.filter(r => !r.success).length;
        
        addTerminalLine('ngl-terminal', `✅ COMPLETED: ${successful}/${count} messages sent in ${duration}s`);
        
        const successRate = ((successful / count) * 100).toFixed(1);
        addTerminalLine('ngl-terminal', `📊 SUCCESS RATE: ${successRate}%`);
        
        if (successful === count) {
            addTerminalLine('ngl-terminal', '🎉 SUCCESS: All messages delivered successfully!');
        } else if (successful > 0) {
            addTerminalLine('ngl-terminal', '⚠️ PARTIAL: Some messages failed to deliver');
        } else {
            addTerminalLine('ngl-terminal', '❌ FAILED: No messages were delivered');
        }
        
    } catch (error) {
        addTerminalLine('ngl-terminal', `💥 CRITICAL ERROR: ${error.message}`);
    } finally {
        sendButton.disabled = false;
        sendButton.textContent = '🚀 DEPLOY MESSAGES';
        document.getElementById('send-progress').style.width = '0%';
        addTerminalLine('ngl-terminal', '✅ SYSTEM: Ready for next operation');
    }
});

// Check IP address
document.getElementById('check-ip').addEventListener('click', async () => {
    const targetIp = document.getElementById('target-ip').value.trim();
    const resultDiv = document.getElementById('ip-result');
    const checkButton = document.getElementById('check-ip');

    checkButton.disabled = true;
    checkButton.textContent = '🔍 SCANNING...';

    addTerminalLine('ip-terminal', '🌐 SCANNING: Starting IP analysis...');

    try {
        const ip = ipMode === 'other' && targetIp ? targetIp : '';
        
        if (ipMode === 'other' && !ip) {
            throw new Error('Please enter target IP address');
        }
        
        addTerminalLine('ip-terminal', `🎯 TARGET: ${ip || 'Auto-detecting public IP'}`);
        
        const ipInfo = await ipService.getIPInfo(ip);
        
        // Update UI dengan informasi IP yang detail
        document.getElementById('ip-address').textContent = ipInfo.ip;
        document.getElementById('ip-country').textContent = ipInfo.country;
        document.getElementById('ip-region').textContent = ipInfo.region;
        document.getElementById('ip-city').textContent = ipInfo.city;
        document.getElementById('ip-zip').textContent = ipInfo.zip;
        document.getElementById('ip-lat').textContent = ipInfo.lat;
        document.getElementById('ip-lon').textContent = ipInfo.lon;
        document.getElementById('ip-timezone').textContent = ipInfo.timezone;
        document.getElementById('ip-isp').textContent = ipInfo.isp;
        document.getElementById('ip-org').textContent = ipInfo.org;
        document.getElementById('ip-as').textContent = ipInfo.as;
        document.getElementById('ip-continent').textContent = ipInfo.continent;
        document.getElementById('ip-currency').textContent = ipInfo.currency;
        document.getElementById('ip-languages').textContent = ipInfo.languages;
        document.getElementById('ip-calling').textContent = ipInfo.calling;
        
        resultDiv.style.display = 'block';
        addTerminalLine('ip-terminal', '✅ SUCCESS: IP scan completed');
        addTerminalLine('ip-terminal', `📍 LOCATION: ${ipInfo.city}, ${ipInfo.region}, ${ipInfo.country}`);
        addTerminalLine('ip-terminal', `🌍 COORDINATES: ${ipInfo.lat}, ${ipInfo.lon}`);
        addTerminalLine('ip-terminal', `📡 NETWORK: ${ipInfo.isp} (AS${ipInfo.as})`);
        
    } catch (error) {
        addTerminalLine('ip-terminal', `❌ ERROR: ${error.message}`);
        resultDiv.style.display = 'none';
    } finally {
        checkButton.disabled = false;
        checkButton.textContent = '🔍 SCAN IP ADDRESS';
    }
});

// Helper function untuk terminal
function addTerminalLine(terminalId, message) {
    const terminal = document.getElementById(terminalId);
    const newLine = document.createElement('div');
    newLine.className = 'terminal-line';
    
    const timestamp = new Date().toLocaleTimeString();
    newLine.innerHTML = `<span style="color: var(--primary)">[${timestamp}]</span> <span class="terminal-prompt">></span> ${message}`;
    
    terminal.appendChild(newLine);
    terminal.scrollTop = terminal.scrollHeight;
}

// Initialize system
setTimeout(() => {
    addTerminalLine('ngl-terminal', '✅ SYSTEM: NGL module fully operational');
    addTerminalLine('ip-terminal', '✅ SYSTEM: IP intelligence ready');
    addTerminalLine('ngl-terminal', '💡 TIP: Enter username and message to start sending');
    addTerminalLine('ip-terminal', '💡 TIP: Select scan mode and click scan button');
}, 1000);