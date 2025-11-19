import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

interface MagicLinkData {
    valid: boolean;
    type: 'PUBLISH' | 'FEEDBACK';
    articleTitle?: string;
    webUrl?: string;
}

export default function MagicLinkAction() {
    const router = useRouter();
    const { token } = router.query;
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<MagicLinkData | null>(null);
    const [actionStatus, setActionStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');

    useEffect(() => {
        if (!token) return;

        fetch(`${process.env.NEXT_PUBLIC_API_URL}/magic-links/${token}`)
            .then(async (res) => {
                if (!res.ok) {
                    const err = await res.json();
                    throw new Error(err.message || 'Invalid token');
                }
                return res.json();
            })
            .then((data) => {
                setData(data);
                setLoading(false);
                // If it's a PUBLISH link, trigger action immediately (or wait for user confirmation if preferred, but requirement said "po stisku zveřejnit se pouze zobrazí...")
                // Actually, the email button says "Publish", so clicking it lands here. 
                // Requirement: "po stisku zveřejnit se pouze zobrazí, že už se na to pracuje"
                // So we should probably trigger it immediately or show a "Confirm Publish" button?
                // Let's trigger it immediately for smoother UX if the email intent was clear.
                // BUT, to prevent accidental clicks, maybe a big button "Confirm Publish" is safer?
                // User said: "po stisku zveřejnit se pouze zobrazí..." -> implies the click in email triggers the "working on it" state.
                // Let's auto-trigger for PUBLISH.
                if (data.type === 'PUBLISH') {
                    executeAction(token as string, 'PUBLISH');
                }
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, [token]);

    const executeAction = async (token: string, type: string, payload?: any) => {
        setActionStatus('processing');
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/magic-links/${token}/execute`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload || {})
            });
            if (!res.ok) throw new Error('Action failed');
            setActionStatus('success');
        } catch (err) {
            setActionStatus('error');
        }
    };

    const handleFeedbackSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        executeAction(token as string, 'FEEDBACK', { rating, comment });
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
    if (!data) return null;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <Head>
                <title>{data.type === 'PUBLISH' ? 'Publishing Article' : 'Article Feedback'}</title>
            </Head>

            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                <h1 className="text-2xl font-bold mb-4">
                    {data.type === 'PUBLISH' ? 'Publishing Article' : 'Give Feedback'}
                </h1>

                <p className="text-gray-600 mb-6">
                    {data.articleTitle && <span className="font-medium block mb-2">{data.articleTitle}</span>}
                    {data.webUrl && <span className="text-sm text-gray-400">{data.webUrl}</span>}
                </p>

                {data.type === 'PUBLISH' && (
                    <div>
                        {actionStatus === 'processing' && <p className="text-blue-600">Working on it...</p>}
                        {actionStatus === 'success' && (
                            <div className="text-green-600">
                                <p className="font-bold text-lg mb-2">Success!</p>
                                <p>Your article has been queued for publishing.</p>
                            </div>
                        )}
                        {actionStatus === 'error' && <p className="text-red-600">Something went wrong. Please try again.</p>}
                    </div>
                )}

                {data.type === 'FEEDBACK' && actionStatus !== 'success' && (
                    <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                        <div className="flex justify-center space-x-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className={`text-3xl ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                                >
                                    ★
                                </button>
                            ))}
                        </div>
                        <textarea
                            className="w-full border rounded p-2"
                            placeholder="Any comments? (optional)"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={3}
                        />
                        <button
                            type="submit"
                            disabled={rating === 0 || actionStatus === 'processing'}
                            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            {actionStatus === 'processing' ? 'Submitting...' : 'Submit Feedback'}
                        </button>
                    </form>
                )}

                {data.type === 'FEEDBACK' && actionStatus === 'success' && (
                    <div className="text-green-600">
                        <p className="font-bold text-lg">Thank you for your feedback!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
