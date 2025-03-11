const express = require('express');
const path = require('path');
const cors = require("cors");

const { runMonteCarloSim } = require('./simulation/sim');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get("/", (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.get("/data", async (req, res) => {
    const data = runMonteCarloSim();
    res.status(200).json(data);
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
});