"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { FiClock, FiCheckCircle, FiActivity, FiEdit2, FiSearch, FiChevronDown, FiChevronUp, FiSave, FiLoader } from 'react-icons/fi';
import Navbar from '../navbar/page';
import { createClient } from '@/utils/supabase/client';
import { updateOrderStatus, updateOrderNotes } from './actions';

interface Order {
  id: string;
  status: string;
  sample_type: string;
  plate_name: string;
  primer_details: string;
  dna_type: string;
  dna_quantity: string;
  created_at: string;
  customer_name?: string;
  customer_email?: string;
  notes?: string;
  [key: string]: unknown;
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({
    completed: 0,
    in_progress: 0,
    pending: 0
  });
  const [totalSamples, setTotalSamples] = useState('0');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Expanded row and notes state
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [notesText, setNotesText] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  // Status update loading state
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from('dna_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      const safeData: Order[] = data || [];
      setOrders(safeData);

      const completedOrders = safeData.filter(order => order.status?.toLowerCase() === 'completed');
      const inProgressOrders = safeData.filter(order => order.status?.toLowerCase() === 'in_progress');
      const pendingOrders = safeData.filter(order => order.status?.toLowerCase() === 'pending');

      setStats({
        completed: completedOrders.length,
        in_progress: inProgressOrders.length,
        pending: pendingOrders.length
      });

      setTotalSamples(safeData.length.toString());
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Filter orders based on search query and status filter
  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchQuery === '' ||
      (order.customer_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.customer_email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.plate_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.sample_type || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' ||
      order.status?.toLowerCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Handle status change
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingStatusId(orderId);
    const result = await updateOrderStatus(orderId, newStatus);

    if (result.error) {
      alert(`Failed to update status: ${result.error}`);
    } else {
      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      // Recalculate stats
      const updated = orders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      );
      setStats({
        completed: updated.filter(o => o.status?.toLowerCase() === 'completed').length,
        in_progress: updated.filter(o => o.status?.toLowerCase() === 'in_progress').length,
        pending: updated.filter(o => o.status?.toLowerCase() === 'pending').length,
      });
    }
    setUpdatingStatusId(null);
  };

  // Handle row expand/collapse
  const toggleExpand = (orderId: string, currentNotes: string) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
      setNotesText('');
    } else {
      setExpandedOrderId(orderId);
      setNotesText(currentNotes || '');
    }
  };

  // Handle save notes
  const handleSaveNotes = async (orderId: string) => {
    setSavingNotes(true);
    const result = await updateOrderNotes(orderId, notesText);

    if (result.error) {
      alert(`Failed to save notes: ${result.error}`);
    } else {
      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, notes: notesText } : order
        )
      );
    }
    setSavingNotes(false);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options)
      .replace(',', ' \u2022');
  };

  // Group actions by date for the past actions sidebar
  const groupActionsByDate = (actions: Order[]) => {
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
        user: "User",
        action: `DNA sample ${action.sample_type} ${action.status}`
      });
    });

    return Object.keys(grouped).map(date => ({
      date,
      actions: grouped[date]
    }));
  };

  // Updated status styles to closely match the design
  const getStatusStyle = (status: string) => {
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
    <div className="min-h-screen bg-gray-50">
      <Navbar profilePicUrl="" user={null} />

      <div className="flex flex-row">
        {/* Main Content Area */}
        <div className="flex-1 p-8 pr-4">
          <div className="flex justify-between items-start mb-8">
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
          <div className="mb-10">
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

          {/* Search and Filter Bar */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, plate, or sample type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Recent DNA Orders Section */}
          <div className="bg-white rounded-xl shadow border border-gray-200 mb-10">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Recent DNA Orders</h2>
              <span className="text-sm text-gray-500">
                {filteredOrders.length} of {orders.length} orders
              </span>
            </div>
            <div className="divide-y divide-gray-100">
              {incomingRequests.length > 0 ? (
                incomingRequests.map((request) => (
                  <div key={request.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition duration-150 ease-in-out">
                    <div className="flex flex-col">
                      <h3 className="text-sm font-semibold text-blue-600">{request.title}</h3>
                      <p className="text-sm text-gray-700 mt-1">{request.type}</p>
                      <p className="text-xs text-gray-400 mt-1">{request.date}</p>
                    </div>
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

          {/* All Orders Table with Status Edit and Notes */}
          <div className="bg-white rounded-xl shadow border border-gray-200 mb-10">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">All Orders</h2>
            </div>

            {/* Table Header */}
            <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <div className="col-span-1"></div>
              <div className="col-span-3">Order / Customer</div>
              <div className="col-span-2">Sample Type</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Notes</div>
            </div>

            <div className="divide-y divide-gray-100">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <div key={order.id}>
                    {/* Order Row */}
                    <div
                      className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition duration-150 ease-in-out cursor-pointer"
                      onClick={() => toggleExpand(order.id, order.notes || '')}
                    >
                      {/* Expand indicator */}
                      <div className="col-span-1 flex items-center">
                        {expandedOrderId === order.id ? (
                          <FiChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <FiChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </div>

                      {/* Order / Customer info */}
                      <div className="col-span-3">
                        <p className="text-sm font-medium text-gray-900">
                          {order.plate_name || 'Unnamed'}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {order.customer_name || order.customer_email || `ID: ${order.id.slice(0, 8)}...`}
                        </p>
                      </div>

                      {/* Sample Type */}
                      <div className="col-span-2">
                        <p className="text-sm text-gray-700">{order.sample_type || 'N/A'}</p>
                      </div>

                      {/* Date */}
                      <div className="col-span-2">
                        <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                      </div>

                      {/* Status Dropdown */}
                      <div className="col-span-2" onClick={(e) => e.stopPropagation()}>
                        <div className="relative">
                          <select
                            value={order.status?.toLowerCase() || 'pending'}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            disabled={updatingStatusId === order.id}
                            className={`w-full appearance-none pl-3 pr-8 py-1.5 rounded-md text-xs font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${getStatusStyle(order.status)} ${updatingStatusId === order.id ? 'opacity-50' : ''}`}
                          >
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                          </select>
                          {updatingStatusId === order.id && (
                            <FiLoader className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 animate-spin" />
                          )}
                        </div>
                      </div>

                      {/* Notes indicator */}
                      <div className="col-span-2">
                        <span className="text-xs text-gray-400">
                          {order.notes ? 'Has notes' : 'No notes'}
                        </span>
                      </div>
                    </div>

                    {/* Expanded Notes Area */}
                    {expandedOrderId === order.id && (
                      <div className="px-6 pb-4 bg-gray-50 border-t border-gray-100">
                        <div className="pt-4 pl-8">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Internal Notes
                          </label>
                          <textarea
                            value={notesText}
                            onChange={(e) => setNotesText(e.target.value)}
                            placeholder="Add internal notes for this order..."
                            rows={3}
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
                          />
                          <div className="mt-2 flex items-center justify-between">
                            <p className="text-xs text-gray-400">
                              Notes are visible only to admins.
                            </p>
                            <button
                              onClick={() => handleSaveNotes(order.id)}
                              disabled={savingNotes}
                              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                              {savingNotes ? (
                                <>
                                  <FiLoader className="w-4 h-4 mr-2 animate-spin" />
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <FiSave className="w-4 h-4 mr-2" />
                                  Save Notes
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  {searchQuery || statusFilter !== 'all'
                    ? 'No orders match your search or filter criteria.'
                    : 'No orders found.'}
                </div>
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
        </div>

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
        </aside>
      </div>
    </div>
  );
}
