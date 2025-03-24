"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

const sampleOptions = [
    "SANGER",
    "NANOPORE",
    "DNA QUANTIFICATION",
    "FRAGMENT ANALYSIS",
];

export default function Carousel() {
    return (
        <div className="w-full px-10 py-14 bg-white">
            <h2 className="text-xl font-semibold mb-6">Order Samples Today</h2>
            <Swiper
                slidesPerView={3}
                spaceBetween={20}
                pagination={{ clickable: true }}
                breakpoints={{
                    768: { slidesPerView: 2 },
                    1024: { slidesPerView: 3 },
                }}
                modules={[Pagination]}
                className="w-full pb-10 !overflow-visible"
            >
                {sampleOptions.map((sample) => (
                    <SwiperSlide key={sample}>
                        <div className="border rounded-xl p-6 bg-white hover:shadow transition h-full">
                            <h3 className="font-bold mb-2">{sample}</h3>
                            <p className="text-sm text-gray-600">
                                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                            </p>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>

        </div>
    );
}
