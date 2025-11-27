import { FormEvent, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { apiFetch } from '../lib/api-client';

const ResetPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await apiFetch('/auth/forgot-password', {
                method: 'POST',
                body: JSON.stringify({ email }),
                skipAuth: true
            });
            setSuccess(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to send reset email.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Head>
                <title>SEO Booster – Reset Password</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Inter:300,400,500,600,700" />
                <link href="/assets/plugins/global/plugins.bundle.css" rel="stylesheet" type="text/css" />
                <link href="/assets/css/style.bundle.css" rel="stylesheet" type="text/css" />
                <style>{`
          html, body, #__next {
            height: 100%;
          }
        `}</style>
            </Head>

            <div id="kt_body" className="app-blank h-100">
                <div className="d-flex flex-column flex-root h-100" id="kt_app_root">
                    <div className="d-flex flex-column flex-lg-row flex-column-fluid">
                        <div className="d-flex flex-column flex-lg-row-fluid w-lg-50 p-10 order-2 order-lg-1">
                            <div className="d-flex flex-center flex-column flex-lg-row-fluid">
                                <div className="w-lg-500px p-10">
                                    {success ? (
                                        <div className="text-center mb-10">
                                            <h1 className="text-gray-900 fw-bolder mb-3">Check your email</h1>
                                            <div className="text-gray-500 fw-semibold fs-6">
                                                We have sent a password reset link to <strong>{email}</strong>.
                                            </div>
                                            <div className="mt-10">
                                                <Link href="/login" className="btn btn-primary">Return to Sign In</Link>
                                            </div>
                                        </div>
                                    ) : (
                                        <form className="form w-100" noValidate id="kt_password_reset_form" onSubmit={handleSubmit}>
                                            <div className="text-center mb-10">
                                                <h1 className="text-gray-900 fw-bolder mb-3">Forgot Password ?</h1>
                                                <div className="text-gray-500 fw-semibold fs-6">Enter your email to reset your password.</div>
                                            </div>

                                            <div className="fv-row mb-8">
                                                <input
                                                    type="text"
                                                    placeholder="Email"
                                                    name="email"
                                                    autoComplete="off"
                                                    className="form-control bg-transparent"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                />
                                            </div>

                                            {error && (
                                                <div className="alert alert-danger d-flex align-items-center p-5 mb-8">
                                                    <i className="ki-outline ki-shield-tick fs-2hx text-danger me-4"></i>
                                                    <div className="d-flex flex-column">
                                                        <h4 className="mb-1 text-danger">Error</h4>
                                                        <span>{error}</span>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="d-flex flex-wrap justify-content-center pb-lg-0">
                                                <button type="submit" id="kt_password_reset_submit" className="btn btn-primary me-4" disabled={loading}>
                                                    <span className="indicator-label">Submit</span>
                                                    {loading && (
                                                        <span className="indicator-progress" style={{ display: 'block' }}>
                                                            Please wait...
                                                            <span className="spinner-border spinner-border-sm align-middle ms-2"></span>
                                                        </span>
                                                    )}
                                                </button>
                                                <Link href="/login" className="btn btn-light">Cancel</Link>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            </div>

                            <div className="w-lg-500px d-flex flex-stack px-10 mx-auto">
                                <div className="me-10">
                                    <button className="btn btn-flex btn-link btn-color-gray-700 btn-active-color-primary rotate fs-base" data-kt-menu-trigger="click" data-kt-menu-placement="bottom-start" data-kt-menu-offset="0px, 0px">
                                        <img data-kt-element="current-lang-flag" className="w-20px h-20px rounded me-3" src="/assets/media/flags/united-states.svg" alt="" />
                                        <span data-kt-element="current-lang-name" className="me-1">English</span>
                                        <span className="d-flex flex-center rotate-180">
                                            <i className="ki-outline ki-down fs-5 text-muted m-0"></i>
                                        </span>
                                    </button>
                                </div>
                                <div className="d-flex fw-semibold text-primary fs-base gap-5">
                                    <Link href="/terms" target="_blank">Terms</Link>
                                    <Link href="/contact" target="_blank">Contact Us</Link>
                                </div>
                            </div>
                        </div>

                        <div className="d-flex flex-lg-row-fluid w-lg-50 bgi-size-cover bgi-position-center order-1 order-lg-2" style={{ backgroundImage: 'url(/assets/media/misc/auth-bg.png)' }}>
                            <div className="d-flex flex-column flex-center py-7 py-lg-15 px-5 px-md-15 w-100">
                                <Link href="/" className="mb-0 mb-lg-12">
                                    <img alt="Logo" src="/assets/media/logos/custom-1.png" className="h-60px h-lg-75px" />
                                </Link>
                                <img className="d-none d-lg-block mx-auto w-275px w-md-50 w-xl-500px mb-10 mb-lg-20" src="/assets/media/misc/auth-screens.png" alt="" />
                                <h1 className="d-none d-lg-block text-white fs-2qx fw-bolder text-center mb-7">Fast, Efficient and Productive</h1>
                                <div className="d-none d-lg-block text-white fs-base text-center">
                                    In this kind of post,{' '}
                                    <a href="#" className="opacity-75-hover text-warning fw-bold me-1">the blogger</a>
                                    introduces a person they’ve interviewed{' '}
                                    <br />
                                    and provides some background information about{' '}
                                    <a href="#" className="opacity-75-hover text-warning fw-bold me-1">the interviewee</a>
                                    and their{' '}
                                    <br />
                                    work following this is a transcript of the interview.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ResetPasswordPage;
