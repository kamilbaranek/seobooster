import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../../../lib/api-client';
import { DashboardWeb } from '../layout/DashboardLayout';

interface UseProjectsResult {
    projects: DashboardWeb[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export const useProjects = (): UseProjectsResult => {
    const [projects, setProjects] = useState<DashboardWeb[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProjects = useCallback(async () => {
        setLoading(true);
        try {
            const data = await apiFetch<DashboardWeb[]>('/webs', { cache: 'no-store' });
            // Ensure data is an array, handle potential API response variations
            const projectList = Array.isArray(data) ? data : [];
            setProjects(projectList);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch projects');
            console.error('Error fetching projects:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProjects();
    }, []);

    return { projects, loading, error, refetch: fetchProjects };
};
