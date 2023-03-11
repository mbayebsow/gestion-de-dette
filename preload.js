const { ipcRenderer } = require('electron')
const appConfig = require('./config')

window.addEventListener('DOMContentLoaded', () => {
  
  //Change application tiitle
  document.title = 'Bugget Management'

  //Error page reload again button press
  let tryagainbtn = document.getElementById("tryagain")
  tryagainbtn ? tryagainbtn.onclick = runc : false
  function runc() {
    ipcRenderer.send('online-status-changed', true)
  }

})