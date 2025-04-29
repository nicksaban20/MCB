"use client";

import React, { useState, useEffect } from 'react';
// Using specific icons for clarity and potential bundle size reduction
import { FiClock, FiCheckCircle, FiActivity, FiEdit2 } from 'react-icons/fi';
import Navbar from '../navbar/page'; // Assuming Navbar component exists and works as expected

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    completed: 0,
    in_progress: 0,
    pending: 0
  });
  const [totalSamples, setTotalSamples] = useState('0');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch data from the API
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/orders');
        
        if (!response.ok) {
          // Get more detailed error information
          const errorData = await response.text();
          console.error('API Error Response:', {
            status: response.status,
            statusText: response.statusText,
            data: errorData
          });
          
          throw new Error(
            `API request failed with status ${response.status}: ${response.statusText}`
          );
        }
        
        const data = await response.json();
        console.log('API data received:', data);
        
        // If data is null or undefined, set to empty array
        const safeData = data || [];
        setOrders(safeData);
        
        // Calculate statistics
        const completedOrders = safeData.filter(order => order.status?.toLowerCase() === 'completed') || [];
        const inProgressOrders = safeData.filter(order => order.status?.toLowerCase() === 'in_progress') || [];
        const pendingOrders = safeData.filter(order => order.status?.toLowerCase() === 'pending') || [];
        
        setStats({
          completed: completedOrders.length,
          in_progress: inProgressOrders.length,
          pending: pendingOrders.length
        });
        
        // Set total number of samples
        setTotalSamples(safeData.length.toString());
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const options = { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric', 
      minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options)
      .replace(',', ' •');
  };

  // Group actions by date for the past actions sidebar
  const groupActionsByDate = (actions) => {
    const grouped = {};
    
    actions.forEach(action => {
      if (!action.created_at) return;
      
      const date = new Date(action.created_at);
      const dateKey = date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      }).toUpperCase();
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      
      grouped[dateKey].push({
        id: action.id,
        time: date.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit' 
        }),
        user: "User", // Since there's no user_name in the schema
        action: `DNA sample ${action.sample_type} ${action.status}`
      });
    });
    
    // Convert to the format used in the UI
    return Object.keys(grouped).map(date => ({
      date,
      actions: grouped[date]
    }));
  };

  // Updated status styles to closely match the design
  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-700 border border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700 border border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  // Get recent incoming requests (most recent 3)
  const incomingRequests = orders
  .slice(0, 3)
  .map((order, index) => ({
    id: order.id,
    title: `Sample ${index + 1}`,
    type: order.sample_type || 'Unknown Sample Type',
    date: formatDate(order.created_at),
    sampleName: order.plate_name || 'Unnamed Sample',
    status: order.status || 'pending'
  }));

  // Get past actions for the sidebar
  const pastActions = groupActionsByDate(orders);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-lg text-gray-600">Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-lg text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    // Use a light gray background for the whole page container
    <div className="min-h-screen bg-gray-50">
      {/* Assume Navbar is styled correctly */}
      <Navbar profilePicUrl="" user={null} />

      <div className="flex flex-row"> {/* Main content and sidebar layout */}

        {/* Main Content Area */}
        <div className="flex-1 p-8 pr-4"> {/* Reduced right padding */}
          <div className="flex justify-between items-start mb-8"> {/* Align items start */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">DNA Sequencing Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back, Buzzy Kim</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Total DNA Samples</p>
              <p className="text-4xl font-bold text-gray-900">{totalSamples}</p>
            </div>
          </div>

          {/* DNA Orders Summary Section */}
          <div className="mb-10"> {/* Increased bottom margin */}
            <h2 className="text-xl font-semibold text-gray-900 mb-4">DNA Orders Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Stat Card - Completed */}
              <div className="bg-white p-5 rounded-xl shadow border border-gray-200">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-50 border border-green-200 rounded-lg flex items-center justify-center">
                    <FiCheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Completed Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                  </div>
                </div>
              </div>
              {/* Stat Card - In Progress */}
              <div className="bg-white p-5 rounded-xl shadow border border-gray-200">
                 <div className="flex items-center space-x-4">
                   <div className="flex-shrink-0 w-10 h-10 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-center">
                     <FiActivity className="w-5 h-5 text-blue-600" />
                   </div>
                   <div>
                     <p className="text-sm text-gray-500">In Progress Orders</p>
                     <p className="text-2xl font-bold text-gray-900">{stats.in_progress}</p>
                   </div>
                 </div>
              </div>
              {/* Stat Card - Pending */}
              <div className="bg-white p-5 rounded-xl shadow border border-gray-200">
                <div className="flex items-center space-x-4">
                   <div className="flex-shrink-0 w-10 h-10 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center justify-center">
                     <FiClock className="w-5 h-5 text-yellow-600" />
                   </div>
                   <div>
                     <p className="text-sm text-gray-500">Pending Orders</p>
                     <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent DNA Orders Section */}
          <div className="bg-white rounded-xl shadow border border-gray-200 mb-10">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Recent DNA Orders</h2>
              <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-800">View All</a>
            </div>
            <div className="divide-y divide-gray-100">
              {incomingRequests.length > 0 ? (
                incomingRequests.map((request) => (
                  <div key={request.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition duration-150 ease-in-out">
                    {/* Left side content */}
                    <div className="flex flex-col">
                      <h3 className="text-sm font-semibold text-blue-600">{request.title}</h3>
                      <p className="text-sm text-gray-700 mt-1">{request.type}</p>
                      <p className="text-xs text-gray-400 mt-1">{request.date}</p>
                    </div>
                    {/* Right side content */}
                    <div className="flex items-center space-x-3">
                      <button className="flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        <span>New Sample</span>
                        <FiEdit2 className="w-4 h-4 ml-2 text-gray-400" />
                      </button>
                      <span className={`px-3 py-1 rounded-md text-xs font-medium ${getStatusStyle(request.status)}`}>
                        {request.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500">No DNA orders found.</div>
              )}
            </div>
          </div>

           {/* Primer Details and Plate Assignment Sections */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {/* Primer Details */}
               <div className="bg-white rounded-xl shadow border border-gray-200">
                   <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                       <h2 className="text-xl font-semibold text-gray-900">Primer Details</h2>
                       <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-800">View All</a>
                   </div>
                   <div className="p-6 min-h-[150px]">
                       {orders.length > 0 && orders.some(order => order.primer_details) ? (
                           <div className="space-y-4">
                               {orders.slice(0, 3)
                                .filter(order => order.primer_details)
                                .map(order => (
                                    <div key={order.id} className="p-3 border border-gray-200 rounded-lg">
                                        <p className="font-medium">{order.plate_name || 'Unnamed Plate'}</p>
                                        <p className="text-sm text-gray-600 mt-1">{order.primer_details}</p>
                                    </div>
                                ))
                               }
                           </div>
                       ) : (
                           <p className="text-center text-gray-400 text-sm mt-10">No primer details available.</p>
                       )}
                   </div>
               </div>

               {/* Plate Assignment */}
               <div className="bg-white rounded-xl shadow border border-gray-200">
                   <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                       <h2 className="text-xl font-semibold text-gray-900">Plate Assignment</h2>
                       <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-800">View All</a>
                   </div>
                   <div className="p-6 min-h-[150px]">
                       {orders.length > 0 && orders.some(order => order.plate_name) ? (
                           <div className="space-y-4">
                               {orders.slice(0, 3)
                                .filter(order => order.plate_name)
                                .map(order => (
                                    <div key={order.id} className="p-3 border border-gray-200 rounded-lg">
                                        <p className="font-medium">{order.plate_name}</p>
                                        <p className="text-sm text-gray-600 mt-1">DNA Type: {order.dna_type || 'N/A'}</p>
                                        <p className="text-sm text-gray-600">Quantity: {order.dna_quantity || 'N/A'}</p>
                                    </div>
                                ))
                               }
                           </div>
                       ) : (
                           <p className="text-center text-gray-400 text-sm mt-10">No plate assignments available.</p>
                       )}
                   </div>
               </div>
           </div>
        </div> {/* End Main Content Area */}

        {/* Past Actions Sidebar */}
        <aside className="w-80 bg-gray-100 p-6 border-l border-gray-200 min-h-screen">
          <h2 className="text-xl font-semibold text-gray-900 mb-5">Past Actions</h2>
          <div className="space-y-6">
            {pastActions.length > 0 ? (
              pastActions.map((dateGroup, index) => (
                <div key={index}>
                  <h3 className="text-xs font-semibold text-gray-500 mb-3 tracking-wide uppercase">{dateGroup.date}</h3>
                  <div className="space-y-3">
                    {dateGroup.actions.map((action) => (
                      <div key={action.id} className="flex items-start text-sm space-x-3">
                        <div className="w-16 flex-shrink-0 text-gray-500 font-medium pt-px">{action.time}</div>
                        <div className="flex-1">
                          <span className="font-medium text-gray-800">{action.user}</span>
                          <span className="text-gray-600 ml-1">{action.action}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 mt-4">No past actions found.</p>
            )}
          </div>
        </aside> {/* End Past Actions Sidebar */}

      </div> {/* End Flex container for main content and sidebar */}
    </div> // End Page container
  );
}