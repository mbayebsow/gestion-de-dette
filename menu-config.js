
module.exports = [
    {
        label: 'Teldoo Budget',
        submenu: [
            {label : 'Home', click : () => { require('./main')("home") }},
            {label : 'À propos', click : () => { require('./main')("about") }},
            {label : 'Quitter', role : 'quit'},
        ]
    },
]
