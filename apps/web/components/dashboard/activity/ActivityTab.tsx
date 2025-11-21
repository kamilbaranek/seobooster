import React, { useState } from 'react';

const ActivityTab: React.FC = () => {
    const [activeTab, setActiveTab] = useState('today');

    return (
        <div className="card">
            {/*begin::Card head*/}
            <div className="card-header card-header-stretch">
                {/*begin::Title*/}
                <div className="card-title d-flex align-items-center">
                    <i className="ki-outline ki-calendar-8 fs-1 text-primary me-3 lh-0"></i>
                    <h3 className="fw-bold m-0 text-gray-800">Jan 23, 2025</h3>
                </div>
                {/*end::Title*/}
                {/*begin::Toolbar*/}
                <div className="card-toolbar m-0">
                    {/*begin::Tab nav*/}
                    <ul className="nav nav-tabs nav-line-tabs nav-stretch fs-6 border-0 fw-bold" role="tablist">
                        <li className="nav-item" role="presentation">
                            <a
                                className={`nav-link justify-content-center text-active-gray-800 ${activeTab === 'today' ? 'active' : ''}`}
                                onClick={() => setActiveTab('today')}
                                href="#"
                                role="tab"
                            >
                                Today
                            </a>
                        </li>
                        <li className="nav-item" role="presentation">
                            <a
                                className={`nav-link justify-content-center text-active-gray-800 ${activeTab === 'week' ? 'active' : ''}`}
                                onClick={() => setActiveTab('week')}
                                href="#"
                                role="tab"
                            >
                                Week
                            </a>
                        </li>
                        <li className="nav-item" role="presentation">
                            <a
                                className={`nav-link justify-content-center text-active-gray-800 ${activeTab === 'month' ? 'active' : ''}`}
                                onClick={() => setActiveTab('month')}
                                href="#"
                                role="tab"
                            >
                                Month
                            </a>
                        </li>
                        <li className="nav-item" role="presentation">
                            <a
                                className={`nav-link justify-content-center text-active-gray-800 text-hover-gray-800 ${activeTab === 'year' ? 'active' : ''}`}
                                onClick={() => setActiveTab('year')}
                                href="#"
                                role="tab"
                            >
                                2025
                            </a>
                        </li>
                    </ul>
                    {/*end::Tab nav*/}
                </div>
                {/*end::Toolbar*/}
            </div>
            {/*end::Card head*/}
            {/*begin::Card body*/}
            <div className="card-body">
                {/*begin::Tab Content*/}
                <div className="tab-content">
                    {/*begin::Tab panel*/}
                    <div className={`card-body p-0 tab-pane fade ${activeTab === 'today' ? 'show active' : ''}`} role="tabpanel">
                        {/*begin::Timeline*/}
                        <div className="timeline timeline-border-dashed">
                            {/*begin::Timeline item*/}
                            <div className="timeline-item">
                                {/*begin::Timeline line*/}
                                <div className="timeline-line"></div>
                                {/*end::Timeline line*/}
                                {/*begin::Timeline icon*/}
                                <div className="timeline-icon">
                                    <i className="ki-outline ki-message-text-2 fs-2 text-gray-500"></i>
                                </div>
                                {/*end::Timeline icon*/}
                                {/*begin::Timeline content*/}
                                <div className="timeline-content mb-10 mt-n1">
                                    {/*begin::Timeline heading*/}
                                    <div className="pe-3 mb-5">
                                        {/*begin::Title*/}
                                        <div className="fs-5 fw-semibold mb-2">There are 2 new tasks for you in “AirPlus Mobile App” project:</div>
                                        {/*end::Title*/}
                                        {/*begin::Description*/}
                                        <div className="d-flex align-items-center mt-1 fs-6">
                                            {/*begin::Info*/}
                                            <div className="text-muted me-2 fs-7">Added at 4:23 PM by</div>
                                            {/*end::Info*/}
                                            {/*begin::User*/}
                                            <div className="symbol symbol-circle symbol-25px" data-bs-toggle="tooltip" data-bs-boundary="window" data-bs-placement="top" title="Nina Nilson">
                                                <img src="/assets/media/avatars/300-14.jpg" alt="img" />
                                            </div>
                                            {/*end::User*/}
                                        </div>
                                        {/*end::Description*/}
                                    </div>
                                    {/*end::Timeline heading*/}
                                    {/*begin::Timeline details*/}
                                    <div className="overflow-auto pb-5">
                                        {/*begin::Record*/}
                                        <div className="d-flex align-items-center border border-dashed border-gray-300 rounded min-w-750px px-7 py-3 mb-5">
                                            {/*begin::Title*/}
                                            <a href="#" className="fs-5 text-gray-900 text-hover-primary fw-semibold w-375px min-w-200px">Meeting with customer</a>
                                            {/*end::Title*/}
                                            {/*begin::Label*/}
                                            <div className="min-w-175px pe-2">
                                                <span className="badge badge-light text-muted">Application Design</span>
                                            </div>
                                            {/*end::Label*/}
                                            {/*begin::Users*/}
                                            <div className="symbol-group symbol-hover flex-nowrap flex-grow-1 min-w-100px pe-2">
                                                {/*begin::User*/}
                                                <div className="symbol symbol-circle symbol-25px">
                                                    <img src="/assets/media/avatars/300-2.jpg" alt="img" />
                                                </div>
                                                {/*end::User*/}
                                                {/*begin::User*/}
                                                <div className="symbol symbol-circle symbol-25px">
                                                    <img src="/assets/media/avatars/300-14.jpg" alt="img" />
                                                </div>
                                                {/*end::User*/}
                                                {/*begin::User*/}
                                                <div className="symbol symbol-circle symbol-25px">
                                                    <div className="symbol-label fs-8 fw-semibold bg-primary text-inverse-primary">A</div>
                                                </div>
                                                {/*end::User*/}
                                            </div>
                                            {/*end::Users*/}
                                            {/*begin::Progress*/}
                                            <div className="min-w-125px pe-2">
                                                <span className="badge badge-light-primary">In Progress</span>
                                            </div>
                                            {/*end::Progress*/}
                                            {/*begin::Action*/}
                                            <a href="#" className="btn btn-sm btn-light btn-active-light-primary">View</a>
                                            {/*end::Action*/}
                                        </div>
                                        {/*end::Record*/}
                                        {/*begin::Record*/}
                                        <div className="d-flex align-items-center border border-dashed border-gray-300 rounded min-w-750px px-7 py-3 mb-0">
                                            {/*begin::Title*/}
                                            <a href="#" className="fs-5 text-gray-900 text-hover-primary fw-semibold w-375px min-w-200px">Project Delivery Preparation</a>
                                            {/*end::Title*/}
                                            {/*begin::Label*/}
                                            <div className="min-w-175px">
                                                <span className="badge badge-light text-muted">CRM System Development</span>
                                            </div>
                                            {/*end::Label*/}
                                            {/*begin::Users*/}
                                            <div className="symbol-group symbol-hover flex-nowrap flex-grow-1 min-w-100px">
                                                {/*begin::User*/}
                                                <div className="symbol symbol-circle symbol-25px">
                                                    <img src="/assets/media/avatars/300-20.jpg" alt="img" />
                                                </div>
                                                {/*end::User*/}
                                                {/*begin::User*/}
                                                <div className="symbol symbol-circle symbol-25px">
                                                    <div className="symbol-label fs-8 fw-semibold bg-success text-inverse-primary">B</div>
                                                </div>
                                                {/*end::User*/}
                                            </div>
                                            {/*end::Users*/}
                                            {/*begin::Progress*/}
                                            <div className="min-w-125px">
                                                <span className="badge badge-light-success">Completed</span>
                                            </div>
                                            {/*end::Progress*/}
                                            {/*begin::Action*/}
                                            <a href="#" className="btn btn-sm btn-light btn-active-light-primary">View</a>
                                            {/*end::Action*/}
                                        </div>
                                        {/*end::Record*/}
                                    </div>
                                    {/*end::Timeline details*/}
                                </div>
                                {/*end::Timeline content*/}
                            </div>
                            {/*end::Timeline item*/}
                            {/*begin::Timeline item*/}
                            <div className="timeline-item">
                                {/*begin::Timeline line*/}
                                <div className="timeline-line"></div>
                                {/*end::Timeline line*/}
                                {/*begin::Timeline icon*/}
                                <div className="timeline-icon me-4">
                                    <i className="ki-outline ki-flag fs-2 text-gray-500"></i>
                                </div>
                                {/*end::Timeline icon*/}
                                {/*begin::Timeline content*/}
                                <div className="timeline-content mb-10 mt-n2">
                                    {/*begin::Timeline heading*/}
                                    <div className="overflow-auto pe-3">
                                        {/*begin::Title*/}
                                        <div className="fs-5 fw-semibold mb-2">Invitation for crafting engaging designs that speak human workshop</div>
                                        {/*end::Title*/}
                                        {/*begin::Description*/}
                                        <div className="d-flex align-items-center mt-1 fs-6">
                                            {/*begin::Info*/}
                                            <div className="text-muted me-2 fs-7">Sent at 4:23 PM by</div>
                                            {/*end::Info*/}
                                            {/*begin::User*/}
                                            <div className="symbol symbol-circle symbol-25px" data-bs-toggle="tooltip" data-bs-boundary="window" data-bs-placement="top" title="Alan Nilson">
                                                <img src="/assets/media/avatars/300-1.jpg" alt="img" />
                                            </div>
                                            {/*end::User*/}
                                        </div>
                                        {/*end::Description*/}
                                    </div>
                                    {/*end::Timeline heading*/}
                                </div>
                                {/*end::Timeline content*/}
                            </div>
                            {/*end::Timeline item*/}
                            {/*begin::Timeline item*/}
                            <div className="timeline-item">
                                {/*begin::Timeline line*/}
                                <div className="timeline-line"></div>
                                {/*end::Timeline line*/}
                                {/*begin::Timeline icon*/}
                                <div className="timeline-icon">
                                    <i className="ki-outline ki-disconnect fs-2 text-gray-500"></i>
                                </div>
                                {/*end::Timeline icon*/}
                                {/*begin::Timeline content*/}
                                <div className="timeline-content mb-10 mt-n1">
                                    {/*begin::Timeline heading*/}
                                    <div className="mb-5 pe-3">
                                        {/*begin::Title*/}
                                        <a href="#" className="fs-5 fw-semibold text-gray-800 text-hover-primary mb-2">3 New Incoming Project Files:</a>
                                        {/*end::Title*/}
                                        {/*begin::Description*/}
                                        <div className="d-flex align-items-center mt-1 fs-6">
                                            {/*begin::Info*/}
                                            <div className="text-muted me-2 fs-7">Sent at 10:30 PM by</div>
                                            {/*end::Info*/}
                                            {/*begin::User*/}
                                            <div className="symbol symbol-circle symbol-25px" data-bs-toggle="tooltip" data-bs-boundary="window" data-bs-placement="top" title="Jan Hummer">
                                                <img src="/assets/media/avatars/300-23.jpg" alt="img" />
                                            </div>
                                            {/*end::User*/}
                                        </div>
                                        {/*end::Description*/}
                                    </div>
                                    {/*end::Timeline heading*/}
                                    {/*begin::Timeline details*/}
                                    <div className="overflow-auto pb-5">
                                        <div className="d-flex align-items-center border border-dashed border-gray-300 rounded min-w-700px p-5">
                                            {/*begin::Item*/}
                                            <div className="d-flex flex-aligns-center pe-10 pe-lg-20">
                                                {/*begin::Icon*/}
                                                <img alt="" className="w-30px me-3" src="/assets/media/svg/files/pdf.svg" />
                                                {/*end::Icon*/}
                                                {/*begin::Info*/}
                                                <div className="ms-1 fw-semibold">
                                                    {/*begin::Desc*/}
                                                    <a href="#" className="fs-6 text-hover-primary fw-bold">Finance KPI App Guidelines</a>
                                                    {/*end::Desc*/}
                                                    {/*begin::Number*/}
                                                    <div className="text-gray-500">1.9mb</div>
                                                    {/*end::Number*/}
                                                </div>
                                                {/*begin::Info*/}
                                            </div>
                                            {/*end::Item*/}
                                            {/*begin::Item*/}
                                            <div className="d-flex flex-aligns-center pe-10 pe-lg-20">
                                                {/*begin::Icon*/}
                                                <img alt="" className="w-30px me-3" src="/assets/media/svg/files/doc.svg" />
                                                {/*end::Icon*/}
                                                {/*begin::Info*/}
                                                <div className="ms-1 fw-semibold">
                                                    {/*begin::Desc*/}
                                                    <a href="#" className="fs-6 text-hover-primary fw-bold">Client UAT Testing Results</a>
                                                    {/*end::Desc*/}
                                                    {/*begin::Number*/}
                                                    <div className="text-gray-500">18kb</div>
                                                    {/*end::Number*/}
                                                </div>
                                                {/*end::Info*/}
                                            </div>
                                            {/*end::Item*/}
                                            {/*begin::Item*/}
                                            <div className="d-flex flex-aligns-center">
                                                {/*begin::Icon*/}
                                                <img alt="" className="w-30px me-3" src="/assets/media/svg/files/css.svg" />
                                                {/*end::Icon*/}
                                                {/*begin::Info*/}
                                                <div className="ms-1 fw-semibold">
                                                    {/*begin::Desc*/}
                                                    <a href="#" className="fs-6 text-hover-primary fw-bold">Finance Reports</a>
                                                    {/*end::Desc*/}
                                                    {/*begin::Number*/}
                                                    <div className="text-gray-500">20mb</div>
                                                    {/*end::Number*/}
                                                </div>
                                                {/*end::Info*/}
                                            </div>
                                            {/*end::Item*/}
                                        </div>
                                    </div>
                                    {/*end::Timeline details*/}
                                </div>
                                {/*end::Timeline content*/}
                            </div>
                            {/*end::Timeline item*/}
                        </div>
                        {/*end::Timeline*/}
                    </div>
                    {/*end::Tab panel*/}

                    {/* Placeholder for other tabs */}
                    {activeTab !== 'today' && (
                        <div className="card-body p-0 tab-pane fade show active">
                            <div className="text-center py-10">
                                <div className="fs-2 fw-bold text-gray-800">Content for {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} is coming soon...</div>
                            </div>
                        </div>
                    )}
                </div>
                {/*end::Tab Content*/}
            </div>
            {/*end::Card body*/}
        </div>
    );
};

export default ActivityTab;
