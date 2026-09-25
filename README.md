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
- Chronological records, automatic browser saves, and JSON import/export

## Run locally

Double click index.html to play in a regular browser. No server, packages, account, backend, or API keys are needed. The optional typeface import falls back to system fonts offline.

## Controls and saves

Use the navigation bar for Life, Crew, City, Business, Money, Family, Records, and Dynasty. Buttons advance time, resolve decisions, or manage each system. Keyboard Tab and Enter work throughout.

Progress saves automatically in browser localStorage. The Money screen includes JSON export and version 1 import. Reset erases the active browser save.

## Project structure

- index.html — standalone, double-clickable game
- css/style.css — responsive interface
- js/app.js — simulation, actions, rendering, and saves
- js/data.js — districts, business offers, names, rivals, and event library
- server.mjs — optional local development server
- build.mjs — rebuilds the standalone index.html after source edits

## Development notes

Built with vanilla JavaScript, HTML5, and CSS. The standalone index.html bundles the source in js/data.js and js/app.js for local file use. Run node build.mjs after editing either source file. The game version is 0.1.0 and the save schema is version 1. The game uses fictional, abstract mechanics and does not model real criminal procedures.
