import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Leaf, ShieldCheck, Zap, Tag, FileText, Camera, Send, Navigation } from 'lucide-react';
import { createReport } from '../services/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';


function SubmitReport() {
    const routerLocation = useLocation();
    const prefill = routerLocation.state || {};

    const [category, setCategory] = useState(prefill.category || 'pothole');
    const [description, setDescription] = useState(prefill.description || '');
    const [photo, setPhoto] = useState(null);
    const [location, setLocation] = useState({ lat: null, lng: null });
    const [locationStatus, setLocationStatus] = useState('idle');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const getLocation = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            return;
        }

        setLocationStatus('fetching');

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
                setLocationStatus('success');
            },
            () => {
                setLocationStatus('error');
                setError('Could not get your location. Please allow location access.');
            }
        );
    };

    const handlePhotoChange = (e) => {
        setPhoto(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!photo) {
            setError('Please select a photo');
            return;
        }

        if (!location.lat || !location.lng) {
            setError('Please share your location before submitting');
            return;
        }

        setLoading(true);

        const formDataObj = new FormData();
        formDataObj.append('photo', photo);
        formDataObj.append('category', category);
        formDataObj.append('description', description);
        formDataObj.append('lat', location.lat);
        formDataObj.append('lng', location.lng);

        try {
            await createReport(formDataObj);
            navigate('/my-reports');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid lg:grid-cols-2">

            {/* ── Left Panel — Dark Branding ── */}
            <div
                className="bg-navy px-10 py-14 hidden lg:flex flex-col justify-between relative overflow-hidden"
                style={{
                    backgroundImage: 'radial-gradient(rgba(34,211,238,0.10) 1px, transparent 1px)',
                    backgroundSize: '26px 26px',
                }}
            >
                <div className="relative z-10">
                    <p className="font-heading text-xl font-bold text-text-primary">
                        Civic<span className="text-cyan">Map</span>
                    </p>

                    <h1 className="font-heading text-4xl font-bold text-text-primary leading-tight mt-10">
                        Your report <span className="text-cyan">matters.</span>
                    </h1>
                    <p className="font-body text-text-muted mt-4 max-w-sm">
                        Help us make your city cleaner, safer, and better for everyone.
                        Report an issue, share the details, and be a part of the change.
                    </p>
                </div>

                {/* ── Middle illustration — radar-style live tracking ── */}
                <div className="relative z-10 flex-1 min-h-[260px] flex items-center justify-center">

                    {/* City skyline silhouette */}
                    <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center gap-2 h-20 opacity-25">
                        <div className="w-8 bg-cyan rounded-t" style={{ height: '55%' }}></div>
                        <div className="w-10 bg-cyan rounded-t" style={{ height: '90%' }}></div>
                        <div className="w-8 bg-cyan rounded-t" style={{ height: '40%' }}></div>
                        <div className="w-12 bg-cyan rounded-t" style={{ height: '100%' }}></div>
                        <div className="w-8 bg-cyan rounded-t" style={{ height: '50%' }}></div>
                        <div className="w-10 bg-cyan rounded-t" style={{ height: '70%' }}></div>
                    </div>

                    {/* Soft glow behind the pin */}
                    <div
                        className="absolute w-56 h-56 rounded-full bg-cyan opacity-10 blur-3xl"
                    ></div>

                    {/* Radar pulse rings */}
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            className="absolute w-24 h-24 rounded-full border border-cyan"
                            animate={{ scale: [1, 2.4], opacity: [0.5, 0] }}
                            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeOut', delay: i * 0.9 }}
                        />
                    ))}

                    {/* Center pin — gently floats up and down */}
                    <motion.div
                        animate={{ y: [0, -12, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                        className="relative z-10 w-24 h-24 rounded-full bg-panel border border-cyan-dim flex items-center justify-center shadow-lg"
                    >
                        <MapPin size={40} className="text-cyan" strokeWidth={1.5} />
                    </motion.div>

                    {/* Floating badges */}
                    <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
                        className="absolute top-2 left-2 flex items-center gap-1.5 bg-panel border border-cyan-dim rounded-full px-3 py-1.5 shadow-md"
                    >
                        <Leaf size={14} className="text-cyan" />
                        <span className="font-body text-xs text-text-primary">Cleaner Streets</span>
                    </motion.div>

                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
                        className="absolute top-6 right-0 flex items-center gap-1.5 bg-panel border border-cyan-dim rounded-full px-3 py-1.5 shadow-md"
                    >
                        <ShieldCheck size={14} className="text-cyan" />
                        <span className="font-body text-xs text-text-primary">Safer Roads</span>
                    </motion.div>

                    <motion.div
                        animate={{ y: [0, -9, 0] }}
                        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                        className="absolute bottom-10 right-4 flex items-center gap-1.5 bg-panel border border-cyan-dim rounded-full px-3 py-1.5 shadow-md"
                    >
                        <Zap size={14} className="text-cyan" />
                        <span className="font-body text-xs text-text-primary">Faster Fixes</span>
                    </motion.div>

                </div>

                <div className="relative z-10 grid grid-cols-3 gap-4">
                    <div className="bg-panel border border-cyan-dim rounded-xl p-4">
                        <p className="text-cyan font-heading font-bold">1.</p>
                        <p className="font-body text-sm text-text-primary font-semibold mt-1">Report Issue</p>
                        <p className="font-body text-xs text-text-muted mt-1">Share what's happening in your area.</p>
                    </div>
                    <div className="bg-panel border border-cyan-dim rounded-xl p-4">
                        <p className="text-cyan font-heading font-bold">2.</p>
                        <p className="font-body text-sm text-text-primary font-semibold mt-1">Add Details</p>
                        <p className="font-body text-xs text-text-muted mt-1">Provide location, photo and description.</p>
                    </div>
                    <div className="bg-panel border border-cyan-dim rounded-xl p-4">
                        <p className="text-cyan font-heading font-bold">3.</p>
                        <p className="font-body text-sm text-text-primary font-semibold mt-1">Create Impact</p>
                        <p className="font-body text-xs text-text-muted mt-1">Helps authorities act faster.</p>
                    </div>
                </div>
            </div>

                       {/* ── Right Panel — Form ── */}
            <div className="bg-light flex items-center justify-center px-6 py-14 relative overflow-hidden">

                {/* Soft color blobs — ties the light panel back to the brand palette */}
                <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-cyan opacity-[0.08] blur-3xl pointer-events-none"></div>
                <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-cyan opacity-[0.06] blur-3xl pointer-events-none"></div>

                {/* Decorative dot-pattern corner accent */}
                <div
                    className="absolute top-0 right-0 w-64 h-64 opacity-60 pointer-events-none"
                    style={{
                        backgroundImage: 'radial-gradient(rgba(34,211,238,0.35) 1.5px, transparent 1.5px)',
                        backgroundSize: '16px 16px',
                        maskImage: 'radial-gradient(circle at top right, black, transparent 70%)',
                        WebkitMaskImage: 'radial-gradient(circle at top right, black, transparent 70%)',
                    }}
                ></div>

                <form
                    onSubmit={handleSubmit}
                    className="relative z-10 bg-white border border-hairline shadow-xl rounded-3xl w-full max-w-lg overflow-hidden"
                >
                    {/* Brand accent bar */}
                    <div className="h-1.5 w-full bg-gradient-to-r from-cyan via-cyan-deep to-navy"></div>

                    <div className="p-8">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-navy flex items-center justify-center flex-shrink-0">
                                <MapPin size={20} className="text-cyan" />
                            </div>
                            <div>
                                <span className="inline-flex items-center gap-1.5 bg-cyan-dim text-cyan text-xs font-semibold px-3 py-1 rounded-full">
                                    <Zap size={12} /> New Report
                                </span>
                            </div>
                        </div>

                        <h2 className="font-heading text-2xl font-bold text-ink mt-4">
                            Report an Issue
                        </h2>
                        <p className="font-body text-sm text-ink/60 mt-1">
                            Help us make your city better. Share the issue, and we'll take it forward.
                        </p>

                        {error && (
                            <div className="bg-status-open-bg border border-status-open/30 text-status-open text-sm rounded-lg px-4 py-3 mt-5">
                                {error}
                            </div>
                        )}

                        <div className="mt-6">
                            <label className="flex items-center gap-1.5 font-body text-sm font-semibold text-ink mb-2">
                                <Tag size={15} className="text-cyan" /> Category
                            </label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full border border-hairline rounded-lg px-4 py-3 font-body text-ink outline-none focus:border-cyan focus:ring-2 focus:ring-cyan/20 transition-all"
                            >
                                <option value="pothole">Pothole</option>
                                <option value="garbage">Garbage</option>
                                <option value="waterlogging">Waterlogging</option>
                                <option value="streetlight">Streetlight</option>
                                <option value="drain">Drain</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div className="mt-5">
                            <Input
                                id="description"
                                label="Description"
                                icon={FileText}
                                type="textarea"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Briefly describe the issue..."
                                maxLength={500}
                                rows={3}
                                required
                            />
                            <p className="font-body text-xs text-ink/40 text-right mt-1">
                                {description.length}/500
                            </p>
                        </div>

                        <div className="mt-5">
                            <label className="flex items-center gap-1.5 font-body text-sm font-semibold text-ink mb-2">
                                <Camera size={15} className="text-cyan" /> Photo
                            </label>
                            <label className="flex items-center gap-3 border border-dashed border-hairline rounded-lg px-4 py-4 cursor-pointer hover:border-cyan hover:bg-cyan-dim/20 transition-colors">
                                <span className="bg-cyan-dim text-cyan rounded-lg p-2">
                                    <Camera size={18} />
                                </span>
                                <div>
                                    <span className="font-body text-sm text-cyan font-semibold">
                                        {photo ? photo.name : 'Choose File'}
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

                        <div className="mt-5">
                            <label className="flex items-center gap-1.5 font-body text-sm font-semibold text-ink mb-2">
                                <MapPin size={15} className="text-cyan" /> Location
                            </label>
                            <Button
                                type="button"
                                variant="outline"
                                size="md"
                                icon={Navigation}
                                loading={locationStatus === 'fetching'}
                                onClick={getLocation}
                                className="w-full !justify-start"
                            >
                                {locationStatus === 'success'
                                    ? `Location captured (${location.lat.toFixed(4)}, ${location.lng.toFixed(4)})`
                                    : locationStatus === 'fetching'
                                    ? 'Getting location...'
                                    : 'Share Current Location'}
                            </Button>
                        </div>

                        <div className="mt-7">
                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                icon={Send}
                                loading={loading}
                                className="w-full"
                            >
                                {loading ? 'Submitting...' : 'Submit Report'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>   
    );
}


export default SubmitReport;
