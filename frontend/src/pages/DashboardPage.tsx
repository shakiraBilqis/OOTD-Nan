import { useAuth } from '@/features/auth/AuthContext';
import { Button, Logo } from '@/components/ui';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-ivory">
      {/* Top bar */}
      <header className="sticky top-0 z-50 bg-ivory/80 backdrop-blur-lg border-b border-oatmeal/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo size="sm" variant="dark" />
          <div className="flex items-center gap-4">
            <span className="text-body-sm text-ink/50 hidden sm:inline">
              Halo, <span className="text-ink font-medium">{user?.name}</span>
            </span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Keluar
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="animate-in">
          <h1 className="text-display-lg font-heading font-bold text-ink">
            Dashboard
          </h1>
          <p className="mt-2 text-body-lg text-ink/50">
            Selamat datang kembali, {user?.name}! 🎉
          </p>
        </div>

        {/* Placeholder cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
          {[
            {
              title: 'Wardrobe',
              desc: 'Kelola koleksi pakaian Anda',
              icon: '👗',
              color: 'bg-cognac/10 text-cognac',
            },
            {
              title: 'AI Stylist',
              desc: 'Dapatkan rekomendasi outfit',
              icon: '✨',
              color: 'bg-cobalt/10 text-cobalt',
            },
            {
              title: 'Try-On',
              desc: 'Coba pakaian secara virtual',
              icon: '🪞',
              color: 'bg-forest/10 text-forest',
            },
            {
              title: 'Lookbook',
              desc: 'Simpan outfit favorit',
              icon: '📸',
              color: 'bg-burgundy/10 text-burgundy',
            },
            {
              title: 'Planner',
              desc: 'Rencanakan outfit harian',
              icon: '📅',
              color: 'bg-butter/10 text-butter-dark',
            },
            {
              title: 'Profil',
              desc: 'Pengaturan akun Anda',
              icon: '⚙️',
              color: 'bg-terracotta/10 text-terracotta',
            },
          ].map((card) => (
            <div
              key={card.title}
              className="glass-card p-6 hover:shadow-medium transition-all duration-300 cursor-pointer group animate-in-delay-1"
            >
              <div className={`w-12 h-12 rounded-xl ${card.color} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
                {card.icon}
              </div>
              <h3 className="text-heading-sm font-heading font-semibold text-ink">
                {card.title}
              </h3>
              <p className="mt-1 text-body-sm text-ink/50">
                {card.desc}
              </p>
            </div>
          ))}
        </div>

        {/* User info card */}
        <div className="mt-10 glass-card p-8 animate-in-delay-2">
          <h2 className="text-heading-md font-heading font-semibold text-ink mb-4">
            Info Akun
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-body-sm">
            <div>
              <span className="text-ink/40 block mb-1">Nama</span>
              <span className="text-ink font-medium">{user?.name}</span>
            </div>
            <div>
              <span className="text-ink/40 block mb-1">Email</span>
              <span className="text-ink font-medium">{user?.email}</span>
            </div>
            <div>
              <span className="text-ink/40 block mb-1">Role</span>
              <span className="text-ink font-medium capitalize">{user?.role || 'user'}</span>
            </div>
            <div>
              <span className="text-ink/40 block mb-1">User ID</span>
              <span className="text-ink font-mono text-caption">{user?.id}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
