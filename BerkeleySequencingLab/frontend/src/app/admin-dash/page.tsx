"use client";

import React, { useState, useEffect } from 'react';
import type { User } from '@supabase/supabase-js';
// Using specific icons for clarity and potential bundle size reduction
import { FiClock, FiCheckCircle, FiActivity, FiEdit2 } from 'react-icons/fi';
import Navbar from '../navbar/Navbar'; // Assuming Navbar component exists and works as expected
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

type OrderStatus = 'pending' | 'in_progress' | 'completed';

type OrderRecord = {
  id: string;
  sample_type: string | null;
  dna_type: string | null;
  dna_quantity: string | null;
  primer_details: string | null;
  plate_name: string | null;
  status: OrderStatus | null;
  created_at: string | null;
};

type OrderStats = {
  completed: number;
  in_progress: number;
  pending: number;
};

const VALID_STATUSES: OrderStatus[] = ['pending', 'in_progress', 'completed'];

function buildOrderStats(orderRows: OrderRecord[]): OrderStats {
  return {
    completed: orderRows.filter((order) => order.status === 'completed').length,
    in_progress: orderRows.filter((order) => order.status === 'in_progress').length,
    pending: orderRows.filter((order) => order.status === 'pending').length,
  };
}

export default function AdminDashboard() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [stats, setStats] = useState<OrderStats>({
    completed: 0,
    in_progress: 0,
    pending: 0
  });
  const [totalSamples, setTotalSamples] = useState('0');
  const [user, setUser] = useState<User | null>(null);
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [savingOrderId, setSavingOrderId] = useState<string | null>(null);

  const loadOrders = async () => {
    const response = await fetch('/api/orders');

    if (!response.ok) {
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

    const data = (await response.json()) as OrderRecord[] | null;
    const safeData = data || [];
    setOrders(safeData);
    setStats(buildOrderStats(safeData));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data: userData, error: userError } = await supabase.auth.getUser();

        if (userError) {
          throw new Error(userError.message);
        }

        const currentUser = userData.user ?? null;
        setUser(currentUser);

        if (!currentUser) {
          router.replace('/unauthorized?reason=auth');
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', currentUser.id)
          .maybeSingle();

        if (profileError) {
          throw new Error(profileError.message);
        }

        const role = profile?.role;
        const isStaff = role === 'staff' || role === 'superadmin';

        if (!isStaff) {
          router.replace('/unauthorized?reason=admin');
          return;
        }

        setAuthorized(true);

        const [{ count: sampleCount, error: sampleCountError }] = await Promise.all([
          supabase
            .from('dna_samples')
            .select('id', { count: 'exact', head: true }),
          loadOrders(),
        ]);

        if (sampleCountError) {
          throw new Error(sampleCountError.message);
        }

        // Count actual sample rows instead of order rows.
        setTotalSamples((sampleCount ?? 0).toString());
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    };

    fetchData();
  }, [router, supabase]);

  const handleStatusUpdate = async (orderId: string, nextStatus: OrderStatus) => {
    try {
      setSavingOrderId(orderId);
      setSaveError(null);
      setSaveSuccess(null);

      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      const responseBody = await response.json();

      if (!response.ok) {
        throw new Error(responseBody?.details || responseBody?.error || 'Failed to update order');
      }

      const updatedOrder = responseBody.order as OrderRecord;
      setOrders((currentOrders) => {
        const nextOrders = currentOrders.map((order) =>
          order.id === updatedOrder.id ? updatedOrder : order
        );
        setStats(buildOrderStats(nextOrders));
        return nextOrders;
      });
      setSaveSuccess('Order status updated successfully.');
    } catch (updateError) {
      setSaveError(updateError instanceof Error ? updateError.message : 'Unknown error');
    } finally {
      setSavingOrderId(null);
    }
  };

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      month: 'short', 
      day: 'numeric',
      hour: 'numeric', 
      minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options)
      .replace(',', ' •');
  };

  // Group actions by date for the past actions sidebar
  const groupActionsByDate = (actions: OrderRecord[]) => {
    const grouped: Record<string, { id: string; time: string; user: string; action: string }[]> = {};
    
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
  const getStatusStyle = (status: string | null) => {
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
    title: order.plate_name || `Order ${index + 1}`,
    type: order.sample_type || 'Unknown Sample Type',
    date: formatDate(order.created_at),
    sampleName: order.plate_name || 'Unnamed Sample',
    status: (order.status || 'pending') as OrderStatus
  }));

  // Get past actions for the sidebar
  const pastActions = groupActionsByDate(orders);
  const displayName = user?.user_metadata?.firstName
    || user?.user_metadata?.full_name
    || user?.email
    || 'Admin';

  if (loading || !authorized) {
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
      <Navbar
        profilePicUrl={user?.user_metadata?.avatar_url || user?.user_metadata?.picture || ""}
        user={user}
      />

      <div className="flex flex-col xl:flex-row"> {/* Main content and sidebar layout */}

        {/* Main Content Area */}
        <div className="flex-1 p-4 sm:p-6 xl:p-8 xl:pr-4"> {/* Reduced right padding */}
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"> {/* Align items start */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">DNA Sequencing Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back, {displayName}</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-left shadow-sm lg:text-right">
              <p className="text-sm text-gray-500">Total DNA Samples</p>
              <p className="text-4xl font-bold text-gray-900">{totalSamples}</p>
            </div>
          </div>

          {/* DNA Orders Summary Section */}
          <div className="mb-10"> {/* Increased bottom margin */}
            <h2 className="text-xl font-semibold text-gray-900 mb-4">DNA Orders Summary</h2>
            {saveSuccess && (
              <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
                {saveSuccess}
              </div>
            )}
            {saveError && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                {saveError}
              </div>
            )}
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
                  <div key={request.id} className="px-6 py-4 flex flex-col gap-4 hover:bg-gray-50 transition duration-150 ease-in-out md:flex-row md:items-center md:justify-between">
                    {/* Left side content */}
                    <div className="flex flex-col">
                      <h3 className="text-sm font-semibold text-blue-600">{request.title}</h3>
                      <p className="text-sm text-gray-700 mt-1">{request.type}</p>
                      <p className="text-xs text-gray-400 mt-1">{request.date}</p>
                    </div>
                    {/* Right side content */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <label className="flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 bg-white focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                        <span className="mr-2">Status</span>
                        <FiEdit2 className="w-4 h-4 ml-2 text-gray-400" />
                        <select
                          value={request.status}
                          disabled={savingOrderId === request.id}
                          onChange={(event) => handleStatusUpdate(request.id, event.target.value as OrderStatus)}
                          className="ml-2 bg-transparent text-sm text-gray-700 outline-none disabled:cursor-not-allowed"
                        >
                          {VALID_STATUSES.map((statusOption) => (
                            <option key={statusOption} value={statusOption}>
                              {statusOption}
                            </option>
                          ))}
                        </select>
                      </label>
                      <span className={`inline-flex w-fit rounded-md px-3 py-1 text-xs font-medium ${getStatusStyle(request.status)}`}>
                        {savingOrderId === request.id ? 'saving...' : request.status}
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
        <aside className="min-h-0 border-t border-gray-200 bg-gray-100 p-4 sm:p-6 xl:min-h-screen xl:w-80 xl:border-l xl:border-t-0">
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
