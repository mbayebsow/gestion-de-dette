const { Console } = require('console');
const Datastore = require('nedb')
const os = require("os");
const userHomeDir = os.homedir();

db = {};
db.Comptes = new Datastore(userHomeDir+'/.Teldoo/Budget\ management/Comptes.db');
db.Transactions = new Datastore(userHomeDir+'/.Teldoo/Budget\ management/Transactions.db');
db.Dues = new Datastore(userHomeDir+'/.Teldoo/Budget\ management/Dues.db');
db.Settings = new Datastore(userHomeDir+'/.Teldoo/Budget\ management/Settings.db');
db.Personnes = new Datastore(userHomeDir+'/.Teldoo/Budget\ management/Personnes.db');
db.Paiements = new Datastore(userHomeDir+'/.Teldoo/Budget\ management/Paiements.db');

db.Comptes.loadDatabase();
db.Transactions.loadDatabase();
db.Dues.loadDatabase();
db.Settings.loadDatabase();
db.Personnes.loadDatabase();
db.Paiements.loadDatabase();

moment.locale('fr'); 
UPLOADCARE_LOCALE = "fr"

window.addEventListener("load", function () {
  var pk = new Piklor(".color-picker", ["red", "Gold", "#3498db", "#9b59b6", "Orange", "SpringGreen"], ), 
      colorView = pk.getElm("#colorView"),
      CouleurDuCompte = pk.getElm("#CouleurDuCompte");
  pk.colorChosen(function (col) {
      colorView.style.backgroundColor = col;
      CouleurDuCompte.value = col;
  });
});

