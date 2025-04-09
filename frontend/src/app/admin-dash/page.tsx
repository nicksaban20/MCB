import React from 'react';
import { FiClock, FiCheckCircle, FiAlertTriangle, FiXCircle } from 'react-icons/fi';
import Navbar from '../navbar/page';

const submissions = [
  {
    title: 'Sequence 3',
    description: 'Sanger Sample Type',
    status: 'Approved',
    date: 'March 16 • 12:45 PM',
  },
  {
    title: 'Sequence 3',
    description: 'Sanger Sample Type',
    status: 'Rejected',
    date: 'March 16 • 12:45 PM',
  },
  {
    title: 'Sequence 3',
    description: 'Sanger Sample Type',
    status: 'Pending',
    date: 'March 16 • 12:45 PM',
  },
];

const statusStyles: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Approved: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800',
};

const AdminDashboard = () => {
  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <div className="flex">
        <div className="w-full md:w-3/4 p-10 bg-white rounded-l-xl shadow-xl">
          <h1 className="text-3xl font-semibold mb-2">Dashboard</h1>
          <p className="mb-6 text-gray-500">Welcome back, John Doe</p>

          <h2 className="text-xl font-semibold mb-4">Your Volunteering Summary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
            <SummaryCard icon={<FiCheckCircle />} title="Approved Submissions" value="2" color="border-green-200 bg-green-50" />
            <SummaryCard icon={<FiAlertTriangle />} title="Pending Submissions" value="3" color="border-yellow-200 bg-yellow-50" />
            <SummaryCard icon={<FiXCircle />} title="Rejected Submissions" value="1" color="border-red-200 bg-red-50" />
          </div>

          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Incoming Requests</h2>
            <a href="#" className="text-sm text-gray-500 border rounded px-3 py-1 hover:bg-gray-100">View All</a>
          </div>

          <div className="bg-gray-50 rounded-lg border divide-y">
            {submissions.map((sub, idx) => (
              <div key={idx} className="flex justify-between items-center px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-300 rounded" />
                  <div>
                    <p className="font-semibold text-gray-800">{sub.title}</p>
                    <p className="text-sm text-gray-500">{sub.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-500">{sub.date}</div>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusStyles[sub.status]}`}>{sub.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="hidden md:block w-1/4 bg-gray-50 p-6 rounded-r-xl shadow-inner">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Past Actions</h3>
          <div className="space-y-4 text-sm text-gray-600">
            <div>
              <p className="text-xs text-gray-400 mb-1">APR 3, 2025</p>
              <p><strong>10:46 AM</strong> Jacob, D – Sample #301 received</p>
              <p><strong>09:14 AM</strong> Miller, S – Labeled sample</p>
              <p><strong>09:03 AM</strong> Kim, L – Primer A added</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">APR 2, 2025</p>
              <p><strong>11:34 AM</strong> Hall, S – Moved to centrifuge</p>
              <p><strong>10:01 AM</strong> Miller, S – Centrifuged</p>
              <p><strong>09:36 AM</strong> Kim, L – Stored in freezer</p>
              <p><strong>09:24 AM</strong> Jacob, D – Status updated</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">APR 1, 2025</p>
              <p><strong>11:34 AM</strong> Hall, S – Moved to centrifuge</p>
              <p><strong>10:01 AM</strong> Miller, S – Centrifuged</p>
              <p><strong>09:36 AM</strong> Kim, L – Stored in freezer</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface SummaryCardProps {
  icon: JSX.Element;
  title: string;
  value: string;
  color: string;
}

const SummaryCard = ({ icon, title, value, color }: SummaryCardProps) => {
  return (
    <div className={`p-4 flex items-center gap-4 rounded-lg border ${color}`}>
      <div className="w-10 h-10 flex items-center justify-center text-2xl text-blue-600">
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-xl font-semibold text-gray-800">{value}</p>
      </div>
    </div>
  );
};

export default AdminDashboard;
