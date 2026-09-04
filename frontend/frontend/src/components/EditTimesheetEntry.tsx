import { useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { editEntry } from '../lib/api';
import '../styles/editTimesheetEntry.css';

type TimesheetEntry = {
    date: string;
    description: string | null;
    id: number;
    timesheetId: number;
};

interface EditTimesheetEntryProps {
    entry: TimesheetEntry;
    onSaved: () => void;
    onBack: () => void;
}

function EditTimesheetEntry({ entry, onSaved, onBack }: EditTimesheetEntryProps) {
    const [date, setDate] = useState(entry.date.slice(0, 10));
    const [description, setDescription] = useState(entry.description ?? '');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSaving(true);
        setError('');

        try {
            await editEntry(entry.timesheetId, entry.id, date, description);
            onSaved();
        } catch (editError) {
            setError(editError instanceof Error ? editError.message : 'Unable to update entry');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="editEntryFormContainer">
            <form onSubmit={handleSubmit}>
                <div className="editEntryHeading">
                    <div>
                        <p className="editEntryEyebrow">Timesheet entry</p>
                        <h2>Edit entry</h2>
                    </div>
                    <button className="editEntryBackBtn" type="button" onClick={onBack}>
                        <ArrowLeft /> Back
                    </button>
                </div>

                <label htmlFor="editEntryDate">Date</label>
                <input
                    id="editEntryDate"
                    type="date"
                    value={date}
                    onChange={(event) => setDate(event.target.value)}
                    required
                />

                <label htmlFor="editEntryDescription">Description</label>
                <textarea
                    id="editEntryDescription"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                />

                {error && <p className="editEntryError" role="alert">{error}</p>}

                <button className="saveEntryBtn" type="submit" disabled={saving}>
                    <Save /> {saving ? 'Saving...' : 'Save changes'}
                </button>
            </form>
        </div>
    );
}

export default EditTimesheetEntry;
