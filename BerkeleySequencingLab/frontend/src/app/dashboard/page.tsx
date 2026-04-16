import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import Navbar from "../navbar/Navbar";
import OrdersSection from "./OrdersSection";
import ProfileCard from "./ProfileCard";

const Dashboard = async () => {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
        redirect('/login');
    }

    const { data: orgData } = await supabase
        .from('organizations')
        .select('*')
        .eq('user_id', user.id)
        .single();

    const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || "";

    const ordersData = [
        {
            name: "Sequence A",
            date: "March 15",
            time: "12:55 PM",
            type: "Nanospore",
            approved: false,
        },
        {
            name: "Sequence B",
            date: "March 16",
            time: "12:45 PM",
            type: "Sanger",
            approved: true,
        },
    ];

    return (
        <div className="bg-white text-black">
            <Navbar profilePicUrl={avatarUrl} user={user} />
            <div className="min-h-screen bg-white px-4 py-4 sm:mx-4 sm:px-6 sm:py-6 lg:mx-8">
                <ProfileCard user={user} orgData={orgData} avatarUrl={avatarUrl} />

                <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <div className="text-black bg-white">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl text-[#003262] font-semibold">
                                Latest Updates
                            </h3>
                            <button className="text-[#003262] hover:text-[#FDB515]">View All</button>
                        </div>
                        <div className="space-y-4 p-6 rounded-lg border border-gray-300 mb-4">
                            {["Order Shipped", "Under Review", "Order Shipped"].map((update, index) => (
                                <div key={index} className="flex items-center py-2">
                                    <div className="w-10 h-10 bg-[#FDB515] rounded-md mr-4"></div>
                                    <div>
                                        <p className="font-medium text-[#003262]">{update}</p>
                                        <p className="text-gray-500 text-sm">
                                            March 16 · 12:45 PM
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="text-black bg-white">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl text-[#003262] font-semibold">
                                Pending Orders
                            </h3>
                            <button className="text-[#003262] hover:text-[#FDB515]">View All</button>
                        </div>
                        <div className="space-y-4 p-6 rounded-lg border border-gray-300 mb-4">
                            {["Order Shipped", "Under Review", "Order Shipped"].map((update, index) => (
                                <div key={index} className="flex items-center py-2">
                                    <div className="w-10 h-10 bg-[#FDB515] rounded-md mr-4"></div>
                                    <div>
                                        <p className="font-medium text-[#003262]">{update}</p>
                                        <p className="text-gray-500 text-sm">
                                            March 16 · 12:45 PM
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <OrdersSection orders={ordersData} />
            </div>
        </div>
    );
};

export default Dashboard;
