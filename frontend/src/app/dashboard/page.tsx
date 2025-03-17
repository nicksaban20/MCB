import React from "react";
import Navbar from "../navbar/page";
const Dashboard = () => {
  return (
    <div className=" bg-gray-100 min-h-screen">
      {/* Header */}
      <Navbar />
      <div className=" p-6 mb-6">
        <h1 className="text-3xl font-bold">Welcome Back!</h1>
      </div>

      {/* Profile Section */}
      <div className=" bg-white p-4 rounded-lg shadow flex justify-between items-center">
        <div className="flex items-center">
          <img src="https://via.placeholder.com/50" alt="Profile" className="rounded-full mr-4" />
          <div>
            <h2 className="text-lg font-semibold">Buzzy Kim</h2>
            <p className="text-gray-500">buzzykim1234@gmail.com | (123) 456 7890</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-gray-600">1234 Street Way</p>
          <p className="text-gray-600">Berkeley, CA 94704</p>
        </div>
        <button className="px-4 py-2 bg-gray-200 rounded-lg">Edit ✏️</button>
      </div>

      {/* Updates and Orders */}
      <div className="grid grid-cols-2 gap-6 mt-6">
        {/* Latest Updates */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Latest Updates</h3>
            <button className="text-gray-600">View All</button>
          </div>
          <div className="mt-4">
            {["Order Shipped", "Under Review", "Order Shipped"].map((update, index) => (
              <div key={index} className="flex items-center border-b py-2">
                <div className="w-10 h-10 bg-gray-300 rounded-md mr-4"></div>
                <div>
                  <p className="font-medium">{update}</p>
                  <p className="text-gray-500 text-sm">March 16 · 12:45 PM</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Pending Orders</h3>
            <button className="text-gray-600">View All</button>
          </div>
          <div className="mt-4">
            {["Sequence 4", "Sequence 5", "Sequence 6"].map((sequence, index) => (
              <div key={index} className="flex items-center border-b py-2">
                <div className="w-10 h-10 bg-gray-300 rounded-md mr-4"></div>
                <div>
                  <p className="font-medium">{sequence}</p>
                  <p className="text-gray-500 text-sm">March 16 · 12:45 PM</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Past Orders */}
      <div className="bg-white p-4 rounded-lg shadow mt-6">
        <h3 className="text-lg font-semibold">Past Orders</h3>
        <div className="mt-4">
          {["Sequence 3", "Sequence 3", "Sequence 3"].map((order, index) => (
            <div key={index} className="flex justify-between items-center border-b py-2">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-300 rounded-md mr-4"></div>
                <div>
                  <p className="font-medium">{order}</p>
                  <p className="text-gray-500 text-sm">Sanger Sample Type · March 16 · 12:45 PM</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-white ${index === 2 ? 'bg-red-500' : 'bg-green-500'}`}>
                {index === 2 ? 'Rejected' : 'Approved'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Download Button */}
      <div className="flex justify-end mt-4">
        <button className="px-4 py-2 bg-gray-200 rounded-lg flex items-center">
          Download Order History ⬇️
        </button>
      </div>
    </div>
  );
};

export default Dashboard;