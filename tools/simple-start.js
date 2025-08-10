const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🦎 Starting Greedy Geckoz on port 4000...\n');

// Check if Next.js is available
const nextBinPath = path.join(__dirname, 'node_modules', '.bin', 'next');
const nextCmdPath = nextBinPath + '.cmd';

if (fs.existsSync(nextCmdPath) || fs.existsSync(nextBinPath)) {
    console.log('✅ Next.js found, starting development server...');
    
    // Start the Next.js server
    const server = spawn('npm', ['run', 'dev', '--', '--port', '4000'], {
        cwd: __dirname,
        stdio: 'inherit',
        shell: true
    });

    server.on('error', (err) => {
        console.error('❌ Error starting server:', err.message);
    });

    server.on('close', (code) => {
        console.log(`Server exited with code ${code}`);
    });

    // Handle Ctrl+C
    process.on('SIGINT', () => {
        console.log('\n🛑 Stopping server...');
        server.kill();
        process.exit();
    });

} else {
    console.log('❌ Next.js not found. Please run: npm install');
    console.log('\nTry this:');
    console.log('1. Open Command Prompt (not Git Bash)');
    console.log('2. cd C:\\Users\\Hutch\\greedy-geckoz-refresh');
    console.log('3. npm install --legacy-peer-deps');
    console.log('4. npm run dev -- --port 4000');
}