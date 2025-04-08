# Nurse Map | Helms Home Care

A web application for tracking nurse locations and storing a variety of information regarding those nurses. Data is pulled in real time to ensure all the information being displayed is the most up to date. Additional functionality includes locating nurses within a given radius of an address, plotting routes between nurses and a provided address, syncing editable information between users, and filtering nurses based on a variety of criteria.

## backend_node

Use command "npm install" to set up node modules.

#### Required files:
`.env`
```.env
# KEYS #############

# Sheets API key
SHEET_KEY="XX"

# URLS #############

# Sheet ID for URL
SHEET_ID="XX"

# IPS ##############

# IP for Open Route Service instance
ORS_IP="XX"
```

## frontend_files

#### Required files:
`config.json`
```.json
{
  "helpLink": "XX",
  "nodeIP": "XX",
  "nodePort": "XX"
}
```
