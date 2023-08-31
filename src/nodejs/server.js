const express = require('express');
const https = require('https');
const fs = require('fs');
const WebSocket = require('ws');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const spawn = require('child_process').spawn;

const app = express();

const server = https.createServer({
    key: fs.readFileSync('cert.key'),
    cert: fs.readFileSync('cert.pem')
}, app);

const wss = new WebSocket.Server({ server });

if (isMainThread) {
    wss.on('connection', (ws, req) => {
        console.log('Client connected');

        const wsParams = req.url.split('/').pop();  // 解析参数
        const [wsParam1, wsParam2] = wsParams.split(',');  // 分隔参数
        console.log('Received parameters from WebSocket URL:', wsParam1, wsParam2);

        const worker = new Worker(__filename, { workerData: { wsParam1, wsParam2 } });

        ws.on('message', (data) => {
            worker.postMessage(data);
            console.log('Sent data to worker');
        });

        ws.on('close', () => {
            console.log('Client disconnected');
            worker.postMessage('close');
        });
    });

    server.listen(3000, () => {
        console.log('Server is running on port 3000');
    });
} else {
    const { wsParam1, wsParam2 } = workerData;
    const rtmpUrl = `rtmp://www.webrtcpush.website/${wsParam1}/${wsParam2}`;

    let ffmpegProcess;

    parentPort.on('message', (message) => {
        if (message === 'close') {
            if (ffmpegProcess) {
                ffmpegProcess.stdin.end();
                ffmpegProcess = null;
            }
        } else if (message instanceof Uint8Array) {
            if (!ffmpegProcess) {
                ffmpegProcess = spawn('ffmpeg', [
                    '-f', 'webm',
                    '-i', 'pipe:0',
                    '-c:v', 'libx264',
                    '-preset', 'ultrafast',
                    '-tune', 'zerolatency',
                    '-f', 'flv',
                    rtmpUrl,
                ]);

                ffmpegProcess.on('exit', () => {
                    parentPort.postMessage('close');
                });
            }

            ffmpegProcess.stdin.write(message);
            console.log('推流地址', rtmpUrl);
            console.log('推流成功', message);
        }
    });
}
