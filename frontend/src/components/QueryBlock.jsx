


import { Search , FileText , PenLine , Sparkles} from 'lucide-react'
import ResultCard from './ResultCard.jsx'




export default function QueryBlock({query,data, loading, error}){
    if(!query) return null
      return(
     <div className="space-y-3">
        <div className="rounded-xl bg-primary/10 border border-primary/30 px-4 py-2.5">
        <p className="text-sm font-medium">{query}</p>
        </div>
        {
            loading && (
                <div className="rounded-xl border border-base-300 bg-base-200 px-4 py-3 text-sm opacity-60">
                      Processing...
                 </div>
            )
        }
        {
            error && (
                <div className="rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
                  {error}
                </div>
            )
        }
        {
            data && (
                <div className="space-y-3">
                   <ResultCard title="Search Results" content={data.search_results} icon={Search} accentClass="border-primary/30" />
                   <ResultCard title="Reader Results" content={data.reader_results} icon={FileText} accentClass="border-secondary/30" />
                   <ResultCard title="Report" content={data.report} icon={PenLine} accentClass="border-accent/30" />
                   <ResultCard title="Feedback" content={data.feedback} icon={Sparkles} accentClass="border-info/30" />
               </div>
            )
        }
       </div>
      )
}