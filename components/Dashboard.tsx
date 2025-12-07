import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { AlertTriangle, Calendar, Search, Plus } from 'lucide-react';
import { Project, ViewState } from '../types';

interface DashboardProps {
  projects: Project[];
  onNavigate: (view: ViewState, projectId?: string | null) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ projects, onNavigate }) => {
  // --- Stats Calculation ---
  const totalProjects = projects.length;
  const fatConfirmedProjects = projects.filter(p => p.stage === 'FAT 확정').length;
  
  // "This Week" logic based on delivery or FAT
  const thisWeekProjects = projects.filter(p => {
    const deliveryDate = new Date(p.deliveryDate);
    const now = new Date();
    // Simplified "This Week" check
    const diffTime = deliveryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays >= 0 && diffDays <= 7;
  }).length;
  
  const delayedProjects = projects.filter(p => {
    // Delayed if FAT date passed and stage is not FAT Complete/Delivery Confirmed/Complete
    if (!p.fatDate) return false;
    const fat = new Date(p.fatDate);
    const now = new Date();
    const isCompleted = ['FAT 완료', '납기 확정', '납기 완료'].includes(p.stage);
    return fat < now && !isCompleted;
  }).length;

  // --- Chart 1: Monthly Plan (Design/BOM/Program count) ---
  const monthMap: {[key: string]: {name: string, bom: number, drawing: number, program: number}} = {};
  
  projects.forEach(p => {
    const month = p.deliveryDate ? p.deliveryDate.substring(5, 7) : 'Unknown';
    if (!monthMap[month]) {
      monthMap[month] = { name: `${month}월`, bom: 0, drawing: 0, program: 0 };
    }
    p.items.forEach(item => {
      if (item.bomStatus === '완료') monthMap[month].bom++;
      if (item.drawingStatus === '완료') monthMap[month].drawing++;
      if (item.programStatus === '완료') monthMap[month].program++;
    });
  });
  const barChartData = Object.values(monthMap).sort((a, b) => a.name.localeCompare(b.name));

  // --- Chart 2: PM Status ---
  const pmCounts: {[key: string]: number} = {};
  projects.forEach(p => {
    pmCounts[p.pm] = (pmCounts[p.pm] || 0) + 1;
  });
  const pmChartData = Object.keys(pmCounts).map(pm => ({ name: pm, value: pmCounts[pm] }));
  
  // --- Chart 3: PIC Status (Person In Charge) ---
  const picCounts: {[key: string]: number} = {};
  projects.forEach(p => {
    p.items.forEach(item => {
      if (item.pic) {
        picCounts[item.pic] = (picCounts[item.pic] || 0) + 1;
      }
    });
  });
  const picChartData = Object.keys(picCounts).map(pic => ({ name: pic, value: picCounts[pic] }));

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#6366F1', '#EC4899', '#8B5CF6'];

  // --- Render Helpers ---
  const StatCard = ({ title, value, subtext, colorClass }: any) => (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col hover:shadow-md transition-shadow relative overflow-hidden group">
      <div className={`absolute top-0 left-0 w-1 h-full ${colorClass.replace('text-', 'bg-')}`}></div>
      <div className="flex justify-between items-start">
         <h3 className="text-sm font-bold text-slate-500 mb-2">{title}</h3>
      </div>
      <div className="flex flex-col">
        <span className="text-3xl font-extrabold text-slate-800">{value}</span>
        {subtext && <span className={`text-xs mt-1 font-medium ${colorClass}`}>{subtext}</span>}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="전체 PJ" value={`${totalProjects}건`} subtext="" colorClass="text-slate-600" />
        <StatCard title="FAT 확정" value={`${fatConfirmedProjects}건`} subtext="이번 주" colorClass="text-blue-600" />
        <StatCard title="이번 주 출고" value={`${thisWeekProjects}건`} subtext="예정" colorClass="text-green-600" />
        <StatCard title="지연" value={`${delayedProjects}건`} subtext="조치 필요" colorClass="text-red-600" />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm col-span-1 lg:col-span-1 min-w-[10px] w-full">
          <h3 className="text-sm font-bold text-slate-700 mb-4 border-l-4 border-slate-800 pl-2">월별 설계 계획</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
                <YAxis tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Legend iconType="circle" fontSize={10} />
                <Bar dataKey="bom" name="1차 BOM" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="drawing" name="도면" fill="#10B981" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="program" name="프로그램" fill="#F59E0B" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm col-span-1 min-w-[10px] w-full">
          <h3 className="text-sm font-bold text-slate-700 mb-4 border-l-4 border-slate-800 pl-2">PM별 업무 현황</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <BarChart layout="vertical" data={pmChartData}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} width={60} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="value" fill="#6366F1" radius={[0, 4, 4, 0]} barSize={30}>
                   {pmChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm col-span-1 min-w-[10px] w-full">
          <h3 className="text-sm font-bold text-slate-700 mb-4 border-l-4 border-slate-800 pl-2">담당자별 업무 현황</h3>
          <div className="h-64 overflow-y-auto scrollbar-hide">
            <div style={{ width: '100%', height: Math.max(250, picChartData.length * 40) }}>
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart layout="vertical" data={picChartData}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} width={60} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="value" fill="#10B981" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Alerts & Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="text-yellow-500 h-5 w-5" />
            <h3 className="text-lg font-bold text-slate-800">주의 필요 프로젝트</h3>
          </div>
          <div className="space-y-3">
            {projects.filter(p => p.remarks && (p.remarks.includes('지연') || p.remarks.includes('미출도') || p.remarks.includes('경과'))).map((p, i) => (
              <div key={p.id} className="p-3 bg-white hover:bg-slate-50 rounded-lg border-l-4 border-red-500 shadow-sm flex items-start justify-between cursor-pointer transition-colors" onClick={() => onNavigate('view', p.id)}>
                <div>
                  <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
                     {p.items[0]?.serialNumber} 
                     <span className="text-slate-500 font-normal">- {p.companyName}</span>
                  </div>
                  <div className="text-xs text-red-600 mt-1 font-medium">{p.remarks}</div>
                </div>
              </div>
            ))}
            {projects.filter(p => p.remarks && (p.remarks.includes('지연') || p.remarks.includes('미출도') || p.remarks.includes('경과'))).length === 0 && (
                <div className="text-sm text-slate-400 p-2">주의 항목이 없습니다.</div>
            )}
          </div>
        </div>

        {/* Weekly Schedule */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="text-blue-500 h-5 w-5" />
            <h3 className="text-lg font-bold text-slate-800">금주 주요 일정</h3>
          </div>
          <div className="space-y-3">
             {projects.slice(0, 3).map((p) => (
                <div key={'fat'+p.id} className="p-3 bg-white rounded-lg border border-slate-100 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-bold">{p.fatDate.substring(5)} ({['일','월','화','수','목','금','토'][new Date(p.fatDate).getDay()]})</div>
                        <div className="text-slate-700 font-medium text-sm">{p.items[0]?.serialNumber} FAT 예정</div>
                    </div>
                </div>
             ))}
          </div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="상단 검색바로 즉시 프로젝트 찾기" 
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-slate-50"
          />
        </div>
        <button 
          onClick={() => onNavigate('edit', null)}
          className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          신규 프로젝트 등록
        </button>
      </div>
    </div>
  );
};