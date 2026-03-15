import { spawn } from 'child_process';
import fs from 'fs';

const child = spawn('npx', [
  '-y', '@insforge/mcp@latest',
  '--api_key', 'ik_10d565cc5088df5a99792349c7c175be',
  '--api_base_url', 'https://k5xke53t.us-east.insforge.app'
], { shell: true });

let reqId = 1;

function send(method, params = {}) {
  const payload = {
    jsonrpc: '2.0',
    id: reqId++,
    method,
    params,
  };
  child.stdin.write(JSON.stringify(payload) + '\n');
}

// First send initialization
send('initialize', {
  protocolVersion: "2024-11-05", 
  capabilities: {}, 
  clientInfo: {name: "test", version: "1.0"}
});

let buffer = '';

child.stdout.on('data', (data) => {
  buffer += data.toString();
  const lines = buffer.split('\n');
  buffer = lines.pop(); // keep partial line

  for (const line of lines) {
    if (line.trim().startsWith('{')) {
      try {
        const msg = JSON.parse(line.trim());
        if (msg.id === 1) { // initialize response
          child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');
          // send tools/list
          send('tools/list');
        } else if (msg.id === 2) { // tools/list response
          fs.writeFileSync('C:\\Users\\TOTAL TECH\\Desktop\\My Ai project\\webapp\\Zheera\\mcp_tools.json', JSON.stringify(msg, null, 2));
          child.stdin.write(JSON.stringify({
            jsonrpc: '2.0',
            id: 3,
            method: 'tools/call',
            params: { name: 'fetch-docs', arguments: { documentation_type: 'instructions' } }
          }) + '\n');
          child.stdin.write(JSON.stringify({
            jsonrpc: '2.0',
            id: 4,
            method: 'tools/call',
            params: { name: 'fetch-docs', arguments: { type: 'instructions' } }
          }) + '\n');
        } else if (msg.id === 3 || msg.id === 4) {
          if (!msg.error || msg.id === 4) {
             fs.writeFileSync(`C:\\Users\\TOTAL TECH\\Desktop\\My Ai project\\webapp\\Zheera\\mcp_res_${msg.id}.json`, JSON.stringify(msg, null, 2));
             if (msg.id === 4 || !msg.error) process.exit(0);
          }
        }
      } catch (e) {}
    }
  }
});

child.stderr.on('data', (data) => console.error(data.toString()));
