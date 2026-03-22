'use client';

import { useState, useEffect } from 'react';
import Navbar from "../navbar/page";
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import { FaLinkedin, FaXTwitter, FaYoutube } from 'react-icons/fa6';

const SocialPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

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

  if (loading) return null;

  return (
    <>
      <Navbar profilePicUrl={user?.user_metadata?.avatar_url || user?.user_metadata?.picture || ""} user={user} />
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-[#003262] text-white py-12">
          <div className="max-w-4xl mx-auto px-6">
            <h1 className="text-3xl md:text-4xl font-bold">Social Media</h1>
            <p className="mt-3 text-[#FDB515] text-lg">Stay connected with the UC Berkeley DNA Sequencing Facility</p>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-6 py-10">
          <p className="text-gray-700 mb-8 leading-relaxed">
            Follow us on social media to stay up to date with facility news, service updates, sequencing tips, and highlights from our team. We share educational content, behind-the-scenes looks at our operations, and important announcements.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* LinkedIn */}
            <a
              href="https://www.linkedin.com/company/uc-berkeley-dna-sequencing-facility/"
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-[#0A66C2] transition-all duration-200 group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-[#0A66C2] flex items-center justify-center">
                  <FaLinkedin className="text-white text-2xl" />
                </div>
                <h2 className="text-lg font-semibold text-[#003262] group-hover:text-[#0A66C2] transition-colors">
                  LinkedIn
                </h2>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                Professional updates, team announcements, job postings, and facility milestones. Connect with our staff and see the latest from the Berkeley sequencing community.
              </p>
              <p className="text-[#0A66C2] text-sm font-medium mt-4 group-hover:underline">
                Follow us on LinkedIn &rarr;
              </p>
            </a>

            {/* X / Twitter */}
            <a
              href="https://x.com/berkeley_dnaseq"
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-gray-900 transition-all duration-200 group"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center">
                  <FaXTwitter className="text-white text-2xl" />
                </div>
                <h2 className="text-lg font-semibold text-[#003262] group-hover:text-gray-900 transition-colors">
                  X (Twitter)
                </h2>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                Quick updates, sequencing tips, service alerts, and retweets from the broader genomics and molecular biology community. Great for real-time facility status.
              </p>
              <p className="text-gray-900 text-sm font-medium mt-4 group-hover:underline">
                Follow us on X &rarr;
              </p>
            </a>

            {/* YouTube - Coming Soon */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 relative overflow-hidden">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-[#FF0000] flex items-center justify-center">
                  <FaYoutube className="text-white text-2xl" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-[#003262]">YouTube</h2>
                  <span className="inline-block bg-[#FDB515] text-[#003262] text-xs font-bold px-2 py-0.5 rounded mt-1">
                    COMING SOON
                  </span>
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                We are working on video tutorials covering sample preparation, results interpretation, chromatogram analysis, and facility walkthroughs. Subscribe when we launch to get notified.
              </p>
              <p className="text-gray-400 text-sm font-medium mt-4">
                Channel launching soon
              </p>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default SocialPage;
