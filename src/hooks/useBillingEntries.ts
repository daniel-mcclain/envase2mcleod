import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { BillingEntry } from '../types/billing';

export function useBillingEntries(userId: string | null) {
  const [entries, setEntries] = useState<BillingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const q = query(collection(db, 'billing_entries'));
    setLoading(true);

    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        const billingEntries: BillingEntry[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          billingEntries.push({
            id: doc.id,
            invoice_number: data.invoice_number,
            amount: data.amount,
            customer_name: data.customer_name,
            status: data.status,
            sync_status: data.sync_status,
            created_at: data.created_at.toDate().toISOString(),
            updated_at: data.updated_at.toDate().toISOString()
          });
        });
        setEntries(billingEntries);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching billing entries:', err);
        setError('Failed to load billing entries');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const syncToMcLeod = async (entry: BillingEntry) => {
    const entryRef = doc(db, 'billing_entries', entry.id);
    
    try {
      await updateDoc(entryRef, {
        sync_status: 'syncing',
        updated_at: Timestamp.now()
      });

      // Simulate API call to McLeod ERP
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await updateDoc(entryRef, {
        sync_status: 'synced',
        status: 'processed',
        updated_at: Timestamp.now()
      });
    } catch (error) {
      console.error('Error syncing to McLeod:', error);
      
      await updateDoc(entryRef, {
        sync_status: 'failed',
        updated_at: Timestamp.now()
      });
      throw error;
    }
  };

  return { entries, loading, error, syncToMcLeod };
}