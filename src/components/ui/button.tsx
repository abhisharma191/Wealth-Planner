
export function Button({variant='default', className='', ...p}: any){
  const base='inline-flex items-center gap-1 rounded-xl px-3 py-2 text-sm';
  const styles:any={
    default:'bg-slate-900 text-white hover:opacity-90',
    outline:'border border-slate-300 bg-white hover:bg-slate-50',
    ghost:'hover:bg-slate-100',
  };
  return <button className={`${base} ${styles[variant]} ${className}`} {...p} />;
}
