import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './styles/globals.css'

console.log('🚀 Starting BalanceSheetAnalyst Frontend...')
console.log('📦 Build tool: Vite + React + TypeScript')
console.log('🌐 Frontend URL: http://localhost:3000')

const rootElement = document.getElementById('root')
if (!rootElement) {
  console.error('❌ Root element not found!')
  console.error('💡 Make sure your index.html has <div id="root"></div>')
} else {
  console.log('✅ React app mounting to DOM...')
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
  console.log('✅ Frontend initialized successfully')
  console.log('🎯 Ready to connect to backend at http://localhost:3001')
}
