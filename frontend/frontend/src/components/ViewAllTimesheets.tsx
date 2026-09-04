import { ArrowLeft, Eye } from 'lucide-react';
import '../styles/viewAllTimesheets.css';

type ActivityType = 'TRAINING' | 'MATCH' | 'REF_KIDS' | 'REF_ADULT' | 'MISC';

interface TimesheetEntry {
    date: string;
    activityType: ActivityType;
    description: string | null;
    amount: number | string;
    id: number;
    timesheetId: number;
}

interface Timesheet {
    userId: number;
    id: number;
    createdDate: string;
    submittedDate: string | null;
    periodMonth: string;
    stage: 'STAGING' | 'SUBMITTED' | 'APPROVED';
    adminMessage: string | null;
    paid: boolean;
    timesheetEntry: TimesheetEntry[];
}

interface ViewAllTimesheetsProps {
    timesheets: Timesheet[] | null;
    onBack: () => void;
}

function ViewAllTimesheets({
    timesheets,
    onBack,
}: ViewAllTimesheetsProps) {
    const allTimesheets = timesheets ?? [];
    const awaitingReview = allTimesheets.filter((timesheet) => timesheet.stage === 'SUBMITTED').length;
    const paidTimesheets = allTimesheets.filter((timesheet) => timesheet.paid).length;

    return (
        <section className="allTimesheetsContainer">
            <div className="allTimesheetsHeader">
                <div>
                    <p className="allTimesheetsEyebrow">Timesheet history</p>
                    <h2>All timesheets</h2>
                    <p className="allTimesheetsIntro">Review your submitted and previously approved timesheets.</p>
                </div>
                <button className="allTimesheetsBackBtn" type="button" onClick={onBack}>
                    <ArrowLeft /> Back to dashboard
                </button>
            </div>

            <div className="timesheetSummaryGrid" aria-label="Timesheet summary">
                <div className="timesheetSummaryItem">
                    <span>Total timesheets</span>
                    <strong>{allTimesheets.length}</strong>
                </div>
                <div className="timesheetSummaryItem">
                    <span>Awaiting review</span>
                    <strong>{awaitingReview}</strong>
                </div>
                <div className="timesheetSummaryItem">
                    <span>Paid timesheets</span>
                    <strong>{paidTimesheets}</strong>
                </div>
            </div>

            <div className="allTimesheetsTableContainer">
                <table className="allTimesheetsTable">
                    <thead>
                        <tr>
                            <th>Timesheet month</th>
                            <th>Status</th>
                            <th>Entries</th>
                            <th>Total earnings</th>
                            <th aria-label="Actions"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {allTimesheets.map((timesheet) => {
                            const totalEarnings = timesheet.timesheetEntry.reduce(
                                (total, entry) => total + Number(entry.amount),
                                0
                            );

                            return (
                                <tr key={timesheet.id}>
                                    <td>
                                        <strong>
                                            {new Date(timesheet.periodMonth).toLocaleDateString('en-US', {
                                                month: 'long',
                                                year: 'numeric',
                                            })}
                                        </strong>
                                    </td>
                                    <td>
                                        <span className={`timesheetStatus ${timesheet.stage.toLowerCase()}`}>
                                            {timesheet.stage}
                                        </span>
                                    </td>
                                    <td>{timesheet.timesheetEntry.length}</td>
                                    <td>R{totalEarnings}</td>
                                    <td>
                                        <button className="viewTimesheetBtn" type="button">
                                            <Eye /> View
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        {allTimesheets.length === 0 && (
                            <tr>
                                <td colSpan={5}>No timesheets found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

export default ViewAllTimesheets;