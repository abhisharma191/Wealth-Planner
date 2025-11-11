
export function Tabs({children,className=''}:any){ return <div className={className}>{children}</div> }
export function TabsList({children,className=''}:any){ return <div className={'flex flex-wrap gap-2 '+className}>{children}</div> }
export function TabsTrigger({children,onClick}:any){
  return <button onClick={onClick} className="px-3 py-2 text-sm rounded-xl border bg-white">{children}</button>;
}
export function TabsContent({children,className=''}:any){ return <div className={className}>{children}</div> }
