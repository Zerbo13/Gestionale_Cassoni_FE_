import AnagraficaRisorse from '../../components/AnagraficaRisorse'

const campi = [
  {
    nome: 'nome',
    label: 'Nome',
    obbligatorio: true
  },
  {
    nome: 'cognome',
    label: 'Cognome',
    obbligatorio: true
  },
  {
    nome: 'nickname',
    label: 'Nickname',
    obbligatorio: true
  },
  {
    nome: 'password',
    label: 'Password',
    tipo: 'password',
    obbligatorio: (idModifica) =>
      idModifica === null,
    nonInviareSeVuoto: true,
    nascondiTabella: true
  },
  {
    nome: 'ruolo',
    label: 'Ruolo',
    tipo: 'select',
    obbligatorio: true,
    opzioni: [
      {
        valore: 'OPERAIO',
        label: 'Operaio'
      },
      {
        valore: 'ADMIN',
        label: 'Amministratore'
      }
    ]
  },
  {
    nome: 'mezzoId',
    label: 'Mezzo assegnato',
    tipo: 'select'
  }
]

function AnagraficheUtenti() {
  return (
    <AnagraficaRisorse
      titolo="Utenti"
      singolare="Utente"
      endpoint="utenti"
      campi={campi}
      campoUnivoco="nickname"
      gestioneUtente={true}
    />
  )
}

export default AnagraficheUtenti