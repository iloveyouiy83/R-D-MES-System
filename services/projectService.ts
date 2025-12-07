
import { Project, ProjectItem, TechnicalSpec, HistoryLog } from '../types';

const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    companyName: 'SHANDONG',
    country: '중국',
    pm: '신경호',
    stage: 'FAT 예정',
    fatDate: '2024-10-15',
    deliveryDate: '2024-12-15',
    remarks: '주요 부품 수급 지연 예상',
    items: [
      { 
        id: '1-1', 
        serialNumber: 'PSM000230', 
        pic: '김승윤', 
        bomStatus: '완료', bomDate: '2024-09-15',
        drawingStatus: '미지정', drawingDate: '2024-10-01',
        programStatus: '미지정', programDate: '2024-10-10',
        techSpecs: [
          { id: 't1', content: '전압 사양: 220V 60Hz', isCompleted: true },
          { id: 't2', content: '안전 규격: CE 인증', isCompleted: false }
        ]
      },
      { 
        id: '1-2', 
        serialNumber: 'H2M000291', 
        pic: '이규빈', 
        bomStatus: '완료', bomDate: '2024-09-20',
        drawingStatus: '완료', drawingDate: '2024-10-05',
        programStatus: '미지정', programDate: '2024-10-20',
        techSpecs: []
      },
      { 
        id: '1-3', 
        serialNumber: 'TTM000105', 
        pic: '박승현', 
        bomStatus: '완료', bomDate: '2024-09-22',
        drawingStatus: '미지정', drawingDate: '2024-10-08',
        programStatus: '미지정', programDate: '2024-10-25',
        techSpecs: []
      },
    ],
    history: [
      { id: 'h1', timestamp: '2024-12-05 14:23', author: 'PM', message: 'FAT 일정 변경' },
    ],
  },
  {
    id: '2',
    companyName: 'HEALTHCARE',
    country: '방글라데시',
    pm: '장홍기',
    stage: 'FAT 확정',
    fatDate: '2024-10-17',
    deliveryDate: '2024-12-17',
    remarks: '',
    items: [
      { 
        id: '2-1', 
        serialNumber: 'PSM000232', 
        pic: '김승윤', 
        bomStatus: '완료', bomDate: '2024-09-25',
        drawingStatus: '미지정', drawingDate: '2024-10-10',
        programStatus: '미지정', programDate: '2024-10-15',
        techSpecs: []
      },
      { 
        id: '2-2', 
        serialNumber: 'H2M000293', 
        pic: '이규빈', 
        bomStatus: '완료', bomDate: '2024-09-28',
        drawingStatus: '완료', drawingDate: '2024-10-12',
        programStatus: '미지정', programDate: '2024-10-20',
        techSpecs: []
      },
      { 
        id: '2-3', 
        serialNumber: 'TTM000107', 
        pic: '박승현', 
        bomStatus: '완료', bomDate: '2024-10-01',
        drawingStatus: '미지정', drawingDate: '2024-10-15',
        programStatus: '미지정', programDate: '2024-10-25',
        techSpecs: []
      },
    ],
    history: [],
  },
  {
    id: '3',
    companyName: 'SHANDONG HUASU',
    country: '중국',
    pm: '김철수',
    stage: 'FAT 완료',
    fatDate: '2024-12-07',
    deliveryDate: '2024-12-25',
    remarks: '검수일 2일 경과',
    items: [
      { id: '3-1', serialNumber: 'H2M000291', pic: '최민수', bomStatus: '미지정', drawingStatus: '미지정', programStatus: '미지정', techSpecs: [] },
    ],
    history: [],
  },
  {
    id: '4',
    companyName: 'AUTO PARTS',
    country: '인도',
    pm: '이영희',
    stage: '납기 확정',
    fatDate: '2024-11-20',
    deliveryDate: '2024-12-11',
    remarks: 'BOM 미출도 (출고 D-5)',
    items: [
      { id: '4-1', serialNumber: 'H2M000177', pic: '정수빈', bomStatus: '미지정', drawingStatus: '완료', programStatus: '완료', techSpecs: [] },
      { id: '4-2', serialNumber: 'H2M000285', pic: '정수빈', bomStatus: '완료', drawingStatus: '완료', programStatus: '완료', techSpecs: [] },
      { id: '4-3', serialNumber: 'H2M000292', pic: '정수빈', bomStatus: '완료', drawingStatus: '완료', programStatus: '완료', techSpecs: [] },
    ],
    history: [],
  }
];

export const getProjects = (): Project[] => {
  const stored = localStorage.getItem('projects');
  if (stored) {
    return JSON.parse(stored);
  }
  return MOCK_PROJECTS;
};

export const saveProject = (projects: Project[], updated: Project): Project[] => {
  let newProjects = [...projects];
  const index = newProjects.findIndex(p => p.id === updated.id);
  
  if (index >= 0) {
    newProjects[index] = updated;
  } else {
    updated.id = Date.now().toString();
    newProjects = [updated, ...newProjects];
  }
  
  localStorage.setItem('projects', JSON.stringify(newProjects));
  return newProjects;
};

export const deleteProject = (projects: Project[], id: string): Project[] => {
  const newProjects = projects.filter(p => p.id !== id);
  localStorage.setItem('projects', JSON.stringify(newProjects));
  return newProjects;
};

export const generateEmptyProject = (): Project => ({
  id: '',
  companyName: '',
  country: '',
  pm: '',
  stage: 'FAT 예정',
  fatDate: '',
  deliveryDate: '',
  remarks: '',
  items: [
    { 
      id: Date.now().toString(), 
      serialNumber: '', 
      pic: '', 
      bomStatus: '미지정', bomDate: '',
      drawingStatus: '미지정', drawingDate: '',
      programStatus: '미지정', programDate: '',
      techSpecs: []
    }
  ],
  history: []
});
