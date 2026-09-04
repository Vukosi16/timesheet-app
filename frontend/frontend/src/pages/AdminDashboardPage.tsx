import { useState, useMemo, useEffect } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AdminDashboardPage.css";
import { useAuth } from "../context/authContext";
import {
  getAllAdminTimesheets,
  getAllCoaches,
  markTimesheetPaid,
  reviewTimesheet,
} from "../lib/api";

type TimesheetStatus = "Pending" | "Approved" | "Paid" | "Rejected";

interface Coach {
  id: string;
  name: string;
  email: string;
  phone: string;
  bankName?: string;
  accountType?: string;
  accountNumber?: string;
  joined: string; // YYYY-MM-DD
  active: boolean;
}

interface TimesheetEntry {
  date: string; // e.g. "2026-08-04"
  activities: string; // e.g. "U16 Strength block"
  subNote?: string; // e.g. "Extra 30min recovery"
  decription: string;
  amount: number; // per-entry override; falls back to the timesheet's effective rate
}

interface Timesheet {
  id: string; // reference, e.g. TS-1042
  coachName: string;
  period: string; // e.g. "01 – 15 Aug 2026"
  submitted: string; // e.g. "2026-08-16"
  hours: number;
  status: TimesheetStatus;
  entries: TimesheetEntry[];
  reviewNote?: string;
  submittedForReview?: boolean;
}

type View = "timesheets" | "coaches" | "create";
type StatusFilter = "All" | TimesheetStatus;

const INITIAL_COACHES: Coach[] = [
  {
    id: "c1",
    name: "Vukosi Mhlabini",
    email: "vk@academy.com",
    phone: "+27 82 441 9032",
    bankName: "FNB",
    accountType: "Cheque",
    accountNumber: "62014578901",
    joined: "2024-02-11",
    active: true,
  },
  {
    id: "c2",
    name: "Wanga Malinda",
    email: "wanga@academy.com",
    phone: "+27 71 220 7781",
    bankName: "Standard Bank",
    accountType: "Savings",
    accountNumber: "083456712",
    joined: "2023-08-01",
    active: true,
  },
  {
    id: "c3",
    name: "John Doe",
    email: "john@academy.com",
    phone: "+27 83 907 1145",
    bankName: "Nedbank",
    accountType: "Cheque",
    accountNumber: "1098765432",
    joined: "2022-05-19",
    active: false,
  },
  {
    id: "c4",
    name: "Aisha Patel",
    email: "aisha@academy.com",
    phone: "+27 76 334 8890",
    bankName: "Capitec",
    accountType: "Savings",
    accountNumber: "1425369874",
    joined: "2025-01-06",
    active: true,
  },
];

const INITIAL_TIMESHEETS: Timesheet[] = [
  {
    id: "TS-1042",
    coachName: "John Doe",
    period: "01 – 15 Aug 2026",
    submitted: "2026-08-16",
    hours: 9,
    status: "Pending",
    entries: [
      { 
        date: "2026-08-03",
        decription: "Fitness", 
        activities: "U16 Strength block", 
        amount: 250 },
      {
        date: "2026-08-05",
        decription: "Intensive leg day",
        activities: "Senior squad",
        subNote: "Extra 30min recovery",
        amount: 300,
      },
      { date: "2026-08-10", 
        decription: "Testing day",
        activities: "speed drills", 
        amount: 400 },
    ],
  },
  {
    id: "TS-1041",
    coachName: "Wanga Malinda",
    period: "01 – 15 Aug 2026",
    submitted: "2026-08-15",
    hours: 7.5,
    status: "Approved",
    entries: [
      { date: "2026-08-02", decription: "Instensive weight cutting", activities: "U16 training", amount: 270 },
      { date: "2026-08-09", decription: "Fitness", activities: "U15 training", amount: 350 },
      { date: "2026-08-14", decription: "Testing day", activities: "U17 training", amount: 140  },
    ],
  },
  {
    id: "TS-1039",
    coachName: "Vukosi Muhlabini",
    period: "16 – 31 Jul 2026",
    submitted: "2026-07-31",
    hours: 9,
    status: "Paid",
    entries: [
      { date: "2026-07-18", decription: "Goal keeper dive training", activities: "U16 training", amount: 300 },
      { date: "2026-07-25", decription: "Goal keeper runnig drill", activities: "U17 training", amount: 350},
    ],
  },
  {
    id: "TS-1038",
    coachName: "Aisha Patel",
    period: "16 – 31 Jul 2026",
    submitted: "2026-07-31",
    hours: 6,
    status: "Rejected",
    entries: [
      { date: "2026-07-17", decription: "Goal keeper runnig drill", activities: "U17 training", amount: 350},
      { date: "2026-07-24", decription: "Strikers runnig drill", activities: "U17 training", amount: 380},
    ],
    reviewNote: "Hours don't match the venue sign-in register — please resubmit with corrected times.",
  },
];

