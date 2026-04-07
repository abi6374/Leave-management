import { useCallback, useEffect, useState } from 'react';
import { leaveAPI } from '../services/api';

export const useLeaves = (mode = 'my') => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLeaves = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      let response;
      if (mode === 'pending') response = await leaveAPI.getPendingLeaves();
      else if (mode === 'all') response = await leaveAPI.getAllLeaves();
      else response = await leaveAPI.getMyLeaves();

      setLeaves(response.data.leaves || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch leaves');
    } finally {
      setLoading(false);
    }
  }, [mode]);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  return {
    leaves,
    loading,
    error,
    refreshLeaves: fetchLeaves,
    setLeaves,
  };
};
