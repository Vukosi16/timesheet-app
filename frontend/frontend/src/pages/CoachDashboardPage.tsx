import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/authContext';
import { createTimesheet, getCoachTimesheets, submitTimesheet, createEntry } from '../lib/api';
import '../styles/coachDashboardPage.css'
import { LogOut, Pencil, Trash, Plus, Send, FilePlus, TableOfContents } from 'lucide-react';
import ViewAllTimesheets from '../components/ViewAllTimesheets';
import EditTimesheetEntry from '../components/EditTimesheetEntry';
import DeleteTimesheetEntry from '../components/DeleteTimesheetEntry';



function CoachDashboardPage() {
    const { user, loading, logout } = useAuth();
    const navigate = useNavigate();

    type ActivityType = 'TRAINING' | 'MATCH' | 'REF_KIDS' | 'REF_ADULT' | 'MISC';

    interface Timesheet {
        userId: number;
        id: number;
        createdDate: string;
        submittedDate: string | null;
        periodMonth: string;
        stage: 'STAGING' | 'SUBMITTED' | 'APPROVED';
        adminMessage: string | null;
        paid: boolean;
        timesheetEntry: TimesheetEntries[];
    }

    interface TimesheetEntries {
        date: string;
        activityType: ActivityType;
        description: string | null;
        amount: number | string;
        id: number;
        timesheetId: number;
    }

    const [timesheets, setTimesheets] = useState<Timesheet[] | null>(null);
    const [createTimesheetToggle, setcreateTimesheetToggle] = useState<boolean>(false);
    const [viewAllTimesheets, setViewAllTimesheets] = useState<boolean>(false);
    const [editingEntry, setEditingEntry] = useState<TimesheetEntries | null>(null);
    const [deletingEntry, setDeletingEntry] = useState<TimesheetEntries | null>(null);
    const currentYear = new Date().getFullYear();
    const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
    const [selectedMonth, setSelectedMonth] = useState(`${currentYear}-${currentMonth}`);
    const [addEntryToggle, setaddEntryToggle] = useState<boolean>(false);
    const [entryDate, setentryDate] = useState<string>('');
    const [selectedValue, setSelectedValue] = useState<ActivityType>('TRAINING');
    const [entryDesc, setentryDesc] = useState<string>('');
    const [miscAmount, setmiscAmount] = useState<number>();

    const fetchTimesheets = async function () {
        try {
            const result = await getCoachTimesheets();

            if (result) {
                setTimesheets(result.timesheets)
            }
        } catch (error) {
            console.error(error)
        }
    }
    useEffect(() => {
        fetchTimesheets()
    }, []);



    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        navigate('/');

    } else if (user.role !== 'COACH') {
        navigate('/');
    }

    const handleLogout = async () => {
        try {
            await logout()
            navigate('/');
        } catch (error) {
            console.error("Issue logging out")
        }
    }

    const handleSubmit = async (timesheetId: number) => {
        try {
            await submitTimesheet(timesheetId);
            await fetchTimesheets();
            alert("submitted!");
        } catch (error) {
            alert("Cannot submit an empty timesheet")
            console.log(error)
        }
    }

    const handleCreateTimesheet = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            await createTimesheet(`${selectedMonth}-01`);
            await fetchTimesheets();
            setcreateTimesheetToggle(false);
        } catch (error) {
            console.error(error);
        }
    };

    const handleAddEntry = () => {
        setaddEntryToggle(true);
    };

    const handleEditEntry = (entry: TimesheetEntries) => {
        setEditingEntry(entry);
    };

    const handleDeleteEntry = (entry: TimesheetEntries) => {
        setDeletingEntry(entry);
    };

    const handleCreateEntry = async (event: React.FormEvent<HTMLFormElement>, timesheedId: number,date: string, activityType: ActivityType, description: string, amount?: number  ) => {
        event.preventDefault();

        try {
            await createEntry(timesheedId, date, activityType, description, amount)
            await fetchTimesheets()
            alert("Timesheet entry added")
            setaddEntryToggle(false)
            setentryDate('')
            setSelectedValue('TRAINING')
            setentryDesc('')
            setmiscAmount(undefined)
        } catch (error) {
            alert("Error in adding timesheet "+ error)
        }
    }

    const handleValueChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedValue(e.target.value as ActivityType)
    }

    const currentTimesheet = timesheets?.find((ts) => ts.stage === 'STAGING');
    const currentTimesheetEntries = currentTimesheet?.timesheetEntry;
    const totalEarnings = currentTimesheetEntries?.reduce(
        (total, entry) => total + Number(entry.amount),
        0
    ) ?? 0;


    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })

    return (
        <>
            <div className={`pageContainer ${viewAllTimesheets ? 'pageContainer--history' : ''}`}>

                <div className="welcomeHeadingContainer">

                    <div className="headingTextContainer">
                        <h1 className="welcomeHeadingText">
                            Welcome, Coach {user?.name}
                        </h1>
                        <h4 className='WelcomeHeadingDate'>
                            {formattedDate}
                        </h4>
                    </div>

                    <div className="logOutBtnContainer">
                        <button className="logOutBtn" onClick={handleLogout}>
                            <LogOut /> Log Out
                        </button>
                    </div>

                </div>

                {viewAllTimesheets ? (
                    <ViewAllTimesheets timesheets={timesheets} onBack={() => setViewAllTimesheets(false)} />
                ) : editingEntry ? (
                    <EditTimesheetEntry
                        entry={editingEntry}
                        onBack={() => setEditingEntry(null)}
                        onSaved={async () => {
                            await fetchTimesheets();
                            setEditingEntry(null);
                        }}
                    />
                ) : deletingEntry ? (
                    <DeleteTimesheetEntry
                        entry={deletingEntry}
                        onBack={() => setDeletingEntry(null)}
                        onDeleted={async () => {
                            await fetchTimesheets();
                            setDeletingEntry(null);
                        }}
                    />
                ) : <>
                {currentTimesheet && !addEntryToggle ? (
                    <div className="stagedTimesheetContainer" key={currentTimesheet.id}>

                        <div className="timesheetContainer">

                            <div className="timesheetInfoContainer">

                                <div className="timesheetInfoTextContainer">
                                    <p className='timesheetHeadingText'>Current timesheet</p>
                                    <h3 className="timesheetPeriodMonth">
                                        {new Date(currentTimesheet.periodMonth).toLocaleDateString('en-US', {
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </h3>
                                </div>

                                <div className="timesheetStageContainer">
                                    <p className="stageText">{currentTimesheet.stage}</p>
                                </div>

                            </div>

                            <div className="timesheetDataContainer">
                                <div className="earningsData">
                                    <p className='earningsText'>Total Earnings</p>
                                    <p className="earningsAmount">R{totalEarnings}</p>
                                </div>

                                <div className="EntriesData">
                                    <p className='entriesText'>Entries Logged</p>
                                    <p className="entriesAmount">{currentTimesheetEntries?.length ?? 0}</p>
                                </div>
                            </div>

                            {currentTimesheetEntries ? (
                                <div className="entriesContainer">

                                    <table className="entriesTable">
                                        <thead>
                                            <tr>
                                                <th>Date</th>
                                                <th>Activity</th>
                                                <th>Description</th>
                                                <th>Amount</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentTimesheetEntries.slice(-3).map((entry) => {
                                                return (
                                                    <tr key={entry.id}>
                                                        <td><strong>{new Date(entry.date).toLocaleString('en-GB', { day: 'numeric', month: 'long' })}</strong></td>
                                                        <td><strong>{entry.activityType}</strong></td>
                                                        <td>{entry.description}</td>
                                                        <td>R{entry.amount}</td>
                                                        <td>
                                                            <button type="button" onClick={() => handleEditEntry(entry)}>
                                                                <Pencil />
                                                            </button>
                                                        </td>
                                                        <td>
                                                            <button type="button" onClick={() => handleDeleteEntry(entry)}>
                                                                <Trash />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                )

                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ) :
                                <p>No entries</p>
                            }


                            <div className="timeesheetOps">
                                <button className="addEntryBtn"
                                    onClick={handleAddEntry}
                                >
                                    <Plus /> Add Entry
                                </button>
                                <button className="submitTimesheetBtn" onClick={() => handleSubmit(currentTimesheet.id)}>
                                    <Send /> Submit timesheet
                                </button>
                            </div>

                        </div>


                    </div>
                ) : !currentTimesheet && !createTimesheetToggle && !addEntryToggle ?
                    <div className="noTimesheetContainer">
                        <h1 className="noTimesheetHeading">
                            No Timesheet currently in staging
                        </h1>
                        <p className="noTimesheetText">
                            Create a new timesheet for the month to add it to staging.
                        </p>
                    </div>
                    : null}

                {createTimesheetToggle &&
                    <>
                        <div className="createTimesheetFormContainer">
                            <form onSubmit={handleCreateTimesheet}>
                                <label htmlFor="timesheetMonth">Timesheet month</label>
                                <input
                                    id="timesheetMonth"
                                    type="month"
                                    value={selectedMonth}
                                    min={`${currentYear}-01`}
                                    max={`${currentYear}-12`}
                                    onChange={(event) => setSelectedMonth(event.target.value)}
                                    required
                                />
                                <button type="submit">Create timesheet</button>
                                <button type="submit" onClick={() => setcreateTimesheetToggle(false)}>Back</button>
                            </form>
                        </div>
                    </>


                }

                {addEntryToggle && currentTimesheet &&
                    <div className="addEntryFormContainer">
                        <form onSubmit={(event) => handleCreateEntry(event, currentTimesheet.id, entryDate, selectedValue, entryDesc, miscAmount)}>
                            <label htmlFor="entryDate">Date</label>
                            <input
                                id="entryDate"
                                type="date"
                                value={entryDate}
                                onChange={(event) => setentryDate(event.target.value)}
                                required
                            />

                            <label htmlFor="activityType">Activity type</label>
                            <select id="activityType" value={selectedValue} onChange={handleValueChange} required>
                                <option value="TRAINING">Training</option>
                                <option value="MATCH">Match</option>
                                <option value="REF_KIDS">Ref Kids</option>
                                <option value="REF_ADULT">Ref Adult</option>
                                <option value="MISC">Misc</option>
                            </select>

                            <label htmlFor="entryDescription">Description</label>
                            <textarea id="entryDescription"
                                value={entryDesc}
                                onChange={(event) => setentryDesc(event.target.value)}
                            />

                            {selectedValue === 'MISC' && 
                            <>
                                <label htmlFor="amount">Amount</label>
                                <input type="number" id="amount" 
                                    value={miscAmount}
                                    onChange={(event) => setmiscAmount(Number(event.target.value))}
                                    required
                                />
                            </>
                            
                            }

                            <div className="entryFormButtons">
                                <button type="submit">Add entry</button>
                                <button
                                    type="button"
                                    onClick={() => setaddEntryToggle(false)}
                                >
                                    Back
                                </button>
                            </div>
                        </form>
                    </div>
                }




                {!viewAllTimesheets && <div className="timesheetViewandcreation">
                    <button className="createTimesheetBtn"
                        onClick={() => setcreateTimesheetToggle(true)}
                    >
                        <FilePlus /> &nbsp; Create new timesheet
                    </button>
                    <button className="viewTimesheetsBtn" onClick={() => setViewAllTimesheets(true)}>
                        <TableOfContents /> &nbsp; View all Timesheets
                    </button>
                </div>}
                </>}

            </div>

        </>
    );
}

export default CoachDashboardPage;