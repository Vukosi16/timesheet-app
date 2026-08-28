import { useState, useEffect } from 'react';
import { useAuth } from '../context/authContext';
import { getCoachTimesheets } from '../lib/api';
import '../styles/coachDashboardPage.css'
import { LogOut, Pencil, Trash, Plus, Send, FilePlus, TableOfContents   } from 'lucide-react';



function CoachDashboardPage() {
    const { user, loading } = useAuth();

    interface Timesheet {
        userId: number;
        id: number;
        createdDate: string;
        submittedDate: string | null;
        periodMonth: string;
        stage: 'STAGING' | 'SUBMITTED' | 'APPROVED';
        adminMessage: string | null;
        paid: boolean;
    }

    interface TimesheetEntries {

    }

    const [timesheets, setTimesheets] = useState<Timesheet[] | null>(null);

    useEffect(() => {
        async function fetchTimesheets() {
             try {
                const result = await getCoachTimesheets();      
                
                if (result){
                    setTimesheets(result.timesheets)
                }
            } catch (error) {
                console.error(error)    
            }
        }

        fetchTimesheets()
    }, []); 



    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        <p>Cant view this. You need to log in</p>
        
    }else if (user.role !== 'COACH') {
        <p>Cant view this. You need to log in</p>
    }

    const currentTimesheet = timesheets?.find((ts) => ts.stage === 'STAGING')
    
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
                        <button className="logOutBtn">
                            <LogOut/> Log Out
                        </button>
                    </div>
                    
                </div>

                
                <div className="stagedTimesheetContainer">
                    
                    <div className="timesheetContainer">
                        
                        <div className="timesheetInfoContainer">
                            
                            <div className="timesheetInfoTextContainer">
                                <p className='timesheetHeadingText'>Current timesheet</p>
                                <h3 className="timesheetPeriodMonth">July 2026</h3>
                            </div>

                            <div className="timesheetStageContainer">
                                <p className="stageText">Staging</p>
                            </div>
                        
                        </div>

                        <div className="timesheetDataContainer">
                            <div className="earningsData">
                                <p className='earningsText'>Total Earnings</p>
                                <p className="earningsAmount">R2000</p>
                            </div>

                            <div className="EntriesData">
                                 <p className='entriesText'>Entries Logged</p>
                                <p className="entriesAmount">8</p>
                            </div>
                        </div>

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
                                    <tr>
                                        <td><strong>2 Jul</strong></td>
                                        <td><strong>Training</strong></td>
                                        <td>u/15 and u/17 Goalkeepers</td>
                                        <td>R250</td>
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
                                    <tr>
                                        <td><strong>2 Jul</strong></td>
                                        <td><strong>Training</strong></td>
                                        <td>u/15 and u/17 Goalkeepers</td>
                                        <td>R250</td>
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
                                    <tr>
                                        <td><strong>2 Jul</strong></td>
                                        <td><strong>Training</strong></td>
                                        <td>u/15 and u/17 Goalkeepers</td>
                                        <td>R250</td>
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
                                </tbody>
                            </table>
                        </div>

                        <div className="timeesheetOps">
                            <button className="addEntryBtn">
                                <Plus/> Add Entry
                            </button>
                            <button className="submitTimesheetBtn">
                                <Send/> Submit timesheet
                            </button>
                        </div>


                    

                    
                    </div>
                </div>

                <div className="timesheetViewandcreation">
                    <button className="createTimesheetBtn">
                        <FilePlus/> Create new timesheet
                    </button>
                    <button className="viewTimesheetsBtn">
                        <TableOfContents/> View all Timesheets
                    </button>
                </div>

            </div>
            



            {/* {currentTimesheet ? (
                <div key={currentTimesheet.id}>
                    <ul>
                        <li>{currentTimesheet.id}</li>
                        <li>{new Date(currentTimesheet.periodMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}</li>
                        <li>{currentTimesheet.stage}</li>
                        <li>Earnings</li>
                        <li>Add Entry button</li>
                        {currentTimesheet.adminMessage && <li>{currentTimesheet.adminMessage}</li>}
                    </ul>

                </div>
            ) : (
                <p>No timesheet in  progress. Create one.</p>
            )} */}
        
        </>
    );
}

export default CoachDashboardPage;