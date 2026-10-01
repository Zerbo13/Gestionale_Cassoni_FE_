import { useEffect, useRef, useState } from 'react'

function SearchSelect({
  items,
  placeholder,
  getLabel,
  onSelect
}) {
  const [ricerca, setRicerca] = useState('')
  const [aperto, setAperto] = useState(false)

  const contenitoreRef = useRef(null)

  const risultati = items
    .filter((item) =>
      getLabel(item)
        .toLowerCase()
        .includes(ricerca.toLowerCase())
    )
    .slice(0, 10)

  useEffect(() => {
    const gestisciClickFuori = (e) => {
      if (
        contenitoreRef.current &&
        !contenitoreRef.current.contains(e.target)
      ) {
        setAperto(false)
      }
    }

    document.addEventListener(
      'mousedown',
      gestisciClickFuori
    )

    return () => {
      document.removeEventListener(
        'mousedown',
        gestisciClickFuori
      )
    }
  }, [])

  const selezionaElemento = (item) => {
    setRicerca(getLabel(item))
    setAperto(false)
    onSelect(item)
  }

  return (
    <div
      className="position-relative"
      ref={contenitoreRef}
    >
      <input
        type="text"
        className="form-control"
        value={ricerca}
        placeholder={placeholder}
        onChange={(e) => {
          setRicerca(e.target.value)
          setAperto(true)
        }}
        onFocus={() => setAperto(true)}
      />

      {aperto && (
        <div
          className="list-group position-absolute w-100 shadow"
          style={{
            zIndex: 1000,
            maxHeight: '250px',
            overflowY: 'auto'
          }}
        >
          {risultati.length > 0 ? (
            risultati.map((item) => (
              <button
                type="button"
                key={item.id}
                className="list-group-item list-group-item-action"
                onClick={() =>
                  selezionaElemento(item)
                }
              >
                {getLabel(item)}
              </button>
            ))
          ) : (
            <div className="list-group-item text-muted">
              Nessun risultato
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchSelect