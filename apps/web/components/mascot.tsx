import {Sparkles} from 'lucide-react'
/** Pip is an original, CSS-rendered JobPulse character: a curious little compass star. */
export function Pip({size='large',accessory='spark'}:{size?:'large'|'small'|'mini';accessory?:'spark'|'book'|'none'}){
 return <div className={'pip pip-'+size} role="img" aria-label="Pip, the JobPulse career companion">
  <span className="pip-shadow"/><span className="pip-tail"/><span className="pip-body"><span className="pip-shine"/><span className="pip-brow left"/><span className="pip-brow right"/><span className="pip-eye left"/><span className="pip-eye right"/><span className="pip-blush left"/><span className="pip-blush right"/><span className="pip-mouth"/><span className="pip-arm left"/><span className="pip-arm right"/><span className="pip-foot left"/><span className="pip-foot right"/></span>
  {accessory==='spark'&&<span className="pip-spark"><Sparkles size={21}/></span>}
  {accessory==='book'&&<span className="pip-book">✦</span>}
 </div>
}
