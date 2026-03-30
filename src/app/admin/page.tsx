"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval, startOfWeek, endOfWeek, subWeeks } from "date-fns";
import {
  Copy, ExternalLink, CalendarDays, Briefcase, Activity, Download,
  Trash2, LayoutGrid, List, Clock, Users, CheckCircle2,
  Zap, BarChart2, ArrowRight, Search, TrendingUp, TrendingDown
} from "lucide-react";
import Link from "next/link";

type Testimonial = {
  id: string; consultant_name: string; job_role: string; status: string;
  client_name: string; email: string; company_name: string;
  company_short_code: string; journey_duration_days: number;
  salary_range: string; created_at: string;
};

const STATUS_COLORS: Record<string, string> = {
  Hired: "bg-emerald-50 text-emerald-700 border-emerald-100",
  "Offer Received": "bg-blue-50 text-blue-700 border-blue-100",
  "Final Round": "bg-sky-50 text-sky-700 border-sky-100",
  "Interview Stage": "bg-amber-50 text-amber-700 border-amber-100",
  "Assessment Stage": "bg-yellow-50 text-yellow-700 border-yellow-100",
  "Application Submitted": "bg-gray-50 text-gray-600 border-gray-200",
};

type ViewMode = "card" | "table" | "role";
const todayStr = () => new Date().toISOString().split("T")[0];
const monthStartStr = () => { const d = new Date(); d.setDate(1); return d.toISOString().split("T")[0]; };

