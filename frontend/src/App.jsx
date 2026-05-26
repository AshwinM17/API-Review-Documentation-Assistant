import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import ViewSpec from './pages/ViewSpec'
import Chat from './pages/Chat'
import Compare from './pages/Compare'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/"        element={<Navigate to="/view" replace />} />
            <Route path="/view"    element={<ViewSpec />} />
            <Route path="/chat"    element={<Chat />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="*"        element={<NotFound />} />
          </Routes>
          
        </main>
      </div>
    </BrowserRouter>
  )
}
