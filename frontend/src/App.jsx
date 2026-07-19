import { useState , useRef , useEffect } from "react";
import Header from "./components/Headers.jsx";
import ChatInput from "./components/ChatInput.jsx";
import QueryBlock from "./components/QueryBlock.jsx";
import EmptyState from "./components/EmptyState.jsx";




const API_URL = import.meta.env.VITE_API_URL

export default function App(){
    const [input, setInput] = useState("")
    const [queries, setQueries] = useState([])
    //Ye ek array hai — har entry ek query aur uska result rakhti hai ({ id, query, data, loading, error }). Jitni queries bhejoge, utne items yahan jud jaayenge.
    const [busy, setBusy] = useState(false)
    const scrollRef = useRef(null)

     useEffect(()=>{
      scrollRef.current?.scrollTo({top : scrollRef.current.scrollHeight , behavior : "smooth"})
     },[queries,busy]);
      



     async function send(){
      const query = input.trim()
      if(!query) return;

      const id = Date.now()
      setQueries((q)=>[...q, { id , query , data : null , loading : true , error : null}]);
       
      setBusy(true)
      setInput("")

      try{
         const res = await fetch(API_URL + '/api/chat' , {
          method : "POST",
          headers : {
            "Content-Type" : "application/json"
          },
          body : JSON.stringify({
            message : query
          })
         })
         if(!res.ok) throw new Error("Backend returned an error" + res.status)
          const data = await res.json()
          setQueries((q)=> q.map((item)=>
          item.id === id ? {...item, data , loading : false} : item
        ))
      }
      catch(e){
      setQueries((q)=> q.map((item)=>
      item.id === id ? {...item, loading : false , error : e.message} : item
    ))
      }
      finally{
        setBusy(false);
      }





     }



     return(
        <div className="flex h-screen flex-col bg-base-100 overflow-x-hidden">
      <Header busy={busy} /> 
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 sm:p-5">
        {queries.length === 0 && <EmptyState />} 
        <div className="space-y-6">
          {queries.map((q) => (
            <QueryBlock key={q.id} query={q.query} data={q.data} loading={q.loading} error={q.error} />
          ))}
        </div>
      </div> 
      <ChatInput input={input} setInput={setInput} onSend={send} busy={busy} />
    </div>
     )





}