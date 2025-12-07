import React from 'react';
import { ArrowLeft, CheckSquare, Square, Calendar, Clock } from 'lucide-react';
import { Project, TaskStatus } from '../types';

interface ProjectViewProps {
  projectId: string | null;
  projects: Project[];
  onNavigate: (view: 'list' | 'edit', projectId?: string | null) => void;
}

// --- Helper Functions ---
const getDDay = (dateString?: string) => {
  if (!dateString) return '';
  const target = new Date(dateString);
  const today = new Date();
  target.setHours(0,0,0,0);
  today.setHours(0,0,0,0);
  
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'D-Day';
  return diffDays > 0 ? `D-${diffDays}` : `D+${Math.abs(diffDays)}`;
};

const getDDayStyle = (dateString?: string, status?: string) => {
  if (status === '완료') return 'text-slate-400 font-normal';
  if (!dateString) return 'text-slate-400';
  
  const dday = getDDay(dateString);
  if (dday.startsWith('D+')) return 'text-red-600 font-bold'; 
  if (dday === 'D-Day') return 'text-red-600 font-bold';
  const days = parseInt(dday.replace('D-', ''));
  if (days <= 7) return 'text-orange-600 font-bold';
  return 'text-blue-600 font-medium';
};

// --- Sub Components ---

