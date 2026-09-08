import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'wouter';
import { ChevronLeft, Mail, Phone, FileText, BookOpen, Archive } from 'lucide-react';

interface ParentRow {
  name: string;
  relationship?: string | null;
  email?: string | null;
  phone?: string | null;
  is_primary?: boolean;
}
interface StudentDetail {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  year_group_code?: string | null;
  school?: string | null;
  roll_number?: string | null;
  address?: string | null;
  notes?: string | null;
  learningGoals?: string | null;
  learning_goals?: string | null;
  status?: string;
  archived_at?: string | null;
  archivedByName?: string | null;
  updated_at?: string | null;
  updatedByName?: string | null;
  parents?: ParentRow[];
  user?: { firstName?: string; lastName?: string; email?: string; profileImageUrl?: string | null };
}
interface ClassRow {
  id: string;
  name: string;
  subject?: string | null;
  isActive?: boolean;
}

export default function StudentProfile() {
  const params = useParams<{ id: string }>();

  const { data: student, isLoading } = useQuery<StudentDetail>({
    queryKey: [`/api/students/${params.id}`],
    enabled: !!params.id,
  });
  const { data: classes = [] } = useQuery<ClassRow[]>({
    queryKey: [`/api/students/${params.id}/classes`],
    enabled: !!params.id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 font-semibold">Student not found.</p>
          <Link href="/company/students" className="mt-3 inline-block text-indigo-600 text-sm font-semibold hover:underline">
            Back to students
          </Link>
        </div>
      </div>
    );
  }

  const firstName = student.first_name ?? student.user?.firstName ?? '';
  const lastName = student.last_name ?? student.user?.lastName ?? '';
  const name = `${firstName} ${lastName}`.trim() || 'Student';
  const goals = student.learningGoals ?? student.learning_goals ?? '';
  const activeClasses = classes.filter(c => c.isActive !== false);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-indigo-700 text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Link href="/company/students" className="w-9 h-9 rounded-xl hover:bg-white/10 flex items-center justify-center flex-shrink-0">
            <ChevronLeft size={16} />
          </Link>
          <div className="w-12 h-12 rounded-2xl bg-white/15 overflow-hidden flex items-center justify-center flex-shrink-0">
            {student.user?.profileImageUrl ? (
              <img src={student.user.profileImageUrl} alt={name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-lg font-black">{firstName[0]?.toUpperCase()}{lastName[0]?.toUpperCase()}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">Student Profile</p>
            <h1 className="text-xl font-black truncate">{name}</h1>
          </div>
          {student.status === 'archived' && (
            <span className="text-[10px] font-bold uppercase tracking-wide bg-rose-500/30 text-rose-100 px-2.5 py-1.5 rounded-lg flex items-center gap-1 flex-shrink-0">
              <Archive size={12} /> Archived
            </span>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-xs font-bold uppercase text-gray-400">Year Group</p>
            <p className="font-bold text-gray-900">{student.year_group_code ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-gray-400">School</p>
            <p className="font-bold text-gray-900">{student.school ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-gray-400">Roll Number</p>
            <p className="font-bold text-gray-900">{student.roll_number ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-gray-400">Address</p>
            <p className="font-bold text-gray-900 truncate">{student.address ?? '—'}</p>
          </div>
          {student.updatedByName && (
            <p className="col-span-2 sm:col-span-4 text-[11px] text-gray-400 pt-1 border-t border-gray-100">
              Last updated by {student.updatedByName}{student.updated_at ? ` on ${new Date(student.updated_at).toLocaleDateString('en-AU')}` : ''}
            </p>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">
            <BookOpen size={14} className="text-indigo-500" /> Enrolled Classes ({activeClasses.length})
          </h3>
          {activeClasses.length === 0 ? (
            <p className="text-sm text-gray-400">Not enrolled in any classes.</p>
          ) : (
            <ul className="space-y-2">
              {activeClasses.map(c => (
                <li key={c.id}>
                  <Link href={`/company/classes/${c.id}`} className="text-sm font-semibold text-indigo-600 hover:underline">{c.name}</Link>
                  {c.subject && <span className="text-xs text-gray-400"> · {c.subject}</span>}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">Parents / Guardians</h3>
          {(student.parents ?? []).length === 0 ? (
            <p className="text-sm text-gray-400">No contacts on file.</p>
          ) : (
            <div className="space-y-3">
              {(student.parents ?? []).map((p, i) => (
                <div key={i} className="border border-gray-100 rounded-xl p-3">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{p.name}</p>
                    {p.is_primary && <span className="text-[10px] font-bold uppercase bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">Primary</span>}
                    {p.relationship && <span className="text-xs text-gray-400">{p.relationship}</span>}
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                    {p.email && <span className="flex items-center gap-1"><Mail size={11} /> {p.email}</span>}
                    {p.phone && <span className="flex items-center gap-1"><Phone size={11} /> {p.phone}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {(student.notes || goals) && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
              <FileText size={14} className="text-indigo-500" /> Notes
            </h3>
            {goals && (
              <div>
                <p className="text-xs font-bold uppercase text-gray-400 mb-1">Learning Goals</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{goals}</p>
              </div>
            )}
            {student.notes && (
              <div>
                <p className="text-xs font-bold uppercase text-gray-400 mb-1">General Notes</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{student.notes}</p>
              </div>
            )}
          </div>
        )}

        <Link href="/company/students" className="inline-block text-sm font-semibold text-indigo-600 hover:underline">
          Edit this student from the Students list →
        </Link>
      </main>
    </div>
  );
}
