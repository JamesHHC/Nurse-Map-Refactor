const process = require('process');
module.exports = {
	keys: {
		// Sheets API key
		sheet: process.env.SHEET_KEY,
	},
	urls: {
		// Sheet ID for URL
		sheetID: process.env.SHEET_ID,
	},
	options: {
		// Port for node server
		port: 3000,
		// IP for ORS instance
		orsIP: process.env.ORS_IP,
		// Port for ORS instance
		orsPort: 8080,
	},
}