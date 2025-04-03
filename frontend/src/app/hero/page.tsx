"use client";

import Image from "next/image";
import Link from "next/link";
import Navbar from "../navbar/page";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination } from "swiper/modules";
import dynamic from "next/dynamic";
const Carousel = dynamic(() => import("../../components/Swiper"), {
    ssr: false,
});

export default function Hero() {
    return (

        <div className="bg-gray-100 min-h-screen">
            <Navbar profilePicUrl="/assets/mcb_icon.png" />
            {/* Hero Section */}
            <section className="h-screen w-full px-10 py-20 flex flex-col lg:flex-row justify-between items-start lg:items-center">
                <div className="max-w-xl">
                    <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight text-black">
                        BERKELEY <br /> SEQUENCING LAB
                    </h1>
                    <p className="text-gray-700 text-sm lg:text-base mb-6">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua
                    </p>
                    <div className="flex gap-4">
                        <button className="bg-black text-white px-6 py-2 text-sm rounded hover:bg-gray-900 transition">
                            START SEQUENCING
                        </button>
                        <button className="border text-black bg-white border-black px-6 py-2 text-sm rounded hover:bg-gray-200 transition">
                            CONTACT US
                        </button>
                    </div>
                </div>
            </section>


            {/*<Carousel /> */}
            <section className="px-10 py-20 bg-white">
                <div>
                    <h2>
                        <p className="text-black"> More Sections....</p>
                    </h2>
                </div>
            </section>

            {/* Icons */}
            <section className="flex justify-center bg-white items-center w-full">
                <div className="w-full max-w-6xl bg-white rounded-lg p-8 mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-16 text-center w-full">
                        {[
                            { icon: "/assets/chem.png", title: "Title 1", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor" },
                            { icon: "/assets/search.png", title: "Title 2", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor" },
                            { icon: "/assets/discuss.png", title: "Title 3", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor" },
                            { icon: "/assets/school.png", title: "Title 4", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor" }
                        ].map((item, index) => (
                            <div key={index} className="space-y-2">
                                <img src={item.icon} alt={item.title} className="w-16 h-16 mx-auto" />
                                <h3 className="font-bold mt-4 text-black text-lg">{item.title}</h3>
                                <p className="text-gray-600 text-sm">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section className="px-10 py-20 bg-white">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Left Side - Contact Info */}
                    <div>
                        <h2 className="text-2xl text-gray-800 font-bold mb-6">Contact Us</h2>
                        <div className="space-y-4 text-gray-800 text-sm">
                            <div>
                                <p className="font-semibold">Mailing Address</p>
                                <p>310 Barker Hall, Berkeley, CA 94720-3202</p>
                            </div>
                            <div>
                                <p className="font-semibold">Phone Number</p>
                                <p>510-642-6383</p>
                            </div>
                            <div>
                                <p className="font-semibold">Email</p>
                                <p>dnaseq@berkeley.edu</p>
                            </div>
                            <div>
                                <p className="font-semibold">Hours</p>
                                <div className="grid grid-cols-2 gap-y-1">
                                    {[
                                        ["Monday", "8:30 am – 7:30 pm"],
                                        ["Tuesday", "8:30 am – 7:30 pm"],
                                        ["Wednesday", "8:30 am – 7:30 pm"],
                                        ["Thursday", "8:30 am – 7:30 pm"],
                                        ["Friday", "8:30 am – 7:30 pm"],
                                        ["Saturday", "Closed"],
                                        ["Sunday", "Closed"],
                                    ].map(([day, time]) => (
                                        <React.Fragment key={day}>
                                            <span className="font-medium">{day}</span>
                                            <span>{time}</span>
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>
                            <p className="text-sm pt-4">
                                You can always drop off samples in our mailbox in front of Barker
                                Hall, but for fastest service (and an opportunity to say "hi" to
                                the facility staff), bring your samples upstairs to 310 Barker
                                Hall. See you soon!
                            </p>
                        </div>
                    </div>

                    {/* Right Side - Form */}
                    <div>
                        <h2 className="text-2xl text-gray-800 font-bold mb-2">Get In Touch</h2>
                        <p className="font-semibold text-sm text-gray-800 mb-6">Basic Information</p>
                        <form className="space-y-4">
                            <div className="flex gap-4">
                                <input
                                    type="text"
                                    placeholder="First Name"
                                    className="flex-1 border text-gray-400 border-gray-400 rounded-md px-4 py-2 text-sm"
                                />
                                <input
                                    type="text"
                                    placeholder="Last Name"
                                    className="flex-1 border text-gray-400 border-gray-400 rounded-md px-4 py-2 text-sm"
                                />
                            </div>
                            <input
                                type="text"
                                placeholder="Organization Name"
                                className="w-full border text-gray-400 border-gray-400 rounded-md px-4 py-2 text-sm"
                            />
                            <input
                                type="email"
                                placeholder="Email"
                                className="w-full border text-gray-400 border-gray-400 rounded-md px-4 py-2 text-sm"
                            />
                            <input
                                type="tel"
                                placeholder="Phone"
                                className="w-full border text-gray-400 border-gray-400 rounded-md px-4 py-2 text-sm"
                            />
                            <textarea
                                placeholder="Message"
                                className="w-full border text-gray-400 border-gray-400 rounded-md px-4 py-2 text-sm h-32"
                            ></textarea>
                            <button
                                type="submit"
                                className="w-full bg-black border-gray-300 text-white py-2 rounded-md hover:bg-gray-800 text-sm"
                            >
                                Send
                            </button>
                        </form>
                    </div>
                </div>
            </section>

        </div>
    );
}
