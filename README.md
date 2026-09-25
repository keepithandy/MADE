# MADE

**A Crime Dynasty Life Simulator** · v0.1.0

MADE is an original, offline-first life and organization simulator set in fictional New Carbone City. Build relationships, recruit a crew, grow legitimate businesses, shape district influence, and pass a complicated legacy to another generation. Criminal activity uses abstract management systems and narrative choices.

## Features

- Month-by-month calendar, aging, health, stress, and narrative decisions
- Eight city districts and three rival organizations
- Procedurally generated crew with loyalty, ambition, skills, and traits
- Family relationships, children, succession, and dynasty history
- Twenty business opportunities with revenue, expenses, and asset sales
- District influence, investigation pressure, and career progression
- Limited monthly actions, rival meetings, business upgrades, and manager appointments
- Thirty rotating opportunity templates and forty family relationship situations
- Abstract legal hearings, convictions, prison months, and return to play
- Chronological records, automatic browser saves, and JSON import/export

## Run locally

Double click index.html to play in a regular browser. No server, packages, account, backend, API keys, or network connection are needed.

## Controls and saves

Use the navigation bar for Life, Crew, City, Business, Money, Family, Records, and Dynasty. Buttons advance time, resolve decisions, or manage each system. Keyboard Tab and Enter work throughout.

Progress saves automatically in browser localStorage. The Money screen includes JSON export and version 1 import. Reset erases the active browser save.

## Project structure

```
MADE/
├── index.html          page shell and script loading order
├── css/
│   └── style.css       responsive visual system
├── js/
│   ├── data.js         districts, businesses, names, rivals, events, jobs
│   ├── app.js          state, simulation loop, rendering, saves
│   └── systems.js      legal, prison, action, business, diplomacy systems
├── server.mjs          optional local development server
└── build.mjs           package structure check
```

## Development notes

Built with vanilla JavaScript, HTML5, and CSS. The package is split into data, application, and connected systems files. Run node build.mjs to confirm the expected package files are present. The game version is 0.1.0 and the save schema is version 1. The game uses fictional, abstract mechanics and does not model real criminal procedures.
