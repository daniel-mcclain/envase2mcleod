import type { BillingEntry } from '../types/billing';

export const mockBillingEntries: BillingEntry[] = [
  {
    id: '1',
    invoice_number: 'INV-001',
    amount: 1500.00,
    customer_name: 'Acme Corp',
    status: 'pending',
    sync_status: 'not_synced',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: '2',
    invoice_number: 'INV-002',
    amount: 2750.50,
    customer_name: 'TechStart Inc',
    status: 'processed',
    sync_status: 'synced',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: '3',
    invoice_number: 'INV-003',
    amount: 950.25,
    customer_name: 'Global Logistics',
    status: 'error',
    sync_status: 'failed',
    created_at: new Date(Date.now() - 259200000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString()
  }
];