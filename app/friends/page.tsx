'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';

interface Partner {
  id: string;
  friend_id?: string;
  relationship_type: string;
  status: 'pending' | 'accepted';
  invited_at: string;
  accepted_at: string | null;
}

export default function FriendsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/auth/login');
        return;
      }

      setUser(user);

      // Get user profile
      const { data: profile } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single();

      if (profile) {
        // Load accountability partners
        const { data: partnersData } = await supabase
          .from('accountability_partners')
          .select('*')
          .eq('user_id', profile.id)
          .order('invited_at', { ascending: false });

        setPartners(partnersData || []);
      }

      // Generate share link
      const baseUrl = window.location.origin;
      const inviteCode = btoa(`${user.id}:${user.email}`).substring(0, 12);
      setShareLink(`${baseUrl}/friends/join/${inviteCode}`);

      setLoading(false);
    };

    loadData();
  }, [router]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    if (!inviteEmail) {
      setError('Bitte gib eine E-Mail-Adresse ein');
      setSubmitting(false);
      return;
    }

    if (!inviteEmail.includes('@')) {
      setError('Ungültige E-Mail-Adresse');
      setSubmitting(false);
      return;
    }

    try {
      const supabase = createClient();

      // Get user profile
      const { data: profile } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single();

      if (!profile) {
        setError('Benutzerprofil nicht gefunden');
        setSubmitting(false);
        return;
      }

      // Try to find user by email
      const { data: invitedUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', inviteEmail)
        .single();

      if (!invitedUser) {
        setError('Benutzer mit dieser E-Mail nicht gefunden');
        setSubmitting(false);
        return;
      }

      // Check if already connected
      const { data: existing } = await supabase
        .from('accountability_partners')
        .select('*')
        .eq('user_id', profile.id)
        .eq('friend_id', invitedUser.id)
        .single();

      if (existing) {
        setError('Diese Person ist bereits hinzugefügt');
        setSubmitting(false);
        return;
      }

      // Add new accountability partner
      const { error: insertError } = await supabase.from('accountability_partners').insert([
        {
          user_id: profile.id,
          friend_id: invitedUser.id,
          relationship_type: 'supporter',
          status: 'pending',
        },
      ]);

      if (insertError) {
        setError(insertError.message);
      } else {
        setSuccess(`Einladung an ${inviteEmail} gesendet!`);
        setInviteEmail('');

        // Reload partners
        const { data: freshPartners } = await supabase
          .from('accountability_partners')
          .select('*')
          .eq('user_id', profile.id)
          .order('invited_at', { ascending: false });

        setPartners(freshPartners || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRemoveFriend = async (friendId: string) => {
    if (!confirm('Willst du diese Person wirklich entfernen?')) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('accountability_partners')
        .delete()
        .eq('id', friendId);

      if (error) {
        setError(error.message);
      } else {
        setPartners(partners.filter((f) => f.id !== friendId));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="text-gray-400">Wird geladen...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Accountability Partner</h1>
            <p className="text-gray-400 text-sm mt-2">Laden Freunde ein, dir zu helfen deine Ziele zu erreichen</p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
          >
            ← Zurück
          </button>
        </div>

        {error && (
          <div className="bg-red-900 border border-red-700 rounded-lg p-4 mb-6">
            <p className="text-red-100 font-medium">❌ Fehler</p>
            <p className="text-red-200 text-sm mt-1">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-emerald-900 border border-emerald-700 rounded-lg p-4 mb-6">
            <p className="text-emerald-100 font-medium">✅ {success}</p>
          </div>
        )}

        {/* Share Link */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">🔗 Dein Einladungs-Link</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={shareLink}
              readOnly
              className="flex-1 px-4 py-2 border border-gray-600 bg-gray-700 text-gray-300 rounded-lg text-sm"
            />
            <button
              onClick={handleCopyLink}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-teal-600 hover:bg-teal-500 text-white'
              }`}
            >
              {copied ? '✅ Kopiert!' : '📋 Kopieren'}
            </button>
          </div>
          <p className="text-gray-400 text-xs mt-2">Teile diesen Link mit deinen Freunden</p>
        </div>

        {/* Invite Form */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">➕ E-Mail einladen</h2>
          <form onSubmit={handleInvite} className="space-y-4">
            <div className="flex gap-2">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="freund@example.com"
                className="flex-1 px-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 placeholder-gray-500"
              />
              <button
                type="submit"
                disabled={submitting || !inviteEmail}
                className="px-6 py-2 bg-teal-600 hover:bg-teal-500 text-white font-medium rounded-lg transition disabled:opacity-50"
              >
                {submitting ? 'Wird gesendet...' : 'Einladen'}
              </button>
            </div>
          </form>
        </div>

        {/* Friends List */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">
            👥 Deine Partner ({partners.length})
          </h2>

          {partners.length === 0 ? (
            <p className="text-gray-400 text-center py-8">
              Noch keine Partner hinzugefügt. Lade Freunde ein oder teile deinen Link!
            </p>
          ) : (
            <div className="space-y-3">
              {partners.map((partner) => (
                <div
                  key={partner.id}
                  className="bg-gray-700 rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <p className="font-medium text-white">Friend ID: {partner.friend_id}</p>
                    <p className="text-sm text-gray-400">
                      {partner.status === 'pending' ? '⏳ Ausstehend' : '✅ Angenommen'}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveFriend(partner.id)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-sm rounded-lg transition"
                  >
                    Entfernen
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
