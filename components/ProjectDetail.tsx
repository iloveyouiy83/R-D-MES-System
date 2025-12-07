
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Save, Trash2, Plus, X, CheckCircle, Circle, Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import { Project, ProjectItem, TechnicalSpec, TaskStatus } from '../types';
import { generateEmptyProject } from '../services/projectService';

interface ProjectDetailProps {
  projectId: string | null;
  projects: Project[];
  onSave: (project: Project) => void;
  onDelete: (id: string) => void;
  onBack: () => void;
}

// --- Constants & Styles ---
const INPUT_CLASS = "w-full px-4 py-2.5 border border-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-slate-900 bg-white shadow-sm transition-all placeholder-slate-400";
const SELECT_CLASS = "w-full px-4 py-2.5 border border-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm text-slate-900 shadow-sm transition-all appearance-none cursor-pointer";
const LABEL_CLASS = "block text-xs font-bold text-slate-800 mb-2 uppercase tracking-wide";

// --- Helper Functions ---
const getDDay = (dateString?: string) => {
  if (!dateString) return '';
  const target = new Date(dateString);
  const today = new Date();
  // Reset time to compare dates only
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
  if (dday.startsWith('D+')) return 'text-red-600 font-bold'; // Passed
  if (dday === 'D-Day') return 'text-red-600 font-bold';
  // Check for imminent (e.g. within 7 days)
  const days = parseInt(dday.replace('D-', ''));
  if (days <= 7) return 'text-orange-600 font-bold';
  
  return 'text-blue-600 font-medium';
};

// --- Sub Components ---

const DateField = ({ value, onChange, className }: { value: string | undefined, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, className?: string }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = (e: React.MouseEvent) => {
      e.preventDefault();
      try {
          if (inputRef.current && 'showPicker' in HTMLInputElement.prototype) {
            inputRef.current.showPicker();
          } else {
             inputRef.current?.focus();
          }
      } catch (err) {
          console.error('Error opening date picker:', err);
      }
  };

  return (
    <div className={`relative ${className}`}>
        <input 
            ref={inputRef}
            type="date"
            value={value || ''}
            onChange={onChange}
            onClick={handleClick}
            className={`${INPUT_CLASS} pr-10 cursor-pointer relative z-0`}
        />
        {/* Icon wrapper - pointer-events-none ensures clicks pass through to input */}
        <div className="absolute inset-y-0 right-0 w-10 flex items-center justify-center text-slate-500 pointer-events-none z-10">
            <CalendarIcon className="h-4 w-4" />
        </div>
    </div>
  );
};

const SelectField = ({ value, onChange, options, className }: { value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, options: string[], className?: string }) => (
  <div className={`relative ${className}`}>
      <select value={value} onChange={onChange} className={SELECT_CLASS}>
          {options.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
          ))}
      </select>
      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-500">
          <ChevronDown className="h-4 w-4" />
      </div>
  </div>
);

