// Load JSONs
$.ajaxSetup({ async: false });
const config = $.getJSON('./config.json').responseJSON;
const icons = $.getJSON('./jsons/icons.json').responseJSON;
const keyIndx = $.getJSON('./jsons/key-index.json').responseJSON;
$.ajaxSetup({ async: true });

// Categories of nurses
const nurseCats = [
	"NO CATEGORY",
	"FULL / PART TIME",
	"NEWLY HIRED",
	"IDLE RN",
	"INFUSION RN"
];

// Nurse markers
const nurseMarkers = {};
// Nurse marker layers
const nurseLayers = [];
// Current searched address
const currentSearch = '';

/*
	Send GET request for list of nurses from Sheets
*/
function loadNurses() {
	return new Promise(resolve => {
		const sheetAPI = new XMLHttpRequest();
		sheetAPI.open('GET', 'http://' + config['nodeIP'] + ':' + config['nodePort'] + '/nurses', false);
		sheetAPI.setRequestHeader('Accept', 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8');
		sheetAPI.onreadystatechange = function() {
			if (this.readyState === 4) {
				if (this.response == null) return console.error("ERR// Null nurse list");
				resolve(JSON.parse(this.response));
			}
		}
		sheetAPI.send();
	});
}

/*
	TODO: Desc
*/
function mapNurses(nurses) {
	// Show loading overlay
	document.getElementById("page-loading").style.display = '';
	// Create layers for nurse categories
	for (let k = 0; k < nurseCats.length; k++) {
		nurseLayers.push(L.layerGroup().addTo(map_init));
	}
	let i = 0;
	const chunkSize = 100;
	function processChunk() {
		for (let j = 0; j < chunkSize && i < nurses.length; j++, i++) {
			// Get info from nurse
			const name = nurses[i][keyIndx.name];
			const lati = parseFloat(nurses[i][keyIndx.lat]);
			const long = parseFloat(nurses[i][keyIndx.long]);
			const cat = nurses[i][keyIndx.category] ? nurses[i][keyIndx.category].toUpperCase().trim() : "NO CATEGORY";

			// Get marker color based on category
            const mColor = getMarkerColor(cat);
            const marker = L.marker([lati, long], { icon: mColor }).bindPopup(name);
            // Set marker event listeners
            marker.on("click", markerClick);
            marker.on('mouseover', ev => ev.target.openPopup());
            marker.on('mouseout', ev => ev.target.closePopup());

            // Add marker to the appropriate category layer
            const categoryIndex = nurseCats.indexOf(cat);
            nurseLayers[categoryIndex === -1 ? nurseCats.indexOf("NO CATEGORY") : categoryIndex].addLayer(marker);            
            // Store the marker in nurseMarkers array
            nurseMarkers[i] = marker;
            // Call listNurse to update the nurse list UI
            listNurse(i, cat, nurses);
        }
		// If there's more data to process, continue processing the next chunk
		if (i < nurses.length) requestAnimationFrame(processChunk);
		// Hide loading spinner when processing is complete
		else document.getElementById('page-loading').style.display = 'none';
	}
	// Start processing the first chunk
    requestAnimationFrame(processChunk);
}

/*
	Gets marker color based on nurse category
*/
function getMarkerColor(cat) {
    switch(cat) {
        case 'FULL / PART TIME': return new L.icon(icons.greenIcon);
        case 'NEWLY HIRED': return new L.icon(icons.purpleIcon);
        case 'IDLE RN': return new L.icon(icons.greyIcon);
        case 'INFUSION RN': return new L.icon(icons.blackIcon);
        default: return new L.icon(icons.blueIcon);
    }
}

/*
	TODO: Desc
*/
function listNurse(i, cat, nurses) {
	const nurseList = document.getElementById("nurseList");
	const nurse = nurses[i];
	const address = nurse[keyIndx.addr];
	const googleLink = `https://www.google.com/maps/dir/?api=1&origin=${address}&destination=${currentSearch}`;
	// TODO: durDist
	const durDist = '';

	const categoryMap = {
		"FULL / PART TIME": "text-green",
		"NEWLY HIRED": "text-purple",
		"IDLE RN": "text-grey"
	};
	const colorTag = categoryMap[cat] || "";

	// Sanitize or handle undefined values
    const name = nurse[keyIndx.name] || "No Name";
    const category = nurse[keyIndx.category]?.toUpperCase().trim() || "NO CATEGORY";
    const activated = (category == "NEWLY HIRED" && nurse[keyIndx.activated]) ? ' - ' + nurse[keyIndx.activated] : '';
    const availability = nurse[keyIndx.availability] || "No availability provided";
    const notes = nurse[keyIndx.notes] || "No notes";
    const skills = nurse[keyIndx.skills] || "None";
    const training = nurse[keyIndx.training] || "None";
    const phone = nurse[keyIndx.phone] || "No phone provided";

    // Create list item as a DocumentFragment for efficient DOM manipulation
    const fragment = document.createDocumentFragment();
    const li = document.createElement("li");
    li.className = `list-group-item list_item ${cat.replace(/[\s\/]/g, "_").toUpperCase().trim()}`;
    li.id = `Nurse${i}`;
    li.setAttribute("onclick", `listItemClick(event, ${i})`);

    // Build inner HTML
    li.innerHTML = `
        <a id='Nurse${i}_n' style='font-size:130%'><strong class='${colorTag}'>${name}</strong></a> ${durDist}
        <small><div id='Nurse${i}_c' style='margin-bottom:2%'>${category}${activated}</div></small>
        <small><div style='color:red'><strong id='Nurse${i}_a'>${availability}</strong></div></small>
        <small><div class='p-1 border bg-light' style='margin-bottom:2%'><strong id='Nurse${i}_in'>${notes}</strong></div></small>
        <i class='fa fa-home' style='margin-right:2%'></i>${address}
        <br><i class='fa fa-phone' style='margin-right:2.8%'></i><a href='tel:${phone}'>${phone}</a>
        <div style='margin-top:2%'><small><strong>Skills:</strong></small></div>
        <div id='Nurse${i}_s'><small>${skills}</small></div>
        <div><small><strong>Training:</strong></small></div>
        <div id='Nurse${i}_t'><small>${training}</small></div>
        <a tabindex='-1' class='btn btn-primary mt-2 list_button' href='${googleLink}' target='_blank'>Directions</a>
        <button type='button' tabindex='-1' class='btn btn-outline-secondary mt-2 list_button' id='Nurse${i}_b' onclick='editListItem(${i})'>Edit</button>
        <button type='button' tabindex='-1' class='btn btn-outline-secondary mt-2 list_button reload' onclick='refreshSingleNurse(${i})'>&#x21bb;</button>
    `;

    // Append to the fragment and then to the list
    fragment.appendChild(li);
    nurseList.appendChild(fragment);
}

// TODO
/* Finds nurse corresponding to given marker */
function markerClick(e) {
	var lat = e["latlng"]["lat"];
	var lng = e["latlng"]["lng"];
	scrollToNurse(getNurseFromLatLng(lat, lng), true);
}

// TODO: getNurseFromLatLng

// TODO: scrollToNurse

// TODO: listItemClick

/*
	TODO: Desc
*/
async function loadAndMap() {
	const nurses = await loadNurses();
	mapNurses(nurses);
}

// Init map
const map_init = L.map('map', {
	center: [35.450321, -80.992538], // (Lat, Long)
	zoom: 7,
	attributionControl: false
});
// Create tile layers
const osm = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
	ext: 'png'
}).addTo(map_init);

// Load map
loadAndMap();