'use client';
import {useEffect,useState} from 'react';
import {customersApi} from '@/lib/api';
import {getErrorMessage} from '@/lib/utils';
import {downloadCsv} from '@/lib/csv';
import type {Customer} from '@/types';
import PageHeader from '@/components/admin/PageHeader';
import Modal from '@/components/admin/Modal';
import Button from '@/components/ui/Button';
import ErrorMessage from '@/components/ui/ErrorMessage';
export default function Customers(){
 const [rows,setRows]=useState<Customer[]>([]),[query,setQuery]=useState(''),[loading,setLoading]=useState(true),[error,setError]=useState(''),[editing,setEditing]=useState<Customer|null>(null),[saving,setSaving]=useState(false);
 const load=()=>{setError('');setLoading(true);customersApi.getAll().then(setRows).catch(e=>setError(getErrorMessage(e))).finally(()=>setLoading(false));};
 useEffect(()=>{customersApi.getAll().then(setRows).catch(e=>setError(getErrorMessage(e))).finally(()=>setLoading(false));},[]);
 const filtered=rows.filter(r=>[r.firstName,r.lastName,r.email,r.phoneNumber,r.address].join(' ').toLowerCase().includes(query.trim().toLowerCase())).sort((a,b)=>a.lastName.localeCompare(b.lastName));
 const save=async()=>{if(!editing)return;setSaving(true);setError('');try{const updated=await customersApi.update(editing.id,{firstName:editing.firstName,lastName:editing.lastName,phoneNumber:editing.phoneNumber??'',address:editing.address??''});setRows(rows.map(r=>r.id===updated.id?updated:r));setEditing(null);}catch(e){setError(getErrorMessage(e));}finally{setSaving(false);}};
 return <div><PageHeader title="Customers" actions={<Button onClick={load}>Refresh</Button>}/>
 {error&&<ErrorMessage message={error}/>}<div className="my-6 flex flex-wrap gap-3"><input aria-label="Search customers" placeholder="Search name, email, phone or address" className="admin-input max-w-xl" value={query} onChange={e=>setQuery(e.target.value)}/><Button variant="secondary" disabled={!filtered.length} onClick={()=>downloadCsv('nova-customers.csv',['ID','Name','Email','Phone','Address'],filtered.map(r=>[r.id,`${r.firstName} ${r.lastName}`,r.email,r.phoneNumber,r.address]))}>Export results</Button></div>
 {loading?<p role="status">Loading customers…</p>:<div className="admin-card overflow-x-auto"><table className="admin-table"><thead><tr><th>Guest</th><th>Email</th><th>Phone</th><th>Address</th><th>Action</th></tr></thead><tbody>{filtered.map(r=><tr key={r.id}><td>{r.firstName} {r.lastName}</td><td>{r.email}</td><td>{r.phoneNumber||'—'}</td><td>{r.address||'—'}</td><td><Button size="sm" onClick={()=>setEditing({...r})}>Edit details</Button></td></tr>)}</tbody></table>{!filtered.length&&<p className="p-8 text-center">{error?'Customer data is unavailable. Use Refresh to retry.':'No customers match this search.'}</p>}</div>}
 {editing&&<Modal title="Edit guest details" onClose={()=>{if(!saving)setEditing(null);}} footer={<Button isLoading={saving} onClick={save}>Save details</Button>}><div className="space-y-4">{error&&<ErrorMessage message={error}/>}<p className="text-sm">{editing.email}</p>{(['firstName','lastName','phoneNumber','address'] as const).map(key=><label className="block text-sm" key={key}>{({firstName:'First name',lastName:'Last name',phoneNumber:'Phone',address:'Address'})[key]}<input className="admin-input mt-2" maxLength={key==='address'?300:100} value={editing[key]??''} onChange={e=>setEditing({...editing,[key]:e.target.value})}/></label>)}</div></Modal>}</div>;
}
