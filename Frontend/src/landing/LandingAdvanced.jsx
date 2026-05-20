import React from 'react';
import { Link } from 'react-router-dom';
import {
    FaCarSide,
    FaTools,
    FaShieldAlt,
    FaArrowRight,
    FaCalendarAlt,
    FaUsers,
    FaChartLine,
    FaClipboardCheck,
    FaCogs,
    FaPhoneAlt,
    FaCheckCircle,
} from 'react-icons/fa';

const LandingAdvanced = () => {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
            {/* ================= HEADER ================= */}
            <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/30">
                            <FaCarSide className="text-xl text-white" />
                        </div>

                        <div>
                            <h1 className="text-lg font-extrabold tracking-tight">
                                AutoParts
                            </h1>
                            <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500">
                                Vehicle MIS
                            </p>
                        </div>
                    </div>

                    <nav className="hidden items-center gap-8 md:flex">
                        <a href="#services" className="text-sm font-semibold text-slate-600 hover:text-blue-600">
                            Services
                        </a>
                        <a href="#features" className="text-sm font-semibold text-slate-600 hover:text-blue-600">
                            Features
                        </a>
                        <a href="#stats" className="text-sm font-semibold text-slate-600 hover:text-blue-600">
                            Statistics
                        </a>
                        <a href="#contact" className="text-sm font-semibold text-slate-600 hover:text-blue-600">
                            Contact
                        </a>
                    </nav>

                    <div className="flex items-center gap-4">
                        <Link
                            to="/login"
                            className="text-sm font-semibold text-slate-700 hover:text-blue-600"
                        >
                            Login
                        </Link>

                        <Link
                            to="/register"
                            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition hover:bg-blue-700"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </header>

            {/* ================= HERO ================= */}
            <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900 text-white">
                <div className="absolute -left-32 top-0 h-[500px] w-[500px] rounded-full bg-blue-400/20 blur-3xl" />
                <div className="absolute right-0 top-0 h-[400px] w-[400px] rounded-full bg-indigo-400/10 blur-3xl" />

                <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-6 py-20 lg:grid-cols-2 lg:px-10 lg:py-28">
                    {/* LEFT */}
                    <div>
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur-md">
                            <FaShieldAlt />
                            Trusted Vehicle Service Platform
                        </div>

                        <h1 className="mb-6 text-5xl font-extrabold leading-tight md:text-6xl">
                            Complete Garage
                            <span className="block text-blue-300">
                                Management System
                            </span>
                        </h1>

                        <p className="mb-10 max-w-xl text-lg leading-relaxed text-slate-200">
                            Manage customers, vehicle servicing, spare parts, invoices,
                            mechanics, and appointments — all from one modern dashboard.
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <Link
                                to="/register"
                                className="flex items-center gap-2 rounded-xl bg-white px-7 py-4 text-base font-bold text-blue-700 transition hover:scale-[1.02]"
                            >
                                Start Free
                                <FaArrowRight />
                            </Link>

                            <Link
                                to="/login"
                                className="rounded-xl border border-white/20 bg-white/10 px-7 py-4 text-base font-bold backdrop-blur-md hover:bg-white/20"
                            >
                                Sign In
                            </Link>
                        </div>

                        <div className="mt-10 flex flex-wrap gap-8">
                            <MiniStat title="10K+" subtitle="Vehicles Managed" />
                            <MiniStat title="500+" subtitle="Workshops" />
                            <MiniStat title="99%" subtitle="Customer Satisfaction" />
                        </div>
                    </div>

                    {/* RIGHT */}
                    <div className="grid gap-6">
                        <DashboardCard />
                    </div>
                </div>
            </section>

            {/* ================= SERVICES ================= */}
            <section
                id="services"
                className="mx-auto max-w-7xl px-6 py-24 lg:px-10"
            >
                <div className="mb-16 text-center">
                    <p className="mb-3 font-bold uppercase tracking-[0.2em] text-blue-600">
                        OUR SERVICES
                    </p>

                    <h2 className="mb-4 text-4xl font-extrabold">
                        Everything your workshop needs
                    </h2>

                    <p className="mx-auto max-w-2xl text-lg text-slate-500">
                        Powerful tools designed to improve workflow, customer experience,
                        and service management.
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
                    <ServiceCard
                        icon={<FaCalendarAlt />}
                        title="Service Booking"
                        description="Allow customers to easily schedule maintenance and repair appointments online."
                    />

                    <ServiceCard
                        icon={<FaTools />}
                        title="Parts Inventory"
                        description="Track spare parts, stock levels, supplier records, and order history."
                    />

                    <ServiceCard
                        icon={<FaClipboardCheck />}
                        title="Inspection Reports"
                        description="Generate detailed vehicle inspection reports with service recommendations."
                    />

                    <ServiceCard
                        icon={<FaChartLine />}
                        title="Business Analytics"
                        description="Monitor workshop performance, revenue, and customer engagement."
                    />
                </div>
            </section>

            {/* ================= FEATURES ================= */}
            <section id="features" className="bg-white py-24">
                <div className="mx-auto grid max-w-7xl gap-16 px-6 lg:grid-cols-2 lg:px-10">
                    {/* LEFT */}
                    <div>
                        <p className="mb-3 font-bold uppercase tracking-[0.2em] text-blue-600">
                            WHY CHOOSE US
                        </p>

                        <h2 className="mb-6 text-4xl font-extrabold leading-tight">
                            Smart software built for modern garages
                        </h2>

                        <p className="mb-10 text-lg leading-relaxed text-slate-500">
                            AutoParts simplifies workshop operations with automation,
                            scheduling, reporting, and inventory management.
                        </p>

                        <div className="space-y-6">
                            <FeatureRow text="Real-time service updates" />
                            <FeatureRow text="Customer and vehicle history tracking" />
                            <FeatureRow text="Automated invoice generation" />
                            <FeatureRow text="Secure cloud-based system" />
                            <FeatureRow text="Responsive dashboard for all devices" />
                        </div>
                    </div>

                    {/* RIGHT */}
                    <div className="grid gap-6 sm:grid-cols-2">
                        <InfoBox
                            icon={<FaUsers />}
                            title="Customer Management"
                            text="Store customer records and vehicle information securely."
                        />

                        <InfoBox
                            icon={<FaCogs />}
                            title="Workshop Operations"
                            text="Manage mechanics, repairs, and work assignments efficiently."
                        />

                        <InfoBox
                            icon={<FaTools />}
                            title="Inventory Control"
                            text="Track stock availability and avoid part shortages."
                        />

                        <InfoBox
                            icon={<FaShieldAlt />}
                            title="Secure Platform"
                            text="Role-based authentication and protected data management."
                        />
                    </div>
                </div>
            </section>

            {/* ================= STATS ================= */}
            <section
                id="stats"
                className="bg-gradient-to-r from-blue-700 to-indigo-800 py-20 text-white"
            >
                <div className="mx-auto grid max-w-7xl grid-cols-2 gap-10 px-6 text-center md:grid-cols-4 lg:px-10">
                    <StatCard number="25K+" label="Completed Services" />
                    <StatCard number="15K+" label="Registered Users" />
                    <StatCard number="450+" label="Professional Mechanics" />
                    <StatCard number="98%" label="Positive Reviews" />
                </div>
            </section>

            {/* ================= CTA ================= */}
            <section className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
                <div className="rounded-[40px] bg-slate-900 px-8 py-16 text-center text-white md:px-16">
                    <h2 className="mb-6 text-4xl font-extrabold">
                        Ready to modernize your garage?
                    </h2>

                    <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-300">
                        Join thousands of workshops using AutoParts to simplify operations
                        and improve customer satisfaction.
                    </p>

                    <div className="flex flex-wrap justify-center gap-4">
                        <Link
                            to="/register"
                            className="rounded-xl bg-blue-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700"
                        >
                            Create Account
                        </Link>

                        <Link
                            to="/contact"
                            className="rounded-xl border border-white/20 bg-white/10 px-8 py-4 text-base font-bold hover:bg-white/20"
                        >
                            Contact Sales
                        </Link>
                    </div>
                </div>
            </section>

            {/* ================= FOOTER ================= */}
            <footer
                id="contact"
                className="border-t border-slate-200 bg-white"
            >
                <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-4 lg:px-10">
                    <div>
                        <div className="mb-4 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
                                <FaCarSide className="text-white" />
                            </div>

                            <div>
                                <h2 className="font-bold">AutoParts</h2>
                                <p className="text-xs text-slate-500">Vehicle MIS</p>
                            </div>
                        </div>

                        <p className="text-sm leading-relaxed text-slate-500">
                            Complete vehicle management solution for workshops and service centers.
                        </p>
                    </div>

                    <div>
                        <h3 className="mb-4 font-bold">Quick Links</h3>

                        <ul className="space-y-3 text-sm text-slate-500">
                            <li>Home</li>
                            <li>Services</li>
                            <li>Features</li>
                            <li>Contact</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="mb-4 font-bold">Services</h3>

                        <ul className="space-y-3 text-sm text-slate-500">
                            <li>Repair Management</li>
                            <li>Vehicle Tracking</li>
                            <li>Inventory System</li>
                            <li>Customer Support</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="mb-4 font-bold">Contact</h3>

                        <div className="space-y-3 text-sm text-slate-500">
                            <div className="flex items-center gap-2">
                                <FaPhoneAlt />
                                +977-9800000000
                            </div>

                            <p>support@autoparts.com</p>
                            <p>Kathmandu, Nepal</p>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-200 py-6 text-center text-sm text-slate-500">
                    © 2026 AutoParts Systems. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

/* ================= COMPONENTS ================= */

const MiniStat = ({ title, subtitle }) => (
    <div>
        <h3 className="text-2xl font-extrabold">{title}</h3>
        <p className="text-sm text-slate-300">{subtitle}</p>
    </div>
);

const DashboardCard = () => (
    <div className="rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-md">
        <div className="mb-6 flex items-center justify-between">
            <div>
                <p className="text-sm text-slate-300">Monthly Revenue</p>
                <h2 className="text-4xl font-extrabold">$24,500</h2>
            </div>

            <div className="rounded-xl bg-green-500/20 px-4 py-2 text-sm font-bold text-green-300">
                +18%
            </div>
        </div>

        <div className="space-y-4">
            <DashboardItem name="Vehicle Services" value="1,250" />
            <DashboardItem name="Spare Parts Sold" value="890" />
            <DashboardItem name="Appointments" value="420" />
            <DashboardItem name="New Customers" value="210" />
        </div>
    </div>
);

const DashboardItem = ({ name, value }) => (
    <div className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
        <p className="text-sm text-slate-300">{name}</p>
        <p className="font-bold">{value}</p>
    </div>
);

const ServiceCard = ({ icon, title, description }) => (
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-2xl text-blue-600">
            {icon}
        </div>

        <h3 className="mb-4 text-2xl font-bold">{title}</h3>

        <p className="leading-relaxed text-slate-500">{description}</p>
    </div>
);

const FeatureRow = ({ text }) => (
    <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <FaCheckCircle />
        </div>

        <p className="text-lg font-medium text-slate-700">{text}</p>
    </div>
);

const InfoBox = ({ icon, title, text }) => (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 transition hover:shadow-lg">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-2xl text-white">
            {icon}
        </div>

        <h3 className="mb-3 text-xl font-bold">{title}</h3>

        <p className="leading-relaxed text-slate-500">{text}</p>
    </div>
);

const StatCard = ({ number, label }) => (
    <div>
        <h2 className="mb-2 text-5xl font-extrabold">{number}</h2>
        <p className="text-slate-200">{label}</p>
    </div>
);

export default LandingAdvanced;