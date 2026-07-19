


import { Send } from 'lucide-react'



export default function ChatInput({intput , setInput ,onSend , busy}){
    function onKeyDown(e){
        if(e.key === 'Enter' && !e.shiftKey){
            e.preventDefault()
            onSend()
        }
    }
    // Ye function check karta hai agar user ne sirf "Enter" dabaya aur Shift nahi dabaya to e.preventDefault() se default behavior naya line rokte hain, aur onSend() chala dete hain matlab Enter dabane se hi message chala jaye form submit jaisa.
    return(
        <div className="flex items-center gap-2 border-t border-base-300 p-2.5 sm:p-4">
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Kuch bhi pucho..."
        disabled={busy}
        className="min-w-0 flex-1 rounded-full border border-base-300 bg-base-100 px-4 py-2 text-sm outline-none focus:border-primary disabled:opacity-50"
      />
      <button
        onClick={onSend}
        disabled={busy || !input.trim()} //trim checks input is empty or not
        className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-content disabled:opacity-40"
      >
        <Send className="h-4 w-4" />
        <span className="hidden sm:inline">{busy ? 'Running' : 'Send'}</span>
      </button>
    </div>
    )
}