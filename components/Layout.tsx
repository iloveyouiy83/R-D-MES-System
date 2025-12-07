import React from 'react';
import { LayoutDashboard, LogOut } from 'lucide-react';
import { ViewState } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, onNavigate }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('dashboard')}>
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <LayoutDashboard className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">연구소 생산 관리 시스템</h1>
            </div>
            
            <div className="flex items-center gap-6">
              <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-600">
                <button 
                  onClick={() => onNavigate('dashboard')}
                  className={`hover:text-blue-600 transition-colors ${currentView === 'dashboard' ? 'text-blue-600' : ''}`}
                >
                  대시보드
                </button>
                <button 
                  onClick={() => onNavigate('list')}
                  className={`hover:text-blue-600 transition-colors ${['list', 'view', 'edit'].includes(currentView) ? 'text-blue-600' : ''}`}
                >
                  프로젝트 목록
                </button>
              </nav>
              
              <div className="h-5 w-px bg-slate-200 hidden md:block"></div>
              
              <button className="flex items-center gap-2 text-slate-500 hover:text-red-600 transition-colors text-sm font-medium">
                <LogOut className="h-4 w-4" />
                <span>로그아웃</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};