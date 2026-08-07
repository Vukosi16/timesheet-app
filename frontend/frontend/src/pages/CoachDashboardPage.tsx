import { useAuth } from '../context/authContext';

function CoachDashboardPage() {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return <div>You must be logged in to view this page.</div>;
    }else if (user.role !== 'COACH') {
        return <div>You are not authorized to view this page.</div>;
    }

    return <h1>coach dashboard</h1>;
}

export default CoachDashboardPage;