import React, { useEffect } from 'react';

const AdminDashboardContent = () => {
    useEffect(() => {
        // Initialize charts or other scripts here if needed
        // For now, we rely on global scripts or we might need to port specific chart configs
    }, []);

    return (
        <div className="row g-5 gx-xl-10">
            {/* First Row */}
            <div className="col-xxl-6 mb-md-5 mb-xl-10">
                <div className="row g-5 g-xl-10">
                    {/* Column 1 */}
                    <div className="col-md-6 col-xl-6 mb-xxl-10">
                        {/* Card widget 8 */}
                        <div className="card overflow-hidden h-md-50 mb-5 mb-xl-10">
                            <div className="card-body d-flex justify-content-between flex-column px-0 pb-0">
                                <div className="mb-4 px-9">
                                    <div className="d-flex align-items-center mb-2">
                                        <span className="fs-4 fw-semibold text-gray-500 align-self-start me-1">$</span>
                                        <span className="fs-2hx fw-bold text-gray-800 me-2 lh-1">69,700</span>
                                        <span className="badge badge-light-success fs-base">
                                            <i className="ki-outline ki-arrow-up fs-5 text-success ms-n1"></i>2.2%
                                        </span>
                                    </div>
                                    <span className="fs-6 fw-semibold text-gray-500">Total Online Sales</span>
                                </div>
                                <div id="kt_card_widget_8_chart" className="min-h-auto" style={{ height: '125px' }}></div>
                            </div>
                        </div>
                        {/* End Card widget 8 */}

                        {/* Card widget 5 */}
                        <div className="card card-flush h-md-50 mb-xl-10">
                            <div className="card-header pt-5">
                                <div className="card-title d-flex flex-column">
                                    <div className="d-flex align-items-center">
                                        <span className="fs-2hx fw-bold text-gray-900 me-2 lh-1 ls-n2">1,836</span>
                                        <span className="badge badge-light-danger fs-base">
                                            <i className="ki-outline ki-arrow-down fs-5 text-danger ms-n1"></i>2.2%
                                        </span>
                                    </div>
                                    <span className="text-gray-500 pt-1 fw-semibold fs-6">Total Sales</span>
                                </div>
                            </div>
                            <div className="card-body d-flex align-items-end pt-0">
                                <div className="d-flex align-items-center flex-column mt-3 w-100">
                                    <div className="d-flex justify-content-between w-100 mt-auto mb-2">
                                        <span className="fw-bolder fs-6 text-gray-900">1,048 to Goal</span>
                                        <span className="fw-bold fs-6 text-gray-500">62%</span>
                                    </div>
                                    <div className="h-8px mx-3 w-100 bg-light-success rounded">
                                        <div className="bg-success rounded h-8px" role="progressbar" style={{ width: '62%' }} aria-valuenow={50} aria-valuemin={0} aria-valuemax={100}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* End Card widget 5 */}
                    </div>

                    {/* Column 2 */}
                    <div className="col-md-6 col-xl-6 mb-xxl-10">
                        {/* Card widget 9 */}
                        <div className="card overflow-hidden h-md-50 mb-5 mb-xl-10">
                            <div className="card-body d-flex justify-content-between flex-column px-0 pb-0">
                                <div className="mb-4 px-9">
                                    <div className="d-flex align-items-center mb-2">
                                        <span className="fs-2hx fw-bold text-gray-800 me-2 lh-1">29,420</span>
                                        <span className="badge badge-light-success fs-base">
                                            <i className="ki-outline ki-arrow-up fs-5 text-success ms-n1"></i>2.6%
                                        </span>
                                    </div>
                                    <span className="fs-6 fw-semibold text-gray-500">Total Online Visitors</span>
                                </div>
                                <div id="kt_card_widget_9_chart" className="min-h-auto" style={{ height: '125px' }}></div>
                            </div>
                        </div>
                        {/* End Card widget 9 */}

                        {/* Card widget 7 */}
                        <div className="card card-flush h-md-50 mb-xl-10">
                            <div className="card-header pt-5">
                                <div className="card-title d-flex flex-column">
                                    <span className="fs-2hx fw-bold text-gray-900 me-2 lh-1 ls-n2">6.3k</span>
                                    <span className="text-gray-500 pt-1 fw-semibold fs-6">Total New Customers</span>
                                </div>
                            </div>
                            <div className="card-body d-flex flex-column justify-content-end pe-0">
                                <span className="fs-6 fw-bolder text-gray-800 d-block mb-2">Today’s Heroes</span>
                                <div className="symbol-group symbol-hover flex-nowrap">
                                    <div className="symbol symbol-35px symbol-circle" data-bs-toggle="tooltip" title="Alan Warden">
                                        <span className="symbol-label bg-warning text-inverse-warning fw-bold">A</span>
                                    </div>
                                    <div className="symbol symbol-35px symbol-circle" data-bs-toggle="tooltip" title="Michael Eberon">
                                        <img alt="Pic" src="/assets/media/avatars/300-11.jpg" />
                                    </div>
                                    <div className="symbol symbol-35px symbol-circle" data-bs-toggle="tooltip" title="Susan Redwood">
                                        <span className="symbol-label bg-primary text-inverse-primary fw-bold">S</span>
                                    </div>
                                    <div className="symbol symbol-35px symbol-circle" data-bs-toggle="tooltip" title="Melody Macy">
                                        <img alt="Pic" src="/assets/media/avatars/300-2.jpg" />
                                    </div>
                                    <div className="symbol symbol-35px symbol-circle" data-bs-toggle="tooltip" title="Perry Matthew">
                                        <span className="symbol-label bg-danger text-inverse-danger fw-bold">P</span>
                                    </div>
                                    <div className="symbol symbol-35px symbol-circle" data-bs-toggle="tooltip" title="Barry Walter">
                                        <img alt="Pic" src="/assets/media/avatars/300-12.jpg" />
                                    </div>
                                    <a href="#" className="symbol symbol-35px symbol-circle" data-bs-toggle="modal" data-bs-target="#kt_modal_view_users">
                                        <span className="symbol-label bg-light text-gray-400 fs-8 fw-bold">+42</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                        {/* End Card widget 7 */}
                    </div>
                </div>
            </div>

            {/* Maps Widget */}
            <div className="col-xxl-6 mb-5 mb-xl-10">
                <div className="card card-flush h-md-100">
                    <div className="card-header pt-7">
                        <h3 className="card-title align-items-start flex-column">
                            <span className="card-label fw-bold text-gray-900">World Sales</span>
                            <span className="text-gray-500 pt-2 fw-semibold fs-6">Top Selling Countries</span>
                        </h3>
                        <div className="card-toolbar">
                            <button className="btn btn-icon btn-color-gray-500 btn-active-color-primary justify-content-end" data-kt-menu-trigger="click" data-kt-menu-placement="bottom-end" data-kt-menu-overflow="true">
                                <i className="ki-outline ki-dots-square fs-1 text-gray-500 me-n1"></i>
                            </button>
                            {/* Menu content omitted for brevity, can be added if needed */}
                        </div>
                    </div>
                    <div className="card-body d-flex flex-center">
                        <div id="kt_maps_widget_1_map" className="w-100 h-350px"></div>
                    </div>
                </div>
            </div>

            {/* Row 2 */}
            <div className="row g-5 g-xl-10 g-xl-10">
                {/* Engage Widget */}
                <div className="col-xl-4 mb-xl-10">
                    <div className="card h-md-100" dir="ltr">
                        <div className="card-body d-flex flex-column flex-center">
                            <div className="mb-2">
                                <h1 className="fw-semibold text-gray-800 text-center lh-lg">
                                    Have you tried <br /> new <span className="fw-bolder">Invoice Manager ?</span>
                                </h1>
                                <div className="py-10 text-center">
                                    <img src="/assets/media/svg/illustrations/easy/2.svg" className="theme-light-show w-200px" alt="" />
                                    <img src="/assets/media/svg/illustrations/easy/2-dark.svg" className="theme-dark-show w-200px" alt="" />
                                </div>
                            </div>
                            <div className="text-center mb-1">
                                <a className="btn btn-sm btn-primary me-2" href="#">Try now</a>
                                <a className="btn btn-sm btn-light" href="#">Learn more</a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chart Widget 5 */}
                <div className="col-xl-4 mb-xl-10">
                    <div className="card card-flush h-md-100">
                        <div className="card-header flex-nowrap pt-5">
                            <h3 className="card-title align-items-start flex-column">
                                <span className="card-label fw-bold text-gray-900">Top Selling Categories</span>
                                <span className="text-gray-500 pt-2 fw-semibold fs-6">8k social visitors</span>
                            </h3>
                            <div className="card-toolbar">
                                <button className="btn btn-icon btn-color-gray-500 btn-active-color-primary justify-content-end" data-kt-menu-trigger="click" data-kt-menu-placement="bottom-end" data-kt-menu-overflow="true">
                                    <i className="ki-outline ki-dots-square fs-1 text-gray-500 me-n1"></i>
                                </button>
                            </div>
                        </div>
                        <div className="card-body pt-5 ps-6">
                            <div id="kt_charts_widget_5" className="min-h-auto"></div>
                        </div>
                    </div>
                </div>

                {/* List Widget 6 */}
                <div className="col-xl-4 mb-5 mb-xl-10">
                    <div className="card card-flush h-md-100">
                        <div className="card-header pt-7">
                            <h3 className="card-title align-items-start flex-column">
                                <span className="card-label fw-bold text-gray-800">Top Selling Products</span>
                                <span className="text-gray-500 mt-1 fw-semibold fs-6">8k social visitors</span>
                            </h3>
                            <div className="card-toolbar">
                                <a href="#" className="btn btn-sm btn-light">View All</a>
                            </div>
                        </div>
                        <div className="card-body pt-4">
                            <div className="table-responsive">
                                <table className="table table-row-dashed align-middle gs-0 gy-4 my-0">
                                    <thead>
                                        <tr className="fs-7 fw-bold text-gray-500 border-bottom-0">
                                            <th className="p-0 w-50px pb-1">ITEM</th>
                                            <th className="ps-0 min-w-140px"></th>
                                            <th className="text-end min-w-140px p-0 pb-1">TOTAL PRICE</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td><img src="/assets/media/stock/ecommerce/210.png" className="w-50px" alt="" /></td>
                                            <td className="ps-0">
                                                <a href="#" className="text-gray-800 fw-bold text-hover-primary mb-1 fs-6 text-start pe-0">Elephant 1802</a>
                                                <span className="text-gray-500 fw-semibold fs-7 d-block text-start ps-0">Item: #XDG-2347</span>
                                            </td>
                                            <td><span className="text-gray-800 fw-bold d-block fs-6 ps-0 text-end">$72.00</span></td>
                                        </tr>
                                        <tr>
                                            <td><img src="/assets/media/stock/ecommerce/215.png" className="w-50px" alt="" /></td>
                                            <td className="ps-0">
                                                <a href="#" className="text-gray-800 fw-bold text-hover-primary mb-1 fs-6 text-start pe-0">Red Laga</a>
                                                <span className="text-gray-500 fw-semibold fs-7 d-block text-start ps-0">Item: #XDG-2347</span>
                                            </td>
                                            <td><span className="text-gray-800 fw-bold d-block fs-6 ps-0 text-end">$45.00</span></td>
                                        </tr>
                                        <tr>
                                            <td><img src="/assets/media/stock/ecommerce/209.png" className="w-50px" alt="" /></td>
                                            <td className="ps-0">
                                                <a href="#" className="text-gray-800 fw-bold text-hover-primary mb-1 fs-6 text-start pe-0">RiseUP</a>
                                                <span className="text-gray-500 fw-semibold fs-7 d-block text-start ps-0">Item: #XDG-2347</span>
                                            </td>
                                            <td><span className="text-gray-800 fw-bold d-block fs-6 ps-0 text-end">$168.00</span></td>
                                        </tr>
                                        <tr>
                                            <td><img src="/assets/media/stock/ecommerce/214.png" className="w-50px" alt="" /></td>
                                            <td className="ps-0">
                                                <a href="#" className="text-gray-800 fw-bold text-hover-primary mb-1 fs-6 text-start pe-0">Yellow Stone</a>
                                                <span className="text-gray-500 fw-semibold fs-7 d-block text-start ps-0">Item: #XDG-2347</span>
                                            </td>
                                            <td><span className="text-gray-800 fw-bold d-block fs-6 ps-0 text-end">$72.00</span></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Row 3 */}
            <div className="row g-5 g-xl-10">
                {/* List Widget 7 */}
                <div className="col-xxl-4 mb-xxl-10">
                    <div className="card card-flush h-md-100">
                        <div className="card-header py-7">
                            <div className="m-0">
                                <div className="d-flex align-items-center mb-2">
                                    <span className="fs-2hx fw-bold text-gray-800 me-2 lh-1 ls-n2">0.37%</span>
                                    <span className="badge badge-light-danger fs-base">
                                        <i className="ki-outline ki-arrow-up fs-5 text-danger ms-n1"></i>8.02%
                                    </span>
                                </div>
                                <span className="fs-6 fw-semibold text-gray-500">Online store convertion rate</span>
                            </div>
                            <div className="card-toolbar">
                                <button className="btn btn-icon btn-color-gray-500 btn-active-color-primary justify-content-end" data-kt-menu-trigger="click" data-kt-menu-placement="bottom-end" data-kt-menu-overflow="true">
                                    <i className="ki-outline ki-dots-square fs-1 text-gray-500 me-n1"></i>
                                </button>
                            </div>
                        </div>
                        <div className="card-body pt-0">
                            {/* Items */}
                            <div className="mb-0">
                                <div className="d-flex flex-stack">
                                    <div className="d-flex align-items-center me-5">
                                        <div className="symbol symbol-30px me-5">
                                            <span className="symbol-label">
                                                <i className="ki-outline ki-magnifier fs-3 text-gray-600"></i>
                                            </span>
                                        </div>
                                        <div className="me-5">
                                            <a href="#" className="text-gray-800 fw-bold text-hover-primary fs-6">Search Retargeting</a>
                                            <span className="text-gray-500 fw-semibold fs-7 d-block text-start ps-0">Direct link clicks</span>
                                        </div>
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <span className="text-gray-800 fw-bold fs-6 me-3">0.24%</span>
                                        <div className="d-flex flex-center">
                                            <span className="badge badge-light-success fs-base">
                                                <i className="ki-outline ki-arrow-up fs-5 text-success ms-n1"></i>2.4%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="separator separator-dashed my-3"></div>

                                <div className="d-flex flex-stack">
                                    <div className="d-flex align-items-center me-5">
                                        <div className="symbol symbol-30px me-5">
                                            <span className="symbol-label">
                                                <i className="ki-outline ki-tiktok fs-3 text-gray-600"></i>
                                            </span>
                                        </div>
                                        <div className="me-5">
                                            <a href="#" className="text-gray-800 fw-bold text-hover-primary fs-6">Social Retargeting</a>
                                            <span className="text-gray-500 fw-semibold fs-7 d-block text-start ps-0">Direct link clicks</span>
                                        </div>
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <span className="text-gray-800 fw-bold fs-6 me-3">0.94%</span>
                                        <div className="d-flex flex-center">
                                            <span className="badge badge-light-danger fs-base">
                                                <i className="ki-outline ki-arrow-down fs-5 text-danger ms-n1"></i>9.4%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="separator separator-dashed my-3"></div>

                                <div className="d-flex flex-stack">
                                    <div className="d-flex align-items-center me-5">
                                        <div className="symbol symbol-30px me-5">
                                            <span className="symbol-label">
                                                <i className="ki-outline ki-sms fs-3 text-gray-600"></i>
                                            </span>
                                        </div>
                                        <div className="me-5">
                                            <a href="#" className="text-gray-800 fw-bold text-hover-primary fs-6">Email Retargeting</a>
                                            <span className="text-gray-500 fw-semibold fs-7 d-block text-start ps-0">Direct link clicks</span>
                                        </div>
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <span className="text-gray-800 fw-bold fs-6 me-3">1.23%</span>
                                        <div className="d-flex flex-center">
                                            <span className="badge badge-light-success fs-base">
                                                <i className="ki-outline ki-arrow-up fs-5 text-success ms-n1"></i>0.2%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="separator separator-dashed my-3"></div>

                                <div className="d-flex flex-stack">
                                    <div className="d-flex align-items-center me-5">
                                        <div className="symbol symbol-30px me-5">
                                            <span className="symbol-label">
                                                <i className="ki-outline ki-icon fs-3 text-gray-600"></i>
                                            </span>
                                        </div>
                                        <div className="me-5">
                                            <a href="#" className="text-gray-800 fw-bold text-hover-primary fs-6">Referrals Customers</a>
                                            <span className="text-gray-500 fw-semibold fs-7 d-block text-start ps-0">Direct link clicks</span>
                                        </div>
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <span className="text-gray-800 fw-bold fs-6 me-3">0.08%</span>
                                        <div className="d-flex flex-center">
                                            <span className="badge badge-light-danger fs-base">
                                                <i className="ki-outline ki-arrow-down fs-5 text-danger ms-n1"></i>0.4%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="separator separator-dashed my-3"></div>

                                <div className="d-flex flex-stack">
                                    <div className="d-flex align-items-center me-5">
                                        <div className="symbol symbol-30px me-5">
                                            <span className="symbol-label">
                                                <i className="ki-outline ki-abstract-25 fs-3 text-gray-600"></i>
                                            </span>
                                        </div>
                                        <div className="me-5">
                                            <a href="#" className="text-gray-800 fw-bold text-hover-primary fs-6">Other</a>
                                            <span className="text-gray-500 fw-semibold fs-7 d-block text-start ps-0">Direct link clicks</span>
                                        </div>
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <span className="text-gray-800 fw-bold fs-6 me-3">0.46%</span>
                                        <div className="d-flex flex-center">
                                            <span className="badge badge-light-success fs-base">
                                                <i className="ki-outline ki-arrow-up fs-5 text-success ms-n1"></i>8.3%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chart Widget 13 */}
                <div className="col-xxl-8 mb-5 mb-xl-10">
                    <div className="card card-flush h-md-100">
                        <div className="card-header pt-7">
                            <h3 className="card-title align-items-start flex-column">
                                <span className="card-label fw-bold text-gray-900">Sales Statistics</span>
                                <span className="text-gray-500 pt-2 fw-semibold fs-6">Top Selling Products</span>
                            </h3>
                            <div className="card-toolbar">
                                <button className="btn btn-icon btn-color-gray-500 btn-active-color-primary justify-content-end" data-kt-menu-trigger="click" data-kt-menu-placement="bottom-end" data-kt-menu-overflow="true">
                                    <i className="ki-outline ki-dots-square fs-1 text-gray-500 me-n1"></i>
                                </button>
                            </div>
                        </div>
                        <div className="card-body pt-5">
                            <div id="kt_charts_widget_13_chart" className="w-100 h-325px"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Row 4 */}
            <div className="row g-5 g-xl-10 g-xl-10">
                {/* List Widget 8 */}
                <div className="col-xl-4 mb-xl-10">
                    <div className="card card-flush h-xl-100">
                        <div className="card-header pt-7 mb-5">
                            <h3 className="card-title align-items-start flex-column">
                                <span className="card-label fw-bold text-gray-800">Visits by Country</span>
                                <span className="text-gray-500 mt-1 fw-semibold fs-6">20 countries share 97% visits</span>
                            </h3>
                            <div className="card-toolbar">
                                <a href="#" className="btn btn-sm btn-light">View All</a>
                            </div>
                        </div>
                        <div className="card-body pt-0">
                            <div className="m-0">
                                <div className="d-flex flex-stack">
                                    <img src="/assets/media/flags/united-states.svg" className="me-4 w-25px" style={{ borderRadius: '4px' }} alt="" />
                                    <div className="d-flex flex-stack flex-row-fluid d-grid gap-2">
                                        <div className="me-5">
                                            <a href="#" className="text-gray-800 fw-bold text-hover-primary fs-6">United States</a>
                                            <span className="text-gray-500 fw-semibold fs-7 d-block text-start ps-0">Direct link clicks</span>
                                        </div>
                                        <div className="d-flex align-items-center">
                                            <span className="text-gray-800 fw-bold fs-6 me-3 d-block">9,763</span>
                                            <div className="m-0">
                                                <span className="badge badge-light-success fs-base">
                                                    <i className="ki-outline ki-arrow-up fs-5 text-success ms-n1"></i>2.6%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="separator separator-dashed my-3"></div>

                                <div className="d-flex flex-stack">
                                    <img src="/assets/media/flags/brazil.svg" className="me-4 w-25px" style={{ borderRadius: '4px' }} alt="" />
                                    <div className="d-flex flex-stack flex-row-fluid d-grid gap-2">
                                        <div className="me-5">
                                            <a href="#" className="text-gray-800 fw-bold text-hover-primary fs-6">Brasil</a>
                                            <span className="text-gray-500 fw-semibold fs-7 d-block text-start ps-0">All Social Channels</span>
                                        </div>
                                        <div className="d-flex align-items-center">
                                            <span className="text-gray-800 fw-bold fs-6 me-3 d-block">4,062</span>
                                            <div className="m-0">
                                                <span className="badge badge-light-danger fs-base">
                                                    <i className="ki-outline ki-arrow-down fs-5 text-danger ms-n1"></i>0.4%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="separator separator-dashed my-3"></div>

                                <div className="d-flex flex-stack">
                                    <img src="/assets/media/flags/turkey.svg" className="me-4 w-25px" style={{ borderRadius: '4px' }} alt="" />
                                    <div className="d-flex flex-stack flex-row-fluid d-grid gap-2">
                                        <div className="me-5">
                                            <a href="#" className="text-gray-800 fw-bold text-hover-primary fs-6">Turkey</a>
                                            <span className="text-gray-500 fw-semibold fs-7 d-block text-start ps-0">Mailchimp Campaigns</span>
                                        </div>
                                        <div className="d-flex align-items-center">
                                            <span className="text-gray-800 fw-bold fs-6 me-3 d-block">1,680</span>
                                            <div className="m-0">
                                                <span className="badge badge-light-success fs-base">
                                                    <i className="ki-outline ki-arrow-up fs-5 text-success ms-n1"></i>0.2%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="separator separator-dashed my-3"></div>

                                <div className="d-flex flex-stack">
                                    <img src="/assets/media/flags/france.svg" className="me-4 w-25px" style={{ borderRadius: '4px' }} alt="" />
                                    <div className="d-flex flex-stack flex-row-fluid d-grid gap-2">
                                        <div className="me-5">
                                            <a href="#" className="text-gray-800 fw-bold text-hover-primary fs-6">France</a>
                                            <span className="text-gray-500 fw-semibold fs-7 d-block text-start ps-0">Impact Radius visits</span>
                                        </div>
                                        <div className="d-flex align-items-center">
                                            <span className="text-gray-800 fw-bold fs-6 me-3 d-block">849</span>
                                            <div className="m-0">
                                                <span className="badge badge-light-success fs-base">
                                                    <i className="ki-outline ki-arrow-up fs-5 text-success ms-n1"></i>4.1%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="separator separator-dashed my-3"></div>

                                <div className="d-flex flex-stack">
                                    <img src="/assets/media/flags/india.svg" className="me-4 w-25px" style={{ borderRadius: '4px' }} alt="" />
                                    <div className="d-flex flex-stack flex-row-fluid d-grid gap-2">
                                        <div className="me-5">
                                            <a href="#" className="text-gray-800 fw-bold text-hover-primary fs-6">India</a>
                                            <span className="text-gray-500 fw-semibold fs-7 d-block text-start ps-0">Many Sources</span>
                                        </div>
                                        <div className="d-flex align-items-center">
                                            <span className="text-gray-800 fw-bold fs-6 me-3 d-block">604</span>
                                            <div className="m-0">
                                                <span className="badge badge-light-danger fs-base">
                                                    <i className="ki-outline ki-arrow-down fs-5 text-danger ms-n1"></i>8.3%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="separator separator-dashed my-3"></div>

                                <div className="d-flex flex-stack">
                                    <img src="/assets/media/flags/sweden.svg" className="me-4 w-25px" style={{ borderRadius: '4px' }} alt="" />
                                    <div className="d-flex flex-stack flex-row-fluid d-grid gap-2">
                                        <div className="me-5">
                                            <a href="#" className="text-gray-800 fw-bold text-hover-primary fs-6">Sweden</a>
                                            <span className="text-gray-500 fw-semibold fs-7 d-block text-start ps-0">Social Network</span>
                                        </div>
                                        <div className="d-flex align-items-center">
                                            <span className="text-gray-800 fw-bold fs-6 me-3 d-block">237</span>
                                            <div className="m-0">
                                                <span className="badge badge-light-success fs-base">
                                                    <i className="ki-outline ki-arrow-up fs-5 text-success ms-n1"></i>1.9%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* List Widget 9 */}
                <div className="col-xl-4 mb-5 mb-xl-10">
                    <div className="card card-flush h-xl-100">
                        <div className="card-header py-7">
                            <h3 className="card-title align-items-start flex-column">
                                <span className="card-label fw-bold text-gray-800">Social Network Visits</span>
                                <span className="text-gray-500 mt-1 fw-semibold fs-6">8k social visitors</span>
                            </h3>
                            <div className="card-toolbar">
                                <a href="#" className="btn btn-sm btn-light">View All</a>
                            </div>
                        </div>
                        <div className="card-body card-body d-flex justify-content-between flex-column pt-3">
                            <div className="d-flex flex-stack">
                                <img src="/assets/media/svg/brand-logos/dribbble-icon-1.svg" className="me-4 w-30px" style={{ borderRadius: '4px' }} alt="" />
                                <div className="d-flex align-items-center flex-stack flex-wrap flex-row-fluid d-grid gap-2">
                                    <div className="me-5">
                                        <a href="#" className="text-gray-800 fw-bold text-hover-primary fs-6">Dribbble</a>
                                        <span className="text-gray-500 fw-semibold fs-7 d-block text-start ps-0">Community</span>
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <span className="text-gray-800 fw-bold fs-4 me-3">579</span>
                                        <div className="m-0">
                                            <span className="badge badge-light-success fs-base">
                                                <i className="ki-outline ki-arrow-up fs-5 text-success ms-n1"></i>2.6%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="separator separator-dashed my-3"></div>

                            <div className="d-flex flex-stack">
                                <img src="/assets/media/svg/brand-logos/linkedin-1.svg" className="me-4 w-30px" style={{ borderRadius: '4px' }} alt="" />
                                <div className="d-flex align-items-center flex-stack flex-wrap flex-row-fluid d-grid gap-2">
                                    <div className="me-5">
                                        <a href="#" className="text-gray-800 fw-bold text-hover-primary fs-6">Linked In</a>
                                        <span className="text-gray-500 fw-semibold fs-7 d-block text-start ps-0">Social Media</span>
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <span className="text-gray-800 fw-bold fs-4 me-3">2,588</span>
                                        <div className="m-0">
                                            <span className="badge badge-light-danger fs-base">
                                                <i className="ki-outline ki-arrow-down fs-5 text-danger ms-n1"></i>0.4%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="separator separator-dashed my-3"></div>

                            <div className="d-flex flex-stack">
                                <img src="/assets/media/svg/brand-logos/slack-icon.svg" className="me-4 w-30px" style={{ borderRadius: '4px' }} alt="" />
                                <div className="d-flex align-items-center flex-stack flex-wrap flex-row-fluid d-grid gap-2">
                                    <div className="me-5">
                                        <a href="#" className="text-gray-800 fw-bold text-hover-primary fs-6">Slack</a>
                                        <span className="text-gray-500 fw-semibold fs-7 d-block text-start ps-0">Messanger</span>
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <span className="text-gray-800 fw-bold fs-4 me-3">794</span>
                                        <div className="m-0">
                                            <span className="badge badge-light-success fs-base">
                                                <i className="ki-outline ki-arrow-up fs-5 text-success ms-n1"></i>0.2%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="separator separator-dashed my-3"></div>

                            <div className="d-flex flex-stack">
                                <img src="/assets/media/svg/brand-logos/youtube-3.svg" className="me-4 w-30px" style={{ borderRadius: '4px' }} alt="" />
                                <div className="d-flex align-items-center flex-stack flex-wrap flex-row-fluid d-grid gap-2">
                                    <div className="me-5">
                                        <a href="#" className="text-gray-800 fw-bold text-hover-primary fs-6">YouTube</a>
                                        <span className="text-gray-500 fw-semibold fs-7 d-block text-start ps-0">Video Channel</span>
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <span className="text-gray-800 fw-bold fs-4 me-3">1,578</span>
                                        <div className="m-0">
                                            <span className="badge badge-light-success fs-base">
                                                <i className="ki-outline ki-arrow-up fs-5 text-success ms-n1"></i>4.1%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="separator separator-dashed my-3"></div>

                            <div className="d-flex flex-stack">
                                <img src="/assets/media/svg/brand-logos/instagram-2-1.svg" className="me-4 w-30px" style={{ borderRadius: '4px' }} alt="" />
                                <div className="d-flex align-items-center flex-stack flex-wrap flex-row-fluid d-grid gap-2">
                                    <div className="me-5">
                                        <a href="#" className="text-gray-800 fw-bold text-hover-primary fs-6">Instagram</a>
                                        <span className="text-gray-500 fw-semibold fs-7 d-block text-start ps-0">Social Network</span>
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <span className="text-gray-800 fw-bold fs-4 me-3">3,458</span>
                                        <div className="m-0">
                                            <span className="badge badge-light-success fs-base">
                                                <i className="ki-outline ki-arrow-up fs-5 text-success ms-n1"></i>8.3%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="separator separator-dashed my-3"></div>

                            <div className="d-flex flex-stack">
                                <img src="/assets/media/svg/brand-logos/facebook-3.svg" className="me-4 w-30px" style={{ borderRadius: '4px' }} alt="" />
                                <div className="d-flex align-items-center flex-stack flex-wrap flex-row-fluid d-grid gap-2">
                                    <div className="me-5">
                                        <a href="#" className="text-gray-800 fw-bold text-hover-primary fs-6">Facebook</a>
                                        <span className="text-gray-500 fw-semibold fs-7 d-block text-start ps-0">Social Network</span>
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <span className="text-gray-800 fw-bold fs-4 me-3">2,047</span>
                                        <div className="m-0">
                                            <span className="badge badge-light-success fs-base">
                                                <i className="ki-outline ki-arrow-up fs-5 text-success ms-n1"></i>1.9%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chart Widget 14 */}
                <div className="col-xl-8">
                    <div className="card card-flush h-xl-100">
                        <div className="card-header pt-7">
                            <h3 className="card-title align-items-start flex-column">
                                <span className="card-label fw-bold text-gray-900">Departments</span>
                                <span className="text-gray-500 pt-2 fw-semibold fs-6">Performance & achievements</span>
                            </h3>
                            <div className="card-toolbar">
                                <button className="btn btn-icon btn-color-gray-500 btn-active-color-primary justify-content-end" data-kt-menu-trigger="click" data-kt-menu-placement="bottom-end" data-kt-menu-overflow="true">
                                    <i className="ki-outline ki-dots-square fs-1 text-gray-500 me-n1"></i>
                                </button>
                            </div>
                        </div>
                        <div className="card-body pt-5">
                            <div id="kt_charts_widget_14_chart" className="w-100 h-350px"></div>
                        </div>
                    </div>
                </div>

                {/* List Widget 12 */}
                <div className="col-xl-4">
                    <div className="card card-flush h-xl-100">
                        <div className="card-header pt-7">
                            <h3 className="card-title align-items-start flex-column">
                                <span className="card-label fw-bold text-gray-800">Visits by Source</span>
                                <span className="text-gray-500 mt-1 fw-semibold fs-6">29.4k visitors</span>
                            </h3>
                            <div className="card-toolbar">
                                <button className="btn btn-icon btn-color-gray-500 btn-active-color-primary justify-content-end" data-kt-menu-trigger="click" data-kt-menu-placement="bottom-end" data-kt-menu-overflow="true">
                                    <i className="ki-outline ki-dots-square fs-1 text-gray-500 me-n1"></i>
                                </button>
                            </div>
                        </div>
                        <div className="card-body d-flex align-items-end">
                            <div className="w-100">
                                <div className="d-flex align-items-center">
                                    <div className="symbol symbol-30px me-5">
                                        <span className="symbol-label">
                                            <i className="ki-outline ki-rocket fs-3 text-gray-600"></i>
                                        </span>
                                    </div>
                                    <div className="d-flex align-items-center flex-stack flex-wrap d-grid gap-1 flex-row-fluid">
                                        <div className="me-5">
                                            <a href="#" className="text-gray-800 fw-bold text-hover-primary fs-6">Direct Source</a>
                                            <span className="text-gray-500 fw-semibold fs-7 d-block text-start ps-0">Direct link clicks</span>
                                        </div>
                                        <div className="d-flex align-items-center">
                                            <span className="text-gray-800 fw-bold fs-4 me-3">1,067</span>
                                            <span className="badge badge-light-success fs-base">
                                                <i className="ki-outline ki-arrow-up fs-5 text-success ms-n1"></i>2.6%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="separator separator-dashed my-3"></div>

                                <div className="d-flex align-items-center">
                                    <div className="symbol symbol-30px me-5">
                                        <span className="symbol-label">
                                            <i className="ki-outline ki-tiktok fs-3 text-gray-600"></i>
                                        </span>
                                    </div>
                                    <div className="d-flex align-items-center flex-stack flex-wrap d-grid gap-1 flex-row-fluid">
                                        <div className="me-5">
                                            <a href="#" className="text-gray-800 fw-bold text-hover-primary fs-6">Social Networks</a>
                                            <span className="text-gray-500 fw-semibold fs-7 d-block text-start ps-0">All Social Channels</span>
                                        </div>
                                        <div className="d-flex align-items-center">
                                            <span className="text-gray-800 fw-bold fs-4 me-3">24,588</span>
                                            <span className="badge badge-light-success fs-base">
                                                <i className="ki-outline ki-arrow-up fs-5 text-success ms-n1"></i>4.1%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="separator separator-dashed my-3"></div>

                                <div className="d-flex align-items-center">
                                    <div className="symbol symbol-30px me-5">
                                        <span className="symbol-label">
                                            <i className="ki-outline ki-sms fs-3 text-gray-600"></i>
                                        </span>
                                    </div>
                                    <div className="d-flex align-items-center flex-stack flex-wrap d-grid gap-1 flex-row-fluid">
                                        <div className="me-5">
                                            <a href="#" className="text-gray-800 fw-bold text-hover-primary fs-6">Email Newsletter</a>
                                            <span className="text-gray-500 fw-semibold fs-7 d-block text-start ps-0">Mailchimp Campaigns</span>
                                        </div>
                                        <div className="d-flex align-items-center">
                                            <span className="text-gray-800 fw-bold fs-4 me-3">794</span>
                                            <span className="badge badge-light-success fs-base">
                                                <i className="ki-outline ki-arrow-up fs-5 text-success ms-n1"></i>0.2%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="separator separator-dashed my-3"></div>

                                <div className="d-flex align-items-center">
                                    <div className="symbol symbol-30px me-5">
                                        <span className="symbol-label">
                                            <i className="ki-outline ki-icon fs-3 text-gray-600"></i>
                                        </span>
                                    </div>
                                    <div className="d-flex align-items-center flex-stack flex-wrap d-grid gap-1 flex-row-fluid">
                                        <div className="me-5">
                                            <a href="#" className="text-gray-800 fw-bold text-hover-primary fs-6">Referrals</a>
                                            <span className="text-gray-500 fw-semibold fs-7 d-block text-start ps-0">Impact Radius visits</span>
                                        </div>
                                        <div className="d-flex align-items-center">
                                            <span className="text-gray-800 fw-bold fs-4 me-3">6,578</span>
                                            <span className="badge badge-light-danger fs-base">
                                                <i className="ki-outline ki-arrow-down fs-5 text-danger ms-n1"></i>0.4%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="separator separator-dashed my-3"></div>

                                <div className="d-flex align-items-center">
                                    <div className="symbol symbol-30px me-5">
                                        <span className="symbol-label">
                                            <i className="ki-outline ki-abstract-25 fs-3 text-gray-600"></i>
                                        </span>
                                    </div>
                                    <div className="d-flex align-items-center flex-stack flex-wrap d-grid gap-1 flex-row-fluid">
                                        <div className="me-5">
                                            <a href="#" className="text-gray-800 fw-bold text-hover-primary fs-6">Other</a>
                                            <span className="text-gray-500 fw-semibold fs-7 d-block text-start ps-0">Many Sources</span>
                                        </div>
                                        <div className="d-flex align-items-center">
                                            <span className="text-gray-800 fw-bold fs-4 me-3">79,458</span>
                                            <span className="badge badge-light-success fs-base">
                                                <i className="ki-outline ki-arrow-up fs-5 text-success ms-n1"></i>8.3%
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-center pt-8 d-1">
                                    <a href="#" className="text-primary opacity-75-hover fs-6 fw-bold">
                                        View Store Analytics <i className="ki-outline ki-arrow-right fs-3 text-primary"></i>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chart Widget 15 */}
                <div className="col-xl-8">
                    <div className="card card-flush h-xl-100">
                        <div className="card-header pt-7">
                            <h3 className="card-title align-items-start flex-column">
                                <span className="card-label fw-bold text-gray-900">Author Sales</span>
                                <span className="text-gray-500 pt-2 fw-semibold fs-6">Statistics by Countries</span>
                            </h3>
                            <div className="card-toolbar">
                                <button className="btn btn-icon btn-color-gray-500 btn-active-color-primary justify-content-end" data-kt-menu-trigger="click" data-kt-menu-placement="bottom-end" data-kt-menu-overflow="true">
                                    <i className="ki-outline ki-dots-square fs-1 text-gray-500 me-n1"></i>
                                </button>
                            </div>
                        </div>
                        <div className="card-body pt-5">
                            <div id="kt_charts_widget_15_chart" className="min-h-auto ps-4 pe-6 mb-3 h-350px"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardContent;
