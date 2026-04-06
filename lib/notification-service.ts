/**
 * Web Push Notification Service
 * Handles PWA notifications for daily accountability messages
 */

export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.log('Notifications not supported');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Notification permission error:', error);
      return false;
    }
  }

  return false;
}

export function scheduleNotification(
  title: string,
  options?: NotificationOptions
) {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/favicon.ico',
      ...options,
    });
  }
}

export async function scheduleDailyNotification(time: string = '20:00') {
  // Parse time (HH:MM)
  const [hours, minutes] = time.split(':').map(Number);
  
  const checkAndNotify = () => {
    const now = new Date();
    if (now.getHours() === hours && now.getMinutes() === minutes) {
      scheduleNotification('🎯 Dein täglicher Quitter-Check-in', {
        body: 'Wie war dein Tag? Teile deine Gefühle und Auslöser mit mir.',
        tag: 'daily-checkin',
        requireInteraction: false,
      });
    }
  };

  // Check every minute
  setInterval(checkAndNotify, 60 * 1000);
}

export function sendTestNotification() {
  scheduleNotification('✅ Quitter-Buddy Test', {
    body: 'Benachrichtigungen funktionieren!',
  });
}
