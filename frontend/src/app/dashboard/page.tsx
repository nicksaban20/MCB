import React from "react";
import Navbar from "../navbar/page";

const Dashboard = () => {
    return (
        <div className="bg-white">
            <Navbar />
            <div className="bg-white min-h-screen mx-8 p-6">
                <div className="mb-6">
                    <h1 className="text-3xl text-gray-600 font-bold">Welcome Back!</h1>
                </div>


                <div className="bg-gray-100 p-6 rounded-lg flex justify-between items-center mb-6 border border-gray-300">
                    <div className="flex items-center">
                        <img src="https://via.placeholder.com/50" alt="Profile" className="rounded-full mr-4 " />
                        <div>
                            <h2 className="text-lg text-gray-500 font-semibold">Buzzy Kim</h2>
                            <p className="text-gray-500">buzzykim1234@gmail.com | (123) 456 7890</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-gray-600">1234 Street Way</p>
                        <p className="text-gray-600">Berkeley, CA 94704</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mt-6">
                    <div className="text-gray-400 bg-white">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl text-gray-600 font-semibold">Latest Updates</h3>
                            <button className="">View All</button>
                        </div>
                        <div className="space-y-4 p-6 rounded-lg border border-gray-300 mb-4">
                            {['Order Shipped', 'Under Review', 'Order Shipped'].map((update, index) => (
                                <div key={index} className="flex items-center py-2">
                                    <div className="w-10 h-10 bg-gray-300 rounded-md mr-4"></div>
                                    <div>
                                        <p className="font-medium">{update}</p>
                                        <p className="text-gray-500 text-sm">March 16 · 12:45 PM</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>


                    <div className="text-gray-400 bg-white">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl text-gray-600 font-semibold">Pending Orders</h3>
                            <button className="">View All</button>
                        </div>
                        <div className="space-y-4 p-6 rounded-lg border border-gray-300 mb-4">
                            {['Order Shipped', 'Under Review', 'Order Shipped'].map((update, index) => (
                                <div key={index} className="flex items-center py-2">
                                    <div className="w-10 h-10 bg-gray-300 rounded-md mr-4"></div>
                                    <div>
                                        <p className="font-medium">{update}</p>
                                        <p className="text-gray-500 text-sm">March 16 · 12:45 PM</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border mb-6">
                    <h3 className="text-lg font-semibold">Past Orders</h3>
                    <div className="space-y-4 mt-4">
                        {['Sequence 3', 'Sequence 3', 'Sequence 3'].map((order, index) => (
                            <div key={index} className="flex justify-between items-center border-b py-2">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-gray-300 rounded-md mr-4"></div>
                                    <div>
                                        <p className="font-medium">{order}</p>
                                        <p className="text-gray-500 text-sm">Sanger Sample Type · March 16 · 12:45 PM</p>
                                    </div>
                                </div>
                                <span className={`px-4 py-1 rounded-full font-semibold text-sm ${index === 2 ? 'bg-red-100 text-red-300' : 'bg-green-100 text-green-300'}`}>
                                    {index === 2 ? 'Rejected' : 'Approved'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end mt-4">
                    <button className="px-4 py-2 bg-gray-200 rounded-lg flex items-center">
                        Download Order History
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