const STATUS_FILTERS: StatusFilter[] = [
  "All",
  "Pending",
  "Approved",
  "Paid",
  "Rejected",
];

function formatRand(amount: number): string {
  return `R ${amount.toLocaleString("en-ZA")}`;
}

function calculateTimesheetTotal(timesheet: Timesheet): number {
  return timesheet.entries.reduce((total, entry) => total + entry.amount, 0);
}

function statusClass(status: TimesheetStatus): string {
  switch (status) {
    case "Approved":
      return "badge badge--approved";
    case "Paid":
      return "badge badge--paid";
    case "Rejected":
      return "badge badge--rejected";
    case "Pending":
    default:
      return "badge badge--pending";
  }
}

function statusLabel(status: TimesheetStatus): string {
  return status === "Pending" ? "Pending review" : status;
}

function nextTimesheetRef(existing: Timesheet[]): string {
  const highest = existing.reduce((max, ts) => {
    const n = parseInt(ts.id.replace("TS-", ""), 10);
    return Number.isFinite(n) && n > max ? n : max;
  }, 1000);
  return `TS-${highest + 1}`;
}

const EMPTY_COACH_FORM = {
  name: "",
  email: "",
  phone: "",
  activeImmediately: true,
};

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading, logout: logoutUser } = useAuth();
  const [view, setView] = useState<View>("timesheets");
  const [coaches, setCoaches] = useState<Coach[]>(INITIAL_COACHES);
  const [timesheets, setTimesheets] = useState<Timesheet[]>(INITIAL_TIMESHEETS);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [coachForm, setCoachForm] = useState(EMPTY_COACH_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [selectedTimesheetId, setSelectedTimesheetId] = useState<string | null>(null);

  async function fetchAdminData() {
    setLoading(true);
    setLoadError(null);
    try {
      const [timesheetResult, coachResult] = await Promise.all([
        getAllAdminTimesheets(),
        getAllCoaches(),
      ]);
      setTimesheets((timesheetResult.timesheets as ApiTimesheet[]).map(adaptTimesheet));
      setCoaches((coachResult.coaches as ApiCoach[]).map((coach) => ({
        ...coach,
        id: String(coach.id),
        phone: "Not provided",
        joined: "",
        active: true,
      })));
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Unable to load admin data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!authLoading && user?.role === "ADMIN") {
      fetchAdminData();
    }
  }, [authLoading, user]);

  const selectedTimesheet = useMemo(
    () => timesheets.find((t) => t.id === selectedTimesheetId) ?? null,
    [timesheets, selectedTimesheetId]
  );

  const selectedCoach = useMemo(
    () =>
      selectedTimesheet
        ? coaches.find((c) => c.name === selectedTimesheet.coachName) ?? null
        : null,
    [coaches, selectedTimesheet]
  );

  const awaitingReview = useMemo(
    () => timesheets.filter((t) => t.status === "Pending" && t.submittedForReview !== false).length,
    [timesheets]
  );

  const approvedUnpaid = useMemo(
    () =>
      timesheets
        .filter((t) => t.status === "Approved")
        .reduce((sum, t) => sum + calculateTimesheetTotal(t), 0),
    [timesheets]
  );

  const filteredTimesheets = useMemo(() => {
    if (statusFilter === "All") return timesheets;
    return timesheets.filter((t) => t.status === statusFilter);
  }, [timesheets, statusFilter]);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2600);
  }

  function handleCreateCoach(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError(null);

    const name = coachForm.name.trim();
    const email = coachForm.email.trim();
    const phone = coachForm.phone.trim();

    if (!name || !email || !phone) {
      setFormError("Fill in every field before creating the coach.");
      return;
    }

    const newCoach: Coach = {
      id: `c${nextTimesheetRef(timesheets)}`,
      name,
      email,
      phone,
      joined: new Date().toISOString().slice(0, 10),
      active: coachForm.activeImmediately,
    };

    setCoaches((prev) => [newCoach, ...prev]);
    setCoachForm(EMPTY_COACH_FORM);
    showToast(`${name} was added as a coach.`);
    setView("coaches");
  }

  function handleCancelCreate() {
    setCoachForm(EMPTY_COACH_FORM);
    setFormError(null);
    setView("coaches");
  }

  function handleDeleteCoach(id: string) {
    const coach = coaches.find((c) => c.id === id);
    setCoaches((prev) => prev.filter((c) => c.id !== id));
    if (coach) showToast(`${coach.name} was removed.`);
  }

  async function updateTimesheetStatus(id: string, status: TimesheetStatus) {
    try {
      const timesheetId = Number(id);
      if (status === "Approved") await reviewTimesheet(timesheetId, "APPROVE");
      if (status === "Rejected") await reviewTimesheet(timesheetId, "REJECT");
      if (status === "Paid") await markTimesheetPaid(timesheetId);
      await fetchAdminData();
      showToast(`${id} updated to ${status}.`);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Unable to update timesheet.");
    }
  }

  async function handleLogout() {
    try {
      await logoutUser();
      navigate("/");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Unable to log out.");
    }
  }

  if (authLoading || loading) {
    return <div className="admin admin__state">Loading admin dashboard...</div>;
  }

  if (!user || user.role !== "ADMIN") {
    navigate("/");
    return null;
  }

  if (loadError) {
    return <div className="admin admin__state admin__state--error">{loadError}</div>;
  }

  if (selectedTimesheet) {
    return (
      <div className="admin">
        <TimesheetDetailPage
          timesheet={selectedTimesheet}
          coach={selectedCoach}
          onBack={() => setSelectedTimesheetId(null)}
          onUpdateStatus={updateTimesheetStatus}
          onMarkPaid={() => updateTimesheetStatus(selectedTimesheet.id, "Paid")}
        />

        {toast && <div className="admin__toast">{toast}</div>}
      </div>
    );
  }

  return (
    <div className="admin">
      <aside className="admin__sidebar">
        <div className="admin__brand">
          <div className="admin__brand-mark">A</div>
          <div>
            <div className="admin__brand-name">Academy Admin</div>
            <div className="admin__brand-sub">Payroll console</div>
          </div>
        </div>

        <nav className="admin__nav" aria-label="Primary">
          <button
            type="button"
            className={`admin__nav-item ${view === "timesheets" ? "is-active" : ""}`}
            onClick={() => setView("timesheets")}
          >
            <span className="admin__nav-title">Timesheets</span>
            <span className="admin__nav-hint">Review &amp; pay</span>
          </button>
          <button
            type="button"
            className={`admin__nav-item ${view === "coaches" ? "is-active" : ""}`}
            onClick={() => setView("coaches")}
          >
            <span className="admin__nav-title">Coaches</span>
            <span className="admin__nav-hint">All accounts</span>
          </button>
          <button
            type="button"
            className={`admin__nav-item admin__nav-item--cta ${
              view === "create" ? "is-active" : ""
            }`}
            onClick={() => setView("create")}
          >
            <span className="admin__nav-title">Create coach</span>
            <span className="admin__nav-hint">Add an account</span>
          </button>
        </nav>

        <div className="admin__stats">
          <div className="admin__stat">
            {awaitingReview} awaiting review
          </div>
          <div className="admin__stat">
            {formatRand(approvedUnpaid)} approved, unpaid
          </div>
          <button type="button" className="admin__logout" onClick={handleLogout}>Log out</button>
        </div>
      </aside>

      <main className="admin__main">
        {view === "timesheets" && (
          <TimesheetsView
            timesheets={filteredTimesheets}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            onUpdateStatus={updateTimesheetStatus}
            onOpenTimesheet={setSelectedTimesheetId}
          />
        )}

        {view === "coaches" && (
          <CoachesView
            coaches={coaches}
            onDelete={handleDeleteCoach}
            onNewCoach={() => setView("create")}
          />
        )}

        {view === "create" && (
          <CreateCoachView
            form={coachForm}
            onChange={setCoachForm}
            onSubmit={handleCreateCoach}
            onCancel={handleCancelCreate}
            error={formError}
          />
        )}
      </main>

      {toast && <div className="admin__toast">{toast}</div>}
    </div>
  );
}

