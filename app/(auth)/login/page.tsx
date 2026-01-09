"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { LoginForm } from "@/components/forms/LoginForm";

export default function LoginPage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: "/images/1.jpg",
      title: "Kualitas Premium",
      description: "Bahan pilihan terbaik untuk cita rasa istimewa",
    },
    {
      image: "/images/2.jpg",
      title: "Signature Pastry",
      description:
        "Dibuat dengan mentega premium untuk lapisan yang flaky dan gurih.",
    },
    {
      image: "/images/3.jpg",
      title: "Fresh Every Day",
      description: "Dipanggang setiap hari dengan penuh cinta",
    },
  ];

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  }, [slides.length]);

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-gradient-to-br from-primary-50 via-white to-primary-100">
      {/* Left Side - Login Form */}
      <div className="relative flex items-center justify-center p-6 lg:p-12">
        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-primary-300/30 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-primary-300/20 rounded-full blur-3xl" />

        <div className="relative w-full max-w-md animate-slide-up">
          {/* Glassmorphism Card */}
          <div className="backdrop-blur-xl bg-white/80 rounded-3xl shadow-2xl shadow-primary-900/20 border border-white/60 p-8 md:p-10">
            {/* Logo/Brand */}
            <div className="text-center mb-8">
              <Image
                src="/logo/rahisa-logo.png"
                alt="Logo"
                width={88}
                height={88}
                className="mb-2 mx-auto"
                loading="eager"
              />
              <h1 className="text-2xl font-bold text-primary-900">
                Selamat Datang
              </h1>
              <p className="text-muted mt-1">Masuk ke dashboard Rahisa</p>
            </div>

            {/* Login Form */}
            <LoginForm />

            {/* Footer */}
            <p className="text-center text-xs text-muted mt-6">
              © 2026 Rahisa. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      <div className="hidden lg:block relative m-6 rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/60 bg-white/40 backdrop-blur-sm">
        {/* Slides */}
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className="object-cover"
              priority={index === 0}
            />
            {/* Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

            {/* Slide Content */}
            <div className="absolute bottom-16 left-12 right-12 text-white transform transition-all duration-700 delay-300">
              <h2
                className={`text-4xl font-bold mb-1 transition-all duration-700 ${
                  index === currentSlide
                    ? "translate-y-0 opacity-100"
                    : "translate-y-8 opacity-0"
                }`}
              >
                {slide.title}
              </h2>
              <p
                className={`text-lg text-white/90 leading-relaxed transition-all duration-700 delay-100 ${
                  index === currentSlide
                    ? "translate-y-0 opacity-100"
                    : "translate-y-8 opacity-0"
                }`}
              >
                {slide.description}
              </p>
            </div>
          </div>
        ))}

        {/* Carousel Indicators (Dots) */}
        <div className="absolute bottom-8 left-12 z-20 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "w-8 bg-white"
                  : "w-4 bg-white/40 hover:bg-white/60"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Decorative Elements (keep some for extra flair if desired, or remove if too busy) */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-primary-200/20 rounded-full blur-3xl z-20 pointer-events-none" />
      </div>
    </div>
  );
}
