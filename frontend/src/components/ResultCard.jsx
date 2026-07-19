import Markdown from './Markdown.jsx'

export default function ResultCard({title,content,icon:Icon,accessClass}){
    if(!content) return null
    return(
        <div className={`rounded-xl border ${accentClass} bg-base-200 p-4`}>
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide opacity-70">
        {Icon && <Icon className="h-4 w-4" />}
        {title}
      </div>
      <Markdown content={content} />
    </div>
    )
}

