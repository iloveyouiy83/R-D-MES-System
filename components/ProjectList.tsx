import React, { useState, useMemo } from 'react';
import { Search, Plus, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Project, ViewState, TaskStatus } from '../types';

interface ProjectListProps {
  projects: Project[];
  onNavigate: (view: ViewState, projectId?: string | null) => void;
}

const StatusBadge = ({ status }: { status: TaskStatus }) => {
  const colors = {
    '완료': 'text-green-600 font-bold',
    '진행중': 'text-blue-600 font-bold',
    '미착수': 'text-slate-400',
  };
  return (
    <span className={`text-xs ${colors[status]}`}>
      ({status})
    </span>
  );
};

export const ProjectList: React.FC<ProjectListProps> = ({ projects, onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStage, setFilterStage] = useState('');
  const [filterPM, setFilterPM] = useState('');
  const [filterPIC, setFilterPIC] = useState('');

  // Filtering Logic
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchesSearch = 
        p.companyName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.items.some(item => item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStage = filterStage ? p.stage === filterStage : true;
      const matchesPM = filterPM ? p.pm === filterPM : true;
      const matchesPIC = filterPIC ? p.items.some(i => i.pic === filterPIC) : true;

      return matchesSearch && matchesStage && matchesPM && matchesPIC;
    });
  }, [projects, searchTerm, filterStage, filterPM, filterPIC]);

  // Unique values for dropdowns
  const uniquePMs = Array.from(new Set(projects.map(p => p.pm)));
  const uniquePICs = Array.from(new Set(projects.flatMap(p => p.items.map(i => i.pic))));

  // Pagination
  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const currentData = filteredProjects.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full">
      {/* Header & Controls */}
      <div className="p-5 border-b border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <h2 className="text-xl font-bold text-slate-800">프로젝트 목록</h2>
          <button 
            onClick={() => onNavigate('edit', null)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            신규 등록
          </button>
        </div>
        
        {/* Filter Bar */}
        <div className="flex flex-col xl:flex-row gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="검색..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select 
              className="px-2 py-1.5 text-xs border border-slate-300 rounded-md bg-white min-w-[100px]"
              value={filterStage}
              onChange={(e) => setFilterStage(e.target.value)}
            >
              <option value="">[진행단계▼]</option>
              <option value="FAT 예정">FAT 예정</option>
              <option value="FAT 확정">FAT 확정</option>
              <option value="FAT 완료">FAT 완료</option>
            </select>
            <select 
              className="px-2 py-1.5 text-xs border border-slate-300 rounded-md bg-white min-w-[80px]"
              value={filterPM}
              onChange={(e) => setFilterPM(e.target.value)}
            >
              <option value="">[PM▼]</option>
              {uniquePMs.map(pm => <option key={pm} value={pm}>{pm}</option>)}
            </select>
            <select 
              className="px-2 py-1.5 text-xs border border-slate-300 rounded-md bg-white min-w-[80px]"
              value={filterPIC}
              onChange={(e) => setFilterPIC(e.target.value)}
            >
              <option value="">[담당자▼]</option>
              {uniquePICs.map(pic => <option key={pic} value={pic}>{pic}</option>)}
            </select>
            {/* Mock Filters for tasks */}
            <select className="px-2 py-1.5 text-xs border border-slate-300 rounded-md bg-white min-w-[80px]" disabled>
              <option>[1차BOM▼]</option>
            </select>
            <select className="px-2 py-1.5 text-xs border border-slate-300 rounded-md bg-white min-w-[80px]" disabled>
              <option>[도면 출도▼]</option>
            </select>
            <select className="px-2 py-1.5 text-xs border border-slate-300 rounded-md bg-white min-w-[80px]" disabled>
              <option>[프로그램▼]</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm text-left text-slate-600">
          <thead className="text-xs text-slate-700 bg-slate-100 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 font-semibold w-40">업체명/국가</th>
              <th className="px-4 py-3 font-semibold w-32">일정(FAT/납기)</th>
              <th className="px-2 py-3 font-semibold w-20">PM</th>
              <th className="px-2 py-3 font-semibold w-24">진행 단계</th>
              <th className="px-4 py-3 font-semibold w-32 border-l border-slate-200">☑ 제작번호</th>
              <th className="px-2 py-3 font-semibold w-20">담당자</th>
              <th className="px-2 py-3 font-semibold text-center" colSpan={3}>확인 사항(1차BOM/도면/프로그램)</th>
              <th className="px-2 py-3 font-semibold w-20 text-center">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {currentData.length > 0 ? (
              currentData.map((project) => (
                <React.Fragment key={project.id}>
                  {project.items.map((item, index) => (
                    <tr 
                      key={item.id} 
                      className="hover:bg-slate-50 transition-colors"
                    >
                      {/* Common info columns */}
                      {index === 0 && (
                        <>
                          <td 
                            className="px-4 py-4 font-medium text-slate-900 border-r border-slate-100 align-top cursor-pointer" 
                            rowSpan={project.items.length}
                            onClick={() => onNavigate('view', project.id)}
                          >
                            <div className="text-sm font-bold">{project.companyName}</div>
                            <div className="text-slate-500 text-xs mt-1">({project.country})</div>
                          </td>
                          <td 
                            className="px-4 py-4 border-r border-slate-100 align-top cursor-pointer" 
                            rowSpan={project.items.length}
                            onClick={() => onNavigate('view', project.id)}
                          >
                            <div className="flex flex-col gap-1 text-xs">
                              <span className="flex justify-between w-full gap-2">
                                <span className="text-slate-500 font-bold">FAT</span> 
                                <span className="font-mono">{project.fatDate ? project.fatDate.substring(5) : '-'}</span>
                              </span>
                              <span className="flex justify-between w-full gap-2">
                                <span className="text-slate-500 font-bold">납기</span> 
                                <span className="font-mono">{project.deliveryDate ? project.deliveryDate.substring(5) : '-'}</span>
                              </span>
                            </div>
                          </td>
                          <td 
                            className="px-2 py-4 border-r border-slate-100 align-top text-xs font-medium" 
                            rowSpan={project.items.length}
                          >
                            {project.pm}
                          </td>
                          <td 
                            className="px-2 py-4 border-r border-slate-100 align-top" 
                            rowSpan={project.items.length}
                          >
                            <span className={`px-2 py-0.5 rounded text-[11px] font-bold whitespace-nowrap
                              ${project.stage.includes('완료') ? 'bg-green-50 text-green-600 border border-green-100' : ''}
                              ${!project.stage.includes('완료') ? 'bg-blue-50 text-blue-600 border border-blue-100' : ''}
                            `}>
                              {project.stage}
                            </span>
                          </td>
                        </>
                      )}
                      
                      {/* Item specific columns */}
                      <td className="px-4 py-4 font-mono text-sm font-medium text-slate-800 border-l border-slate-100 align-middle">
                         {item.serialNumber}
                      </td>
                      <td className="px-2 py-4 text-xs font-medium align-middle">
                        {item.pic}
                      </td>
                      <td className="px-2 py-2 text-center align-middle">
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] text-slate-400 mb-0.5">1차BOM</span>
                          <StatusBadge status={item.bomStatus} />
                        </div>
                      </td>
                      <td className="px-2 py-2 text-center align-middle">
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] text-slate-400 mb-0.5">도면 출도</span>
                          <StatusBadge status={item.drawingStatus} />
                        </div>
                      </td>
                      <td className="px-2 py-2 text-center align-middle">
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] text-slate-400 mb-0.5">프로그램</span>
                          <StatusBadge status={item.programStatus} />
                        </div>
                      </td>
                      
                      {/* Management Column - Only first row */}
                      {index === 0 && (
                        <td 
                          className="px-2 py-4 border-l border-slate-100 align-middle text-center" 
                          rowSpan={project.items.length}
                        >
                          <button 
                            onClick={(e) => { e.stopPropagation(); onNavigate('edit', project.id); }}
                            className="text-xs text-slate-500 hover:text-blue-600 font-medium underline decoration-slate-300 hover:decoration-blue-600 underline-offset-2"
                          >
                            수정/삭제
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan={11} className="px-6 py-10 text-center text-slate-400">
                  데이터가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-4 border-t border-slate-200 flex items-center justify-between">
        <div className="text-sm text-slate-500">
          총 <span className="font-medium">{filteredProjects.length}</span>건 / <span className="font-medium">{totalPages}</span>페이지
        </div>
        <div className="flex gap-1">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(1)}
            className="p-1 rounded hover:bg-slate-100 disabled:opacity-50"
          >
            <ChevronsLeft className="h-5 w-5 text-slate-600" />
          </button>
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            className="p-1 rounded hover:bg-slate-100 disabled:opacity-50"
          >
            <ChevronLeft className="h-5 w-5 text-slate-600" />
          </button>
          <span className="px-3 py-1 text-sm font-medium text-slate-700 bg-slate-50 rounded border border-slate-200">
            {currentPage}
          </span>
          <button 
             disabled={currentPage === totalPages}
             onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
             className="p-1 rounded hover:bg-slate-100 disabled:opacity-50"
          >
            <ChevronRight className="h-5 w-5 text-slate-600" />
          </button>
          <button 
             disabled={currentPage === totalPages}
             onClick={() => setCurrentPage(totalPages)}
             className="p-1 rounded hover:bg-slate-100 disabled:opacity-50"
          >
            <ChevronsRight className="h-5 w-5 text-slate-600" />
          </button>
        </div>
      </div>
    </div>
  );
};