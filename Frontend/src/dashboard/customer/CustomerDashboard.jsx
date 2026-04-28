import {
  FaArrowRight,
  FaCalendarAlt,
  FaCar,
  FaCheckCircle,
  FaClock,
  FaCrown,
  FaDollarSign,
  FaShoppingBasket,
  FaTools,
} from 'react-icons/fa';

const statCards = [
  { label: 'Vehicles', value: '2', icon: FaCar, accent: 'blue' },
  { label: 'Upcoming', value: '1', icon: FaClock, accent: 'emerald' },
  { label: 'Lifetime Spend', value: '$8,909', icon: FaDollarSign, accent: 'indigo' },
  { label: 'Silver Member', value: '8,909 pts', icon: FaCrown, accent: 'blue' },
];

const garageVehicles = [
  {
    name: '2019 Toyota Corolla',
    tag: 'AB-1234',
    detail: '78,500 km - Attention',
    health: 39,
    state: 'alert',
  },
  {
    name: '2021 Honda Civic',
    tag: 'AB-5678',
    detail: '31,200 km - Good',
    health: 60,
    state: 'good',
  },
];

const recentActivities = [
  {
    title: 'Brake Pad Set (Front) + 1 more',
    date: 'April 23, 2026',
    amount: '$2,690',
    status: 'Paid',
  },
  {
    title: 'Timing Belt Kit + 1 more',
    date: 'February 24, 2026',
    amount: '$6,219',
    status: 'Paid',
  },
];

const careTips = [
  {
    text: 'Check tire pressure monthly',
    sub: 'Saves up to 3% on fuel and extends tire life.',
  },
  {
    text: 'Rotate tires every 10,000 km',
    sub: 'Even wear improves cornering stability and braking.',
  },
  {
    text: 'Keep a service log',
    sub: 'It increases resale value and helps prevent missed maintenance.',
  },
];

const statAccentClasses = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600' },
};

const vehicleStateClasses = {
  alert: {
    text: 'text-rose-500',
    bar: 'bg-rose-500',
    tone: 'bg-rose-50',
    badge: 'text-rose-600',
  },
  watch: {
    text: 'text-amber-500',
    bar: 'bg-amber-500',
    tone: 'bg-amber-50',
    badge: 'text-amber-600',
  },
  good: {
    text: 'text-blue-600',
    bar: 'bg-blue-500',
    tone: 'bg-blue-50',
    badge: 'text-blue-600',
  },
};