function initApp() {
  const app = {
    modalAddCompte: false,
    modalAddTransaction: false,
    modalAddPersonnes: false,
    modalAddDuePaiment: '',
    TypeTransaction: '',
    CompteTransaction: '',
    TypeDue: '',
    searchPersonnesKeyword: '',
    selectedPersonneOnTransaction: '',
    TypePaiement: '',
    ProccessusStats: '',
    soldeTotal: 0,
    comptes: [],
    transactions: [],
    dues: [],
    personnes: [],
    paiements: [],
    notices: [],
    visible: [],
    timetry: true,
    add(notice) {
      notice.id = Date.now()
      this.notices.push(notice)
      this.fire(notice.id)
    },
    fire(id) {
      this.visible.push(this.notices.find(notice => notice.id == id))
      const timeShown = 5000 * this.visible.length
      setTimeout(() => {
        this.remove(id)
      }, timeShown)
    },
    remove(id) {
      const notice = this.visible.find(notice => notice.id == id)
      const index = this.visible.indexOf(notice)
      this.visible.splice(index, 1)
    },
    loadDatas(){
      var deadline = new Date("Dec 30, 2022 17:16:00").getTime();
      var now = new Date().getTime();
      var t = deadline - now;
      if (t < 0) {
        this.timetry = false.
        return
      }
      this.loadComptes()
      this.loadPersonnes()
      this.loadPaiements()
      setTimeout(() => this.loadTransactions(), 1000)
      setTimeout(() => this.loadDues(), 1000)
    },
    loadComptes(){
      const _this = this
      db.Comptes.find({}).sort({ Date: 1 }).exec(function (err, docs) {
        _this.comptes = docs
        _this.updateSoldeTotal()
      })
    },
    loadTransactions(){
      const _this = this
      db.Transactions.find({}).sort({ Date: -1 }).exec(function (err, docs) {
        _this.transactions = docs
      })
    },
    loadDues(){
      const _this = this
      db.Dues.find({}).sort({ Date: -1 }).exec(function (err, docs) {
        _this.dues = docs
      })
    },
    loadPersonnes(){
      const _this = this
      db.Personnes.find({}).sort({ Date: -1 }).exec(function (err, docs) {
        _this.personnes = docs
      })
    },
    loadPaiements(){
      const _this = this
      db.Paiements.find({}).sort({}).exec(function (err, docs) {
        _this.paiements = docs
      })
    },
    getPersonneData(object,id) {
      if (object == 'getData'){
        const rg = id ? new RegExp(id, "gi") : null;
        const obj = this.personnes.find((p) => !rg || p._id.match(rg));
        return obj
      }
      const rg = this.searchPersonnesKeyword ? new RegExp(this.searchPersonnesKeyword, "gi") : null;
      return this.personnes.filter((p) => !rg || p.Nom.match(rg));
    },
    getCompteData(object, id){
      if (object == 'AllNames'){
        var str = this.comptes.map(function(elem){
          return elem.Nom;
        }).join(" + ");
        return str
      }

      if (object == 'getData'){
        const rg = id ? new RegExp(id, "gi") : null;
        const obj = this.comptes.find((p) => !rg || p._id.match(rg));
        return obj
      }
      //const rg = this.searchPersonnesKeyword ? new RegExp(this.searchPersonnesKeyword, "gi") : null;
      //return this.personnes.filter((p) => !rg || p.Nom.match(rg));
    },
    transactionsFiltre(type) {
      const rg = type ? new RegExp(type, "gi") : null;
      return this.transactions.filter((p) => !rg || p.Type.match(rg))
    },
    updateSoldeTotal(){
      let soldet = 0;
      this.comptes.forEach(compte => {
        soldet += compte.Solde;
      });
      this.soldeTotal = soldet
    },
    numberFormat(number) {
      return (number || "")
        .toString()
        .replace(/^0|\./g, "")
        .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
    },
    priceFormat(number) {
      return number ? `${this.numberFormat(number)} FCFA` : `0 FCFA`;
    },
    CheckPaiement(id){
      const obj = this.paiements.filter(function(hero) { return hero.Transaction_id == id });
      const sumArr = obj.reduce((a, b) => a + b.Montant, 0)
      return sumArr

      //db.Dues.update({ _id: id},{ $set: { Statut: value} },{}, function (err, numReplaced) {
      //  if (err) _this.add({type: 'error', text: 'Erreur de mise a jour de la transaction.'})
      //  if(numReplaced){
      //    db.Dues.loadDatabase();
      //    _this.add({type: 'success', text: 'Transaction mise a jour avec succes.'})
      //    _this.loadDues()
      //  }
      //})
    },
    updateComptes(id, object, value, in_out, processusAfterCompleted){
      const _this = this
      if(object == 'Solde'){
        db.Comptes.findOne({ _id: id }, function (err, doc) {
          if (err) {
            _this.add({type: 'error', text: 'Aucun compte trouver pour cette transaction.'})
            return
          }
          if (value > doc.Solde && in_out == 'out'){
            _this.add({type: 'error', text: 'Le montant est supperieur au solde du compte selectionner.'})
            return
          }
          var DernierSolde
          if(in_out == 'in'){
            DernierSolde = Number(doc.Solde) + Number(value)
          }
          if(in_out == 'out'){
            DernierSolde = Number(doc.Solde) - Number(value)
          }
          db.Comptes.update({ _id: id},{ $set: { Solde: DernierSolde} },{}, function (err, numReplaced) {
            if (err) _this.add({type: 'error', text: 'Erreur de mise a jour des données du compte.'})
            if(numReplaced){
              db.Comptes.loadDatabase();
              //_this.add({type: 'success', text: 'Données du compte mise a jour avec succes.'})
              _this.loadComptes()
              if(processusAfterCompleted == 'insertPaiement') _this.insertPaiement(value)
            }
          })
        });
      }
    },
    addCompte(){
      const _this = this
      var NomDuCompte = document.getElementById('NomDuCompte').value;
      var SoldeDuCompte = document.getElementById('SoldeDuCompte').value;
      var CouleurDuCompte = document.getElementById('CouleurDuCompte').value;
  
      if(NomDuCompte == ""){
        this.add({type: 'error', text: 'Le nom du compte ne peut pas etre vide.'})
        return
      }
      if(SoldeDuCompte == ""){
        this.add({type: 'error', text: 'Oops, vous avez oblier de mettre le solde.'})
        return
      }
      if(CouleurDuCompte == null){
        this.add({type: 'error', text: 'Selectionner une couleur.'})
        return
      }
    
      db.Comptes.insert({
        'Nom': NomDuCompte, 
        'Solde': Number(SoldeDuCompte),
        'Couleur': CouleurDuCompte,
        'Date': new Date().toISOString(),
        'DernierMaj': new Date().toISOString(),
      }, function (err, newDoc) {  
         if(err){console.log(err)}
         if(newDoc){
          _this.add({type: 'success', text: 'Compte ajouter avec succes.'})
          _this.loadComptes()
          document.getElementById('NomDuCompte').value = null;
          document.getElementById('SoldeDuCompte').value = null;
          document.getElementById('CouleurDuCompte').value = null;
        }
      });
    },
    deleteCompte(compte) {
      const _this = this
      if (confirm('Voullez vous vraiment supprimer '+compte.Nom) == true) {
        db.Comptes.remove({ _id: compte._id }, {}, function (err, numRemoved) {
          if(numRemoved ==1) {
            _this.loadComptes()
          }
        });
      } else {
        return
      }
    },
    addTransaction(){
      const _this = this
      var MotifTransaction = document.getElementById('MotifTransaction').value;
      var MontantTransaction = Number(document.getElementById('MontantTransaction').value);

      if(MotifTransaction == ""){
        this.add({type: 'error', text: 'Motif de la Transaction ne peut pas etre vide.'})
        return
      }
      if(MontantTransaction == ""){
        this.add({type: 'error', text: 'Oops, vous avez oblier de mettre un Montant.'})
        return
      }
      if(this.TypeTransaction == ""){
        this.add({type: 'error', text: 'Selectionner le type de transaction.'})
        return
      }

      if (_this.TypeTransaction == 'Due'){
        if(this.TypeDue == ''){
          this.add({type: 'error', text: 'Selectionner "Je dois a quelqu\'un" ou "Quelqu\'un me dois".'})
          return
        }
        this.insertDue(MotifTransaction, MontantTransaction, this.TypeDue, this.selectedPersonneOnTransaction)
      }

      if (_this.TypeTransaction != 'Due'){
        if(this.CompteTransaction == ''){
          this.add({type: 'error', text: 'Oops, vous devez selectionner un Compte.'})
          return
        }
        db.Comptes.findOne({ _id: _this.CompteTransaction }, function (err, doc) {
          if (MontantTransaction > doc.Solde && _this.TypeTransaction == 'Depense'){
            _this.add({type: 'error', text: 'Le montant est supperieur au solde du compte selectionner.'})
            return
          }
          var DernierSolde
          if(_this.TypeTransaction == 'Recette'){
            DernierSolde = doc.Solde + MontantTransaction
          }
          if(_this.TypeTransaction == 'Depense'){
            DernierSolde = doc.Solde - MontantTransaction
          }
          _this.insertTransaction(MotifTransaction, MontantTransaction, _this.TypeTransaction, _this.CompteTransaction, _this.selectedPersonneOnTransaction)
        });
      }
    },
    addPaiement(){
      this.CheckPaiement(this.modalAddDuePaiment._id)

      var Montantpaiement = Number(document.getElementById('Montantpaiement').value)
      var ValeurAPayer = Number(document.getElementById('ValeurAPayer').value)
      if(this.TypePaiement == ''){
        this.add({type: 'error', text: 'Le paiement doit être complet ou partiel.'})
        return
      }
      if(this.TypePaiement == 'partiel' && Montantpaiement == ''){
        this.add({type: 'error', text: 'Entrer le montant du paiement.'})
        return
      }
      if(this.TypePaiement == 'partiel' && Montantpaiement > ValeurAPayer){
        this.add({type: 'error', text: 'Le montant saisie ne peut pas être supperieur au montant due ou restant.'})
        return
      }
      if(this.CompteTransaction == ''){
        this.add({type: 'error', text: 'Selectionner un compte svp.'})
        return
      }
      if(this.TypePaiement == 'complet') Montant = ValeurAPayer
      if(this.TypePaiement == 'partiel') Montant = Montantpaiement
      if(this.modalAddDuePaiment.DueType == 'entrant') in_out = 'in'
      if(this.modalAddDuePaiment.DueType == 'sortant') in_out = 'out'
      this.updateComptes(this.CompteTransaction, 'Solde', Montant, in_out, 'insertPaiement')
    },
    addPersonne(){
      const _this = this
      var NomPersonne = document.getElementById('NomPersonne').value;
      var NumeroPersonne = document.getElementById('NumeroPersonne').value;
  
      if(NomPersonne == ""){
        this.add({type: 'error', text: 'Entrer le nom de la personne à ajouter.'})
        return
      }
      db.Personnes.insert({
        'Nom': NomPersonne, 
        'Numero': NumeroPersonne,
        'Date': new Date().toISOString(),
      }, function (err, newDoc) {  
         if(err) _this.add({type: 'error', text: 'Erreur - '+err})
         if(newDoc){
          _this.add({type: 'success', text: NomPersonne+' ajouter avec succes.'})
          _this.loadPersonnes()
          _this.modalAddPersonnes = false
          document.getElementById('NomPersonne').value = null;
          document.getElementById('NumeroPersonne').value = null;
        }
      });
    },
    insertTransaction(Motif, Montant, Type, Compte, Personne){
      const _this = this
      db.Transactions.insert({
        'Motif': Motif, 
        'Montant': Number(Montant),
        'Type': Type,
        'Compte': Compte,
        'Personne': Personne,
        'Date': new Date().toISOString(),
      }, function (err, newDoc) {  
         if(err){console.log(err)}
         if(newDoc){
          _this.add({type: 'success', text: 'Transaction ajouter avec succes.'})
          if(Type == 'Recette') in_out = 'in'
          if(Type == 'Depense') in_out = 'out'
          _this.updateComptes(Compte, 'Solde', Montant, in_out, '')
          _this.loadTransactions()
          _this.TypeTransaction = null
          _this.CompteTransaction = null
          _this.selectedPersonneOnTransaction = null
          document.getElementById('MotifTransaction').value = null;
          document.getElementById('MontantTransaction').value = null;
        }
      });
    },
    insertDue(Motif, Montant, Type, Personne){
      const _this = this
      db.Dues.insert({
        'Motif': Motif, 
        'Montant': Number(Montant),
        'Type': 'Due',
        'DueType': Type,
        'Personne': Personne,
        'Statut': 'incomplet',
        'Rappel': false,
        'Date': new Date().toISOString(),
      }, function (err, newDoc) {  
         if(err){console.log(err)}
         if(newDoc){
          _this.loadDues()
          _this.add({type: 'success', text: 'Transaction ajouter avec succes.'})
          _this.TypeTransaction = null
          _this.CompteTransaction = null
          _this.selectedPersonneOnTransaction = null
          document.getElementById('MotifTransaction').value = null;
          document.getElementById('MontantTransaction').value = null;
        }
      });
    },
    insertPaiement(Montant){
      const _this = this
      db.Paiements.insert({
        'Transaction_id': this.modalAddDuePaiment._id,
        'Montant': Number(Montant),
        'TypePaiement': this.TypePaiement,
        'Compte': this.CompteTransaction,
        'Date': new Date().toISOString(),
      }, function (err, newDoc) {  
         if(err){console.log(err)}
         if(newDoc){
          _this.loadDues()
          _this.loadPaiements()
          _this.add({type: 'success', text: 'Paiement ajouter avec succes.'})
          _this.TypePaiement = ''
          _this.CompteTransaction = ''
          _this.modalAddDuePaiment = false
          document.getElementById('Montantpaiement').value = null
          document.getElementById('ValeurAPayer').value = null
        }
      });
    },
  };
  return app;
}
