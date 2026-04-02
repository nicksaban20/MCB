'use client';

import { useState } from 'react';

const ANNOUNCEMENTS = [
  'Sample drop-off cutoff: Monday\u2013Friday before 2:00 PM',
  'Lab located at 310 Barker Hall, Berkeley CA 94720',
  'New: Upload sample details via CSV or XLSX spreadsheet',
];

export default function AnnouncementsTicker() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  // Duplicate the text so the scroll loop looks seamless
  const tickerText = ANNOUNCEMENTS.join('  \u00A0\u00A0\u2022\u00A0\u00A0  ');
  const doubled = `${tickerText}  \u00A0\u00A0\u2022\u00A0\u00A0  ${tickerText}`;

  return (
    <div className="relative z-[60] bg-[#003262] text-white text-sm overflow-hidden">
      <div className="flex items-center">
        {/* Scrolling area */}
        <div className="flex-1 overflow-hidden py-2">
          <div
            className="inline-block whitespace-nowrap"
            style={{
              animation: 'ticker-scroll 30s linear infinite',
            }}
          >
            {doubled}
          </div>
        </div>

        {/* Dismiss button */}
        <button
          onClick={() => setVisible(false)}
          className="shrink-0 px-3 py-2 hover:bg-[#00254a] transition text-white/70 hover:text-white"
          aria-label="Dismiss announcements"
        >
          &#x2715;
        </button>
      </div>

      {/* Keyframe animation injected via style tag */}
      <style>{`
        @keyframes ticker-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
