
export type ViewState = 'dashboard' | 'list' | 'edit' | 'view' | 'notices';

export type Stage = 'FAT 예정' | 'FAT 확정' | 'FAT 완료' | '납기 확정' | '납기 완료';

export type TaskStatus = '완료' | '미지정';

export interface TechnicalSpec {
  id: string;
  content: string; // The text content
  isCompleted: boolean; // Checkbox state
}

export interface ProjectItem {
  id: string;
  serialNumber: string; // 제작번호
  pic: string; // 담당자
  bomStatus: TaskStatus; // 1차 BOM
  bomDate?: string;
  drawingStatus: TaskStatus; // 도면 출도
  drawingDate?: string;
  programStatus: TaskStatus; // 프로그램
  programDate?: string;
  techSpecs: TechnicalSpec[]; // Moved inside the item
}

export interface HistoryLog {
  id: string;
  timestamp: string;
  author: string;
  message: string;
}

export interface Project {
  id: string;
  companyName: string; // 업체명
  country: string; // 국가
  pm: string; // PM
  stage: Stage; // 단계
  fatDate: string; // FAT 일정
  deliveryDate: string; // 납기 일정
  items: ProjectItem[];
  history: HistoryLog[];
  remarks: string; // 특이사항
}

export interface DashboardStats {
  total: number;
  inProgress: number;
  thisWeekDelivery: number;
  delayed: number;
}

export interface Notice {
  id: string;
  title: string;
  author: string;
  date: string;
  content: string;
}
