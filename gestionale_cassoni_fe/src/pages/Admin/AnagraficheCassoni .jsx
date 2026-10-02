import AnagraficaRisorse from '../../components/AnagraficaRisorse'

const campi = [
  {
    nome: 'codiceCassone',
    label: 'Codice cassone',
    obbligatorio: true,
    maiuscolo: true
  },
  {
    nome: 'tipologia',
    label: 'Tipologia',
    obbligatorio: true
  },
  {
    nome: 'colore',
    label: 'Colore',
    obbligatorio: true
  },
  {
    nome: 'misura',
    label: 'Misura',
    obbligatorio: true
  },
  {
    nome: 'capacita',
    nomePayload: 'capacità',
    nomeRisposta: 'capacità',
    label: 'Capacità',
    obbligatorio: true
  }
]

function AnagraficheCassoni() {
  return (
    <AnagraficaRisorse
      titolo="Cassoni"
      singolare="Cassone"
      endpoint="cassoni"
      campi={campi}
      campoUnivoco="codiceCassone"
      posizioneIniziale={true}
    />
  )
}

export default AnagraficheCassoni