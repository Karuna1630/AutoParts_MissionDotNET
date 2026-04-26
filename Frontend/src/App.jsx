import { FaCarSide } from 'react-icons/fa'

function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <span className="flex items-center gap-2 text-lg font-semibold">
            <FaCarSide className="text-blue-600" />
            <span>AutoParts</span>
          </span>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-slate-700">Frontend is ready.</p>
        </div>
      </main>
    </div>
  )
}

export default App
