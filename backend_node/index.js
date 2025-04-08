const express = require('express');
const cors = require('cors');

require('dotenv').config();
global.config = require('./config.js');
const app = express();

// Functions for Google Sheets
const sheets = require('./scripts/google-sheets.js');

// Set up CORS
app.use(cors({
	redentials: true,
	optionSuccessStatus: 200
}));

// Starts API server
app.listen(config.options.port, () => {
	console.log('\x1b[36m%s\x1b[0m', `API is running on port ${config.options.port}`);
	console.log(sheets.getSheet());
});