'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';

interface AchievementNotif {
  id: string;
  achievement_id: string;
  status: string;
  should_animate: boolean;
  created_at: string;
  achievements: {
    id: string;
    achievement_name: string;
    description: string;
    icon_emoji: string;
    rarity: string;
    milestone_day?: number;
  };
}

export default function AchievementNotifications() {
  const [notifications, setNotifications] = useState<AchievementNotif[]>([]);
  const [visibleNotifications, setVisibleNotifications] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadNotifications();

    // Poll for new notifications every 5 seconds
    const interval = setInterval(loadNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await fetch('/api/gamification/achievement-notifications');
      if (!response.ok) return;

      const data = await response.json();
      const newNotifs = data.notifications || [];

      // Show newly arrived notifications
      newNotifs.forEach((notif: AchievementNotif) => {
        if (!visibleNotifications.has(notif.id)) {
          setVisibleNotifications((prev) => new Set(prev).add(notif.id));
        }
      });

      setNotifications(newNotifs);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const markAsRead = async (notificationId: string, achievementId: string) => {
    try {
      await fetch('/api/gamification/achievement-notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notification_id: notificationId,
          status: 'read',
        }),
      });

      setNotifications((prev) =>
        prev.filter((n) => n.id !== notificationId)
      );
      setVisibleNotifications((prev) => {
        const next = new Set(prev);
        next.delete(notificationId);
        return next;
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  if (!mounted) return null;

  return (
    <>
      {notifications.map((notif) => (
        <AchievementToast
          key={notif.id}
          notification={notif}
          onDismiss={() => markAsRead(notif.id, notif.achievement_id)}
          isAnimating={visibleNotifications.has(notif.id)}
        />
      ))}
    </>
  );
}

interface ToastProps {
  notification: AchievementNotif;
  onDismiss: () => void;
  isAnimating: boolean;
}

function AchievementToast({ notification, onDismiss, isAnimating }: ToastProps) {
  const [showConfetti, setShowConfetti] = useState(notification.should_animate);

  useEffect(() => {
    if (showConfetti && isAnimating) {
      // Trigger confetti animation
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti, isAnimating]);

  const achievement = notification.achievements;
  const rarityColors: Record<string, string> = {
    common: 'from-blue-500 to-blue-600',
    rare: 'from-purple-500 to-purple-600',
    epic: 'from-amber-500 to-amber-600',
    legendary: 'from-orange-500 to-red-600',
  };

  const rarityEmoji: Record<string, string> = {
    common: '✨',
    rare: '💜',
    epic: '⭐',
    legendary: '👑',
  };

  return (
    <>
      {/* Confetti Effect (if enabled) */}
      {showConfetti && isAnimating && <ConfettiAnimation />}

      {/* Toast Notification */}
      <div
        className={`fixed bottom-4 right-4 rounded-xl border border-slate-700/50 bg-gradient-to-r ${rarityColors[achievement.rarity]} shadow-2xl shadow-black/50 p-5 max-w-sm transform transition-all duration-300 ${
          isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-start gap-4">
          <div className="text-4xl flex-shrink-0 animate-bounce">
            {achievement.icon_emoji}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-black text-white text-lg leading-tight">
              Glückwunsch!
            </h3>
            <p className="text-white/90 font-bold text-sm mt-1">
              {achievement.achievement_name}
            </p>
            {achievement.description && (
              <p className="text-white/70 text-xs mt-1">
                {achievement.description}
              </p>
            )}
            {achievement.milestone_day && (
              <p className="text-white/80 text-xs font-semibold mt-2">
                🔥 {achievement.milestone_day} Tage rauchfrei!
              </p>
            )}
          </div>
          <button
            onClick={onDismiss}
            className="text-white/60 hover:text-white transition-colors mt-1 font-bold text-xl flex-shrink-0"
          >
            ✕
          </button>
        </div>
      </div>
    </>
  );
}

// Confetti animation component
function ConfettiAnimation() {
  const confettiPieces = Array.from({ length: 50 });

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {confettiPieces.map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full animate-confetti"
          style={{
            left: `${Math.random() * 100}%`,
            top: `-10px`,
            backgroundColor: ['#14b8a6', '#06b6d4', '#f59e0b', '#ec4899', '#8b5cf6'][Math.floor(Math.random() * 5)],
            '--confetti-start-x': `${(Math.random() - 0.5) * 200}px`,
            '--confetti-start-y': `${window.innerHeight + 10}px`,
            '--confetti-duration': `${2 + Math.random() * 1}s`,
          } as any}
        />
      ))}
    </div>
  );
}
