import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Search, FileText, PenLine, Sparkles, Send, User, Bot, AlertTriangle, Menu, X } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL

const TOOLS = [
  { name: 'web_search', desc: 'Searches the web via Tavily for recent, reliable sources.' },
  { name: 'scrap_url', desc: 'Scrapes and cleans page text for deeper reading.' },
]

const STAGES = [
  { key: 'search_results', label: 'Search Results', icon: Search, color: 'text-stage-search', border: 'border-stage-search', bg: 'bg-stage-search/10' },
  { key: 'reader_results', label: 'Reader Results', icon: FileText, color: 'text-stage-reader', border: 'border-stage-reader', bg: 'bg-stage-reader/10' },
  { key: 'report', label: 'Final Report', icon: PenLine, color: 'text-stage-writer', border: 'border-stage-writer', bg: 'bg-stage-writer/10' },
  { key: 'feedback', label: 'Critic Feedback', icon: Sparkles, color: 'text-stage-critic', border: 'border-stage-critic', bg: 'bg-stage-critic/10' },
]

function Markdown({ content }) {
  if (!content) return null
  return (
    <div className="prose prose-invert prose-sm max-w-none prose-headings:font-semibold prose-headings:text-console-text prose-p:text-console-text prose-li:text-console-text prose-strong:text-console-text prose-a:text-stage-search prose-code:text-stage-writer prose-code:before:content-none prose-code:after:content-none prose-pre:bg-black/40 prose-pre:border prose-pre:border-console-border prose-pre:overflow-x-auto">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  )
}

function UserBubble({ content }) {
  return (
    <div className="flex justify-end gap-2 sm:gap-3">
      <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl rounded-tr-sm border border-console-border bg-console-panel px-3 py-2.5 sm:px-4 sm:py-3 shadow-sm">
        <Markdown content={content} />
      </div>
      <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-stage-search/15 text-stage-search">
        <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      </div>
    </div>
  )
}

function ErrorBubble({ content }) {
  return (
    <div className="flex justify-start gap-2 sm:gap-3">
      <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-signal-error/15 text-signal-error">
        <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      </div>
      <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl rounded-tl-sm border border-signal-error/30 bg-signal-error/10 px-3 py-2.5 sm:px-4 sm:py-3">
        <div className="mb-1 text-xs font-medium uppercase tracking-wider text-signal-error">Error</div>
        <div className="text-sm text-console-text break-words">{content}</div>
      </div>
    </div>
  )
}

function StageBlock({ label, content, color, border, bg, Icon }) {
  if (!content) return null
  return (
    <div className={`rounded-xl border ${border}/30 ${bg} p-3 sm:p-4`}>
      <div className={`mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider ${color}`}>
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <Markdown content={content} />
    </div>
  )
}

function AssistantBubble({ data }) {
  return (
    <div className="flex justify-start gap-2 sm:gap-3">
      <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-stage-writer/15 text-stage-writer">
        <Bot className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      </div>
      <div className="w-full max-w-[90%] sm:max-w-[85%] space-y-3 rounded-2xl rounded-tl-sm border border-console-border bg-console-panel p-3 sm:p-4 shadow-sm">
        {STAGES.map((s) => (
          <StageBlock
            key={s.key}
            label={s.label}
            content={data[s.key]}
            color={s.color}
            border={s.border}
            bg={s.bg}
            Icon={s.icon}
          />
        ))}
      </div>
    </div>
  )
}