const StatusBadge = ({ status }: { status: TaskStatus }) => {
    let colorClass = 'bg-slate-100 text-slate-600 border-slate-200';
    if (status === '완료') colorClass = 'bg-green-100 text-green-700 border-green-200';
    if (status === '진행중') colorClass = 'bg-blue-100 text-blue-700 border-blue-200';
    
    return (
        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${colorClass}`}>
            {status}
        </span>
    );
};

export const ProjectDetail: React.FC<ProjectDetailProps> = ({ projectId, projects, onSave, onDelete, onBack }) => {
  const [formData, setFormData] = useState<Project>(generateEmptyProject());

  useEffect(() => {
    if (projectId) {
      const found = projects.find(p => p.id === projectId);
      if (found) {
        setFormData(JSON.parse(JSON.stringify(found)));
      }
    } else {
      setFormData(generateEmptyProject());
    }
  }, [projectId, projects]);

  const handleChange = (field: keyof Project, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index: number, field: keyof ProjectItem, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const handleAddItem = () => {
    const newItem: ProjectItem = {
      id: Date.now().toString(),
      serialNumber: '',
      pic: '',
      bomStatus: '미착수',
      drawingStatus: '미착수',
      programStatus: '미착수',
      techSpecs: []
    };
    setFormData(prev => ({ ...prev, items: [...prev.items, newItem] }));
  };

  const handleRemoveItem = (index: number) => {
    if (formData.items.length === 1) return;
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  // --- Technical Info Handlers (Nested in Items) ---
  const handleAddTechSpec = (itemIndex: number) => {
    const newSpec: TechnicalSpec = { 
        id: Date.now().toString(), 
        content: '', 
        isCompleted: false 
    };
    const newItems = [...formData.items];
    newItems[itemIndex].techSpecs = [...(newItems[itemIndex].techSpecs || []), newSpec];
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const handleRemoveTechSpec = (itemIndex: number, specIndex: number) => {
    const newItems = [...formData.items];
    newItems[itemIndex].techSpecs = newItems[itemIndex].techSpecs.filter((_, i) => i !== specIndex);
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const handleTechSpecChange = (itemIndex: number, specIndex: number, field: keyof TechnicalSpec, value: any) => {
    const newItems = [...formData.items];
    const specs = [...newItems[itemIndex].techSpecs];
    specs[specIndex] = { ...specs[specIndex], [field]: value };
    newItems[itemIndex].techSpecs = specs;
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const handleSave = () => {
    if (window.confirm('프로젝트 정보를 저장하시겠습니까?')) {
      onSave(formData);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-32">
      {/* Header */}
      <div className="sticky top-16 bg-slate-50/95 backdrop-blur z-20 py-4 flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-4">
            <button onClick={onBack} className="group flex items-center text-slate-500 hover:text-blue-600 transition-colors bg-white px-3 py-1.5 rounded-lg border border-slate-200 hover:border-blue-200 shadow-sm">
                <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-bold">목록으로</span>
            </button>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">프로젝트 정보 수정</h2>
        </div>
        <div className="flex items-center gap-3">
          {projectId && (
            <button 
              onClick={() => onDelete(projectId)}
              className="flex items-center gap-2 px-4 py-2.5 text-red-600 bg-white border border-red-200 hover:bg-red-50 rounded-lg transition-colors text-sm font-bold shadow-sm"
            >
              <Trash2 className="h-4 w-4" /> 삭제
            </button>
          )}
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all text-sm font-bold transform active:scale-95"
          >
            <Save className="h-4 w-4" /> 프로젝트 저장
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Common Info & History */}
          <div className="lg:col-span-4 space-y-6">
              {/* Common Info */}
              <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-2">
                   <div className="w-1 h-5 bg-blue-600 rounded-full"></div>
                   <h3 className="text-base font-bold text-slate-800">공통 정보</h3>
                </div>
                
                <div className="p-6 space-y-5">
                  <div>
                    <label className={LABEL_CLASS}>업체명 <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      value={formData.companyName}
                      onChange={e => handleChange('companyName', e.target.value)}
                      className={INPUT_CLASS}
                      placeholder="업체명을 입력하세요"
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLASS}>국가</label>
                    <input 
                      type="text" 
                      value={formData.country}
                      onChange={e => handleChange('country', e.target.value)}
                      className={INPUT_CLASS}
                      placeholder="국가를 입력하세요"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={LABEL_CLASS}>PM <span className="text-red-500">*</span></label>
                        <input 
                          type="text" 
                          value={formData.pm}
                          onChange={e => handleChange('pm', e.target.value)}
                          className={INPUT_CLASS}
                        />
                      </div>
                      <div>
                        <label className={LABEL_CLASS}>단계</label>
                        <SelectField 
                            value={formData.stage}
                            onChange={e => handleChange('stage', e.target.value)}
                            options={["FAT 예정", "FAT 확정", "FAT 완료", "납기 확정", "납기 완료"]}
                        />
                      </div>
                  </div>

                  <div className="border-t border-slate-100 my-2 pt-4">
                      <div className="mb-4">
                        <label className={LABEL_CLASS}>FAT 일정</label>
                        <div className="flex items-center gap-2">
                            <DateField 
                              value={formData.fatDate}
                              onChange={e => handleChange('fatDate', e.target.value)}
                              className="flex-1"
                            />
                            <div className={`text-xs font-bold px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 min-w-[3.5rem] text-center ${getDDayStyle(formData.fatDate)}`}>
                                {getDDay(formData.fatDate) || '-'}
                            </div>
                        </div>
                      </div>
                      <div>
                        <label className={LABEL_CLASS}>납기 일정</label>
                        <div className="flex items-center gap-2">
                            <DateField 
                              value={formData.deliveryDate}
                              onChange={e => handleChange('deliveryDate', e.target.value)}
                              className="flex-1"
                            />
                             <div className={`text-xs font-bold px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 min-w-[3.5rem] text-center ${getDDayStyle(formData.deliveryDate)}`}>
                                {getDDay(formData.deliveryDate) || '-'}
                            </div>
                        </div>
                      </div>
                  </div>
                </div>
              </section>

              {/* Remarks */}
              <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                 <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-2">
                   <div className="w-1 h-5 bg-slate-800 rounded-full"></div>
                   <h3 className="text-base font-bold text-slate-800">특이사항</h3>
                 </div>
                 <div className="p-6">
                     <textarea 
                        rows={6}
                        value={formData.remarks}
                        onChange={e => handleChange('remarks', e.target.value)}
                        className="w-full px-4 py-3 border border-slate-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white text-slate-900 placeholder-slate-400 shadow-inner"
                        placeholder="프로젝트 관련 특이사항을 입력하세요..."
                     />
                 </div>
              </section>

              {/* History */}
               <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-2">
                    <div className="w-1 h-5 bg-slate-400 rounded-full"></div>
                    <h3 className="text-base font-bold text-slate-800">변경 이력 (최근 5건)</h3>
                  </div>
                  <div className="p-6">
                      {formData.history && formData.history.length > 0 ? (
                        <div className="space-y-4">
                           {formData.history.map(log => (
                             <div key={log.id} className="text-sm border-l-2 border-slate-200 pl-3 py-1">
                                <div className="text-xs text-slate-400 font-mono mb-1">{log.timestamp}</div>
                                <div className="text-slate-700">
                                    <span className="font-bold text-slate-900">[{log.author}]</span> {log.message}
                                </div>
                             </div>
                           ))}
                        </div>
                      ) : (
                        <div className="text-sm text-slate-400 text-center py-4 italic">이력이 없습니다.</div>
                      )}
                  </div>
               </section>
          </div>

          {/* Right Column: Items (Machines) */}
          <div className="lg:col-span-8 space-y-6">
              <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm sticky top-[136px] z-10">
                   <div className="flex items-center gap-2">
                       <div className="w-1 h-5 bg-red-600 rounded-full"></div>
                       <h3 className="text-base font-bold text-slate-800">확인 사항 (설비 목록)</h3>
                       <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full ml-2">
                           총 {formData.items.length}대
                       </span>
                   </div>
                   <button 
                    onClick={handleAddItem} 
                    className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 shadow-sm"
                   >
                     <Plus className="h-4 w-4" /> 설비 추가
                   </button>
              </div>
             
             <div className="space-y-6">
               {formData.items.map((item, idx) => (
                 <div key={item.id} className="bg-white rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group">
                    {/* Item Top Bar */}
                    <div className="h-1.5 w-full bg-red-500"></div>
                    
                    <div className="p-6">
                        <div className="flex justify-between items-start mb-6">
                             <div className="flex items-center gap-3">
                                <span className="text-lg font-black text-red-600 bg-red-50 px-3 py-1 rounded border border-red-100">
                                    MACHINE #{idx + 1}
                                </span>
                             </div>
                             {formData.items.length > 1 && (
                                <button 
                                  onClick={() => handleRemoveItem(idx)}
                                  className="text-slate-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg"
                                  title="설비 삭제"
                                >
                                  <X className="h-5 w-5" />
                                </button>
                             )}
                        </div>

                        {/* Basic Item Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                          <div>
                            <label className={LABEL_CLASS}>제작번호 <span className="text-red-500">*</span></label>
                            <input 
                              type="text" 
                              value={item.serialNumber}
                              onChange={e => handleItemChange(idx, 'serialNumber', e.target.value)}
                              className={INPUT_CLASS}
                              placeholder="예: PSM000230"
                            />
                          </div>
                          <div>
                            <label className={LABEL_CLASS}>담당자 <span className="text-red-500">*</span></label>
                            <input 
                              type="text" 
                              value={item.pic}
                              onChange={e => handleItemChange(idx, 'pic', e.target.value)}
                              className={INPUT_CLASS}
                              placeholder="담당자명"
                            />
                          </div>
                        </div>
                        
                        {/* Status Columns */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 p-5 bg-slate-50/50 rounded-xl border border-slate-100">
                            {/* BOM Status */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-slate-700">1차 BOM</label>
                                    <StatusBadge status={item.bomStatus} />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <SelectField 
                                        value={item.bomStatus}
                                        onChange={e => handleItemChange(idx, 'bomStatus', e.target.value)}
                                        options={['미착수', '진행중', '완료']}
                                    />
                                    <DateField
                                        value={item.bomDate || ''}
                                        onChange={e => handleItemChange(idx, 'bomDate', e.target.value)}
                                    />
                                </div>
                                <div className={`text-right text-xs font-medium border-t border-slate-200 pt-2 ${getDDayStyle(item.bomDate, item.bomStatus)}`}>
                                    {item.bomDate ? (item.bomStatus === '완료' ? '완료됨' : `${getDDay(item.bomDate)}`) : '-'}
                                </div>
                            </div>

                            {/* Drawing Status */}
                            <div className="space-y-3">
                                 <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-slate-700">도면 출도</label>
                                    <StatusBadge status={item.drawingStatus} />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <SelectField 
                                        value={item.drawingStatus}
                                        onChange={e => handleItemChange(idx, 'drawingStatus', e.target.value)}
                                        options={['미착수', '진행중', '완료']}
                                    />
                                    <DateField
                                        value={item.drawingDate || ''}
                                        onChange={e => handleItemChange(idx, 'drawingDate', e.target.value)}
                                    />
                                </div>
                                <div className={`text-right text-xs font-medium border-t border-slate-200 pt-2 ${getDDayStyle(item.drawingDate, item.drawingStatus)}`}>
                                    {item.drawingDate ? (item.drawingStatus === '완료' ? '완료됨' : `${getDDay(item.drawingDate)}`) : '-'}
                                </div>
                            </div>

                             {/* Program Status */}
                             <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-slate-700">프로그램</label>
                                    <StatusBadge status={item.programStatus} />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <SelectField 
                                        value={item.programStatus}
                                        onChange={e => handleItemChange(idx, 'programStatus', e.target.value)}
                                        options={['미착수', '진행중', '완료']}
                                    />
                                    <DateField
                                        value={item.programDate || ''}
                                        onChange={e => handleItemChange(idx, 'programDate', e.target.value)}
                                    />
                                </div>
                                <div className={`text-right text-xs font-medium border-t border-slate-200 pt-2 ${getDDayStyle(item.programDate, item.programStatus)}`}>
                                    {item.programDate ? (item.programStatus === '완료' ? '완료됨' : `${getDDay(item.programDate)}`) : '-'}
                                </div>
                            </div>
                        </div>

                        {/* Technical Specs */}
                        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                             <div className="flex justify-between items-center mb-4">
                                <span className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                                    기술 정보 (상세 스펙)
                                </span>
                                <button onClick={() => handleAddTechSpec(idx)} className="text-blue-600 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-sm">
                                    <Plus className="h-3 w-3" /> 항목 추가
                                </button>
                            </div>
                            <div className="space-y-3">
                                {(item.techSpecs || []).map((spec, sIdx) => (
                                    <div key={spec.id} className="flex items-center gap-3 group/spec">
                                        <div className="flex-1">
                                            <input 
                                                type="text"
                                                placeholder="내용 입력 (예: 전압 220V)"
                                                value={spec.content}
                                                onChange={(e) => handleTechSpecChange(idx, sIdx, 'content', e.target.value)}
                                                className={INPUT_CLASS}
                                            />
                                        </div>
                                        <button
                                            onClick={() => handleTechSpecChange(idx, sIdx, 'isCompleted', !spec.isCompleted)}
                                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all w-32 justify-center shrink-0 shadow-sm
                                                ${spec.isCompleted 
                                                    ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100' 
                                                    : 'bg-white border-slate-300 text-slate-500 hover:bg-slate-50'}`}
                                        >
                                            {spec.isCompleted ? (
                                                <>
                                                    <CheckCircle className="h-4 w-4" />
                                                    <span className="text-xs font-bold">확인 완료</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Circle className="h-4 w-4" />
                                                    <span className="text-xs font-bold">미확인</span>
                                                </>
                                            )}
                                        </button>
                                        <button 
                                            onClick={() => handleRemoveTechSpec(idx, sIdx)} 
                                            className="text-slate-400 hover:text-red-500 p-2.5 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                            title="항목 삭제"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                                 {(!item.techSpecs || item.techSpecs.length === 0) && (
                                    <div className="text-sm text-slate-400 italic text-center py-6 bg-slate-100/50 rounded-lg border border-dashed border-slate-300">
                                        등록된 기술 정보가 없습니다. 상단의 '항목 추가' 버튼을 눌러 입력하세요.
                                    </div>
                                )}
                            </div>
                        </div>
                     </div>
                 </div>
               ))}
             </div>
          </div>
      </div>
    </div>
  );
};
