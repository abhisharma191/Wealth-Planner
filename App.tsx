import React, { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Download, RefreshCw, Upload, Wallet, Calculator, Target, LineChart, PieChart } from 'lucide-react'
import { ResponsiveContainer, PieChart as RPieChart, Pie, Cell, Tooltip as RTooltip } from 'recharts'

const clampNumber = (n:number,min=0,max=Number.MAX_SAFE_INTEGER)=>Number.isNaN(n)?0:Math.max(min,Math.min(max,n))
const fmt = (n:number)=>n.toLocaleString('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0})
const riskBands:any={ Low:{equity:30, debt:60, gold:10}, Moderate:{equity:50, debt:40, gold:10}, Aggressive:{equity:75, debt:20, gold:5} }

const defaultState:any={ income:100000, expenses:60000, riskAnswers:{knowledge:2,horizon:3,volatility:2},
  preferredRisk:'Moderate', sip:{monthly:10000,expected:12,years:10},
  goal:{ title:'Child Education', todayCost:1000000, inflation:6, years:10, expected:12 }
}

function useLocalState<T>(key:string,initial:T){ const [s,setS]=useState<T>(()=>{ try{const r=localStorage.getItem(key); return r?JSON.parse(r):initial }catch{return initial}});
  React.useEffect(()=>{ try{localStorage.setItem(key,JSON.stringify(s))}catch{} },[key,s]); return [s,setS] as const }

function pmt(rm:number,n:number,pv=0,fv=0){ if(rm===0) return -(pv+fv)/n; const r=rm; return -(r*(pv*Math.pow(1+r,n)+fv))/(Math.pow(1+r,n)-1) }
function fv(rm:number,n:number,pmtM:number,pv=0){ const r=rm; if(r===0) return -(pv+pmtM*n); return -( pv*Math.pow(1+r,n)+ pmtM*((Math.pow(1+r,n)-1)/r) ) }

export default function App(){
  const [state,setState]=useLocalState('pfp:v1',defaultState)
  const surplus=useMemo(()=>clampNumber(state.income-state.expenses),[state.income,state.expenses])
  const emergency=useMemo(()=>clampNumber(state.expenses*6),[state.expenses])
  const band=riskBands[state.preferredRisk]
  const alloc={ equity:Math.round(band.equity/100*surplus), debt:Math.round(band.debt/100*surplus), gold:Math.round(band.gold/100*surplus) }

  return (
    <div className='min-h-screen bg-slate-50 text-slate-900'>
      <div className='max-w-5xl mx-auto p-4 sm:p-6'>
        <header className='flex items-center justify-between mb-4'>
          <div className='flex items-center gap-3'>
            <Wallet className='w-7 h-7'/><h1 className='text-2xl sm:text-3xl font-semibold'>Wealth Planner</h1>
          </div>
          <div className='flex items-center gap-2'>
            <Button variant='outline' onClick={()=>{localStorage.removeItem('pfp:v1'); location.reload()}}><RefreshCw className='w-4 h-4 mr-2'/>Reset</Button>
            <Button variant='outline' onClick={()=>{ const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='plan.json'; a.click(); URL.revokeObjectURL(url) }}><Download className='w-4 h-4 mr-2'/>Export</Button>
            <label className='inline-flex items-center'>
              <input type='file' accept='application/json' className='hidden' onChange={(e:any)=>{const f=e.target.files?.[0]; if(!f) return; const r=new FileReader(); r.onload=()=>{ try{ setState(JSON.parse(String(r.result))); toast.success('Plan loaded') }catch{ toast.error('Invalid file') } }; r.readAsText(f) }}/>
              <span className='inline-flex'><Button variant='outline'><Upload className='w-4 h-4 mr-2'/>Import</Button></span>
            </label>
          </div>
        </header>

        <Tabs defaultValue='plan' className='w-full'>
          <TabsList className='flex flex-wrap gap-2'>
            <TabsTrigger value='plan'>Plan</TabsTrigger>
            <TabsTrigger value='sip'>SIP</TabsTrigger>
            <TabsTrigger value='goal'>Goal</TabsTrigger>
            <TabsTrigger value='resources'>Resources</TabsTrigger>
          </TabsList>

          <TabsContent value='plan' className='mt-4 space-y-4'>
            <Card>
              <CardHeader><CardTitle className='flex items-center gap-2'><Calculator className='w-5 h-5'/> Personal Inputs</CardTitle></CardHeader>
              <CardContent className='grid sm:grid-cols-2 gap-4'>
                <div><Label>Monthly Income (₹)</Label><Input type='number' value={state.income} onChange={e=>setState({...state, income:clampNumber(Number(e.target.value))})}/></div>
                <div><Label>Monthly Expenses (₹)</Label><Input type='number' value={state.expenses} onChange={e=>setState({...state, expenses:clampNumber(Number(e.target.value))})}/></div>
                <div><Label>Emergency Fund (6 months)</Label><Input value={fmt(emergency)} readOnly/></div>
                <div><Label>Monthly Surplus (Investable)</Label><Input value={fmt(surplus)} readOnly/></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className='flex items-center gap-2'><PieChart className='w-5 h-5'/> Asset Allocation</CardTitle></CardHeader>
              <CardContent className='grid md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <div className='flex items-center justify-between text-sm'><span>Equity ({band.equity}%)</span><span className='font-medium'>{fmt(alloc.equity)}</span></div>
                  <div className='flex items-center justify-between text-sm'><span>Debt ({band.debt}%)</span><span className='font-medium'>{fmt(alloc.debt)}</span></div>
                  <div className='flex items-center justify-between text-sm'><span>Gold ({band.gold}%)</span><span className='font-medium'>{fmt(alloc.gold)}</span></div>
                </div>
                <div className='h-48'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <RPieChart>
                      <Pie dataKey='value' data={[{name:'Equity',value:alloc.equity},{name:'Debt',value:alloc.debt},{name:'Gold',value:alloc.gold}]} innerRadius={40} outerRadius={80} paddingAngle={2}>
                        <Cell fill='#3b82f6'/><Cell fill='#10b981'/><Cell fill='#f59e0b'/>
                      </Pie>
                      <RTooltip />
                    </RPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='sip' className='mt-4 space-y-4'>
            <Card>
              <CardHeader><CardTitle className='flex items-center gap-2'><LineChart className='w-5 h-5'/> SIP Future Value</CardTitle></CardHeader>
              <CardContent className='grid md:grid-cols-4 gap-4'>
                <div><Label>Monthly SIP (₹)</Label><Input type='number' value={state.sip.monthly} onChange={e=>setState({...state, sip:{...state.sip, monthly:clampNumber(Number(e.target.value))}})}/></div>
                <div><Label>Expected Return (% p.a.)</Label><Input type='number' value={state.sip.expected} onChange={e=>setState({...state, sip:{...state.sip, expected:clampNumber(Number(e.target.value),0,40)}})}/></div>
                <div><Label>Years</Label><Input type='number' value={state.sip.years} onChange={e=>setState({...state, sip:{...state.sip, years:clampNumber(Number(e.target.value),0,60)}})}/></div>
                <div><Label>Future Value</Label><Input value={fmt(Math.max(0,Math.round(fv(state.sip.expected/1200,state.sip.years*12,state.sip.monthly))))} readOnly/></div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='goal' className='mt-4 space-y-4'>
            <Card>
              <CardHeader><CardTitle className='flex items-center gap-2'><Target className='w-5 h-5'/> Goal-based SIP</CardTitle></CardHeader>
              <CardContent className='grid md:grid-cols-6 gap-4 items-end'>
                <div className='md:col-span-2'><Label>Goal Title</Label><Input value={state.goal.title} onChange={e=>setState({...state, goal:{...state.goal, title:e.target.value}})}/></div>
                <div><Label>Cost Today (₹)</Label><Input type='number' value={state.goal.todayCost} onChange={e=>setState({...state, goal:{...state.goal, todayCost:clampNumber(Number(e.target.value))}})}/></div>
                <div><Label>Inflation (% p.a.)</Label><Input type='number' value={state.goal.inflation} onChange={e=>setState({...state, goal:{...state.goal, inflation:clampNumber(Number(e.target.value),0,20)}})}/></div>
                <div><Label>Years</Label><Input type='number' value={state.goal.years} onChange={e=>setState({...state, goal:{...state.goal, years:clampNumber(Number(e.target.value),0,60)}})}/></div>
                <div><Label>Expected Return (% p.a.)</Label><Input type='number' value={state.goal.expected} onChange={e=>setState({...state, goal:{...state.goal, expected:clampNumber(Number(e.target.value),0,40)}})}/></div>
                <div className='md:col-span-3'><Label>Future Goal Value</Label><Input value={fmt(Math.round(state.goal.todayCost*Math.pow(1+state.goal.inflation/100,state.goal.years)))} readOnly/></div>
                <div className='md:col-span-3'><Label>Monthly SIP Needed</Label><Input value={fmt(Math.max(0,Math.round(pmt(state.goal.expected/1200,state.goal.years*12,0,-Math.round(state.goal.todayCost*Math.pow(1+state.goal.inflation/100,state.goal.years))))) )} readOnly/></div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='resources' className='mt-4 space-y-4'>
            <Card><CardHeader><CardTitle>India References (Tax & Regulations)</CardTitle></CardHeader>
            <CardContent className='text-sm space-y-2'>
              <ul className='list-disc pl-5'>
                <li>Income Tax: <a className='text-blue-600 underline' href='https://www.incometax.gov.in/' target='_blank' rel='noreferrer'>incometax.gov.in</a> — Sections 111A & 112A.</li>
                <li>SEBI MF Categorisation: Circular SEBI/HO/IMD/DF3/CIR/P/2017/114.</li>
                <li>RBI Sovereign Gold Bonds: <a className='text-blue-600 underline' href='https://www.rbi.org.in/' target='_blank' rel='noreferrer'>rbi.org.in</a>.</li>
              </ul>
            </CardContent></Card>
          </TabsContent>
        </Tabs>

        <footer className='mt-8 text-xs text-slate-500'><p>Disclaimer: Educational tool. Returns are not guaranteed.</p></footer>
      </div>
    </div>
  )
}
