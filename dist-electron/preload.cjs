"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { contextBridge } = require('electron');
contextBridge.exposeInMainWorld('electron', {
    versions: {
        node: process.versions.node,
        chrome: process.versions.chrome,
        electron: process.versions.electron,
    },
});
