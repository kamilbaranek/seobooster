import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../../lib/api-client';
import Swal from 'sweetalert2';

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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [summaryRes, articlesRes] = await Promise.all([
                apiFetch<CostSummary>('/admin/stats/costs'),
                apiFetch<ArticleCostsResponse>('/admin/stats/articles')
            ]);
            setSummary(summaryRes);
            setArticles(articlesRes);
        } catch (error) {
            console.error('Failed to fetch admin stats:', error);
            Swal.fire('Error', 'Failed to load admin statistics', 'error');
        } finally {
            setLoading(false);
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
                            </div>
                            {/*end::Col*/}
                        </div>
                        {/*end::Row*/}
                    </div>
                    {/*end::Col*/}

                    {/*begin::Col*/}
                    <div className="col-xl-6 mb-xl-10">
                        {/*begin::List widget 8*/}
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
                        {/*end::List widget 8*/}
                    </div>
                    {/*end::Col*/}
                </div>
                {/*end::Row*/}

                {/*begin::Row*/}
                <div className="row g-5 g-xl-10">
                    {/*begin::Col*/}
                    <div className="col-xl-12 mb-5 mb-xl-10">
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
                                    {/*begin::Table*/}
                                    <table className="table table-row-dashed align-middle gs-0 gy-4 my-0">
                                        {/*begin::Table head*/}
                                        <thead>
                                            <tr className="fs-7 fw-bold text-gray-500 border-bottom-0">
                                                <th className="p-0 w-50px pb-1">ARTICLE</th>
                                                <th className="ps-0 min-w-140px"></th>
                                                <th className="text-end min-w-140px p-0 pb-1">TOTAL PRICE</th>
                                            </tr>
                                        </thead>
                                        {/*end::Table head*/}
                                        {/*begin::Table body*/}
                                        <tbody>
                                            {articles?.data.map((article) => (
                                                <tr key={article.articleId}>
                                                    <td>
                                                        <div className="symbol symbol-50px me-2">
                                                            <span className="symbol-label bg-light-primary">
                                                                <i className="ki-outline ki-document fs-2 text-primary"></i>
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