const StatusCheckbox = ({ label, isChecked, colorClass }: { label: string, isChecked: boolean, colorClass?: string }) => (
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded border ${isChecked ? (colorClass || 'bg-slate-100 border-slate-300') : 'bg-transparent border-transparent opacity-50'}`}>
        <div className={`w-4 h-4 border rounded flex items-center justify-center ${isChecked ? 'bg-slate-800 border-slate-800' : 'border-slate-300'}`}>
           {isChecked && <div className="w-2 h-2 bg-white rounded-sm"></div>}
        </div>
        <span className={`text-xs ${isChecked ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>{label}</span>
    </div>
);

const TaskStatusDisplay = ({ label, status, date }: { label: string, status: TaskStatus, date?: string }) => {
    return (
        <div className="flex flex-col gap-2 p-3 bg-slate-50 rounded border border-slate-100">
            <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700">{label}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                    status === '완료' ? 'bg-green-50 border-green-200 text-green-700' :
                    status === '진행중' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                    'bg-slate-100 border-slate-200 text-slate-500'
                }`}>
                    {status}
                </span>
            </div>
            
            {/* Checkbox Visuals for Status */}
            <div className="flex gap-1">
               <StatusCheckbox label="미착수" isChecked={status === '미착수'} />
               <StatusCheckbox label="진행중" isChecked={status === '진행중'} colorClass="bg-blue-50 border-blue-200" />
               <StatusCheckbox label="완료" isChecked={status === '완료'} colorClass="bg-green-50 border-green-200" />
            </div>

            {/* Date & D-Day */}
            <div className="flex items-center justify-between mt-1 pt-2 border-t border-slate-200">
                <div className="flex items-center gap-1 text-xs text-slate-600">
                    <Calendar className="h-3 w-3" />
                    <span>{date || '-'}</span>
                </div>
                <div className={`text-xs ${getDDayStyle(date, status)}`}>
                    {date ? (status === '완료' ? '완료됨' : getDDay(date)) : ''}
                </div>
            </div>
        </div>
    );
};

export const ProjectView: React.FC<ProjectViewProps> = ({ projectId, projects, onNavigate }) => {
  const project = projects.find(p => p.id === projectId);

  if (!project) {
    return <div className="text-center p-10">프로젝트를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
       {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-4">
            <button onClick={() => onNavigate('list')} className="flex items-center text-slate-500 hover:text-blue-600 transition-colors">
                <ArrowLeft className="h-5 w-5 mr-1" />
                <span className="text-sm font-medium">목록으로</span>
            </button>
            <h2 className="text-xl font-bold text-slate-800 border-l-4 border-slate-800 pl-3">프로젝트 상세 확인</h2>
        </div>
        <button 
            onClick={() => onNavigate('edit', projectId)}
            className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded text-sm font-medium transition-colors"
        >
            수정하기
        </button>
      </div>

      {/* Common Info Card */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex items-center gap-2">
             <span className="font-bold text-slate-700">공통 정보</span>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                  <div className="text-xs text-slate-500 mb-1">업체명 (국가)</div>
                  <div className="font-bold text-slate-800 text-lg">{project.companyName} <span className="text-sm font-normal text-slate-500">({project.country})</span></div>
              </div>
              <div>
                  <div className="text-xs text-slate-500 mb-1">PM / 단계</div>
                  <div className="font-bold text-slate-800">{project.pm} <span className="mx-1 text-slate-300">|</span> <span className="text-blue-600">{project.stage}</span></div>
              </div>
              <div>
                  <div className="text-xs text-slate-500 mb-1">FAT 일정</div>
                  <div className="flex items-center gap-2">
                      <span className="font-mono font-medium text-slate-800">{project.fatDate || '-'}</span>
                      <span className={`text-xs ${getDDayStyle(project.fatDate)}`}>{getDDay(project.fatDate)}</span>
                  </div>
              </div>
              <div>
                  <div className="text-xs text-slate-500 mb-1">납기 일정</div>
                  <div className="flex items-center gap-2">
                      <span className="font-mono font-medium text-slate-800">{project.deliveryDate || '-'}</span>
                      <span className={`text-xs ${getDDayStyle(project.deliveryDate)}`}>{getDDay(project.deliveryDate)}</span>
                  </div>
              </div>
          </div>
      </div>

      {/* Items Loop */}
      <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-bold text-slate-800">진행 현황</h3>
              <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-1 rounded-full">총 {project.items.length}대</span>
          </div>

          {project.items.map((item, idx) => (
              <div key={item.id} className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                  {/* Item Header */}
                  <div className="bg-slate-100 px-6 py-3 border-b border-slate-200 flex justify-between items-center">
                      <div className="flex items-center gap-4">
                          <span className="font-bold text-red-600">MACHINE #{idx + 1}</span>
                          <span className="text-slate-300">|</span>
                          <span className="font-mono font-bold text-slate-800">{item.serialNumber}</span>
                      </div>
                      <div className="text-sm text-slate-600">
                          담당자: <span className="font-bold text-slate-800">{item.pic}</span>
                      </div>
                  </div>
                  
                  {/* Item Content */}
                  <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                          <TaskStatusDisplay label="1차 BOM" status={item.bomStatus} date={item.bomDate} />
                          <TaskStatusDisplay label="도면 출도" status={item.drawingStatus} date={item.drawingDate} />
                          <TaskStatusDisplay label="프로그램" status={item.programStatus} date={item.programDate} />
                      </div>

                      {/* Technical Specs */}
                      <div className="bg-slate-50 rounded border border-slate-200 p-4">
                            <div className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-2">
                                기술 정보 (상세 스펙)
                                <div className="h-px flex-1 bg-slate-200"></div>
                            </div>
                            {(item.techSpecs && item.techSpecs.length > 0) ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {item.techSpecs.map(spec => (
                                        <div key={spec.id} className="flex items-center justify-between bg-white p-2.5 rounded border border-slate-200 shadow-sm">
                                            <span className="text-sm font-medium text-slate-700">{spec.content}</span>
                                            <div>
                                                {spec.isCompleted ? (
                                                    <span className="flex items-center gap-1 text-green-700 bg-green-50 px-2 py-1 rounded border border-green-200">
                                                        <CheckSquare className="h-3.5 w-3.5" />
                                                        <span className="text-xs font-bold">확인 완료</span>
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded border border-red-200">
                                                        <Square className="h-3.5 w-3.5" />
                                                        <span className="text-xs font-bold">미확인</span>
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-xs text-slate-400 py-2">등록된 기술 정보가 없습니다.</div>
                            )}
                        </div>
                  </div>
              </div>
          ))}
      </div>

       {/* Remarks */}
       <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
           <h3 className="text-sm font-bold text-slate-800 mb-3 border-l-4 border-slate-800 pl-2">특이사항</h3>
           <div className="text-sm text-slate-700 min-h-[60px] whitespace-pre-wrap">
               {project.remarks || '특이사항이 없습니다.'}
           </div>
       </div>
    </div>
  );
};