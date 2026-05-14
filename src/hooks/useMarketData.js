import { useEffect, useState, useRef } from 'react';
import { updateAssetsInDB } from '../services/marketService.js';

// Global state to prevent multiple sync loops
let isSyncingGlobally = false;

/**
 * Senior Fintech Hook: useMarketData
 * Optimized Strategy: Background synchronization instead of blocking fetches.
 * Now even faster with CoinGecko Batching for cryptos.
 */
export const useMarketData = (assets = []) => {
  const [syncStatus, setSyncStatus] = useState('idle');
  const [lastSyncTime, setLastSyncTime] = useState(null);

  useEffect(() => {
    // Only run if we have assets and aren't already syncing
    if (!assets || assets.length === 0 || isSyncingGlobally) return;

    let isSubscribed = true;
    
    const startBackgroundSync = async () => {
      isSyncingGlobally = true;
      setSyncStatus('syncing');
      
      try {
        // 1. Identify Stale Assets (> 15 mins)
        const stalenessThreshold = 15 * 60 * 1000;
        const now = Date.now();
        const staleAssets = assets.filter(a => {
          const lastUpdate = a.last_price_at ? new Date(a.last_price_at).getTime() : 0;
          return (now - lastUpdate) > stalenessThreshold;
        });

        if (staleAssets.length === 0) {
          setSyncStatus('complete');
          setLastSyncTime(new Date());
          isSyncingGlobally = false;
          return;
        }

        // 2. Process Sync (Internal service handles batching/throttling)
        // We take a reasonable chunk to avoid long-running background tasks
        const syncChunk = staleAssets.slice(0, 10); 
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

    // Run sync cycle immediately
    startBackgroundSync();

    // Periodic check every 5 minutes
    const interval = setInterval(() => {
      if (!isSyncingGlobally) {
        startBackgroundSync();
      }
    }, 5 * 60 * 1000);

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
