"use client";

import React, { useState } from 'react';
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import Link from "next/link";
import { Stethoscope, Menu, X, Twitter, Linkedin, Github, ShieldCheck } from "lucide-react";

const NAV_LINKS = [
    { label: "What we offer", id: "features" },
    { label: "How it helps", id: "capabilities" },
    { label: "Questions", id: "faq" },
] as const


const BrandLogo = () => (
    <Link href="/" className="flex items-center gap-2.5 group select-none">
        <img
            src="/pmslogo.png"
            alt="Medineva Logo"
            className="h-[26px] w-auto object-contain brightness-0 transition-all duration-200 group-hover:opacity-80"
        />
        <span className="font-bold text-[19px] tracking-tight text-gray-900 leading-none pb-0.5">Medineva</span>
    </Link>
);

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="flex min-h-screen flex-col bg-white font-sans text-slate-900">
            {/* Header - Sticky with glassmorphism */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all">
                <div className="max-w-[1400px] mx-auto px-6 md:px-8 py-4 flex items-center justify-between">

                    <BrandLogo />

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.id}
                                href={`#${link.id}`}
                                className="text-[14px] font-medium text-gray-600 transition-colors hover:text-gray-900"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Desktop Auth Buttons (Clerk Integration) */}
                    <div className="hidden md:flex items-center gap-4">
                        <SignedOut>
                            <SignInButton mode="modal">
                                <button className="text-[14px] font-medium text-gray-600 hover:text-gray-900 transition-colors">
                                    Log in
                                </button>
                            </SignInButton>
                            <SignUpButton mode="modal">
                                <button className="bg-black text-white text-[14px] font-medium px-5 py-2.5 rounded-xl hover:bg-gray-800 transition-colors shadow-sm">
                                    Start
                                </button>
                            </SignUpButton>
                        </SignedOut>
                        <SignedIn>
                            <Link href="/dashboard" className="bg-blue-50 text-blue-600 text-[14px] font-medium px-5 py-2.5 rounded-xl hover:bg-blue-100 transition-colors shadow-sm">
                                Open Dashboard
                            </Link>
                        </SignedIn>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Navigation Dropdown */}
                {isMobileMenuOpen && (
                    <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-lg py-4 px-6 flex flex-col gap-4 animate-in slide-in-from-top-2">
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.id}
                                href={`#${link.id}`}
                                className="border-b border-gray-50 py-2 text-[15px] font-medium text-gray-600"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <div className="flex flex-col gap-3 mt-2">
                            <SignedOut>
                                <SignInButton mode="modal">
                                    <button className="w-full text-center text-[15px] font-medium text-gray-700 py-2.5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                        Log in
                                    </button>
                                </SignInButton>
                                <SignUpButton mode="modal">
                                    <button className="w-full text-center bg-black text-white text-[15px] font-medium py-2.5 rounded-xl hover:bg-gray-800 transition-colors">
                                        Start Free Trial
                                    </button>
                                </SignUpButton>
                            </SignedOut>
                            <SignedIn>
                                <Link href="/dashboard" className="w-full text-center bg-blue-50 text-blue-600 text-[15px] font-medium py-2.5 rounded-xl hover:bg-blue-100 transition-colors">
                                    Open Dashboard
                                </Link>
                            </SignedIn>
                        </div>
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main className="flex-1">
                {children}
            </main>

            {/* Footer - Minimalist SaaS Layout */}
            <footer className="border-t border-gray-150 py-12 bg-white mt-20">
                <div className="max-w-[1400px] mx-auto px-6 md:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex flex-col items-center md:items-start gap-2.5">
                        <BrandLogo />
                        <p className="text-[13px] text-gray-400 text-center md:text-left">
                            © {new Date().getFullYear()} Medineva PMS. All rights reserved.
                        </p>
                    </div>
                    
                    <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[14px] text-gray-500 font-medium">
                        <Link href="#features" className="hover:text-gray-900 transition-colors">Features</Link>
                        <Link href="#faq" className="hover:text-gray-900 transition-colors">Common Questions</Link>
                        <Link href="https://wa.me/919911133114" target="_blank" className="hover:text-gray-900 transition-colors">Talk to Us</Link>
                        <span className="text-gray-200">|</span>
                        <span className="text-[13px] text-gray-400 font-normal">Support: +91 99111 33114</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-2 text-[13px] text-gray-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            All systems operational
                        </span>
                        <span className="w-px h-3 bg-gray-200"></span>
                        <span className="text-[13px] text-gray-400">
                            Powered by <Link href="https://comacks.com" target="_blank" className="font-semibold text-gray-600 hover:text-gray-900 transition-colors">Comacks</Link>
                        </span>
                    </div>
                </div>
            </footer>
        </div>
    );
}