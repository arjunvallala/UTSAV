"use client";
import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChartNoAxesCombined,
  Check,
  ChevronDown,
  Download,
  Flower2,
  Heart,
  IndianRupee,
  Lightbulb,
  Menu,
  MessageCircle,
  MoreHorizontal,
  Plus,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
  Clock3,
  ArrowUpRight,
  ArrowRight,
  MapPin,
  CalendarClock,
  Trash2,
  Upload,
  RefreshCw,
  X,
  CheckCircle2,
  Leaf,
  Accessibility,
} from "lucide-react";
import { sampleWedding } from "@/templates/wedding";
import { readiness } from "@/domain/readiness";
import { allocateBudget, type Scenario, costPerGuest } from "@/domain/budget";
import {
  simulateGuests,
  simulateBudgetCut,
  simulateDateChange,
  simulateVendorCancellation,
  rescheduleTask,
} from "@/domain/simulate";
import { deleteAllData } from "@/lib/storage";
import { useEventPlan, useToday } from "@/lib/useEventPlan";
import { calendar, download } from "@/lib/exports";
type Tab = "Overview" | "Budget" | "Timeline" | "Vendors" | "Ideas";
const money = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
const relative = (date: string) => {
  const diff = Math.ceil(
    (new Date(date).getTime() - new Date().setHours(0, 0, 0, 0)) / 86400000,
  );
  return diff < 0
    ? `${Math.abs(diff)} days ago`
    : diff === 0
      ? "Today"
      : `In ${diff} days`;
};
export default function Dashboard() {
  const [event, setEvent] = useEventPlan(sampleWedding),
    today = useToday(),
    [tab, setTab] = useState<Tab>("Overview"),
    [chatOpen, setChatOpen] = useState(false),
    [message, setMessage] = useState(""),
    [answer, setAnswer] = useState(""),
    [loading, setLoading] = useState(false),
    [scenario, setScenario] = useState<Scenario>("Balanced"),
    [showSim, setShowSim] = useState(false),
    [guests, setGuests] = useState(50),
    [budgetCut, setBudgetCut] = useState(15),
    [simDate, setSimDate] = useState(sampleWedding.date),
    [simVendor, setSimVendor] = useState(sampleWedding.vendors[0]?.id || ""),
    [simTask, setSimTask] = useState(
      sampleWedding.tasks.find((t) => t.critical && t.status !== "done")?.id ||
        "",
    ),
    [notice, setNotice] = useState(""),
    [proposal, setProposal] = useState<{
      from: string;
      to: string;
      ids: string[];
    } | null>(null),
    [menuOpen, setMenuOpen] = useState(false);
  const stats = useMemo(() => readiness(event), [event]);
  const countdown = Math.max(
    0,
    Math.ceil(
      (new Date(event.date + "T00:00:00Z").getTime() -
        new Date(today + "T00:00:00Z").getTime()) /
        86400000,
    ),
  );
  const alloc = allocateBudget(event.budget, scenario);
  const simDateEffect = simulateDateChange(event, simDate);
  const simVendorEffect = simulateVendorCancellation(event, simVendor);
  const simTaskItem = event.tasks.find((t) => t.id === simTask);
  const simTaskProposal = simTaskItem
    ? rescheduleTask(
        event,
        simTask,
        new Date(
          new Date(simTaskItem.dueDate + "T00:00:00Z").getTime() + 7 * 86400000,
        )
          .toISOString()
          .slice(0, 10),
      )
    : null;
  const done = event.tasks.filter((t) => t.status === "done").length;
  const next = event.tasks
    .filter((t) => t.status !== "done")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5);
  const setMsg = (s: string) => {
    setNotice(s);
    setTimeout(() => setNotice(""), 3200);
  };
  const send = async (text = message) => {
    if (!text.trim()) return;
    setLoading(true);
    setAnswer("");
    try {
      const r = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          context: {
            name: event.name,
            type: event.type,
            city: event.city,
            guestCount: event.guestCount,
            budget: event.budget,
            theme: event.theme,
            preferences: event.preferences,
            dietary: event.dietary,
            accessibility: event.accessibility,
            tasks: event.tasks.map((t) => ({
              title: t.title,
              status: t.status,
              critical: t.critical,
              dueDate: t.dueDate,
            })),
            vendors: event.vendors.map((v) => ({
              category: v.category,
              status: v.status,
              quote: v.quote,
              budget: v.budget,
            })),
          },
        }),
      });
      const data = await r.json();
      setAnswer(data.message || data.error || "Assistant unavailable.");
    } catch {
      setAnswer(
        "Offline fallback: review your open critical tasks first, then confirm one decision with your vendors today.",
      );
    } finally {
      setLoading(false);
      setMessage("");
    }
  };
  const toggleTask = (id: string) =>
    setEvent((e) => ({
      ...e,
      tasks: e.tasks.map((t) =>
        t.id === id
          ? { ...t, status: t.status === "done" ? "upcoming" : "done" }
          : t,
      ),
    }));
  const tabs: [Tab, typeof CalendarDays][] = [
    ["Overview", ChartNoAxesCombined],
    ["Budget", Wallet],
    ["Timeline", CalendarDays],
    ["Vendors", Users],
    ["Ideas", Lightbulb],
  ];
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <div className="brand">
          <div className="brand-mark">
            <Flower2 size={24} />
          </div>
          <div>
            <span className="brand-name">
              utsav<span className="brand-dot">.</span>
            </span>
            <span className="brand-caption">EVENT STUDIO</span>
          </div>
        </div>
        <div className="workspace-label">YOUR WORKSPACE</div>
        <div className="event-switch">
          <div className="event-avatar">
            A<span>&</span>R
          </div>
          <div className="event-select">
            <b>{event.name}</b>
            <span>
              {event.type} · {event.city}
            </span>
          </div>
          <ChevronDown size={15} />
        </div>
        <div className="nav-label">PLAN YOUR EVENT</div>
        <nav className="side-nav" aria-label="Main navigation">
          {tabs.map(([name, Icon]) => (
            <button
              key={name}
              aria-label={name}
              title={name}
              onClick={() => setTab(name)}
              className={`nav-item ${tab === name ? "active" : ""}`}
              aria-current={tab === name ? "page" : undefined}
            >
              <Icon size={18} />
              <span>{name}</span>
              {name === "Timeline" && (
                <span className="nav-count">
                  {event.tasks.filter((t) => t.status !== "done").length}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon">
              <Sparkles size={18} />
            </div>
            <b>A little help goes a long way.</b>
            <p>Get thoughtful ideas tailored to your celebration.</p>
            <button onClick={() => setChatOpen(true)} className="help-link">
              Ask Utsav <ArrowRight size={14} />
            </button>
          </div>
          <button
            className="profile-button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
          >
            <div className="profile-avatar">G</div>
            <span>
              <b>Guest planner</b>
              <small>Your plans stay on this device</small>
            </span>
            <MoreHorizontal size={17} />
          </button>
          {menuOpen && (
            <div className="data-menu">
              <button
                onClick={() =>
                  download(
                    "utsav-event.json",
                    JSON.stringify(event, null, 2),
                    "application/json",
                  )
                }
              >
                <Download size={15} /> Export plan (JSON)
              </button>
              <label>
                <Upload size={15} /> Import plan
                <input
                  hidden
                  type="file"
                  accept="application/json"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    try {
                      const mod = await import("@/domain/schema");
                      const data = mod.EventSchema.parse(
                        JSON.parse(await f.text()),
                      );
                      setEvent(data);
                      setMsg("Your plan was imported.");
                    } catch {
                      setMsg("That file could not be imported.");
                    }
                  }}
                />
              </label>
              <button
                onClick={() =>
                  download(
                    "utsav-budget.csv",
                    `Category,Planned\n${alloc.map((x) => `${x.category},${x.amount}`).join("\n")}`,
                    "text/csv",
                  )
                }
              >
                <Download size={15} /> Export budget (CSV)
              </button>
              <button
                onClick={() => {
                  setEvent(sampleWedding);
                  setMsg("Sample wedding restored.");
                }}
              >
                <RefreshCw size={15} /> Restore sample wedding
              </button>
              <button
                className="danger-text"
                onClick={() => {
                  if (
                    window.confirm(
                      "Delete all locally stored Utsav data? This cannot be undone.",
                    )
                  ) {
                    deleteAllData();
                    setEvent({
                      ...sampleWedding,
                      id: "new-plan",
                      name: "My celebration",
                      actualSpend: 0,
                      tasks: [],
                      vendors: [],
                      pinnedIdeas: [],
                    });
                    setMsg("Local plan data cleared.");
                  }
                }}
              >
                <Trash2 size={15} /> Delete locally stored data
              </button>
              <p>
                Plans are stored in this browser. Your event details are only
                sent to the assistant when you ask for help.
              </p>
            </div>
          )}
        </div>
      </aside>
      <main className="main-area" id="main">
        <header className="topbar">
          <div className="breadcrumb">
            <span>My events</span>
            <span className="crumb-slash">/</span>
            <b>{event.name}</b>
          </div>
          <div className="top-actions">
            <span className="saved-indicator">
              <span className="saved-dot" /> Saved on this device
            </span>
            <button
              className="icon-button mobile-menu"
              aria-label="Open navigation"
              onClick={() => setMenuOpen((v) => !v)}
            >
              <Menu size={19} />
            </button>
            <button
              className="button-primary top-add"
              onClick={() => setTab("Timeline")}
            >
              <Plus size={16} /> Add a task
            </button>
            <button
              className="user-pill"
              aria-label="Guest planner menu"
              onClick={() => setMenuOpen((v) => !v)}
            >
              G<ChevronDown size={13} />
            </button>
          </div>
        </header>
        <div className="page-content">
          <div className="welcome-row">
            <div>
              <div className="eyebrow">
                <span className="eyebrow-line" /> YOUR CELEBRATION, THOUGHTFULLY
                PLANNED
              </div>
              <h1>
                Good morning, planner <span className="wave">✳</span>
              </h1>
              <p className="subheading">
                A little progress today makes a beautiful celebration tomorrow.
              </p>
            </div>
            <button
              className="date-chip"
              onClick={() =>
                download("utsav-timeline.ics", calendar(event), "text/calendar")
              }
            >
              <CalendarDays size={16} />
              <span>
                {new Intl.DateTimeFormat("en-IN", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                }).format(new Date(event.date))}
              </span>
              <ArrowUpRight size={14} />
            </button>
          </div>
          {notice && (
            <div className="toast" role="status">
              <CheckCircle2 size={17} />
              {notice}
            </div>
          )}
          {tab === "Overview" && (
            <>
              <section className="hero-card">
                <div className="hero-copy">
                  <span className="hero-kicker">
                    <Heart size={14} /> THE COUNTDOWN IS ON
                  </span>
                  <h2>
                    {countdown} days until
                    <br />
                    <em>the big day.</em>
                  </h2>
                  <p>
                    One thoughtful step at a time. You’re making lovely
                    progress.
                  </p>
                  <div className="hero-meta">
                    <span>
                      <MapPin size={14} />
                      {event.city}
                    </span>
                    <span className="meta-sep" />
                    <span>
                      <Users size={14} />
                      {event.guestCount} guests
                    </span>
                  </div>
                  <button
                    className="hero-button"
                    onClick={() => setTab("Timeline")}
                  >
                    See your timeline <ArrowRight size={15} />
                  </button>
                </div>
                <div
                  className="hero-art"
                  aria-label="A line-art illustration of an Indian wedding celebration"
                >
                  <div className="arch arch-back" />
                  <div className="arch arch-front" />
                  <span className="art-leaf leaf-one">❧</span>
                  <span className="art-leaf leaf-two">❧</span>
                  <span className="art-sun" />
                  <span className="art-ground" />
                  <span className="art-label">a day to remember</span>
                  <span className="art-flower f-one">✿</span>
                  <span className="art-flower f-two">✿</span>
                  <span className="art-flower f-three">✿</span>
                </div>
                <div className="hero-stamp">
                  <span>MADE WITH</span>
                  <Heart size={16} fill="currentColor" />
                  <span>CARE</span>
                </div>
              </section>
              <div className="section-heading">
                <div>
                  <span className="section-eyebrow">YOUR PLAN AT A GLANCE</span>
                  <h2>The little things, adding up.</h2>
                </div>
                <button
                  className="text-button"
                  onClick={() => setTab("Timeline")}
                >
                  View full plan <ArrowRight size={14} />
                </button>
              </div>
              <section className="stats-grid" aria-label="Event summary">
                <div className="stat-card readiness-card">
                  <div className="stat-top">
                    <span>Event readiness</span>
                    <ShieldCheck size={17} />
                  </div>
                  <div className="readiness-layout">
                    <div
                      className="ring"
                      style={
                        {
                          "--progress": `${stats.score * 3.6}deg`,
                        } as React.CSSProperties
                      }
                    >
                      <span>
                        {stats.score}
                        <small>%</small>
                      </span>
                    </div>
                    <div className="ring-copy">
                      <b>You’re finding your rhythm</b>
                      <span>
                        {stats.critical} important{" "}
                        {stats.critical === 1 ? "task" : "tasks"} still to go
                      </span>
                    </div>
                  </div>
                  <button
                    className="card-foot"
                    onClick={() => setTab("Timeline")}
                  >
                    What makes up your score <ArrowRight size={13} />
                  </button>
                  <span className="sr-only">
                    Readiness {stats.score} percent. {stats.explanation}
                  </span>
                </div>
                <div className="stat-card">
                  <div className="stat-top">
                    <span>Budget feeling</span>
                    <IndianRupee size={16} />
                  </div>
                  <div className="stat-value">
                    {money(event.budget - event.actualSpend)}
                  </div>
                  <div className="stat-caption">
                    left to plan with{" "}
                    <span className="positive-pill">
                      {Math.round((event.actualSpend / event.budget) * 100)}%
                      used
                    </span>
                  </div>
                  <div className="mini-progress">
                    <span
                      style={{
                        width: `${Math.min(100, (event.actualSpend / event.budget) * 100)}%`,
                      }}
                    />
                  </div>
                  <button
                    className="card-foot"
                    onClick={() => setTab("Budget")}
                  >
                    See the breakdown <ArrowRight size={13} />
                  </button>
                </div>
                <div className="stat-card">
                  <div className="stat-top">
                    <span>On the list</span>
                    <Check size={17} />
                  </div>
                  <div className="stat-value">
                    {done}
                    <span className="stat-denominator">
                      {" "}
                      / {event.tasks.length}
                    </span>
                  </div>
                  <div className="stat-caption">
                    little things already taken care of
                  </div>
                  <div className="task-dots">
                    {event.tasks.slice(0, 18).map((t) => (
                      <span
                        key={t.id}
                        className={
                          t.status === "done" ? "dot-done" : "dot-todo"
                        }
                      />
                    ))}
                  </div>
                  <button
                    className="card-foot"
                    onClick={() => setTab("Timeline")}
                  >
                    Keep the momentum <ArrowRight size={13} />
                  </button>
                </div>
                <div className="stat-card">
                  <div className="stat-top">
                    <span>Wonderful people</span>
                    <Users size={16} />
                  </div>
                  <div className="stat-value">
                    {
                      event.vendors.filter((v) =>
                        ["booked", "paid"].includes(v.status),
                      ).length
                    }
                    <span className="stat-denominator">
                      {" "}
                      / {event.vendors.length}
                    </span>
                  </div>
                  <div className="stat-caption">
                    partners booked and ready to help
                  </div>
                  <div className="vendor-avatars">
                    <span>G</span>
                    <span>S</span>
                    <span>L</span>
                    <span>+</span>
                  </div>
                  <button
                    className="card-foot"
                    onClick={() => setTab("Vendors")}
                  >
                    Meet your vendor list <ArrowRight size={13} />
                  </button>
                </div>
              </section>
              <div className="lower-grid">
                <section className="panel tasks-panel">
                  <div className="panel-heading">
                    <div>
                      <span className="section-eyebrow">
                        A FEW THINGS COMING UP
                      </span>
                      <h3>Your next steps</h3>
                    </div>
                    <button
                      className="subtle-button"
                      onClick={() => setTab("Timeline")}
                    >
                      See all <ArrowRight size={13} />
                    </button>
                  </div>
                  <div className="task-list">
                    {next.length ? (
                      next.map((t) => (
                        <div className="task-row" key={t.id}>
                          <button
                            className={`task-check ${t.status === "done" ? "checked" : ""}`}
                            onClick={() => toggleTask(t.id)}
                            aria-label={`${t.status === "done" ? "Mark incomplete" : "Complete"}: ${t.title}`}
                          >
                            {t.status === "done" && <Check size={12} />}
                          </button>
                          <div className="task-copy">
                            <b>{t.title}</b>
                            <span>
                              {t.category}
                              {t.critical && (
                                <span className="critical-label">
                                  {" "}
                                  · Important
                                </span>
                              )}
                            </span>
                          </div>
                          <span
                            className={`task-date ${t.status === "overdue" ? "late" : ""}`}
                          >
                            {relative(t.dueDate)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="empty-state">
                        Your next steps will show up here.
                      </p>
                    )}
                  </div>
                </section>
                <section className="panel idea-panel">
                  <div className="panel-heading">
                    <div>
                      <span className="section-eyebrow">
                        A THOUGHT JUST FOR YOU
                      </span>
                      <h3>Little details, big feeling.</h3>
                    </div>
                    <div className="sparkle-icon">
                      <Sparkles size={17} />
                    </div>
                  </div>
                  <div className="idea-feature">
                    <span className="idea-ornament">✿</span>
                    <p>
                      Welcome guests with a <b>marigold and jasmine arch</b>,
                      using locally sourced blooms. It echoes your garden theme
                      and keeps the celebration close to Jaipur.
                    </p>
                    <div className="idea-tags">
                      <span>
                        <Flower2 size={12} /> Garden-inspired
                      </span>
                      <span>
                        <Leaf size={12} /> Local blooms
                      </span>
                    </div>
                  </div>
                  <div className="idea-actions">
                    <button
                      className="text-button"
                      onClick={() => setTab("Ideas")}
                    >
                      Explore more ideas <ArrowRight size={14} />
                    </button>
                    <button
                      className="pin-button"
                      aria-label="Save this idea"
                      onClick={() => {
                        setEvent((e) => ({
                          ...e,
                          pinnedIdeas: [
                            ...e.pinnedIdeas,
                            "Marigold and jasmine welcome arch",
                          ].slice(-6),
                        }));
                        setMsg("Idea saved to your plan.");
                      }}
                    >
                      <Heart size={16} />
                    </button>
                  </div>
                </section>
              </div>
              <section className="soft-callout">
                <span className="callout-icon">
                  <Sparkles size={17} />
                </span>
                <div>
                  <b>Big plans can start with a small question.</b>
                  <p>
                    Talk through budgets, ideas, or your next steps with your
                    planning companion.
                  </p>
                </div>
                <button
                  className="button-primary"
                  onClick={() => setChatOpen(true)}
                >
                  Ask Utsav <MessageCircle size={15} />
                </button>
              </section>
            </>
          )}
          {tab === "Budget" && (
            <>
              <div className="view-intro">
                <span className="section-eyebrow">A CLEARER PICTURE</span>
                <h2>A budget that breathes.</h2>
                <p>
                  Compare three ways to make your celebration feel like yours.
                  Every figure is calculated from your plan.
                </p>
              </div>
              <section className="budget-summary">
                <div>
                  <span>Total celebration budget</span>
                  <strong>{money(event.budget)}</strong>
                  <small>
                    {money(event.actualSpend)} spent ·{" "}
                    {money(event.budget - event.actualSpend)} remaining
                  </small>
                </div>
                <div>
                  <span>Cost per guest</span>
                  <strong>
                    {money(costPerGuest(event.budget, event.guestCount))}
                  </strong>
                  <small>Based on {event.guestCount} guests</small>
                </div>
                <div>
                  <span>Protected reserve</span>
                  <strong>{money(Math.round(event.budget * 0.04))}</strong>
                  <small>Set aside for the unexpected</small>
                </div>
              </section>
              <div className="scenario-row">
                {(["Economical", "Balanced", "Premium"] as Scenario[]).map(
                  (s) => (
                    <button
                      key={s}
                      onClick={() => setScenario(s)}
                      className={`scenario-card ${scenario === s ? "selected" : ""}`}
                    >
                      <span>
                        {s === scenario ? (
                          <CheckCircle2 size={17} />
                        ) : (
                          <span className="scenario-dot" />
                        )}
                        {s}
                      </span>
                      <small>
                        {s === "Economical"
                          ? "Keep it wonderfully simple"
                          : s === "Balanced"
                            ? "Room for the details you love"
                            : "Make space for the extras"}
                      </small>
                    </button>
                  ),
                )}
              </div>
              <section className="panel allocation-panel">
                <div className="panel-heading">
                  <div>
                    <span className="section-eyebrow">
                      {scenario.toUpperCase()} SCENARIO
                    </span>
                    <h3>Where it could go</h3>
                  </div>
                  <button
                    className="subtle-button"
                    onClick={() => {
                      download(
                        "utsav-budget.csv",
                        `Category,Planned,Share\n${alloc.map((x) => `${x.category},${x.amount},${Math.round(x.ratio * 100)}%`).join("\n")}`,
                        "text/csv",
                      );
                      setMsg("Budget downloaded as CSV.");
                    }}
                  >
                    <Download size={14} /> Export CSV
                  </button>
                </div>
                <div className="allocation-list">
                  {alloc.map((item) => (
                    <div className="allocation-row" key={item.category}>
                      <span>
                        {item.category.charAt(0).toUpperCase() +
                          item.category.slice(1)}
                      </span>
                      <div className="allocation-bar">
                        <i style={{ width: `${item.ratio * 100}%` }} />
                      </div>
                      <b>{money(item.amount)}</b>
                      <small>{Math.round(item.ratio * 100)}%</small>
                    </div>
                  ))}
                </div>
                <p className="reserve-note">
                  <ShieldCheck size={15} /> Your contingency reserve is kept
                  separate to protect the plan.
                </p>
              </section>
              <section className="panel actual-panel">
                <div className="panel-heading">
                  <div>
                    <span className="section-eyebrow">REALITY CHECK</span>
                    <h3>Planned alongside actual</h3>
                  </div>
                  <button
                    className="subtle-button"
                    onClick={() =>
                      setEvent((e) => ({
                        ...e,
                        actualSpend: Math.min(e.budget, e.actualSpend + 25000),
                      }))
                    }
                  >
                    <Plus size={14} /> Log ₹25,000 actual
                  </button>
                </div>
                <div className="compare-bars">
                  <div>
                    <span>Planned</span>
                    <div className="long-bar">
                      <i style={{ width: "100%" }} />
                    </div>
                    <b>{money(event.budget)}</b>
                  </div>
                  <div>
                    <span>Spent so far</span>
                    <div className="long-bar actual">
                      <i
                        style={{
                          width: `${Math.min(100, (event.actualSpend / event.budget) * 100)}%`,
                        }}
                      />
                    </div>
                    <b>{money(event.actualSpend)}</b>
                  </div>
                </div>
                <p className="compare-foot">
                  Current pace: {money(event.actualSpend / event.guestCount)}{" "}
                  per guest ·{" "}
                  {Math.max(
                    0,
                    Math.round(
                      ((event.budget - event.actualSpend) /
                        Math.max(1, event.budget)) *
                        100,
                    ),
                  )}
                  % of your budget remains.
                </p>
              </section>
            </>
          )}
          {tab === "Timeline" && (
            <>
              <div className="view-intro">
                <span className="section-eyebrow">THE DAYS AHEAD</span>
                <h2>Everything, in its own time.</h2>
                <p>
                  Your plan follows the event date and dependencies. Schedule
                  changes stay a proposal until you approve.
                </p>
              </div>
              <div className="timeline-toolbar">
                <div className="view-switch">
                  <button className="selected">List view</button>
                  <button
                    onClick={() =>
                      download(
                        "utsav-timeline.ics",
                        calendar(event),
                        "text/calendar",
                      )
                    }
                  >
                    Calendar export
                  </button>
                </div>
                <div className="timeline-actions">
                  <button
                    className="button-secondary"
                    onClick={() => setShowSim(true)}
                  >
                    <Sparkles size={14} /> What if?
                  </button>
                  <button
                    className="button-primary"
                    onClick={() => {
                      const id = `task-${Date.now()}`;
                      setEvent((e) => ({
                        ...e,
                        tasks: [
                          ...e.tasks,
                          {
                            id,
                            title: "A new planning task",
                            category: "Planning",
                            dueDate: e.date,
                            status: "upcoming",
                            critical: false,
                            dependsOn: [],
                          },
                        ],
                      }));
                      setMsg("A new task was added.");
                    }}
                  >
                    <Plus size={15} /> Add a task
                  </button>
                </div>
              </div>
              <section className="panel timeline-panel">
                {event.tasks
                  .slice()
                  .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
                  .map((t, i) => (
                    <div className="timeline-row" key={t.id}>
                      <div className="timeline-track">
                        <span
                          className={`timeline-node ${t.status === "done" ? "complete" : ""}`}
                        >
                          {t.status === "done" ? <Check size={12} /> : null}
                        </span>
                        {i < event.tasks.length - 1 && <i />}
                      </div>
                      <button
                        className={`task-check timeline-check ${t.status === "done" ? "checked" : ""}`}
                        onClick={() => toggleTask(t.id)}
                        aria-label={`Toggle ${t.title}`}
                      >
                        {t.status === "done" && <Check size={12} />}
                      </button>
                      <div className="timeline-title">
                        <b>{t.title}</b>
                        <span>
                          {t.category} {t.critical && <em>Important</em>}
                        </span>
                      </div>
                      <time>
                        {new Date(t.dueDate + "T12:00:00").toLocaleDateString(
                          "en-IN",
                          { month: "short", day: "numeric" },
                        )}
                      </time>
                      <span className={`timeline-status ${t.status}`}>
                        {t.status.replace("-", " ")}
                      </span>
                      <button
                        className="icon-button reschedule"
                        aria-label={`Propose new date for ${t.title}`}
                        onClick={() => {
                          const d = new Date(t.dueDate);
                          d.setDate(d.getDate() + 7);
                          const proposal = rescheduleTask(
                            event,
                            t.id,
                            d.toISOString().slice(0, 10),
                          );
                          setProposal({
                            from: t.dueDate,
                            to: d.toISOString().slice(0, 10),
                            ids: proposal.affected,
                          });
                        }}
                      >
                        <CalendarClock size={16} />
                      </button>
                    </div>
                  ))}
              </section>
              <section className="panel day-panel">
                <div className="day-icon">
                  <Clock3 size={18} />
                </div>
                <div>
                  <b>Event-day schedule</b>
                  <p>
                    Your day-of timeline is taking shape. Add a ceremony start
                    time to build a comfortable run of show.
                  </p>
                </div>
                <button
                  onClick={() =>
                    setMsg("Day-of schedule is ready to personalize.")
                  }
                >
                  Shape the day <ArrowRight size={14} />
                </button>
              </section>
            </>
          )}
          {tab === "Vendors" && (
            <>
              <div className="view-intro">
                <span className="section-eyebrow">
                  GOOD PEOPLE, GREAT PARTNERSHIPS
                </span>
                <h2>Meet your vendor shortlist.</h2>
                <p>
                  Only details you or your planner provide appear here. No
                  invented ratings, contacts or quotes.
                </p>
              </div>
              <div className="vendor-grid">
                {event.vendors.map((v) => (
                  <section className="panel vendor-card" key={v.id}>
                    <div className="vendor-card-top">
                      <div className="vendor-avatar">{v.name.slice(0, 1)}</div>
                      <span className={`vendor-status ${v.status}`}>
                        {v.status}
                      </span>
                    </div>
                    <span className="vendor-category">{v.category}</span>
                    <h3>{v.name}</h3>
                    <div className="vendor-quote">
                      <span>Quoted amount</span>
                      <b>
                        {v.quote === null ? "Not received" : money(v.quote)}
                      </b>
                    </div>
                    <div className="vendor-quote">
                      <span>Category allocation</span>
                      <b>{money(v.budget)}</b>
                    </div>
                    {v.quote !== null && (
                      <div className="quote-meter">
                        <i
                          style={{
                            width: `${Math.min(100, (v.quote / v.budget) * 100)}%`,
                          }}
                        />
                      </div>
                    )}
                    <div className="vendor-buttons">
                      <button onClick={() => setChatOpen(true)}>
                        <MessageCircle size={14} /> Draft questions
                      </button>
                      <select
                        aria-label={`Update ${v.name} status`}
                        value={v.status}
                        onChange={(e) =>
                          setEvent((ev) => ({
                            ...ev,
                            vendors: ev.vendors.map((x) =>
                              x.id === v.id
                                ? {
                                    ...x,
                                    status: e.target.value as typeof x.status,
                                  }
                                : x,
                            ),
                          }))
                        }
                      >
                        <option value="researching">Researching</option>
                        <option value="contacted">Contacted</option>
                        <option value="quoted">Quoted</option>
                        <option value="booked">Booked</option>
                        <option value="paid">Paid</option>
                      </select>
                    </div>
                  </section>
                ))}
              </div>
              <section className="soft-callout">
                <span className="callout-icon">
                  <ShieldCheck size={17} />
                </span>
                <div>
                  <b>Want a second look at a quote?</b>
                  <p>
                    Share what the vendor has offered and get a clear comparison
                    with your allocation.
                  </p>
                </div>
                <button
                  className="button-primary"
                  onClick={() => {
                    setChatOpen(true);
                    setMessage(
                      "Help me compare our vendor quote against its budget allocation.",
                    );
                  }}
                >
                  Compare a quote <ArrowRight size={15} />
                </button>
              </section>
            </>
          )}
          {tab === "Ideas" && (
            <>
              <div className="view-intro">
                <span className="section-eyebrow">
                  THOUGHTFUL, PERSONAL TOUCHES
                </span>
                <h2>Ideas that feel like you.</h2>
                <p>
                  Inspired by {event.city}, your {event.theme.toLowerCase()}{" "}
                  theme and the things you care about.
                </p>
              </div>
              <div className="idea-grid">
                {[
                  {
                    title: "A garden welcome arch",
                    body: "Frame your entrance with locally sourced marigold and jasmine, balanced with seasonal greenery. A natural fit for your outdoor garden celebration.",
                    tags: ["Locally sourced", "Garden theme"],
                    icon: <Flower2 />,
                  },
                  {
                    title: "A menu with everyone in mind",
                    body: "Add a clearly marked vegetarian tasting station and nut-free labels, so guests can choose with confidence.",
                    tags: ["Dietary needs", "Guest comfort"],
                    icon: <Heart />,
                  },
                  {
                    title: "A quieter place to pause",
                    body: "Set up step-free quiet seating just off the main garden, with a clear route back to the celebration.",
                    tags: ["Accessibility", "Comfort"],
                    icon: <Accessibility />,
                  },
                  {
                    title: "A thoughtful welcome",
                    body: "Offer reusable copper water dispensers and a small card explaining the local flowers and seasonal menu.",
                    tags: ["Low waste", "Local details"],
                    icon: <Leaf />,
                  },
                ].map((idea) => (
                  <article className="panel idea-card" key={idea.title}>
                    <div className="idea-card-top">
                      <span className="idea-card-icon">{idea.icon}</span>
                      <button
                        className={`pin-button ${event.pinnedIdeas.includes(idea.title) ? "pinned" : ""}`}
                        aria-label={`${event.pinnedIdeas.includes(idea.title) ? "Unpin" : "Pin"} ${idea.title}`}
                        onClick={() =>
                          setEvent((e) => ({
                            ...e,
                            pinnedIdeas: e.pinnedIdeas.includes(idea.title)
                              ? e.pinnedIdeas.filter((x) => x !== idea.title)
                              : [...e.pinnedIdeas, idea.title],
                          }))
                        }
                      >
                        <Heart size={17} />
                      </button>
                    </div>
                    <h3>{idea.title}</h3>
                    <p>{idea.body}</p>
                    <div className="idea-tags">
                      {idea.tags.map((t) => (
                        <span key={t}>{t}</span>
                      ))}
                    </div>
                    <button
                      className="text-button"
                      onClick={() => {
                        setMessage(
                          `Can you suggest a variation on: ${idea.title}?`,
                        );
                        setChatOpen(true);
                      }}
                    >
                      Make it your own <ArrowRight size={14} />
                    </button>
                  </article>
                ))}
              </div>
              <div className="pinned-section">
                <h3>Your saved ideas</h3>
                {event.pinnedIdeas.length ? (
                  <div className="pinned-list">
                    {event.pinnedIdeas.map((idea, i) => (
                      <span key={`${idea}-${i}`}>
                        <Heart size={13} />
                        {idea}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p>Save the ideas you love and they’ll be waiting here.</p>
                )}
                <button
                  className="button-primary"
                  onClick={() => {
                    setChatOpen(true);
                    setMessage(
                      "Suggest one fresh idea for our event based on our theme, budget and guest needs.",
                    );
                  }}
                >
                  <RefreshCw size={14} /> Imagine something new
                </button>
              </div>
            </>
          )}
        </div>
      </main>
      <button
        className={`assistant-fab ${chatOpen ? "fab-open" : ""}`}
        onClick={() => setChatOpen((v) => !v)}
        aria-label={
          chatOpen ? "Close planning assistant" : "Open planning assistant"
        }
      >
        {chatOpen ? (
          <X size={20} />
        ) : (
          <>
            <Sparkles size={18} />
            <span>Ask Utsav</span>
          </>
        )}
      </button>
      {chatOpen && (
        <aside className="chat-panel" aria-label="Utsav planning assistant">
          <div className="chat-header">
            <div className="chat-avatar">
              <Sparkles size={17} />
            </div>
            <div>
              <b>Your planning companion</b>
              <span>Here when you need a fresh perspective</span>
            </div>
            <button
              className="icon-button"
              onClick={() => setChatOpen(false)}
              aria-label="Close assistant"
            >
              <X size={18} />
            </button>
          </div>
          <div className="privacy-note">
            <ShieldCheck size={14} /> Event details are sent only when you ask.
            No personal identifiers are shared.
          </div>
          <div className="chat-content">
            <div className="assistant-message">
              <span className="assistant-mini">
                <Sparkles size={13} />
              </span>
              <p>
                Hi! I’ve got your celebration in mind. What would feel helpful
                right now?
              </p>
            </div>
            <div className="suggestion-chips">
              <button
                onClick={() =>
                  send("Suggest a thoughtful way to stay within our budget.")
                }
              >
                Stay within budget
              </button>
              <button
                onClick={() =>
                  send("What planning risks should I be aware of?")
                }
              >
                Spot planning risks
              </button>
              <button
                onClick={() =>
                  send(
                    "Suggest a few locally inspired event ideas matching our preferences.",
                  )
                }
              >
                Fresh ideas
              </button>
            </div>
            {answer && (
              <div className="assistant-message response">
                <span className="assistant-mini">
                  <Sparkles size={13} />
                </span>
                <p>{answer}</p>
              </div>
            )}
            {loading && (
              <div className="assistant-message">
                <span className="assistant-mini">
                  <Sparkles size={13} />
                </span>
                <p className="typing">Thinking through your plan…</p>
              </div>
            )}
          </div>
          <form
            className="chat-input"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <label className="sr-only" htmlFor="chat-message">
              Ask about your event
            </label>
            <input
              id="chat-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask anything about your event…"
              maxLength={2000}
            />
            <button
              className="send-button"
              disabled={loading || !message.trim()}
              aria-label="Send message"
            >
              <ArrowRight size={17} />
            </button>
          </form>
        </aside>
      )}
      {showSim && (
        <div className="modal-backdrop" onClick={() => setShowSim(false)}>
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sim-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setShowSim(false)}
              aria-label="Close simulator"
            >
              <X size={18} />
            </button>
            <span className="section-eyebrow">A SAFE SPACE TO EXPERIMENT</span>
            <h2 id="sim-title">What if things changed?</h2>
            <p>
              Try a scenario. Your real plan stays just as it is until you
              choose to update it.
            </p>
            <label>
              More guests{" "}
              <input
                type="range"
                min="0"
                max="200"
                step="10"
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
              />
              <span>+{guests} guests</span>
            </label>
            <div className="simulation-result">
              <span>Estimated additional budget</span>
              <b>{money(simulateGuests(event, guests).delta)}</b>
            </div>
            <label>
              Budget change{" "}
              <input
                type="range"
                min="0"
                max="30"
                step="5"
                value={budgetCut}
                onChange={(e) => setBudgetCut(Number(e.target.value))}
              />
              <span>−{budgetCut}%</span>
            </label>
            <div className="simulation-result">
              <span>New budget / remaining</span>
              <b>
                {money(simulateBudgetCut(event, budgetCut).budget)} /{" "}
                {money(simulateBudgetCut(event, budgetCut).remaining)}
              </b>
            </div>
            <label className="sim-select-label" htmlFor="sim-date">
              Move event date{" "}
              <input
                id="sim-date"
                type="date"
                value={simDate}
                onChange={(e) => setSimDate(e.target.value)}
              />
            </label>
            <div className="simulation-result">
              <span>
                {Math.abs(simDateEffect.shiftDays)} days{" "}
                {simDateEffect.shiftDays < 0 ? "earlier" : "later"} · open tasks
                affected
              </span>
              <b>{simDateEffect.affectedTasks}</b>
            </div>
            <label className="sim-select-label" htmlFor="sim-vendor">
              If a vendor cancels{" "}
              <select
                id="sim-vendor"
                value={simVendor}
                onChange={(e) => setSimVendor(e.target.value)}
              >
                {event.vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.category} shortlist
                  </option>
                ))}
              </select>
            </label>
            <div className="simulation-result">
              <span>{simVendorEffect?.notice || "No vendor selected."}</span>
              <b>{simVendorEffect?.readinessDelta || 0}% readiness</b>
            </div>
            <label className="sim-select-label" htmlFor="sim-task">
              If a task is delayed{" "}
              <select
                id="sim-task"
                value={simTask}
                onChange={(e) => setSimTask(e.target.value)}
              >
                {event.tasks
                  .filter((t) => t.status !== "done")
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
              </select>
            </label>
            <div className="simulation-result">
              <span>
                {simTaskProposal?.affected.length || 0} dependent tasks would
                need review
              </span>
              <b>+7 days</b>
            </div>
            <div className="modal-foot">
              <span>
                <ShieldCheck size={15} /> This is a simulation only.
              </span>
              <button
                className="button-primary"
                onClick={() => setShowSim(false)}
              >
                Done exploring
              </button>
            </div>
          </section>
        </div>
      )}
      {proposal && (
        <div className="modal-backdrop" onClick={() => setProposal(null)}>
          <section
            className="modal proposal-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="proposal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setProposal(null)}
              aria-label="Close proposal"
            >
              <X size={18} />
            </button>
            <span className="section-eyebrow">A CHANGE TO REVIEW</span>
            <h2 id="proposal-title">A possible schedule adjustment.</h2>
            <p>
              Moving this task to {proposal.to} may shift{" "}
              {proposal.ids.length - 1} dependent tasks. Nothing changes until
              you approve.
            </p>
            <div className="proposal-diff">
              {event.tasks
                .filter((t) => proposal.ids.includes(t.id))
                .map((t) => (
                  <div key={t.id}>
                    <span>{t.title}</span>
                    <b>
                      {t.dueDate} <ArrowRight size={13} />{" "}
                      {new Date(
                        new Date(t.dueDate).getTime() +
                          new Date(proposal.to).getTime() -
                          new Date(proposal.from).getTime(),
                      )
                        .toISOString()
                        .slice(0, 10)}
                    </b>
                  </div>
                ))}
            </div>
            <div className="modal-foot">
              <button
                className="button-secondary"
                onClick={() => setProposal(null)}
              >
                Keep current plan
              </button>
              <button
                className="button-primary"
                onClick={() => {
                  const shift =
                    new Date(proposal.to).getTime() -
                    new Date(proposal.from).getTime();
                  setEvent((e) => ({
                    ...e,
                    tasks: e.tasks.map((t) =>
                      proposal.ids.includes(t.id)
                        ? {
                            ...t,
                            dueDate: new Date(
                              new Date(t.dueDate).getTime() + shift,
                            )
                              .toISOString()
                              .slice(0, 10),
                          }
                        : t,
                    ),
                  }));
                  setProposal(null);
                  setMsg("Schedule proposal approved.");
                }}
              >
                Approve this adjustment <Check size={15} />
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
