"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";
import {
  ArrowLeft, Copy, ExternalLink, CalendarDays, Activity,
  Trash2, Clock, Users, CheckCircle2, LayoutGrid, List, Search,
  Briefcase
} from "lucide-react";
import Link from "next/link";

type Testimonial = {
  id: string; job_role: string; status: string; client_name: string;
  email: string; company_name: string; company_short_code: string;
  journey_duration_days: number; salary_range: string; created_at: string;
};

const STATUS_COLORS: Record<string, string> = {
  Hired: "bg-emerald-50 text-emerald-700 border-emerald-100",
  "Offer Received": "bg-blue-50 text-blue-700 border-blue-100",
  "Final Round": "bg-sky-50 text-sky-700 border-sky-100",
  "Interview Stage": "bg-amber-50 text-amber-700 border-amber-100",
  "Assessment Stage": "bg-yellow-50 text-yellow-700 border-yellow-100",
  "Application Submitted": "bg-gray-50 text-gray-600 border-gray-200",
};

const todayStr = () => new Date().toISOString().split("T")[0];
const monthStartStr = () => { const d = new Date(); d.setDate(1); return d.toISOString().split("T")[0]; };

export default function RoleDetailPage() {
  const params = useParams();
  const roleName = decodeURIComponent(params.roleName as string);

  const [records, setRecords] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"card" | "table">("table");
  const [sortBy, setSortBy] = useState<keyof Testimonial>("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // Draft filters — only applied when user clicks "Apply"
  const [fromDraft, setFromDraft] = useState(monthStartStr());
  const [toDraft, setToDraft] = useState(todayStr());
  const [statusDraft, setStatusDraft] = useState("All");

  // Applied filters — trigger fetch
  const [fromDate, setFromDate] = useState(monthStartStr());
  const [toDate, setToDate] = useState(todayStr());
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("testimonials")
      .select("id, job_role, status, client_name, email, company_name, company_short_code, journey_duration_days, salary_range, created_at")
      .eq("job_role", roleName)
      .order("created_at", { ascending: false });

    if (fromDate) query = query.gte("created_at", fromDate + "T00:00:00.000Z");
    if (toDate)   query = query.lte("created_at", toDate   + "T23:59:59.999Z");
    if (statusFilter !== "All") query = query.eq("status", statusFilter);

    const PAGE = 1000;
    let all: Testimonial[] = [];
    let page = 0;
    let hasMore = true;
    while (hasMore) {
      const { data, error } = await query.range(page * PAGE, (page + 1) * PAGE - 1);
      if (error || !data) break;
      all = [...all, ...data];
      hasMore = data.length === PAGE;
      page++;
    }
    setRecords(all);
    setLoading(false);
  }, [roleName, fromDate, toDate, statusFilter]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const applyFilters = () => {
    setFromDate(fromDraft);
    setToDate(toDraft);
    setStatusFilter(statusDraft);
  };

  const resetFilters = () => {
    const f = monthStartStr(); const t = todayStr();
    setFromDraft(f); setToDraft(t); setStatusDraft("All");
    setFromDate(f); setToDate(t); setStatusFilter("All");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this journey?")) return;
    await supabase.from("testimonials").delete().eq("id", id);
    fetchRecords();
  };

  const copyLink = (shortCode: string) =>
    navigator.clipboard.writeText(`${window.location.origin}/journey/${shortCode}`);

  // KPIs
  const thisMonth = records.filter(t =>
    isWithinInterval(new Date(t.created_at), { start: startOfMonth(new Date()), end: endOfMonth(new Date()) })
  );
  const assessmentCount = records.filter(t => t.status === "Assessment Stage").length;
  const interviewCount  = records.filter(t => t.status === "Interview Stage").length;
  const avgDuration = records.length
    ? Math.round(records.reduce((s, t) => s + (t.journey_duration_days || 0), 0) / records.length)
    : 0;

  // Sortable table data
  const handleSort = (col: keyof Testimonial) => {
    if (sortBy === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortDir("asc"); }
  };
  const SortIcon = ({col}:{col:keyof Testimonial}) => sortBy!==col ? <span className="opacity-20 ml-1">↕</span> : sortDir==="asc" ? <span className="ml-1 text-blue-600">▲</span> : <span className="ml-1 text-blue-600">▼</span>;
  const sorted = [...records].sort((a, b) => {
    const va = a[sortBy], vb = b[sortBy];
    const cmp = typeof va === "number" ? (va as number) - (vb as number) : String(va).localeCompare(String(vb));
    return sortDir === "asc" ? cmp : -cmp;
  });

  const ActionBtns = ({ t }: { t: Testimonial }) => (
    <div className="flex items-center gap-1">
      <button onClick={() => copyLink(t.company_short_code)}
        className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors" title="Copy URL">
        <Copy className="w-4 h-4" />
      </button>
      <Link href={`/journey/${t.company_short_code}`} target="_blank"
        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Preview">
        <ExternalLink className="w-4 h-4" />
      </Link>
      <button onClick={() => handleDelete(t.id)}
        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

        {/* Back + Title */}
        <div className="mb-6">
          <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 font-semibold mb-3 transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">{roleName}</h1>
          <p className="text-gray-500 mt-1 text-sm">Role-level journey detail — ApplyWizz</p>
        </div>

        {/* KPI Cards — 2 cols on mobile, 5 on desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          {[
            { icon: Users,        label: "Total",       value: records.length,   color: "text-blue-600 bg-blue-50" },
            { icon: Activity,     label: "Assessment",  value: assessmentCount,  color: "text-yellow-600 bg-yellow-50" },
            { icon: CheckCircle2, label: "Interview",   value: interviewCount,   color: "text-amber-600 bg-amber-50" },
            { icon: CalendarDays, label: "This Month",  value: thisMonth.length, color: "text-indigo-600 bg-indigo-50" },
            { icon: Clock,        label: "Avg Duration",value: `${avgDuration}d`,color: "text-emerald-600 bg-emerald-50" },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-gray-100 p-3 sm:p-4 flex items-center gap-3 shadow-sm">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide truncate">{label}</p>
                <p className="text-lg sm:text-xl font-extrabold text-gray-900">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filter Bar — stacks on mobile */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[130px]">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">From Date</label>
              <input type="date" value={fromDraft} onChange={e => setFromDraft(e.target.value)}
                className="w-full h-10 bg-gray-50 border border-gray-200 rounded-xl px-3 text-sm text-gray-700 focus:border-blue-400 outline-none" />
            </div>
            <div className="flex-1 min-w-[130px]">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">To Date</label>
              <input type="date" value={toDraft} onChange={e => setToDraft(e.target.value)}
                className="w-full h-10 bg-gray-50 border border-gray-200 rounded-xl px-3 text-sm text-gray-700 focus:border-blue-400 outline-none" />
            </div>
            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Status</label>
              <select value={statusDraft} onChange={e => setStatusDraft(e.target.value)}
                className="w-full h-10 bg-gray-50 border border-gray-200 rounded-xl px-3 text-sm text-gray-700 outline-none cursor-pointer">
                <option value="All">All Statuses</option>
                <option value="Assessment Stage">Assessment Stage</option>
                <option value="Interview Stage">Interview Stage</option>
              </select>
            </div>
            <div className="flex gap-2 items-end">
              <button onClick={applyFilters}
                className="h-10 px-4 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2">
                <Search className="w-4 h-4" /> Apply
              </button>
              <button onClick={resetFilters}
                className="h-10 px-3 text-gray-400 hover:text-red-500 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-100 transition-colors">
                Reset
              </button>
            </div>
            {/* View toggle */}
            <div className="flex gap-2 ml-auto">
              {([
                { mode: "table" as const, icon: List, label: "Table" },
                { mode: "card" as const, icon: LayoutGrid, label: "Cards" },
              ]).map(({ mode, icon: Icon, label }) => (
                <button key={mode} onClick={() => setViewMode(mode)}
                  className={`h-10 px-3 rounded-xl text-sm font-semibold flex items-center gap-1.5 border transition-colors ${viewMode === mode ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}>
                  <Icon className="w-4 h-4" /> <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="animate-spin w-9 h-9 border-4 border-blue-600 border-t-transparent rounded-full" />
            <p className="text-sm text-gray-400">Loading records…</p>
          </div>

        ) : viewMode === "card" ? (
          /* ══ CARD VIEW ══ */
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {records.map(t => (
              <div key={t.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col hover:shadow-md transition-shadow relative group">
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleDelete(t.id)} className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100"><Trash2 className="w-4 h-4" /></button>
                </div>
                <span className="text-xs text-gray-400 flex items-center gap-1 mb-2">
                  <CalendarDays className="w-3 h-3" /> {format(parseISO(t.created_at), "MMM d, yyyy")}
                </span>
                <h3 className="text-lg font-bold text-gray-900 mb-0.5 pr-8">{t.company_name}</h3>
                <p className="text-sm text-gray-500 mb-3 flex items-center gap-1.5">
                  <Briefcase className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{t.client_name}</span>
                </p>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded border flex items-center gap-1 w-fit mb-3 ${STATUS_COLORS[t.status] ?? STATUS_COLORS["Application Submitted"]}`}>
                  <Activity className="w-3 h-3" /> {t.status}
                </span>
                <div className="bg-gray-50 rounded-xl p-3 mb-4 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase mb-0.5">Duration</p>
                    <p className="font-black text-gray-900">{t.journey_duration_days}d</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-semibold uppercase mb-0.5">Salary</p>
                    <p className="font-bold text-gray-800 truncate">{t.salary_range || "—"}</p>
                  </div>
                </div>
                <div className="mt-auto grid grid-cols-2 gap-2">
                  <button onClick={() => copyLink(t.company_short_code)}
                    className="flex items-center justify-center bg-gray-900 text-white py-2 rounded-xl font-medium text-xs hover:bg-gray-800 transition-colors">
                    <Copy className="w-3 h-3 mr-1.5" /> Share
                  </button>
                  <Link href={`/journey/${t.company_short_code}`} target="_blank"
                    className="flex items-center justify-center bg-blue-50 text-blue-700 border border-blue-100 py-2 rounded-xl font-medium text-xs hover:bg-blue-100 transition-colors">
                    <ExternalLink className="w-3 h-3 mr-1.5" /> Preview
                  </Link>
                </div>
              </div>
            ))}
            {!records.length && (
              <div className="col-span-full py-20 text-center text-gray-400">
                <p className="text-lg font-semibold">No records found — try adjusting the filters and clicking Apply</p>
              </div>
            )}
          </div>

        ) : (
          /* ══ TABLE VIEW ══ */
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
            <div className="px-5 py-3 border-b border-gray-100">
              <p className="text-sm font-bold text-gray-700">{records.length} records</p>
            </div>
              <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-500 font-bold">
                  {(["created_at","company_name","client_name","email","status","journey_duration_days","salary_range"] as (keyof Testimonial)[]).map((col,i)=>(
                    <th key={col} onClick={()=>handleSort(col)} className={`text-left px-4 py-3 cursor-pointer hover:text-gray-900 select-none whitespace-nowrap ${i===5?"text-right":""} ${[3,6].includes(i)?"hidden md:table-cell lg:table-cell":""}`}>
                      {["Date","Company","Client","Email","Status","Days","Salary"][i]}<SortIcon col={col}/>
                    </th>
                  ))}
                  <th className="text-center px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sorted.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-gray-500 text-xs">{format(parseISO(t.created_at), "MMM d, yy")}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">{t.company_name}</td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{t.client_name}</td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{t.email}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded border whitespace-nowrap ${STATUS_COLORS[t.status] ?? STATUS_COLORS["Application Submitted"]}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-gray-800">{t.journey_duration_days}d</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap hidden lg:table-cell">{t.salary_range || "—"}</td>
                    <td className="px-4 py-3"><div className="flex justify-center"><ActionBtns t={t} /></div></td>
                  </tr>
                ))}
                {!records.length && (
                  <tr><td colSpan={8} className="text-center py-16 text-gray-400 font-semibold">
                    No records — click Apply to search
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}
