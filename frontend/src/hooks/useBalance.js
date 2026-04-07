import { useCallback, useEffect, useState } from 'react';
import { balanceAPI } from '../services/api';

export const useBalance = (year) => {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBalance = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await balanceAPI.getMyBalance(year);
      setBalance(response.data.balance || null);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch leave balance');
    } finally {
      setLoading(false);
    }
  }, [year]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return { balance, loading, error, refreshBalance: fetchBalance };
};
