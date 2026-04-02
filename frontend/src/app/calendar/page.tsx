'use client';

import { useState } from 'react';
import Navbar from '../navbar/page';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// --- Hardcoded important dates ---
// Key format: "YYYY-MM-DD"

interface CalendarEvent {
  label: string;
  type: 'closed' | 'event';
}

// Helper: generate a range of dates (inclusive) as "YYYY-MM-DD" strings
function dateRange(startStr: string, endStr: string): string[] {
  const dates: string[] = [];
  const cur = new Date(startStr + 'T00:00:00');
  const end = new Date(endStr + 'T00:00:00');
  while (cur <= end) {
    dates.push(cur.toISOString().slice(0, 10));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

function buildEvents(): Record<string, CalendarEvent[]> {
  const map: Record<string, CalendarEvent[]> = {};

  const add = (date: string, ev: CalendarEvent) => {
    if (!map[date]) map[date] = [];
    map[date].push(ev);
  };

  // --- 2026 UC Berkeley academic calendar holidays & closures ---

  // Martin Luther King Jr. Day
  add('2026-01-19', { label: 'MLK Jr. Day — Lab Closed', type: 'closed' });

  // Presidents\' Day
  add('2026-02-16', { label: "Presidents' Day — Lab Closed", type: 'closed' });

  // Spring Break 2026 (Mar 23–27)
  for (const d of dateRange('2026-03-23', '2026-03-27')) {
    add(d, { label: 'Spring Break — Lab Closed', type: 'closed' });
  }

  // Cesar Chavez Day (observed)
  add('2026-03-31', { label: 'Cesar Chavez Day — Lab Closed', type: 'closed' });

  // Memorial Day
  add('2026-05-25', { label: 'Memorial Day — Lab Closed', type: 'closed' });

  // Juneteenth
  add('2026-06-19', { label: 'Juneteenth — Lab Closed', type: 'closed' });

  // Independence Day (observed — Jul 4 is Saturday in 2026, observed Fri Jul 3)
  add('2026-07-03', { label: 'Independence Day (Observed) — Lab Closed', type: 'closed' });

  // Labor Day
  add('2026-09-07', { label: 'Labor Day — Lab Closed', type: 'closed' });

  // Veterans Day
  add('2026-11-11', { label: "Veterans Day — Lab Closed", type: 'closed' });

  // Thanksgiving week
  for (const d of dateRange('2026-11-26', '2026-11-27')) {
    add(d, { label: 'Thanksgiving Break — Lab Closed', type: 'closed' });
  }

  // Winter Break 2026-2027 (Dec 24 – Jan 1)
  for (const d of dateRange('2026-12-24', '2026-12-31')) {
    add(d, { label: 'Winter Break — Lab Closed', type: 'closed' });
  }
  add('2027-01-01', { label: "New Year's Day — Lab Closed", type: 'closed' });

  // --- Special events / info dates ---
  add('2026-01-20', { label: 'Spring semester begins', type: 'event' });
  add('2026-05-15', { label: 'Spring semester ends', type: 'event' });
  add('2026-06-22', { label: 'Summer session begins', type: 'event' });
  add('2026-08-14', { label: 'Summer session ends', type: 'event' });
  add('2026-08-26', { label: 'Fall semester begins', type: 'event' });
  add('2026-12-11', { label: 'Fall semester ends', type: 'event' });

  return map;
}

const EVENTS = buildEvents();

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function formatDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function isWeekend(year: number, month: number, day: number) {
  const dow = new Date(year, month, day).getDay();
  return dow === 0 || dow === 6;
}

export default function CalendarPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const goToday = () => {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
  };

  // Build cells: leading blanks + day numbers
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  // Upcoming events (next 90 days from today)
  const upcoming: { date: string; events: CalendarEvent[] }[] = [];
  for (let i = 0; i < 90; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    if (EVENTS[key]) {
      upcoming.push({ date: key, events: EVENTS[key] });
    }
  }

  const isToday = (day: number) =>
    year === today.getFullYear() && month === today.getMonth() && day === today.getDate();

  return (
    <div className="min-h-screen bg-white">
      <Navbar profilePicUrl="" user={null} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <h1 className="text-3xl font-bold text-[#003262] mb-1">Lab Calendar</h1>
        <p className="text-gray-500 mb-8">
          Sample drop-off cutoff: <span className="font-semibold">Mon&ndash;Fri before 2:00 PM</span>
        </p>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Calendar grid */}
          <div className="flex-1">
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={prevMonth}
                className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition text-sm"
              >
                &larr; Prev
              </button>
              <div className="flex items-center gap-3">
                <span className="text-xl font-semibold text-[#003262]">
                  {MONTH_NAMES[month]} {year}
                </span>
                <button
                  onClick={goToday}
                  className="text-xs px-2 py-1 rounded bg-[#003262] text-white hover:bg-[#00254a] transition"
                >
                  Today
                </button>
              </div>
              <button
                onClick={nextMonth}
                className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition text-sm"
              >
                Next &rarr;
              </button>
            </div>

            {/* Day-of-week headers */}
            <div className="grid grid-cols-7 text-center text-xs font-semibold text-gray-500 mb-1">
              {DAY_NAMES.map(d => (
                <div key={d} className="py-2">{d}</div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 border-t border-l border-gray-200">
              {cells.map((day, idx) => {
                if (day === null) {
                  return <div key={`blank-${idx}`} className="border-b border-r border-gray-200 bg-gray-50 min-h-[90px]" />;
                }

                const key = formatDateKey(year, month, day);
                const dayEvents = EVENTS[key] || [];
                const hasClosed = dayEvents.some(e => e.type === 'closed');
                const weekend = isWeekend(year, month, day);
                const todayCell = isToday(day);

                let bgClass = 'bg-white';
                if (hasClosed) bgClass = 'bg-red-50';
                else if (weekend) bgClass = 'bg-gray-50';

                return (
                  <div
                    key={key}
                    className={`border-b border-r border-gray-200 min-h-[90px] p-1.5 ${bgClass} relative group`}
                  >
                    <span
                      className={`text-sm font-medium inline-flex items-center justify-center w-7 h-7 rounded-full
                        ${todayCell ? 'bg-[#003262] text-white' : 'text-gray-700'}
                        ${weekend && !todayCell ? 'text-gray-400' : ''}
                      `}
                    >
                      {day}
                    </span>

                    {/* Event dots / labels */}
                    <div className="mt-0.5 space-y-0.5">
                      {dayEvents.map((ev, i) => (
                        <div
                          key={i}
                          className={`text-[10px] leading-tight px-1 py-0.5 rounded truncate
                            ${ev.type === 'closed' ? 'bg-red-200 text-red-800' : 'bg-blue-100 text-blue-800'}
                          `}
                          title={ev.label}
                        >
                          {ev.label}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-6 mt-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded bg-red-200 border border-red-300" />
                Lab Closed
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded bg-blue-100 border border-blue-300" />
                Special Event
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 h-3 rounded-full bg-[#003262]" />
                Today
              </span>
            </div>
          </div>

          {/* Sidebar: upcoming events */}
          <aside className="w-full lg:w-72 shrink-0">
            <div className="rounded-xl border border-gray-200 overflow-hidden">
              <div className="bg-[#003262] text-white px-4 py-3 font-semibold text-sm">
                Upcoming Events &amp; Closures
              </div>
              <div className="divide-y divide-gray-100 max-h-[480px] overflow-y-auto">
                {upcoming.length === 0 && (
                  <p className="text-sm text-gray-400 p-4">No upcoming events in the next 90 days.</p>
                )}
                {upcoming.map(({ date, events }) => {
                  const d = new Date(date + 'T00:00:00');
                  const label = d.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });
                  return events.map((ev, i) => (
                    <div key={`${date}-${i}`} className="px-4 py-3 hover:bg-gray-50 transition">
                      <p className="text-xs text-gray-400">{label}</p>
                      <p className={`text-sm font-medium ${ev.type === 'closed' ? 'text-red-700' : 'text-blue-700'}`}>
                        {ev.label}
                      </p>
                    </div>
                  ));
                })}
              </div>
            </div>

            {/* Drop-off schedule */}
            <div className="mt-6 rounded-xl border border-gray-200 p-4">
              <h3 className="font-semibold text-sm text-[#003262] mb-2">Sample Drop-Off Schedule</h3>
              <ul className="text-sm text-gray-600 space-y-1.5">
                <li className="flex justify-between">
                  <span>Monday&ndash;Friday</span>
                  <span className="font-medium">9:00 AM &ndash; 2:00 PM</span>
                </li>
                <li className="flex justify-between">
                  <span>Saturday&ndash;Sunday</span>
                  <span className="text-gray-400">Closed</span>
                </li>
              </ul>
              <p className="text-xs text-gray-400 mt-3">
                Samples received after 2:00 PM will be processed the next business day.
              </p>
            </div>
          </aside>
        </div>

        {/* Footer note */}
        <div className="mt-10 border-t border-gray-200 pt-6 text-sm text-gray-500 text-center">
          Lab hours: Monday&ndash;Friday, 9:00 AM &ndash; 5:00 PM. Located at 310 Barker Hall.
        </div>
      </div>
    </div>
  );
}
