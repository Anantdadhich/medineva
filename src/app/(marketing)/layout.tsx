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
    <Link href="/" className="flex items-center gap-2 group">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-all">
            <Stethoscope size={16} className="text-white" strokeWidth={2.5} />
        </div>
        <span className="font-semibold text-[18px] tracking-tight text-gray-900">Medineva</span>
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

            {/* Footer - Comprehensive SaaS Layout */}
            <footer className="bg-gray-50 border-t border-gray-200 pt-16 pb-8 mt-20">
                <div className="max-w-[1400px] mx-auto px-6 md:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 mb-16">

                        {/* Brand Column */}
                        <div className="lg:col-span-2 flex flex-col items-start gap-6">
                            <BrandLogo />
                            <p className="text-[14px] text-gray-500 leading-relaxed max-w-sm">
                                The easiest and smartest way to manage your health clinic. Handle appointments, patients, and billing without any computer stress.
                            </p>

                        </div>

                        {/* Quick Links */}
                        <div className="flex flex-col gap-6">
                            <h4 className="text-[15px] font-bold text-gray-900">What we do</h4>
                            <ul className="flex flex-col gap-3">
                                <li><Link href="#features" className="text-[14px] text-gray-500 hover:text-gray-900 transition-colors">Digital Calendar</Link></li>
                                <li><Link href="#features" className="text-[14px] text-gray-500 hover:text-gray-900 transition-colors">Patient Records</Link></li>
                                <li><Link href="#features" className="text-[14px] text-gray-500 hover:text-gray-900 transition-colors">QR Check-in</Link></li>
                                <li><Link href="#features" className="text-[14px] text-gray-500 hover:text-gray-900 transition-colors">Easy Billing</Link></li>
                            </ul>
                        </div>

                        {/* Support */}
                        <div className="flex flex-col gap-6">
                            <h4 className="text-[15px] font-bold text-gray-900">Get Help</h4>
                            <ul className="flex flex-col gap-3">
                                <li><Link href="#faq" className="text-[14px] text-gray-500 hover:text-gray-900 transition-colors">Common Questions</Link></li>
                                <li><Link href="#" className="text-[14px] text-gray-500 hover:text-gray-900 transition-colors">Talk to Us</Link></li>
                                <li><Link href="#" className="text-[14px] text-gray-500 hover:text-gray-900 transition-colors">Tutorials</Link></li>
                            </ul>
                        </div>

                        {/* Contact */}
                        <div className="flex flex-col gap-6">
                            <h4 className="text-[15px] font-bold text-gray-900">Contact</h4>
                            <div className="flex flex-col gap-4">
                                <div>
                                    <p className="text-[13px] font-bold text-gray-400 uppercase tracking-wider mb-1">Email</p>
                                    <p className="text-[14px] text-gray-700 font-medium">arpit@comacks.com</p>
                                </div>
                                <div>
                                    <p className="text-[13px] font-bold text-gray-400 uppercase tracking-wider mb-1">Clinic Support</p>
                                    <p className="text-[14px] text-gray-700 font-medium">+91 99111 33114</p>
                                </div>
                            </div>
                        </div>




                    </div>

                    <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
                        <span className="text-[13px] text-gray-400">
                            © {new Date().getFullYear()} Medineva PMS. All rights reserved.
                        </span>
                        <div className="flex items-center gap-6">
                            <span className="flex items-center gap-2 text-[13px] text-gray-400">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                All systems operational
                            </span>
                            <span className="hidden md:block w-px h-4 bg-gray-200"></span>
                            <span className="text-[13px] text-gray-400">
                                Powered by <Link href="https://comacks.com" target="_blank" className="font-medium text-gray-600 hover:text-gray-900 transition-colors">Comacks</Link>
                            </span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}