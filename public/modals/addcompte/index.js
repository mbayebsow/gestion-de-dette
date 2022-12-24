
window.addEventListener("load", function () {
    var pk = new Piklor(".color-picker", [
            "red"
          , "Gold"
          , "#3498db"
          , "#9b59b6"
          , "Orange"
          , "SpringGreen"
        ], ), 
        colorView = pk.getElm("#colorView"),
        CouleurDuCompte = pk.getElm("#CouleurDuCompte");

    pk.colorChosen(function (col) {
        colorView.style.backgroundColor = col;
        CouleurDuCompte.value = col;
    });
});

document.getElementById("BtnAddCompte").onclick = function(){
    var NomDuCompte = document.getElementById('NomDuCompte').value;
    var SoldeDuCompte = document.getElementById('SoldeDuCompte').value;
    var CouleurDuCompte = document.getElementById('CouleurDuCompte').value;

    if(NomDuCompte == ""){
      return
    }
    if(SoldeDuCompte == ""){
        return
    }
    if(CouleurDuCompte == null){
        return
    }
    console.log(NomDuCompte)
    console.log(SoldeDuCompte)
    console.log(CouleurDuCompte)

}

// db.Comptes.insert(doc, function (err, newDoc) {   // Callback is optional
//     // newDoc is the newly inserted document, including its _id
//     // newDoc has no key called notToBeSaved since its value was undefined
// });
