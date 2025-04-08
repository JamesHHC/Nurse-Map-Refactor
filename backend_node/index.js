const express = require('express');
const cors = require('cors');

require('dotenv').config();
global.config = require('./config.js');
const app = express();

// Functions for Google Sheets
const sheets = require('./scripts/google-sheets.js');


// Get complete nurse list
async function getNurses(req, res) {
	console.log('LOG// Serving request for nurse list');
	res.send(await sheets.getSheet());
}


// Set up CORS
app.use(cors({ redentials: true, optionSuccessStatus: 200 }));
app.use(function(req, res, next) {
	res.header('Access-Control-Allow-Origin');
	res.header('Access-Control-Allow-Headers', true);
	res.header('Access-Control-Allow-Credentials', true);
	res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
	next();
});

// API endpoints
app.get('/nurses', getNurses);

// Starts API server
app.listen(config.options.port, () => {
	console.log('\x1b[36m%s\x1b[0m', `API is running on port ${config.options.port}`);
});