function ToolsPanel() {
  return (
    <div className="space-y-2">
      {TOOLS.map((t) => (
        <div className="flex items-start gap-3 rounded-lg border border-console-border bg-console-panel/50 p-3" key={t.name}>
          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-stage-search" />
          <div>
            <div className="text-sm font-medium text-console-text">{t.name}</div>
            <div className="mt-0.5 text-xs text-console-muted">{t.desc}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function App() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [trace, setTrace] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
    }
  }, [messages, busy])

  async function send() {
    const query = input.trim()
    if (!query || busy) return

    setMessages((m) => [...m, { kind: 'user', content: query }])
    setInput('')
    setBusy(true)
    setTrace('Dispatching to pipeline: ' + query.slice(0, 40))

    try {
      const res = await fetch(API_URL + '/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query }),
      })

      if (!res.ok) {
        const body = await res.text()
        throw new Error('Backend returned ' + res.status + ': ' + body.slice(0, 200))
      }

      const data = await res.json()
      setMessages((m) => [...m, { kind: 'assistant', data: data }])
    } catch (err) {
      setMessages((m) => [...m, { kind: 'error', content: 'Could not reach the pipeline: ' + err.message }])
    } finally {
      setBusy(false)
      setTrace('')
    }
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="flex h-screen flex-col bg-console-bg">
      <header className="flex items-center justify-between border-b border-console-border bg-console-panel/50 px-3 py-2.5 sm:px-5 sm:py-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-console-text">
          <button
            onClick={() => setDrawerOpen(true)}
            className="mr-1 flex h-8 w-8 items-center justify-center rounded-lg border border-console-border text-console-muted md:hidden"
          >
            <Menu className="h-4 w-4" />
          </button>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-stage-search/15 text-stage-search">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-console-muted hidden xs:inline">agent</span>
          <span>console</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 rounded-full border border-console-border px-2.5 py-1 sm:px-3 text-xs font-medium text-console-muted">
          <span className={`h-2 w-2 rounded-full ${busy ? 'bg-signal-busy animate-pulse' : 'bg-signal-idle'}`} />
          <span className="hidden xs:inline">{busy ? 'Working' : 'Idle'}</span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Desktop sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-console-border p-4 md:block overflow-y-auto">
          <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-console-muted">Available Tools</div>
          <ToolsPanel />
        </aside>

        {/* Mobile drawer */}
        {drawerOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div
              className="fixed inset-0 bg-black/50"
              onClick={() => setDrawerOpen(false)}
            />
            <div className="relative z-10 h-full w-72 max-w-[80%] overflow-y-auto border-r border-console-border bg-console-bg p-4 shadow-xl">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-xs font-semibold uppercase tracking-wider text-console-muted">Available Tools</div>
                <button onClick={() => setDrawerOpen(false)} className="text-console-muted">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <ToolsPanel />
            </div>
          </div>
        )}

        <div className="flex flex-1 flex-col overflow-hidden min-w-0">
          <div ref={scrollRef} className="flex-1 space-y-4 sm:space-y-5 overflow-y-auto p-3 sm:p-5">
            {messages.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-console-muted px-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stage-search/10 text-stage-search">
                  <Sparkles className="h-6 w-6" />
                </div>
                <p className="max-w-sm text-sm">
                  Ask the agent system something. It can search the web and read pages before answering. You will see every stage output here.
                </p>
              </div>
            )}
            {messages.map((m, i) => {
              if (m.kind === 'user') return <UserBubble key={i} content={m.content} />
              if (m.kind === 'error') return <ErrorBubble key={i} content={m.content} />
              return <AssistantBubble key={i} data={m.data} />
            })}
          </div>

          {trace && (
            <div className="border-t border-console-border px-3 sm:px-5 py-2 text-xs text-console-muted truncate">
              {trace}
              <span className="ml-0.5 inline-block h-3 w-1.5 translate-y-0.5 bg-console-muted animate-blink" />
            </div>
          )}

          <div className="flex items-center gap-2 border-t border-console-border p-2.5 sm:p-4">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask something..."
              disabled={busy}
              className="min-w-0 flex-1 rounded-full border border-console-border bg-console-panel px-3.5 py-2 sm:px-4 sm:py-2.5 text-sm text-console-text placeholder:text-console-muted outline-none focus:border-stage-search disabled:opacity-50"
            />
            <button
              onClick={send}
              disabled={busy || !input.trim()}
              className="flex shrink-0 items-center gap-1.5 sm:gap-2 rounded-full bg-stage-search px-3.5 py-2 sm:px-4 sm:py-2.5 text-sm font-medium text-console-bg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline">{busy ? 'Running' : 'Send'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}