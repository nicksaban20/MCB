import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import Navbar from "../navbar/page";
import OrdersSection from "./OrdersSection";

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

    const firstName = user.user_metadata?.firstName || user.user_metadata?.name?.split(' ')[0] || '';
    const lastName = user.user_metadata?.lastName || user.user_metadata?.name?.split(' ').slice(1).join(' ') || '';
    const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || "https://via.placeholder.com/50";

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
            <div className="bg-white min-h-screen mx-8 p-6">
                <div className="mb-6">
                    <h1 className="text-3xl text-gray-800 font-bold">Welcome Back!</h1>
                </div>

                <div className="bg-gray-100 p-6 rounded-lg flex justify-between items-center mb-6 border border-gray-300">
                    <div className="flex items-center">
                        <img
                            src={avatarUrl}
                            alt="Profile"
                            className="rounded-full mr-4 w-12 h-12 object-cover"
                        />
                        <div>
                            <h2 className="text-lg text-gray-800 font-semibold">
                                {firstName} {lastName}
                            </h2>
                            <p className="text-gray-600">
                                {user.email} {orgData?.phone ? `| ${orgData.phone}` : ""}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-gray-800">
                            {orgData?.name || "No organization set"}
                        </p>
                        <p className="text-gray-600">
                            {orgData?.phone || "No phone number set"}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mt-6">
                    <div className="text-black bg-white">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl text-gray-800 font-semibold">
                                Latest Updates
                            </h3>
                            <button className="text-gray-700">View All</button>
                        </div>
                        <div className="space-y-4 p-6 rounded-lg border border-gray-300 mb-4">
                            {["Order Shipped", "Under Review", "Order Shipped"].map((update, index) => (
                                <div key={index} className="flex items-center py-2">
                                    <div className="w-10 h-10 bg-gray-300 rounded-md mr-4"></div>
                                    <div>
                                        <p className="font-medium text-gray-800">{update}</p>
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
                            <h3 className="text-xl text-gray-800 font-semibold">
                                Pending Orders
                            </h3>
                            <button className="text-gray-700">View All</button>
                        </div>
                        <div className="space-y-4 p-6 rounded-lg border border-gray-300 mb-4">
                            {["Order Shipped", "Under Review", "Order Shipped"].map((update, index) => (
                                <div key={index} className="flex items-center py-2">
                                    <div className="w-10 h-10 bg-gray-300 rounded-md mr-4"></div>
                                    <div>
                                        <p className="font-medium text-gray-800">{update}</p>
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
