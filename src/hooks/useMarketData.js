import { useEffect, useState } from 'react';
import { updateAssetsInDB } from '../services/marketService.js';

// Global state to prevent multiple sync loops
let isSyncingGlobally = false;

/**
 * Helper to determine if a stock is stale based on Market Open (09:30 EST) and Close (16:00 EST)
 */
const isStockStale = (lastPriceAt) => {
  if (!lastPriceAt) return true;
  
  const now = new Date();
  const lastUpdate = new Date(lastPriceAt);
  
  // Simple check for 12 hours fallback
  if (now.getTime() - lastUpdate.getTime() > 12 * 60 * 60 * 1000) return true;

  try {
    // Get current time in EST
    const estFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false
    });
    
    const estNowParts = estFormatter.formatToParts(now);
    const estHour = parseInt(estNowParts.find(p => p.type === 'hour').value);
    const estMinute = parseInt(estNowParts.find(p => p.type === 'minute').value);
    
    const lastUpdateParts = estFormatter.formatToParts(lastUpdate);
    const lastHour = parseInt(lastUpdateParts.find(p => p.type === 'hour').value);
    
    const currentEstMinutes = estHour * 60 + estMinute;
    const lastEstMinutes = lastHour * 60; // Approximate

    // Milestone 1: 09:30 EST (Market Open)
    const openMinutes = 9 * 60 + 30;
    if (currentEstMinutes >= openMinutes && lastEstMinutes < openMinutes) return true;

    // Milestone 2: 16:00 EST (Market Close)
    const closeMinutes = 16 * 60;
    if (currentEstMinutes >= closeMinutes && lastEstMinutes < closeMinutes) return true;

  } catch (e) {
    // Fallback to time-based if Intl fails
    return (now.getTime() - lastUpdate.getTime()) > 6 * 60 * 60 * 1000;
  }

  return false;
};

/**
 * useMarketData
 * Optimized Strategy: Refresh based on asset type schedules.
 * - Crypto/Currency: 6 hours
 * - Stocks: Market Open/Close
 */
export const useMarketData = (assets = []) => {
  const [syncStatus, setSyncStatus] = useState('idle');
  const [lastSyncTime, setLastSyncTime] = useState(null);

  useEffect(() => {
    if (!assets || assets.length === 0 || isSyncingGlobally) return;

    let isSubscribed = true;
    
    const startBackgroundSync = async () => {
      isSyncingGlobally = true;
      setSyncStatus('syncing');
      
      try {
        const now = Date.now();
        const SIX_HOURS = 6 * 60 * 60 * 1000;

        const staleAssets = assets.filter(a => {
          if (a.type === 'Stock') {
            return isStockStale(a.last_price_at);
          } else {
            // Crypto or Currency
            const lastUpdate = a.last_price_at ? new Date(a.last_price_at).getTime() : 0;
            return (now - lastUpdate) > SIX_HOURS;
          }
        });

        if (staleAssets.length === 0) {
          setSyncStatus('complete');
          setLastSyncTime(new Date());
          isSyncingGlobally = false;
          return;
        }

        // Process Sync (Edge Function handles batching)
        // We can handle larger chunks now because Edge Function is fast
        const syncChunk = staleAssets.slice(0, 50); 
        await updateAssetsInDB(syncChunk);

      } catch (error) {
        console.error('Global Sync Worker Error:', error);
      } finally {
        if (isSubscribed) {
          setSyncStatus('complete');
          setLastSyncTime(new Date());
        }
        isSyncingGlobally = false;
      }
    };

    // Run sync cycle
    startBackgroundSync();

    // Check for staleness every 10 minutes
    const interval = setInterval(() => {
      if (!isSyncingGlobally) {
        startBackgroundSync();
      }
    }, 10 * 60 * 1000);

    return () => { 
      isSubscribed = false; 
      clearInterval(interval);
    };
  }, [assets.length]); 


  return {
    syncStatus,
    lastUpdated: lastSyncTime,
    isSyncing: syncStatus === 'syncing'
  };
};
