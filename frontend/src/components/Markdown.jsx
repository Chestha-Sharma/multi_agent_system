




function inlineFormater(text) { 
  const parts  = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part,i)=>{
    if(part.startsWith("**") && part.endsWith("**")){
      return <span key={i}>{part.slice(2,-2)}</span>
    }
    return part;
  })
}

export default function Markdown({content}) {
    if(!content) return null
    const lines = content.split("\n")

    return(
        <div className="text-sm leading-relaxed space-y-1 break-words">
            {lines.map((line,i)=>{
                if(!line.trim()) return <div key={i} className="h-2" />
                if(line.startsWith("- ") || line.startsWith("* ")){
                    return (
                   <div key={i} className="flex gap-2 pl-1">
                     <span className="opacity-50">•</span>
                     <span>{inlineFormater(line.slice(2))}</span>
                   </div>
                 )
                }
                return <p key={i}>{inlineFormater(line)}</p>
            })}
        </div>
    )
}