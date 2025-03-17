import React from "react";
import Navbar from "../navbar/page";

const BerkeleyLabWelcome = () => {
  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-4xl font-bold text-blue-600 mt-10">Welcome to Berkeley Sequencing Lab</h1>
      </div>
    </div>
  );
};

export default BerkeleyLabWelcome;