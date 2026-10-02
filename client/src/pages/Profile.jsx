import { useState } from 'react';
import { User, Mail, Camera, Save, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/api';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

function Profile() {
  const { user, refreshUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(user?.profilePhoto || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const formData = new FormData();
    if (name) formData.append('name', name);
    if (photo) formData.append('photo', photo);

    try {
      const data = await updateProfile(formData);
      setSuccess(data.message);
      await refreshUser();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const initial = user?.name?.charAt(0).toUpperCase() || '?';

  return (
    <div className="min-h-screen bg-light">

      {/* ── Dark Hero-Strip ── */}
      <div className="relative bg-navy px-6 py-10 overflow-hidden">
        <div className="absolute -top-16 right-10 w-56 h-56 rounded-full border border-cyan-dim"></div>

        <div className="relative max-w-2xl mx-auto flex items-center gap-5">
          <div
            className="rounded-full overflow-hidden border-2 border-cyan bg-cyan-dim text-cyan font-heading font-bold text-2xl flex items-center justify-center shrink-0"
            style={{ width: '80px', height: '80px' }}
          >
            {preview ? (
              <img src={preview} alt={user?.name} className="w-full h-full object-cover" />
            ) : (
              initial
            )}
          </div>

          <div>
            <h2 className="font-heading text-2xl font-bold text-text-primary">
              {user?.name}
            </h2>
            <p className="font-body text-sm text-text-muted mt-1">{user?.email}</p>
            {user?.isVerified && (
              <span className="inline-flex items-center gap-1 text-xs text-status-resolved mt-2">
                <ShieldCheck size={13} /> Verified account
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-2xl mx-auto px-6 py-10">
        <Card padding="lg">
          <p className="font-heading text-lg font-bold text-ink mb-5">Edit Profile</p>

          {error && (
            <div className="bg-status-open-bg border border-status-open/30 text-status-open text-sm rounded-lg px-4 py-3 mb-5">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-status-resolved-bg border border-status-resolved/30 text-status-resolved text-sm rounded-lg px-4 py-3 mb-5">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Input
              id="name"
              label="Name"
              icon={User}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />

            <div>
              <label className="flex items-center gap-1.5 font-body text-sm font-semibold text-ink mb-2">
                <Camera size={15} className="text-cyan" /> Profile Photo
              </label>
              <label className="flex items-center gap-3 border border-dashed border-hairline rounded-lg px-4 py-4 cursor-pointer hover:border-cyan hover:bg-cyan-dim/20 transition-colors">
                <span className="bg-cyan-dim text-cyan rounded-lg p-2">
                  <Camera size={18} />
                </span>
                <div>
                  <span className="font-body text-sm text-cyan font-semibold">
                    {photo ? photo.name : 'Choose a new photo'}
                  </span>
                  <p className="font-body text-xs text-ink/50">JPG, PNG (Max 5MB)</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex items-center gap-2 text-xs text-ink/40">
              <Mail size={13} /> Email cannot be changed
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={Save}
              loading={loading}
              className="w-full"
            >
              Save Changes
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

export default Profile;