const CustomerDashboard = () => {
  const user = JSON.parse(localStorage.getItem('authUser') || '{"fullName": "James Carter"}');
  const firstName = user.fullName.split(' ')[0];
  const fleetHealth = 50;
  const vehicleCount = garageVehicles.length;

  const gaugeRadius = 80;
  const gaugeCircumference = 2 * Math.PI * gaugeRadius;
  const gaugeOffset = gaugeCircumference * (1 - fleetHealth / 100);

  return (
    <div className="space-y-6 md:space-y-8 animate-[fade-in_0.45s_ease-out]">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-4xl bg-linear-to-br from-[#13254b] via-[#0f1f3e] to-[#1d4fc2] p-6 text-white shadow-xl shadow-blue-950/30 sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.08)_1px,transparent_0)] bg-size-[14px_14px]" />

        <div className="relative z-10 flex flex-col gap-10 xl:flex-row xl:items-center xl:justify-between">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold backdrop-blur">
              Good afternoon
            </div>
            <h1 className="mb-3 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Hi {firstName}
            </h1>
            <p className="mb-8 max-w-xl text-base text-blue-100/85 sm:text-lg">
              Your fleet is in watch condition. Next visit: Mon, Apr 27.
            </p>
            <div className="flex flex-wrap gap-3">
              <button className="flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-blue-900 shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-50 active:translate-y-0">
                <FaCalendarAlt className="text-blue-600" />
                Book service
              </button>
              <button className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold backdrop-blur transition hover:bg-white/20">
                <FaTools className="text-blue-200" />
                Smart health check
              </button>
              <button className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold backdrop-blur transition hover:bg-white/20">
                <FaShoppingBasket className="text-blue-200" />
                Browse parts
              </button>
            </div>
          </div>

          {/* Health Gauge */}
          <div className="w-full max-w-70 rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur-xl">
            <div className="relative mx-auto flex h-44 w-44 items-center justify-center">
              <svg className="h-full w-full -rotate-90">
                <circle
                  cx="88"
                  cy="88"
                  r={gaugeRadius}
                  stroke="currentColor"
                  strokeWidth="11"
                  fill="transparent"
                  className="text-white/15"
                />
                <circle
                  cx="88"
                  cy="88"
                  r={gaugeRadius}
                  stroke="currentColor"
                  strokeWidth="11"
                  fill="transparent"
                  strokeDasharray={gaugeCircumference}
                  strokeDashoffset={gaugeOffset}
                  strokeLinecap="round"
                  className="text-amber-400 transition-all duration-700"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-bold">{fleetHealth}</span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-200/70">Fleet Health</span>
              </div>
            </div>
            <p className="mt-4 text-center text-sm font-medium text-blue-100/90">
              {vehicleCount} vehicles - Watch
            </p>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            accent={stat.accent}
          />
        ))}
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Left Column (My Garage + Recent Activity) */}
        <div className="space-y-6 xl:col-span-2">
          {/* My Garage */}
          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-800">My garage</h2>
                <p className="text-sm text-slate-400">Live health snapshot for each vehicle</p>
              </div>
              <button className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700">
                View all <FaArrowRight className="text-xs" />
              </button>
            </div>
            <div className="space-y-3">
              {garageVehicles.map((vehicle) => (
                <VehicleRow
                  key={vehicle.tag}
                  name={vehicle.name}
                  tag={vehicle.tag}
                  detail={vehicle.detail}
                  health={vehicle.health}
                  state={vehicle.state}
                />
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-800">Recent activity</h2>
                <p className="text-sm text-slate-400">Your latest purchases & services</p>
              </div>
              <button className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700">
                All history <FaArrowRight className="text-xs" />
              </button>
            </div>
            <div className="space-y-6">
              {recentActivities.map((activity) => (
                <ActivityRow
                  key={`${activity.title}-${activity.date}`}
                  title={activity.title}
                  date={activity.date}
                  amount={activity.amount}
                  status={activity.status}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (Rewards, Next Visit, Care Tips) */}
        <div className="space-y-6">
          {/* Rewards Card */}
          <div className="rounded-3xl bg-linear-to-br from-blue-500 to-blue-700 p-6 text-white shadow-lg shadow-blue-700/25 sm:p-7">
            <div className="mb-5 flex items-center justify-between">
              <span className="rounded-md bg-white/20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] backdrop-blur">
                Silver Member
              </span>
              <FaCrown className="text-blue-200" />
            </div>
            <div className="mb-6">
              <h3 className="text-4xl font-bold tracking-tight">8,909</h3>
              <p className="text-sm font-medium text-blue-100">reward points</p>
            </div>
            <div className="mb-2 flex items-center justify-between text-xs font-semibold text-blue-50">
              <span>Progress to next tier</span>
              <span>84%</span>
            </div>
            <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-black/15">
              <div className="h-full w-[84%] bg-white transition-all duration-1000" />
            </div>
            <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-50">
              View rewards <FaArrowRight className="text-xs" />
            </button>
          </div>

          {/* Next Visit */}
          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-7">
            <h3 className="mb-5 flex items-center gap-2 font-semibold text-slate-800">
              <FaCalendarAlt className="text-blue-500" /> Next visit
            </h3>
            <div className="mb-5 flex items-center gap-4 rounded-2xl bg-slate-50 p-4">
              <div className="flex flex-col items-center rounded-xl bg-white px-3 py-2 shadow-sm">
                <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">Apr</span>
                <span className="text-xl font-bold text-slate-800">27</span>
              </div>
              <div>
                <p className="font-semibold text-slate-800">Brake Inspection</p>
                <p className="text-xs text-slate-500">
                  11:35 AM - <span className="font-semibold text-amber-500">Pending</span>
                </p>
              </div>
            </div>
            <button className="w-full rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">
              Manage appointments
            </button>
          </div>

          {/* Care Tips */}
          <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-7">
            <h3 className="mb-5 flex items-center gap-2 font-semibold text-slate-800">
              <FaCheckCircle className="text-blue-500" /> Care tips
            </h3>
            <div className="space-y-5">
              {careTips.map((tip) => (
                <TipItem key={tip.text} icon={FaTools} text={tip.text} sub={tip.sub} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, accent }) => {
  const accentClasses = statAccentClasses[accent] || statAccentClasses.blue;

  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div>
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
      </div>
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${accentClasses.bg} ${accentClasses.text}`}>
        <Icon className="text-lg" />
      </div>
    </div>
  );
};

const VehicleRow = ({ name, tag, detail, health, state }) => {
  const stateClasses = vehicleStateClasses[state] || vehicleStateClasses.good;
  const clampedHealth = Math.max(0, Math.min(health, 100));

  return (
    <div className="group rounded-2xl border border-slate-100 p-4 transition hover:bg-slate-50 sm:p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${stateClasses.tone} text-blue-600`}>
            <FaCar className="text-lg" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="font-semibold text-slate-800">{name}</h4>
              <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                {tag}
              </span>
            </div>
            <p className="text-xs text-slate-400">{detail}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 md:min-w-50 md:justify-end">
          <div className="text-right">
            <span className={`text-2xl font-bold ${stateClasses.text}`}>{clampedHealth}</span>
            <p className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${stateClasses.badge}`}>Health</p>
          </div>
          <div className="h-1.5 w-28 overflow-hidden rounded-full bg-slate-100">
            <div className={`h-full ${stateClasses.bar}`} style={{ width: `${clampedHealth}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
};

const ActivityRow = ({ title, date, amount, status }) => (
  <div className="relative flex gap-5 pl-2">
    <div className="absolute left-3.5 top-2 h-full w-px bg-slate-100" />
    <div className="relative z-10 mt-1.5 h-3 w-3 rounded-full bg-blue-600 shadow-[0_0_0_4px_rgba(37,99,235,0.12)]" />
    <div className="flex flex-1 items-start justify-between gap-3">
      <div>
        <h4 className="font-semibold text-slate-800">{title}</h4>
        <p className="text-xs text-slate-400">{date}</p>
      </div>
      <div className="text-right">
        <p className="font-semibold text-slate-800">{amount}</p>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
          {status}
        </span>
      </div>
    </div>
  </div>
);

const TipItem = ({ icon: Icon, text, sub }) => (
  <div className="flex gap-4">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
      <Icon className="text-sm" />
    </div>
    <div>
      <p className="text-sm font-semibold text-slate-800">{text}</p>
      <p className="text-xs text-slate-400">{sub}</p>
    </div>
  </div>
);

export default CustomerDashboard;
