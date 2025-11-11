
export function Select({children}:any){ return <div>{children}</div> }
export function SelectTrigger({children}:any){ return <div className="border rounded-xl px-3 py-2 text-sm bg-white">{children}</div> }
export function SelectValue(){ return <span/> }
export function SelectContent({children}:any){ return <div className="mt-2">{children}</div> }
export function SelectItem({value,children,onSelect}:any){
  return <div className="border rounded-xl px-3 py-2 text-sm bg-white cursor-pointer my-1"
    onClick={()=>onSelect?onSelect(value):null}>{children}</div>;
}
