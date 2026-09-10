import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createReport } from '../services/api';


function SubmitReport() {
    const [category, setCategory] = useState('pothole');
    const [description, setDescription] = useState('');
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
        <div className="min-h-screen bg-paper flex items-center justify-center px-4 py-10">
            <form
                onSubmit={handleSubmit}
                className="bg-white border border-hairline rounded-lg p-8 w-full max-w-lg"
            >
            <h2 className="font-heading text-2xl font-bold text-ink mb-6">
            Report an Issue
            </h2>

            {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded px-3 py-2 mb-4">
                {error}
            </div>
            )}

            <div className="mb-4">
            <label className="block font-body text-sm text-ink mb-1">
                Category
            </label>
            <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-hairline rounded px-3 py-2 font-body focus:outline-none focus:border-rust"
            >
                <option value="pothole">Pothole</option>
                <option value="garbage">Garbage</option>
                <option value="waterlogging">Waterlogging</option>
                <option value="streetlight">Streetlight</option>
                <option value="drain">Drain</option>
                <option value="other">Other</option>
            </select>
            </div>

            <div className="mb-4">
            <label className="block font-body text-sm text-ink mb-1">
                Description
            </label>
            <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-hairline rounded px-3 py-2 font-body focus:outline-none focus:border-rust"
                rows="3"
                required
            />
            </div>

            <div className="mb-4">
            <label className="block font-body text-sm text-ink mb-1">
                Photo
            </label>
            <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="w-full font-body text-sm"
            />
            </div>

            <div className="mb-6">
            <label className="block font-body text-sm text-ink mb-1">
                Location
            </label>
            <button
                type="button"
                onClick={getLocation}
                className="w-full border border-hairline rounded px-3 py-2 font-body text-ink hover:border-rust transition-colors"
            >
                {locationStatus === 'success'
                ? `Location captured (${location.lat.toFixed(4)}, ${location.lng.toFixed(4)})`
                : locationStatus === 'fetching'
                ? 'Getting location...'
                : 'Share Current Location'}
            </button>
            </div>

            <button
            type="submit"
            disabled={loading}
            className="w-full bg-rust text-white font-body font-semibold py-2 rounded hover:opacity-90 transition-opacity disabled:opacity-50"
            >
            {loading ? 'Submitting...' : 'Submit Report'}
            </button>
        </form>
        </div>
    );
}


export default SubmitReport;