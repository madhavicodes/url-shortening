import { spawn } from 'child_process';

if (process.env.RENDER || process.env.NODE_ENV === 'production') {
  const child = spawn(process.execPath, ['server/index.js'], { stdio: 'inherit' });
  child.on('exit', (code) => process.exit(code ?? 1));
} else {
  const child = spawn('npx', ['concurrently', '-k', 'npm:dev:server', 'npm:dev:client'], {
    stdio: 'inherit',
    shell: true,
  });
  child.on('exit', (code) => process.exit(code ?? 1));
}
