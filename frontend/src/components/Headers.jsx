import { Sparkles } from 'lucide-react'

export default function Header({ busy }) {
  return (
    <header className="flex items-center justify-between border-b border-base-300 px-3 py-2.5 sm:px-5 sm:py-3">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Sparkles className="h-4 w-4" />
        </div>
        <span>Agent Console</span>
      </div>

      <div className="flex items-center gap-2 rounded-full bg-base-300 px-3 py-1 text-xs font-medium opacity-70">
        <span className={`h-2 w-2 rounded-full ${busy ? 'bg-warning animate-pulse' : 'bg-success'}`} />
        <span className="hidden xs:inline">{busy ? 'Working' : 'Idle'}</span>
      </div>
    </header>
  )
}