'use client';

import { useState, useEffect } from 'react';
import Navbar from '../navbar/page';
import { createClient } from '@/utils/supabase/client';
import { useToast } from '@/context/ToastContext';
import type { CalendarEvent } from '@/types';
import {
  getCalendarEvents,
  createCalendarEvent,
  deleteCalendarEvent,
} from '../actions/calendar';
import { isAdmin } from '@/utils/admin';
import { User } from '@supabase/supabase-js';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const EVENT_COLORS: Record<CalendarEvent['event_type'], string> = {
  closure: 'bg-red-500',
  holiday: 'bg-orange-400',
  deadline: 'bg-blue-500',
  cutoff: 'bg-blue-500',
  event: 'bg-green-500',
};

const EVENT_COLOR_LABELS: { type: CalendarEvent['event_type']; color: string; label: string }[] = [
  { type: 'closure', color: 'bg-red-500', label: 'Closure' },
  { type: 'holiday', color: 'bg-orange-400', label: 'Holiday' },
  { type: 'deadline', color: 'bg-blue-500', label: 'Deadline / Cutoff' },
  { type: 'event', color: 'bg-green-500', label: 'Event' },
];

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function dateInRange(startStr: string, endStr: string, year: number, month: number, day: number): boolean {
  const check = new Date(year, month, day);
  const start = new Date(startStr + 'T00:00:00');
  const end = new Date(endStr + 'T00:00:00');
  return check >= start && check <= end;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export default function CalendarPage() {
  const supabase = createClient();
  const { showToast } = useToast();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<{ year: number; month: number; day: number } | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'event' as CalendarEvent['event_type'],
    start_date: '',
    end_date: '',
    all_day: true,
    location: '',
  });

  // Fetch user
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await getCalendarEvents();
      if (error) {
        showToast('Failed to load calendar events', 'error');
      } else if (data) {
        setEvents(data);
      }
    };
    fetchEvents();
  }, []);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDate(null);
  };

  const handleDayClick = (day: number) => {
    setSelectedDate({ year: currentYear, month: currentMonth, day });
  };

  const getEventsForDay = (year: number, month: number, day: number): CalendarEvent[] => {
    return events.filter((ev) => dateInRange(ev.start_date, ev.end_date, year, month, day));
  };

  const getEventTypesForDay = (year: number, month: number, day: number): CalendarEvent['event_type'][] => {
    const dayEvents = getEventsForDay(year, month, day);
    const types = new Set(dayEvents.map((e) => e.event_type));
    return Array.from(types);
  };

  const getUpcomingEvents = (): CalendarEvent[] => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const futureLimit = new Date(now);
    futureLimit.setDate(futureLimit.getDate() + 14);

    return events.filter((ev) => {
      const end = new Date(ev.end_date + 'T00:00:00');
      const start = new Date(ev.start_date + 'T00:00:00');
      return end >= now && start <= futureLimit;
    });
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.start_date || !formData.end_date) {
      showToast('Please fill in title, start date, and end date', 'error');
      return;
    }
    const { success, error } = await createCalendarEvent({
      title: formData.title,
      description: formData.description,
      event_type: formData.event_type,
      start_date: formData.start_date,
      end_date: formData.end_date,
      all_day: formData.all_day,
      location: formData.location,
    });
    if (error) {
      showToast(`Error creating event: ${error}`, 'error');
    } else if (success) {
      showToast('Event created successfully', 'success');
      setShowAddForm(false);
      setFormData({
        title: '',
        description: '',
        event_type: 'event',
        start_date: '',
        end_date: '',
        all_day: true,
        location: '',
      });
      // Refresh events
      const { data } = await getCalendarEvents();
      if (data) setEvents(data);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    const { success, error } = await deleteCalendarEvent(id);
    if (error) {
      showToast(`Error deleting event: ${error}`, 'error');
    } else if (success) {
      showToast('Event deleted', 'success');
      setEvents((prev) => prev.filter((ev) => ev.id !== id));
    }
  };

  // Build calendar grid data
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
  const cells: (number | null)[] = [];

  for (let i = 0; i < totalCells; i++) {
    const dayNum = i - firstDay + 1;
    if (dayNum < 1 || dayNum > daysInMonth) {
      cells.push(null);
    } else {
      cells.push(dayNum);
    }
  }

  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  const isToday = (day: number) =>
    today.getFullYear() === currentYear && today.getMonth() === currentMonth && today.getDate() === day;

  const isSelected = (day: number) =>
    selectedDate?.year === currentYear && selectedDate?.month === currentMonth && selectedDate?.day === day;

  const selectedDayEvents = selectedDate
    ? getEventsForDay(selectedDate.year, selectedDate.month, selectedDate.day)
    : [];

  const upcomingEvents = getUpcomingEvents();

  if (loading) return null;

  return (
    <>
      <Navbar
        profilePicUrl={user?.user_metadata?.avatar_url || user?.user_metadata?.picture || ''}
        user={user}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-[#003262] text-white py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold">Lab Calendar</h1>
            <p className="mt-2 text-gray-300">
              UC Berkeley DNA Sequencing Lab &mdash; closures, deadlines, and events
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main calendar area */}
            <div className="flex-1">
              {/* Admin Add Event button */}
              {isAdmin(user) && (
                <div className="mb-4">
                  <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="px-5 py-2 rounded-lg font-semibold text-white transition"
                    style={{ backgroundColor: '#003262' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FDB515')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#003262')}
                  >
                    {showAddForm ? 'Cancel' : '+ Add Event'}
                  </button>
                </div>
              )}

              {/* Add Event Form */}
              {showAddForm && isAdmin(user) && (
                <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-200">
                  <h2 className="text-lg font-bold text-[#003262] mb-4">Add New Event</h2>
                  <form onSubmit={handleAddEvent} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003262] text-gray-800"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Event Type</label>
                        <select
                          value={formData.event_type}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              event_type: e.target.value as CalendarEvent['event_type'],
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003262] text-gray-800"
                        >
                          <option value="event">Event</option>
                          <option value="closure">Closure</option>
                          <option value="holiday">Holiday</option>
                          <option value="deadline">Deadline</option>
                          <option value="cutoff">Cutoff</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Start Date</label>
                        <input
                          type="date"
                          value={formData.start_date}
                          onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003262] text-gray-800"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">End Date</label>
                        <input
                          type="date"
                          value={formData.end_date}
                          onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003262] text-gray-800"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Location</label>
                        <input
                          type="text"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003262] text-gray-800"
                        />
                      </div>
                      <div className="flex items-end">
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                          <input
                            type="checkbox"
                            checked={formData.all_day}
                            onChange={(e) => setFormData({ ...formData, all_day: e.target.checked })}
                            className="w-4 h-4 text-[#003262] rounded focus:ring-[#003262]"
                          />
                          All Day
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#003262] text-gray-800"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-6 py-2 rounded-lg font-semibold text-white transition"
                        style={{ backgroundColor: '#003262' }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FDB515')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#003262')}
                      >
                        Create Event
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Calendar navigation */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                <div className="flex items-center justify-between px-6 py-4 bg-[#003262]">
                  <button
                    onClick={handlePrevMonth}
                    className="text-white hover:text-[#FDB515] transition text-xl font-bold px-2"
                    aria-label="Previous month"
                  >
                    &larr;
                  </button>
                  <h2 className="text-xl font-bold text-white">
                    {MONTH_NAMES[currentMonth]} {currentYear}
                  </h2>
                  <button
                    onClick={handleNextMonth}
                    className="text-white hover:text-[#FDB515] transition text-xl font-bold px-2"
                    aria-label="Next month"
                  >
                    &rarr;
                  </button>
                </div>

                {/* Day-of-week header */}
                <div className="grid grid-cols-7 bg-gray-100 border-b border-gray-200">
                  {DAY_LABELS.map((label) => (
                    <div
                      key={label}
                      className="py-2 text-center text-xs font-semibold text-gray-600 uppercase tracking-wide"
                    >
                      {label}
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div>
                  {weeks.map((week, wi) => (
                    <div key={wi} className="grid grid-cols-7 border-b border-gray-100 last:border-b-0">
                      {week.map((day, di) => {
                        if (day === null) {
                          return <div key={di} className="min-h-[80px] bg-gray-50" />;
                        }

                        const dayEventTypes = getEventTypesForDay(currentYear, currentMonth, day);
                        const todayHighlight = isToday(day);
                        const selectedHighlight = isSelected(day);

                        return (
                          <button
                            key={di}
                            onClick={() => handleDayClick(day)}
                            className={`min-h-[80px] p-2 text-left transition-colors relative border-r border-gray-100 last:border-r-0 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#003262] ${
                              selectedHighlight
                                ? 'bg-[#003262] bg-opacity-10 ring-2 ring-inset ring-[#003262]'
                                : ''
                            }`}
                          >
                            <span
                              className={`inline-flex items-center justify-center w-7 h-7 text-sm font-medium rounded-full ${
                                todayHighlight
                                  ? 'bg-[#FDB515] text-[#003262] font-bold'
                                  : selectedHighlight
                                  ? 'text-[#003262] font-bold'
                                  : 'text-gray-700'
                              }`}
                            >
                              {day}
                            </span>
                            {/* Event dots */}
                            {dayEventTypes.length > 0 && (
                              <div className="flex gap-1 mt-1 flex-wrap">
                                {dayEventTypes.map((type) => (
                                  <span
                                    key={type}
                                    className={`w-2 h-2 rounded-full ${EVENT_COLORS[type]}`}
                                  />
                                ))}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div className="mt-4 bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">Legend</h3>
                <div className="flex flex-wrap gap-4">
                  {EVENT_COLOR_LABELS.map(({ type, color, label }) => (
                    <div key={type} className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${color}`} />
                      <span className="text-sm text-gray-700">{label}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#FDB515] text-[#003262] text-xs font-bold">
                      {today.getDate()}
                    </span>
                    <span className="text-sm text-gray-700">Today</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="w-full lg:w-80 space-y-6">
              {/* Selected day events */}
              {selectedDate && (
                <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200">
                  <h3 className="text-lg font-bold text-[#003262] mb-3">
                    {MONTH_NAMES[selectedDate.month]} {selectedDate.day}, {selectedDate.year}
                  </h3>
                  {selectedDayEvents.length === 0 ? (
                    <p className="text-gray-500 text-sm">No events on this day.</p>
                  ) : (
                    <div className="space-y-3">
                      {selectedDayEvents.map((ev) => (
                        <div
                          key={ev.id}
                          className="border-l-4 pl-3 py-2"
                          style={{
                            borderColor:
                              ev.event_type === 'closure'
                                ? '#ef4444'
                                : ev.event_type === 'holiday'
                                ? '#fb923c'
                                : ev.event_type === 'deadline' || ev.event_type === 'cutoff'
                                ? '#3b82f6'
                                : '#22c55e',
                          }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-semibold text-gray-800">{ev.title}</p>
                              {ev.description && (
                                <p className="text-sm text-gray-600 mt-1">{ev.description}</p>
                              )}
                              <div className="flex flex-wrap gap-2 mt-1">
                                <span className="text-xs text-gray-500">
                                  {formatDate(ev.start_date)}
                                  {ev.start_date !== ev.end_date && ` - ${formatDate(ev.end_date)}`}
                                </span>
                                {ev.location && (
                                  <span className="text-xs text-gray-500">| {ev.location}</span>
                                )}
                              </div>
                            </div>
                            {isAdmin(user) && (
                              <button
                                onClick={() => handleDeleteEvent(ev.id)}
                                className="text-red-500 hover:text-red-700 text-sm font-medium shrink-0"
                                title="Delete event"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Upcoming events */}
              <div className="bg-white rounded-xl shadow-md p-5 border border-gray-200">
                <h3 className="text-lg font-bold text-[#003262] mb-3">Upcoming Events</h3>
                <p className="text-xs text-gray-500 mb-3">Next 14 days</p>
                {upcomingEvents.length === 0 ? (
                  <p className="text-gray-500 text-sm">No upcoming events.</p>
                ) : (
                  <div className="space-y-3">
                    {upcomingEvents.map((ev) => (
                      <div
                        key={ev.id}
                        className="border-l-4 pl-3 py-2"
                        style={{
                          borderColor:
                            ev.event_type === 'closure'
                              ? '#ef4444'
                              : ev.event_type === 'holiday'
                              ? '#fb923c'
                              : ev.event_type === 'deadline' || ev.event_type === 'cutoff'
                              ? '#3b82f6'
                              : '#22c55e',
                        }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-gray-800 text-sm">{ev.title}</p>
                            {ev.description && (
                              <p className="text-xs text-gray-600 mt-0.5">{ev.description}</p>
                            )}
                            <span className="text-xs text-gray-500">
                              {formatDate(ev.start_date)}
                              {ev.start_date !== ev.end_date && ` - ${formatDate(ev.end_date)}`}
                            </span>
                          </div>
                          {isAdmin(user) && (
                            <button
                              onClick={() => handleDeleteEvent(ev.id)}
                              className="text-red-500 hover:text-red-700 text-xs font-medium shrink-0"
                              title="Delete event"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
