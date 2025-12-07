
import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { ProjectList } from './components/ProjectList';
import { ProjectDetail } from './components/ProjectDetail'; // This acts as Edit Page
import { ProjectView } from './components/ProjectView'; // This acts as Read-only View Page
import { NoticeBoard } from './components/NoticeBoard'; // New Component
import { Layout } from './components/Layout';
import { Project, ViewState, Notice } from './types';
import { getProjects, saveProject, deleteProject, getNotices } from './services/projectService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Initial Data Load
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setProjects(getProjects());
      setNotices(getNotices());
      setLoading(false);
    }, 500);
  }, []);

  const handleNavigate = (view: ViewState, projectId: string | null = null) => {
    setSelectedProjectId(projectId);
    setCurrentView(view);
    window.scrollTo(0,0);
  };

  const handleSaveProject = (updatedProject: Project) => {
    const updatedList = saveProject(projects, updatedProject);
    setProjects(updatedList);
    handleNavigate('list');
  };

  const handleDeleteProject = (projectId: string) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      const updatedList = deleteProject(projects, projectId);
      setProjects(updatedList);
      handleNavigate('list');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Layout currentView={currentView} onNavigate={handleNavigate}>
      {currentView === 'dashboard' && (
        <Dashboard projects={projects} notices={notices} onNavigate={handleNavigate} />
      )}
      {currentView === 'list' && (
        <ProjectList projects={projects} onNavigate={handleNavigate} />
      )}
      {currentView === 'view' && (
        <ProjectView 
            projectId={selectedProjectId} 
            projects={projects} 
            onNavigate={handleNavigate} 
        />
      )}
      {currentView === 'edit' && (
        <ProjectDetail
          projectId={selectedProjectId}
          projects={projects}
          onSave={handleSaveProject}
          onDelete={handleDeleteProject}
          onBack={() => handleNavigate('list')}
        />
      )}
      {currentView === 'notices' && (
        <NoticeBoard notices={notices} />
      )}
    </Layout>
  );
};

export default App;
