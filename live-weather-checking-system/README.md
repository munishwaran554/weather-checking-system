# SkyCast — Live Weather Checking System

A responsive worldwide weather dashboard built with HTML, CSS and JavaScript. It uses the free Open-Meteo Geocoding and Forecast APIs. No API key is required.

## Features
- Search cities and areas around the world
- Current temperature, condition and feels-like temperature
- Humidity, wind speed and atmospheric pressure
- Local sunrise and sunset
- 24-hour hourly forecast
- 7-day forecast
- Browser location support (with permission)
- Responsive laptop and mobile layout

## Requirements
- Visual Studio Code
- Node.js (LTS version) installed
- Internet connection

## Run in VS Code terminal (Windows)
1. Extract the ZIP file.
2. Open Visual Studio Code.
3. Select **File → Open Folder** and open `live-weather-checking-system`.
4. Select **Terminal → New Terminal**.
5. Run:

   ```bash
   node -v
   ```

   If a version number appears, Node.js is installed.

6. Start the project:

   ```bash
   npm start
   ```

7. Open this address in your browser:

   `http://localhost:3000`

8. To stop the server, return to the terminal and press `Ctrl + C`.

## If npm is not working
This project has no third-party npm dependencies. You can start it directly with:

```bash
node server.js
```

If `node` is also not recognized, install the current Node.js LTS release from https://nodejs.org/, then close and reopen VS Code.

## API information
- Geocoding: `https://geocoding-api.open-meteo.com/v1/search`
- Forecast: `https://api.open-meteo.com/v1/forecast`
- Provider: https://open-meteo.com/

The displayed current conditions are the latest observations/model data returned by Open-Meteo; they are not guaranteed to be instantaneous readings from a physical weather station. Data availability and update frequency vary by location.

## Project structure
```text
live-weather-checking-system/
├── index.html
├── package.json
├── server.js
├── README.md
├── css/
│   └── style.css
└── js/
    └── app.js
```
