const { ipcMain } = require('electron');

module.exports = [
    {label : 'Recharger', role : 'reload'},
    {label : 'Couper', role : 'cut'},
    {label : 'Copier', role : 'copy'},
    {label : 'Coller', role : 'paste'},
    {type  : 'separator' },
    {label : 'A Propos', click: () => { require('./main')("about") }},
]
