
import React from 'react';
import { Notice } from '../types';
import { Megaphone } from 'lucide-react';

interface NoticeBoardProps {
  notices: Notice[];
}

export const NoticeBoard: React.FC<NoticeBoardProps> = ({ notices }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full">
      <div className="p-5 border-b border-slate-200 flex items-center gap-3">
        <div className="bg-blue-100 p-2 rounded-lg">
            <Megaphone className="h-6 w-6 text-blue-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">공지사항</h2>
      </div>

      <div className="overflow-x-auto flex-1 p-5">
        <table className="w-full text-sm text-left text-slate-600">
          <thead className="text-xs text-slate-700 bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 font-semibold w-20 text-center">No</th>
              <th className="px-4 py-3 font-semibold">제목</th>
              <th className="px-4 py-3 font-semibold w-32 text-center">작성자</th>
              <th className="px-4 py-3 font-semibold w-32 text-center">작성일</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {notices.map((notice, index) => (
              <tr key={notice.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 text-center text-slate-500">{index + 1}</td>
                <td className="px-4 py-3 font-medium text-slate-800 hover:text-blue-600 cursor-pointer">
                    {notice.title}
                </td>
                <td className="px-4 py-3 text-center text-slate-500">{notice.author}</td>
                <td className="px-4 py-3 text-center text-slate-500">{notice.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
