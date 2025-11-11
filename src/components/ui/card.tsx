
import * as React from 'react'
export function Card({ className='', ...p }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={'rounded-2xl bg-white shadow-sm '+className} {...p} />
}
export function CardHeader(p:any){ return <div className="p-4 border-b">{p.children}</div> }
export function CardTitle(p:any){ return <h3 className="text-lg font-semibold">{p.children}</h3> }
export function CardContent(p:any){ return <div className="p-4">{p.children}</div> }
