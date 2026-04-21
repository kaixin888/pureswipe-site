import { sendAlert } from './lib/monitor.js';

async function test() {
  console.log('Testing Feishu Alert...');
  const success = await sendAlert({
    level: 'P0',
    title: 'AUDIT: Feishu Test',
    message: 'This is a test alert from the Quality Auditor to verify integration.',
    evidence: 'Manual verification run.'
  });
  console.log('Feishu Alert Success:', success);
  process.exit(success ? 0 : 1);
}

test();
