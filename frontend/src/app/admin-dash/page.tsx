"use client";

import React from 'react';
// Using specific icons for clarity and potential bundle size reduction
import { FiClock, FiCheckCircle, FiXCircle, FiEdit2 } from 'react-icons/fi';
import Navbar from '../navbar/page'; // Assuming Navbar component exists and works as expected

export default function AdminDashboard() {
  // Mock data - replace with real data from your backend
  const totalApprovedHours = '6.0'; // Keep as string to match design output exactly
  const stats = {
    approved: 5,
    rejected: 1,
    pending: 2
  };

  const incomingRequests = [
    {
      id: 1, // Added unique key for mapping
      title: 'Sequence 3',
      type: 'Sanger Sample Type',
      date: 'March 16 • 12:45 PM',
      sampleName: 'Name Sample', // Added sample name for the button
      status: 'Approved'
    },
    {
      id: 2,
      title: 'Sequence 3',
      type: 'Sanger Sample Type',
      date: 'March 16 • 12:45 PM',
      sampleName: 'Name Sample',
      status: 'Rejected'
    },
    {
      id: 3,
      title: 'Sequence 3',
      type: 'Sanger Sample Type',
      date: 'March 16 • 12:45 PM',
      sampleName: 'Name Sample',
      status: 'Pending'
    }
  ];

  const pastActions = [
    {
      date: 'APR 3, 2025',
      actions: [
        {
          id: 'a1', // Added unique key
          time: '10:46 AM',
          user: 'Jacob, D',
          action: 'Sample #301 received'
        },
        {
          id: 'a2',
          time: '09:14 AM',
          user: 'Miller, S',
          action: 'Labeled sample'
        },
        {
          id: 'a3',
          time: '09:03 AM',
          user: 'Kim, L',
          action: 'Primer A added'
        }
      ]
    },
    {
      date: 'APR 2, 2025',
      actions: [
        {
          id: 'b1',
          time: '10:46 AM',
          user: 'Jacob, D',
          action: 'Sample #301 received'
        },
        {
          id: 'b2',
          time: '09:14 AM',
          user: 'Miller, S',
          action: 'Labeled sample'
        },
        {
          id: 'b3',
          time: '09:03 AM',
          user: 'Kim, L',
          action: 'Primer A added'
        },
        // Added missing 4th action from the design for APR 2
        {
          id: 'b4',
          time: '09:03 AM',
          user: 'Kim, L',
          action: 'Primer A added'
        }
      ]
    },
    {
      date: 'APR 1, 2025',
      actions: [
        {
          id: 'c1',
          time: '10:46 AM',
          user: 'Jacob, D',
          action: 'Sample #301 received'
        },
        {
          id: 'c2',
          time: '09:14 AM',
          user: 'Miller, S',
          action: 'Labeled sample'
        },
        {
          id: 'c3',
          time: '09:03 AM',
          user: 'Kim, L',
          action: 'Primer A added'
        }
      ]
    }
  ];

  // Updated status styles to closely match the design
  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        // Light green background, darker green text
        return 'bg-green-100 text-green-700 border border-green-200';
      case 'rejected':
        // Light red background, darker red text
        return 'bg-red-100 text-red-700 border border-red-200';
      case 'pending':
        // Light yellow background, darker yellow/orange text
        return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  return (
    // Use a light gray background for the whole page container
    <div className="min-h-screen bg-gray-50">
      {/* Assume Navbar is styled correctly */}
      <Navbar profilePicUrl="" user={null} />

      <div className="flex flex-row"> {/* Main content and sidebar layout */}

        {/* Main Content Area */}
        {/* Adjusted padding: more on left/top/bottom, less on right before sidebar */}
        <div className="flex-1 p-8 pr-4"> {/* Reduced right padding */}
          {/* Removed max-width constraint to allow content to flow */}
          {/* <div className="max-w-5xl"> */}
            <div className="flex justify-between items-start mb-8"> {/* Align items start */}
              <div>
                {/* Use slightly larger font size for Dashboard title */}
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-1">Welcome back, Buzzy Kim</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Total Approved Hours</p>
                {/* Use slightly larger font for the number */}
                <p className="text-4xl font-bold text-gray-900">{totalApprovedHours}</p>
              </div>
            </div>

            {/* Volunteering Summary Section */}
            <div className="mb-10"> {/* Increased bottom margin */}
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Volunteering Summary</h2>
              {/* Adjusted grid gap */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Stat Card - Approved */}
                <div className="bg-white p-5 rounded-xl shadow border border-gray-200"> {/* Adjusted padding, rounding, added border */}
                  <div className="flex items-center space-x-4"> {/* Use space-x for spacing */}
                    {/* Icon background and icon styling */}
                    <div className="flex-shrink-0 w-10 h-10 bg-green-50 border border-green-200 rounded-lg flex items-center justify-center">
                      <FiCheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    {/* Text alignment: Number above Label */}
                    <div>
                      <p className="text-sm text-gray-500">Approved Submissions</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
                    </div>
                  </div>
                </div>
                {/* Stat Card - Rejected */}
                <div className="bg-white p-5 rounded-xl shadow border border-gray-200"> {/* Adjusted padding, rounding, added border */}
                   <div className="flex items-center space-x-4">
                     <div className="flex-shrink-0 w-10 h-10 bg-red-50 border border-red-200 rounded-lg flex items-center justify-center">
                       <FiXCircle className="w-5 h-5 text-red-600" />
                     </div>
                     <div>
                       <p className="text-sm text-gray-500">Rejected Submissions</p>
                       <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
                     </div>
                   </div>
                </div>
                {/* Stat Card - Pending */}
                <div className="bg-white p-5 rounded-xl shadow border border-gray-200"> {/* Adjusted padding, rounding, added border */}
                  <div className="flex items-center space-x-4">
                     <div className="flex-shrink-0 w-10 h-10 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center justify-center">
                       <FiClock className="w-5 h-5 text-yellow-600" />
                     </div>
                     <div>
                       <p className="text-sm text-gray-500">Pending Submissions</p>
                       <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                     </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Incoming Requests Section */}
            {/* Use slightly different background or just rely on border/shadow */}
            <div className="bg-white rounded-xl shadow border border-gray-200 mb-10"> {/* Adjusted rounding, added border, increased margin */}
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Incoming Requests</h2>
                {/* Styled "View All" as a link */}
                <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-800">View All</a>
              </div>
              {/* Removed default divider, rely on border within items if needed, or padding */}
              <div className="divide-y divide-gray-100">
                {incomingRequests.map((request) => (
                  // Adjusted padding for each request item
                  <div key={request.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition duration-150 ease-in-out">
                    {/* Left side content */}
                    <div className="flex flex-col">
                      {/* Adjusted font sizes and weights */}
                      <h3 className="text-sm font-semibold text-blue-600">{request.title}</h3>
                      <p className="text-sm text-gray-700 mt-1">{request.type}</p>
                      <p className="text-xs text-gray-400 mt-1">{request.date}</p>
                    </div>
                    {/* Right side content */}
                    <div className="flex items-center space-x-3"> {/* Adjusted spacing */}
                      {/* Name Sample Button */}
                      <button className="flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        <span>{request.sampleName}</span>
                        <FiEdit2 className="w-4 h-4 ml-2 text-gray-400" />
                      </button>
                      {/* Status Badge - Adjusted padding, rounding, font size */}
                      <span className={`px-3 py-1 rounded-md text-xs font-medium ${getStatusStyle(request.status)}`}>
                        {request.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

             {/* Primer Tracking and Plate Assignment Sections */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Primer Tracking */}
                 <div className="bg-white rounded-xl shadow border border-gray-200">
                     <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                         <h2 className="text-xl font-semibold text-gray-900">Primer Tracking</h2>
                         <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-800">View All</a>
                     </div>
                     {/* Placeholder for content */}
                     <div className="p-6 min-h-[150px]">
                         {/* Content goes here */}
                         <p className="text-center text-gray-400 text-sm mt-10">Primer tracking data will appear here.</p>
                     </div>
                 </div>

                 {/* Plate Assignment */}
                 <div className="bg-white rounded-xl shadow border border-gray-200">
                     <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                         <h2 className="text-xl font-semibold text-gray-900">Plate Assignment</h2>
                         <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-800">View All</a>
                     </div>
                     {/* Placeholder for content */}
                     <div className="p-6 min-h-[150px]">
                         {/* Content goes here */}
                         <p className="text-center text-gray-400 text-sm mt-10">Plate assignment data will appear here.</p>
                     </div>
                 </div>
             </div>

          {/* </div> */} {/* End of max-width div if it were used */}
        </div> {/* End Main Content Area */}


        {/* Past Actions Sidebar */}
        {/* Adjusted width, background color, padding, and border */}
        <aside className="w-80 bg-gray-100 p-6 border-l border-gray-200 min-h-screen"> {/* Increased padding, changed bg */}
          <h2 className="text-xl font-semibold text-gray-900 mb-5">Past Actions</h2> {/* Adjusted margin */}
          <div className="space-y-6">
            {pastActions.map((dateGroup, index) => (
              <div key={index}>
                <h3 className="text-xs font-semibold text-gray-500 mb-3 tracking-wide uppercase">{dateGroup.date}</h3> {/* Adjusted styling */}
                <div className="space-y-3"> {/* Adjusted spacing */}
                  {dateGroup.actions.map((action) => (
                    // Use flex-start alignment
                    <div key={action.id} className="flex items-start text-sm space-x-3">
                      {/* Time column - fixed width, lighter text */}
                      <div className="w-16 flex-shrink-0 text-gray-500 font-medium pt-px">{action.time}</div>
                      {/* Action details column */}
                      <div className="flex-1">
                        {/* User slightly bolder, action text normal */}
                        <span className="font-medium text-gray-800">{action.user}</span>
                        <span className="text-gray-600 ml-1">{action.action}</span> {/* Removed hyphen */}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside> {/* End Past Actions Sidebar */}

      </div> {/* End Flex container for main content and sidebar */}
    </div> // End Page container
  );
}