import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'wouter';
import {
  ChevronLeft, CheckSquare, AlertCircle, Clock, Users, BarChart2, Inbox, Edit2,
} from 'lucide-react';

interface AdminProfile { userId: string; companyId: string; }
interface Term { id: string; name: string; }
interface OversightData {
  metrics: {
    allocated: number;
    submitted: number;
    submittedPct: number;
    onTime: number;
    notSubmitted: number;
  };
  marking: {
    avgTurnaroundDays: number;
    awaitingReview: number;
    inReview: number;
  };
  aiVsTutor: {
    avgScoreDelta: number;
    pctAdjusted: number;
  };
  byTutor: {
    tutorName: string;
    marked: number;
    pending: number;
    avgTurnaroundDays: number;
    avgAdjustment: number;
  }[];
}

export default function AssignmentOversight() {
  const { user } = useAuth();
  const [termId, setTermId] = useState('');

  const { data: adminProfile } = useQuery<AdminProfile>({
    queryKey: [`/api/admin/company-admin/${user?.id}`],
    enabled: !!user?.id,
  });
  const companyId = adminProfile?.companyId;

  const { data: terms = [] } = useQuery<Term[]>({
    queryKey: [`/api/companies/${companyId}/terms`],
    enabled: !!companyId,
  });

  const { data, isLoading } = useQuery<OversightData>({
    queryKey: [`/api/companies/${companyId}/assignment-oversight`, termId],
    queryFn: async () => {
      const p = termId ? `?termId=${termId}` : '';
      const res = await fetch(`/api/companies/${companyId}/assignment-oversight${p}`);
      return res.json();
    },
    enabled: !!companyId,
  });

  const metricCards = [
    {
      label: 'Allocated',
      value: data?.metrics?.allocated ?? 0,
      sub: undefined as string | undefined,
      icon: <CheckSquare size={16} />,
      cls: 'text-indigo-700',
      bg: 'bg-indigo-50',
    },
    {
      label: 'Submitted',
      value: data?.metrics?.submitted ?? 0,
      sub: data?.metrics?.submittedPct != null ? `${data.metrics.submittedPct}%` : undefined,
      icon: <Inbox size={16} />,
      cls: 'text-green-700',
      bg: 'bg-green-50',
    },
    {
      label: 'On-time',
      value: data?.metrics?.onTime ?? 0,
      sub: undefined,
      icon: <Clock size={16} />,
      cls: 'text-blue-700',
      bg: 'bg-blue-50',
    },
    {
      label: 'Not Submitted',
      value: data?.metrics?.notSubmitted ?? 0,
      sub: undefined,
      icon: <AlertCircle size={16} />,
      cls: 'text-rose-700',
      bg: 'bg-rose-50',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-indigo-700 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Link href="/company" className="w-9 h-9 rounded-xl hover:bg-white/10 flex items-center justify-center">
            <ChevronLeft size={16} />
          </Link>
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">Reports</p>
            <h1 className="text-xl font-black">Assignment Oversight</h1>
          </div>
          <select
            value={termId}
            onChange={e => setTermId(e.target.value)}
            className="bg-white/15 text-white text-sm font-semibold rounded-xl px-3 py-2 border border-white/20"
          >
            <option value="">All Terms</option>
            {terms.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <Link
            href="/company/library-marking"
            className="bg-white/15 hover:bg-white/25 text-white text-sm font-bold px-3 py-2 rounded-xl flex items-center gap-2"
          >
            <Edit2 size={14} /> Marking Queue
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* 4 metric cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {metricCards.map(card => (
            <div key={card.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className={`w-8 h-8 rounded-lg ${card.bg} ${card.cls} flex items-center justify-center mb-2`}>
                {card.icon}
              </div>
              <p className="text-xs font-bold uppercase tracking-wide text-gray-500">{card.label}</p>
              {isLoading ? (
                <div className="h-7 bg-gray-100 rounded animate-pulse mt-1" />
              ) : (
                <p className={`text-2xl font-black ${card.cls}`}>
                  {card.value}
                  {card.sub && <span className="text-sm font-semibold ml-1 text-gray-500">({card.sub})</span>}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Marking overview */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
              <BarChart2 size={14} className="text-indigo-500" /> Marking Overview
            </h3>
            <Link href="/company/library-marking" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              Open Queue →
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              {
                label: 'Avg Turnaround',
                value: data?.marking?.avgTurnaroundDays != null ? `${data.marking.avgTurnaroundDays.toFixed(1)}d` : '—',
                cls: 'text-indigo-700',
              },
              {
                label: 'Awaiting Review',
                value: data?.marking?.awaitingReview ?? '—',
                cls: 'text-amber-700',
              },
              {
                label: 'In Review',
                value: data?.marking?.inReview ?? '—',
                cls: 'text-blue-700',
              },
            ].map(m => (
              <div key={m.label} className="text-center p-3 rounded-xl bg-gray-50">
                {isLoading ? (
                  <div className="h-8 bg-gray-200 rounded animate-pulse mx-auto w-16 mb-1" />
                ) : (
                  <p className={`text-2xl font-black ${m.cls}`}>{String(m.value)}</p>
                )}
                <p className="text-xs font-semibold text-gray-500 mt-1">{m.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* AI vs Tutor */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">AI vs Tutor Marking</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 rounded-xl bg-indigo-50">
              {isLoading ? (
                <div className="h-8 bg-indigo-200 rounded animate-pulse mx-auto w-20 mb-1" />
              ) : (
                <p className="text-2xl font-black text-indigo-700">
                  {data?.aiVsTutor?.avgScoreDelta != null
                    ? `${data.aiVsTutor.avgScoreDelta > 0 ? '+' : ''}${data.aiVsTutor.avgScoreDelta.toFixed(1)}`
                    : '—'}
                </p>
              )}
              <p className="text-xs font-semibold text-indigo-600 mt-1">Avg Score Delta</p>
              <p className="text-[10px] text-indigo-400">Tutor score minus AI score</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-amber-50">
              {isLoading ? (
                <div className="h-8 bg-amber-200 rounded animate-pulse mx-auto w-20 mb-1" />
              ) : (
                <p className="text-2xl font-black text-amber-700">
                  {data?.aiVsTutor?.pctAdjusted != null ? `${data.aiVsTutor.pctAdjusted.toFixed(0)}%` : '—'}
                </p>
              )}
              <p className="text-xs font-semibold text-amber-600 mt-1">% Adjusted</p>
              <p className="text-[10px] text-amber-400">Submissions where tutor changed score</p>
            </div>
          </div>
        </div>

        {/* By Tutor table */}
        {data?.byTutor && data.byTutor.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <Users size={14} className="text-indigo-500" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">By Tutor</h3>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs font-bold uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-2 text-left">Tutor</th>
                  <th className="px-5 py-2 text-right">Marked</th>
                  <th className="px-5 py-2 text-right">Pending</th>
                  <th className="px-5 py-2 text-right">Avg Turnaround</th>
                  <th className="px-5 py-2 text-right">Avg Adjustment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.byTutor.map(row => (
                  <tr key={row.tutorName} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-semibold text-gray-800">{row.tutorName}</td>
                    <td className="px-5 py-3 text-right text-emerald-700 font-semibold">{row.marked}</td>
                    <td className="px-5 py-3 text-right text-amber-700 font-semibold">{row.pending}</td>
                    <td className="px-5 py-3 text-right text-gray-600">{row.avgTurnaroundDays.toFixed(1)}d</td>
                    <td className="px-5 py-3 text-right text-gray-600">
                      {row.avgAdjustment > 0 ? '+' : ''}{row.avgAdjustment.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && (!data?.byTutor || data.byTutor.length === 0) && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center text-gray-400">
            <p className="text-sm">No marking data available for this period.</p>
          </div>
        )}
      </main>
    </div>
  );
}
