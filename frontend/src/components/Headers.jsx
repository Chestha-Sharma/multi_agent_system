export default function Header({ busy }) {
  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-3 py-2.5 sm:px-5 sm:py-3">
      <span className="text-sm font-semibold text-slate-800">Agent Console</span>

      <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
        <span className={`h-2 w-2 rounded-full ${busy ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`} />
        <span>{busy ? 'Working' : 'Idle'}</span>
      </div>
    </header>
  )
}