export default function AdminDashboard() {
  const [records, setRecords] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("card");
  const [fromDraft, setFromDraft] = useState(monthStartStr());
  const [toDraft, setToDraft] = useState(todayStr());
  const [statusDraft, setStatusDraft] = useState("All");
  const [fromDate, setFromDate] = useState(monthStartStr());
  const [toDate, setToDate] = useState(todayStr());
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set());

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("testimonials")
      .select("id, consultant_name, job_role, status, client_name, email, company_name, company_short_code, journey_duration_days, salary_range, created_at")
      .order("created_at", { ascending: false });
    if (fromDate) query = query.gte("created_at", fromDate + "T00:00:00.000Z");
    if (toDate)   query = query.lte("created_at", toDate   + "T23:59:59.999Z");
    if (statusFilter !== "All") query = query.eq("status", statusFilter);
    const PAGE = 1000; let allData: Testimonial[] = []; let page = 0; let hasMore = true;
    while (hasMore) {
      const { data, error } = await query.range(page * PAGE, (page + 1) * PAGE - 1);
      if (error) { console.error(error.message); break; }
      if (data) allData = [...allData, ...data];
      hasMore = data?.length === PAGE; page++;
    }
    setRecords(allData); setSelectedRows(new Set()); setLoading(false);
  }, [fromDate, toDate, statusFilter]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const applyFilters = () => { setFromDate(fromDraft); setToDate(toDraft); setStatusFilter(statusDraft); };
  const resetFilters = () => {
    const f = monthStartStr(), t = todayStr();
    setFromDraft(f); setToDraft(t); setStatusDraft("All");
    setFromDate(f); setToDate(t); setStatusFilter("All");
    setSearchTerm(""); setSelectedRoles(new Set()); setSelectedRows(new Set());
  };

  const copyLink = (code: string) => navigator.clipboard.writeText(`${window.location.origin}/journey/${code}`);
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this journey?")) return;
    await supabase.from("testimonials").delete().eq("id", id); fetchRecords();
  };
  const handleStatusChange = async (id: string, newStatus: string) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    await supabase.from("testimonials").update({ status: newStatus }).eq("id", id);
  };
  const bulkDelete = async () => {
    if (!confirm(`Delete ${selectedRows.size} journeys?`)) return;
    await supabase.from("testimonials").delete().in("id", Array.from(selectedRows));
    setSelectedRows(new Set()); fetchRecords();
  };
  const exportCSV = (rows: Testimonial[], name: string) => {
    const h = ["Date","Company","Client","Email","Consultant","Role","Status","Days","Salary"];
    const body = rows.map(t => [format(parseISO(t.created_at),"yyyy-MM-dd"), t.company_name, t.client_name, t.email, t.consultant_name||"", t.job_role, t.status, t.journey_duration_days, t.salary_range||""]);
    const csv = [h,...body].map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv],{type:"text/csv"})); a.download = name; a.click();
  };
  const ALL_STATUSES = ["Assessment Stage","Interview Stage","Final Round","Offer Received","Hired","Application Submitted"];
  const StatusSelect = ({ t }: { t: Testimonial }) => (
    <select
      value={t.status}
      onChange={e => handleStatusChange(t.id, e.target.value)}
      className={`text-xs font-semibold px-2.5 py-1 rounded border cursor-pointer outline-none transition-colors ${
        STATUS_COLORS[t.status] ?? STATUS_COLORS["Application Submitted"]
      }`}
    >
      {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
    </select>
  );

  // Derived
  const allRoles = Array.from(new Set(records.map(r => r.job_role))).sort();
  const toggleRole = (role: string) => setSelectedRoles(prev => { const n=new Set(prev); n.has(role)?n.delete(role):n.add(role); return n; });
  const roleFiltered = selectedRoles.size > 0 ? records.filter(r => selectedRoles.has(r.job_role)) : records;
  const searchFiltered = searchTerm.trim()
    ? roleFiltered.filter(r => {
        const term = searchTerm.toLowerCase();
        return (r.client_name || "").toLowerCase().includes(term) ||
               (r.company_name || "").toLowerCase().includes(term) ||
               (r.email || "").toLowerCase().includes(term) ||
               (r.consultant_name || "").toLowerCase().includes(term);
      })
    : roleFiltered;

  // Analytics
  const thisMonth = searchFiltered.filter(t => isWithinInterval(new Date(t.created_at),{start:startOfMonth(new Date()),end:endOfMonth(new Date())}));
  const hiredTotal = searchFiltered.filter(t => t.status==="Hired"||t.status==="Offer Received").length;
  const avgDuration = searchFiltered.length ? Math.round(searchFiltered.reduce((s,t)=>s+(t.journey_duration_days||0),0)/searchFiltered.length) : 0;

  // Weekly snapshot
  const thisWeekStart = startOfWeek(new Date(),{weekStartsOn:1});
  const lastWeekStart = subWeeks(thisWeekStart,1);
  const lastWeekEnd   = endOfWeek(lastWeekStart,{weekStartsOn:1});
  const thisWeekN = searchFiltered.filter(r=>new Date(r.created_at)>=thisWeekStart).length;
  const lastWeekN = searchFiltered.filter(r=>{const d=new Date(r.created_at);return d>=lastWeekStart&&d<=lastWeekEnd;}).length;
  const weekPct   = lastWeekN>0 ? Math.round((thisWeekN-lastWeekN)/lastWeekN*100) : null;

  // Funnel
  const assessCount    = searchFiltered.filter(r=>r.status==="Assessment Stage").length;
  const interviewCount = searchFiltered.filter(r=>r.status==="Interview Stage").length;
  const total          = searchFiltered.length;

  // By Role
  const byRole = roleFiltered.reduce((acc:Record<string,Testimonial[]>,t)=>{const r=t.job_role||"Unknown";if(!acc[r])acc[r]=[];acc[r].push(t);return acc;},{});
  const rolesSorted = Object.entries(byRole).sort((a,b)=>b[1].length-a[1].length);

  // Bulk
  const allPageIds = searchFiltered.slice(0,500).map(r=>r.id);
  const allSel = allPageIds.length>0 && allPageIds.every(id=>selectedRows.has(id));
  const toggleAll = ()=>{ if(allSel) setSelectedRows(new Set()); else setSelectedRows(new Set(allPageIds)); };
  const toggleRow = (id:string)=>setSelectedRows(prev=>{const n=new Set(prev);n.has(id)?n.delete(id):n.add(id);return n;});

  const AB = ({t}:{t:Testimonial}) => (
    <div className="flex items-center gap-1">
      <button onClick={()=>copyLink(t.company_short_code)} className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"><Copy className="w-4 h-4"/></button>
      <Link href={`/journey/${t.company_short_code}`} target="_blank" className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><ExternalLink className="w-4 h-4"/></Link>
      <button onClick={()=>handleDelete(t.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4"/></button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

        {/* Title */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Interview Dashboard</h1>
          <p className="text-gray-500 mt-1 text-sm">Manage and share ApplyWizz client journeys</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-start gap-3 shadow-sm">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-blue-600 bg-blue-50"><Users className="w-5 h-5"/></div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Total</p>
              <p className="text-xl font-extrabold text-gray-900">{searchFiltered.length}</p>
              {weekPct!==null && (<span className={`text-xs font-semibold flex items-center gap-0.5 mt-0.5 ${weekPct>0?"text-emerald-600":weekPct<0?"text-red-500":"text-gray-400"}`}>
                {weekPct>0?<TrendingUp className="w-3 h-3"/>:weekPct<0?<TrendingDown className="w-3 h-3"/>:null}
                {weekPct>0?`▲${weekPct}%`:weekPct<0?`▼${Math.abs(weekPct)}%`:"—"} WoW
              </span>)}
            </div>
          </div>
          {[
            {icon:CalendarDays,label:"This Month",value:thisMonth.length,color:"text-indigo-600 bg-indigo-50"},
            {icon:CheckCircle2,label:"Hired/Offer",value:hiredTotal,color:"text-emerald-600 bg-emerald-50"},
            {icon:Clock,label:"Avg Duration",value:`${avgDuration}d`,color:"text-amber-600 bg-amber-50"},
          ].map(({icon:Icon,label,value,color})=>(
            <div key={label} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3 shadow-sm">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}><Icon className="w-5 h-5"/></div>
              <div className="min-w-0"><p className="text-xs text-gray-500 font-semibold uppercase tracking-wide truncate">{label}</p><p className="text-xl font-extrabold text-gray-900">{value}</p></div>
            </div>
          ))}
        </div>

        {/* Conversion Funnel */}
        {total>0&&(
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
            <p className="text-sm font-bold text-gray-700 mb-4">Conversion Funnel</p>
            <div className="space-y-3">
              {[
                {label:"Total",count:total,pct:100,color:"bg-blue-500"},
                {label:"Assessment",count:assessCount,pct:total?Math.round(assessCount/total*100):0,color:"bg-yellow-400"},
                {label:"Interview",count:interviewCount,pct:total?Math.round(interviewCount/total*100):0,color:"bg-amber-500"},
              ].map(({label,count,pct,color})=>(
                <div key={label} className="flex items-center gap-3">
                  <p className="text-sm text-gray-600 w-28 flex-shrink-0 font-medium">{label}</p>
                  <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{width:`${pct}%`}}/>
                  </div>
                  <div className="w-20 text-right text-sm"><span className="font-extrabold text-gray-800">{count}</span><span className="text-xs text-gray-400 ml-1">({pct}%)</span></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter Bar */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[120px]">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">From</label>
              <input type="date" value={fromDraft} onChange={e=>setFromDraft(e.target.value)} className="w-full h-10 bg-gray-50 border border-gray-200 rounded-xl px-3 text-sm text-gray-700 focus:border-blue-400 outline-none"/>
            </div>
            <div className="flex-1 min-w-[120px]">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">To</label>
              <input type="date" value={toDraft} onChange={e=>setToDraft(e.target.value)} className="w-full h-10 bg-gray-50 border border-gray-200 rounded-xl px-3 text-sm text-gray-700 focus:border-blue-400 outline-none"/>
            </div>
            <div className="flex-1 min-w-[130px]">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Status</label>
              <select value={statusDraft} onChange={e=>setStatusDraft(e.target.value)} className="w-full h-10 bg-gray-50 border border-gray-200 rounded-xl px-3 text-sm text-gray-700 outline-none cursor-pointer">
                <option value="All">All Statuses</option>
                <option value="Assessment Stage">Assessment Stage</option>
                <option value="Interview Stage">Interview Stage</option>
              </select>
            </div>
            <div className="flex-1 min-w-[160px]">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Search</label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                <input type="text" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} placeholder="Client, company, email…" className="w-full h-10 bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 text-sm text-gray-700 focus:border-blue-400 outline-none"/>
              </div>
            </div>
            <div className="flex gap-2 items-end flex-wrap">
              <button onClick={applyFilters} className="h-10 px-4 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"><Search className="w-4 h-4"/>Apply</button>
              <button onClick={resetFilters} className="h-10 px-3 text-gray-400 hover:text-red-500 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold">Reset</button>
              <button onClick={()=>exportCSV(searchFiltered,`applywizz-${fromDate}-${toDate}.csv`)} className="h-10 px-3 text-gray-600 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-100 flex items-center gap-1.5"><Download className="w-4 h-4"/><span className="hidden sm:inline">Export</span></button>
            </div>
            <div className="ml-auto flex gap-2">
              {([{mode:"card" as const,label:"Cards",icon:LayoutGrid},{mode:"table" as const,label:"Table",icon:List},{mode:"role" as const,label:"By Role",icon:BarChart2}]).map(({mode,label,icon:Icon})=>(
                <button key={mode} onClick={()=>setViewMode(mode)} className={`h-10 px-3 rounded-xl text-sm font-semibold flex items-center gap-1.5 border transition-colors ${viewMode===mode?"bg-gray-900 text-white border-gray-900":"bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}>
                  <Icon className="w-4 h-4"/><span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading?(
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="animate-spin w-9 h-9 border-4 border-blue-600 border-t-transparent rounded-full"/>
            <p className="text-sm text-gray-400">Loading records…</p>
          </div>

        ):viewMode==="card"?(
          /* CARD VIEW */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchFiltered.slice(0,300).map(t=>(
              <div key={t.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col hover:shadow-md transition-shadow relative group">
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={()=>handleDelete(t.id)} className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100"><Trash2 className="w-4 h-4"/></button>
                </div>
                <span className="text-xs text-gray-400 flex items-center gap-1 mb-2"><CalendarDays className="w-3 h-3"/>{format(parseISO(t.created_at),"MMM d, yyyy")}</span>
                <h3 className="text-lg font-bold text-gray-900 mb-0.5 pr-8">{t.company_name}</h3>
                <p className="text-sm text-gray-500 mb-1 flex items-center gap-1.5"><Briefcase className="w-3 h-3 flex-shrink-0"/><span className="truncate">{t.job_role||"Role not specified"}</span></p>
                {t.consultant_name&&<p className="text-xs text-gray-400 mb-2">Consultant: <span className="font-semibold text-gray-600">{t.consultant_name}</span></p>}
                <div className="mb-3"><StatusSelect t={t} /></div>
                <div className="bg-gray-50 rounded-xl p-3 mb-4 grid grid-cols-2 gap-2">
                  <div><p className="text-xs text-gray-400 uppercase font-semibold mb-0.5">Duration</p><p className="text-base font-black text-gray-900">{t.journey_duration_days}d</p></div>
                  <div><p className="text-xs text-gray-400 uppercase font-semibold mb-0.5">Client</p><p className="text-sm font-bold text-gray-800 truncate">{t.client_name}</p></div>
                  {t.salary_range&&<div className="col-span-2"><p className="text-xs text-gray-400 uppercase font-semibold mb-0.5">Salary</p><p className="text-sm font-bold text-gray-800">{t.salary_range}</p></div>}
                </div>
                <div className="mt-auto grid grid-cols-2 gap-2">
                  <button onClick={()=>copyLink(t.company_short_code)} className="flex items-center justify-center bg-gray-900 text-white py-2 rounded-xl font-medium text-xs hover:bg-gray-800 transition-colors"><Copy className="w-3 h-3 mr-1.5"/>Share URL</button>
                  <Link href={`/journey/${t.company_short_code}`} target="_blank" className="flex items-center justify-center bg-blue-50 text-blue-700 border border-blue-100 py-2 rounded-xl font-medium text-xs hover:bg-blue-100 transition-colors"><ExternalLink className="w-3 h-3 mr-1.5"/>Preview</Link>
                </div>
              </div>
            ))}
            {searchFiltered.length>300&&<div className="col-span-full text-center py-4 text-sm text-gray-400">Showing first 300 of {searchFiltered.length} — use Table view for full data</div>}
            {!searchFiltered.length&&<div className="col-span-full py-24 text-center text-gray-400"><Zap className="w-12 h-12 mx-auto mb-4 opacity-30"/><p className="text-lg font-semibold">No journeys matched this filter</p></div>}
          </div>

        ):viewMode==="table"?(
          /* TABLE VIEW */
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
            {selectedRows.size>0&&(
              <div className="px-5 py-3 bg-blue-50 border-b border-blue-100 flex items-center gap-4 flex-wrap">
                <span className="text-sm font-semibold text-blue-700">{selectedRows.size} selected</span>
                <button onClick={bulkDelete} className="text-sm px-3 py-1.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 flex items-center gap-1.5"><Trash2 className="w-4 h-4"/>Delete Selected</button>
                <button onClick={()=>exportCSV(searchFiltered.filter(r=>selectedRows.has(r.id)),"applywizz-selected.csv")} className="text-sm px-3 py-1.5 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 flex items-center gap-1.5"><Download className="w-4 h-4"/>Export Selected</button>
                <button onClick={()=>setSelectedRows(new Set())} className="text-sm text-gray-500 hover:text-gray-800 ml-auto font-medium">Clear</button>
              </div>
            )}
            <div className="px-5 py-3 border-b border-gray-100"><p className="text-sm font-bold text-gray-700">{searchFiltered.length} records</p></div>
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-500 font-bold">
                  <th className="px-4 py-3 w-8"><input type="checkbox" checked={allSel} onChange={toggleAll} className="w-4 h-4 cursor-pointer rounded"/></th>
                  <th className="text-left px-4 py-3">Date</th>
                  <th className="text-left px-4 py-3">Company</th>
                  <th className="text-left px-4 py-3">Client</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Email</th>
                  <th className="text-left px-4 py-3 hidden lg:table-cell">Consultant</th>
                  <th className="text-left px-4 py-3">Role</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-right px-4 py-3">Days</th>
                  <th className="text-left px-4 py-3 hidden xl:table-cell">Salary</th>
                  <th className="text-center px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {searchFiltered.slice(0,500).map(t=>(
                  <tr key={t.id} className={`hover:bg-gray-50/70 transition-colors ${selectedRows.has(t.id)?"bg-blue-50/50":""}`}>
                    <td className="px-4 py-3 w-8"><input type="checkbox" checked={selectedRows.has(t.id)} onChange={()=>toggleRow(t.id)} className="w-4 h-4 cursor-pointer rounded"/></td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-500 text-xs">{format(parseISO(t.created_at),"MMM d, yy")}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">{t.company_name}</td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{t.client_name}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap hidden md:table-cell">{t.email}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap hidden lg:table-cell">{t.consultant_name||"—"}</td>
                    <td className="px-4 py-3"><span className="max-w-[140px] block truncate text-gray-700" title={t.job_role}>{t.job_role}</span></td>
                    <td className="px-4 py-3"><StatusSelect t={t} /></td>
                    <td className="px-4 py-3 text-right font-bold text-gray-800">{t.journey_duration_days}d</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap hidden xl:table-cell">{t.salary_range||"—"}</td>
                    <td className="px-4 py-3"><div className="flex justify-center"><AB t={t}/></div></td>
                  </tr>
                ))}
                {searchFiltered.length>500&&<tr><td colSpan={11} className="text-center py-3 text-xs text-gray-400">Showing 500 of {searchFiltered.length} — narrow filters for more</td></tr>}
                {!searchFiltered.length&&<tr><td colSpan={11} className="text-center py-16 text-gray-400 font-semibold">No journeys found.</td></tr>}
              </tbody>
            </table>
          </div>

        ):(
          /* BY ROLE VIEW */
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-gray-700">Filter by Role <span className="text-gray-400 font-normal">({selectedRoles.size===0?"All":selectedRoles.size+" selected"})</span></p>
                <div className="flex gap-2">
                  <button onClick={()=>setSelectedRoles(new Set(allRoles))} className="text-xs px-3 py-1.5 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-700">Select All</button>
                  <button onClick={()=>setSelectedRoles(new Set())} className="text-xs px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg font-semibold hover:bg-gray-200">Clear</button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {allRoles.map(role=>{const active=selectedRoles.has(role);return(
                  <button key={role} onClick={()=>toggleRole(role)} className={`text-xs px-3 py-1.5 rounded-full border font-semibold transition-colors ${active?"bg-blue-600 text-white border-blue-600":selectedRoles.size===0?"bg-gray-50 text-gray-700 border-gray-200 hover:border-blue-400":"bg-white text-gray-400 border-gray-200 hover:border-blue-300"}`}>{role}</button>
                );})}
              </div>
            </div>
            {rolesSorted.length===0?(
              <div className="py-24 text-center text-gray-400"><BarChart2 className="w-12 h-12 mx-auto mb-4 opacity-30"/><p className="text-lg font-semibold">No data to analyse</p></div>
            ):rolesSorted.map(([role,entries])=>{
              const tmCount=entries.filter(t=>isWithinInterval(new Date(t.created_at),{start:startOfMonth(new Date()),end:endOfMonth(new Date())})).length;
              const aC=entries.filter(t=>t.status==="Assessment Stage").length;
              const iC=entries.filter(t=>t.status==="Interview Stage").length;
              return(
                <div key={role} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <Link href={`/admin/role/${encodeURIComponent(role)}`} className="w-full flex items-center justify-between px-6 py-5 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4 flex-wrap">
                      <p className="font-bold text-gray-900 text-base w-48 shrink-0">{role}</p>
                      <div className="flex items-center gap-4">
                        {[{label:"Total",v:entries.length,c:"text-blue-600 bg-blue-50",I:Users},{label:"Assess",v:aC,c:"text-yellow-600 bg-yellow-50",I:Activity},{label:"Interview",v:iC,c:"text-amber-600 bg-amber-50",I:CalendarDays},{label:"This Month",v:tmCount,c:"text-indigo-600 bg-indigo-50",I:CalendarDays}].map(({label,v,c,I:Icon})=>(
                          <div key={label} className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${c}`}><Icon className="w-3.5 h-3.5"/></div>
                            <div><p className="text-xs text-gray-400 font-semibold">{label}</p><p className="text-base font-extrabold" style={{color:"inherit"}}>{v}</p></div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-blue-600 flex-shrink-0"><span className="text-sm font-semibold">View details</span><ArrowRight className="w-4 h-4"/></div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
