import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { apiFetch } from '../../../lib/api-client';
import Swal from 'sweetalert2';
import { ApexOptions } from 'apexcharts';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface CostSummary {
    totalCost: number;
    costsByWeb: Array<{
        webId: string;
        webUrl: string;
        webNickname: string;
        totalCost: number;
        currency: string;
        inputTokens: number;
        outputTokens: number;
    }>;
}

interface ArticleCost {
    articleId: string;
    title: string;
    webUrl: string;
    webNickname: string;
    totalCost: number;
    currency: string;
    textVersions: number;
    imageVersions: number;
}

interface ArticleCostsResponse {
    data: ArticleCost[];
    total: number;
    page: number;
    limit: number;
}

const AdminDashboard = () => {
    const [summary, setSummary] = useState<CostSummary | null>(null);
    const [articles, setArticles] = useState<ArticleCostsResponse | null>(null);
    const [chartData, setChartData] = useState<{
        dailyCosts: { date: string; cost: number }[];
        modelCosts: { model: string; cost: number }[];
    } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [summaryRes, articlesRes, chartRes] = await Promise.all([
                apiFetch<CostSummary>('/admin/stats/costs'),
                apiFetch<ArticleCostsResponse>('/admin/stats/articles'),
                apiFetch<any>('/admin/stats/charts')
            ]);
            setSummary(summaryRes);
            setArticles(articlesRes);
            if (chartRes) {
                setChartData(chartRes);
            }
        } catch (error) {
            console.error('Failed to fetch admin stats:', error);
            Swal.fire('Error', 'Failed to load admin statistics', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Chart Options
    const dailyCostsOptions: ApexOptions = {
        chart: {
            type: 'bar',
            height: 350,
            toolbar: { show: false }
        },
        plotOptions: {
            bar: {
                borderRadius: 6,
                columnWidth: '40%',
                horizontal: false,
            }
        },
        dataLabels: { enabled: false },
        xaxis: {
            categories: chartData?.dailyCosts.map(d => d.date) || [],
            axisBorder: { show: false },
            axisTicks: { show: false },
            labels: {
                style: {
                    colors: '#A1A5B7',
                    fontSize: '10px'
                },
                formatter: (val) => {
                    const date = new Date(val);
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                }
            }
        },
        yaxis: {
            labels: {
                style: {
                    colors: '#A1A5B7',
                    fontSize: '10px'
                },
                formatter: (val) => `$${val.toFixed(2)}`
            }
        },
        grid: {
            borderColor: '#E4E6EF',
            strokeDashArray: 3,
            yaxis: {
                lines: {
                    show: true
                }
            },
            xaxis: {
                lines: {
                    show: false
                }
            }
        },
        tooltip: {
            y: {
                formatter: (val) => `$${val.toFixed(4)}`
            }
        },
        colors: ['#009ef7']
    };

    const modelCostsOptions: ApexOptions = {
        chart: {
            type: 'donut',
        },
        labels: chartData?.modelCosts.map(m => m.model) || [],
        responsive: [{
            breakpoint: 480,
            options: {
                chart: {
                    width: 200
                },
                legend: {
                    position: 'bottom'
                }
            }
        }],
        tooltip: {
            y: {
                formatter: (val) => `$${val.toFixed(4)}`
            }
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center min-h-300px">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div id="kt_app_content" className="app-content flex-column-fluid">
            {/*begin::Content container*/}
            <div id="kt_app_content_container" className="app-container container-fluid">
                {/*begin::Row*/}
                <div className="row g-5 gx-xl-10">
                    {/*begin::Col*/}
                    <div className="col-xxl-6 mb-md-5 mb-xl-10">
                        {/*begin::Row*/}
                        <div className="row g-5 g-xl-10">
                            {/*begin::Col*/}
                            <div className="col-md-6 col-xl-6 mb-xxl-10">
                                {/*begin::Card widget 8*/}
                                <div className="card overflow-hidden h-md-50 mb-5 mb-xl-10">
                                    {/*begin::Card body*/}
                                    <div className="card-body d-flex justify-content-between flex-column px-0 pb-0">
                                        {/*begin::Statistics*/}
                                        <div className="mb-4 px-9">
                                            {/*begin::Info*/}
                                            <div className="d-flex align-items-center mb-2">
                                                {/*begin::Currency*/}
                                                <span className="fs-4 fw-semibold text-gray-500 align-self-start me-1">$</span>
                                                {/*end::Currency*/}
                                                {/*begin::Value*/}
                                                <span className="fs-2hx fw-bold text-gray-800 me-2 lh-1">
                                                    {summary?.totalCost.toFixed(4)}
                                                </span>
                                                {/*end::Value*/}
                                                {/*begin::Label*/}
                                                <span className="badge badge-light-success fs-base">
                                                    <i className="ki-outline ki-arrow-up fs-5 text-success ms-n1"></i>2.2%
                                                </span>
                                                {/*end::Label*/}
                                            </div>
                                            {/*end::Info*/}
                                            {/*begin::Description*/}
                                            <span className="fs-6 fw-semibold text-gray-500">Total AI Cost</span>
                                            {/*end::Description*/}
                                        </div>
                                        {/*end::Statistics*/}
                                        {/*begin::Chart*/}
                                        <div id="kt_card_widget_8_chart" className="min-h-auto" style={{ height: '125px' }}></div>
                                        {/*end::Chart*/}
                                    </div>
                                    {/*end::Card body*/}
                                </div>
                                {/*end::Card widget 8*/}
                                {/*begin::Card widget 5*/}
                                <div className="card card-flush h-md-50 mb-xl-10">
                                    {/*begin::Header*/}
                                    <div className="card-header pt-5">
                                        {/*begin::Title*/}
                                        <div className="card-title d-flex flex-column">
                                            {/*begin::Info*/}
                                            <div className="d-flex align-items-center">
                                                {/*begin::Amount*/}
                                                <span className="fs-2hx fw-bold text-gray-900 me-2 lh-1 ls-n2">{summary?.costsByWeb.length}</span>
                                                {/*end::Amount*/}
                                                {/*begin::Badge*/}
                                                <span className="badge badge-light-danger fs-base">
                                                    <i className="ki-outline ki-arrow-down fs-5 text-danger ms-n1"></i>2.2%
                                                </span>
                                                {/*end::Badge*/}
                                            </div>
                                            {/*end::Info*/}
                                            {/*begin::Subtitle*/}
                                            <span className="text-gray-500 pt-1 fw-semibold fs-6">Active Websites</span>
                                            {/*end::Subtitle*/}
                                        </div>
                                        {/*end::Title*/}
                                    </div>
                                    {/*end::Header*/}
                                    {/*begin::Card body*/}
                                    <div className="card-body d-flex align-items-end pt-0">
                                        {/*begin::Progress*/}
                                        <div className="d-flex align-items-center flex-column mt-3 w-100">
                                            <div className="d-flex justify-content-between w-100 mt-auto mb-2">
                                                <span className="fw-bolder fs-6 text-gray-900">1,048 to Goal</span>
                                                <span className="fw-bold fs-6 text-gray-500">62%</span>
                                            </div>
                                            <div className="h-8px mx-3 w-100 bg-light-success rounded">
                                                <div className="bg-success rounded h-8px" role="progressbar" style={{ width: '62%' }} aria-valuenow={50} aria-valuemin={0} aria-valuemax={100}></div>
                                            </div>
                                        </div>
                                        {/*end::Progress*/}
                                    </div>
                                    {/*end::Card body*/}
                                </div>
                                {/*end::Card widget 5*/}
                            </div>
                            {/*end::Col*/}
                            {/*begin::Col*/}
                            <div className="col-md-6 col-xl-6 mb-xxl-10">
                                {/*begin::Card widget 9*/}
                                <div className="card overflow-hidden h-md-50 mb-5 mb-xl-10">
                                    {/*begin::Card body*/}
                                    <div className="card-body d-flex justify-content-between flex-column px-0 pb-0">
                                        {/*begin::Statistics*/}
                                        <div className="mb-4 px-9">
                                            {/*begin::Statistics*/}
                                            <div className="d-flex align-items-center mb-2">
                                                {/*begin::Value*/}
                                                <span className="fs-2hx fw-bold text-gray-800 me-2 lh-1">
                                                    {summary?.costsByWeb.filter(w => w.totalCost > 0).length}
                                                </span>
                                                {/*end::Value*/}
                                                {/*begin::Label*/}
                                                <span className="badge badge-light-success fs-base">
                                                    <i className="ki-outline ki-arrow-up fs-5 text-success ms-n1"></i>2.6%
                                                </span>
                                                {/*end::Label*/}
                                            </div>
                                            {/*end::Statistics*/}
                                            {/*begin::Description*/}
                                            <span className="fs-6 fw-semibold text-gray-500">Active Spenders</span>
                                            {/*end::Description*/}
                                        </div>
                                        {/*end::Statistics*/}
                                        {/*begin::Chart*/}
                                        <div id="kt_card_widget_9_chart" className="min-h-auto" style={{ height: '125px' }}></div>
                                        {/*end::Chart*/}
                                    </div>
                                    {/*end::Card body*/}
                                </div>
                                {/*end::Card widget 9*/}
                                {/*begin::Card widget 7*/}
                                <div className="card card-flush h-md-50 mb-xl-10">
                                    {/*begin::Header*/}
                                    <div className="card-header pt-5">
                                        {/*begin::Title*/}
                                        <div className="card-title d-flex flex-column">
                                            {/*begin::Amount*/}
                                            <span className="fs-2hx fw-bold text-gray-900 me-2 lh-1 ls-n2">
                                                {summary?.costsByWeb.reduce((acc, curr) => acc + (curr.totalCost > 1 ? 1 : 0), 0)}
                                            </span>
                                            {/*end::Amount*/}
                                            {/*begin::Subtitle*/}
                                            <span className="text-gray-500 pt-1 fw-semibold fs-6">Sites &gt; $1</span>
                                            {/*end::Subtitle*/}
                                        </div>
                                        {/*end::Title*/}
                                    </div>
                                    {/*end::Header*/}
                                    {/*begin::Card body*/}
                                    <div className="card-body d-flex flex-column justify-content-end pe-0">
                                        {/*begin::Title*/}
                                        <span className="fs-6 fw-bolder text-gray-800 d-block mb-2">Top Spenders</span>
                                        {/*end::Title*/}
                                        {/*begin::Users group*/}
                                        <div className="symbol-group symbol-hover flex-nowrap">
                                            {summary?.costsByWeb.slice(0, 5).map((web, idx) => (
                                                <div key={web.webId} className="symbol symbol-35px symbol-circle" data-bs-toggle="tooltip" title={web.webNickname || web.webUrl}>
                                                    <span className={`symbol-label bg-${['warning', 'primary', 'danger', 'success', 'info'][idx % 5]} text-inverse-${['warning', 'primary', 'danger', 'success', 'info'][idx % 5]} fw-bold`}>
                                                        {(web.webNickname || web.webUrl).charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                        {/*end::Users group*/}
                                    </div>
                                    {/*end::Card body*/}
                                </div>
                                {/*end::Card widget 7*/}
                            </div>
                            {/*end::Col*/}
                        </div>
                        {/*end::Row*/}
                    </div>
                    {/*end::Col*/}
                    {/*begin::Col*/}
                    <div className="col-xxl-6 mb-5 mb-xl-10">
                        {/*begin::Chart widget 15*/}
                        <div className="card card-flush h-xl-100">
                            {/*begin::Header*/}
                            <div className="card-header pt-7">
                                {/*begin::Title*/}
                                <h3 className="card-title align-items-start flex-column">
                                    <span className="card-label fw-bold text-gray-900">Daily Costs</span>
                                    <span className="text-gray-500 pt-2 fw-semibold fs-6">Last 30 Days</span>
                                </h3>
                                {/*end::Title*/}
                                {/*begin::Toolbar*/}
                                <div className="card-toolbar">
                                    {/*begin::Menu*/}
                                    <button className="btn btn-icon btn-color-gray-500 btn-active-color-primary justify-content-end" data-kt-menu-trigger="click" data-kt-menu-placement="bottom-end" data-kt-menu-overflow="true">
                                        <i className="ki-outline ki-dots-square fs-1 text-gray-500 me-n1"></i>
                                    </button>
                                    {/*begin::Menu*/}
                                    <div className="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg-light-primary fw-semibold w-100px py-4" data-kt-menu="true">
                                        {/*begin::Menu item*/}
                                        <div className="menu-item px-3">
                                            <a href="#" className="menu-link px-3">Remove</a>
                                        </div>
                                        {/*end::Menu item*/}
                                        {/*begin::Menu item*/}
                                        <div className="menu-item px-3">
                                            <a href="#" className="menu-link px-3">Mute</a>
                                        </div>
                                        {/*end::Menu item*/}
                                        {/*begin::Menu item*/}
                                        <div className="menu-item px-3">
                                            <a href="#" className="menu-link px-3">Settings</a>
                                        </div>
                                        {/*end::Menu item*/}
                                    </div>
                                    {/*end::Menu*/}
                                    {/*end::Menu*/}
                                </div>
                                {/*end::Toolbar*/}
                            </div>
                            {/*end::Header*/}
                            {/*begin::Body*/}
                            <div className="card-body pt-5">
                                {/*begin::Chart container*/}
                                {chartData && (
                                    <Chart
                                        options={dailyCostsOptions}
                                        series={[{ name: 'Cost', data: chartData.dailyCosts.map(d => d.cost) }]}
                                        type="bar"
                                        height={350}
                                        className="min-h-auto ps-4 pe-6 mb-3 h-350px"
                                    />
                                )}
                                {/*end::Chart container*/}
                            </div>
                            {/*end::Body*/}
                        </div>
                        {/*end::Chart widget 15*/}
                    </div>
                    {/*end::Col*/}
                </div>
                {/*end::Row*/}
                {/*begin::Row*/}
                <div className="row g-5 g-xl-10 g-xl-10">
                    {/*begin::Col*/}
                    <div className="col-xl-4 mb-xl-10">
                        {/*begin::List widget 7*/}
                        <div className="card card-flush h-xl-100">
                            {/*begin::Header*/}
                            <div className="card-header pt-7 mb-5">
                                {/*begin::Title*/}
                                <h3 className="card-title align-items-start flex-column">
                                    <span className="card-label fw-bold text-gray-800">Website Costs</span>
                                    <span className="text-gray-500 mt-1 fw-semibold fs-6">Aggregated costs per website</span>
                                </h3>
                                {/*end::Title*/}
                            </div>
                            {/*end::Header*/}
                            {/*begin::Body*/}
                            <div className="card-body pt-0">
                                {/*begin::Items*/}
                                <div className="m-0">
                                    {summary?.costsByWeb.map((web, index) => (
                                        <React.Fragment key={web.webId}>
                                            {/*begin::Item*/}
                                            <div className="d-flex flex-stack">
                                                {/*begin::Section*/}
                                                <div className="d-flex flex-stack flex-row-fluid d-grid gap-2">
                                                    {/*begin::Content*/}
                                                    <div className="me-5">
                                                        {/*begin::Title*/}
                                                        <a href="#" className="text-gray-800 fw-bold text-hover-primary fs-6">{web.webNickname || web.webUrl}</a>
                                                        {/*end::Title*/}
                                                        {/*begin::Desc*/}
                                                        <span className="text-gray-500 fw-semibold fs-7 d-block text-start ps-0">{web.webUrl}</span>
                                                        {/*end::Desc*/}
                                                    </div>
                                                    {/*end::Content*/}
                                                    {/*begin::Info*/}
                                                    <div className="d-flex align-items-center">
                                                        {/*begin::Number*/}
                                                        <span className="text-gray-800 fw-bold fs-6 me-3 d-block">${web.totalCost.toFixed(4)}</span>
                                                        {/*end::Number*/}
                                                        {/*begin::Label*/}
                                                        <div className="m-0">
                                                            {/*begin::Label*/}
                                                            <span className="badge badge-light-success fs-base">
                                                                {web.inputTokens + web.outputTokens} tokens
                                                            </span>
                                                            {/*end::Label*/}
                                                        </div>
                                                        {/*end::Label*/}
                                                    </div>
                                                    {/*end::Info*/}
                                                </div>
                                                {/*end::Section*/}
                                            </div>
                                            {/*end::Item*/}
                                            {index < summary.costsByWeb.length - 1 && (
                                                <div className="separator separator-dashed my-3"></div>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </div>
                                {/*end::Items*/}
                            </div>
                            {/*end::Body*/}
                        </div>
                        {/*end::List widget 7*/}
                    </div>
                    {/*end::Col*/}
                    {/*begin::Col*/}
                    <div className="col-xl-4 mb-xl-10">
                        {/*begin::Chart widget 5*/}
                        <div className="card card-flush h-md-100">
                            {/*begin::Header*/}
                            <div className="card-header flex-nowrap pt-5">
                                {/*begin::Title*/}
                                <h3 className="card-title align-items-start flex-column">
                                    <span className="card-label fw-bold text-gray-900">Model Usage</span>
                                    <span className="text-gray-500 pt-2 fw-semibold fs-6">Cost distribution by model</span>
                                </h3>
                                {/*end::Title*/}
                            </div>
                            {/*end::Header*/}
                            {/*begin::Body*/}
                            <div className="card-body pt-5 ps-6">
                                {chartData && (
                                    <Chart
                                        options={modelCostsOptions}
                                        series={chartData.modelCosts.map(m => m.cost)}
                                        type="donut"
                                        height={300}
                                    />
                                )}
                            </div>
                            {/*end::Body*/}
                        </div>
                        {/*end::Chart widget 5*/}
                    </div>
                    {/*end::Col*/}
                    {/*begin::Col*/}
                    <div className="col-xl-4 mb-5 mb-xl-10">
                        {/*begin::List widget 6*/}
                        <div className="card card-flush h-md-100">
                            {/*begin::Header*/}
                            <div className="card-header pt-7">
                                {/*begin::Title*/}
                                <h3 className="card-title align-items-start flex-column">
                                    <span className="card-label fw-bold text-gray-800">Article Costs</span>
                                    <span className="text-gray-500 mt-1 fw-semibold fs-6">Detailed cost breakdown per article</span>
                                </h3>
                                {/*end::Title*/}
                            </div>
                            {/*end::Header*/}
                            {/*begin::Body*/}
                            <div className="card-body pt-4">
                                {/*begin::Table container*/}
                                <div className="table-responsive">
                                    <table className="table table-row-dashed table-row-gray-300 align-middle gs-0 gy-4">
                                        {/*begin::Table head*/}
                                        <thead>
                                            <tr className="border-0">
                                                <th className="p-0 w-50px"></th>
                                                <th className="p-0 min-w-150px"></th>
                                                <th className="p-0 min-w-140px"></th>
                                                <th className="p-0 min-w-110px text-end"></th>
                                            </tr>
                                        </thead>
                                        {/*end::Table head*/}
                                        {/*begin::Table body*/}
                                        <tbody>
                                            {articles?.data.map((article) => (
                                                <tr key={article.articleId}>
                                                    <td>
                                                        <div className="symbol symbol-45px me-2">
                                                            <span className="symbol-label">
                                                                <img src="/assets/media/icons/duotune/text/txt009.svg" className="h-50 align-self-center" alt="" />
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="ps-0">
                                                        <a href="#" className="text-gray-800 fw-bold text-hover-primary mb-1 fs-6 text-start pe-0">{article.title}</a>
                                                        <span className="text-gray-500 fw-semibold fs-7 d-block text-start ps-0">
                                                            {article.webNickname || article.webUrl} • Text: {article.textVersions}, Images: {article.imageVersions}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className="text-gray-800 fw-bold d-block fs-6 ps-0 text-end">${article.totalCost.toFixed(4)}</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        {/*end::Table body*/}
                                    </table>
                                </div>
                                {/*end::Table*/}
                            </div>
                            {/*end::Body*/}
                        </div>
                        {/*end::List widget 6*/}
                    </div>
                    {/*end::Col*/}
                </div>
                {/*end::Row*/}
            </div>
            {/*end::Content container*/}
        </div>
    );
};

export default AdminDashboard;
