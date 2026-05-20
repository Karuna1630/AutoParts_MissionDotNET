import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    FiArrowLeft,
    FiMail,
    FiPhone,
    FiCalendar,
    FiCreditCard,
    FiTruck,
    FiShoppingBag,
    FiClock,
    FiPlus,
    FiUser,
    FiCheckCircle,
} from 'react-icons/fi';
import {
    FaCar,
    FaWallet,
    FaTools,
    FaChartLine,
} from 'react-icons/fa';

import {
    getCustomerDetails,
    getCustomerHistory,
} from '../../services/staffService';

import { getApiErrorMessage } from '../../services/api';

const CustomerDetailsExpanded = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [customer, setCustomer] = useState(null);
    const [history, setHistory] = useState({
        purchases: [],
        services: [],
    });

    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            setLoading(true);

            const [customerRes, historyRes] = await Promise.all([
                getCustomerDetails(id),
                getCustomerHistory(id),
            ]);

            if (customerRes.success) {
                setCustomer(customerRes.data);
            }

            if (historyRes.success) {
                setHistory(historyRes.data);
            }
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="h-14 w-14 animate-spin rounded-full border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-3xl border border-red-100 bg-red-50 p-8 text-red-600">
                {error}
            </div>
        );
    }

    if (!customer) return null;

    return (
        <div className="space-y-8 pb-20">
            {/* ================= HEADER ================= */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/staff/customers')}
                        className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50"
                    >
                        <FiArrowLeft size={20} />
                    </button>

                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-slate-900">
                            Customer Details
                        </h1>

                        <p className="mt-1 text-sm font-medium text-slate-500">
                            Complete customer profile & activity
                        </p>
                    </div>
                </div>

                <button className="flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700">
                    <FiPlus />
                    Add Service
                </button>
            </div>

            {/* ================= TOP GRID ================= */}
            <div className="grid grid-cols-1 gap-8 xl:grid-cols-4">
                {/* ================= PROFILE CARD ================= */}
                <div className="xl:col-span-1">
                    <div className="sticky top-24 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/40">
                        {/* Cover */}
                        <div className="h-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700"></div>

                        <div className="-mt-14 px-8 pb-8">
                            {/* Avatar */}
                            <div className="flex justify-center">
                                {customer.avatarUrl ? (
                                    <img
                                        src={customer.avatarUrl}
                                        alt={customer.fullName}
                                        className="h-28 w-28 rounded-[2rem] border-4 border-white object-cover shadow-xl"
                                    />
                                ) : (
                                    <div className="flex h-28 w-28 items-center justify-center rounded-[2rem] border-4 border-white bg-white text-3xl font-black text-blue-700 shadow-xl">
                                        {customer.fullName
                                            .split(' ')
                                            .map((n) => n[0])
                                            .join('')
                                            .toUpperCase()}
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="mt-5 text-center">
                                <h2 className="text-2xl font-black text-slate-900">
                                    {customer.fullName}
                                </h2>

                                <p className="mt-1 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                                    Customer ID #{customer.id}
                                </p>
                            </div>

                            {/* Stats */}
                            <div className="mt-8 grid grid-cols-2 gap-4">
                                <SmallStat
                                    label="Vehicles"
                                    value={customer.vehicles?.length || 0}
                                />

                                <SmallStat
                                    label="Orders"
                                    value={history.purchases?.length || 0}
                                />
                            </div>

                            {/* Details */}
                            <div className="mt-8 space-y-5">
                                <InfoRow
                                    icon={FiMail}
                                    title="Email"
                                    value={customer.email}
                                />

                                <InfoRow
                                    icon={FiPhone}
                                    title="Phone"
                                    value={customer.phone}
                                />

                                <InfoRow
                                    icon={FiCreditCard}
                                    title="Credit"
                                    value={`Rs. ${customer.creditBalance?.toFixed(2)}`}
                                />
                            </div>

                            {/* Credit Box */}
                            <div className="mt-8 rounded-3xl bg-gradient-to-r from-emerald-500 to-green-600 p-5 text-white shadow-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">
                                            Credit Balance
                                        </p>

                                        <h2 className="mt-2 text-3xl font-black">
                                            Rs. {customer.creditBalance?.toFixed(2)}
                                        </h2>
                                    </div>

                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
                                        <FaWallet size={24} />
                                    </div>
                                </div>

                                <button className="mt-5 w-full rounded-2xl bg-white py-3 text-sm font-black text-emerald-700 transition hover:bg-slate-100">
                                    Settle Credit
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ================= MAIN CONTENT ================= */}
                <div className="space-y-8 xl:col-span-3">
                    {/* ================= STATS ================= */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        <DashboardCard
                            icon={<FaCar />}
                            title="Registered Vehicles"
                            value={customer.vehicles?.length || 0}
                            color="blue"
                        />

                        <DashboardCard
                            icon={<FiShoppingBag />}
                            title="Total Purchases"
                            value={history.purchases?.length || 0}
                            color="emerald"
                        />

                        <DashboardCard
                            icon={<FaTools />}
                            title="Service Appointments"
                            value={history.services?.length || 0}
                            color="amber"
                        />
                    </div>

                    {/* ================= TABS ================= */}
                    <div className="rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/30">
                        {/* TAB HEADER */}
                        <div className="flex flex-wrap gap-6 border-b border-slate-100 px-8 pt-6">
                            <TabButton
                                active={activeTab === 'overview'}
                                onClick={() => setActiveTab('overview')}
                                label="Overview"
                            />

                            <TabButton
                                active={activeTab === 'vehicles'}
                                onClick={() => setActiveTab('vehicles')}
                                label="Vehicles"
                            />

                            <TabButton
                                active={activeTab === 'purchases'}
                                onClick={() => setActiveTab('purchases')}
                                label="Purchases"
                            />

                            <TabButton
                                active={activeTab === 'services'}
                                onClick={() => setActiveTab('services')}
                                label="Services"
                            />
                        </div>

                        {/* TAB BODY */}
                        <div className="p-8">
                            {/* ================= OVERVIEW ================= */}
                            {activeTab === 'overview' && (
                                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                    <OverviewCard
                                        icon={<FiUser />}
                                        title="Customer Information"
                                        items={[
                                            ['Full Name', customer.fullName],
                                            ['Email', customer.email],
                                            ['Phone', customer.phone],
                                        ]}
                                    />

                                    <OverviewCard
                                        icon={<FaChartLine />}
                                        title="Account Summary"
                                        items={[
                                            ['Vehicles', customer.vehicles?.length || 0],
                                            ['Purchases', history.purchases?.length || 0],
                                            ['Services', history.services?.length || 0],
                                        ]}
                                    />
                                </div>
                            )}

                            {/* ================= VEHICLES ================= */}
                            {activeTab === 'vehicles' && (
                                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                    {customer.vehicles?.map((vehicle) => (
                                        <VehicleCard key={vehicle.id} vehicle={vehicle} />
                                    ))}
                                </div>
                            )}

                            {/* ================= PURCHASES ================= */}
                            {activeTab === 'purchases' && (
                                <div className="space-y-5">
                                    {history.purchases?.map((invoice) => (
                                        <HistoryCard
                                            key={invoice.invoiceId}
                                            title={invoice.invoiceNumber}
                                            subtitle={new Date(
                                                invoice.invoiceDate
                                            ).toLocaleDateString()}
                                            amount={`Rs. ${invoice.finalAmount}`}
                                            status={invoice.paymentStatus}
                                            icon={<FiShoppingBag />}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* ================= SERVICES ================= */}
                            {activeTab === 'services' && (
                                <div className="space-y-5">
                                    {history.services?.map((service) => (
                                        <HistoryCard
                                            key={service.appointmentId}
                                            title={service.serviceType}
                                            subtitle={new Date(
                                                service.appointmentDate
                                            ).toLocaleDateString()}
                                            amount={service.status}
                                            status={service.status}
                                            icon={<FiTruck />}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ================= COMPONENTS ================= */

const DashboardCard = ({ icon, title, value, color }) => {
    const colors = {
        blue: 'from-blue-500 to-blue-600',
        emerald: 'from-emerald-500 to-green-600',
        amber: 'from-amber-500 to-orange-500',
    };

    return (
        <div
            className={`rounded-[2rem] bg-gradient-to-r ${colors[color]} p-6 text-white shadow-xl`}
        >
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-bold text-white/70">{title}</p>

                    <h2 className="mt-2 text-4xl font-black">{value}</h2>
                </div>

                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-2xl">
                    {icon}
                </div>
            </div>
        </div>
    );
};

const SmallStat = ({ label, value }) => (
    <div className="rounded-2xl bg-slate-50 p-4 text-center">
        <h3 className="text-2xl font-black text-slate-900">{value}</h3>

        <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            {label}
        </p>
    </div>
);

const InfoRow = ({ icon: Icon, title, value }) => (
    <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Icon size={18} />
        </div>

        <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                {title}
            </p>

            <p className="mt-1 text-sm font-bold text-slate-800">
                {value}
            </p>
        </div>
    </div>
);

const TabButton = ({ active, onClick, label }) => (
    <button
        onClick={onClick}
        className={`border-b-2 pb-4 text-sm font-black uppercase tracking-[0.2em] transition ${active
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
    >
        {label}
    </button>
);

const OverviewCard = ({ icon, title, items }) => (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
        <div className="mb-6 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-2xl text-white">
                {icon}
            </div>

            <h3 className="text-xl font-black text-slate-900">
                {title}
            </h3>
        </div>

        <div className="space-y-4">
            {items.map(([label, value]) => (
                <div
                    key={label}
                    className="flex items-center justify-between border-b border-slate-200 pb-3"
                >
                    <span className="text-sm font-bold text-slate-500">
                        {label}
                    </span>

                    <span className="text-sm font-black text-slate-900">
                        {value}
                    </span>
                </div>
            ))}
        </div>
    </div>
);

const VehicleCard = ({ vehicle }) => (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
        {vehicle.imageUrl ? (
            <img
                src={vehicle.imageUrl}
                alt={vehicle.vehicleModel}
                className="h-52 w-full object-cover"
            />
        ) : (
            <div className="flex h-52 items-center justify-center bg-slate-100 text-slate-300">
                <FaCar size={60} />
            </div>
        )}

        <div className="p-6">
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-2xl font-black text-slate-900">
                        {vehicle.vehicleMake}
                    </h3>

                    <p className="text-sm font-bold text-slate-500">
                        {vehicle.vehicleModel}
                    </p>
                </div>

                {vehicle.isPrimary && (
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-blue-700">
                        Primary
                    </span>
                )}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
                <Tag>{vehicle.vehicleNumber}</Tag>
                <Tag>{vehicle.vehicleYear}</Tag>
                <Tag>{vehicle.vehicleColor || 'N/A'}</Tag>
            </div>
        </div>
    </div>
);

const Tag = ({ children }) => (
    <span className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-black text-slate-600">
        {children}
    </span>
);

const HistoryCard = ({
    title,
    subtitle,
    amount,
    status,
    icon,
}) => (
    <div className="flex flex-col gap-5 rounded-3xl border border-slate-200 bg-slate-50 p-6 transition hover:bg-white hover:shadow-lg md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                {icon}
            </div>

            <div>
                <h3 className="text-lg font-black text-slate-900">
                    {title}
                </h3>

                <div className="mt-1 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-slate-400">
                    <FiClock size={12} />
                    {subtitle}
                </div>
            </div>
        </div>

        <div className="flex items-center gap-6">
            <div className="text-right">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                    Status
                </p>

                <h3 className="mt-1 text-lg font-black text-slate-900">
                    {amount}
                </h3>
            </div>

            <span
                className={`rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] ${status === 'Paid' || status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
            >
                {status}
            </span>
        </div>
    </div>
);

export default CustomerDetailsExpanded;