import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'

function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="p-8 bg-white rounded shadow w-full max-w-xl">
        <h1 className="text-2xl font-bold mb-2">AI-PAT</h1>
        <p className="text-gray-600">Frontend ready on port 5200 (Backend expects 8082).</p>
      </div>
    </div>
  )
}

const router = createBrowserRouter([{ path: '/', element: <Home /> }])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
