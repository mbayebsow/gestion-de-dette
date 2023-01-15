const Datastore = require('nedb')
const os = require("os");
const userHomeDir = os.homedir();
const moment = require('moment')
moment.locale('fr');

dBComptes = new Datastore({filename: userHomeDir+'/.Teldoo/Budget\ management/Comptes.db', autoload: true});
dBTransactions = new Datastore({filename: userHomeDir+'/.Teldoo/Budget\ management/Transactions.db', autoload: true});
dBDues = new Datastore({filename: userHomeDir+'/.Teldoo/Budget\ management/Dues.db', autoload: true});
dBSettings = new Datastore({filename: userHomeDir+'/.Teldoo/Budget\ management/Settings.db', autoload: true});
dBClients = new Datastore({filename: userHomeDir+'/TPOS_data/db/Clients.db', autoload: true});
dBPaiements = new Datastore({filename: userHomeDir+'/.Teldoo/Budget\ management/Paiements.db', autoload: true});
dBDueOnDues = new Datastore({filename: userHomeDir+'/.Teldoo/Budget\ management/DueOnDues.db', autoload: true});

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
    cleActivation: '',
    activationSatus: '',
    modalAddCompte: false,
    modalAddTransaction: false,
    modalAddclients: false,
    modalAddDues: false,
    modalAddPaiementDues: false,
    modalAddSupplementDues: false,
    pageActive: 'dues',
    modalDueHistory: '',
    ClientView: '',
    TypeTransaction: '',
    CompteTransaction: '',
    TypeDue: '',
    searchclientsKeyword: '',
    searchDuesKeyword: '',
    selectedclientOnTransaction: '',
    ProccessusStats: '',
    OwnerData: '',
    soldeTotal: 0,
    comptes: [],
    transactions: [],
    dues: [],
    duesHistory: [],
    clients: [],
    paiements: [],
    supplements: [],
    notices: [],
    visible: [],
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
      const _this = this
      this.activationCheck().then(
        function(value) {
          _this.cleActivation = value
          _this.loadComptes()
          _this.loadClients()
          _this.loadPaiements()
          _this.loadSupplements()
          setTimeout(() => _this.loadTransactions(), 1000)
          setTimeout(() => _this.loadDues(), 1000)

          dBSettings.find({ Client: { $exists: true } }, function (err, docs) {
            if (docs.length > 0){
              _this.OwnerData = docs[0]
            }
          });
        },
        function(error) {
          _this.cleActivation = error
        }
      );
    },
    async activationCheck() {
      var x = new Promise((resolve,reject) => {
        dBSettings.find({ Key: { $exists: true } }, function (err, docs) {
          if (docs.length > 0 && docs[0].Key != null){
            resolve(docs[0].Key);
          }else{
            reject('NoKeyFound');
          }
        });
      })
      return await x
    },
    activationKey(){
      const _this = this
      var keyActivation = document.getElementById('keyActivation').value
      var myHeaders = new Headers();
      myHeaders.append("Authorization", "Basic bWlzZGVwOmNhcWt1My1tRWZ2ZWs=");

      var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
      };
      this.activationSatus = 'Verification de la clé d\'activation…'

      fetch("https://api.teldoogroup.com/49031/cles/"+keyActivation, requestOptions)
      .then((response) => {
        return response.json();
      })
      .then((result) => {
        if (result.status === 201){
          const suscription = result.data.suscription
          const found = suscription.find(element => element == 28490);
          if(found){
            getClientData(result.data.clientId, result.data.uuid)
          }else{
            _this.activationSatus = ''
            _this.add({type: 'error', text: 'Cette clé n\est pas autorisé pour ce logiciel.'})
            return
          }
        }else{
          _this.activationSatus = ''
          _this.add({type: 'error', text: 'Une érreur c\'est produit lors de l\activation. Vérifiez votre clé.'})
          return
        }
      })
      .catch(error => console.log('error', error));

      function getClientData(id,uuid){
        _this.activationSatus = 'Obtention des informations clients'
        fetch("https://api.teldoogroup.com/49031/clients/"+id, requestOptions)
        .then((response) => {
          return response.json();
        })
        .then((result) => {
          if (result.status === 201){
            _this.activationSatus = 'Enregistrement des informations.'
            dBSettings.insert({
              'Key': uuid,
              'Client': result.data.nom, 
              'Adresse': result.data.adresse,
              'Phone': result.data.phone,
              'Mail': result.data.email,
              'Societe': result.data.societe,
            }, function (err, newDoc) {
              if(err){console.log(err)}
              if(newDoc){
                _this.activationSatus = ''
                _this.add({type: 'success', text: 'Heureux de vous revoir '+result.data.nom})
                _this.loadDatas()
              }
            });
          }else{
            _this.activationSatus = ''
            _this.add({type: 'error', text: 'Une érreur c\'est produit lors de l\activation. Vérifiez votre clé.'})
            return
          }
        })
        .catch(error => console.log('error', error));
      }
    },
    loadComptes(){
      const _this = this
      dBComptes.find({}).sort({ Date: 1 }).exec(function (err, docs) {
        _this.comptes = docs
        _this.updateSoldeTotal()
      })
    },
    loadTransactions(){
      const _this = this
      dBTransactions.find({}).sort({ Date: -1 }).exec(function (err, docs) {
        _this.transactions = docs
      })
    },
    loadDues(){
      const _this = this
      dBDues.find({}).sort({ Date: -1 }).exec(function (err, docs) {
        _this.dues = docs
      })
    },
    loadClients(){
      const _this = this
      dBClients.find({}).sort({ Date: -1 }).exec(function (err, docs) {
        _this.clients = docs
      })
    },
    loadPaiements(){
      const _this = this
      dBPaiements.find({}).sort({}).exec(function (err, docs) {
        _this.paiements = docs
      })
    },
    loadSupplements(){
      const _this = this
      dBDueOnDues.find({}).sort({}).exec(function (err, docs) {
        _this.supplements = docs
      })
    },
    getclientData(object,id) {
      if (object == 'getData'){
        const rg = id ? new RegExp(id, "gi") : null;
        const obj = this.clients.find((p) => !rg || p._id.match(rg));
        return obj
      }
      const rg = this.searchclientsKeyword ? new RegExp(this.searchclientsKeyword, "gi") : null;
      return this.clients.filter((p) => !rg || p.Nom.match(rg));
    },
    getDueData(object,id) {
      if (object == 'getData'){
        const rg = id ? new RegExp(id, "gi") : null;
        const obj = this.dues.find((p) => !rg || p._id.match(rg));
        return obj
      }
      const rg = this.searchDuesKeyword ? new RegExp(this.searchDuesKeyword, "gi") : null;
      return this.dues.filter((p) => !rg || p.Motif.match(rg));
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
      //const rg = this.searchclientsKeyword ? new RegExp(this.searchclientsKeyword, "gi") : null;
      //return this.clients.filter((p) => !rg || p.Nom.match(rg));
    },
    async getDueHistory(id){
      var PaiementsHistory = this.paiements.filter(function (el){
        return el.DueId == id
      });
      var DueOnDuesHistory = this.supplements.filter(function (el){
        return el.DueId == id
      });
      const dueHistory = PaiementsHistory.concat(DueOnDuesHistory);
      const dueHistorySort = dueHistory.sort(function(a,b){return new Date(b.Date) - new Date(a.Date) })
      this.duesHistory = dueHistorySort
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
      const obj = this.paiements.filter(function(hero) { return hero.DueId == id });
      const sumArr = obj.reduce((a, b) => a + b.Montant, 0)
      return sumArr

      //dBDues.update({ _id: id},{ $set: { Statut: value} },{}, function (err, numReplaced) {
      //  if (err) _this.add({type: 'error', text: 'Erreur de mise a jour de la transaction.'})
      //  if(numReplaced){
      //    dBDues.loadDatabase();
      //    _this.add({type: 'success', text: 'Transaction mise a jour avec succes.'})
      //    _this.loadDues()
      //  }
      //})
    },
    CheckSupplements(id){
      const obj = this.supplements.filter(function(hero) { return hero.DueId == id });
      const sumArr = obj.reduce((a, b) => a + b.Montant, 0)
      return sumArr
    },
    TotalDue(id){
      const obj = this.dues.filter(function(Due) { return Due.client == id && Due.DueType == 'entrant'});
      const sumArr = obj.reduce((a, b) => a + b.Montant, 0)
      return sumArr
    },
    async updateComptes(id, object, value, in_out){
      const _this = this
      var x = new Promise((resolve,reject) => {
        if(object == 'Solde'){
          dBComptes.findOne({ _id: id }, function (err, doc) {
            if (err) {
              reject('Aucun compte trouver pour cette transaction.');
              return
            }
            if (value > doc.Solde && in_out == 'out'){
              reject('Le montant est supperieur au solde du compte selectionner.');
              return
            }
            var DernierSolde
            if(in_out == 'in'){
              DernierSolde = Number(doc.Solde) + Number(value)
            }
            if(in_out == 'out'){
              DernierSolde = Number(doc.Solde) - Number(value)
            }
            dBComptes.update({ _id: id},{ $set: { Solde: DernierSolde} },{}, function (err, numReplaced) {
              if (err){
                reject('Erreur de mise a jour des données de l\'action.');
                return
              }
              if(numReplaced){
                dBComptes.loadDatabase();
                _this.loadComptes()
                resolve('ok');
              }
            })
          });
        }
      });
      return await x
    },
    async updateDueMontant(id, value, in_out){
      const _this = this
      var x = new Promise((resolve,reject) => {
        dBDues.findOne({ _id: id }, function (err, doc) {
          if (err) {
            reject('Aucune acton trouver.');
            return 
          }
          if (value > doc.Montant && in_out == 'out'){
            reject('Le montant entrer est supperieur au montant due.');
            return
          }
          var newDuesMontant
          if(in_out == 'in'){
            newDuesMontant = Number(doc.Montant) + Number(value)
          }
          if(in_out == 'out'){
            newDuesMontant = Number(doc.Montant) - Number(value)
          }
          dBDues.update({ _id: id},{ $set: { Montant: newDuesMontant} },{}, function (err, numReplaced) {
            if (err){
              reject('Erreur de mise a jour des données de l\'action.');
              return
            }
            if(numReplaced){
              dBDues.loadDatabase();
              _this.loadDues()
              resolve('ok');
            }
          })
        });
      });
      return await x
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
    
      dBComptes.insert({
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
        dBComptes.remove({ _id: compte._id }, {}, function (err, numRemoved) {
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
      if(this.CompteTransaction == ''){
        this.add({type: 'error', text: 'Oops, vous devez selectionner un Compte.'})
        return
      }

      dBComptes.findOne({ _id: _this.CompteTransaction }, function (err, doc) {
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
        _this.insertTransaction(MotifTransaction, MontantTransaction, _this.TypeTransaction, _this.CompteTransaction, _this.selectedclientOnTransaction)
      });
    },
    async addPaiement(){
      var Montantpaiement = Number(document.getElementById('Montantpaiement').value)
      if(Montantpaiement == ''){
        this.add({type: 'error', text: 'Entrer le montant du paiement.'})
        return
      }
      if(this.CompteTransaction == ''){
        this.add({type: 'error', text: 'Selectionner un compte svp.'})
        return
      }
      if(this.modalDueHistory.DueType == 'entrant') in_out = 'in'
      if(this.modalDueHistory.DueType == 'sortant') in_out = 'out'
      try {
          var updateDueMontant = await this.updateDueMontant(this.modalDueHistory._id, Montantpaiement, 'out')
          var updateComptes = await this.updateComptes(this.CompteTransaction, 'Solde', Montantpaiement, in_out,)
          if(updateDueMontant === 'ok' && updateComptes === 'ok') this.insertPaiement(Montantpaiement)
      } catch (error) {
        this.add({type: 'error', text: error})
      }
    },
    async addSupplement(){
      var MontantSupplement = Number(document.getElementById('MontantSupplement').value)
      var NoteSupplement = document.getElementById('NoteSupplement').value
      if(MontantSupplement == ''){
        this.add({type: 'error', text: 'Entrer le montant du Supplement.'})
        return
      }
      try {
          var updateDueMontant = await this.updateDueMontant(this.modalDueHistory._id, MontantSupplement, 'in')
          if(updateDueMontant === 'ok') {
            const _this = this
            dBDueOnDues.insert({
              'DueId': this.modalDueHistory._id,
              'Montant': Number(MontantSupplement),
              'Note': NoteSupplement,
              'Date': new Date().toISOString(),
            }, function (err, newDoc) {  
              if(err){console.log(err)}
              if(newDoc){
                _this.loadDues()
                _this.loadSupplements()
                setTimeout(() => _this.getDueHistory(_this.modalDueHistory._id), 1000)
                _this.add({type: 'success', text: 'Supplement ajouter avec succes.'})
                _this.modalAddSupplementDues = false
                document.getElementById('MontantSupplement').value = null
                document.getElementById('NoteSupplement').value = null
              }
            });
          }
      } catch (error) {
        error
        this.add({type: 'error', text: error})
      }
    },
    addClient(){
      const _this = this
      var PrenomClient = document.getElementById('PrenomClient').value;
      var NomClient = document.getElementById('NomClient').value;
      var TelephoneClient = document.getElementById('TelephoneClient').value;
      var AdresseClient = document.getElementById('AdresseClient').value;

      if(PrenomClient == ""){
        this.add({type: 'error', text: 'Entrer le Prenom du clients.'})
        return
      }
      if(NomClient == ""){
        this.add({type: 'error', text: 'Entrer le nom du clients.'})
        return
      }
      if(TelephoneClient == ""){
        this.add({type: 'error', text: 'Entrer le numéro du clients.'})
        return
      }
      dBClients.insert({
        'Prenom': PrenomClient,
        'Nom': NomClient,
        'Telephone': TelephoneClient,
        'Adresse': AdresseClient,
        'Date': new Date().toISOString(),
      });
      this.add({type: 'success', text: 'Client ajouté'})
      document.getElementById('PrenomClient').value = null;
      document.getElementById('NomClient').value = null;
      document.getElementById('TelephoneClient').value = null;
      document.getElementById('AdresseClient').value = null;
      this.loadClients()
    },
    saveEditClient(id){
      const _this = this
      var PrenomClientEdit = document.getElementById('PrenomClientEdit').value;
      var NomClienEditt = document.getElementById('NomClienEditt').value;
      var TelephoneClientEdit = document.getElementById('TelephoneClientEdit').value;
      var AdresseClientEdit = document.getElementById('AdresseClientEdit').value;

      dBClients.update( { _id: id }, {
        $set: { 
          Prenom: PrenomClientEdit,
          Nom: NomClienEditt,
          Telephone: TelephoneClientEdit,
          Adresse: AdresseClientEdit,
        }},
        {},
        function (err, numReplaced) {
          if(numReplaced == 1){
            _this.add({type: 'success', text: PrenomClientEdit+' modifier avec succes.'})
            _this.loadClients()
            _this.ClientView = ''
            dBClients.loadDatabase();
          }
        }
      );
    },
    deleteCLient(id, name) {
      const _this = this
      if (confirm('Voullez vous vraiment supprimer '+name) == true) {
        dBClients.remove({ _id: id }, {}, function (err, numRemoved) {
          if(numRemoved ==1) {
            _this.loadClients()
            _this.ClientView = ''
          }
        });
      } else {
        return
      }
    },
    insertTransaction(Motif, Montant, Type, Compte, client){
      const _this = this
      dBTransactions.insert({
        'Motif': Motif, 
        'Montant': Number(Montant),
        'Type': Type,
        'Compte': Compte,
        'client': client,
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
          _this.selectedclientOnTransaction = null
          document.getElementById('MotifTransaction').value = null;
          document.getElementById('MontantTransaction').value = null;
        }
      });
    },
    addDue(){
      const _this = this
      var DueMotif = document.getElementById('DueMotif').value;
      var DueMontant = Number(document.getElementById('DueMontant').value);

      if(DueMotif == ""){
        this.add({type: 'error', text: 'Motif de la Transaction ne peut pas etre vide.'})
        return
      }
      if(DueMontant == ""){
        this.add({type: 'error', text: 'Oops, vous avez oblier de mettre un Montant.'})
        return
      }
      if(this.TypeDue == ""){
        this.add({type: 'error', text: 'Choisissez une de ces options: "Je dois a quelqu\'un" ou "Quelqu\'un me dois".'})
        return
      }
      if(this.selectedclientOnTransaction == ""){
        this.add({type: 'error', text: 'Selectionner un client svp.'})
        return
      }
      dBDues.insert({
        'Motif': DueMotif, 
        'Montant': Number(DueMontant),
        'DueType': _this.TypeDue,
        'client': _this.selectedclientOnTransaction,
        'Closed': false,
        'Date': new Date().toISOString(),
      }, function (err, newDoc) {  
         if(err){console.log(err)}
         if(newDoc){
          _this.loadDues()
          _this.add({type: 'success', text: 'Transaction ajouter avec succes.'})
          _this.TypeDue = null
          _this.selectedclientOnTransaction = null
          document.getElementById('DueMotif').value = null;
          document.getElementById('DueMontant').value = null;
        }
      });
    },
    deleteDue(id) {
      const _this = this
      if (confirm('Voullez vous vraiment supprimer') == true) {
        dBDues.remove({ _id: id }, {}, function (err, numRemoved) {
          if(numRemoved ==1) {
            _this.loadDues()
          }
        });
      } else {
        return
      }
    },
    closeDue(id){
      const _this = this
      dBDues.update( { _id: id }, {
        $set: { 
          Closed: true,
        }},
        {},
        function (err, numReplaced) {
          if(numReplaced == 1){
            _this.add({type: 'success', text: 'Due férmer avec succes.'})
            _this.loadDues()
            dBDues.loadDatabase();
          }
        }
      );
    },
    insertPaiement(Montant){
      const _this = this
      dBPaiements.insert({
        'DueId': this.modalDueHistory._id,
        'Montant': Number(Montant),
        'Compte': this.CompteTransaction,
        'Date': new Date().toISOString(),
      }, function (err, newDoc) {  
         if(err){console.log(err)}
         if(newDoc){
          _this.loadDues()
          _this.loadPaiements()
          setTimeout(() => _this.getDueHistory(_this.modalDueHistory._id), 1000)
          _this.add({type: 'success', text: 'Paiement ajouter avec succes.'})
          _this.CompteTransaction = ''
          _this.modalAddPaiementDues = false
          document.getElementById('Montantpaiement').value = null
        }
      });
    },
  };
  return app;
}
