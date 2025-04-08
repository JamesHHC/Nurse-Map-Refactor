require('dotenv').config();
global.config = require('./config.js');

const request = require('request');

/*
	Gets values from Google Sheets, resolves clean JSON array
	Resolves null if something goes wrong
*/
async function getSheet() {
	return new Promise(resolve => {
		request({
			method: 'GET',
			url: 'https://sheets.googleapis.com/v4/spreadsheets/' + config.urls.sheetID + '/values/!A:O/?key=' + config.keys.sheet,
			headers: {
				'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
				'Content-Type': 'application/json; charset=utf-8',
			},
		}, async function(error, response, body) {
			try {
				const result = JSON.parse(body).values;
				const cleanArray = [];
				// Loop through each result (index 0 is comprised of column names)
				for (let i = 1; i < result.length; i++) {
					const aNurse = {};
					// Loop through each column title to create JSON keys
					for (let k = 0; k < result[0].length; k++) {
						// Value corresponding to current column title
						const cell = result[i][k];
						// Use title as key and assign corresponding value
						aNurse[result[0][k]] = (cell == undefined || cell.trim() == '') ? null : cell;
					}
					cleanArray.push(aNurse);
				}
				resolve(cleanArray);
			}
			catch (err) {
				console.log('\x1b[31m%s\x1b[0m', 'ERR || Failed to retrieve sheet', err);
				resolve(null);
			}
		});
	});
}