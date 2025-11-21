import { useState, useEffect } from 'react';
import { apiFetch } from '../../../lib/api-client';
import { DashboardWeb } from '../layout/DashboardLayout';

interface UseProjectsResult {
    projects: DashboardWeb[];
    loading: boolean;
    error: string | null;
}

export const useProjects = (): UseProjectsResult => {
    const [projects, setProjects] = useState<DashboardWeb[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const data = await apiFetch<DashboardWeb[]>('/webs');
                // Ensure data is an array, handle potential API response variations
                const projectList = Array.isArray(data) ? data : [];
                setProjects(projectList);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch projects');
                console.error('Error fetching projects:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    return { projects, loading, error };
};
