const process = require('process');
module.exports = {
	keys: {
		// Sheets API key
		sheet: process.env.SHEET_KEY,
	},
	urls: {
		// Sheet ID for URL
		sheetID: process.env.SHEET_ID,
	}
}