import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface text-primary">
      <div className="text-center">
        <h1 className="text-4xl font-bold">GreenVoltz</h1>
        <p className="mt-4 text-lg">EV charging orchestration — Frontend Phase 1</p>
        <div className="mt-6 flex justify-center gap-4">
          <Link to="/driver" className="px-4 py-2 bg-accent-green text-white rounded">Driver</Link>
          <Link to="/operator" className="px-4 py-2 bg-accent-cyan text-white rounded">Operator</Link>
        </div>
      </div>
    </div>
  )
}
