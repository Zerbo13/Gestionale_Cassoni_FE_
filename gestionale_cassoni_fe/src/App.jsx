import { Routes, Route } from 'react-router-dom'

import Login from './pages/Login'
import OperaioDashboard from './pages/Operaio/OperaioDashboard'
import StoricoViaggi from './pages/Operaio/StoricoViaggi'
import AdminDashboard from './pages/Admin/AdminDashboard'
import RiepilogoViaggiAdmin from './pages/Admin/RiepilogoViaggiAdmin'


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
  element={<RiepilogoViaggiAdmin />}
/>

    </Routes>
  )
}

export default App