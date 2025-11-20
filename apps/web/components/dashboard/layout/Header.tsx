import React from 'react';

const Header = () => {
    return (
        <div id="kt_app_header" className="app-header d-flex">
            {/*begin::Header container*/}
            <div className="app-container container-fluid d-flex align-items-center justify-content-between" id="kt_app_header_container">
                {/*begin::Logo*/}
                <div className="app-header-logo d-flex flex-center">
                    {/*begin::Logo image*/}
                    <a href="index.html">
                        <img alt="Logo" src="/assets/media/logos/demo-58.svg" className="mh-25px" />
                    </a>
                    {/*end::Logo image*/}
                    {/*begin::Sidebar toggle*/}
                    <button className="btn btn-icon btn-sm btn-active-color-primary d-flex d-lg-none" id="kt_app_sidebar_mobile_toggle">
                        <i className="ki-outline ki-abstract-14 fs-1"></i>
                    </button>
                    {/*end::Sidebar toggle*/}
                </div>
                {/*end::Logo*/}
                <div className="d-flex flex-lg-grow-1 flex-stack" id="kt_app_header_wrapper">
                    <div className="app-header-wrapper d-flex align-items-center justify-content-around justify-content-lg-between flex-wrap gap-6 gap-lg-0 mb-6 mb-lg-0" data-kt-swapper="true" data-kt-swapper-mode="{default: 'prepend', lg: 'prepend'}" data-kt-swapper-parent="{default: '#kt_app_content_container', lg: '#kt_app_header_wrapper'}">
                        {/*begin::Page title*/}
                        <div className="d-flex flex-column justify-content-center">
                            {/*begin::Title*/}
                            <h1 className="text-gray-900 fw-bold fs-6 mb-2">Chartmix - Finance Team</h1>
                            {/*end::Title*/}
                            {/*begin::Breadcrumb*/}
                            <ul className="breadcrumb breadcrumb-separatorless fw-semibold fs-base">
                                {/*begin::Item*/}
                                <li className="breadcrumb-item text-muted">
                                    <a href="index.html" className="text-muted text-hover-primary">Home</a>
                                </li>
                                {/*end::Item*/}
                                {/*begin::Item*/}
                                <li className="breadcrumb-item text-muted">/</li>
                                {/*end::Item*/}
                                {/*begin::Item*/}
                                <li className="breadcrumb-item text-muted">Dashboard</li>
                                {/*end::Item*/}
                            </ul>
                            {/*end::Breadcrumb*/}
                        </div>
                        {/*end::Page title*/}
                        <div className="d-none d-md-block h-40px border-start border-gray-200 mx-10"></div>
                        <div className="d-flex gap-3 gap-lg-8 flex-wrap">
                            <div className="d-flex align-items-center gap-2">
                                <div className="rounded d-flex flex-center w-40px h-40px flex-shrink-0 bg-warning">
                                    <i className="ki-outline ki-abstract-13 fs-2 text-inverse-warning"></i>
                                </div>
                                <div className="d-flex flex-column">
                                    <span className="fw-bold fs-base text-gray-900">Target A</span>
                                    <span className="fw-semibold fs-7 text-gray-500">Uplift: 64%</span>
                                </div>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                <div className="rounded d-flex flex-center w-40px h-40px flex-shrink-0 bg-danger">
                                    <i className="ki-outline ki-abstract-24 fs-2 text-inverse-danger"></i>
                                </div>
                                <div className="d-flex flex-column">
                                    <span className="fw-bold fs-base text-gray-900">Target A</span>
                                    <span className="fw-semibold fs-7 text-gray-500">Uplift: 64%</span>
                                </div>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                                <div className="rounded d-flex flex-center w-40px h-40px flex-shrink-0 bg-primary">
                                    <i className="ki-outline ki-abstract-25 fs-2 text-inverse-primary"></i>
                                </div>
                                <div className="d-flex flex-column">
                                    <span className="fw-bold fs-base text-gray-900">Target A</span>
                                    <span className="fw-semibold fs-7 text-gray-500">Uplift: 64%</span>
                                </div>
                            </div>
                            <a href="#" className="btn btn-icon border border-200 bg-gray-100 btn-color-gray-600 btn-active-primary ms-2 ms-lg-6">
                                <i className="ki-outline ki-plus fs-3"></i>
                            </a>
                        </div>
                    </div>
                    {/*begin::Navbar*/}
                    <div className="app-navbar flex-shrink-0 gap-2 gap-lg-4">
                        {/*begin::My apps links*/}
                        <div className="app-navbar-item">
                            {/*begin::Menu wrapper*/}
                            <div className="btn btn-icon border border-200 bg-gray-100 btn-color-gray-600 btn-active-color-primary w-40px h-40px" data-kt-menu-trigger="{default: 'click', lg: 'hover'}" data-kt-menu-attach="parent" data-kt-menu-placement="bottom-end">
                                <i className="ki-outline ki-element-11 fs-4"></i>
                            </div>
                            {/*begin::My apps*/}
                            <div className="menu menu-sub menu-sub-dropdown menu-column w-100 w-sm-350px" data-kt-menu="true">
                                {/*begin::Card*/}
                                <div className="card">
                                    {/*begin::Card header*/}
                                    <div className="card-header">
                                        {/*begin::Card title*/}
                                        <div className="card-title">My Apps</div>
                                        {/*end::Card title*/}
                                        {/*begin::Card toolbar*/}
                                        <div className="card-toolbar">
                                            {/*begin::Menu*/}
                                            <button type="button" className="btn btn-sm btn-icon btn-active-light-primary me-n3" data-kt-menu-trigger="{default: 'click', lg: 'hover'}" data-kt-menu-placement="bottom-end">
                                                <i className="ki-outline ki-setting-3 fs-2"></i>
                                            </button>
                                            {/*begin::Menu 3*/}
                                            <div className="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-800 menu-state-bg-light-primary fw-semibold w-200px py-3" data-kt-menu="true">
                                                {/*begin::Heading*/}
                                                <div className="menu-item px-3">
                                                    <div className="menu-content text-muted pb-2 px-3 fs-7 text-uppercase">Payments</div>
                                                </div>
                                                {/*end::Heading*/}
                                                {/*begin::Menu item*/}
                                                <div className="menu-item px-3">
                                                    <a href="#" className="menu-link px-3">Create Invoice</a>
                                                </div>
                                                {/*end::Menu item*/}
                                                {/*begin::Menu item*/}
                                                <div className="menu-item px-3">
                                                    <a href="#" className="menu-link flex-stack px-3">Create Payment
                                                        <span className="ms-2" data-bs-toggle="tooltip" title="Specify a target name for future usage and reference">
                                                            <i className="ki-outline ki-information fs-6"></i>
                                                        </span></a>
                                                </div>
                                                {/*end::Menu item*/}
                                                {/*begin::Menu item*/}
                                                <div className="menu-item px-3">
                                                    <a href="#" className="menu-link px-3">Generate Bill</a>
                                                </div>
                                                {/*end::Menu item*/}
                                                {/*begin::Menu item*/}
                                                <div className="menu-item px-3" data-kt-menu-trigger="hover" data-kt-menu-placement="right-end">
                                                    <a href="#" className="menu-link px-3">
                                                        <span className="menu-title">Subscription</span>
                                                        <span className="menu-arrow"></span>
                                                    </a>
                                                    {/*begin::Menu sub*/}
                                                    <div className="menu-sub menu-sub-dropdown w-175px py-4">
                                                        {/*begin::Menu item*/}
                                                        <div className="menu-item px-3">
                                                            <a href="#" className="menu-link px-3">Plans</a>
                                                        </div>
                                                        {/*end::Menu item*/}
                                                        {/*begin::Menu item*/}
                                                        <div className="menu-item px-3">
                                                            <a href="#" className="menu-link px-3">Billing</a>
                                                        </div>
                                                        {/*end::Menu item*/}
                                                        {/*begin::Menu item*/}
                                                        <div className="menu-item px-3">
                                                            <a href="#" className="menu-link px-3">Statements</a>
                                                        </div>
                                                        {/*end::Menu item*/}
                                                        {/*begin::Menu separator*/}
                                                        <div className="separator my-2"></div>
                                                        {/*end::Menu separator*/}
                                                        {/*begin::Menu item*/}
                                                        <div className="menu-item px-3">
                                                            <div className="menu-content px-3">
                                                                {/*begin::Switch*/}
                                                                <label className="form-check form-switch form-check-custom form-check-solid">
                                                                    {/*begin::Input*/}
                                                                    <input className="form-check-input w-30px h-20px" type="checkbox" value="1" defaultChecked={true} name="notifications" />
                                                                    {/*end::Input*/}
                                                                    {/*end::Label*/}
                                                                    <span className="form-check-label text-muted fs-6">Recuring</span>
                                                                    {/*end::Label*/}
                                                                </label>
                                                                {/*end::Switch*/}
                                                            </div>
                                                        </div>
                                                        {/*end::Menu item*/}
                                                    </div>
                                                    {/*end::Menu sub*/}
                                                </div>
                                                {/*end::Menu item*/}
                                                {/*begin::Menu item*/}
                                                <div className="menu-item px-3 my-1">
                                                    <a href="#" className="menu-link px-3">Settings</a>
                                                </div>
                                                {/*end::Menu item*/}
                                            </div>
                                            {/*end::Menu 3*/}
                                            {/*end::Menu*/}
                                        </div>
                                        {/*end::Card toolbar*/}
                                    </div>
                                    {/*end::Card header*/}
                                    {/*begin::Card body*/}
                                    <div className="card-body py-5">
                                        {/*begin::Scroll*/}
                                        <div className="mh-450px scroll-y me-n5 pe-5">
                                            {/*begin::Row*/}
                                            <div className="row g-2">
                                                {/*begin::Col*/}
                                                <div className="col-4">
                                                    <a href="#" className="d-flex flex-column flex-center text-center text-gray-800 text-hover-primary bg-hover-light rounded py-4 px-3 mb-3">
                                                        <img src="/assets/media/svg/brand-logos/amazon.svg" className="w-25px h-25px mb-2" alt="" />
                                                        <span className="fw-semibold">AWS</span>
                                                    </a>
                                                </div>
                                                {/*end::Col*/}
                                                {/*begin::Col*/}
                                                <div className="col-4">
                                                    <a href="#" className="d-flex flex-column flex-center text-center text-gray-800 text-hover-primary bg-hover-light rounded py-4 px-3 mb-3">
                                                        <img src="/assets/media/svg/brand-logos/angular-icon-1.svg" className="w-25px h-25px mb-2" alt="" />
                                                        <span className="fw-semibold">AngularJS</span>
                                                    </a>
                                                </div>
                                                {/*end::Col*/}
                                                {/*begin::Col*/}
                                                <div className="col-4">
                                                    <a href="#" className="d-flex flex-column flex-center text-center text-gray-800 text-hover-primary bg-hover-light rounded py-4 px-3 mb-3">
                                                        <img src="/assets/media/svg/brand-logos/atica.svg" className="w-25px h-25px mb-2" alt="" />
                                                        <span className="fw-semibold">Atica</span>
                                                    </a>
                                                </div>
                                                {/*end::Col*/}
                                                {/*begin::Col*/}
                                                <div className="col-4">
                                                    <a href="#" className="d-flex flex-column flex-center text-center text-gray-800 text-hover-primary bg-hover-light rounded py-4 px-3 mb-3">
                                                        <img src="/assets/media/svg/brand-logos/beats-electronics.svg" className="w-25px h-25px mb-2" alt="" />
                                                        <span className="fw-semibold">Music</span>
                                                    </a>
                                                </div>
                                                {/*end::Col*/}
                                                {/*begin::Col*/}
                                                <div className="col-4">
                                                    <a href="#" className="d-flex flex-column flex-center text-center text-gray-800 text-hover-primary bg-hover-light rounded py-4 px-3 mb-3">
                                                        <img src="/assets/media/svg/brand-logos/codeigniter.svg" className="w-25px h-25px mb-2" alt="" />
                                                        <span className="fw-semibold">Codeigniter</span>
                                                    </a>
                                                </div>
                                                {/*end::Col*/}
                                                {/*begin::Col*/}
                                                <div className="col-4">
                                                    <a href="#" className="d-flex flex-column flex-center text-center text-gray-800 text-hover-primary bg-hover-light rounded py-4 px-3 mb-3">
                                                        <img src="/assets/media/svg/brand-logos/bootstrap-4.svg" className="w-25px h-25px mb-2" alt="" />
                                                        <span className="fw-semibold">Bootstrap</span>
                                                    </a>
                                                </div>
                                                {/*end::Col*/}
                                                {/*begin::Col*/}
                                                <div className="col-4">
                                                    <a href="#" className="d-flex flex-column flex-center text-center text-gray-800 text-hover-primary bg-hover-light rounded py-4 px-3 mb-3">
                                                        <img src="/assets/media/svg/brand-logos/google-tag-manager.svg" className="w-25px h-25px mb-2" alt="" />
                                                        <span className="fw-semibold">GTM</span>
                                                    </a>
                                                </div>
                                                {/*end::Col*/}
                                                {/*begin::Col*/}
                                                <div className="col-4">
                                                    <a href="#" className="d-flex flex-column flex-center text-center text-gray-800 text-hover-primary bg-hover-light rounded py-4 px-3 mb-3">
                                                        <img src="/assets/media/svg/brand-logos/disqus.svg" className="w-25px h-25px mb-2" alt="" />
                                                        <span className="fw-semibold">Disqus</span>
                                                    </a>
                                                </div>
                                                {/*end::Col*/}
                                                {/*begin::Col*/}
                                                <div className="col-4">
                                                    <a href="#" className="d-flex flex-column flex-center text-center text-gray-800 text-hover-primary bg-hover-light rounded py-4 px-3 mb-3">
                                                        <img src="/assets/media/svg/brand-logos/dribbble-icon-1.svg" className="w-25px h-25px mb-2" alt="" />
                                                        <span className="fw-semibold">Dribble</span>
                                                    </a>
                                                </div>
                                                {/*end::Col*/}
                                                {/*begin::Col*/}
                                                <div className="col-4">
                                                    <a href="#" className="d-flex flex-column flex-center text-center text-gray-800 text-hover-primary bg-hover-light rounded py-4 px-3 mb-3">
                                                        <img src="/assets/media/svg/brand-logos/google-play-store.svg" className="w-25px h-25px mb-2" alt="" />
                                                        <span className="fw-semibold">Play Store</span>
                                                    </a>
                                                </div>
                                                {/*end::Col*/}
                                                {/*begin::Col*/}
                                                <div className="col-4">
                                                    <a href="#" className="d-flex flex-column flex-center text-center text-gray-800 text-hover-primary bg-hover-light rounded py-4 px-3 mb-3">
                                                        <img src="/assets/media/svg/brand-logos/google-podcasts.svg" className="w-25px h-25px mb-2" alt="" />
                                                        <span className="fw-semibold">Podcasts</span>
                                                    </a>
                                                </div>
                                                {/*end::Col*/}
                                                {/*begin::Col*/}
                                                <div className="col-4">
                                                    <a href="#" className="d-flex flex-column flex-center text-center text-gray-800 text-hover-primary bg-hover-light rounded py-4 px-3 mb-3">
                                                        <img src="/assets/media/svg/brand-logos/figma-1.svg" className="w-25px h-25px mb-2" alt="" />
                                                        <span className="fw-semibold">Figma</span>
                                                    </a>
                                                </div>
                                                {/*end::Col*/}
                                                {/*begin::Col*/}
                                                <div className="col-4">
                                                    <a href="#" className="d-flex flex-column flex-center text-center text-gray-800 text-hover-primary bg-hover-light rounded py-4 px-3 mb-3">
                                                        <img src="/assets/media/svg/brand-logos/github.svg" className="w-25px h-25px mb-2" alt="" />
                                                        <span className="fw-semibold">Github</span>
                                                    </a>
                                                </div>
                                                {/*end::Col*/}
                                                {/*begin::Col*/}
                                                <div className="col-4">
                                                    <a href="#" className="d-flex flex-column flex-center text-center text-gray-800 text-hover-primary bg-hover-light rounded py-4 px-3 mb-3">
                                                        <img src="/assets/media/svg/brand-logos/gitlab.svg" className="w-25px h-25px mb-2" alt="" />
                                                        <span className="fw-semibold">Gitlab</span>
                                                    </a>
                                                </div>
                                                {/*end::Col*/}
                                                {/*begin::Col*/}
                                                <div className="col-4">
                                                    <a href="#" className="d-flex flex-column flex-center text-center text-gray-800 text-hover-primary bg-hover-light rounded py-4 px-3 mb-3">
                                                        <img src="/assets/media/svg/brand-logos/instagram-2-1.svg" className="w-25px h-25px mb-2" alt="" />
                                                        <span className="fw-semibold">Instagram</span>
                                                    </a>
                                                </div>
                                                {/*end::Col*/}
                                                {/*begin::Col*/}
                                                <div className="col-4">
                                                    <a href="#" className="d-flex flex-column flex-center text-center text-gray-800 text-hover-primary bg-hover-light rounded py-4 px-3 mb-3">
                                                        <img src="/assets/media/svg/brand-logos/pinterest-p.svg" className="w-25px h-25px mb-2" alt="" />
                                                        <span className="fw-semibold">Pinterest</span>
                                                    </a>
                                                </div>
                                                {/*end::Col*/}
                                            </div>
                                            {/*end::Row*/}
                                        </div>
                                        {/*end::Scroll*/}
                                    </div>
                                    {/*end::Card body*/}
                                </div>
                                {/*end::Card*/}
                            </div>
                            {/*end::My apps*/}
                            {/*end::Menu wrapper*/}
                        </div>
                        {/*end::My apps links*/}
                        {/*begin::Notifications*/}
                        <div className="app-navbar-item">
                            {/*begin::Menu- wrapper*/}
                            <div className="btn btn-icon border border-200 bg-gray-100 btn-color-gray-600 btn-active-color-primary w-40px h-40px" data-kt-menu-trigger="{default: 'click', lg: 'hover'}" data-kt-menu-attach="parent" data-kt-menu-placement="bottom-end" id="kt_menu_item_wow">
                                <i className="ki-outline ki-notification-status fs-4"></i>
                            </div>
                            {/*begin::Menu*/}
                            <div className="menu menu-sub menu-sub-dropdown menu-column w-350px w-lg-375px" data-kt-menu="true" id="kt_menu_notifications">
                                {/*begin::Heading*/}
                                <div className="d-flex flex-column bgi-no-repeat rounded-top" style={{ backgroundImage: "url('/assets/media/misc/menu-header-bg.jpg')" }}>
                                    {/*begin::Title*/}
                                    <h3 className="text-white fw-semibold px-9 mt-10 mb-6">Notifications
                                        <span className="fs-8 opacity-75 ps-3">24 reports</span></h3>
                                    {/*end::Title*/}
                                    {/*begin::Tabs*/}
                                    <ul className="nav nav-line-tabs nav-line-tabs-2x nav-stretch fw-semibold px-9">
                                        <li className="nav-item">
                                            <a className="nav-link text-white opacity-75 opacity-state-100 pb-4" data-bs-toggle="tab" href="#kt_topbar_notifications_1">Alerts</a>
                                        </li>
                                        <li className="nav-item">
                                            <a className="nav-link text-white opacity-75 opacity-state-100 pb-4 active" data-bs-toggle="tab" href="#kt_topbar_notifications_2">Updates</a>
                                        </li>
                                        <li className="nav-item">
                                            <a className="nav-link text-white opacity-75 opacity-state-100 pb-4" data-bs-toggle="tab" href="#kt_topbar_notifications_3">Logs</a>
                                        </li>
                                    </ul>
                                    {/*end::Tabs*/}
                                </div>
                                {/*end::Heading*/}
                                {/*begin::Tab content*/}
                                <div className="tab-content">
                                    {/*begin::Tab panel*/}
                                    <div className="tab-pane fade" id="kt_topbar_notifications_1" role="tabpanel">
                                        {/*begin::Items*/}
                                        <div className="scroll-y mh-325px my-5 px-8">
                                            {/*begin::Item*/}
                                            <div className="d-flex flex-stack py-4">
                                                {/*begin::Section*/}
                                                <div className="d-flex align-items-center">
                                                    {/*begin::Symbol*/}
                                                    <div className="symbol symbol-35px me-4">
                                                        <span className="symbol-label bg-light-primary">
                                                            <i className="ki-outline ki-abstract-28 fs-2 text-primary"></i>
                                                        </span>
                                                    </div>
                                                    {/*end::Symbol*/}
                                                    {/*begin::Title*/}
                                                    <div className="mb-0 me-2">
                                                        <a href="#" className="fs-6 text-gray-800 text-hover-primary fw-bold">Project Alice</a>
                                                        <div className="text-gray-500 fs-7">Phase 1 development</div>
                                                    </div>
                                                    {/*end::Title*/}
                                                </div>
                                                {/*end::Section*/}
                                                {/*begin::Label*/}
                                                <span className="badge badge-light fs-8">1 hr</span>
                                                {/*end::Label*/}
                                            </div>
                                            {/*end::Item*/}
                                            {/*begin::Item*/}
                                            <div className="d-flex flex-stack py-4">
                                                {/*begin::Section*/}
                                                <div className="d-flex align-items-center">
                                                    {/*begin::Symbol*/}
                                                    <div className="symbol symbol-35px me-4">
                                                        <span className="symbol-label bg-light-danger">
                                                            <i className="ki-outline ki-information fs-2 text-danger"></i>
                                                        </span>
                                                    </div>
                                                    {/*end::Symbol*/}
                                                    {/*begin::Title*/}
                                                    <div className="mb-0 me-2">
                                                        <a href="#" className="fs-6 text-gray-800 text-hover-primary fw-bold">HR Confidential</a>
                                                        <div className="text-gray-500 fs-7">Confidential staff documents</div>
                                                    </div>
                                                    {/*end::Title*/}
                                                </div>
                                                {/*end::Section*/}
                                                {/*begin::Label*/}
                                                <span className="badge badge-light fs-8">2 hrs</span>
                                                {/*end::Label*/}
                                            </div>
                                            {/*end::Item*/}
                                            {/*begin::Item*/}
                                            <div className="d-flex flex-stack py-4">
                                                {/*begin::Section*/}
                                                <div className="d-flex align-items-center">
                                                    {/*begin::Symbol*/}
                                                    <div className="symbol symbol-35px me-4">
                                                        <span className="symbol-label bg-light-warning">
                                                            <i className="ki-outline ki-briefcase fs-2 text-warning"></i>
                                                        </span>
                                                    </div>
                                                    {/*end::Symbol*/}
                                                    {/*begin::Title*/}
                                                    <div className="mb-0 me-2">
                                                        <a href="#" className="fs-6 text-gray-800 text-hover-primary fw-bold">Company HR</a>
                                                        <div className="text-gray-500 fs-7">Corporeate staff profiles</div>
                                                    </div>
                                                    {/*end::Title*/}
                                                </div>
                                                {/*end::Section*/}
                                                {/*begin::Label*/}
                                                <span className="badge badge-light fs-8">5 hrs</span>
                                                {/*end::Label*/}
                                            </div>
                                            {/*end::Item*/}
                                            {/*begin::Item*/}
                                            <div className="d-flex flex-stack py-4">
                                                {/*begin::Section*/}
                                                <div className="d-flex align-items-center">
                                                    {/*begin::Symbol*/}
                                                    <div className="symbol symbol-35px me-4">
                                                        <span className="symbol-label bg-light-success">
                                                            <i className="ki-outline ki-abstract-12 fs-2 text-success"></i>
                                                        </span>
                                                    </div>
                                                    {/*end::Symbol*/}
                                                    {/*begin::Title*/}
                                                    <div className="mb-0 me-2">
                                                        <a href="#" className="fs-6 text-gray-800 text-hover-primary fw-bold">Project Redux</a>
                                                        <div className="text-gray-500 fs-7">New frontend admin theme</div>
                                                    </div>
                                                    {/*end::Title*/}
                                                </div>
                                                {/*end::Section*/}
                                                {/*begin::Label*/}
                                                <span className="badge badge-light fs-8">2 days</span>
                                                {/*end::Label*/}
                                            </div>
                                            {/*end::Item*/}
                                            {/*begin::Item*/}
                                            <div className="d-flex flex-stack py-4">
                                                {/*begin::Section*/}
                                                <div className="d-flex align-items-center">
                                                    {/*begin::Symbol*/}
                                                    <div className="symbol symbol-35px me-4">
                                                        <span className="symbol-label bg-light-primary">
                                                            <i className="ki-outline ki-colors-square fs-2 text-primary"></i>
                                                        </span>
                                                    </div>
                                                    {/*end::Symbol*/}
                                                    {/*begin::Title*/}
                                                    <div className="mb-0 me-2">
                                                        <a href="#" className="fs-6 text-gray-800 text-hover-primary fw-bold">Project Breafing</a>
                                                        <div className="text-gray-500 fs-7">Product launch status update</div>
                                                    </div>
                                                    {/*end::Title*/}
                                                </div>
                                                {/*end::Section*/}
                                                {/*begin::Label*/}
                                                <span className="badge badge-light fs-8">21 Jan</span>
                                                {/*end::Label*/}
                                            </div>
                                            {/*end::Item*/}
                                            {/*begin::Item*/}
                                            <div className="d-flex flex-stack py-4">
                                                {/*begin::Section*/}
                                                <div className="d-flex align-items-center">
                                                    {/*begin::Symbol*/}
                                                    <div className="symbol symbol-35px me-4">
                                                        <span className="symbol-label bg-light-info">
                                                            <i className="ki-outline ki-picture fs-2 text-info"></i>
                                                        </span>
                                                    </div>
                                                    {/*end::Symbol*/}
                                                    {/*begin::Title*/}
                                                    <div className="mb-0 me-2">
                                                        <a href="#" className="fs-6 text-gray-800 text-hover-primary fw-bold">Banner Assets</a>
                                                        <div className="text-gray-500 fs-7">Collection of banner images</div>
                                                    </div>
                                                    {/*end::Title*/}
                                                </div>
                                                {/*end::Section*/}
                                                {/*begin::Label*/}
                                                <span className="badge badge-light fs-8">21 Jan</span>
                                                {/*end::Label*/}
                                            </div>
                                            {/*end::Item*/}
                                            {/*begin::Item*/}
                                            <div className="d-flex flex-stack py-4">
                                                {/*begin::Section*/}
                                                <div className="d-flex align-items-center">
                                                    {/*begin::Symbol*/}
                                                    <div className="symbol symbol-35px me-4">
                                                        <span className="symbol-label bg-light-warning">
                                                            <i className="ki-outline ki-color-swatch fs-2 text-warning"></i>
                                                        </span>
                                                    </div>
                                                    {/*end::Symbol*/}
                                                    {/*begin::Title*/}
                                                    <div className="mb-0 me-2">
                                                        <a href="#" className="fs-6 text-gray-800 text-hover-primary fw-bold">Icon Assets</a>
                                                        <div className="text-gray-500 fs-7">Collection of SVG icons</div>
                                                    </div>
                                                    {/*end::Title*/}
                                                </div>
                                                {/*end::Section*/}
                                                {/*begin::Label*/}
                                                <span className="badge badge-light fs-8">20 March</span>
                                                {/*end::Label*/}
                                            </div>
                                            {/*end::Item*/}
                                        </div>
                                        {/*end::Items*/}
                                        {/*begin::View more*/}
                                        <div className="py-3 text-center border-top">
                                            <a href="pages/user-profile/activity.html" className="btn btn-color-gray-600 btn-active-color-primary">View All
                                                <i className="ki-outline ki-arrow-right fs-5"></i></a>
                                        </div>
                                        {/*end::View more*/}
                                    </div>
                                    {/*end::Tab panel*/}
                                    {/*begin::Tab panel*/}
                                    <div className="tab-pane fade show active" id="kt_topbar_notifications_2" role="tabpanel">
                                        {/*begin::Wrapper*/}
                                        <div className="d-flex flex-column px-9">
                                            {/*begin::Section*/}
                                            <div className="pt-10 pb-0">
                                                {/*begin::Title*/}
                                                <h3 className="text-gray-900 text-center fw-bold">Get Pro Access</h3>
                                                {/*end::Title*/}
                                                {/*begin::Text*/}
                                                <div className="text-center text-gray-600 fw-semibold pt-1">Outlines keep you honest. They stoping you from amazing poorly about drive</div>
                                                {/*end::Text*/}
                                                {/*begin::Action*/}
                                                <div className="text-center mt-5 mb-9">
                                                    <a href="#" className="btn btn-sm btn-primary px-6" data-bs-toggle="modal" data-bs-target="#kt_modal_upgrade_plan">Upgrade</a>
                                                </div>
                                                {/*end::Action*/}
                                            </div>
                                            {/*end::Section*/}
                                            {/*begin::Illustration*/}
                                            <div className="text-center px-4">
                                                <img className="mw-100 mh-200px" alt="image" src="/assets/media/illustrations/sketchy-1/1.png" />
                                            </div>
                                            {/*end::Illustration*/}
                                        </div>
                                        {/*end::Wrapper*/}
                                    </div>
                                    {/*end::Tab panel*/}
                                    {/*begin::Tab panel*/}
                                    <div className="tab-pane fade" id="kt_topbar_notifications_3" role="tabpanel">
                                        {/*begin::Items*/}
                                        <div className="scroll-y mh-325px my-5 px-8">
                                            {/*begin::Item*/}
                                            <div className="d-flex flex-stack py-4">
                                                {/*begin::Section*/}
                                                <div className="d-flex align-items-center me-2">
                                                    {/*begin::Code*/}
                                                    <span className="w-70px badge badge-light-success me-4">200 OK</span>
                                                    {/*end::Code*/}
                                                    {/*begin::Title*/}
                                                    <a href="#" className="text-gray-800 text-hover-primary fw-semibold">New order</a>
                                                    {/*end::Title*/}
                                                </div>
                                                {/*end::Section*/}
                                                {/*begin::Label*/}
                                                <span className="badge badge-light fs-8">Just now</span>
                                                {/*end::Label*/}
                                            </div>
                                            {/*end::Item*/}
                                            {/*begin::Item*/}
                                            <div className="d-flex flex-stack py-4">
                                                {/*begin::Section*/}
                                                <div className="d-flex align-items-center me-2">
                                                    {/*begin::Code*/}
                                                    <span className="w-70px badge badge-light-danger me-4">500 ERR</span>
                                                    {/*end::Code*/}
                                                    {/*begin::Title*/}
                                                    <a href="#" className="text-gray-800 text-hover-primary fw-semibold">New customer</a>
                                                    {/*end::Title*/}
                                                </div>
                                                {/*end::Section*/}
                                                {/*begin::Label*/}
                                                <span className="badge badge-light fs-8">2 hrs</span>
                                                {/*end::Label*/}
                                            </div>
                                            {/*end::Item*/}
                                            {/*begin::Item*/}
                                            <div className="d-flex flex-stack py-4">
                                                {/*begin::Section*/}
                                                <div className="d-flex align-items-center me-2">
                                                    {/*begin::Code*/}
                                                    <span className="w-70px badge badge-light-success me-4">200 OK</span>
                                                    {/*end::Code*/}
                                                    {/*begin::Title*/}
                                                    <a href="#" className="text-gray-800 text-hover-primary fw-semibold">Payment process</a>
                                                    {/*end::Title*/}
                                                </div>
                                                {/*end::Section*/}
                                                {/*begin::Label*/}
                                                <span className="badge badge-light fs-8">5 hrs</span>
                                                {/*end::Label*/}
                                            </div>
                                            {/*end::Item*/}
                                            {/*begin::Item*/}
                                            <div className="d-flex flex-stack py-4">
                                                {/*begin::Section*/}
                                                <div className="d-flex align-items-center me-2">
                                                    {/*begin::Code*/}
                                                    <span className="w-70px badge badge-light-warning me-4">300 WRN</span>
                                                    {/*end::Code*/}
                                                    {/*begin::Title*/}
                                                    <a href="#" className="text-gray-800 text-hover-primary fw-semibold">Search query</a>
                                                    {/*end::Title*/}
                                                </div>
                                                {/*end::Section*/}
                                                {/*begin::Label*/}
                                                <span className="badge badge-light fs-8">2 days</span>
                                                {/*end::Label*/}
                                            </div>
                                            {/*end::Item*/}
                                            {/*begin::Item*/}
                                            <div className="d-flex flex-stack py-4">
                                                {/*begin::Section*/}
                                                <div className="d-flex align-items-center me-2">
                                                    {/*begin::Code*/}
                                                    <span className="w-70px badge badge-light-success me-4">200 OK</span>
                                                    {/*end::Code*/}
                                                    {/*begin::Title*/}
                                                    <a href="#" className="text-gray-800 text-hover-primary fw-semibold">API connection</a>
                                                    {/*end::Title*/}
                                                </div>
                                                {/*end::Section*/}
                                                {/*begin::Label*/}
                                                <span className="badge badge-light fs-8">1 week</span>
                                                {/*end::Label*/}
                                            </div>
                                            {/*end::Item*/}
                                            {/*begin::Item*/}
                                            <div className="d-flex flex-stack py-4">
                                                {/*begin::Section*/}
                                                <div className="d-flex align-items-center me-2">
                                                    {/*begin::Code*/}
                                                    <span className="w-70px badge badge-light-success me-4">200 OK</span>
                                                    {/*end::Code*/}
                                                    {/*begin::Title*/}
                                                    <a href="#" className="text-gray-800 text-hover-primary fw-semibold">Database restore</a>
                                                    {/*end::Title*/}
                                                </div>
                                                {/*end::Section*/}
                                                {/*begin::Label*/}
                                                <span className="badge badge-light fs-8">Mar 5</span>
                                                {/*end::Label*/}
                                            </div>
                                            {/*end::Item*/}
                                            {/*begin::Item*/}
                                            <div className="d-flex flex-stack py-4">
                                                {/*begin::Section*/}
                                                <div className="d-flex align-items-center me-2">
                                                    {/*begin::Code*/}
                                                    <span className="w-70px badge badge-light-warning me-4">300 WRN</span>
                                                    {/*end::Code*/}
                                                    {/*begin::Title*/}
                                                    <a href="#" className="text-gray-800 text-hover-primary fw-semibold">System update</a>
                                                    {/*end::Title*/}
                                                </div>
                                                {/*end::Section*/}
                                                {/*begin::Label*/}
                                                <span className="badge badge-light fs-8">May 15</span>
                                                {/*end::Label*/}
                                            </div>
                                            {/*end::Item*/}
                                            {/*begin::Item*/}
                                            <div className="d-flex flex-stack py-4">
                                                {/*begin::Section*/}
                                                <div className="d-flex align-items-center me-2">
                                                    {/*begin::Code*/}
                                                    <span className="w-70px badge badge-light-warning me-4">300 WRN</span>
                                                    {/*end::Code*/}
                                                    {/*begin::Title*/}
                                                    <a href="#" className="text-gray-800 text-hover-primary fw-semibold">Server OS update</a>
                                                    {/*end::Title*/}
                                                </div>
                                                {/*end::Section*/}
                                                {/*begin::Label*/}
                                                <span className="badge badge-light fs-8">Apr 3</span>
                                                {/*end::Label*/}
                                            </div>
                                            {/*end::Item*/}
                                            {/*begin::Item*/}
                                            <div className="d-flex flex-stack py-4">
                                                {/*begin::Section*/}
                                                <div className="d-flex align-items-center me-2">
                                                    {/*begin::Code*/}
                                                    <span className="w-70px badge badge-light-warning me-4">300 WRN</span>
                                                    {/*end::Code*/}
                                                    {/*begin::Title*/}
                                                    <a href="#" className="text-gray-800 text-hover-primary fw-semibold">API rollback</a>
                                                    {/*end::Title*/}
                                                </div>
                                                {/*end::Section*/}
                                                {/*begin::Label*/}
                                                <span className="badge badge-light fs-8">Jun 30</span>
                                                {/*end::Label*/}
                                            </div>
                                            {/*end::Item*/}
                                            {/*begin::Item*/}
                                            <div className="d-flex flex-stack py-4">
                                                {/*begin::Section*/}
                                                <div className="d-flex align-items-center me-2">
                                                    {/*begin::Code*/}
                                                    <span className="w-70px badge badge-light-danger me-4">500 ERR</span>
                                                    {/*end::Code*/}
                                                    {/*begin::Title*/}
                                                    <a href="#" className="text-gray-800 text-hover-primary fw-semibold">Refund process</a>
                                                    {/*end::Title*/}
                                                </div>
                                                {/*end::Section*/}
                                                {/*begin::Label*/}
                                                <span className="badge badge-light fs-8">Jul 10</span>
                                                {/*end::Label*/}
                                            </div>
                                            {/*end::Item*/}
                                            {/*begin::Item*/}
                                            <div className="d-flex flex-stack py-4">
                                                {/*begin::Section*/}
                                                <div className="d-flex align-items-center me-2">
                                                    {/*begin::Code*/}
                                                    <span className="w-70px badge badge-light-danger me-4">500 ERR</span>
                                                    {/*end::Code*/}
                                                    {/*begin::Title*/}
                                                    <a href="#" className="text-gray-800 text-hover-primary fw-semibold">Withdrawal process</a>
                                                    {/*end::Title*/}
                                                </div>
                                                {/*end::Section*/}
                                                {/*begin::Label*/}
                                                <span className="badge badge-light fs-8">Sep 10</span>
                                                {/*end::Label*/}
                                            </div>
                                            {/*end::Item*/}
                                            {/*begin::Item*/}
                                            <div className="d-flex flex-stack py-4">
                                                {/*begin::Section*/}
                                                <div className="d-flex align-items-center me-2">
                                                    {/*begin::Code*/}
                                                    <span className="w-70px badge badge-light-danger me-4">500 ERR</span>
                                                    {/*end::Code*/}
                                                    {/*begin::Title*/}
                                                    <a href="#" className="text-gray-800 text-hover-primary fw-semibold">Mail tasks</a>
                                                    {/*end::Title*/}
                                                </div>
                                                {/*end::Section*/}
                                                {/*begin::Label*/}
                                                <span className="badge badge-light fs-8">Dec 10</span>
                                                {/*end::Label*/}
                                            </div>
                                            {/*end::Item*/}
                                        </div>
                                        {/*end::Items*/}
                                        {/*begin::View more*/}
                                        <div className="py-3 text-center border-top">
                                            <a href="pages/user-profile/activity.html" className="btn btn-color-gray-600 btn-active-color-primary">View All
                                                <i className="ki-outline ki-arrow-right fs-5"></i></a>
                                        </div>
                                        {/*end::View more*/}
                                    </div>
                                    {/*end::Tab panel*/}
                                </div>
                                {/*end::Tab content*/}
                            </div>
                            {/*end::Menu*/}
                            {/*end::Menu wrapper*/}
                        </div>
                        {/*end::Notifications*/}
                        {/*begin::User menu*/}
                        <div className="app-navbar-item" id="kt_header_user_menu_toggle">
                            {/*begin::Menu wrapper*/}
                            <div className="cursor-pointer symbol symbol-40px" data-kt-menu-trigger="{default: 'click', lg: 'hover'}" data-kt-menu-attach="parent" data-kt-menu-placement="bottom-end">
                                <img src="/assets/media/avatars/300-2.jpg" className="rounded-3" alt="user" />
                            </div>
                            {/*begin::User account menu*/}
                            <div className="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-800 menu-state-bg menu-state-color fw-semibold py-4 fs-6 w-275px" data-kt-menu="true">
                                {/*begin::Menu item*/}
                                <div className="menu-item px-3">
                                    <div className="menu-content d-flex align-items-center px-3">
                                        {/*begin::Avatar*/}
                                        <div className="symbol symbol-50px me-5">
                                            <img alt="Logo" src="/assets/media/avatars/300-2.jpg" />
                                        </div>
                                        {/*end::Avatar*/}
                                        {/*begin::Username*/}
                                        <div className="d-flex flex-column">
                                            <div className="fw-bold d-flex align-items-center fs-5">Ana Fox
                                                <span className="badge badge-light-success fw-bold fs-8 px-2 py-1 ms-2">Pro</span></div>
                                            <a href="#" className="fw-semibold text-muted text-hover-primary fs-7">ana@kt.com</a>
                                        </div>
                                        {/*end::Username*/}
                                    </div>
                                </div>
                                {/*end::Menu item*/}
                                {/*begin::Menu separator*/}
                                <div className="separator my-2"></div>
                                {/*end::Menu separator*/}
                                {/*begin::Menu item*/}
                                <div className="menu-item px-5">
                                    <a href="account/overview.html" className="menu-link px-5">My Profile</a>
                                </div>
                                {/*end::Menu item*/}
                                {/*begin::Menu item*/}
                                <div className="menu-item px-5">
                                    <a href="apps/projects/list.html" className="menu-link px-5">
                                        <span className="menu-text">My Projects</span>
                                        <span className="menu-badge">
                                            <span className="badge badge-light-danger badge-circle fw-bold fs-7">3</span>
                                        </span>
                                    </a>
                                </div>
                                {/*end::Menu item*/}
                                {/*begin::Menu item*/}
                                <div className="menu-item px-5" data-kt-menu-trigger="{default: 'click', lg: 'hover'}" data-kt-menu-placement="left-start" data-kt-menu-offset="-15px, 0">
                                    <a href="#" className="menu-link px-5">
                                        <span className="menu-title">My Subscription</span>
                                        <span className="menu-arrow"></span>
                                    </a>
                                    {/*begin::Menu sub*/}
                                    <div className="menu-sub menu-sub-dropdown w-175px py-4">
                                        {/*begin::Menu item*/}
                                        <div className="menu-item px-3">
                                            <a href="account/referrals.html" className="menu-link px-5">Referrals</a>
                                        </div>
                                        {/*end::Menu item*/}
                                        {/*begin::Menu item*/}
                                        <div className="menu-item px-3">
                                            <a href="account/billing.html" className="menu-link px-5">Billing</a>
                                        </div>
                                        {/*end::Menu item*/}
                                        {/*begin::Menu item*/}
                                        <div className="menu-item px-3">
                                            <a href="account/statements.html" className="menu-link px-5">Payments</a>
                                        </div>
                                        {/*end::Menu item*/}
                                        {/*begin::Menu item*/}
                                        <div className="menu-item px-3">
                                            <a href="account/statements.html" className="menu-link d-flex flex-stack px-5">Statements
                                                <span className="ms-2 lh-0" data-bs-toggle="tooltip" title="View your statements">
                                                    <i className="ki-outline ki-information-5 fs-5"></i>
                                                </span></a>
                                        </div>
                                        {/*end::Menu item*/}
                                        {/*begin::Menu separator*/}
                                        <div className="separator my-2"></div>
                                        {/*end::Menu separator*/}
                                        {/*begin::Menu item*/}
                                        <div className="menu-item px-3">
                                            <div className="menu-content px-3">
                                                <label className="form-check form-switch form-check-custom form-check-solid">
                                                    <input className="form-check-input w-30px h-20px" type="checkbox" value="1" defaultChecked={true} name="notifications" />
                                                    <span className="form-check-label text-muted fs-7">Notifications</span>
                                                </label>
                                            </div>
                                        </div>
                                        {/*end::Menu item*/}
                                    </div>
                                    {/*end::Menu sub*/}
                                </div>
                                {/*end::Menu item*/}
                                {/*begin::Menu item*/}
                                <div className="menu-item px-5">
                                    <a href="account/statements.html" className="menu-link px-5">My Statements</a>
                                </div>
                                {/*end::Menu item*/}
                                {/*begin::Menu separator*/}
                                <div className="separator my-2"></div>
                                {/*end::Menu separator*/}
                                {/*begin::Menu item*/}
                                <div className="menu-item px-5" data-kt-menu-trigger="{default: 'click', lg: 'hover'}" data-kt-menu-placement="left-start" data-kt-menu-offset="-15px, 0">
                                    <a href="#" className="menu-link px-5">
                                        <span className="menu-title position-relative">Language
                                            <span className="fs-8 rounded bg-light px-3 py-2 position-absolute translate-middle-y top-50 end-0">English
                                                <img className="w-15px h-15px rounded-1 ms-2" src="/assets/media/flags/united-states.svg" alt="" /></span></span>
                                    </a>
                                    {/*begin::Menu sub*/}
                                    <div className="menu-sub menu-sub-dropdown w-175px py-4">
                                        {/*begin::Menu item*/}
                                        <div className="menu-item px-3">
                                            <a href="account/settings.html" className="menu-link d-flex px-5 active">
                                                <span className="symbol symbol-20px me-4">
                                                    <img className="rounded-1" src="/assets/media/flags/united-states.svg" alt="" />
                                                </span>English</a>
                                        </div>
                                        {/*end::Menu item*/}
                                        {/*begin::Menu item*/}
                                        <div className="menu-item px-3">
                                            <a href="account/settings.html" className="menu-link d-flex px-5">
                                                <span className="symbol symbol-20px me-4">
                                                    <img className="rounded-1" src="/assets/media/flags/spain.svg" alt="" />
                                                </span>Spanish</a>
                                        </div>
                                        {/*end::Menu item*/}
                                        {/*begin::Menu item*/}
                                        <div className="menu-item px-3">
                                            <a href="account/settings.html" className="menu-link d-flex px-5">
                                                <span className="symbol symbol-20px me-4">
                                                    <img className="rounded-1" src="/assets/media/flags/germany.svg" alt="" />
                                                </span>German</a>
                                        </div>
                                        {/*end::Menu item*/}
                                        {/*begin::Menu item*/}
                                        <div className="menu-item px-3">
                                            <a href="account/settings.html" className="menu-link d-flex px-5">
                                                <span className="symbol symbol-20px me-4">
                                                    <img className="rounded-1" src="/assets/media/flags/japan.svg" alt="" />
                                                </span>Japanese</a>
                                        </div>
                                        {/*end::Menu item*/}
                                        {/*begin::Menu item*/}
                                        <div className="menu-item px-3">
                                            <a href="account/settings.html" className="menu-link d-flex px-5">
                                                <span className="symbol symbol-20px me-4">
                                                    <img className="rounded-1" src="/assets/media/flags/france.svg" alt="" />
                                                </span>French</a>
                                        </div>
                                        {/*end::Menu item*/}
                                    </div>
                                    {/*end::Menu sub*/}
                                </div>
                                {/*end::Menu item*/}
                                {/*begin::Menu item*/}
                                <div className="menu-item px-5 my-1">
                                    <a href="account/settings.html" className="menu-link px-5">Account Settings</a>
                                </div>
                                {/*end::Menu item*/}
                                {/*begin::Menu item*/}
                                <div className="menu-item px-5">
                                    <a href="authentication/layouts/corporate/sign-in.html" className="menu-link px-5">Sign Out</a>
                                </div>
                                {/*end::Menu item*/}
                            </div>
                            {/*end::User account menu*/}
                            {/*end::Menu wrapper*/}
                        </div>
                        {/*end::User menu*/}
                    </div>
                    {/*end::Navbar*/}
                </div>
            </div>
            {/*end::Header container*/}
        </div>
    );
};

export default Header;
