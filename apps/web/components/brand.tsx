import Link from 'next/link'
import {Activity} from 'lucide-react'
export function Brand({compact=false}:{compact?:boolean}){
 return <Link className="brand" href="/" aria-label="JobPulse home"><span className="brand-mark"><Activity size={23} strokeWidth={2.7}/></span>{!compact&&<span className="brand-name">jobpulse<span>.</span></span>}</Link>
}
