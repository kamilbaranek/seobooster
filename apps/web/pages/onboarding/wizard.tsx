import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import DashboardLayout from '../../components/dashboard/layout/DashboardLayout';
import { apiFetch } from '../../lib/api-client';

const WizardPage = () => {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Unified state for all steps
    const [formData, setFormData] = useState({
        websiteType: 'personal',
        websiteAge: '1-1', // Default to 0
        websiteUrl: '',
        cmsPlatform: 'wordpress',
        connectionType: 'application_password',
        userName: '(Must have Editor privileges)',
        password: '',
        projectGoals: [] as string[],
        targetAudience: '',
        competitors: ['', '', ''],
        cta: '',
        ctaOther: ''
    });

    // Helper to update state
    const updateField = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const updateCompetitor = (index: number, value: string) => {
        const newCompetitors = [...formData.competitors];
        newCompetitors[index] = value;
        updateField('competitors', newCompetitors);
    };

    const toggleProjectGoal = (value: string) => {
        const currentGoals = formData.projectGoals;
        if (currentGoals.includes(value)) {
            updateField('projectGoals', currentGoals.filter(g => g !== value));
        } else {
            updateField('projectGoals', [...currentGoals, value]);
        }
    };

    // Pre-fill data if webId is present
    useEffect(() => {
        if (!router.isReady || !router.query.webId) return;

        const fetchWeb = async () => {
            try {
                const webId = router.query.webId as string;
                const [web, credentialsResponse] = await Promise.all([
                    apiFetch<any>(`/webs/${webId}`),
                    apiFetch<any>(`/webs/${webId}/credentials`).catch(() => null)
                ]);

                setFormData(prev => ({
                    ...prev,
                    websiteType: web.projectType || 'personal',
                    websiteAge: web.webAge || '1-1',
                    websiteUrl: web.url || '',
                    cmsPlatform: web.platform || 'wordpress',
                    connectionType: web.integrationType === 'WORDPRESS_APPLICATION_PASSWORD' ? 'application_password' : 'application_password',
                    userName: credentialsResponse?.credentials?.username || '(Must have Editor privileges)',
                    password: credentialsResponse?.hasCredentials ? '******' : '',
                    projectGoals: Array.isArray(web.businessGoal) ? web.businessGoal : (web.businessGoal ? [web.businessGoal] : []),
                    targetAudience: web.audience?.target || '',
                    competitors: web.competitors?.urls || ['', '', ''],
                    cta: ['buy_now', 'sign_up', 'contact_us'].includes(web.conversionGoal) ? web.conversionGoal : (web.conversionGoal ? 'other' : ''),
                    ctaOther: !['buy_now', 'sign_up', 'contact_us'].includes(web.conversionGoal) ? web.conversionGoal : ''
                }));

                // If we have data, maybe we should advance steps? For now, let's start at 1 but pre-filled.
            } catch (error) {
                console.error('Failed to fetch web details:', error);
            }
        };

        fetchWeb();
    }, [router.isReady, router.query.webId]);

    // Validation Logic
    const isStepValid = () => {
        // Steps 1-3 are always required
        if (currentStep === 1) return !!formData.websiteType;
        if (currentStep === 2) return !!formData.websiteAge && !!formData.cmsPlatform; // URL optional? Assuming yes for now or user can fill later.
        if (currentStep === 3) return !!formData.connectionType && !!formData.userName; // Password might be empty if not changed? But here it's new.

        // Logic for Steps 4-7 based on Website Age
        // If Age > 0 ('2-10', '10-50', '50+'), then 4-7 are Optional.
        // If Age == 0 ('1-1'), then 4-7 are Required.
        const isNewWebsite = formData.websiteAge === '1-1';

        if (!isNewWebsite) return true; // Optional for older websites

        // Required for new websites
        if (currentStep === 4) return formData.projectGoals.length > 0;
        if (currentStep === 5) return !!formData.targetAudience;
        if (currentStep === 6) return formData.competitors.some(c => !!c); // At least one competitor?
        if (currentStep === 7) return !!formData.cta;

        return true;
    };

    const nextStep = () => {
        if (isStepValid()) {
            setCurrentStep(prev => Math.min(prev + 1, 8));
            window.scrollTo(0, 0);
        } else {
            alert('Please fill in all required fields.');
        }
    };

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
        window.scrollTo(0, 0);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            let webId = router.query.webId as string;

            // 1. Create Web if not exists
            if (!webId) {
                const webPayload = {
                    url: formData.websiteUrl || `https://placeholder-${Date.now()}.com`, // Fallback if empty
                    integrationType: formData.connectionType === 'application_password' ? 'WORDPRESS_APPLICATION_PASSWORD' : 'NONE', // Simplify mapping
                    nickname: formData.websiteUrl,
                };

                const web = await apiFetch<any>('/webs', {
                    method: 'POST',
                    body: JSON.stringify(webPayload),
                });
                webId = web.id;
            }

            // 2. Update Web with details
            const updatePayload = {
                onboardingStep: 8,
                projectType: formData.websiteType,
                webAge: formData.websiteAge,
                platform: formData.cmsPlatform,
                businessGoal: formData.projectGoals,
                audience: { target: formData.targetAudience },
                competitors: { urls: formData.competitors },
                conversionGoal: formData.cta === 'other' ? formData.ctaOther : formData.cta,
                // Save credentials if provided
            };

            await apiFetch(`/webs/${webId}`, {
                method: 'PATCH',
                body: JSON.stringify(updatePayload),
            });

            // 3. Save Credentials if WP
            // Only save if password is NOT masked (******)
            if (formData.connectionType === 'application_password' && formData.userName && formData.password && formData.password !== '******') {
                await apiFetch(`/webs/${webId}/credentials`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        username: formData.userName,
                        applicationPassword: formData.password
                    }),
                });
            }

            // Redirect
            router.push('/dashboard');

        } catch (error) {
            console.error(error);
            alert('Failed to save data. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Head>
                <title>SEO Booster – Onboarding</title>
            </Head>
            <DashboardLayout>
                {/* begin::Content */}
                <div id="kt_app_content" className="app-content flex-column-fluid">
                    {/* begin::Content container */}
                    <div id="kt_app_content_container" className="app-container container-fluid">
                        {/* begin::Card */}
                        <div className="card">
                            {/* begin::Card body */}
                            <div className="card-body">
                                {/* begin::Stepper */}
                                <div className="stepper stepper-links d-flex flex-column pt-15" id="kt_create_account_stepper">
                                    {/* begin::Nav */}
                                    <div className="stepper-nav mb-5">
                                        {/* begin::Step 1 */}
                                        <div className={`stepper-item ${currentStep === 1 ? 'current' : ''} ${currentStep > 1 ? 'completed' : ''}`} data-kt-stepper-element="nav">
                                            <h3 className="stepper-title">Website Type</h3>
                                        </div>
                                        {/* end::Step 1 */}
                                        {/* begin::Step 2 */}
                                        <div className={`stepper-item ${currentStep === 2 ? 'current' : ''} ${currentStep > 2 ? 'completed' : ''}`} data-kt-stepper-element="nav">
                                            <h3 className="stepper-title">Website Info</h3>
                                        </div>
                                        {/* end::Step 2 */}
                                        {/* begin::Step 3 */}
                                        <div className={`stepper-item ${currentStep === 3 ? 'current' : ''} ${currentStep > 3 ? 'completed' : ''}`} data-kt-stepper-element="nav">
                                            <h3 className="stepper-title">Business Info</h3>
                                        </div>
                                        {/* end::Step 3 */}
                                        {/* begin::Step 4 */}
                                        <div className={`stepper-item ${currentStep === 4 ? 'current' : ''} ${currentStep > 4 ? 'completed' : ''}`} data-kt-stepper-element="nav">
                                            <h3 className="stepper-title">Project Goals</h3>
                                        </div>
                                        {/* end::Step 4 */}
                                        {/* begin::Step 5 */}
                                        <div className={`stepper-item ${currentStep === 5 ? 'current' : ''} ${currentStep > 5 ? 'completed' : ''}`} data-kt-stepper-element="nav">
                                            <h3 className="stepper-title">Target Audience</h3>
                                        </div>
                                        {/* end::Step 5 */}
                                        {/* begin::Step 6 */}
                                        <div className={`stepper-item ${currentStep === 6 ? 'current' : ''} ${currentStep > 6 ? 'completed' : ''}`} data-kt-stepper-element="nav">
                                            <h3 className="stepper-title">Competitors</h3>
                                        </div>
                                        {/* end::Step 6 */}
                                        {/* begin::Step 7 */}
                                        <div className={`stepper-item ${currentStep === 7 ? 'current' : ''} ${currentStep > 7 ? 'completed' : ''}`} data-kt-stepper-element="nav">
                                            <h3 className="stepper-title">CTA</h3>
                                        </div>
                                        {/* end::Step 7 */}
                                        {/* begin::Step 8 */}
                                        <div className={`stepper-item ${currentStep === 8 ? 'current' : ''} ${currentStep > 8 ? 'completed' : ''}`} data-kt-stepper-element="nav">
                                            <h3 className="stepper-title">Completed</h3>
                                        </div>
                                        {/* end::Step 8 */}
                                    </div>
                                    {/* end::Nav */}
                                    {/* begin::Form */}
                                    <form className="mx-auto mw-600px w-100 pt-15 pb-10" noValidate id="kt_create_account_form">
                                        {/* begin::Step 1 */}
                                        <div className={currentStep === 1 ? 'current' : 'd-none'} data-kt-stepper-element="content">
                                            {/* begin::Wrapper */}
                                            <div className="w-100">
                                                {/* begin::Heading */}
                                                <div className="pb-10 pb-lg-15">
                                                    {/* begin::Title */}
                                                    <h2 className="fw-bold d-flex align-items-center text-gray-900">Choose Account Type
                                                        <span className="ms-1" data-bs-toggle="tooltip" title="Billing is issued based on your selected account typ">
                                                            <i className="ki-outline ki-information-5 text-gray-500 fs-6"></i>
                                                        </span></h2>
                                                    {/* end::Title */}
                                                    {/* begin::Notice */}
                                                    <div className="text-muted fw-semibold fs-6">If you need more info, please check out
                                                        <a href="#" className="link-primary fw-bold">Help Page</a>.</div>
                                                    {/* end::Notice */}
                                                </div>
                                                {/* end::Heading */}
                                                {/* begin::Input group */}
                                                <div className="fv-row">
                                                    {/* begin::Row */}
                                                    <div className="row">
                                                        {/* begin::Col */}
                                                        <div className="col-lg-6">
                                                            {/* begin::Option */}
                                                            <input type="radio" className="btn-check" name="website_type" value="personal" checked={formData.websiteType === 'personal'} onChange={() => updateField('websiteType', 'personal')} id="kt_create_account_form_website_type_personal" />
                                                            <label className={`btn btn-outline btn-outline-dashed btn-active-light-primary p-7 d-flex align-items-center mb-10 ${formData.websiteType === 'personal' ? 'active' : ''}`} htmlFor="kt_create_account_form_website_type_personal">
                                                                <i className="ki-outline ki-badge fs-3x me-5"></i>
                                                                {/* begin::Info */}
                                                                <span className="d-block fw-semibold text-start">
                                                                    <span className="text-gray-900 fw-bold d-block fs-4 mb-2">Personal Account</span>
                                                                    <span className="text-muted fw-semibold fs-6">If you need more info, please check it out</span>
                                                                </span>
                                                                {/* end::Info */}
                                                            </label>
                                                            {/* end::Option */}
                                                        </div>
                                                        {/* end::Col */}
                                                        {/* begin::Col */}
                                                        <div className="col-lg-6">
                                                            {/* begin::Option */}
                                                            <input type="radio" className="btn-check" name="website_type" value="corporate" checked={formData.websiteType === 'corporate'} onChange={() => updateField('websiteType', 'corporate')} id="kt_create_account_form_website_type_corporate" />
                                                            <label className={`btn btn-outline btn-outline-dashed btn-active-light-primary p-7 d-flex align-items-center ${formData.websiteType === 'corporate' ? 'active' : ''}`} htmlFor="kt_create_account_form_website_type_corporate">
                                                                <i className="ki-outline ki-briefcase fs-3x me-5"></i>
                                                                {/* begin::Info */}
                                                                <span className="d-block fw-semibold text-start">
                                                                    <span className="text-gray-900 fw-bold d-block fs-4 mb-2">Corporate Account</span>
                                                                    <span className="text-muted fw-semibold fs-6">Create corporate account to mane users</span>
                                                                </span>
                                                                {/* end::Info */}
                                                            </label>
                                                            {/* end::Option */}
                                                        </div>
                                                        {/* end::Col */}
                                                    </div>
                                                    {/* end::Row */}
                                                </div>
                                                {/* end::Input group */}
                                            </div>
                                            {/* end::Wrapper */}
                                        </div>
                                        {/* end::Step 1 */}
                                        {/* begin::Step 2 */}
                                        <div className={currentStep === 2 ? 'current' : 'd-none'} data-kt-stepper-element="content">
                                            {/* begin::Wrapper */}
                                            <div className="w-100">
                                                {/* begin::Heading */}
                                                <div className="pb-10 pb-lg-15">
                                                    {/* begin::Title */}
                                                    <h2 className="fw-bold text-gray-900">Website Info</h2>
                                                    {/* end::Title */}
                                                    {/* begin::Notice */}
                                                    <div className="text-muted fw-semibold fs-6">If you need more info, please check out
                                                        <a href="#" className="link-primary fw-bold"> Help Page</a>.</div>
                                                    {/* end::Notice */}
                                                </div>
                                                {/* end::Heading */}
                                                {/* begin::Input group */}
                                                <div className="mb-10 fv-row">
                                                    {/* begin::Label */}
                                                    <label className="d-flex align-items-center form-label mb-3">Website Age
                                                        <span className="ms-1" data-bs-toggle="tooltip" title="How long has your website been active?">
                                                            <i className="ki-outline ki-information-5 text-gray-500 fs-6"></i>
                                                        </span></label>
                                                    {/* end::Label */}
                                                    {/* begin::Row */}
                                                    <div className="row mb-2" data-kt-buttons="true">
                                                        {/* begin::Col */}
                                                        <div className="col">
                                                            {/* begin::Option */}
                                                            <label className={`btn btn-outline btn-outline-dashed btn-active-light-primary w-100 p-4 ${formData.websiteAge === '1-1' ? 'active' : ''}`}>
                                                                <input type="radio" className="btn-check" name="website_age" value="1-1" checked={formData.websiteAge === '1-1'} onChange={() => updateField('websiteAge', '1-1')} />
                                                                <span className="fw-bold fs-3">0</span>
                                                            </label>
                                                            {/* end::Option */}
                                                        </div>
                                                        {/* end::Col */}
                                                        {/* begin::Col */}
                                                        <div className="col">
                                                            {/* begin::Option */}
                                                            <label className={`btn btn-outline btn-outline-dashed btn-active-light-primary w-100 p-4 ${formData.websiteAge === '2-10' ? 'active' : ''}`}>
                                                                <input type="radio" className="btn-check" name="website_age" value="2-10" checked={formData.websiteAge === '2-10'} onChange={() => updateField('websiteAge', '2-10')} />
                                                                <span className="fw-bold fs-3">1</span>
                                                            </label>
                                                            {/* end::Option */}
                                                        </div>
                                                        {/* end::Col */}
                                                        {/* begin::Col */}
                                                        <div className="col">
                                                            {/* begin::Option */}
                                                            <label className={`btn btn-outline btn-outline-dashed btn-active-light-primary w-100 p-4 ${formData.websiteAge === '10-50' ? 'active' : ''}`}>
                                                                <input type="radio" className="btn-check" name="website_age" value="10-50" checked={formData.websiteAge === '10-50'} onChange={() => updateField('websiteAge', '10-50')} />
                                                                <span className="fw-bold fs-3">2-3</span>
                                                            </label>
                                                            {/* end::Option */}
                                                        </div>
                                                        {/* end::Col */}
                                                        {/* begin::Col */}
                                                        <div className="col">
                                                            {/* begin::Option */}
                                                            <label className={`btn btn-outline btn-outline-dashed btn-active-light-primary w-100 p-4 ${formData.websiteAge === '50+' ? 'active' : ''}`}>
                                                                <input type="radio" className="btn-check" name="website_age" value="50+" checked={formData.websiteAge === '50+'} onChange={() => updateField('websiteAge', '50+')} />
                                                                <span className="fw-bold fs-3">4+</span>
                                                            </label>
                                                            {/* end::Option */}
                                                        </div>
                                                        {/* end::Col */}
                                                    </div>
                                                    {/* end::Row */}
                                                    {/* begin::Hint */}
                                                    <div className="form-text">If the website has no content or is unmaintained, always select 0.</div>
                                                    {/* end::Hint */}
                                                </div>
                                                {/* end::Input group */}
                                                {/* begin::Input group */}
                                                <div className="mb-10 fv-row">
                                                    {/* begin::Label */}
                                                    <label className="form-label mb-3">Website URL</label>
                                                    {/* end::Label */}
                                                    {/* begin::Input */}
                                                    <input type="text" className="form-control form-control-lg form-control-solid" name="website_url" placeholder="https://example.com" value={formData.websiteUrl} onChange={(e) => updateField('websiteUrl', e.target.value)} />
                                                    {/* end::Input */}
                                                </div>
                                                {/* end::Input group */}
                                                {/* begin::Input group */}
                                                <div className="mb-0 fv-row">
                                                    {/* begin::Label */}
                                                    <label className="d-flex align-items-center form-label mb-5">Select Web CMS (Platform)
                                                        <span className="ms-1" data-bs-toggle="tooltip" title="Monthly billing will be based on your account plan">
                                                            <i className="ki-outline ki-information-5 text-gray-500 fs-6"></i>
                                                        </span></label>
                                                    {/* end::Label */}
                                                    {/* begin::Options */}
                                                    <div className="mb-0">
                                                        {/* begin:Option */}
                                                        <label className="d-flex flex-stack mb-5 cursor-pointer">
                                                            {/* begin:Label */}
                                                            <span className="d-flex align-items-center me-2">
                                                                {/* begin::Icon */}
                                                                <span className="symbol symbol-50px me-6">
                                                                    <span className="symbol-label">
                                                                        <i className="ki-outline ki-bank fs-1 text-gray-600"></i>
                                                                    </span>
                                                                </span>
                                                                {/* end::Icon */}
                                                                {/* begin::Description */}
                                                                <span className="d-flex flex-column">
                                                                    <span className="fw-bold text-gray-800 text-hover-primary fs-5">Wordpress</span>
                                                                    <span className="fs-6 fw-semibold text-muted">Use images to enhance your post flow</span>
                                                                </span>
                                                                {/* end:Description */}
                                                            </span>
                                                            {/* end:Label */}
                                                            {/* begin:Input */}
                                                            <span className="form-check form-check-custom form-check-solid">
                                                                <input className="form-check-input" type="radio" name="cms_platform" value="wordpress" checked={formData.cmsPlatform === 'wordpress'} onChange={() => updateField('cmsPlatform', 'wordpress')} />
                                                            </span>
                                                            {/* end:Input */}
                                                        </label>
                                                        {/* end::Option */}
                                                        {/* begin:Option */}
                                                        <label className="d-flex flex-stack mb-5 cursor-pointer">
                                                            {/* begin:Label */}
                                                            <span className="d-flex align-items-center me-2">
                                                                {/* begin::Icon */}
                                                                <span className="symbol symbol-50px me-6">
                                                                    <span className="symbol-label">
                                                                        <i className="ki-outline ki-chart fs-1 text-gray-600"></i>
                                                                    </span>
                                                                </span>
                                                                {/* end::Icon */}
                                                                {/* begin::Description */}
                                                                <span className="d-flex flex-column">
                                                                    <span className="fw-bold text-gray-800 text-hover-primary fs-5">Shopify</span>
                                                                    <span className="fs-6 fw-semibold text-muted">Use images to your post time</span>
                                                                </span>
                                                                {/* end:Description */}
                                                            </span>
                                                            {/* end:Label */}
                                                            {/* begin:Input */}
                                                            <span className="form-check form-check-custom form-check-solid">
                                                                <input className="form-check-input" type="radio" name="cms_platform" value="shopify" checked={formData.cmsPlatform === 'shopify'} onChange={() => updateField('cmsPlatform', 'shopify')} />
                                                            </span>
                                                            {/* end:Input */}
                                                        </label>
                                                        {/* end::Option */}
                                                        {/* begin:Option */}
                                                        <label className="d-flex flex-stack mb-0 cursor-pointer">
                                                            {/* begin:Label */}
                                                            <span className="d-flex align-items-center me-2">
                                                                {/* begin::Icon */}
                                                                <span className="symbol symbol-50px me-6">
                                                                    <span className="symbol-label">
                                                                        <i className="ki-outline ki-chart-pie-4 fs-1 text-gray-600"></i>
                                                                    </span>
                                                                </span>
                                                                {/* end::Icon */}
                                                                {/* begin::Description */}
                                                                <span className="d-flex flex-column">
                                                                    <span className="fw-bold text-gray-800 text-hover-primary fs-5">Wix</span>
                                                                    <span className="fs-6 fw-semibold text-muted">Use images to enhance time travel rivers</span>
                                                                </span>
                                                                {/* end:Description */}
                                                            </span>
                                                            {/* end:Label */}
                                                            {/* begin:Input */}
                                                            <span className="form-check form-check-custom form-check-solid">
                                                                <input className="form-check-input" type="radio" name="cms_platform" value="wix" checked={formData.cmsPlatform === 'wix'} onChange={() => updateField('cmsPlatform', 'wix')} />
                                                            </span>
                                                            {/* end:Input */}
                                                        </label>
                                                        {/* end::Option */}
                                                    </div>
                                                    {/* end::Options */}
                                                </div>
                                                {/* end::Input group */}
                                            </div>
                                            {/* end::Wrapper */}
                                        </div>
                                        {/* end::Step 2 */}
                                        {/* begin::Step 3 */}
                                        <div className={currentStep === 3 ? 'current' : 'd-none'} data-kt-stepper-element="content">
                                            {/* begin::Wrapper */}
                                            <div className="w-100">
                                                {/* begin::Heading */}
                                                <div className="pb-10 pb-lg-12">
                                                    {/* begin::Title */}
                                                    <h2 className="fw-bold text-gray-900">Connection Details</h2>
                                                    {/* end::Title */}
                                                    {/* begin::Notice */}
                                                    <div className="text-muted fw-semibold fs-6">If you need more info, please check out
                                                        <a href="#" className="link-primary fw-bold"> Help Page</a>.</div>
                                                    {/* end::Notice */}
                                                </div>
                                                {/* end::Heading */}
                                                {/* begin::Input group */}
                                                <div className="fv-row mb-10">
                                                    {/* begin::Label */}
                                                    <label className="form-label required">Connection Type</label>
                                                    {/* end::Label */}
                                                    {/* begin::Input */}
                                                    <select name="connection_type" className="form-select form-select-lg form-select-solid" data-control="select2" data-placeholder="Select..." data-allow-clear="true" data-hide-search="true" value={formData.connectionType} onChange={(e) => updateField('connectionType', e.target.value)}>
                                                        <option value="application_password">Application Password</option>
                                                        <option value="oauth">OAuth</option>
                                                        <option value="api_key">API Key</option>
                                                    </select>
                                                    {/* end::Input */}
                                                </div>
                                                {/* end::Input group */}
                                                {/* begin::Input group */}
                                                <div className="fv-row mb-10">
                                                    {/* begin::Label */}
                                                    <label className="form-label required">User Name</label>
                                                    {/* end::Label */}
                                                    {/* begin::Input */}
                                                    <input name="user_name" className="form-control form-control-lg form-control-solid" value={formData.userName} onChange={(e) => updateField('userName', e.target.value)} />
                                                    {/* end::Input */}
                                                </div>
                                                {/* end::Input group */}
                                                {/* begin::Input group */}
                                                <div className="fv-row mb-10">
                                                    {/* begin::Label */}
                                                    <label className="d-flex align-items-center form-label">
                                                        <span className="required">Password</span>
                                                        <span className="lh-1 ms-1" data-bs-toggle="popover" data-bs-trigger="hover" data-bs-html="true" data-bs-content="<div class='p-4 rounded bg-light'> <div class='d-flex flex-stack text-muted mb-4'> <i class='ki-outline ki-bank fs-3 me-3'></i> <div class='fw-bold'>INCBANK **** 1245 STATEMENT</div> </div> <div class='d-flex flex-stack fw-semibold text-gray-600'> <div>Amount</div> <div>Transaction</div> </div> <div class='separator separator-dashed my-2'></div> <div class='d-flex flex-stack text-gray-900 fw-bold mb-2'> <div>USD345.00</div> <div>KEENTHEMES*</div> </div> <div class='d-flex flex-stack text-muted mb-2'> <div>USD75.00</div> <div>Hosting fee</div> </div> <div class='d-flex flex-stack text-muted'> <div>USD3,950.00</div> <div>Payrol</div> </div> </div>">
                                                            <i className="ki-outline ki-information-5 text-gray-500 fs-6"></i>
                                                        </span>
                                                    </label>
                                                    {/* end::Label */}
                                                    {/* begin::Input */}
                                                    <input type="password" name="password" className="form-control form-control-lg form-control-solid" value={formData.password} onChange={(e) => updateField('password', e.target.value)} />
                                                    {/* end::Input */}
                                                    {/* begin::Hint */}
                                                    <div className="form-text">Do not enter password to your WP account here, it must be Application Password!</div>
                                                    {/* end::Hint */}
                                                </div>
                                                {/* end::Input group */}

                                            </div>
                                            {/* end::Wrapper */}
                                        </div>
                                        {/* end::Step 3 */}
                                        {/* begin::Step 4 */}
                                        <div className={currentStep === 4 ? 'current' : 'd-none'} data-kt-stepper-element="content">
                                            {/* begin::Wrapper */}
                                            <div className="w-100">
                                                {/* begin::Heading */}
                                                <div className="pb-10 pb-lg-15">
                                                    {/* begin::Title */}
                                                    <h2 className="fw-bold d-flex align-items-center text-gray-900">Project Goals
                                                        <span className="ms-1" data-bs-toggle="tooltip" title="Billing is issued based on your selected account typ">
                                                            <i className="ki-outline ki-information-5 text-gray-500 fs-6"></i>
                                                        </span></h2>
                                                    {/* end::Title */}
                                                    {/* begin::Notice */}
                                                    <div className="text-muted fw-semibold fs-6">If you need more info, please check out
                                                        <a href="#" className="link-primary fw-bold"> Help Page</a>.</div>
                                                    {/* end::Notice */}
                                                </div>
                                                {/* end::Heading */}
                                                {/* begin::Input group */}
                                                <div className="fv-row">
                                                    {/* begin::Row */}
                                                    <div className="row">
                                                        {/* begin::Col */}
                                                        <div className="col-lg-6">
                                                            {/* begin::Option */}
                                                            <input type="checkbox" className="btn-check" name="project_goals" value="conversions" checked={formData.projectGoals.includes('conversions')} onChange={() => toggleProjectGoal('conversions')} id="kt_create_account_form_goal_conversions" />
                                                            <label className={`btn btn-outline btn-outline-dashed btn-active-light-primary p-7 d-flex align-items-center mb-10 ${formData.projectGoals.includes('conversions') ? 'active' : ''}`} htmlFor="kt_create_account_form_goal_conversions">
                                                                <i className="ki-outline ki-badge fs-3x me-5"></i>
                                                                {/* begin::Info */}
                                                                <span className="d-block fw-semibold text-start">
                                                                    <span className="text-gray-900 fw-bold d-block fs-4 mb-2">Get more conversions</span>
                                                                    <span className="text-muted fw-semibold fs-6">If you need more info, please check it out</span>
                                                                </span>
                                                                {/* end::Info */}
                                                            </label>
                                                            {/* end::Option */}
                                                        </div>
                                                        {/* end::Col */}
                                                        {/* begin::Col */}
                                                        <div className="col-lg-6">
                                                            {/* begin::Option */}
                                                            <input type="checkbox" className="btn-check" name="project_goals" value="traffic" checked={formData.projectGoals.includes('traffic')} onChange={() => toggleProjectGoal('traffic')} id="kt_create_account_form_goal_traffic" />
                                                            <label className={`btn btn-outline btn-outline-dashed btn-active-light-primary p-7 d-flex align-items-center mb-10 ${formData.projectGoals.includes('traffic') ? 'active' : ''}`} htmlFor="kt_create_account_form_goal_traffic">
                                                                <i className="ki-outline ki-briefcase fs-3x me-5"></i>
                                                                {/* begin::Info */}
                                                                <span className="d-block fw-semibold text-start">
                                                                    <span className="text-gray-900 fw-bold d-block fs-4 mb-2">Get more traffic</span>
                                                                    <span className="text-muted fw-semibold fs-6">Create corporate account to mane users</span>
                                                                </span>
                                                                {/* end::Info */}
                                                            </label>
                                                            {/* end::Option */}
                                                        </div>
                                                        {/* end::Col */}
                                                    </div>
                                                    {/* end::Row */}
                                                    {/* begin::Row */}
                                                    <div className="row">
                                                        {/* begin::Col */}
                                                        <div className="col-lg-6">
                                                            {/* begin::Option */}
                                                            <input type="checkbox" className="btn-check" name="project_goals" value="acquire_customers" checked={formData.projectGoals.includes('acquire_customers')} onChange={() => toggleProjectGoal('acquire_customers')} id="kt_create_account_form_goal_acquire_customers" />
                                                            <label className={`btn btn-outline btn-outline-dashed btn-active-light-primary p-7 d-flex align-items-center mb-10 ${formData.projectGoals.includes('acquire_customers') ? 'active' : ''}`} htmlFor="kt_create_account_form_goal_acquire_customers">
                                                                <i className="ki-outline ki-user fs-3x me-5"></i>
                                                                {/* begin::Info */}
                                                                <span className="d-block fw-semibold text-start">
                                                                    <span className="text-gray-900 fw-bold d-block fs-4 mb-2">Acquire Customers</span>
                                                                    <span className="text-muted fw-semibold fs-6">Create corporate account to mane users</span>
                                                                </span>
                                                                {/* end::Info */}
                                                            </label>
                                                            {/* end::Option */}
                                                        </div>
                                                        {/* end::Col */}
                                                        {/* begin::Col */}
                                                        <div className="col-lg-6">
                                                            {/* begin::Option */}
                                                            <input type="checkbox" className="btn-check" name="project_goals" value="brand_awareness" checked={formData.projectGoals.includes('brand_awareness')} onChange={() => toggleProjectGoal('brand_awareness')} id="kt_create_account_form_goal_brand_awareness" />
                                                            <label className={`btn btn-outline btn-outline-dashed btn-active-light-primary p-7 d-flex align-items-center mb-10 ${formData.projectGoals.includes('brand_awareness') ? 'active' : ''}`} htmlFor="kt_create_account_form_goal_brand_awareness">
                                                                <i className="ki-outline ki-badge fs-3x me-5"></i>
                                                                {/* begin::Info */}
                                                                <span className="d-block fw-semibold text-start">
                                                                    <span className="text-gray-900 fw-bold d-block fs-4 mb-2">Brand Awareness</span>
                                                                    <span className="text-muted fw-semibold fs-6">If you need more info, please check it out</span>
                                                                </span>
                                                                {/* end::Info */}
                                                            </label>
                                                            {/* end::Option */}
                                                        </div>
                                                        {/* end::Col */}
                                                    </div>
                                                    {/* end::Row */}
                                                    {/* begin::Row */}
                                                    <div className="row">
                                                        {/* begin::Col */}
                                                        <div className="col-lg-6">
                                                            {/* begin::Option */}
                                                            <input type="checkbox" className="btn-check" name="project_goals" value="other" checked={formData.projectGoals.includes('other')} onChange={() => toggleProjectGoal('other')} id="kt_create_account_form_project_goals_other" />
                                                            <label className={`btn btn-outline btn-outline-dashed btn-active-light-primary p-7 d-flex align-items-center mb-10 ${formData.projectGoals.includes('other') ? 'active' : ''}`} htmlFor="kt_create_account_form_project_goals_other">
                                                                <i className="ki-outline ki-badge fs-3x me-5"></i>
                                                                {/* begin::Info */}
                                                                <span className="d-block fw-semibold text-start">
                                                                    <span className="text-gray-900 fw-bold d-block fs-4 mb-2">Other</span>
                                                                    <span className="text-muted fw-semibold fs-6">If you need more info, please check it out</span>
                                                                </span>
                                                                {/* end::Info */}
                                                            </label>
                                                            {/* end::Option */}
                                                        </div>
                                                        {/* end::Col */}
                                                    </div>
                                                    {/* end::Row */}
                                                </div>
                                                {/* end::Input group */}
                                            </div>
                                            {/* end::Wrapper */}
                                        </div>
                                        {/* end::Step 4 */}
                                        {/* begin::Step 5 */}
                                        {/* begin::Step 5 */}
                                        <div className={currentStep === 5 ? 'current' : 'd-none'} data-kt-stepper-element="content">
                                            {/* begin::Wrapper */}
                                            <div className="w-100">
                                                {/* begin::Heading */}
                                                <div className="pb-10 pb-lg-15">
                                                    {/* begin::Title */}
                                                    <h2 className="fw-bold d-flex align-items-center text-gray-900">Target Audience
                                                        <span className="ms-1" data-bs-toggle="tooltip" title="Billing is issued based on your selected account typ">
                                                            <i className="ki-outline ki-information-5 text-gray-500 fs-6"></i>
                                                        </span></h2>
                                                    {/* end::Title */}
                                                    {/* begin::Notice */}
                                                    <div className="text-muted fw-semibold fs-6">If you need more info, please check out
                                                        <a href="#" className="link-primary fw-bold"> Help Page</a>.</div>
                                                    {/* end::Notice */}
                                                </div>
                                                {/* end::Heading */}
                                                {/* begin::Input group */}
                                                <div className="fv-row">
                                                    {/* begin::Row */}
                                                    <div className="row">
                                                        {/* begin::Col */}
                                                        <div className="col-lg-6">
                                                            {/* begin::Option */}
                                                            <input type="radio" className="btn-check" name="target_audience" value="b2b" checked={formData.targetAudience === 'b2b'} onChange={() => updateField('targetAudience', 'b2b')} id="kt_create_account_form_target_audience_b2b" />
                                                            <label className={`btn btn-outline btn-outline-dashed btn-active-light-primary p-7 d-flex align-items-center mb-10 ${formData.targetAudience === 'b2b' ? 'active' : ''}`} htmlFor="kt_create_account_form_target_audience_b2b">
                                                                <i className="ki-outline ki-badge fs-3x me-5"></i>
                                                                {/* begin::Info */}
                                                                <span className="d-block fw-semibold text-start">
                                                                    <span className="text-gray-900 fw-bold d-block fs-4 mb-2">Business (B2B)</span>
                                                                    <span className="text-muted fw-semibold fs-6">If you need more info, please check it out</span>
                                                                </span>
                                                                {/* end::Info */}
                                                            </label>
                                                            {/* end::Option */}
                                                        </div>
                                                        {/* end::Col */}
                                                        {/* begin::Col */}
                                                        <div className="col-lg-6">
                                                            {/* begin::Option */}
                                                            <input type="radio" className="btn-check" name="target_audience" value="b2c" checked={formData.targetAudience === 'b2c'} onChange={() => updateField('targetAudience', 'b2c')} id="kt_create_account_form_target_audience_b2c" />
                                                            <label className={`btn btn-outline btn-outline-dashed btn-active-light-primary p-7 d-flex align-items-center ${formData.targetAudience === 'b2c' ? 'active' : ''}`} htmlFor="kt_create_account_form_target_audience_b2c">
                                                                <i className="ki-outline ki-briefcase fs-3x me-5"></i>
                                                                {/* begin::Info */}
                                                                <span className="d-block fw-semibold text-start">
                                                                    <span className="text-gray-900 fw-bold d-block fs-4 mb-2">Consumer (B2C)</span>
                                                                    <span className="text-muted fw-semibold fs-6">Create corporate account to mane users</span>
                                                                </span>
                                                                {/* end::Info */}
                                                            </label>
                                                            {/* end::Option */}
                                                        </div>
                                                        {/* end::Col */}
                                                    </div>
                                                    {/* end::Row */}
                                                    {/* begin::Row */}
                                                    <div className="row">
                                                        {/* begin::Col */}
                                                        <div className="col-lg-6">
                                                            {/* begin::Option */}
                                                            <input type="radio" className="btn-check" name="target_audience" value="ecommerce" checked={formData.targetAudience === 'ecommerce'} onChange={() => updateField('targetAudience', 'ecommerce')} id="kt_create_account_form_target_audience_ecommerce" />
                                                            <label className={`btn btn-outline btn-outline-dashed btn-active-light-primary p-7 d-flex align-items-center mb-10 ${formData.targetAudience === 'ecommerce' ? 'active' : ''}`} htmlFor="kt_create_account_form_target_audience_ecommerce">
                                                                <i className="ki-outline ki-badge fs-3x me-5"></i>
                                                                {/* begin::Info */}
                                                                <span className="d-block fw-semibold text-start">
                                                                    <span className="text-gray-900 fw-bold d-block fs-4 mb-2">E-commerce</span>
                                                                    <span className="text-muted fw-semibold fs-6">If you need more info, please check it out</span>
                                                                </span>
                                                                {/* end::Info */}
                                                            </label>
                                                            {/* end::Option */}
                                                        </div>
                                                        {/* end::Col */}
                                                        {/* begin::Col */}
                                                        <div className="col-lg-6">
                                                            {/* begin::Option */}
                                                            <input type="radio" className="btn-check" name="target_audience" value="local_business" checked={formData.targetAudience === 'local_business'} onChange={() => updateField('targetAudience', 'local_business')} id="kt_create_account_form_target_audience_local_business" />
                                                            <label className={`btn btn-outline btn-outline-dashed btn-active-light-primary p-7 d-flex align-items-center ${formData.targetAudience === 'local_business' ? 'active' : ''}`} htmlFor="kt_create_account_form_target_audience_local_business">
                                                                <i className="ki-outline ki-briefcase fs-3x me-5"></i>
                                                                {/* begin::Info */}
                                                                <span className="d-block fw-semibold text-start">
                                                                    <span className="text-gray-900 fw-bold d-block fs-4 mb-2">Local Business</span>
                                                                    <span className="text-muted fw-semibold fs-6">Create corporate account to mane users</span>
                                                                </span>
                                                                {/* end::Info */}
                                                            </label>
                                                            {/* end::Option */}
                                                        </div>
                                                        {/* end::Col */}
                                                    </div>
                                                    {/* end::Row */}
                                                </div>
                                                {/* end::Input group */}
                                            </div>
                                            {/* end::Wrapper */}
                                        </div>
                                        {/* end::Step 5 */}
                                        {/* begin::Step 6 */}
                                        <div className={currentStep === 6 ? 'current' : 'd-none'} data-kt-stepper-element="content">
                                            {/* begin::Wrapper */}
                                            <div className="w-100">
                                                {/* begin::Heading */}
                                                <div className="pb-10 pb-lg-15">
                                                    {/* begin::Title */}
                                                    <h2 className="fw-bold text-gray-900">Competitors</h2>
                                                    {/* end::Title */}
                                                    {/* begin::Notice */}
                                                    <div className="text-muted fw-semibold fs-6">If you need more info, please check out
                                                        <a href="#" className="text-primary fw-bold"> Help Page</a>.</div>
                                                    {/* end::Notice */}
                                                </div>
                                                {/* end::Heading */}
                                                {/* begin::Input group */}
                                                <div className="fv-row mb-10">
                                                    {/* begin::Label */}
                                                    <label className="form-label required">Competitor 1</label>
                                                    {/* end::Label */}
                                                    {/* begin::Input */}
                                                    <input name="competitor_1" className="form-control form-control-lg form-control-solid" value={formData.competitors[0]} onChange={(e) => updateCompetitor(0, e.target.value)} />
                                                    {/* end::Input */}
                                                </div>
                                                {/* end::Input group */}
                                                {/* begin::Input group */}
                                                <div className="fv-row mb-10">
                                                    {/* begin::Label */}
                                                    <label className="form-label">Competitor 2</label>
                                                    {/* end::Label */}
                                                    {/* begin::Input */}
                                                    <input name="competitor_2" className="form-control form-control-lg form-control-solid" value={formData.competitors[1]} onChange={(e) => updateCompetitor(1, e.target.value)} />
                                                    {/* end::Input */}
                                                </div>
                                                {/* end::Input group */}
                                                {/* begin::Input group */}
                                                <div className="fv-row mb-10">
                                                    {/* begin::Label */}
                                                    <label className="form-label">Competitor 3</label>
                                                    {/* end::Label */}
                                                    {/* begin::Input */}
                                                    <input name="competitor_3" className="form-control form-control-lg form-control-solid" value={formData.competitors[2]} onChange={(e) => updateCompetitor(2, e.target.value)} />
                                                    {/* end::Input */}
                                                </div>
                                                {/* end::Input group */}
                                            </div>
                                            {/* end::Wrapper */}
                                        </div>
                                        {/* end::Step 6 */}
                                        {/* begin::Step 7 */}
                                        <div className={currentStep === 7 ? 'current' : 'd-none'} data-kt-stepper-element="content">
                                            {/* begin::Wrapper */}
                                            <div className="w-100">
                                                {/* begin::Heading */}
                                                <div className="pb-10 pb-lg-15">
                                                    {/* begin::Title */}
                                                    <h2 className="fw-bold d-flex align-items-center text-gray-900">Desired User Actions
                                                        <span className="ms-1" data-bs-toggle="tooltip" title="Billing is issued based on your selected account typ">
                                                            <i className="ki-outline ki-information-5 text-gray-500 fs-6"></i>
                                                        </span></h2>
                                                    {/* end::Title */}
                                                    {/* begin::Notice */}
                                                    <div className="text-muted fw-semibold fs-6">If you need more info, please check out
                                                        <a href="#" className="link-primary fw-bold"> Help Page</a>.</div>
                                                    {/* end::Notice */}
                                                </div>
                                                {/* end::Heading */}
                                                {/* begin::Input group */}
                                                <div className="fv-row">
                                                    {/* begin::Row */}
                                                    <div className="row">
                                                        {/* begin::Col */}
                                                        <div className="col-lg-6">
                                                            {/* begin::Option */}
                                                            <input type="radio" className="btn-check" name="cta_action" value="buy_now" checked={formData.cta === 'buy_now'} onChange={() => updateField('cta', 'buy_now')} id="kt_create_account_form_cta_buy_now" />
                                                            <label className={`btn btn-outline btn-outline-dashed btn-active-light-primary p-7 d-flex align-items-center mb-10 ${formData.cta === 'buy_now' ? 'active' : ''}`} htmlFor="kt_create_account_form_cta_buy_now">
                                                                <i className="ki-outline ki-badge fs-3x me-5"></i>
                                                                {/* begin::Info */}
                                                                <span className="d-block fw-semibold text-start">
                                                                    <span className="text-gray-900 fw-bold d-block fs-4 mb-2">Buy Now</span>
                                                                    <span className="text-muted fw-semibold fs-6">If you need more info, please check it out</span>
                                                                </span>
                                                                {/* end::Info */}
                                                            </label>
                                                            {/* end::Option */}
                                                        </div>
                                                        {/* end::Col */}
                                                        {/* begin::Col */}
                                                        <div className="col-lg-6">
                                                            {/* begin::Option */}
                                                            <input type="radio" className="btn-check" name="cta_action" value="sign_up" checked={formData.cta === 'sign_up'} onChange={() => updateField('cta', 'sign_up')} id="kt_create_account_form_cta_sign_up" />
                                                            <label className={`btn btn-outline btn-outline-dashed btn-active-light-primary p-7 d-flex align-items-center ${formData.cta === 'sign_up' ? 'active' : ''}`} htmlFor="kt_create_account_form_cta_sign_up">
                                                                <i className="ki-outline ki-briefcase fs-3x me-5"></i>
                                                                {/* begin::Info */}
                                                                <span className="d-block fw-semibold text-start">
                                                                    <span className="text-gray-900 fw-bold d-block fs-4 mb-2">Sign Up</span>
                                                                    <span className="text-muted fw-semibold fs-6">Create corporate account to mane users</span>
                                                                </span>
                                                                {/* end::Info */}
                                                            </label>
                                                            {/* end::Option */}
                                                        </div>
                                                        {/* end::Col */}
                                                    </div>
                                                    {/* end::Row */}
                                                    {/* begin::Row */}
                                                    <div className="row">
                                                        {/* begin::Col */}
                                                        <div className="col-lg-6">
                                                            {/* begin::Option */}
                                                            <input type="radio" className="btn-check" name="cta_action" value="contact_us" checked={formData.cta === 'contact_us'} onChange={() => updateField('cta', 'contact_us')} id="kt_create_account_form_cta_contact_us" />
                                                            <label className={`btn btn-outline btn-outline-dashed btn-active-light-primary p-7 d-flex align-items-center mb-10 ${formData.cta === 'contact_us' ? 'active' : ''}`} htmlFor="kt_create_account_form_cta_contact_us">
                                                                <i className="ki-outline ki-badge fs-3x me-5"></i>
                                                                {/* begin::Info */}
                                                                <span className="d-block fw-semibold text-start">
                                                                    <span className="text-gray-900 fw-bold d-block fs-4 mb-2">Contact Us</span>
                                                                    <span className="text-muted fw-semibold fs-6">If you need more info, please check it out</span>
                                                                </span>
                                                                {/* end::Info */}
                                                            </label>
                                                            {/* end::Option */}
                                                        </div>
                                                        {/* end::Col */}
                                                        {/* begin::Col */}
                                                        <div className="col-lg-6">
                                                            {/* begin::Option */}
                                                            <input type="radio" className="btn-check" name="cta_action" value="subscribe" checked={formData.cta === 'subscribe'} onChange={() => updateField('cta', 'subscribe')} id="kt_create_account_form_cta_subscribe" />
                                                            <label className={`btn btn-outline btn-outline-dashed btn-active-light-primary p-7 d-flex align-items-center`} htmlFor="kt_create_account_form_cta_subscribe">
                                                                <i className="ki-outline ki-briefcase fs-3x me-5"></i>
                                                                {/* begin::Info */}
                                                                <span className="d-block fw-semibold text-start">
                                                                    <span className="text-gray-900 fw-bold d-block fs-4 mb-2">Subscribe</span>
                                                                    <span className="text-muted fw-semibold fs-6">Create corporate account to mane users</span>
                                                                </span>
                                                                {/* end::Info */}
                                                            </label>
                                                            {/* end::Option */}
                                                        </div>
                                                        {/* end::Col */}
                                                    </div>
                                                    {/* end::Row */}
                                                    {/* begin::Row */}
                                                    <div className="row">
                                                        {/* begin::Col */}
                                                        <div className="col-lg-6">
                                                            {/* begin::Option */}
                                                            <input type="radio" className="btn-check" name="cta_action" value="other" checked={formData.cta === 'other'} onChange={() => updateField('cta', 'other')} id="kt_create_account_form_cta_other" />
                                                            <label className={`btn btn-outline btn-outline-dashed btn-active-light-primary p-7 d-flex align-items-center mb-10 ${formData.cta === 'other' ? 'active' : ''}`} htmlFor="kt_create_account_form_cta_other">
                                                                <i className="ki-outline ki-badge fs-3x me-5"></i>
                                                                {/* begin::Info */}
                                                                <span className="d-block fw-semibold text-start">
                                                                    <span className="text-gray-900 fw-bold d-block fs-4 mb-2">Other</span>
                                                                    <span className="text-muted fw-semibold fs-6">If you need more info, please check it out</span>
                                                                </span>
                                                                {/* end::Info */}
                                                            </label>
                                                            {/* end::Option */}
                                                        </div>
                                                        {/* end::Col */}
                                                    </div>
                                                    {/* end::Row */}
                                                    {/* begin::Input group */}
                                                    {formData.cta === 'other' && (
                                                        <div className="d-flex flex-column mb-7 fv-row">
                                                            {/* begin::Label */}
                                                            <label className="d-flex align-items-center fs-6 fw-semibold form-label mb-2">
                                                                <span className="">Desired User Actions </span>
                                                                <span className="ms-1" data-bs-toggle="tooltip" title="Specify Desired User Actions">
                                                                    <i className="ki-outline ki-information-5 text-gray-500 fs-6"></i>
                                                                </span>
                                                            </label>
                                                            {/* end::Label */}
                                                            <input type="text" className="form-control form-control-solid" placeholder="Specify action" name="cta_other" value={formData.ctaOther} onChange={(e) => updateField('ctaOther', e.target.value)} />
                                                        </div>
                                                    )}
                                                    {/* end::Input group */}
                                                </div>
                                                {/* end::Input group */}
                                            </div>
                                            {/* end::Wrapper */}
                                        </div>
                                        {/* end::Step 7 */}
                                        {/* begin::Step 8 */}
                                        <div className={currentStep === 8 ? 'current' : 'd-none'} data-kt-stepper-element="content">
                                            {/* begin::Wrapper */}
                                            <div className="w-100">
                                                {/* begin::Heading */}
                                                <div className="pb-8 pb-lg-10">
                                                    {/* begin::Title */}
                                                    <h2 className="fw-bold text-gray-900">Your Are Done!</h2>
                                                    {/* end::Title */}
                                                    {/* begin::Notice */}
                                                    <div className="text-muted fw-semibold fs-6">If you need more info, please
                                                        <a href="#" className="link-primary fw-bold">Sign In</a>.</div>
                                                    {/* end::Notice */}
                                                </div>
                                                {/* end::Heading */}
                                                {/* begin::Body */}
                                                <div className="mb-0">
                                                    {/* begin::Text */}
                                                    <div className="fs-6 text-gray-600 mb-5">You’re currently on a TRIAL plan, which means some features are limited — including the number of articles you can generate and how frequently they can be created.</div>
                                                    {/* end::Text */}
                                                    {/* begin::Alert */}
                                                    {/* begin::Notice */}
                                                    <div className="notice d-flex bg-light-warning rounded border-warning border border-dashed p-6">
                                                        {/* begin::Icon */}
                                                        <i className="ki-outline ki-information fs-2tx text-warning me-4"></i>
                                                        {/* end::Icon */}
                                                        {/* begin::Wrapper */}
                                                        <div className="d-flex flex-stack flex-grow-1">
                                                            {/* begin::Content */}
                                                            <div className="fw-semibold">
                                                                <h4 className="text-gray-900 fw-bold">We need your attention!</h4>
                                                                <div className="fs-6 text-gray-700">Please note that the trial is linked to your website domain and can only be activated once. For full details, please review our
                                                                    <a href="utilities/wizards/vertical.html" className="fw-bold"> Terms of Use</a>.</div>
                                                            </div>
                                                            {/* end::Content */}
                                                        </div>
                                                        {/* end::Wrapper */}
                                                    </div>
                                                    {/* end::Notice */}
                                                    {/* end::Alert */}
                                                </div>
                                                {/* end::Body */}
                                            </div>
                                            {/* end::Wrapper */}
                                        </div>
                                        {/* end::Step 8 */}

                                        {/* begin::Actions */}
                                        <div className="d-flex flex-stack pt-15">
                                            {/* begin::Wrapper */}
                                            <div className="mr-2">
                                                {currentStep > 1 && (
                                                    <button type="button" className="btn btn-lg btn-light-primary me-3" onClick={prevStep}>
                                                        <i className="ki-outline ki-arrow-left fs-4 me-1"></i>Back
                                                    </button>
                                                )}
                                            </div>
                                            {/* end::Wrapper */}
                                            {/* begin::Wrapper */}
                                            <div>
                                                {currentStep === 8 ? (
                                                    <button type="button" className="btn btn-lg btn-primary me-3" onClick={handleSubmit} disabled={isSubmitting}>
                                                        <span className="indicator-label">
                                                            {isSubmitting ? 'Submitting...' : 'Go to Dashboard'}
                                                            {!isSubmitting && <i className="ki-outline ki-arrow-right fs-3 ms-2 me-0"></i>}
                                                        </span>
                                                        {isSubmitting && (
                                                            <span className="indicator-progress">Please wait...
                                                                <span className="spinner-border spinner-border-sm align-middle ms-2"></span></span>
                                                        )}
                                                    </button>
                                                ) : (
                                                    <button type="button" className="btn btn-lg btn-primary" onClick={nextStep}>Continue
                                                        <i className="ki-outline ki-arrow-right fs-4 ms-1 me-0"></i></button>
                                                )}
                                            </div>
                                            {/* end::Wrapper */}
                                        </div>
                                        {/* end::Actions */}
                                    </form>
                                    {/* end::Form */}
                                </div>
                                {/* end::Stepper */}
                            </div>
                            {/* end::Card body */}
                        </div>
                        {/* end::Card */}
                    </div>
                    {/* end::Content container */}
                </div>
                {/* end::Content */}
            </DashboardLayout>
        </>
    );
};

export default WizardPage;
