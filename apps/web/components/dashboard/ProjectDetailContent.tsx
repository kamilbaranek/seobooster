import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useProjects } from './hooks/useProjects';
import dynamic from 'next/dynamic';
import InboxTab from './inbox/InboxTab';
import ActivityTab from './activity/ActivityTab';
import SettingsTab from './settings/SettingsTab';
import { ApexOptions } from 'apexcharts';
import { apiFetch } from '../../lib/api-client';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface ArticlePlan {
    id: string;
    status: string;
    plannedPublishAt: string;
    articleTitle: string;
    articleKeywords: any;
    articleIntent: string;
    clusterName: string;
    clusterIntent: string;
}

interface ProjectDetailContentProps {
    projectId?: string;
}

const ProjectDetailContent: React.FC<ProjectDetailContentProps> = ({ projectId }) => {
    const { projects } = useProjects();
    const project = projects.find(p => p.id === projectId);
    const projectIndex = projects.findIndex(p => p.id === projectId);

    const colors = ['warning', 'danger', 'primary', 'success', 'info'];
    const color = projectIndex >= 0 ? colors[projectIndex % colors.length] : 'primary';
    const iconClass = `ki-outline ki-abstract-${(projectIndex >= 0 ? (projectIndex % 20) + 10 : 10)} fs-3x fs-lg-4x text-inverse-${color}`;

    const [activeTab, setActiveTab] = useState('overview');
    const [activeScheduleDay, setActiveScheduleDay] = useState(0);
    const [articlePlans, setArticlePlans] = useState<ArticlePlan[]>([]);
    const [loadingPlans, setLoadingPlans] = useState(false);

    // Fetch article plans when projectId changes
    useEffect(() => {
        if (!projectId) return;

        const fetchArticlePlans = async () => {
            setLoadingPlans(true);
            try {
                const plans = await apiFetch<ArticlePlan[]>(`/webs/${projectId}/article-plans`);
                setArticlePlans(plans);
            } catch (error) {
                console.error('Failed to fetch article plans:', error);
            } finally {
                setLoadingPlans(false);
            }
        };

        fetchArticlePlans();
    }, [projectId]);

    const summaryChartOptions: ApexOptions = {
        chart: {
            fontFamily: 'inherit',
            type: 'donut',
            width: 250,
        },
        plotOptions: {
            pie: {
                donut: {
                    size: '50%',
                    labels: {
                        value: {
                            fontSize: '32px',
                        },
                    },
                },
            },
        },
        colors: ['#009ef7', '#50cd89', '#f1416c', '#e4e6ef'],
        stroke: {
            width: 0,
        },
        labels: ['Active', 'Completed', 'Overdue', 'Yet to start'],
        legend: {
            show: false,
        },
        dataLabels: {
            enabled: false,
        },
        tooltip: {
            enabled: true,
        },
    };

    const summaryChartSeries = [30, 45, 0, 25];

    const tasksChartOptions: ApexOptions = {
        chart: {
            fontFamily: 'inherit',
            type: 'area',
            height: 300,
            toolbar: {
                show: false,
            },
        },
        plotOptions: {},
        legend: {
            show: false,
        },
        dataLabels: {
            enabled: false,
        },
        fill: {
            type: 'solid',
            opacity: 1,
        },
        stroke: {
            curve: 'smooth',
            show: true,
            width: 3,
            colors: ['#7239ea', '#50cd89'],
        },
        xaxis: {
            categories: ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
            axisBorder: {
                show: false,
            },
            axisTicks: {
                show: false,
            },
            labels: {
                style: {
                    colors: '#A1A5B7',
                    fontSize: '12px',
                },
            },
            crosshairs: {
                position: 'front',
                stroke: {
                    color: '#7239ea',
                    width: 1,
                    dashArray: 3,
                },
            },
            tooltip: {
                enabled: true,
                formatter: undefined,
                offsetY: 0,
                style: {
                    fontSize: '12px',
                },
            },
        },
        yaxis: {
            labels: {
                style: {
                    colors: '#A1A5B7',
                    fontSize: '12px',
                },
            },
        },
        states: {
            hover: {
                filter: {
                    type: 'none',
                },
            },
            active: {
                allowMultipleDataPointsSelection: false,
                filter: {
                    type: 'none',
                },
            },
        },
        tooltip: {
            style: {
                fontSize: '12px',
            },
            y: {
                formatter: function (val) {
                    return val + ' tasks';
                },
            },
        },
        colors: ['#7239ea', '#50cd89'],
        grid: {
            borderColor: '#eff2f5',
            strokeDashArray: 4,
            yaxis: {
                lines: {
                    show: true,
                },
            },
        },
        markers: {
            strokeColors: ['#7239ea', '#50cd89'],
            strokeWidth: 3,
        },
    };

    const tasksChartSeries = [
        {
            name: 'Incomplete',
            data: [30, 40, 40, 90, 90, 70, 70],
        },
        {
            name: 'Complete',
            data: [10, 10, 50, 50, 80, 80, 90],
        },
    ];

    return (
        <>
            {/*begin::Navbar*/}
            <div className="card mb-6 mb-xl-9">
                <div className="card-body pt-9 pb-0">
                    {/*begin::Details*/}
                    <div className="d-flex flex-wrap flex-sm-nowrap mb-6">
                        {/*begin::Image*/}
                        <div className={`d-flex flex-center flex-shrink-0 bg-${(project?.screenshotUrl || project?.faviconUrl) ? 'light' : color} rounded ${project?.screenshotUrl ? 'w-200px w-lg-300px' : 'w-100px h-100px w-lg-150px h-lg-150px'} me-7 mb-4 overflow-hidden`}>
                            {(project?.screenshotUrl || project?.faviconUrl) ? (
                                <img
                                    className={project?.screenshotUrl ? "w-100" : "mw-50px mw-lg-75px"}
                                    src={project?.screenshotUrl || project?.faviconUrl}
                                    alt={project?.nickname || 'Project'}
                                />
                            ) : (
                                <i className={iconClass}></i>
                            )}
                        </div>
                        {/*end::Image*/}
                        {/*begin::Wrapper*/}
                        <div className="flex-grow-1">
                            {/*begin::Head*/}
                            <div className="d-flex justify-content-between align-items-start flex-wrap mb-2">
                                {/*begin::Details*/}
                                <div className="d-flex flex-column">
                                    {/*begin::Status*/}
                                    <div className="d-flex align-items-center mb-1">
                                        <a href="#" className="text-gray-800 text-hover-primary fs-2 fw-bold me-3">{project?.nickname || project?.url || 'Project Details'}</a>
                                        <span className="badge badge-light-success me-auto">In Progress</span>
                                    </div>
                                    {/*end::Status*/}
                                    {/*begin::Description*/}
                                    <div className="d-flex flex-wrap fw-semibold mb-4 fs-5 text-gray-500">#1 Tool to get started with Web Apps any Kind & size</div>
                                    {/*end::Description*/}
                                </div>
                                {/*end::Details*/}
                                {/*begin::Actions*/}
                                <div className="d-flex mb-4">
                                    <a href="#" className="btn btn-sm btn-bg-light btn-active-color-primary me-3" data-bs-toggle="modal" data-bs-target="#kt_modal_users_search">Add User</a>
                                    <a href="#" className="btn btn-sm btn-primary me-3" data-bs-toggle="modal" data-bs-target="#kt_modal_new_target">Add Target</a>
                                    {/*begin::Menu*/}
                                    <div className="me-0">
                                        <button className="btn btn-sm btn-icon btn-bg-light btn-active-color-primary" data-kt-menu-trigger="click" data-kt-menu-placement="bottom-end">
                                            <i className="ki-solid ki-dots-horizontal fs-2x"></i>
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
                                    </div>
                                    {/*end::Menu*/}
                                </div>
                                {/*end::Actions*/}
                            </div>
                            {/*end::Head*/}
                            {/*begin::Info*/}
                            <div className="d-flex flex-wrap justify-content-start">
                                {/*begin::Stats*/}
                                <div className="d-flex flex-wrap">
                                    {/*begin::Stat*/}
                                    <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
                                        {/*begin::Number*/}
                                        <div className="d-flex align-items-center">
                                            <div className="fs-4 fw-bold">29 Jan, 2025</div>
                                        </div>
                                        {/*end::Number*/}
                                        {/*begin::Label*/}
                                        <div className="fw-semibold fs-6 text-gray-500">Due Date</div>
                                        {/*end::Label*/}
                                    </div>
                                    {/*end::Stat*/}
                                    {/*begin::Stat*/}
                                    <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
                                        {/*begin::Number*/}
                                        <div className="d-flex align-items-center">
                                            <i className="ki-outline ki-arrow-down fs-3 text-danger me-2"></i>
                                            <div className="fs-4 fw-bold" data-kt-countup="true" data-kt-countup-value="75">0</div>
                                        </div>
                                        {/*end::Number*/}
                                        {/*begin::Label*/}
                                        <div className="fw-semibold fs-6 text-gray-500">Open Tasks</div>
                                        {/*end::Label*/}
                                    </div>
                                    {/*end::Stat*/}
                                    {/*begin::Stat*/}
                                    <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
                                        {/*begin::Number*/}
                                        <div className="d-flex align-items-center">
                                            <i className="ki-outline ki-arrow-up fs-3 text-success me-2"></i>
                                            <div className="fs-4 fw-bold" data-kt-countup="true" data-kt-countup-value="15000" data-kt-countup-prefix="$">0</div>
                                        </div>
                                        {/*end::Number*/}
                                        {/*begin::Label*/}
                                        <div className="fw-semibold fs-6 text-gray-500">Budget Spent</div>
                                        {/*end::Label*/}
                                    </div>
                                    {/*end::Stat*/}
                                </div>
                                {/*end::Stats*/}
                                {/*begin::Users*/}
                                <div className="symbol-group symbol-hover mb-3">
                                    {/*begin::User*/}
                                    <div className="symbol symbol-35px symbol-circle" data-bs-toggle="tooltip" title="Alan Warden">
                                        <span className="symbol-label bg-warning text-inverse-warning fw-bold">A</span>
                                    </div>
                                    {/*end::User*/}
                                    {/*begin::User*/}
                                    <div className="symbol symbol-35px symbol-circle" data-bs-toggle="tooltip" title="Michael Eberon">
                                        <img alt="Pic" src="/assets/media/avatars/300-11.jpg" />
                                    </div>
                                    {/*end::User*/}
                                    {/*begin::User*/}
                                    <div className="symbol symbol-35px symbol-circle" data-bs-toggle="tooltip" title="Michelle Swanston">
                                        <img alt="Pic" src="/assets/media/avatars/300-7.jpg" />
                                    </div>
                                    {/*end::User*/}
                                    {/*begin::User*/}
                                    <div className="symbol symbol-35px symbol-circle" data-bs-toggle="tooltip" title="Francis Mitcham">
                                        <img alt="Pic" src="/assets/media/avatars/300-20.jpg" />
                                    </div>
                                    {/*end::User*/}
                                    {/*begin::User*/}
                                    <div className="symbol symbol-35px symbol-circle" data-bs-toggle="tooltip" title="Susan Redwood">
                                        <span className="symbol-label bg-primary text-inverse-primary fw-bold">S</span>
                                    </div>
                                    {/*end::User*/}
                                    {/*begin::User*/}
                                    <div className="symbol symbol-35px symbol-circle" data-bs-toggle="tooltip" title="Melody Macy">
                                        <img alt="Pic" src="/assets/media/avatars/300-2.jpg" />
                                    </div>
                                    {/*end::User*/}
                                    {/*begin::User*/}
                                    <div className="symbol symbol-35px symbol-circle" data-bs-toggle="tooltip" title="Perry Matthew">
                                        <span className="symbol-label bg-info text-inverse-info fw-bold">P</span>
                                    </div>
                                    {/*end::User*/}
                                    {/*begin::User*/}
                                    <div className="symbol symbol-35px symbol-circle" data-bs-toggle="tooltip" title="Barry Walter">
                                        <img alt="Pic" src="/assets/media/avatars/300-12.jpg" />
                                    </div>
                                    {/*end::User*/}
                                    {/*begin::All users*/}
                                    <a href="#" className="symbol symbol-35px symbol-circle" data-bs-toggle="modal" data-bs-target="#kt_modal_view_users">
                                        <span className="symbol-label bg-dark text-inverse-dark fs-8 fw-bold" data-bs-toggle="tooltip" data-bs-trigger="hover" title="View more users">+42</span>
                                    </a>
                                    {/*end::All users*/}
                                </div>
                                {/*end::Users*/}
                            </div>
                            {/*end::Info*/}
                        </div>
                        {/*end::Wrapper*/}
                    </div>
                    {/*end::Details*/}
                    <div className="separator"></div>
                    {/*begin::Nav*/}
                    <ul className="nav nav-stretch nav-line-tabs nav-line-tabs-2x border-transparent fs-5 fw-bold">
                        {/*begin::Nav item*/}
                        <li className="nav-item">
                            <a className={`nav-link text-active-primary py-5 me-6 ${activeTab === 'overview' ? 'active' : ''}`} href="#" onClick={(e) => { e.preventDefault(); setActiveTab('overview'); }}>Overview</a>
                        </li>
                        {/*end::Nav item*/}
                        {/*begin::Nav item*/}
                        <li className="nav-item">
                            <a className={`nav-link text-active-primary py-5 me-6 ${activeTab === 'targets' ? 'active' : ''}`} href="#" onClick={(e) => { e.preventDefault(); setActiveTab('targets'); }}>Targets</a>
                        </li>
                        {/*end::Nav item*/}
                        {/*begin::Nav item*/}
                        <li className="nav-item">
                            <a className={`nav-link text-active-primary py-5 me-6 ${activeTab === 'inbox' ? 'active' : ''}`} href="#" onClick={(e) => { e.preventDefault(); setActiveTab('inbox'); }}>Inbox</a>
                        </li>
                        {/*end::Nav item*/}
                        {/*begin::Nav item*/}
                        <li className="nav-item">
                            <a className={`nav-link text-active-primary py-5 me-6 ${activeTab === 'budget' ? 'active' : ''}`} href="#" onClick={(e) => { e.preventDefault(); setActiveTab('budget'); }}>Budget</a>
                        </li>
                        {/*end::Nav item*/}
                        {/*begin::Nav item*/}
                        <li className="nav-item">
                            <a className={`nav-link text-active-primary py-5 me-6 ${activeTab === 'users' ? 'active' : ''}`} href="#" onClick={(e) => { e.preventDefault(); setActiveTab('users'); }}>Users</a>
                        </li>
                        {/*end::Nav item*/}
                        {/*begin::Nav item*/}
                        <li className="nav-item">
                            <a className={`nav-link text-active-primary py-5 me-6 ${activeTab === 'files' ? 'active' : ''}`} href="#" onClick={(e) => { e.preventDefault(); setActiveTab('files'); }}>Files</a>
                        </li>
                        {/*end::Nav item*/}
                        {/*begin::Nav item*/}
                        <li className="nav-item">
                            <a className={`nav-link text-active-primary py-5 me-6 ${activeTab === 'activity' ? 'active' : ''}`} href="#" onClick={(e) => { e.preventDefault(); setActiveTab('activity'); }}>Activity</a>
                        </li>
                        {/*end::Nav item*/}
                        {/*begin::Nav item*/}
                        <li className="nav-item">
                            <a className={`nav-link text-active-primary py-5 me-6 ${activeTab === 'settings' ? 'active' : ''}`} href="#" onClick={(e) => { e.preventDefault(); setActiveTab('settings'); }}>Settings</a>
                        </li>
                        {/*end::Nav item*/}
                    </ul>
                    {/*end::Nav*/}
                </div>
            </div>
            {/*end::Navbar*/}
            {
                activeTab === 'overview' ? (
                    <>
                        <div className="row g-5 g-xl-10 mb-6 mb-xl-9">
                            {/*begin::Col*/}
                            <div className="col-lg-6">
                                {/*begin::Summary*/}
                                <div className="card card-flush h-lg-100">
                                    {/*begin::Card header*/}
                                    <div className="card-header mt-6">
                                        {/*begin::Card title*/}
                                        <div className="card-title flex-column">
                                            <h3 className="fw-bold mb-1">Tasks Summary</h3>
                                            <div className="fs-6 fw-semibold text-gray-500">24 Overdue Tasks</div>
                                        </div>
                                        {/*end::Card title*/}
                                        {/*begin::Card toolbar*/}
                                        <div className="card-toolbar">
                                            <a href="#" className="btn btn-light btn-sm">View Tasks</a>
                                        </div>
                                        {/*end::Card toolbar*/}
                                    </div>
                                    {/*end::Card header*/}
                                    {/*begin::Card body*/}
                                    <div className="card-body p-9 pt-5">
                                        {/*begin::Wrapper*/}
                                        <div className="d-flex flex-wrap">
                                            {/*begin::Chart*/}
                                            <div className="position-relative d-flex flex-center h-175px w-175px me-15 mb-7">
                                                <div className="position-absolute translate-middle start-50 top-50 d-flex flex-column flex-center">
                                                    <span className="fs-2qx fw-bold">237</span>
                                                    <span className="fs-6 fw-semibold text-gray-500">Total Tasks</span>
                                                </div>
                                                <ReactApexChart options={summaryChartOptions} series={summaryChartSeries} type="donut" width={250} />
                                            </div>
                                            {/*end::Chart*/}
                                            {/*begin::Labels*/}
                                            <div className="d-flex flex-column justify-content-center flex-row-fluid pe-11 mb-5">
                                                {/*begin::Label*/}
                                                <div className="d-flex fs-6 fw-semibold align-items-center mb-3">
                                                    <div className="bullet bg-primary me-3"></div>
                                                    <div className="text-gray-500">Active</div>
                                                    <div className="ms-auto fw-bold text-gray-700">30</div>
                                                </div>
                                                {/*end::Label*/}
                                                {/*begin::Label*/}
                                                <div className="d-flex fs-6 fw-semibold align-items-center mb-3">
                                                    <div className="bullet bg-success me-3"></div>
                                                    <div className="text-gray-500">Completed</div>
                                                    <div className="ms-auto fw-bold text-gray-700">45</div>
                                                </div>
                                                {/*end::Label*/}
                                                {/*begin::Label*/}
                                                <div className="d-flex fs-6 fw-semibold align-items-center mb-3">
                                                    <div className="bullet bg-danger me-3"></div>
                                                    <div className="text-gray-500">Overdue</div>
                                                    <div className="ms-auto fw-bold text-gray-700">0</div>
                                                </div>
                                                {/*end::Label*/}
                                                {/*begin::Label*/}
                                                <div className="d-flex fs-6 fw-semibold align-items-center">
                                                    <div className="bullet bg-gray-300 me-3"></div>
                                                    <div className="text-gray-500">Yet to start</div>
                                                    <div className="ms-auto fw-bold text-gray-700">25</div>
                                                </div>
                                                {/*end::Label*/}
                                            </div>
                                            {/*end::Labels*/}
                                        </div>
                                        {/*end::Wrapper*/}
                                        {/*begin::Notice*/}
                                        <div className="notice d-flex bg-light-primary rounded border-primary border border-dashed p-6">
                                            {/*begin::Wrapper*/}
                                            <div className="d-flex flex-stack flex-grow-1">
                                                {/*begin::Content*/}
                                                <div className="fw-semibold">
                                                    <div className="fs-6 text-gray-700">
                                                        <a href="#" className="fw-bold me-1">Invite New .NET Collaborators</a>to create great outstanding business to business .jsp modutr class scripts</div>
                                                </div>
                                                {/*end::Content*/}
                                            </div>
                                            {/*end::Wrapper*/}
                                        </div>
                                        {/*end::Notice*/}
                                    </div>
                                    {/*end::Card body*/}
                                </div>
                                {/*end::Summary*/}
                            </div>
                            {/*end::Col*/}
                            {/*begin::Col*/}
                            <div className="col-lg-6">
                                {/*begin::Graph*/}
                                <div className="card card-flush h-lg-100">
                                    {/*begin::Card header*/}
                                    <div className="card-header mt-6">
                                        {/*begin::Card title*/}
                                        <div className="card-title flex-column">
                                            <h3 className="fw-bold mb-1">Tasks Over Time</h3>
                                            {/*begin::Labels*/}
                                            <div className="fs-6 d-flex text-gray-500 fs-6 fw-semibold">
                                                {/*begin::Label*/}
                                                <div className="d-flex align-items-center me-6">
                                                    <span className="menu-bullet d-flex align-items-center me-2">
                                                        <span className="bullet bg-success"></span>
                                                    </span>Complete</div>
                                                {/*end::Label*/}
                                                {/*begin::Label*/}
                                                <div className="d-flex align-items-center">
                                                    <span className="menu-bullet d-flex align-items-center me-2">
                                                        <span className="bullet bg-primary"></span>
                                                    </span>Incomplete</div>
                                                {/*end::Label*/}
                                            </div>
                                            {/*end::Labels*/}
                                        </div>
                                        {/*end::Card title*/}
                                        {/*begin::Card toolbar*/}
                                        <div className="card-toolbar">
                                            {/*begin::Select*/}
                                            <select name="status" data-control="select2" data-hide-search="true" className="form-select form-select-solid form-select-sm fw-bold w-100px">
                                                <option value="1">2020 Q1</option>
                                                <option value="2">2020 Q2</option>
                                                <option value="3" defaultValue="3">2020 Q3</option>
                                                <option value="4">2020 Q4</option>
                                            </select>
                                            {/*end::Select*/}
                                        </div>
                                        {/*end::Card toolbar*/}
                                    </div>
                                    {/*end::Card header*/}
                                    {/*begin::Card body*/}
                                    <div className="card-body pt-10 pb-0 px-5">
                                        {/*begin::Chart*/}
                                        <ReactApexChart options={tasksChartOptions} series={tasksChartSeries} type="area" height={300} />
                                        {/*end::Chart*/}
                                    </div>
                                    {/*end::Card body*/}
                                </div>
                                {/*end::Graph*/}
                            </div>
                            {/*end::Col*/}
                        </div>
                        <div className="row g-5 g-xl-10 mb-6 mb-xl-9">
                            {/*begin::Col*/}
                            <div className="col-lg-6">
                                {/*begin::Card*/}
                                <div className="card card-flush h-lg-100">
                                    {/*begin::Card header*/}
                                    <div className="card-header mt-6">
                                        {/*begin::Card title*/}
                                        <div className="card-title flex-column">
                                            <h3 className="fw-bold mb-1">Plán článků</h3>
                                            <div className="fs-6 text-gray-500">
                                                {loadingPlans ? 'Načítání...' : `Celkem ${articlePlans.length} naplánovaných článků`}
                                            </div>
                                        </div>
                                        {/*end::Card title*/}
                                    </div>
                                    {/*end::Card header*/}
                                    {/*begin::Card body*/}
                                    <div className="card-body p-9 pt-4">
                                        {loadingPlans ? (
                                            <div className="text-center py-10">
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Načítám plány článků...
                                            </div>
                                        ) : articlePlans.length === 0 ? (
                                            <div className="text-center py-10 text-muted">
                                                <i className="ki-outline ki-calendar fs-3x mb-4"></i>
                                                <div>Zatím nemáte žádné naplánované články</div>
                                            </div>
                                        ) : (() => {
                                            // Group plans by date
                                            const plansByDate = articlePlans.reduce((acc, plan) => {
                                                const date = new Date(plan.plannedPublishAt).toDateString();
                                                if (!acc[date]) acc[date] = [];
                                                acc[date].push(plan);
                                                return acc;
                                            }, {} as Record<string, ArticlePlan[]>);

                                            const uniqueDates = Object.keys(plansByDate).sort((a, b) =>
                                                new Date(a).getTime() - new Date(b).getTime()
                                            ).slice(0, 10); // Show max 10 dates

                                            return (
                                                <>
                                                    {/*begin::Dates*/}
                                                    <ul className="nav nav-pills d-flex flex-nowrap hover-scroll-x py-2">
                                                        {uniqueDates.map((dateStr, i) => {
                                                            const date = new Date(dateStr);
                                                            const dayNames = ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'];
                                                            return (
                                                                <li className="nav-item me-1" key={i}>
                                                                    <a
                                                                        className={`nav-link btn d-flex flex-column flex-center rounded-pill min-w-45px me-2 py-4 px-3 btn-active-primary ${activeScheduleDay === i ? 'active' : ''}`}
                                                                        data-bs-toggle="tab"
                                                                        href={`#kt_schedule_day_${i}`}
                                                                        onClick={(e) => { e.preventDefault(); setActiveScheduleDay(i); }}
                                                                    >
                                                                        <span className="opacity-50 fs-7 fw-semibold">{dayNames[date.getDay()]}</span>
                                                                        <span className="fs-6 fw-bold">{date.getDate()}</span>
                                                                    </a>
                                                                </li>
                                                            );
                                                        })}
                                                    </ul>
                                                    {/*end::Dates*/}
                                                    {/*begin::Tab Content*/}
                                                    <div className="tab-content">
                                                        {uniqueDates.map((dateStr, dayIndex) => {
                                                            const plans = plansByDate[dateStr];
                                                            return (
                                                                <div
                                                                    key={dayIndex}
                                                                    id={`kt_schedule_day_${dayIndex}`}
                                                                    className={`tab-pane fade ${activeScheduleDay === dayIndex ? 'show active' : ''}`}
                                                                >
                                                                    {plans.map((plan, planIndex) => {
                                                                        const publishDate = new Date(plan.plannedPublishAt);
                                                                        const timeStr = publishDate.toLocaleTimeString('cs-CZ', {
                                                                            hour: '2-digit',
                                                                            minute: '2-digit'
                                                                        });

                                                                        return (
                                                                            <div key={plan.id} className={`d-flex flex-stack position-relative ${planIndex > 0 ? 'mt-6' : 'mt-6'}`}>
                                                                                {/*begin::Bar*/}
                                                                                <div className="position-absolute h-100 w-4px bg-primary rounded top-0 start-0"></div>
                                                                                {/*end::Bar*/}
                                                                                {/*begin::Info*/}
                                                                                <div className="fw-semibold ms-5 w-100">
                                                                                    {/*begin::Time*/}
                                                                                    <div className="fs-7 mb-1 text-muted">{timeStr}</div>
                                                                                    {/*end::Time*/}
                                                                                    {/*begin::Title*/}
                                                                                    <div className="fs-5 fw-bold text-gray-900 mb-2">{plan.articleTitle}</div>
                                                                                    {/*end::Title*/}
                                                                                    {/*begin::Cluster*/}
                                                                                    <div className="fs-7 text-muted">
                                                                                        Topic cluster: <span className="text-gray-800">{plan.clusterName}</span>
                                                                                    </div>
                                                                                    {/*end::Cluster*/}
                                                                                </div>
                                                                                {/*end::Info*/}
                                                                                {/*begin::Badge*/}
                                                                                <div className="ms-2">
                                                                                    <span className={`badge badge-light-${plan.status === 'PLANNED' ? 'primary' :
                                                                                        plan.status === 'QUEUED' ? 'warning' :
                                                                                            plan.status === 'GENERATED' ? 'success' : 'info'
                                                                                        }`}>
                                                                                        {plan.status === 'PLANNED' ? 'Naplánováno' :
                                                                                            plan.status === 'QUEUED' ? 'Ve frontě' :
                                                                                                plan.status === 'GENERATED' ? 'Vytvořeno' : plan.status}
                                                                                    </span>
                                                                                </div>
                                                                                {/*end::Badge*/}
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                    {/*end::Tab Content*/}
                                                </>
                                            );
                                        })()}
                                    </div>
                                    {/*end::Card body*/}
                                </div>
                                {/*end::Card*/}
                            </div>
                            {/*end::Col*/}
                            {/*begin::Col*/}
                            <div className="col-lg-6">
                                {/*begin::Card*/}
                                <div className="card card-flush h-lg-100">
                                    {/*begin::Card header*/}
                                    <div className="card-header mt-6">
                                        {/*begin::Card title*/}
                                        <div className="card-title flex-column">
                                            <h3 className="fw-bold mb-1">Latest Files</h3>
                                            <div className="fs-6 text-gray-500">Total 382 fiels, 2,6GB space usage</div>
                                        </div>
                                        {/*end::Card title*/}
                                        {/*begin::Card toolbar*/}
                                        <div className="card-toolbar">
                                            <a href="#" className="btn btn-bg-light btn-active-color-primary btn-sm">View All</a>
                                        </div>
                                        {/*end::Card toolbar*/}
                                    </div>
                                    {/*end::Card header*/}
                                    {/*begin::Card body*/}
                                    <div className="card-body p-9 pt-3">
                                        {/*begin::Files*/}
                                        <div className="d-flex flex-column mb-9">
                                            {/*begin::File*/}
                                            <div className="d-flex align-items-center mb-5">
                                                {/*begin::Icon*/}
                                                <div className="symbol symbol-30px me-5">
                                                    <img alt="Icon" src="/assets/media/svg/files/pdf.svg" />
                                                </div>
                                                {/*end::Icon*/}
                                                {/*begin::Details*/}
                                                <div className="fw-semibold">
                                                    <a className="fs-6 fw-bold text-gray-900 text-hover-primary" href="#">Project tech requirements</a>
                                                    <div className="text-gray-500">2 days ago
                                                        <a href="#">Karina Clark</a></div>
                                                </div>
                                                {/*end::Details*/}
                                            </div>
                                            {/*end::File*/}
                                            {/*begin::File*/}
                                            <div className="d-flex align-items-center mb-5">
                                                {/*begin::Icon*/}
                                                <div className="symbol symbol-30px me-5">
                                                    <img alt="Icon" src="/assets/media/svg/files/doc.svg" />
                                                </div>
                                                {/*end::Icon*/}
                                                {/*begin::Details*/}
                                                <div className="fw-semibold">
                                                    <a className="fs-6 fw-bold text-gray-900 text-hover-primary" href="#">Create FureStibe branding proposal</a>
                                                    <div className="text-gray-500">Due in 1 day
                                                        <a href="#">Marcus Blake</a></div>
                                                </div>
                                                {/*end::Details*/}
                                            </div>
                                            {/*end::File*/}
                                            {/*begin::File*/}
                                            <div className="d-flex align-items-center mb-5">
                                                {/*begin::Icon*/}
                                                <div className="symbol symbol-30px me-5">
                                                    <img alt="Icon" src="/assets/media/svg/files/css.svg" />
                                                </div>
                                                {/*end::Icon*/}
                                                {/*begin::Details*/}
                                                <div className="fw-semibold">
                                                    <a className="fs-6 fw-bold text-gray-900 text-hover-primary" href="#">Completed Project Stylings</a>
                                                    <div className="text-gray-500">Due in 1 day
                                                        <a href="#">Terry Barry</a></div>
                                                </div>
                                                {/*end::Details*/}
                                            </div>
                                            {/*end::File*/}
                                            {/*begin::File*/}
                                            <div className="d-flex align-items-center">
                                                {/*begin::Icon*/}
                                                <div className="symbol symbol-30px me-5">
                                                    <img alt="Icon" src="/assets/media/svg/files/ai.svg" />
                                                </div>
                                                {/*end::Icon*/}
                                                {/*begin::Details*/}
                                                <div className="fw-semibold">
                                                    <a className="fs-6 fw-bold text-gray-900 text-hover-primary" href="#">Create Project Wireframes</a>
                                                    <div className="text-gray-500">Due in 3 days
                                                        <a href="#">Roth Bloom</a></div>
                                                </div>
                                                {/*end::Details*/}
                                            </div>
                                            {/*end::File*/}
                                        </div>
                                        {/*end::Files*/}
                                        {/*begin::Notice*/}
                                        <div className="notice d-flex bg-light-primary rounded border-primary border border-dashed p-6">
                                            {/*begin::Icon*/}
                                            <i className="ki-outline ki-file-up fs-2tx text-primary me-4"></i>
                                            {/*end::Icon*/}
                                            {/*begin::Wrapper*/}
                                            <div className="d-flex flex-stack flex-grow-1">
                                                {/*begin::Content*/}
                                                <div className="fw-semibold">
                                                    <h4 className="text-gray-900 fw-bold">Quick file uploader</h4>
                                                    <div className="fs-6 text-gray-700">Drag & Drop or choose files from computer</div>
                                                </div>
                                                {/*end::Content*/}
                                            </div>
                                            {/*end::Wrapper*/}
                                        </div>
                                        {/*end::Notice*/}
                                    </div>
                                    {/*end::Card body */}
                                </div>
                                {/*end::Card*/}
                            </div>
                            {/*end::Col*/}
                        </div>
                        <div className="row g-5 g-xl-10 mb-6 mb-xl-9">
                            {/*begin::Col*/}
                            <div className="col-lg-6">
                                {/*begin::Card*/}
                                <div className="card card-flush h-lg-100">
                                    {/*begin::Card header*/}
                                    <div className="card-header mt-6">
                                        {/*begin::Card title*/}
                                        <div className="card-title flex-column">
                                            <h3 className="fw-bold mb-1">New Contibutors</h3>
                                            <div className="fs-6 text-gray-500">From total 482 Participants</div>
                                        </div>
                                        {/*end::Card title*/}
                                        {/*begin::Card toolbar*/}
                                        <div className="card-toolbar">
                                            <a href="#" className="btn btn-bg-light btn-active-color-primary btn-sm">View All</a>
                                        </div>
                                        {/*end::Card toolbar*/}
                                    </div>
                                    {/*end::Card toolbar*/}
                                    {/*begin::Card body*/}
                                    <div className="card-body d-flex flex-column p-9 pt-3 mb-9">
                                        {/*begin::Item*/}
                                        <div className="d-flex align-items-center mb-5">
                                            {/*begin::Avatar*/}
                                            <div className="me-5 position-relative">
                                                {/*begin::Image*/}
                                                <div className="symbol symbol-35px symbol-circle">
                                                    <img alt="Pic" src="/assets/media/avatars/300-6.jpg" />
                                                </div>
                                                {/*end::Image*/}
                                            </div>
                                            {/*end::Avatar*/}
                                            {/*begin::Details*/}
                                            <div className="fw-semibold">
                                                <a href="#" className="fs-5 fw-bold text-gray-900 text-hover-primary">Emma Smith</a>
                                                <div className="text-gray-500">8 Pending & 97 Completed Tasks</div>
                                            </div>
                                            {/*end::Details*/}
                                            {/*begin::Badge*/}
                                            <div className="badge badge-light ms-auto">5</div>
                                            {/*end::Badge*/}
                                        </div>
                                        {/*end::Item*/}
                                        {/*begin::Item*/}
                                        <div className="d-flex align-items-center mb-5">
                                            {/*begin::Avatar*/}
                                            <div className="me-5 position-relative">
                                                {/*begin::Image*/}
                                                <div className="symbol symbol-35px symbol-circle">
                                                    <span className="symbol-label bg-light-danger text-danger fw-semibold">M</span>
                                                </div>
                                                {/*end::Image*/}
                                                {/*begin::Online*/}
                                                <div className="bg-success position-absolute h-8px w-8px rounded-circle translate-middle start-100 top-100 ms-n1 mt-n1"></div>
                                                {/*end::Online*/}
                                            </div>
                                            {/*end::Avatar*/}
                                            {/*begin::Details*/}
                                            <div className="fw-semibold">
                                                <a href="#" className="fs-5 fw-bold text-gray-900 text-hover-primary">Melody Macy</a>
                                                <div className="text-gray-500">5 Pending & 84 Completed</div>
                                            </div>
                                            {/*end::Details*/}
                                            {/*begin::Badge*/}
                                            <div className="badge badge-light ms-auto">8</div>
                                            {/*end::Badge*/}
                                        </div>
                                        {/*end::Item*/}
                                        {/*begin::Item*/}
                                        <div className="d-flex align-items-center mb-5">
                                            {/*begin::Avatar*/}
                                            <div className="me-5 position-relative">
                                                {/*begin::Image*/}
                                                <div className="symbol symbol-35px symbol-circle">
                                                    <img alt="Pic" src="/assets/media/avatars/300-1.jpg" />
                                                </div>
                                                {/*end::Image*/}
                                            </div>
                                            {/*end::Avatar*/}
                                            {/*begin::Details*/}
                                            <div className="fw-semibold">
                                                <a href="#" className="fs-5 fw-bold text-gray-900 text-hover-primary">Max Smith</a>
                                                <div className="text-gray-500">9 Pending & 103 Completed</div>
                                            </div>
                                            {/*end::Details*/}
                                            {/*begin::Badge*/}
                                            <div className="badge badge-light ms-auto">9</div>
                                            {/*end::Badge*/}
                                        </div>
                                        {/*end::Item*/}
                                        {/*begin::Item*/}
                                        <div className="d-flex align-items-center mb-5">
                                            {/*begin::Avatar*/}
                                            <div className="me-5 position-relative">
                                                {/*begin::Image*/}
                                                <div className="symbol symbol-35px symbol-circle">
                                                    <img alt="Pic" src="/assets/media/avatars/300-5.jpg" />
                                                </div>
                                                {/*end::Image*/}
                                            </div>
                                            {/*end::Avatar*/}
                                            {/*begin::Details*/}
                                            <div className="fw-semibold">
                                                <a href="#" className="fs-5 fw-bold text-gray-900 text-hover-primary">Sean Bean</a>
                                                <div className="text-gray-500">3 Pending & 55 Completed</div>
                                            </div>
                                            {/*end::Details*/}
                                            {/*begin::Badge*/}
                                            <div className="badge badge-light ms-auto">3</div>
                                            {/*end::Badge*/}
                                        </div>
                                        {/*end::Item*/}
                                        {/*begin::Item*/}
                                        <div className="d-flex align-items-center">
                                            {/*begin::Avatar*/}
                                            <div className="me-5 position-relative">
                                                {/*begin::Image*/}
                                                <div className="symbol symbol-35px symbol-circle">
                                                    <img alt="Pic" src="/assets/media/avatars/300-25.jpg" />
                                                </div>
                                                {/*end::Image*/}
                                            </div>
                                            {/*end::Avatar*/}
                                            {/*begin::Details*/}
                                            <div className="fw-semibold">
                                                <a href="#" className="fs-5 fw-bold text-gray-900 text-hover-primary">Brian Cox</a>
                                                <div className="text-gray-500">4 Pending & 115 Completed</div>
                                            </div>
                                            {/*end::Details*/}
                                            {/*begin::Badge*/}
                                            <div className="badge badge-light ms-auto">4</div>
                                            {/*end::Badge*/}
                                        </div>
                                        {/*end::Item*/}
                                    </div>
                                    {/*end::Card body*/}
                                </div>
                                {/*end::Card*/}
                            </div>
                            {/*end::Col*/}
                            {/*begin::Col*/}
                            <div className="col-lg-6">
                                {/*begin::Tasks*/}
                                <div className="card card-flush h-lg-100">
                                    {/*begin::Card header*/}
                                    <div className="card-header mt-6">
                                        {/*begin::Card title*/}
                                        <div className="card-title flex-column">
                                            <h3 className="fw-bold mb-1">My Tasks</h3>
                                            <div className="fs-6 text-gray-500">Total 25 tasks in backlog</div>
                                        </div>
                                        {/*end::Card title*/}
                                        {/*begin::Card toolbar*/}
                                        <div className="card-toolbar">
                                            <a href="#" className="btn btn-bg-light btn-active-color-primary btn-sm">View All</a>
                                        </div>
                                        {/*end::Card toolbar*/}
                                    </div>
                                    {/*end::Card header*/}
                                    {/*begin::Card body*/}
                                    <div className="card-body d-flex flex-column mb-9 p-9 pt-3">
                                        {/*begin::Item*/}
                                        <div className="d-flex align-items-center position-relative mb-7">
                                            {/*begin::Label*/}
                                            <div className="position-absolute top-0 start-0 rounded h-100 bg-secondary w-4px"></div>
                                            {/*end::Label*/}
                                            {/*begin::Checkbox*/}
                                            <div className="form-check form-check-custom form-check-solid ms-6 me-4">
                                                <input className="form-check-input" type="checkbox" value="" />
                                            </div>
                                            {/*end::Checkbox*/}
                                            {/*begin::Details*/}
                                            <div className="fw-semibold">
                                                <a href="#" className="fs-6 fw-bold text-gray-900 text-hover-primary">Create FureStibe branding logo</a>
                                                {/*begin::Info*/}
                                                <div className="text-gray-500">Due in 1 day
                                                    <a href="#">Karina Clark</a></div>
                                                {/*end::Info*/}
                                            </div>
                                            {/*end::Details*/}
                                        </div>
                                        {/*end::Item*/}
                                        {/*begin::Item*/}
                                        <div className="d-flex align-items-center position-relative mb-7">
                                            {/*begin::Label*/}
                                            <div className="position-absolute top-0 start-0 rounded h-100 bg-secondary w-4px"></div>
                                            {/*end::Label*/}
                                            {/*begin::Checkbox*/}
                                            <div className="form-check form-check-custom form-check-solid ms-6 me-4">
                                                <input className="form-check-input" type="checkbox" value="" />
                                            </div>
                                            {/*end::Checkbox*/}
                                            {/*begin::Details*/}
                                            <div className="fw-semibold">
                                                <a href="#" className="fs-6 fw-bold text-gray-900 text-hover-primary">Schedule a meeting with FireBear CTO John</a>
                                                {/*begin::Info*/}
                                                <div className="text-gray-500">Due in 3 days
                                                    <a href="#">Rober Doe</a></div>
                                                {/*end::Info*/}
                                            </div>
                                            {/*end::Details*/}
                                        </div>
                                        {/*end::Item*/}
                                        {/*begin::Item*/}
                                        <div className="d-flex align-items-center position-relative mb-7">
                                            {/*begin::Label*/}
                                            <div className="position-absolute top-0 start-0 rounded h-100 bg-secondary w-4px"></div>
                                            {/*end::Label*/}
                                            {/*begin::Checkbox*/}
                                            <div className="form-check form-check-custom form-check-solid ms-6 me-4">
                                                <input className="form-check-input" type="checkbox" value="" />
                                            </div>
                                            {/*end::Checkbox*/}
                                            {/*begin::Details*/}
                                            <div className="fw-semibold">
                                                <a href="#" className="fs-6 fw-bold text-gray-900 text-hover-primary">9 Degree Porject Estimation</a>
                                                {/*begin::Info*/}
                                                <div className="text-gray-500">Due in 1 week
                                                    <a href="#">Neil Owen</a></div>
                                                {/*end::Info*/}
                                            </div>
                                            {/*end::Details*/}
                                        </div>
                                        {/*end::Item*/}
                                        {/*begin::Item*/}
                                        <div className="d-flex align-items-center position-relative mb-7">
                                            {/*begin::Label*/}
                                            <div className="position-absolute top-0 start-0 rounded h-100 bg-secondary w-4px"></div>
                                            {/*end::Label*/}
                                            {/*begin::Checkbox*/}
                                            <div className="form-check form-check-custom form-check-solid ms-6 me-4">
                                                <input className="form-check-input" type="checkbox" value="" />
                                            </div>
                                            {/*end::Checkbox*/}
                                            {/*begin::Details*/}
                                            <div className="fw-semibold">
                                                <a href="#" className="fs-6 fw-bold text-gray-900 text-hover-primary">Dashgboard UI & UX for Leafr CRM</a>
                                                {/*begin::Info*/}
                                                <div className="text-gray-500">Due in 1 week
                                                    <a href="#">Olivia Wild</a></div>
                                                {/*end::Info*/}
                                            </div>
                                            {/*end::Details*/}
                                        </div>
                                        {/*end::Item*/}
                                        {/*begin::Item*/}
                                        <div className="d-flex align-items-center position-relative">
                                            {/*begin::Label*/}
                                            <div className="position-absolute top-0 start-0 rounded h-100 bg-secondary w-4px"></div>
                                            {/*end::Label*/}
                                            {/*begin::Checkbox*/}
                                            <div className="form-check form-check-custom form-check-solid ms-6 me-4">
                                                <input className="form-check-input" type="checkbox" value="" />
                                            </div>
                                            {/*end::Checkbox*/}
                                            {/*begin::Details*/}
                                            <div className="fw-semibold">
                                                <a href="#" className="fs-6 fw-bold text-gray-900 text-hover-primary">Mivy App R&D, Meeting with clients</a>
                                                {/*begin::Info*/}
                                                <div className="text-gray-500">Due in 2 weeks
                                                    <a href="#">Sean Bean</a></div>
                                                {/*end::Info*/}
                                            </div>
                                            {/*end::Details*/}
                                        </div>
                                        {/*end::Item*/}
                                    </div>
                                    {/*end::Card body*/}
                                </div>
                                {/*end::Tasks*/}
                            </div>
                            {/*end::Col*/}
                        </div>
                    </>
                ) : activeTab === 'inbox' ? (
                    <InboxTab />
                ) : activeTab === 'activity' ? (
                    <ActivityTab />
                ) : activeTab === 'settings' ? (
                    <SettingsTab />
                ) : (
                    <div className="card card-flush h-lg-100">
                        <div className="card-body p-9">
                            <div className="fs-2 fw-bold text-gray-800">Content for {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} tab is coming soon...</div>
                        </div>
                    </div>
                )
            }
        </>
    );
};

export default ProjectDetailContent;

