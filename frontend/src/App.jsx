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
  { key: 'search_results', label: 'Search Results', icon: Search, color: 'text-primary', border: 'border-primary', bg: 'bg-primary/10' },
  { key: 'reader_results', label: 'Reader Results', icon: FileText, color: 'text-secondary', border: 'border-secondary', bg: 'bg-secondary/10' },
  { key: 'report', label: 'Final Report', icon: PenLine, color: 'text-accent', border: 'border-accent', bg: 'bg-accent/10' },
  { key: 'feedback', label: 'Critic Feedback', icon: Sparkles, color: 'text-info', border: 'border-info', bg: 'bg-info/10' },
]

function formatToolResults(text) {
  if (!text) return text
  return text
    .replace(/(?:^|\s)Title:/g, '\n\n**Title:** ')
    .replace(/\sURL:/g, '\n**URL:** ')
    .replace(/\sSnippet:/g, '\n**Snippet:** ')
    .trim()
}

function Markdown({ content }) {
  if (!content) return null
  return (
    <div className="prose prose-sm max-w-none break-words overflow-hidden
      prose-headings:font-semibold prose-p:my-1 prose-li:my-0
      prose-pre:bg-base-300 prose-pre:overflow-x-auto prose-pre:max-w-full
      prose-code:before:content-none prose-code:after:content-none prose-code:break-all
      prose-a:break-all prose-a:[overflow-wrap:anywhere]
      [&_*]:min-w-0">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  )
}

function UserBubble({ content }) {
  return (
    <div className="chat chat-end">
      <div className="chat-image avatar">
        <div className="size-9 rounded-full bg-primary/10 text-primary flex items-center justify-center border-2 border-primary">
          <User className="h-4 w-4" />
        </div>
      </div>
      <div className="chat-bubble bg-primary text-primary-content rounded-2xl rounded-br-sm max-w-[85%] sm:max-w-[75%] min-w-0 overflow-hidden">
        <Markdown content={content} />
      </div>
    </div>
  )
}

function ErrorBubble({ content }) {
  return (
    <div className="chat chat-start">
      <div className="chat-image avatar">
        <div className="size-9 rounded-full bg-error/10 text-error flex items-center justify-center border-2 border-error/40">
          <AlertTriangle className="h-4 w-4" />
        </div>
      </div>
      <div className="chat-bubble bg-error/10 text-base-content border border-error/30 rounded-2xl rounded-bl-sm max-w-[85%] sm:max-w-[75%] min-w-0 overflow-hidden">
        <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-error">Error</div>
        <div className="text-sm break-words">{content}</div>
      </div>
    </div>
  )
}

function StageBlock({ label, content, color, border, bg, Icon, isToolResult }) {
  if (!content) return null
  const displayContent = isToolResult ? formatToolResults(content) : content
  return (
    <div className={`rounded-xl border ${border}/30 ${bg} p-3 sm:p-4 min-w-0 overflow-hidden`}>
      <div className={`mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider ${color}`}>
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <Markdown content={displayContent} />
    </div>
  )
}

function AssistantBubble({ data }) {
  return (
    <div className="chat chat-start">
      <div className="chat-image avatar">
        <div className="size-9 rounded-full bg-accent/10 text-accent flex items-center justify-center border-2 border-accent">
          <Bot className="h-4 w-4" />
        </div>
      </div>
      <div className="chat-bubble flex flex-col gap-3 bg-base-200 text-base-content rounded-2xl rounded-bl-sm max-w-[90%] sm:max-w-[85%] p-3 sm:p-4 min-w-0 overflow-hidden">
        {STAGES.map((s) => (
          <StageBlock
            key={s.key}
            label={s.label}
            content={data[s.key]}
            color={s.color}
            border={s.border}
            bg={s.bg}
            Icon={s.icon}
            isToolResult={s.key === 'search_results' || s.key === 'reader_results'}
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
        <div className="flex items-start gap-3 rounded-xl border border-base-300 bg-base-200/50 p-3" key={t.name}>
          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
          <div>
            <div className="text-sm font-medium">{t.name}</div>
            <div className="mt-0.5 text-xs opacity-60">{t.desc}</div>
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
    <div className="flex h-screen flex-col bg-base-100 overflow-x-hidden">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-base-300 bg-base-100 px-3 py-2.5 sm:px-5 sm:py-3">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <button
            onClick={() => setDrawerOpen(true)}
            className="mr-1 flex h-8 w-8 items-center justify-center rounded-lg border border-base-300 opacity-70 md:hidden"
          >
            <Menu className="h-4 w-4" />
          </button>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="opacity-60 hidden xs:inline">agent</span>
          <span>console</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 rounded-full bg-base-300 px-2.5 py-1 sm:px-3 text-xs font-medium opacity-70">
          <span className={`h-2 w-2 rounded-full ${busy ? 'bg-warning animate-pulse' : 'bg-success'}`} />
          <span className="hidden xs:inline">{busy ? 'Working' : 'Idle'}</span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Desktop sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-base-300 p-4 md:block overflow-y-auto">
          <div className="mb-3 text-xs font-semibold uppercase tracking-wider opacity-60">Available Tools</div>
          <ToolsPanel />
        </aside>

        {/* Mobile drawer */}
        {drawerOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div className="fixed inset-0 bg-black/50" onClick={() => setDrawerOpen(false)} />
            <div className="relative z-10 h-full w-72 max-w-[80%] overflow-y-auto border-r border-base-300 bg-base-100 p-4 shadow-xl">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-xs font-semibold uppercase tracking-wider opacity-60">Available Tools</div>
                <button onClick={() => setDrawerOpen(false)} className="opacity-60">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <ToolsPanel />
            </div>
          </div>
        )}

        {/* Main chat area */}
        <div className="flex flex-1 flex-col overflow-hidden min-w-0">
          <div ref={scrollRef} className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden p-3 sm:p-5 min-w-0">
            {messages.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-center opacity-60 px-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
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
            <div className="border-t border-base-300 px-3 sm:px-5 py-2 text-xs opacity-60 truncate">
              {trace}
              <span className="ml-0.5 inline-block h-3 w-1.5 translate-y-0.5 bg-current animate-pulse" />
            </div>
          )}

          {/* Input bar */}
          <div className="flex items-center gap-2 border-t border-base-300 p-2.5 sm:p-4">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask something..."
              disabled={busy}
              className="input input-bordered min-w-0 flex-1 rounded-full text-sm disabled:opacity-50"
            />
            <button
              onClick={send}
              disabled={busy || !input.trim()}
              className="btn btn-primary rounded-full gap-1.5 sm:gap-2 disabled:opacity-40"
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