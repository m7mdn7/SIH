export interface ComplaintNotification {
  id: string;
  title: string;
  description: string;
  locationName: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  category?: string;
  severity?: string;
}

type NotificationCallback = (notification: ComplaintNotification) => void;

class NotificationService {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<NotificationCallback> = new Set();
  private knownIds: Set<string> = new Set();

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel('siip_complaints_channel');
        this.channel.onmessage = (event) => {
          if (event.data && event.data.type === 'NEW_COMPLAINT') {
            this.handleIncomingNotification(event.data.payload);
          }
        };
      } catch (err) {
        console.warn('BroadcastChannel initialized in fallback mode:', err);
      }
    }
  }

  public subscribe(callback: NotificationCallback): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  public broadcastComplaint(complaint: ComplaintNotification): void {
    this.handleIncomingNotification(complaint);
    if (this.channel) {
      try {
        this.channel.postMessage({
          type: 'NEW_COMPLAINT',
          payload: complaint,
        });
      } catch (err) {
        console.error('Failed to broadcast complaint message:', err);
      }
    }
  }

  private handleIncomingNotification(complaint: ComplaintNotification): void {
    if (!complaint || !complaint.id) return;
    if (this.knownIds.has(complaint.id)) return;

    this.knownIds.add(complaint.id);
    this.listeners.forEach((listener) => {
      try {
        listener(complaint);
      } catch (e) {
        console.error('Error executing notification listener:', e);
      }
    });
  }
}

export const notificationService = new NotificationService();
