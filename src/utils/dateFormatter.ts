import { Timestamp } from 'firebase/firestore';

export function formatDate(timestamp: any): string {
  if (!timestamp) return 'Never';
  
  const date = timestamp instanceof Timestamp ? 
    timestamp.toDate() : 
    new Date(timestamp);

  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return 'Invalid Date';
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short'
  });
}