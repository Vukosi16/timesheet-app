import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/authContext';
import { getCoachTimesheets, submitTimesheet } from '../lib/api';
import '../styles/coachDashboardPage.css'
import { LogOut, Pencil, Trash, Plus, Send, FilePlus, TableOfContents   } from 'lucide-react';



function CoachDashboardPage() {
    const { user, loading, logout } = useAuth();
    const navigate = useNavigate();

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
        activityType:'TRAINING'| 'MATCH'| 'REF_KIDS' | 'REF_ADULT';
        description: string | null;
        amount: number | string;
        id: number;
        timesheetId: number;
    }

    const [timesheets, setTimesheets] = useState<Timesheet[] | null>(null);

    const fetchTimesheets = async function () {
             try {
                const result = await getCoachTimesheets();      
                
                if (result){
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
        
    }else if (user.role !== 'COACH') {
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
            console.log(error)
        }
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
 


    return(
        <>
            <div className="pageContainer">
                
                <div className="welcomeHeadingContainer">
                    
                    <div className="headingTextContainer">
                        <h1 className="welcomeHeadingText">
                            Welcome, Coach {user?.name}  
                        </h1>
                        <h4 className='WelcomeHeadingDate'>
                            { formattedDate}
                        </h4>
                    </div>

                    <div className="logOutBtnContainer">
                        <button className="logOutBtn" onClick={handleLogout}>
                            <LogOut/> Log Out
                        </button>
                    </div>
                    
                </div>

                {currentTimesheet ? (
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
                                    { currentTimesheetEntries.slice(-3).reverse().map( (entry) => {
                                        return(
                                            <tr key={entry.id}>
                                                <td><strong>{new Date(entry.date).toLocaleString('en-GB', { day: 'numeric', month: 'long'})}</strong></td>
                                                <td><strong>{entry.activityType}</strong></td>
                                                <td>{entry.description}</td>
                                                <td>R{entry.amount}</td>
                                                <td> 
                                                    <button>
                                                        <Pencil/>
                                                    </button>  
                                                </td>
                                                <td> 
                                                    <button>
                                                        <Trash/>
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
                            <button className="addEntryBtn">
                                <Plus/> Add Entry
                            </button>
                            <button className="submitTimesheetBtn" onClick={() => handleSubmit(currentTimesheet.id)}>
                                <Send/> Submit timesheet
                            </button>
                        </div>


                    

                    
                    </div>
                </div>
                ) : 
                    <div className="noTimesheetContainer">
                        <h1 className="noTimesheetHeading">
                            No Timesheet currently in staging
                        </h1>
                        <p className="noTimesheetText">
                            Create a new timesheet for the month to add it to staging.
                        </p>
                    </div>
                }


                <div className="timesheetViewandcreation">
                    <button className="createTimesheetBtn">
                        <FilePlus/> &nbsp; Create new timesheet
                    </button>
                    <button className="viewTimesheetsBtn">
                        <TableOfContents/> &nbsp; View all Timesheets
                    </button>
                </div>

            </div>
        
        </>
    );
}

export default CoachDashboardPage;