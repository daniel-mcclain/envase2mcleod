export interface BillingEntry {
  id: string;
  invoice_number: string;
  amount: number;
  customer_name: string;
  status: 'pending' | 'processed' | 'error';
  sync_status: 'not_synced' | 'syncing' | 'synced' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface McLeodAPIResponse {
  success: boolean;
  message: string;
}