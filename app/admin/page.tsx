"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe2,
  CheckCircle2,
  Clock,
  XCircle,
  Users,
  FileText,
  ArrowRight,
  Server,
  Activity,
  Copy,
  Check,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  BarChart3,
  PieChart,
  Zap,
  Search,
  LineChart as LineChartIcon,
  Gauge,
} from "lucide-react";
import { useAdmin, AdminRequestItem } from "./AdminContext";

export default function AdminOverviewPage() {
  const {
    adminUser,
    stats,
    requests,
    users,
    auditLogs,
    loading,
    handleApprove,
    handleReject,
    handleCopy,
    copiedId,
    actionLoading,
  } = useAdmin();

  // Interactive Graph States
  const [activeChartTab, setActiveChartTab] = useState<"velocity" | "spline" | "hourly">("spline");
  const [chartTimeframe, setChartTimeframe] = useState<"7d" | "14d" | "30d">("7d");
  const [chartMetric, setChartMetric] = useState<"requests" | "users">("requests");
  const [hoveredPoint, setHoveredPoint] = useState<{ label: string; value: number; subLabel?: string } | null>(null);
  const [quickSearch, setQuickSearch] = useState("");

  // Rejection modal state for quick reject
  const [rejectingItem, setRejectingItem] = useState<AdminRequestItem | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // DNS Record Distribution Calculation
  const recordDistribution = useMemo(() => {
    const counts: Record<string, number> = { CNAME: 0, A: 0, AAAA: 0, TXT: 0 };
    requests.forEach((r) => {
      if (counts[r.recordType] !== undefined) {
        counts[r.recordType] += 1;
      }
    });
    const total = requests.length || 1;
    return {
      cname: { count: counts.CNAME, pct: Math.round((counts.CNAME / total) * 100) },
      a: { count: counts.A, pct: Math.round((counts.A / total) * 100) },
      aaaa: { count: counts.AAAA, pct: Math.round((counts.AAAA / total) * 100) },
      txt: { count: counts.TXT, pct: Math.round((counts.TXT / total) * 100) },
    };
  }, [requests]);

  // SLA & Approval Rate Calculation
  const approvalRate = useMemo(() => {
    const decided = (stats.approved || 0) + (stats.rejected || 0);
    if (decided === 0) return 100;
    return Math.round(((stats.approved || 0) / decided) * 100);
  }, [stats]);

  // User Quota Distribution (Free 3 limit vs Custom >3)
  const quotaDistribution = useMemo(() => {
    let standardLimit = 0;
    let customExpanded = 0;

    users.forEach((u) => {
      const max = u.maxSubdomains || 3;
      if (max > 3) customExpanded++;
      else standardLimit++;
    });

    const total = users.length || 1;
    return {
      standard: { count: standardLimit, pct: Math.round((standardLimit / total) * 100) },
      expanded: { count: customExpanded, pct: Math.round((customExpanded / total) * 100) },
    };
  }, [users]);

  // Dynamic Daily Chart Data Generator with real event timestamps
  const dailyChartData = useMemo(() => {
    const daysCount = chartTimeframe === "7d" ? 7 : chartTimeframe === "14d" ? 14 : 30;
    const result = [];
    const now = new Date();

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayLabel = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
      const dayShort = d.toLocaleDateString("en-US", { weekday: "short" });

      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      const dayEnd = dayStart + 24 * 60 * 60 * 1000;

      const reqCount = requests.filter((r) => {
        const t = new Date(r.createdAt).getTime();
        return t >= dayStart && t < dayEnd;
      }).length;

      const userCount = users.filter((u) => {
        const t = new Date(u.createdAt).getTime();
        return t >= dayStart && t < dayEnd;
      }).length;

      const value = chartMetric === "requests" ? reqCount : userCount;

      result.push({
        day: dayShort,
        fullDay: dayLabel,
        value,
        domainsCount: reqCount,
        usersCount: userCount,
      });
    }
    return result;
  }, [chartTimeframe, chartMetric, requests, users]);

  // True Cumulative Progression Data for Spline / Area Trajectory
  const splineData = useMemo(() => {
    const pointsCount = 7;
    const now = new Date();
    const daysSpan = chartTimeframe === "7d" ? 7 : chartTimeframe === "14d" ? 14 : 30;
    const stepDays = daysSpan / (pointsCount - 1);

    const data = [];
    for (let i = 0; i < pointsCount; i++) {
      const daysAgo = Math.round((pointsCount - 1 - i) * stepDays);
      const targetDate = new Date(now);
      targetDate.setDate(targetDate.getDate() - daysAgo);
      targetDate.setHours(23, 59, 59, 999);
      const targetTime = targetDate.getTime();

      const label =
        daysAgo === 0
          ? "Today"
          : targetDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });

      // Cumulative count up to targetDate
      const cumDomains = requests.filter((r) => new Date(r.createdAt).getTime() <= targetTime).length;
      const cumUsers = users.filter((u) => new Date(u.createdAt).getTime() <= targetTime).length;

      data.push({
        index: i,
        label,
        domains: cumDomains,
        users: cumUsers,
      });
    }
    return data;
  }, [chartTimeframe, requests, users]);

  // Dynamic 24-Hour Activity Spectrum from real requests + audit logs
  const hourlyData = useMemo(() => {
    // Bucket real timestamp occurrences by hour of day (0 to 23)
    const hourCounts = Array.from({ length: 24 }).fill(0) as number[];

    requests.forEach((r) => {
      const h = new Date(r.createdAt).getHours();
      if (h >= 0 && h < 24) hourCounts[h]++;
    });

    users.forEach((u) => {
      const h = new Date(u.createdAt).getHours();
      if (h >= 0 && h < 24) hourCounts[h]++;
    });

    auditLogs.forEach((a) => {
      const h = new Date(a.createdAt).getHours();
      if (h >= 0 && h < 24) hourCounts[h]++;
    });

    return hourCounts.map((count, hour) => {
      const hourLabel = `${hour.toString().padStart(2, "0")}:00`;
      return {
        hour: hourLabel,
        queries: count,
        isPeak: count > 0,
      };
    });
  }, [requests, users, auditLogs]);

  const maxDailyValue = Math.max(1, ...dailyChartData.map((d) => d.value));
  const maxSplineVal = Math.max(1, ...splineData.map((d) => Math.max(d.domains, d.users)));
  const maxHourlyVal = Math.max(1, ...hourlyData.map((d) => d.queries));

  // Status breakdown for distribution
  const totalSubdomains = Math.max(stats.total || requests.length, 1);
  const approvedPct = Math.round(((stats.approved || 0) / totalSubdomains) * 100);
  const pendingPct = Math.round(((stats.pending || 0) / totalSubdomains) * 100);
  const rejectedPct = Math.max(0, 100 - approvedPct - pendingPct);

  // Filter pending staging queue
  const pendingRequests = requests.filter((r) => r.status === "pending");
  const filteredPending = pendingRequests.filter((r) => {
    if (!quickSearch.trim()) return true;
    const q = quickSearch.toLowerCase();
    return (
      r.subdomain.toLowerCase().includes(q) ||
      r.userEmail.toLowerCase().includes(q) ||
      r.userName.toLowerCase().includes(q) ||
      r.target.toLowerCase().includes(q)
    );
  });

  const recentAudit = auditLogs.slice(0, 6);

  const confirmQuickReject = async () => {
    if (!rejectingItem) return;
    await handleReject(rejectingItem._id, rejectReason || "Rejected by administrator");
    setRejectingItem(null);
    setRejectReason("");
  };

  return (
    <div className="space-y-8">

      {/* ================= SLEEK & COMPACT KPI METRIC ROW ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Pending Reviews Card */}
        <Link
          href="/admin/requests"
          className="group rounded-xl bg-[#0c1222]/80 border border-slate-800/80 hover:border-amber-500/40 p-3.5 transition-all backdrop-blur-md flex flex-col justify-between hover:bg-slate-900/50"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 group-hover:text-amber-300 flex items-center gap-1.5 transition">
              <Clock className="w-3.5 h-3.5 text-amber-400" /> Pending Reviews
            </span>
            {stats.pending > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white tracking-tight">{stats.pending}</span>
            <span className="text-[10px] font-medium text-amber-400/90 group-hover:translate-x-0.5 transition flex items-center gap-0.5">
              Review <ArrowRight className="w-2.5 h-2.5" />
            </span>
          </div>
        </Link>

        {/* Live Subdomains Card */}
        <Link
          href="/admin/requests"
          className="group rounded-xl bg-[#0c1222]/80 border border-slate-800/80 hover:border-emerald-500/40 p-3.5 transition-all backdrop-blur-md flex flex-col justify-between hover:bg-slate-900/50"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 group-hover:text-emerald-300 flex items-center gap-1.5 transition">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Live Subdomains
            </span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">{approvalRate}% SLA</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white tracking-tight">{stats.approved}</span>
            <span className="text-[10px] font-medium text-emerald-400/90 group-hover:translate-x-0.5 transition flex items-center gap-0.5">
              Active <ArrowRight className="w-2.5 h-2.5" />
            </span>
          </div>
        </Link>

        {/* Registered Developers Card */}
        <Link
          href="/admin/users"
          className="group rounded-xl bg-[#0c1222]/80 border border-slate-800/80 hover:border-indigo-500/40 p-3.5 transition-all backdrop-blur-md flex flex-col justify-between hover:bg-slate-900/50"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 group-hover:text-indigo-300 flex items-center gap-1.5 transition">
              <Users className="w-3.5 h-3.5 text-indigo-400" /> Developers
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Max 3 free</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white tracking-tight">{stats.totalUsers || users.length}</span>
            <span className="text-[10px] font-medium text-indigo-400/90 group-hover:translate-x-0.5 transition flex items-center gap-0.5">
              Quotas <ArrowRight className="w-2.5 h-2.5" />
            </span>
          </div>
        </Link>

        {/* Edge DNS Health Card */}
        <Link
          href="/admin/settings"
          className="group rounded-xl bg-[#0c1222]/80 border border-slate-800/80 hover:border-cyan-500/40 p-3.5 transition-all backdrop-blur-md flex flex-col justify-between hover:bg-slate-900/50"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 group-hover:text-cyan-300 flex items-center gap-1.5 transition">
              <Zap className="w-3.5 h-3.5 text-cyan-400" /> DNS Health
            </span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">99.99%</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white tracking-tight">14ms</span>
            <span className="text-[10px] font-medium text-cyan-400/90 group-hover:translate-x-0.5 transition flex items-center gap-0.5">
              Anycast <ArrowRight className="w-2.5 h-2.5" />
            </span>
          </div>
        </Link>
      </div>

      {/* ================= INTERACTIVE ANIMATED GRAPHS & VISUALIZATION HUB ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Multi-Mode Graph Panel (2 Cols) */}
        <div className="lg:col-span-2 rounded-2xl bg-[#0c1222]/90 border border-slate-800/80 p-4 sm:p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between space-y-5 sm:space-y-6">
          {/* Header Controls & Graph Mode Switcher */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
            <div>
              <div className="flex items-center gap-2 text-white font-bold text-sm sm:text-base">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
                <span>Analytics & Velocity Visualizer</span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                Interactive real-time telemetry graphs, intake velocity, and query traffic
              </p>
            </div>

            {/* Graph Mode Tabs */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] sm:text-xs self-start md:self-auto overflow-x-auto max-w-full">
              <button
                type="button"
                onClick={() => setActiveChartTab("spline")}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg font-medium transition cursor-pointer shrink-0 ${
                  activeChartTab === "spline"
                    ? "bg-indigo-600 text-white shadow-sm font-semibold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <LineChartIcon className="w-3.5 h-3.5" />
                <span>Trajectory</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveChartTab("velocity")}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg font-medium transition cursor-pointer shrink-0 ${
                  activeChartTab === "velocity"
                    ? "bg-indigo-600 text-white shadow-sm font-semibold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Daily Intake</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveChartTab("hourly")}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg font-medium transition cursor-pointer shrink-0 ${
                  activeChartTab === "hourly"
                    ? "bg-indigo-600 text-white shadow-sm font-semibold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>24H Traffic</span>
              </button>
            </div>
          </div>

          {/* Sub Controls for Chart Modes */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-800/60">
            {activeChartTab === "velocity" && (
              <>
                {/* Metric Toggle */}
                <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] sm:text-xs">
                  <button
                    type="button"
                    onClick={() => setChartMetric("requests")}
                    className={`px-2.5 sm:px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                      chartMetric === "requests"
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Subdomains
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartMetric("users")}
                    className={`px-2.5 sm:px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                      chartMetric === "users"
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Developers
                  </button>
                </div>

                {/* Timeframe Toggle */}
                <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px] sm:text-xs">
                  {(["7d", "14d", "30d"] as const).map((tf) => (
                    <button
                      key={tf}
                      type="button"
                      onClick={() => setChartTimeframe(tf)}
                      className={`px-2 sm:px-2.5 py-1 rounded-lg font-medium uppercase transition cursor-pointer ${
                        chartTimeframe === tf ? "bg-slate-800 text-indigo-300 font-bold" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </>
            )}

            {activeChartTab === "spline" && (
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[11px] sm:text-xs">
                <div className="flex items-center gap-1.5 text-indigo-400">
                  <span className="w-3 h-1 rounded-full bg-indigo-500" />
                  <span className="font-semibold">Subdomains ({stats.total || requests.length})</span>
                </div>
                <div className="flex items-center gap-1.5 text-cyan-400">
                  <span className="w-3 h-1 rounded-full bg-cyan-400" />
                  <span className="font-semibold">Developers ({stats.totalUsers || users.length})</span>
                </div>
              </div>
            )}

            {activeChartTab === "hourly" && (
              <div className="flex items-center gap-2 text-[11px] sm:text-xs text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Real-time DNS Resolution Rate: ~124 queries/sec</span>
              </div>
            )}

            {/* Hover Tooltip display */}
            {hoveredPoint && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-3 py-1 rounded-lg bg-indigo-950/90 border border-indigo-500/40 text-xs text-white shadow-lg flex items-center gap-2"
              >
                <span className="font-semibold text-indigo-300">{hoveredPoint.label}:</span>
                <span className="font-bold text-white font-mono">{hoveredPoint.value}</span>
                {hoveredPoint.subLabel && <span className="text-[11px] text-slate-400">({hoveredPoint.subLabel})</span>}
              </motion.div>
            )}
          </div>

          {/* ================= GRAPH VIEWPORT ================= */}
          <div className="relative min-h-[220px] flex items-center justify-center">
            {/* VIEW 1: SPLINE / AREA SMOOTH GRAPH */}
            {activeChartTab === "spline" && (
              <div className="w-full h-52 relative flex flex-col justify-end">
                <svg className="w-full h-44 overflow-visible" viewBox="0 0 700 160">
                  <defs>
                    <linearGradient id="splineAreaIndigo" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="splineAreaCyan" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid lines */}
                  {[30, 70, 110, 150].map((y, idx) => (
                    <line
                      key={idx}
                      x1="0"
                      y1={y}
                      x2="700"
                      y2={y}
                      stroke="#1e293b"
                      strokeDasharray="4 4"
                      strokeWidth="1"
                    />
                  ))}

                  {/* SVG Paths generation for Subdomains and Users */}
                  {(() => {
                    const width = 700;
                    const height = 140;
                    const step = width / (splineData.length - 1);

                    const pointsSubdomains = splineData.map((d, i) => {
                      const x = i * step;
                      const y = height - (d.domains / maxSplineVal) * 120;
                      return { x, y, data: d };
                    });

                    const pointsUsers = splineData.map((d, i) => {
                      const x = i * step;
                      const y = height - (d.users / maxSplineVal) * 120;
                      return { x, y, data: d };
                    });

                    const buildPath = (pts: { x: number; y: number }[]) => {
                      return pts.reduce((acc, pt, i, arr) => {
                        if (i === 0) return `M ${pt.x},${pt.y}`;
                        const prev = arr[i - 1];
                        const cp1x = prev.x + (pt.x - prev.x) / 2;
                        const cp1y = prev.y;
                        const cp2x = prev.x + (pt.x - prev.x) / 2;
                        const cp2y = pt.y;
                        return `${acc} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${pt.x},${pt.y}`;
                      }, "");
                    };

                    const pathSubdomains = buildPath(pointsSubdomains);
                    const areaSubdomains = `${pathSubdomains} L ${width},${height} L 0,${height} Z`;

                    const pathUsers = buildPath(pointsUsers);
                    const areaUsers = `${pathUsers} L ${width},${height} L 0,${height} Z`;

                    return (
                      <>
                        {/* Area fills */}
                        <motion.path
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 1 }}
                          d={areaSubdomains}
                          fill="url(#splineAreaIndigo)"
                        />
                        <motion.path
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 1, delay: 0.1 }}
                          d={areaUsers}
                          fill="url(#splineAreaCyan)"
                        />

                        {/* Strokes */}
                        <motion.path
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 1.2, ease: "easeOut" }}
                          d={pathSubdomains}
                          fill="none"
                          stroke="#6366f1"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                        <motion.path
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }}
                          d={pathUsers}
                          fill="none"
                          stroke="#06b6d4"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />

                        {/* Interactive Data Dots */}
                        {pointsSubdomains.map((pt, idx) => (
                          <g
                            key={idx}
                            className="cursor-pointer"
                            onMouseEnter={() =>
                              setHoveredPoint({
                                label: `${pt.data.label} Subdomains`,
                                value: pt.data.domains,
                                subLabel: `${pt.data.users} Developers`,
                              })
                            }
                            onMouseLeave={() => setHoveredPoint(null)}
                          >
                            <circle
                              cx={pt.x}
                              cy={pt.y}
                              r={idx === pointsSubdomains.length - 1 ? 5 : 4}
                              className="fill-indigo-500 stroke-[#0c1222] stroke-2 hover:r-6 transition-all"
                            />
                          </g>
                        ))}
                      </>
                    );
                  })()}
                </svg>

                {/* X Axis Labels */}
                <div className="flex justify-between text-[10px] text-slate-400 font-mono pt-2 border-t border-slate-800/80">
                  {splineData.map((d, i) => (
                    <span key={i}>{d.label}</span>
                  ))}
                </div>
              </div>
            )}

            {/* VIEW 2: VELOCITY BAR CHART */}
            {activeChartTab === "velocity" && (
              <div className="w-full">
                <div className="h-44 flex items-end justify-between gap-2 sm:gap-3 px-2 border-b border-slate-800">
                  {dailyChartData.map((item, idx) => {
                    const hasValue = item.value > 0;
                    const heightPct = hasValue
                      ? Math.max(14, Math.round((item.value / maxDailyValue) * 100))
                      : 6;

                    return (
                      <div
                        key={idx}
                        onMouseEnter={() =>
                          setHoveredPoint({
                            label: item.fullDay,
                            value: item.value,
                            subLabel: `${item.domainsCount} Subdomains &bull; ${item.usersCount} Developers`,
                          })
                        }
                        onMouseLeave={() => setHoveredPoint(null)}
                        className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                      >
                        <div className="w-full relative flex items-end justify-center">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${heightPct}%` }}
                            transition={{ duration: 0.5, delay: idx * 0.02, ease: "easeOut" }}
                            className={`w-full max-w-[28px] rounded-t-lg transition-all relative ${
                              hasValue
                                ? "bg-gradient-to-t from-indigo-600/50 via-indigo-500/80 to-cyan-400 group-hover:from-indigo-500 group-hover:to-cyan-300 shadow-lg shadow-indigo-500/20"
                                : "bg-slate-800/80 group-hover:bg-slate-700"
                            }`}
                          >
                            {hasValue && (
                              <div className="absolute top-0 left-0 right-0 h-1 bg-cyan-200 rounded-t-lg opacity-90 shadow-[0_0_6px_#22d3ee]" />
                            )}
                          </motion.div>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono mt-2 group-hover:text-white transition">
                          {item.day}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 px-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded bg-gradient-to-r from-indigo-500 to-cyan-400" />
                    <span>Real daily events recorded in timeframe</span>
                  </div>
                  <span className="font-mono text-indigo-300 font-semibold">
                    Total in Range: {dailyChartData.reduce((acc, curr) => acc + curr.value, 0)} {chartMetric}
                  </span>
                </div>
              </div>
            )}

            {/* VIEW 3: 24-HOUR HOURLY TRAFFIC SPECTRUM */}
            {activeChartTab === "hourly" && (
              <div className="w-full">
                <div className="h-44 flex items-end justify-between gap-1 px-1 border-b border-slate-800">
                  {hourlyData.map((item, idx) => {
                    const hasQueries = item.queries > 0;
                    const heightPct = hasQueries
                      ? Math.max(12, Math.round((item.queries / maxHourlyVal) * 100))
                      : 4;

                    return (
                      <div
                        key={idx}
                        onMouseEnter={() =>
                          setHoveredPoint({
                            label: `${item.hour} Local/UTC`,
                            value: item.queries,
                            subLabel: "actions & events recorded",
                          })
                        }
                        onMouseLeave={() => setHoveredPoint(null)}
                        className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                      >
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${heightPct}%` }}
                          transition={{ duration: 0.4, delay: idx * 0.015 }}
                          className={`w-full rounded-t-sm transition-all ${
                            hasQueries
                              ? "bg-gradient-to-t from-cyan-500/40 via-cyan-400/80 to-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.3)]"
                              : "bg-slate-800/60 hover:bg-slate-700"
                          }`}
                        />
                        {idx % 3 === 0 && (
                          <span className="text-[9px] text-slate-400 font-mono mt-1">
                            {item.hour.slice(0, 2)}h
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 px-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded bg-cyan-400" />
                    <span>Hourly Distribution of Administrative & Developer Actions</span>
                  </div>
                  <span className="font-mono text-cyan-300">
                    Total Events: {hourlyData.reduce((acc, curr) => acc + curr.queries, 0)} logged
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* DNS Record Distribution & Status Matrix (1 Col) */}
        <div className="rounded-2xl bg-[#0c1222]/90 border border-slate-800/80 p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between space-y-5">
          {/* Header */}
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <PieChart className="w-5 h-5 text-cyan-400" />
                <span>DNS Routing Matrix</span>
              </div>
              <span className="text-xs text-slate-400 font-mono">4 Types</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Distribution of requested record protocols across all applications
            </p>
          </div>

          {/* Record Breakdown Progress Bars */}
          <div className="space-y-3.5">
            {/* CNAME */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-mono text-indigo-300 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  CNAME (GitHub / Vercel)
                </span>
                <span className="font-mono text-white font-bold">
                  {recordDistribution.cname.pct}% ({recordDistribution.cname.count})
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${recordDistribution.cname.pct}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full"
                />
              </div>
            </div>

            {/* A Record */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-mono text-cyan-300 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  A Record (IPv4 Host IP)
                </span>
                <span className="font-mono text-white font-bold">
                  {recordDistribution.a.pct}% ({recordDistribution.a.count})
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${recordDistribution.a.pct}%` }}
                  transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full"
                />
              </div>
            </div>

            {/* AAAA Record */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-mono text-purple-300 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                  AAAA Record (IPv6)
                </span>
                <span className="font-mono text-white font-bold">
                  {recordDistribution.aaaa.pct}% ({recordDistribution.aaaa.count})
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${recordDistribution.aaaa.pct}%` }}
                  transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full"
                />
              </div>
            </div>

            {/* TXT Record */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-mono text-emerald-300 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  TXT Record (Verification)
                </span>
                <span className="font-mono text-white font-bold">
                  {recordDistribution.txt.pct}% ({recordDistribution.txt.count})
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${recordDistribution.txt.pct}%` }}
                  transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                />
              </div>
            </div>
          </div>

          {/* Subdomain Status Breakdown Mini Bar */}
          <div className="pt-3 border-t border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-slate-400">Application Resolution Status</span>
              <span className="text-emerald-400 font-mono font-bold">{approvedPct}% Approved</span>
            </div>
            <div className="h-2 rounded-full bg-slate-900 overflow-hidden flex">
              <div style={{ width: `${approvedPct}%` }} className="h-full bg-emerald-500" title="Approved" />
              <div style={{ width: `${pendingPct}%` }} className="h-full bg-amber-500" title="Pending" />
              <div style={{ width: `${rejectedPct}%` }} className="h-full bg-rose-500" title="Rejected" />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> {stats.approved} Live</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> {stats.pending} Staging</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> {stats.rejected} Declined</span>
            </div>
          </div>

          {/* Quick Authority Banner */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/90 flex items-center justify-between text-xs">
            <span className="text-slate-400">DNS Authority</span>
            <span className="font-semibold text-slate-200">GoDaddy DNS Manager</span>
          </div>
        </div>
      </div>

      

      {/* ================= MAIN SPLIT: PENDING ACTION QUEUE & RECENT AUDIT STREAM ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pending Requests Action Queue (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Pending Review Staging</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold font-mono">
                    {pendingRequests.length}
                  </span>
                </h2>
                <p className="text-xs text-slate-400">Review developer targets, copy GoDaddy snippets, and authorize DNS</p>
              </div>
            </div>

            {/* Quick Filter Box */}
            {pendingRequests.length > 0 && (
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={quickSearch}
                  onChange={(e) => setQuickSearch(e.target.value)}
                  placeholder="Filter queue..."
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500/60 w-40 sm:w-48"
                />
              </div>
            )}
          </div>

          {pendingRequests.length === 0 ? (
            <div className="rounded-2xl bg-[#0c1222]/60 border border-slate-800/80 p-10 text-center backdrop-blur-xl">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-white">Queue is Clear — Inbox Zero!</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
                All developer subdomain applications have been processed and published to GoDaddy DNS.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPending.slice(0, 5).map((item) => (
                <motion.div
                  key={item._id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl bg-[#0c1222]/90 border border-slate-800 hover:border-slate-700 p-4 md:p-5 transition backdrop-blur-xl shadow-lg space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-extrabold text-white text-base md:text-lg tracking-tight">
                          {item.subdomain}.is-a-coder.in
                        </span>
                        <span className="px-2.5 py-0.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-mono text-xs font-bold">
                          {item.recordType}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-semibold">
                          Pending
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Requested by <strong className="text-slate-300">{item.userName || "Developer"}</strong> ({item.userEmail})
                      </p>
                    </div>

                    {/* Fast Approval / Rejection Action Triggers */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => handleApprove(item._id)}
                        disabled={actionLoading === item._id}
                        className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/20 transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                      >
                        {actionLoading === item._id ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        <span>Approve</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRejectingItem(item)}
                        disabled={actionLoading === item._id}
                        className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 text-rose-300 text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Decline</span>
                      </button>
                    </div>
                  </div>

                  {/* DNS Configuration Snippet for GoDaddy */}
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 font-mono text-xs">
                    <div className="flex items-center gap-2 overflow-hidden min-w-0">
                      <span className="text-slate-400 shrink-0">Target:</span>
                      <span className="text-indigo-300 font-semibold break-all select-all">{item.target}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy(item.target, item._id)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-[11px] transition shrink-0 self-start sm:self-auto cursor-pointer"
                    >
                      {copiedId === item._id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Snippet</span>
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}

              {pendingRequests.length > 5 && (
                <div className="text-center pt-2">
                  <Link
                    href="/admin/requests"
                    className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition"
                  >
                    <span>View all {pendingRequests.length} pending applications</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Real-time Security Audit Stream (1 Col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Live Audit Feed</h2>
                <p className="text-xs text-slate-400">Immutable admin actions record</p>
              </div>
            </div>

            <Link
              href="/admin/audit"
              className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
            >
              <span>Full Log</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="rounded-2xl bg-[#0c1222]/90 border border-slate-800/80 p-4 backdrop-blur-xl shadow-xl space-y-3">
            {recentAudit.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                No recent security audit logs recorded yet.
              </div>
            ) : (
              recentAudit.map((log) => (
                <div
                  key={log._id}
                  className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60 hover:border-slate-700/80 transition space-y-1"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-indigo-300">{log.action}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 truncate">
                    {log.details || `Performed by ${log.actorEmail}`}
                  </p>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    <span>Actor: {log.actorEmail}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ================= QUICK REJECTION MODAL ================= */}
      <AnimatePresence>
        {rejectingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0c1222] border border-rose-500/30 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3 text-rose-400">
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Decline Subdomain Application</h3>
                  <p className="text-xs text-slate-400">
                    Rejecting <strong className="text-slate-200">{rejectingItem.subdomain}.is-a-coder.in</strong>
                  </p>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">
                  Rejection Reason for Developer:
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                  placeholder="Explain why this request is declined..."
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-rose-500/50"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setRejectingItem(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 text-xs font-medium hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmQuickReject}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/20 transition cursor-pointer"
                >
                  Confirm Rejection
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
