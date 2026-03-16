// This file exists to fix a misconfiguration on Render
// Render is currently set to run 'node expo-router/entry'
// We redirect this to the actual built server
require('../dist/server.js');
