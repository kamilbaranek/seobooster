import { useState } from 'react';
import Head from 'next/head';
import DashboardLayout from '../../components/dashboard/layout/DashboardLayout';

const WizardPage = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [accountType, setAccountType] = useState('personal');
    const [websiteAge, setWebsiteAge] = useState('2-10');

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 8));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

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
                                                            <input type="radio" className="btn-check" name="account_type" value="personal" checked={accountType === 'personal'} onChange={() => setAccountType('personal')} id="kt_create_account_form_account_type_personal" />
                                                            <label className={`btn btn-outline btn-outline-dashed btn-active-light-primary p-7 d-flex align-items-center mb-10 ${accountType === 'personal' ? 'active' : ''}`} htmlFor="kt_create_account_form_account_type_personal">
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
                                                            <input type="radio" className="btn-check" name="account_type" value="corporate" checked={accountType === 'corporate'} onChange={() => setAccountType('corporate')} id="kt_create_account_form_account_type_corporate" />
                                                            <label className={`btn btn-outline btn-outline-dashed btn-active-light-primary p-7 d-flex align-items-center ${accountType === 'corporate' ? 'active' : ''}`} htmlFor="kt_create_account_form_account_type_corporate">
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
                                                            <label className={`btn btn-outline btn-outline-dashed btn-active-light-primary w-100 p-4 ${websiteAge === '1-1' ? 'active' : ''}`}>
                                                                <input type="radio" className="btn-check" name="account_team_size" value="1-1" checked={websiteAge === '1-1'} onChange={() => setWebsiteAge('1-1')} />
                                                                <span className="fw-bold fs-3">0</span>
                                                            </label>
                                                            {/* end::Option */}
                                                        </div>
                                                        {/* end::Col */}
                                                        {/* begin::Col */}
                                                        <div className="col">
                                                            {/* begin::Option */}
                                                            <label className={`btn btn-outline btn-outline-dashed btn-active-light-primary w-100 p-4 ${websiteAge === '2-10' ? 'active' : ''}`}>
                                                                <input type="radio" className="btn-check" name="account_team_size" value="2-10" checked={websiteAge === '2-10'} onChange={() => setWebsiteAge('2-10')} />
                                                                <span className="fw-bold fs-3">1</span>
                                                            </label>
                                                            {/* end::Option */}
                                                        </div>
                                                        {/* end::Col */}
                                                        {/* begin::Col */}
                                                        <div className="col">
                                                            {/* begin::Option */}
                                                            <label className={`btn btn-outline btn-outline-dashed btn-active-light-primary w-100 p-4 ${websiteAge === '10-50' ? 'active' : ''}`}>
                                                                <input type="radio" className="btn-check" name="account_team_size" value="10-50" checked={websiteAge === '10-50'} onChange={() => setWebsiteAge('10-50')} />
                                                                <span className="fw-bold fs-3">2-3</span>
                                                            </label>
                                                            {/* end::Option */}
                                                        </div>
                                                        {/* end::Col */}
                                                        {/* begin::Col */}
                                                        <div className="col">
                                                            {/* begin::Option */}
                                                            <label className={`btn btn-outline btn-outline-dashed btn-active-light-primary w-100 p-4 ${websiteAge === '50+' ? 'active' : ''}`}>
                                                                <input type="radio" className="btn-check" name="account_team_size" value="50+" checked={websiteAge === '50+'} onChange={() => setWebsiteAge('50+')} />
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
                                                    <input type="text" className="form-control form-control-lg form-control-solid" name="account_name" placeholder="" />
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
                                                                <input className="form-check-input" type="radio" name="account_plan" value="1" />
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
                                                                <input className="form-check-input" type="radio" defaultChecked name="account_plan" value="2" />
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
                                                                <input className="form-check-input" type="radio" name="account_plan" value="3" />
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
                                                    <select name="business_type" className="form-select form-select-lg form-select-solid" data-control="select2" data-placeholder="Select..." data-allow-clear="true" data-hide-search="true">
                                                        <option value="1">Application Password</option>
                                                        <option value="1">OAuth</option>
                                                        <option value="2">API Key</option>
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
                                                    <input name="business_name" className="form-control form-control-lg form-control-solid" defaultValue="(Must have Editor privileges)" />
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
                                                    <input name="business_descriptor" className="form-control form-control-lg form-control-solid" defaultValue="" />
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
                                                            <input type="radio" className="btn-check" name="account_type" value="personal" checked={accountType === 'personal'} onChange={() => setAccountType('personal')} id="kt_create_account_form_account_type_personal" />
                                                            <label className={`btn btn-outline btn-outline-dashed btn-active-light-primary p-7 d-flex align-items-center mb-10 ${accountType === 'personal' ? 'active' : ''}`} htmlFor="kt_create_account_form_account_type_personal">
                                                                <i className="ki-outline ki-badge fs-3x me-5"></i>
                                                                {/* begin::Info */}
                                                                <span className="d-block fw-semibold text-start">
                                                                    <span className="text-gray-900 fw-bold d-block fs-4 mb-2">Gain Traffic</span>
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
                                                            <input type="radio" className="btn-check" name="account_type" value="corporate" checked={accountType === 'corporate'} onChange={() => setAccountType('corporate')} id="kt_create_account_form_account_type_corporate" />
                                                            <label className={`btn btn-outline btn-outline-dashed btn-active-light-primary p-7 d-flex align-items-center ${accountType === 'corporate' ? 'active' : ''}`} htmlFor="kt_create_account_form_account_type_corporate">
                                                                <i className="ki-outline ki-briefcase fs-3x me-5"></i>
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
                                                    </div>
                                                    {/* end::Row */}
                                                    {/* begin::Row */}
                                                    <div className="row">
                                                        {/* begin::Col */}
                                                        <div className="col-lg-6">
                                                            {/* begin::Option */}
                                                            <input type="radio" className="btn-check" name="account_type" value="brand_awareness" onChange={() => setAccountType('personal')} id="kt_create_account_form_account_type_brand_awareness" />
                                                            <label className={`btn btn-outline btn-outline-dashed btn-active-light-primary p-7 d-flex align-items-center mb-10 ${accountType === 'personal' ? 'active' : ''}`} htmlFor="kt_create_account_form_account_type_brand_awareness">
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
                                                        {/* begin::Col */}
                                                        <div className="col-lg-6">
                                                            {/* begin::Option */}
                                                            <input type="radio" className="btn-check" name="account_type" value="magazine" checked={accountType === 'corporate'} onChange={() => setAccountType('corporate')} id="kt_create_account_form_account_type_magazine" />
                                                            <label className={`btn btn-outline btn-outline-dashed btn-active-light-primary p-7 d-flex align-items-center`} htmlFor="kt_create_account_form_account_type_magazine">
                                                                <i className="ki-outline ki-briefcase fs-3x me-5"></i>
                                                                {/* begin::Info */}
                                                                <span className="d-block fw-semibold text-start">
                                                                    <span className="text-gray-900 fw-bold d-block fs-4 mb-2">Magazine</span>
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
                                                            <input type="radio" className="btn-check" name="account_type" value="other" checked={accountType === 'personal'} onChange={() => setAccountType('personal')} id="kt_create_account_form_account_type_other" />
                                                            <label className={`btn btn-outline btn-outline-dashed btn-active-light-primary p-7 d-flex align-items-center mb-10 ${accountType === 'personal' ? 'active' : ''}`} htmlFor="kt_create_account_form_account_type_other">
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
                                                            <input type="radio" className="btn-check" name="account_type" value="personal" checked={accountType === 'personal'} onChange={() => setAccountType('personal')} id="kt_create_account_form_account_type_personal" />
                                                            <label className={`btn btn-outline btn-outline-dashed btn-active-light-primary p-7 d-flex align-items-center mb-10 ${accountType === 'personal' ? 'active' : ''}`} htmlFor="kt_create_account_form_account_type_personal">
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
                                                            <input type="radio" className="btn-check" name="account_type" value="corporate" checked={accountType === 'corporate'} onChange={() => setAccountType('corporate')} id="kt_create_account_form_account_type_corporate" />
                                                            <label className={`btn btn-outline btn-outline-dashed btn-active-light-primary p-7 d-flex align-items-center ${accountType === 'corporate' ? 'active' : ''}`} htmlFor="kt_create_account_form_account_type_corporate">
                                                                <i className="ki-outline ki-briefcase fs-3x me-5"></i>
                                                                {/* begin::Info */}
                                                                <span className="d-block fw-semibold text-start">
                                                                    <span className="text-gray-900 fw-bold d-block fs-4 mb-2">Families</span>
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
                                                            <input type="radio" className="btn-check" name="account_type" value="brand_awareness" onChange={() => setAccountType('personal')} id="kt_create_account_form_account_type_brand_awareness" />
                                                            <label className={`btn btn-outline btn-outline-dashed btn-active-light-primary p-7 d-flex align-items-center mb-10 ${accountType === 'personal' ? 'active' : ''}`} htmlFor="kt_create_account_form_account_type_brand_awareness">
                                                                <i className="ki-outline ki-badge fs-3x me-5"></i>
                                                                {/* begin::Info */}
                                                                <span className="d-block fw-semibold text-start">
                                                                    <span className="text-gray-900 fw-bold d-block fs-4 mb-2">Professionals</span>
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
                                                            <input type="radio" className="btn-check" name="account_type" value="magazine" checked={accountType === 'corporate'} onChange={() => setAccountType('corporate')} id="kt_create_account_form_account_type_magazine" />
                                                            <label className={`btn btn-outline btn-outline-dashed btn-active-light-primary p-7 d-flex align-items-center`} htmlFor="kt_create_account_form_account_type_magazine">
                                                                <i className="ki-outline ki-briefcase fs-3x me-5"></i>
                                                                {/* begin::Info */}
                                                                <span className="d-block fw-semibold text-start">
                                                                    <span className="text-gray-900 fw-bold d-block fs-4 mb-2">Hobbyists</span>
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
                                                            <input type="radio" className="btn-check" name="account_type" value="other" checked={accountType === 'personal'} onChange={() => setAccountType('personal')} id="kt_create_account_form_account_type_other" />
                                                            <label className={`btn btn-outline btn-outline-dashed btn-active-light-primary p-7 d-flex align-items-center mb-10 ${accountType === 'personal' ? 'active' : ''}`} htmlFor="kt_create_account_form_account_type_other">
                                                                <i className="ki-outline ki-badge fs-3x me-5"></i>
                                                                {/* begin::Info */}
                                                                <span className="d-block fw-semibold text-start">
                                                                    <span className="text-gray-900 fw-bold d-block fs-4 mb-2">Online audience</span>
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
                                                <div className="d-flex flex-column mb-7 fv-row">
                                                    {/* begin::Label */}
                                                    <label className="d-flex align-items-center fs-6 fw-semibold form-label mb-2">
                                                        <span className="">URL</span>
                                                        <span className="ms-1" data-bs-toggle="tooltip" title="Specify a competitor's url">
                                                            <i className="ki-outline ki-information-5 text-gray-500 fs-6"></i>
                                                        </span>
                                                    </label>
                                                    {/* end::Label */}
                                                    <input type="text" className="form-control form-control-solid" placeholder="" name="card_name" defaultValue="www.apple.com" />
                                                </div>
                                                {/* end::Input group */}
                                                {/* begin::Input group */}
                                                <div className="d-flex flex-column mb-7 fv-row">
                                                    {/* begin::Label */}
                                                    <label className="d-flex align-items-center fs-6 fw-semibold form-label mb-2">
                                                        <span className="">URL</span>
                                                        <span className="ms-1" data-bs-toggle="tooltip" title="Specify a competitor's url">
                                                            <i className="ki-outline ki-information-5 text-gray-500 fs-6"></i>
                                                        </span>
                                                    </label>
                                                    {/* end::Label */}
                                                    <input type="text" className="form-control form-control-solid" placeholder="" name="card_name" defaultValue="www.google.com" />
                                                </div>
                                                {/* end::Input group */}
                                                {/* begin::Input group */}
                                                <div className="d-flex flex-column mb-7 fv-row">
                                                    {/* begin::Label */}
                                                    <label className="d-flex align-items-center fs-6 fw-semibold form-label mb-2">
                                                        <span className="">URL</span>
                                                        <span className="ms-1" data-bs-toggle="tooltip" title="Specify a competitor's url">
                                                            <i className="ki-outline ki-information-5 text-gray-500 fs-6"></i>
                                                        </span>
                                                    </label>
                                                    {/* end::Label */}
                                                    <input type="text" className="form-control form-control-solid" placeholder="" name="card_name" defaultValue="www.facebook.com" />
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
                                                            <input type="radio" className="btn-check" name="account_type" value="personal" checked={accountType === 'personal'} onChange={() => setAccountType('personal')} id="kt_create_account_form_account_type_personal" />
                                                            <label className={`btn btn-outline btn-outline-dashed btn-active-light-primary p-7 d-flex align-items-center mb-10 ${accountType === 'personal' ? 'active' : ''}`} htmlFor="kt_create_account_form_account_type_personal">
                                                                <i className="ki-outline ki-badge fs-3x me-5"></i>
                                                                {/* begin::Info */}
                                                                <span className="d-block fw-semibold text-start">
                                                                    <span className="text-gray-900 fw-bold d-block fs-4 mb-2">Submit an inquiry</span>
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
                                                            <input type="radio" className="btn-check" name="account_type" value="corporate" checked={accountType === 'corporate'} onChange={() => setAccountType('corporate')} id="kt_create_account_form_account_type_corporate" />
                                                            <label className={`btn btn-outline btn-outline-dashed btn-active-light-primary p-7 d-flex align-items-center ${accountType === 'corporate' ? 'active' : ''}`} htmlFor="kt_create_account_form_account_type_corporate">
                                                                <i className="ki-outline ki-briefcase fs-3x me-5"></i>
                                                                {/* begin::Info */}
                                                                <span className="d-block fw-semibold text-start">
                                                                    <span className="text-gray-900 fw-bold d-block fs-4 mb-2">Call you</span>
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
                                                            <input type="radio" className="btn-check" name="account_type" value="brand_awareness" onChange={() => setAccountType('personal')} id="kt_create_account_form_account_type_brand_awareness" />
                                                            <label className={`btn btn-outline btn-outline-dashed btn-active-light-primary p-7 d-flex align-items-center mb-10 ${accountType === 'personal' ? 'active' : ''}`} htmlFor="kt_create_account_form_account_type_brand_awareness">
                                                                <i className="ki-outline ki-badge fs-3x me-5"></i>
                                                                {/* begin::Info */}
                                                                <span className="d-block fw-semibold text-start">
                                                                    <span className="text-gray-900 fw-bold d-block fs-4 mb-2">Read content</span>
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
                                                            <input type="radio" className="btn-check" name="account_type" value="magazine" checked={accountType === 'corporate'} onChange={() => setAccountType('corporate')} id="kt_create_account_form_account_type_magazine" />
                                                            <label className={`btn btn-outline btn-outline-dashed btn-active-light-primary p-7 d-flex align-items-center`} htmlFor="kt_create_account_form_account_type_magazine">
                                                                <i className="ki-outline ki-briefcase fs-3x me-5"></i>
                                                                {/* begin::Info */}
                                                                <span className="d-block fw-semibold text-start">
                                                                    <span className="text-gray-900 fw-bold d-block fs-4 mb-2">Make a purchase</span>
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
                                                            <input type="radio" className="btn-check" name="account_type" value="other" checked={accountType === 'personal'} onChange={() => setAccountType('personal')} id="kt_create_account_form_account_type_other" />
                                                            <label className={`btn btn-outline btn-outline-dashed btn-active-light-primary p-7 d-flex align-items-center mb-10 ${accountType === 'personal' ? 'active' : ''}`} htmlFor="kt_create_account_form_account_type_other">
                                                                <i className="ki-outline ki-badge fs-3x me-5"></i>
                                                                {/* begin::Info */}
                                                                <span className="d-block fw-semibold text-start">
                                                                    <span className="text-gray-900 fw-bold d-block fs-4 mb-2">Book a service</span>
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
                                                            <input type="radio" className="btn-check" name="account_type" value="other" checked={accountType === 'personal'} onChange={() => setAccountType('personal')} id="kt_create_account_form_account_type_other" />
                                                            <label className={`btn btn-outline btn-outline-dashed btn-active-light-primary p-7 d-flex align-items-center mb-10 ${accountType === 'personal' ? 'active' : ''}`} htmlFor="kt_create_account_form_account_type_other">
                                                                <i className="ki-outline ki-badge fs-3x me-5"></i>
                                                                {/* begin::Info */}
                                                                <span className="d-block fw-semibold text-start">
                                                                    <span className="text-gray-900 fw-bold d-block fs-4 mb-2">Something else</span>
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
                                                    <div className="d-flex flex-column mb-7 fv-row">
                                                        {/* begin::Label */}
                                                        <label className="d-flex align-items-center fs-6 fw-semibold form-label mb-2">
                                                            <span className="">Desired User Actions </span>
                                                            <span className="ms-1" data-bs-toggle="tooltip" title="Specify Desired User Actions">
                                                                <i className="ki-outline ki-information-5 text-gray-500 fs-6"></i>
                                                            </span>
                                                        </label>
                                                        {/* end::Label */}
                                                        <input type="text" className="form-control form-control-solid" placeholder="" name="card_name" defaultValue="Other" />
                                                    </div>
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
                                                    <button type="button" className="btn btn-lg btn-primary me-3" data-kt-stepper-action="submit">
                                                        <span className="indicator-label">Submit
                                                            <i className="ki-outline ki-arrow-right fs-3 ms-2 me-0"></i></span>
                                                        <span className="indicator-progress">Please wait...
                                                            <span className="spinner-border spinner-border-sm align-middle ms-2"></span></span>
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
