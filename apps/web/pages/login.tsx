import { FormEvent, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { apiFetch } from '../lib/api-client';
import { saveToken } from '../lib/auth-storage';

interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    webs: Array<{ id: string; url: string; status: string; onboardingStep?: number }>;
  };
}

const LoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await apiFetch<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        skipAuth: true
      });
      saveToken(data.accessToken);
      saveToken(data.accessToken);

      const webs = data.user.webs;
      if (webs.length === 0) {
        router.push('/onboarding/wizard');
      } else {
        const incompleteWeb = webs.find(w => (w.onboardingStep || 0) < 7);
        if (incompleteWeb) {
          router.push(`/onboarding/wizard?webId=${incompleteWeb.id}`);
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nepodařilo se přihlásit.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    if (provider === 'Google') {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'https://budliki.com/api';
      window.location.href = `${apiBaseUrl}/auth/google`;
      return;
    }
    alert(`${provider} login bude implementován později`);
  };

  return (
    <>
      <Head>
        <title>SEO Booster – Sign In</title>
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

      {/* begin::Body */}
      <div id="kt_body" className="app-blank h-100">
        {/* begin::Root */}
        <div className="d-flex flex-column flex-root h-100" id="kt_app_root">
          {/* begin::Authentication - Sign-in */}
          <div className="d-flex flex-column flex-lg-row flex-column-fluid">
            {/* begin::Body */}
            <div className="d-flex flex-column flex-lg-row-fluid w-lg-50 p-10 order-2 order-lg-1">
              {/* begin::Form */}
              <div className="d-flex flex-center flex-column flex-lg-row-fluid">
                {/* begin::Wrapper */}
                <div className="w-lg-500px p-10">
                  {/* begin::Form */}
                  <form className="form w-100" noValidate id="kt_sign_in_form" onSubmit={handleSubmit}>
                    {/* begin::Heading */}
                    <div className="text-center mb-11">
                      {/* begin::Title */}
                      <h1 className="text-gray-900 fw-bolder mb-3">Sign In</h1>
                      {/* end::Title */}
                      {/* begin::Subtitle */}
                      <div className="text-gray-500 fw-semibold fs-6">SEO Booster</div>
                      {/* end::Subtitle= */}
                    </div>
                    {/* begin::Heading */}
                    {/* begin::Login options */}
                    <div className="row g-3 mb-9">
                      {/* begin::Col */}
                      <div className="col-md-6">
                        {/* begin::Google link= */}
                        <button
                          type="button"
                          onClick={() => handleSocialLogin('Google')}
                          className="btn btn-flex btn-outline btn-text-gray-700 btn-active-color-primary bg-state-light flex-center text-nowrap w-100"
                        >
                          <img alt="Logo" src="/assets/media/svg/brand-logos/google-icon.svg" className="h-15px me-3" />
                          Sign in with Google
                        </button>
                        {/* end::Google link= */}
                      </div>
                      {/* end::Col */}
                      {/* begin::Col */}
                      <div className="col-md-6">
                        {/* begin::Google link= */}
                        <button
                          type="button"
                          onClick={() => handleSocialLogin('Apple')}
                          className="btn btn-flex btn-outline btn-text-gray-700 btn-active-color-primary bg-state-light flex-center text-nowrap w-100"
                        >
                          <img alt="Logo" src="/assets/media/svg/brand-logos/apple-black.svg" className="theme-light-show h-15px me-3" />
                          <img alt="Logo" src="/assets/media/svg/brand-logos/apple-black-dark.svg" className="theme-dark-show h-15px me-3" />
                          Sign in with Apple
                        </button>
                        {/* end::Google link= */}
                      </div>
                      {/* end::Col */}
                    </div>
                    {/* end::Login options */}
                    {/* begin::Separator */}
                    <div className="separator separator-content my-14">
                      <span className="w-125px text-gray-500 fw-semibold fs-7">Or with email</span>
                    </div>
                    {/* end::Separator */}
                    {/* begin::Input group= */}
                    <div className="fv-row mb-8">
                      {/* begin::Email */}
                      <input
                        type="text"
                        placeholder="Email"
                        name="email"
                        autoComplete="off"
                        className="form-control bg-transparent"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                      {/* end::Email */}
                    </div>
                    {/* end::Input group= */}
                    <div className="fv-row mb-3">
                      {/* begin::Password */}
                      <input
                        type="password"
                        placeholder="Password"
                        name="password"
                        autoComplete="off"
                        className="form-control bg-transparent"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      {/* end::Password */}
                    </div>
                    {/* end::Input group= */}

                    {/* Error Message */}
                    {error && (
                      <div className="alert alert-danger d-flex align-items-center p-5 mb-8">
                        <i className="ki-outline ki-shield-tick fs-2hx text-danger me-4"></i>
                        <div className="d-flex flex-column">
                          <h4 className="mb-1 text-danger">Login Failed</h4>
                          <span>{error}</span>
                        </div>
                      </div>
                    )}

                    {/* begin::Wrapper */}
                    <div className="d-flex flex-stack flex-wrap gap-3 fs-base fw-semibold mb-8">
                      <div></div>
                      {/* begin::Link */}
                      <Link href="/reset-password" className="link-primary">
                        Forgot Password?
                      </Link>
                      {/* end::Link */}
                    </div>
                    {/* end::Wrapper */}
                    {/* begin::Submit button */}
                    <div className="d-grid mb-10">
                      <button type="submit" id="kt_sign_in_submit" className="btn btn-primary" disabled={loading}>
                        {/* begin::Indicator label */}
                        {!loading && <span className="indicator-label">Sign In</span>}
                        {/* end::Indicator label */}
                        {/* begin::Indicator progress */}
                        {loading && (
                          <span className="indicator-progress" style={{ display: 'block' }}>
                            Please wait...
                            <span className="spinner-border spinner-border-sm align-middle ms-2"></span>
                          </span>
                        )}
                        {/* end::Indicator progress */}
                      </button>
                    </div>
                    {/* end::Submit button */}
                    {/* begin::Sign up */}
                    <div className="text-gray-500 text-center fw-semibold fs-6">
                      Not a Member yet?{' '}
                      <Link href="/onboarding" className="link-primary">
                        Sign up
                      </Link>
                    </div>
                    {/* end::Sign up */}
                  </form>
                  {/* end::Form */}
                </div>
                {/* end::Wrapper */}
              </div>
              {/* end::Form */}
              {/* begin::Footer */}
              <div className="w-lg-500px d-flex flex-stack px-10 mx-auto">
                {/* begin::Languages */}
                <div className="me-10">
                  {/* begin::Toggle */}
                  <button className="btn btn-flex btn-link btn-color-gray-700 btn-active-color-primary rotate fs-base" data-kt-menu-trigger="click" data-kt-menu-placement="bottom-start" data-kt-menu-offset="0px, 0px">
                    <img data-kt-element="current-lang-flag" className="w-20px h-20px rounded me-3" src="/assets/media/flags/united-states.svg" alt="" />
                    <span data-kt-element="current-lang-name" className="me-1">English</span>
                    <span className="d-flex flex-center rotate-180">
                      <i className="ki-outline ki-down fs-5 text-muted m-0"></i>
                    </span>
                  </button>
                  {/* end::Toggle */}
                  {/* begin::Menu */}
                  <div className="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-800 menu-state-bg-light-primary fw-semibold w-200px py-4 fs-7" data-kt-menu="true" id="kt_auth_lang_menu">
                    {/* begin::Menu item */}
                    <div className="menu-item px-3">
                      <a href="#" className="menu-link d-flex px-5" data-kt-lang="English">
                        <span className="symbol symbol-20px me-4">
                          <img data-kt-element="lang-flag" className="rounded-1" src="/assets/media/flags/united-states.svg" alt="" />
                        </span>
                        <span data-kt-element="lang-name">English</span>
                      </a>
                    </div>
                    {/* end::Menu item */}
                  </div>
                  {/* end::Menu */}
                </div>
                {/* end::Languages */}
                {/* begin::Links */}
                <div className="d-flex fw-semibold text-primary fs-base gap-5">
                  <Link href="/terms" target="_blank">Terms</Link>
                  <Link href="/contact" target="_blank">Contact Us</Link>
                </div>
                {/* end::Links */}
              </div>
              {/* end::Footer */}
            </div>
            {/* end::Body */}
            {/* begin::Aside */}
            <div className="d-flex flex-lg-row-fluid w-lg-50 bgi-size-cover bgi-position-center order-1 order-lg-2" style={{ backgroundImage: 'url(/assets/media/misc/auth-bg.png)' }}>
              {/* begin::Content */}
              <div className="d-flex flex-column flex-center py-7 py-lg-15 px-5 px-md-15 w-100">
                {/* begin::Logo */}
                <Link href="/" className="mb-0 mb-lg-12">
                  <img alt="Logo" src="/assets/media/logos/custom-1.png" className="h-60px h-lg-75px" />
                </Link>
                {/* end::Logo */}
                {/* begin::Image */}
                <img className="d-none d-lg-block mx-auto w-275px w-md-50 w-xl-500px mb-10 mb-lg-20" src="/assets/media/misc/auth-screens.png" alt="" />
                {/* end::Image */}
                {/* begin::Title */}
                <h1 className="d-none d-lg-block text-white fs-2qx fw-bolder text-center mb-7">Fast, Efficient and Productive</h1>
                {/* end::Title */}
                {/* begin::Text */}
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
                {/* end::Text */}
              </div>
              {/* end::Content */}
            </div>
            {/* end::Aside */}
          </div>
          {/* end::Authentication - Sign-in */}
        </div>
        {/* end::Root */}
      </div>
      {/* end::Body */}
    </>
  );
};

export default LoginPage;
