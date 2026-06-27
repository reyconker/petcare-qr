import { createClient } from '@/lib/supabase/server';
import { getDogId } from '@/lib/supabase/getDogId';
import { FlaskConical, Image as ImageIcon, Trash2, Calendar } from 'lucide-react';
import { deleteExam } from '@/app/actions/exams';
import { AddExamButton, EditExamButton, ViewFileButton } from './ExamForms';
import { Exam } from '@/types';

const REASON_LABELS: Record<string, string> = {
  'cirugía': 'Cirugía',
  'enfermedad': 'Enfermedad',
  'control sano': 'Control sano',
  'seguimiento': 'Seguimiento',
  'otro': 'Otro',
};

async function getExams(): Promise<Exam[]> {
  const supabase = await createClient();
  const dogId = await getDogId();

  const { data: rawExams } = await supabase
    .from('exams')
    .select('*')
    .eq('dog_id', dogId)
    .order('exam_date', { ascending: false });

  if (!rawExams) return [];

  // Generate signed URLs for files
  const exams = await Promise.all(
    rawExams.map(async (e) => {
      let fileUrl = e.file_url ?? '';
      if (fileUrl && !fileUrl.startsWith('http')) {
        const { data } = await supabase.storage.from('exams').createSignedUrl(fileUrl, 3600);
        if (data) fileUrl = data.signedUrl;
      }
      return {
        id: e.id,
        dogId: e.dog_id,
        name: e.name ?? '',
        examDate: e.exam_date ?? '',
        reason: e.reason ?? 'otro',
        clinic: e.clinic ?? '',
        fileUrl,
        observations: e.observations ?? '',
        createdAt: e.created_at ?? '',
      } as Exam;
    })
  );

  return exams;
}

export default async function ExamenesPage() {
  const exams = await getExams();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FlaskConical className="text-teal-600" /> Exámenes
          </h1>
          <p className="text-gray-500 text-sm mt-1">Resultados y archivos de exámenes clínicos</p>
        </div>
        <AddExamButton />
      </div>

      {exams.length === 0 ? (
        <div className="flex flex-col items-center justify-center bg-white border border-dashed border-teal-200 rounded-xl p-12 text-center">
          <div className="bg-teal-50 p-5 rounded-full mb-4">
            <FlaskConical className="w-12 h-12 text-teal-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">Sin exámenes registrados</h3>
          <p className="text-gray-500 mb-6 max-w-md">
            Guarda los exámenes clínicos y sus archivos para tener todo el historial en un solo lugar.
          </p>
          <AddExamButton />
        </div>
      ) : (
        <div className="space-y-4">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="text-base font-bold text-gray-800">{exam.name}</h3>
                    <span className="text-xs bg-teal-50 text-teal-700 border border-teal-100 px-2 py-0.5 rounded-full font-medium">
                      {REASON_LABELS[exam.reason] ?? exam.reason}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> {exam.examDate}
                    </span>
                    {exam.clinic && <span>{exam.clinic}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <EditExamButton exam={exam} />
                  <form
                    action={async () => {
                      'use server';
                      await deleteExam(exam.id);
                    }}
                  >
                    <button
                      type="submit"
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>

              {exam.observations && (
                <p className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-600 whitespace-pre-line">
                  {exam.observations}
                </p>
              )}

              {/* Archivo */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                {exam.fileUrl ? (
                  <ViewFileButton fileUrl={exam.fileUrl} />
                ) : (
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <ImageIcon className="w-4 h-4" />
                    <span>Sin archivo adjunto</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
