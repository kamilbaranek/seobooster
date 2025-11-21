import React from 'react';

const SettingsTab: React.FC = () => {
    return (
        <div className="card">
            {/*begin::Card header*/}
            <div className="card-header">
                {/*begin::Card title*/}
                <div className="card-title fs-3 fw-bold">Project Settings</div>
                {/*end::Card title*/}
            </div>
            {/*end::Card header*/}
            {/*begin::Form*/}
            <form id="kt_project_settings_form" className="form">
                {/*begin::Card body*/}
                <div className="card-body p-9">
                    {/*begin::Row*/}
                    <div className="row mb-5">
                        {/*begin::Col*/}
                        <div className="col-xl-3">
                            <div className="fs-6 fw-semibold mt-2 mb-3">Project Logo</div>
                        </div>
                        {/*end::Col*/}
                        {/*begin::Col*/}
                        <div className="col-lg-8">
                            {/*begin::Image input*/}
                            <div className="image-input image-input-outline" data-kt-image-input="true" style={{ backgroundImage: "url('/assets/media/svg/avatars/blank.svg')" }}>
                                {/*begin::Preview existing avatar*/}
                                <div className="image-input-wrapper w-125px h-125px bgi-position-center" style={{ backgroundSize: '75%', backgroundImage: "url('/assets/media/svg/brand-logos/volicity-9.svg')" }}></div>
                                {/*end::Preview existing avatar*/}
                                {/*begin::Label*/}
                                <label className="btn btn-icon btn-circle btn-active-color-primary w-25px h-25px bg-white shadow" data-kt-image-input-action="change" data-bs-toggle="tooltip" title="Change avatar">
                                    <i className="ki-outline ki-pencil fs-7"></i>
                                    {/*begin::Inputs*/}
                                    <input type="file" name="avatar" accept=".png, .jpg, .jpeg" />
                                    <input type="hidden" name="avatar_remove" />
                                    {/*end::Inputs*/}
                                </label>
                                {/*end::Label*/}
                                {/*begin::Cancel*/}
                                <span className="btn btn-icon btn-circle btn-active-color-primary w-25px h-25px bg-white shadow" data-kt-image-input-action="cancel" data-bs-toggle="tooltip" title="Cancel avatar">
                                    <i className="ki-outline ki-cross fs-2"></i>
                                </span>
                                {/*end::Cancel*/}
                                {/*begin::Remove*/}
                                <span className="btn btn-icon btn-circle btn-active-color-primary w-25px h-25px bg-white shadow" data-kt-image-input-action="remove" data-bs-toggle="tooltip" title="Remove avatar">
                                    <i className="ki-outline ki-cross fs-2"></i>
                                </span>
                                {/*end::Remove*/}
                            </div>
                            {/*end::Image input*/}
                            {/*begin::Hint*/}
                            <div className="form-text">Allowed file types: png, jpg, jpeg.</div>
                            {/*end::Hint*/}
                        </div>
                        {/*end::Col*/}
                    </div>
                    {/*end::Row*/}
                    {/*begin::Row*/}
                    <div className="row mb-8">
                        {/*begin::Col*/}
                        <div className="col-xl-3">
                            <div className="fs-6 fw-semibold mt-2 mb-3">Project Name</div>
                        </div>
                        {/*end::Col*/}
                        {/*begin::Col*/}
                        <div className="col-xl-9 fv-row">
                            <input type="text" className="form-control form-control-solid" name="name" defaultValue="9 Degree Award" />
                        </div>
                    </div>
                    {/*end::Row*/}
                    {/*begin::Row*/}
                    <div className="row mb-8">
                        {/*begin::Col*/}
                        <div className="col-xl-3">
                            <div className="fs-6 fw-semibold mt-2 mb-3">Project Type</div>
                        </div>
                        {/*end::Col*/}
                        {/*begin::Col*/}
                        <div className="col-xl-9 fv-row">
                            <input type="text" className="form-control form-control-solid" name="type" defaultValue="Client Relationship" />
                        </div>
                    </div>
                    {/*end::Row*/}
                    {/*begin::Row*/}
                    <div className="row mb-8">
                        {/*begin::Col*/}
                        <div className="col-xl-3">
                            <div className="fs-6 fw-semibold mt-2 mb-3">Project Description</div>
                        </div>
                        {/*end::Col*/}
                        {/*begin::Col*/}
                        <div className="col-xl-9 fv-row">
                            <textarea name="description" className="form-control form-control-solid h-100px" defaultValue="Organize your thoughts with an outline. Here’s the outlining strategy I use. I promise it works like a charm. Not only will it make writing your blog post easier, it’ll help you make your message"></textarea>
                        </div>
                        {/*begin::Col*/}
                    </div>
                    {/*end::Row*/}
                    {/*begin::Row*/}
                    <div className="row mb-8">
                        {/*begin::Col*/}
                        <div className="col-xl-3">
                            <div className="fs-6 fw-semibold mt-2 mb-3">Due Date</div>
                        </div>
                        {/*end::Col*/}
                        {/*begin::Col*/}
                        <div className="col-xl-9 fv-row">
                            <div className="position-relative d-flex align-items-center">
                                <i className="ki-outline ki-calendar-8 position-absolute ms-4 mb-1 fs-2"></i>
                                <input className="form-control form-control-solid ps-12" name="date" placeholder="Pick a date" id="kt_datepicker_1" />
                            </div>
                        </div>
                        {/*begin::Col*/}
                    </div>
                    {/*end::Row*/}
                    {/*begin::Row*/}
                    <div className="row mb-8">
                        {/*begin::Col*/}
                        <div className="col-xl-3">
                            <div className="fs-6 fw-semibold mt-2 mb-3">Notifications</div>
                        </div>
                        {/*end::Col*/}
                        {/*begin::Col*/}
                        <div className="col-xl-9">
                            <div className="d-flex fw-semibold h-100">
                                <div className="form-check form-check-custom form-check-solid me-9">
                                    <input className="form-check-input" type="checkbox" value="" id="email" />
                                    <label className="form-check-label ms-3" htmlFor="email">Email</label>
                                </div>
                                <div className="form-check form-check-custom form-check-solid">
                                    <input className="form-check-input" type="checkbox" value="" id="phone" defaultChecked={true} />
                                    <label className="form-check-label ms-3" htmlFor="phone">Phone</label>
                                </div>
                            </div>
                        </div>
                        {/*end::Col*/}
                    </div>
                    {/*end::Row*/}
                    {/*begin::Row*/}
                    <div className="row">
                        {/*begin::Col*/}
                        <div className="col-xl-3">
                            <div className="fs-6 fw-semibold mt-2 mb-3">Status</div>
                        </div>
                        {/*end::Col*/}
                        {/*begin::Col*/}
                        <div className="col-xl-9">
                            <div className="form-check form-switch form-check-custom form-check-solid">
                                <input className="form-check-input" type="checkbox" value="" id="status" name="status" defaultChecked={true} />
                                <label className="form-check-label fw-semibold text-gray-500 ms-3" htmlFor="status">Active</label>
                            </div>
                        </div>
                        {/*end::Col*/}
                    </div>
                    {/*end::Row*/}
                </div>
                {/*end::Card body*/}
                {/*begin::Card footer*/}
                <div className="card-footer d-flex justify-content-end py-6 px-9">
                    <button type="reset" className="btn btn-light btn-active-light-primary me-2">Discard</button>
                    <button type="submit" className="btn btn-primary" id="kt_project_settings_submit">Save Changes</button>
                </div>
                {/*end::Card footer*/}
            </form>
            {/*end:Form*/}
        </div>
    );
};

export default SettingsTab;
