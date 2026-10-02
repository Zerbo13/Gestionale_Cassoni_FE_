import AnagraficaRisorse from '../../components/AnagraficaRisorse'

const campi = [
  {
    nome: 'targa',
    label: 'Targa',
    obbligatorio: true,
    maiuscolo: true
  },
  {
    nome: 'modello',
    label: 'Modello',
    obbligatorio: true
  },
  {
    nome: 'tipo',
    nomeRisposta: 'tipologia',
    nomePayload: 'tipo',
    label: 'Tipo',
    obbligatorio: true
  }
]

function AnagraficheMezzi() {
  return (
    <AnagraficaRisorse
      titolo="Mezzi"
      singolare="Mezzo"
      endpoint="mezzi"
      campi={campi}
      campoUnivoco="targa"
    />
  )
}

export default AnagraficheMezzi