import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Dashboard, Login, Projects } from './pages'

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        <nav style={{ backgroundColor: '#343a40', padding: '1rem', color: 'white' }}>
          <h1 style={{ margin: 0 }}>TalaveraTest</h1>
        </nav>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/projects" element={<Projects />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)