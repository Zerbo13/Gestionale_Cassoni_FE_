import AnagraficaRisorse from '../../components/AnagraficaRisorse'

const campi = [
  {
    nome: 'nome',
    label: 'Nome',
    obbligatorio: true
  },
  {
    nome: 'indirizzo',
    label: 'Indirizzo',
    obbligatorio: true
  },
  {
    nome: 'tipologia',
    label: 'Tipologia',
    obbligatorio: true
  }
]

function AnagraficheLuoghi() {
  return (
    <AnagraficaRisorse
      titolo="Luoghi"
      singolare="Luogo"
      endpoint="luoghi"
      campi={campi}
    />
  )
}

export default AnagraficheLuoghi