 'use client';
import {useEffect,useState} from 'react';
import {contactApi,type Inquiry} from '@/lib/api';
import {getErrorMessage} from '@/lib/utils';
import PageHeader from '@/components/admin/PageHeader';
export default function Inquiries(){const [rows,setRows]=useState<Inquiry[]>([]),[error,setError]=useState(''),[loading,setLoading]=useState(true);useEffect(()=>{contactApi.list().then(setRows).catch(e=>setError(getErrorMessage(e))).finally(()=>setLoading(false));},[]);return <div><PageHeader title="Guest inquiries"/>{error&&<p role="alert">{error}</p>}{loading?<p>Loading inquiries…</p>:!rows.length?<p>No inquiries yet.</p>:<div className="grid gap-4">{rows.map(r=><article key={r.id} className="admin-card p-6"><p className="text-xs text-[var(--nova-text-muted)]">{r.createdAt} · #{r.id}</p><h2 className="my-3 font-serif text-xl">{r.subject}</h2><p>{r.name} · {r.email} {r.phone}</p><p className="mt-4 whitespace-pre-wrap">{r.message}</p></article>)}</div>}</div>}
