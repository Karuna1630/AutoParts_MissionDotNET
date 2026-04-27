import React from 'react';
import { Link } from 'react-router-dom';
import { FaCarSide, FaBrain, FaCalendarAlt, FaTools, FaShieldAlt, FaArrowRight } from 'react-icons/fa';

const Landing = () => {
  return (
    <div className="min-h-screen bg-[#F4F7FA] font-sans text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between bg-white/80 px-6 py-4 backdrop-blur-md md:px-12">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500 shadow-lg shadow-blue-500/40">
            <FaCarSide className="text-xl text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold leading-none tracking-tight">AutoParts</h2>
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Vehicle MIS</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition">Sign in</Link>
          <Link to="/register" className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition active:scale-95">
            Get started
          </Link>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="flex flex-col lg:flex-row min-h-[75vh]">
          {/* Hero Left */}
          <div className="flex flex-1 flex-col justify-center p-8 md:p-16 lg:p-24 bg-white">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-xs font-bold text-blue-600">
              <FaBrain className="text-sm" />
              AI-powered service center
            </div>
            <h1 className="mb-6 text-5xl font-extrabold leading-[1.1] tracking-tight md:text-6xl lg:text-7xl">
              Your garage, <br />
              <span className="text-blue-600">supercharged.</span>
            </h1>
            <p className="mb-10 max-w-lg text-lg leading-relaxed text-slate-500 md:text-xl">
              Book service, shop genuine parts, and track every vehicle — all from one simple dashboard.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/register" className="flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-base font-bold text-white shadow-xl shadow-blue-600/40 hover:bg-blue-700 transition active:scale-95">
                Create account <FaArrowRight className="text-sm" />
              </Link>
              <Link to="/login" className="rounded-xl border border-slate-200 bg-white px-8 py-4 text-base font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition">
                Sign in
              </Link>
            </div>
            <p className="mt-6 text-sm font-medium text-slate-400">
              Free to start · No credit card required
            </p>
          </div>

          {/* Hero Right */}
          <div className="relative flex flex-1 flex-col justify-between overflow-hidden bg-gradient-to-br from-blue-900 via-indigo-900 to-blue-800 p-8 md:p-16 lg:p-24 text-white">
            <div className="pointer-events-none absolute -right-24 -top-16 h-96 w-96 rounded-full bg-blue-400/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-32 -left-32 h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-[100px]" />
            
            <div className="relative z-10 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500 shadow-xl shadow-blue-500/30">
                <FaCarSide className="text-2xl text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight">AutoParts</h2>
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/60">Vehicle MIS</p>
              </div>
            </div>

            <div className="relative z-10">
              <h2 className="mb-6 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
                The modern way to manage every car you own.
              </h2>
              <p className="max-w-md text-lg leading-relaxed text-blue-100/70">
                Trusted by drivers and workshops to keep vehicles healthy, safe and on the road.
              </p>
            </div>

            <div className="relative z-10 text-sm font-medium text-blue-200/40">
              © AutoParts Systems
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-6 py-20 md:px-12 lg:px-24">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard 
              Icon={FaBrain}
              title="AI health alerts"
              description="Predict part failures before they happen."
            />
            <FeatureCard 
              Icon={FaCalendarAlt}
              title="Easy booking"
              description="Schedule any service in under 30 seconds."
            />
            <FeatureCard 
              Icon={FaTools}
              title="Genuine parts"
              description="12-month warranty on every order."
            />
            <FeatureCard 
              Icon={FaShieldAlt}
              title="Trusted workshop"
              description="Certified technicians, transparent pricing."
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-6 py-12 md:px-12 lg:px-24">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2 opacity-80 grayscale hover:grayscale-0 transition">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500">
              <FaCarSide className="text-base text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold leading-none tracking-tight">AutoParts</h2>
              <p className="text-[8px] uppercase tracking-[0.2em] text-slate-500">Vehicle MIS</p>
            </div>
          </div>
          <p className="text-sm font-medium text-slate-400">
            © 2026 AutoParts Systems
          </p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ Icon, title, description }) => (
  <div className="group rounded-3xl border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/50 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-300/60">
    <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
      <Icon className="text-xl" />
    </div>
    <h3 className="mb-3 text-xl font-bold text-slate-800">{title}</h3>
    <p className="text-sm leading-relaxed text-slate-500">{description}</p>
  </div>
);

export default Landing;
