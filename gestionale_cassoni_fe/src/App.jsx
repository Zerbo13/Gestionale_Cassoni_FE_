import { Routes, Route } from 'react-router-dom'

import Login from './pages/Login'
import OperaioDashboard from './pages/Operaio/OperaioDashboard'
import StoricoViaggi from './pages/Operaio/StoricoViaggi'
import AdminDashboard from './pages/Admin/AdminDashboard.jsx'
import RiepilogoViaggi from './pages/Admin/RiepilogoViaggi'
import PosizioniCassoni from './pages/Admin/PosizioniCassoni.jsx'
import Anagrafiche from './pages/Admin/Anagrafiche.jsx'
import AnagraficheUtenti from './pages/Admin/AnagraficheUtenti.jsx'
import AnagraficheCassoni from './pages/Admin/AnagraficheCassoni .jsx'
import AnagraficheMezzi from './pages/Admin/AnagraficheMezzi.jsx'
import AnagraficheLuoghi from './pages/Admin/AnagraficheLuoghi.jsx'


function App() {
  return (
    <Routes>

      <Route
        path="/"
        element={<Login />}
      />

      <Route
        path="/operaio"
        element={<OperaioDashboard />}
      />

      <Route
        path="/operaio/storico"
        element={<StoricoViaggi />}
      />

      <Route
      path="/admin"
      element={<AdminDashboard />}
      />
      
      <Route
        path="/admin/viaggi"
        element={<RiepilogoViaggi />}
        />

      <Route
        path="/admin/posizioni"
         element={<PosizioniCassoni />}
         />

      <Route
        path="/admin/anagrafiche"
        element={<Anagrafiche />}
      />

      <Route
       path="/admin/anagrafiche/utenti"
       element={<AnagraficheUtenti />}
       />

      <Route
       path="/admin/anagrafiche/mezzi"
       element={<AnagraficheMezzi />}
       />

      <Route
       path="/admin/anagrafiche/cassoni"
       element={<AnagraficheCassoni />}
       />

      <Route
       path="/admin/anagrafiche/luoghi"
       element={<AnagraficheLuoghi />}
       />

    </Routes>
  )
}

export default App