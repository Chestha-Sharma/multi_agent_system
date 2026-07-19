import { Sparkles } from 'lucide-react'

export default function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center opacity-60">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Sparkles className="h-6 w-6" />
      </div>
      <p className="max-w-sm text-sm">
        Ask the agent something. It can search the web and read pages before answering.
      </p>
    </div>
  )
}