function TimesheetsView({
  timesheets,
  statusFilter,
  onStatusFilterChange,
  onUpdateStatus,
  onOpenTimesheet,
}: {
  timesheets: Timesheet[];
  statusFilter: StatusFilter;
  onStatusFilterChange: (f: StatusFilter) => void;
  onUpdateStatus: (id: string, status: TimesheetStatus) => void;
  onOpenTimesheet: (id: string) => void;
}) {
  return (
    <>
      <header className="admin__header">
        <div>
          <h1>Submitted timesheets</h1>
          <p className="admin__subtitle">
            Review, approve and mark coach timesheets as paid.
          </p>
        </div>
        <div className="admin__filters" role="tablist" aria-label="Filter by status">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter}
              type="button"
              role="tab"
              aria-selected={statusFilter === filter}
              className={`admin__filter ${statusFilter === filter ? "is-active" : ""}`}
              onClick={() => onStatusFilterChange(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </header>

      {timesheets.length === 0 ? (
        <div className="admin__empty">
          No timesheets match this filter.
        </div>
      ) : (
        <div className="admin__table-wrap">
          <table className="admin__table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Coach</th>
                <th>Period</th>
                <th>Hours</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {timesheets.map((t) => (
                <tr
                  key={t.id}
                  className="admin__row"
                  tabIndex={0}
                  role="button"
                  aria-label={`Open timesheet ${t.id}`}
                  onClick={() => onOpenTimesheet(t.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onOpenTimesheet(t.id);
                    }
                  }}
                >
                  <td className="admin__ref">{t.id}</td>
                  <td>{t.coachName}</td>
                  <td className="admin__muted">{t.period}</td>
                  <td className="admin__muted">{t.hours} h</td>
                  <td className="admin__total">{formatRand(calculateTimesheetTotal(t))}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <select
                      className={statusClass(t.status)}
                      value={t.status}
                      onChange={(e) =>
                        onUpdateStatus(t.id, e.target.value as TimesheetStatus)
                      }
                      aria-label={`Status for ${t.id}`}
                    >
                      {(["Pending", "Approved", "Paid", "Rejected"] as TimesheetStatus[]).map(
                        (s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        )
                      )}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function CoachesView({
  coaches,
  onDelete,
  onNewCoach,
}: {
  coaches: Coach[];
  onDelete: (id: string) => void;
  onNewCoach: () => void;
}) {
  return (
    <>
      <header className="admin__header">
        <div>
          <h1>Coaches</h1>
          <p className="admin__subtitle">
            {coaches.length} coach account{coaches.length === 1 ? "" : "s"}.
          </p>
        </div>
        <button type="button" className="admin__button admin__button--primary" onClick={onNewCoach}>
          + New coach
        </button>
      </header>

      {coaches.length === 0 ? (
        <div className="admin__empty">
          No coach accounts yet. Create one to get started.
        </div>
      ) : (
        <div className="admin__grid">
          {coaches.map((coach) => (
            <div className="admin__card" key={coach.id}>
              <div className="admin__card-head">
                <div>
                  <h2 className="admin__card-name">{coach.name}</h2>
                </div>
                <span
                  className={`badge ${coach.active ? "badge--active" : "badge--inactive"}`}
                >
                  {coach.active ? "Active" : "Inactive"}
                </span>
              </div>

              <dl className="admin__card-details">
                <div className="admin__detail-row">
                  <dt>Email</dt>
                  <dd>{coach.email}</dd>
                </div>
                <div className="admin__detail-row">
                  <dt>Phone</dt>
                  <dd>{coach.phone}</dd>
                </div>
                <div className="admin__detail-row">
                  <dt>Bank</dt>
                  <dd>{coach.bankName ?? "Not provided"}</dd>
                </div>
                <div className="admin__detail-row">
                  <dt>Account type</dt>
                  <dd>{coach.accountType ?? "Not provided"}</dd>
                </div>
                <div className="admin__detail-row">
                  <dt>Account number</dt>
                  <dd>{coach.accountNumber ?? "Not provided"}</dd>
                </div>
                <div className="admin__detail-row">
                  <dt>Joined</dt>
                  <dd>{coach.joined}</dd>
                </div>
              </dl>

              <button
                type="button"
                className="admin__button admin__button--danger-outline"
                onClick={() => onDelete(coach.id)}
              >
                Delete coach
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function TimesheetDetailPage({
  timesheet,
  coach,
  onBack,
  onUpdateStatus,
  onMarkPaid,
}: {
  timesheet: Timesheet;
  coach: Coach | null;
  onBack: () => void;
  onUpdateStatus: (id: string, status: TimesheetStatus) => void;
  onMarkPaid: () => void;
}) {
  const totalDue = calculateTimesheetTotal(timesheet);

  return (
    <div className="admin__detail-page">
      <button
        type="button"
        className="admin__detail-back"
        onClick={onBack}
      >
        ← Back to all timesheets
      </button>

      <div className="admin__detail-card">
        <div className="admin__detail-card-header">
          <div>
            <div className="admin__detail-id-row">
              <h1>{timesheet.id}</h1>
              <span className={statusClass(timesheet.status)}>
                {statusLabel(timesheet.status)}
              </span>
            </div>
            <p className="admin__detail-meta">
              {timesheet.coachName} · {coach?.email ?? "Coach details unavailable"} · {timesheet.period} · submitted{" "}
              {timesheet.submitted}
            </p>
          </div>

          <div className="admin__detail-total">
            <span className="admin__detail-total-label">Total due</span>
            <div className="admin__detail-total-amount">
              {formatRand(totalDue)}
            </div>
            <span className="admin__detail-total-hours">
              {timesheet.hours} hours
            </span>
          </div>
        </div>

        <div className="admin__detail-table-wrap">
          <table className="admin__detail-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Activities</th>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {timesheet.entries.map((entry, i) => {
                
                const amount = Math.round(entry.amount);
                return (
                  <tr key={`${timesheet.id}-${i}`}>
                    <td className="admin__muted">{entry.date}</td>
                    <td>
                      <div className="admin__detail-session">{entry.decription}</div>
                      {entry.subNote && (
                        <div className="admin__detail-subnote">{entry.subNote}</div>
                      )}
                    </td>
                    <td className="admin__muted">{entry.decription} </td>
                    
                    <td className="admin__total">{formatRand(amount)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {timesheet.status === "Pending" && (
          <div className="admin__detail-actions">
            <button
              type="button"
              className="admin__button admin__button--approve"
              onClick={() => onUpdateStatus(timesheet.id, "Approved")}
            >
              Approve timesheet
            </button>
            <button
              type="button"
              className="admin__button admin__button--danger-outline"
              onClick={() => onUpdateStatus(timesheet.id, "Rejected")}
            >
              Reject
            </button>
          </div>
        )}

        {timesheet.status === "Approved" && (
          <div className="admin__detail-actions">
            <button
              type="button"
              className="admin__button admin__button--approve"
              onClick={onMarkPaid}
            >
              Mark as paid
            </button>
          </div>
        )}

        {timesheet.reviewNote && (
          <div className="admin__detail-note">
            <strong>Review note:</strong> {timesheet.reviewNote}
          </div>
        )}
      </div>
    </div>
  );
}

function CreateCoachView({
  form,
  onChange,
  onSubmit,
  onCancel,
  error,
}: {
  form: typeof EMPTY_COACH_FORM;
  onChange: (form: typeof EMPTY_COACH_FORM) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
  error: string | null;
}) {
  return (
    <>
      <header className="admin__header admin__header--stacked">
        <h1>Create coach</h1>
        <p className="admin__subtitle">
          Add a new coach account so they can submit timesheets.
        </p>
      </header>

      <form className="admin__form" onSubmit={onSubmit} noValidate>
        {error && <div className="admin__form-error">{error}</div>}

        <div className="admin__form-grid">
          <label className="admin__field">
            <span>Full name</span>
            <input
              type="text"
              placeholder="Jane Doe"
              value={form.name}
              onChange={(e) => onChange({ ...form, name: e.target.value })}
            />
          </label>

          <label className="admin__field">
            <span>Email</span>
            <input
              type="email"
              placeholder="jane@academy.co.za"
              value={form.email}
              onChange={(e) => onChange({ ...form, email: e.target.value })}
            />
          </label>

          <label className="admin__field">
            <span>Phone</span>
            <input
              type="tel"
              placeholder="+27 82 000 0000"
              value={form.phone}
              onChange={(e) => onChange({ ...form, phone: e.target.value })}
            />
          </label>

          <label className="admin__field admin__field--checkbox">
            <input
              type="checkbox"
              checked={form.activeImmediately}
              onChange={(e) =>
                onChange({ ...form, activeImmediately: e.target.checked })
              }
            />
            <span>Active immediately</span>
          </label>
        </div>

        <div className="admin__form-actions">
          <button type="submit" className="admin__button admin__button--primary">
            Create coach
          </button>
          <button type="button" className="admin__button admin__button--ghost" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </>
  );
}

interface ApiTimesheet {
  id: number;
  userId: number;
  periodMonth: string;
  submittedDate: string | null;
  stage: "STAGING" | "SUBMITTED" | "APPROVED";
  adminMessage: string | null;
  paid: boolean;
  timesheetEntry: Array<{
    id: number;
    date: string;
    activityType: string;
    description: string | null;
    amount: number | string;
  }>;
  user: { id: number; name: string; email: string };
}

interface ApiCoach {
  id: number;
  name: string;
  email: string;
  bankName?: string;
  accountType?: string;
  accountNumber?: string;
}

function adaptTimesheet(timesheet: ApiTimesheet): Timesheet {
  const status: TimesheetStatus = timesheet.paid
    ? "Paid"
    : timesheet.stage === "APPROVED"
      ? "Approved"
      : timesheet.stage === "SUBMITTED"
        ? "Pending"
          : timesheet.adminMessage
            ? "Rejected"
            : "Pending";

  return {
    id: String(timesheet.id),
    coachName: timesheet.user.name,
    period: new Date(timesheet.periodMonth).toLocaleDateString("en-ZA", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    submitted: timesheet.submittedDate?.slice(0, 10) ?? "Not submitted",
    hours: timesheet.timesheetEntry.length,
    status,
    reviewNote: timesheet.adminMessage ?? undefined,
    submittedForReview: timesheet.stage === "SUBMITTED",
    entries: timesheet.timesheetEntry.map((entry) => ({
      date: entry.date.slice(0, 10),
      activities: entry.activityType,
      decription: entry.description ?? "No description",
      amount: Number(entry.amount),
    })),
  };
}