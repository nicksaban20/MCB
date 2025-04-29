"use client";

import Image from "next/image";
import Link from "next/link";
import Navbar from "../navbar/page";
import { sendContactEmail } from "../actions/email";
import React from "react";
import { useState, useEffect } from "react";

import dynamic from "next/dynamic";
import LocationsSection from "../drop-off/page";

import OrderCarousel from '@/components/OrderCarousel';

import { createClient } from "@/utils/supabase/client";


export default function Hero() {

    // state for form fields
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        organization: "",
        email: "",
        phone: "",
        message: ""
    });

    // state for form submission
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitResult, setSubmitResult] = useState<{
        success?: boolean;
        error?: string;
    } | null>(null);

    // handle input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitResult(null);

        try {
            const result = await sendContactEmail(formData);
            setSubmitResult(result);

            if (result.success) {
                // reset form on success
                setFormData({
                    firstName: "",
                    lastName: "",
                    organization: "",
                    email: "",
                    phone: "",
                    message: ""
                });
            }
        } catch (error) {
            console.error("Form submission error:", error);
            setSubmitResult({
                success: false,
                error: "An unexpected error occurred. Please try again later."
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchUser = async () => {
            const { data, error } = await supabase.auth.getUser();
            console.log("Fetched user:", data?.user);
            if (data?.user) {
                setUser(data.user);
            }
            setLoading(false); // ✅ tell React we're done fetching
        };
        fetchUser();
    }, []);

    if (loading) return null;

    return (

        <div className="bg-gray-100 min-h-screen">
            <Navbar profilePicUrl="/assets/mcb_icon.png" user={user} />

            {/* Hero Section */}
            <section
                className="relative h-[115vh] w-full px-10 py-20 flex flex-col lg:flex-row justify-between items-start lg:items-center bg-cover bg-top"
                style={{
                    backgroundImage: 'url("/assets/hero.png")',
                }}
            >
                {/* White fade at bottom */}
                <div className="absolute bottom-0 left-0 w-full h-30 bg-gradient-to-t from-white via-white/75 to-transparent z-10" />

                {/* Main content */}

                {/* left column content */}
                <div className="ml-10 relative z-10 max-w-3xl space-y-6">
                    <h1 className="inter text-white text-5xl md:text-8xl lg:text-8xl font-semibold leading-tight">
                        Berkeley<br />
                        Sequencing Lab
                    </h1>
                    <div className="flex items-center space-x-6">
                        <Link
                            href="/form"
                            className="inline-block bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-8 py-3 rounded-md transition whitespace-nowrap"
                        >
                            Order Samples
                        </Link>
                        <p className="text-white text-lg md:text-xl">
                            DNA sequencing made easier, faster, and more trustworthy; at the top
                            public academic institution in the country
                        </p>
                    </div>

                </div>

            </section>

            <OrderCarousel />

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


            {/* Learn More Section */}
            <section className="bg-white px-10 py-20">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-2xl text-black font-semibold mb-8">Learn More</h2>
                    <div className="grid  text-black grid-cols-1 md:grid-cols-2 gap-8">
                        {[
                            [
                                "CELL LINE / STEM CELL ANALYSIS",
                                "Send us an aliquot of ~2 million cells, and we do the rest. Lyse, amplify, analyze, qualify, and send you the results!",
                            ],
                            [
                                "WE DO NANOPORE SEQUENCING",
                                "You provide a colony pick, plasmid, amplicon, etc… and we do the rest!",
                            ],
                        ].map(([title, description], index) => (
                            <div
                                key={index}
                                className="rounded-xl overflow-hidden border border-gray-400"
                            >
                                <div className="h-24 bg-[#E6E8EC] w-full" />
                                <div className="p-6 border-t border-gray-300">
                                    <h3 className="font-semibold text-sm mb-1">{title}</h3>
                                    <p className="text-sm text-gray-700">{description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <LocationsSection />

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

                        {/* success message */}
                        {submitResult?.success && (
                            <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded-md">
                                Thank you for your message! We'll get back to you soon.
                            </div>
                        )}

                        {/* error message */}
                        {submitResult?.error && (
                            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md">
                                {submitResult.error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="flex gap-4">
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    placeholder="First Name"
                                    className="flex-1 border text-gray-700 border-gray-400 rounded-md px-4 py-2 text-sm"
                                    required
                                />
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    placeholder="Last Name"
                                    className="flex-1 border text-gray-700 border-gray-400 rounded-md px-4 py-2 text-sm"
                                    required
                                />
                            </div>
                            <input
                                type="text"
                                name="organization"
                                value={formData.organization}
                                onChange={handleInputChange}
                                placeholder="Organization Name"
                                className="w-full border text-gray-700 border-gray-400 rounded-md px-4 py-2 text-sm"
                            />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="Email"
                                className="w-full border text-gray-700 border-gray-400 rounded-md px-4 py-2 text-sm"
                                required
                            />
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="Phone"
                                className="w-full border text-gray-700 border-gray-400 rounded-md px-4 py-2 text-sm"
                            />
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleInputChange}
                                placeholder="Message"
                                className="w-full border text-gray-700 border-gray-400 rounded-md px-4 py-2 text-sm h-32"
                                required
                            ></textarea>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-black border-gray-300 text-white py-2 rounded-md hover:bg-gray-800 text-sm disabled:bg-gray-500 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? "Sending..." : "Send"}
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            {/* Social Media Footer */}
            <footer className="bg-gray-100 py-6">
                <div className="max-w-7xl mx-auto px-4 flex flex-col items-center">
                    <p className="text-gray-700 mb-4 font-medium">Connect with us</p>
                    <div className="flex space-x-6">
                        <a
                            href="https://www.linkedin.com/company/uc-berkeley-dna-sequencing-facility/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-700 hover:text-blue-600 transition-colors"
                            aria-label="LinkedIn"
                        >
                            <img src="/assets/linkedin.svg" alt="LinkedIn" width="24" height="24" className="h-6 w-6" />
                        </a>
                        <a
                            href="https://x.com/berkeley_dnaseq"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-700 hover:text-black transition-colors"
                            aria-label="X (Twitter)"
                        >
                            <img src="/assets/twitter-x.svg" alt="X (Twitter)" width="24" height="24" className="h-6 w-6" />
                        </a>
                    </div>
                    <p className="text-xs text-gray-500 mt-4">© {new Date().getFullYear()} UC Berkeley DNA Sequencing Facility</p>
                </div>
            </footer>

        </div>
    );
}
