const express = require('express');
const traceroute = require('traceroute');
const speedTest = require('speedtest-net');
const { exec } = require('child_process');
const cors = require('cors');

const app = express();
app.use(cors());
const port = 3000;

// Port Scan Endpoint
app.get('/port-scan', (req, res) => {
    const ip = req.query.ip;
    const port = parseInt(req.query.port);
    if (!ip || !port) return res.status(400).json({ error: "IP and port required" });

    exec(`nc -zv ${ip} ${port}`, (error) => {
        if (error) {
            res.json({ open: false });
        } else {
            res.json({ open: true });
        }
    });
});

// Traceroute Endpoint
app.get('/traceroute', (req, res) => {
    const ip = req.query.ip;
    if (!ip) return res.status(400).json({ error: "IP required" });

    traceroute.trace(ip, (err, hops) => {
        if (err) return res.status(500).json({ error: "Traceroute failed" });
        res.json({ hops: hops.map(hop => Object.keys(hop)[0] || "Unknown") });
    });
});

// Speed Test Endpoint
app.get('/speed-test', (req, res) => {
    const test = speedTest({ acceptLicense: true, acceptGdpr: true });
    test.on('data', data => {
        res.json({
            download: data.speeds.download,
            upload: data.speeds.upload
        });
    });
    test.on('error', err => {
        res.status(500).json({ error: "Speed test failed" });
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
