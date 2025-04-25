"use client";

import React, { useState } from "react";

const OrdersSection = ({ orders }: { orders: any[] }) => {
    const [sortOption, setSortOption] = useState("date");

    const sortedOrders = [...orders].sort((a, b) => {
        if (sortOption === "name") {
            return a.name.localeCompare(b.name);
        } else if (sortOption === "approved") {
            return Number(b.approved) - Number(a.approved);
        } else {
            const parseDate = (order: any) => new Date(`${order.date} 2024 ${order.time}`);
            return parseDate(b).getTime() - parseDate(a).getTime();
        }
    });

    return (
        <div className="bg-white p-6 rounded-lg border border-gray-300 mb-6 text-gray-800">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Past Orders</h3>
                <select
                    className="text-sm border border-gray-300 rounded-md p-1 text-gray-800 bg-white"
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                >
                    <option value="date">Date</option>
                    <option value="name">Name</option>
                    <option value="approved">Status</option>
                </select>
            </div>

            <div className="space-y-4 mt-4">
                {sortedOrders.map((order, index) => (
                    <div key={index} className="flex justify-between items-center border-b border-gray-200 py-2">
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-300 rounded-md mr-4"></div>
                            <div>
                                <p className="font-medium text-gray-900">{order.name}</p>
                                <p className="text-gray-600 text-sm">
                                    {order.type} Sample Type · {order.date} · {order.time}
                                </p>
                            </div>
                        </div>
                        <span
                            className={`px-4 py-1 rounded-full font-semibold text-sm ${order.approved ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                }`}
                        >
                            {order.approved ? "Approved" : "Rejected"}
                        </span>
                    </div>
                ))}
            </div>

            <div className="flex justify-end mt-4">
                <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg flex items-center">
                    Download Order History
                </button>
            </div>
        </div>
    );
};

export default OrdersSection;
