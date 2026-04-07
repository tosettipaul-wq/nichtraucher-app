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
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/auth/login');
        return;
      }

      setUser(user);

      const { data: profile } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .single();

      if (profile) {
        const { data: partnersData } = await supabase
          .from('accountability_partners')
          .select('*')
          .eq('user_id', profile.id)
          .order('invited_at', { ascending: false });

        setPartners(partnersData || []);
      }

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

    if (!inviteEmail?.includes('@')) {
      setError('Ungültige E-Mail-Adresse');
      setSubmitting(false);
      return;
    }

    try {
      const supabase = createClient();
      const { data: profile } = await supabase.from('users').select('id').eq('auth_id', user.id).single();
      if (!profile) { setError('Profil nicht gefunden'); setSubmitting(false); return; }

      const { data: invitedUser } = await supabase.from('users').select('id').eq('email', inviteEmail).single();
      if (!invitedUser) { setError('Benutzer nicht gefunden'); setSubmitting(false); return; }

      const { error: insertError } = await supabase.from('accountability_partners').insert([{
        user_id: profile.id,
        friend_id: invitedUser.id,
        relationship_type: 'supporter',
        status: 'pending',
      }]);

      if (insertError) {
        setError(insertError.message);
      } else {
        setSuccess(`Einladung an ${inviteEmail} gesendet!`);
        setInviteEmail('');
        const { data: freshPartners } = await supabase.from('accountability_partners').select('*').eq('user_id', profile.id).order('invited_at', { ascending: false });
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
      const { error } = await supabase.from('accountability_partners').delete().eq('id', friendId);
      if (!error) setPartners(partners.filter((f) => f.id !== friendId));
    } catch {}
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-8 h-8 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto px-4 py-3.5 flex items-center gap-4">
          <button onClick={() => router.push('/dashboard')} className="text-slate-400 hover:text-white transition-colors text-sm">← Zurück</button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-base shadow-lg shadow-blue-500/20">👥</div>
            <div>
              <p className="font-bold text-white text-sm">Accountability Partner</p>
              <p className="text-slate-500 text-xs">Gemeinsam stark bleiben</p>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-5">
        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
            <p className="text-red-300 text-sm">❌ {error}</p>
          </div>
        )}
        {success && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
            <p className="text-emerald-300 text-sm font-medium">✅ {success}</p>
          </div>
        )}

        {/* Share Link */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 space-y-3">
          <h2 className="font-bold text-white">🔗 Dein Einladungs-Link</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={shareLink}
              readOnly
              className="flex-1 px-3 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-400 text-xs font-mono"
            />
            <button
              onClick={handleCopyLink}
              className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
                copied
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-teal-500 hover:bg-teal-400 text-slate-950'
              }`}
            >
              {copied ? '✓ Kopiert' : 'Kopieren'}
            </button>
          </div>
          <p className="text-slate-500 text-xs">Teile diesen Link mit Freunden</p>
        </div>

        {/* Invite form */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 space-y-4">
          <h2 className="font-bold text-white">➕ Per E-Mail einladen</h2>
          <form onSubmit={handleInvite} className="flex gap-2">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="freund@example.com"
              className="flex-1 px-4 py-3 rounded-xl border border-slate-700 bg-slate-800 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
            />
            <button
              type="submit"
              disabled={submitting || !inviteEmail}
              className="px-5 py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl font-bold text-sm transition-all disabled:opacity-40"
            >
              {submitting ? '...' : 'Einladen'}
            </button>
          </form>
        </div>

        {/* Partners list */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 space-y-4">
          <h2 className="font-bold text-white">👥 Deine Partner ({partners.length})</h2>
          {partners.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-3xl mb-3">🤝</p>
              <p className="text-slate-400 text-sm">Noch keine Partner. Lade jetzt Freunde ein!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {partners.map((partner) => (
                <div
                  key={partner.id}
                  className="rounded-xl border border-slate-700/60 bg-slate-800/60 p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-700 flex items-center justify-center text-lg">
                      {partner.status === 'accepted' ? '✅' : '⏳'}
                    </div>
                    <div>
                      <p className="font-medium text-white text-sm">{partner.friend_id || 'Eingeladen'}</p>
                      <p className={`text-xs ${partner.status === 'accepted' ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {partner.status === 'pending' ? 'Ausstehend' : 'Angenommen'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveFriend(partner.id)}
                    className="px-3 py-1.5 text-xs text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/10 transition-all"
                  >
                    Entfernen
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
