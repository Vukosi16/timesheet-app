import { useState } from 'react';
import { ArrowLeft, Trash } from 'lucide-react';
import { deleteEntry } from '../lib/api';
import '../styles/deleteTimesheetEntry.css';

type TimesheetEntry = {
    id: number;
    timesheetId: number;
    description: string | null;
};

interface DeleteTimesheetEntryProps {
    entry: TimesheetEntry;
    onDeleted: () => void;
    onBack: () => void;
}

function DeleteTimesheetEntry({ entry, onDeleted, onBack }: DeleteTimesheetEntryProps) {
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState('');

    const handleDelete = async () => {
        setDeleting(true);
        setError('');

        try {
            await deleteEntry(entry.timesheetId, entry.id);
            onDeleted();
        } catch (deleteError) {
            setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete entry');
            setDeleting(false);
        }
    };

    return (
        <div className="deleteEntryContainer">
            <div className="deleteEntryPanel">
                <p className="deleteEntryEyebrow">Timesheet entry</p>
                <h2>Delete entry?</h2>
                <p className="deleteEntryMessage">
                    This will permanently remove {entry.description ? `“${entry.description}”` : 'this entry'} from the timesheet.
                </p>

                {error && <p className="deleteEntryError" role="alert">{error}</p>}

                <div className="deleteEntryActions">
                    <button className="deleteEntryBackBtn" type="button" onClick={onBack} disabled={deleting}>
                        <ArrowLeft /> Keep entry
                    </button>
                    <button className="confirmDeleteBtn" type="button" onClick={handleDelete} disabled={deleting}>
                        <Trash /> {deleting ? 'Deleting...' : 'Delete entry'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DeleteTimesheetEntry;
