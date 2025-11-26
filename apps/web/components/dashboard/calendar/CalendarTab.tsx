import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventDropArg, EventInput } from '@fullcalendar/core';
import { apiFetch } from '../../../lib/api-client';

interface ArticlePlan {
    id: string;
    webId: string;
    articleId?: string | null;
    status: string;
    plannedPublishAt: string;
    articleTitle: string;
    articleKeywords: any;
    articleIntent: string;
    articleFunnelStage: string;
    clusterName: string;
    clusterIntent: string;
    featuredImageUrl?: string | null;
    articleHtml?: string | null;
    articleMarkdown?: string | null;
    autoPublishMode?: string;
}

interface CalendarTabProps {
    plans?: ArticlePlan[];
    webId?: string;
}

const CalendarTab: React.FC<CalendarTabProps> = ({ plans = [], webId }) => {
    const resolvedWebId = webId ?? plans[0]?.webId;

    const [events, setEvents] = useState<EventInput[]>([]);

    useEffect(() => {
        const mapped = plans.map((plan) => ({
            id: plan.id,
            title: plan.articleTitle,
            start: plan.plannedPublishAt,
            allDay: false,
            className: [`fc-event-status-${plan.status.toLowerCase()}`],
            editable: plan.status === 'PLANNED',
            extendedProps: {
                status: plan.status,
                description: plan.articleFunnelStage,
                autoPublishMode: plan.autoPublishMode
            }
        }));
        setEvents(mapped);
    }, [plans]);

    const handleEventDrop = async (info: EventDropArg) => {
        if (!resolvedWebId) {
            info.revert();
            return;
        }

        const newStart = info.event.start;
        if (!newStart) {
            info.revert();
            return;
        }

        setEvents((prev) =>
            prev.map((ev) =>
                ev.id === info.event.id ? { ...ev, start: newStart.toISOString() } : ev
            )
        );

        try {
            await apiFetch(`/webs/${resolvedWebId}/article-plans/${info.event.id}`, {
                method: 'PATCH',
                body: JSON.stringify({ plannedPublishAt: newStart.toISOString() })
            });
        } catch (error) {
            console.error('Failed to update plan date', error);
            info.revert();
        }
    };

    return (
        <div id="kt_app_content_container" className="app-container container-fluid">
            {/*begin::Card*/}
            <div className="card">
                {/*begin::Card header*/}
                <div className="card-header">
                    <h2 className="card-title fw-bold">Calendar</h2>
                    <div className="card-toolbar">
                        <button className="btn btn-flex btn-primary" data-kt-calendar="add">
                            <i className="ki-outline ki-plus fs-2"></i>Add Event
                        </button>
                    </div>
                </div>
                {/*end::Card header*/}
                {/*begin::Card body*/}
                <div className="card-body">
                    {/*begin::Calendar*/}
                    <div id="kt_calendar_app">
                        <style>{`
                            .fc-event {
                                cursor: grab;
                                border: 0;
                                border-radius: 8px;
                                padding: 4px 8px;
                                font-weight: 600;
                                transition: filter 120ms ease;
                                max-width: 100%;
                            }
                            .fc-event.fc-event-dragging { cursor: grabbing; }
                            .fc-event:hover { filter: brightness(1.05); }
                            .fc-event-status-planned { background-color: #009ef7 !important; color: #fff !important; }
                            .fc-event-status-queued { background-color: #f6c000 !important; color: #0f1014 !important; }
                            .fc-event-status-generated { background-color: #50cd89 !important; color: #0f1014 !important; }
                            .fc-event-status-published { background-color: #7239ea !important; color: #fff !important; }
                            .fc-event-status-skipped { background-color: #f1416c !important; color: #fff !important; }
                            .fc-event-status-default { background-color: #3f4254 !important; color: #fff !important; }

                            [data-bs-theme="dark"] .fc-theme-standard th {
                                background-color: #15171c !important;
                                border-color: #2b2b40 !important;
                                color: #e1e3ea !important;
                            }
                            [data-bs-theme="dark"] .fc-theme-standard .fc-scrollgrid {
                                border-color: #2b2b40 !important;
                            }
                            [data-bs-theme="dark"] .fc-theme-standard td, 
                            [data-bs-theme="dark"] .fc-theme-standard th {
                                border-color: #2b2b40 !important;
                            }
                            [data-bs-theme="dark"] .fc-theme-standard td {
                                background-color: #0f1014 !important;
                            }
                            [data-bs-theme="dark"] .fc-col-header-cell {
                                background-color: #0f1014 !important;
                                color: #e1e3ea !important;
                            }
                            [data-bs-theme="dark"] .fc-toolbar-title {
                                color: #f1f1f4 !important;
                            }
                            [data-bs-theme="dark"] .fc-daygrid-day-top {
                                color: #e1e3ea !important;
                            }
                            [data-bs-theme="dark"] .fc-daygrid-day-number {
                                color: #e1e3ea !important;
                            }
                            [data-bs-theme="dark"] .fc .fc-button-primary {
                                background-color: #1b1b29 !important;
                                border-color: #2b2b40 !important;
                                color: #e1e3ea !important;
                            }
                            [data-bs-theme="dark"] .fc .fc-button-primary:hover {
                                background-color: #2b2b40 !important;
                                color: #ffffff !important;
                            }
                            [data-bs-theme="dark"] .fc .fc-button-primary.fc-button-active {
                                background-color: #009ef7 !important;
                                border-color: #0095e8 !important;
                                color: #fff !important;
                            }
                        `}</style>
                        <FullCalendar
                            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                            initialView="dayGridMonth"
                            headerToolbar={{
                                left: 'prev,next today',
                                center: 'title',
                                right: 'dayGridMonth,timeGridWeek,timeGridDay'
                            }}
                            height="75vh"
                            events={events}
                            editable={true}
                            droppable={true}
                            dayMaxEvents={true}
                            dayMaxEventRows={true}
                            moreLinkClick="popover"
                            eventDrop={handleEventDrop}
                            eventContent={(arg) => {
                                const isAutoPublish = arg.event.extendedProps.autoPublishMode === 'auto_publish';
                                return (
                                    <div className="fc-event-main-frame d-flex flex-column overflow-hidden">
                                        <div className="fc-event-title-container">
                                            <div className="fc-event-title fc-sticky text-truncate">
                                                {isAutoPublish ? '⚡ ' : '📝 '}
                                                {arg.event.title}
                                            </div>
                                        </div>
                                    </div>
                                );
                            }}
                        />
                    </div>
                    {/*end::Calendar*/}
                </div>
                {/*end::Card body*/}
            </div>
            {/*end::Card*/}

            {/*begin::Modals*/}
            {/*begin::Modal - New Product*/}
            <div className="modal fade" id="kt_modal_add_event" tabIndex={-1} aria-hidden="true" data-bs-focus="false">
                {/*begin::Modal dialog*/}
                <div className="modal-dialog modal-dialog-centered mw-650px">
                    {/*begin::Modal content*/}
                    <div className="modal-content">
                        {/*begin::Form*/}
                        <form className="form" action="#" id="kt_modal_add_event_form">
                            {/*begin::Modal header*/}
                            <div className="modal-header">
                                {/*begin::Modal title*/}
                                <h2 className="fw-bold" data-kt-calendar="title">Add Event</h2>
                                {/*end::Modal title*/}
                                {/*begin::Close*/}
                                <div className="btn btn-icon btn-sm btn-active-icon-primary" id="kt_modal_add_event_close">
                                    <i className="ki-outline ki-cross fs-1"></i>
                                </div>
                                {/*end::Close*/}
                            </div>
                            {/*end::Modal header*/}
                            {/*begin::Modal body*/}
                            <div className="modal-body py-10 px-lg-17">
                                {/*begin::Input group*/}
                                <div className="fv-row mb-9">
                                    {/*begin::Label*/}
                                    <label className="fs-6 fw-semibold required mb-2">Event Name</label>
                                    {/*end::Label*/}
                                    {/*begin::Input*/}
                                    <input type="text" className="form-control form-control-solid" placeholder="" name="calendar_event_name" />
                                    {/*end::Input*/}
                                </div>
                                {/*end::Input group*/}
                                {/*begin::Input group*/}
                                <div className="fv-row mb-9">
                                    {/*begin::Label*/}
                                    <label className="fs-6 fw-semibold mb-2">Event Description</label>
                                    {/*end::Label*/}
                                    {/*begin::Input*/}
                                    <input type="text" className="form-control form-control-solid" placeholder="" name="calendar_event_description" />
                                    {/*end::Input*/}
                                </div>
                                {/*end::Input group*/}
                                {/*begin::Input group*/}
                                <div className="fv-row mb-9">
                                    {/*begin::Label*/}
                                    <label className="fs-6 fw-semibold mb-2">Event Location</label>
                                    {/*end::Label*/}
                                    {/*begin::Input*/}
                                    <input type="text" className="form-control form-control-solid" placeholder="" name="calendar_event_location" />
                                    {/*end::Input*/}
                                </div>
                                {/*end::Input group*/}
                                {/*begin::Input group*/}
                                <div className="fv-row mb-9">
                                    {/*begin::Checkbox*/}
                                    <label className="form-check form-check-custom form-check-solid">
                                        <input className="form-check-input" type="checkbox" value="" id="kt_calendar_datepicker_allday" />
                                        <span className="form-check-label fw-semibold">All Day</span>
                                    </label>
                                    {/*end::Checkbox*/}
                                </div>
                                {/*end::Input group*/}
                                {/*begin::Input group*/}
                                <div className="row row-cols-lg-2 g-10">
                                    <div className="col">
                                        <div className="fv-row mb-9">
                                            {/*begin::Label*/}
                                            <label className="fs-6 fw-semibold mb-2 required">Event Start Date</label>
                                            {/*end::Label*/}
                                            {/*begin::Input*/}
                                            <input className="form-control form-control-solid" name="calendar_event_start_date" placeholder="Pick a start date" id="kt_calendar_datepicker_start_date" />
                                            {/*end::Input*/}
                                        </div>
                                    </div>
                                    <div className="col" data-kt-calendar="datepicker">
                                        <div className="fv-row mb-9">
                                            {/*begin::Label*/}
                                            <label className="fs-6 fw-semibold mb-2">Event Start Time</label>
                                            {/*end::Label*/}
                                            {/*begin::Input*/}
                                            <input className="form-control form-control-solid" name="calendar_event_start_time" placeholder="Pick a start time" id="kt_calendar_datepicker_start_time" />
                                            {/*end::Input*/}
                                        </div>
                                    </div>
                                </div>
                                {/*end::Input group*/}
                                {/*begin::Input group*/}
                                <div className="row row-cols-lg-2 g-10">
                                    <div className="col">
                                        <div className="fv-row mb-9">
                                            {/*begin::Label*/}
                                            <label className="fs-6 fw-semibold mb-2 required">Event End Date</label>
                                            {/*end::Label*/}
                                            {/*begin::Input*/}
                                            <input className="form-control form-control-solid" name="calendar_event_end_date" placeholder="Pick a end date" id="kt_calendar_datepicker_end_date" />
                                            {/*end::Input*/}
                                        </div>
                                    </div>
                                    <div className="col" data-kt-calendar="datepicker">
                                        <div className="fv-row mb-9">
                                            {/*begin::Label*/}
                                            <label className="fs-6 fw-semibold mb-2">Event End Time</label>
                                            {/*end::Label*/}
                                            {/*begin::Input*/}
                                            <input className="form-control form-control-solid" name="calendar_event_end_time" placeholder="Pick a end time" id="kt_calendar_datepicker_end_time" />
                                            {/*end::Input*/}
                                        </div>
                                    </div>
                                </div>
                                {/*end::Input group*/}
                            </div>
                            {/*end::Modal body*/}
                            {/*begin::Modal footer*/}
                            <div className="modal-footer flex-center">
                                {/*begin::Button*/}
                                <button type="reset" id="kt_modal_add_event_cancel" className="btn btn-light me-3">Cancel</button>
                                {/*end::Button*/}
                                {/*begin::Button*/}
                                <button type="button" id="kt_modal_add_event_submit" className="btn btn-primary">
                                    <span className="indicator-label">Submit</span>
                                    <span className="indicator-progress">Please wait...
                                        <span className="spinner-border spinner-border-sm align-middle ms-2"></span></span>
                                </button>
                                {/*end::Button*/}
                            </div>
                            {/*end::Modal footer*/}
                        </form>
                        {/*end::Form*/}
                    </div>
                </div>
            </div>
            {/*end::Modal - New Product*/}

            {/*begin::Modal - View Event*/}
            <div className="modal fade" id="kt_modal_view_event" tabIndex={-1} data-bs-focus="false" aria-hidden="true">
                {/*begin::Modal dialog*/}
                <div className="modal-dialog modal-dialog-centered mw-650px">
                    {/*begin::Modal content*/}
                    <div className="modal-content">
                        {/*begin::Modal header*/}
                        <div className="modal-header border-0 justify-content-end">
                            {/*begin::Edit*/}
                            <div className="btn btn-icon btn-sm btn-color-gray-500 btn-active-icon-primary me-2" data-bs-toggle="tooltip" data-bs-dismiss="click" title="Edit Event" id="kt_modal_view_event_edit">
                                <i className="ki-outline ki-pencil fs-2"></i>
                            </div>
                            {/*end::Edit*/}
                            {/*begin::Edit*/}
                            <div className="btn btn-icon btn-sm btn-color-gray-500 btn-active-icon-danger me-2" data-bs-toggle="tooltip" data-bs-dismiss="click" title="Delete Event" id="kt_modal_view_event_delete">
                                <i className="ki-outline ki-trash fs-2"></i>
                            </div>
                            {/*end::Edit*/}
                            {/*begin::Close*/}
                            <div className="btn btn-icon btn-sm btn-color-gray-500 btn-active-icon-primary" data-bs-toggle="tooltip" title="Hide Event" data-bs-dismiss="modal">
                                <i className="ki-outline ki-cross fs-2x"></i>
                            </div>
                            {/*end::Close*/}
                        </div>
                        {/*end::Modal header*/}
                        {/*begin::Modal body*/}
                        <div className="modal-body pt-0 pb-20 px-lg-17">
                            {/*begin::Row*/}
                            <div className="d-flex">
                                {/*begin::Icon*/}
                                <i className="ki-outline ki-calendar-8 fs-1 text-muted me-5"></i>
                                {/*end::Icon*/}
                                <div className="mb-9">
                                    {/*begin::Event name*/}
                                    <div className="d-flex align-items-center mb-2">
                                        <span className="fs-3 fw-bold me-3" data-kt-calendar="event_name"></span>
                                        <span className="badge badge-light-success" data-kt-calendar="all_day"></span>
                                    </div>
                                    {/*end::Event name*/}
                                    {/*begin::Event description*/}
                                    <div className="fs-6" data-kt-calendar="event_description"></div>
                                    {/*end::Event description*/}
                                </div>
                            </div>
                            {/*end::Row*/}
                            {/*begin::Row*/}
                            <div className="d-flex align-items-center mb-2">
                                {/*begin::Bullet*/}
                                <span className="bullet bullet-dot h-10px w-10px bg-success ms-2 me-7"></span>
                                {/*end::Bullet*/}
                                {/*begin::Event start date/time*/}
                                <div className="fs-6">
                                    <span className="fw-bold">Starts</span>
                                    <span data-kt-calendar="event_start_date"></span>
                                </div>
                                {/*end::Event start date/time*/}
                            </div>
                            {/*end::Row*/}
                            {/*begin::Row*/}
                            <div className="d-flex align-items-center mb-9">
                                {/*begin::Bullet*/}
                                <span className="bullet bullet-dot h-10px w-10px bg-danger ms-2 me-7"></span>
                                {/*end::Bullet*/}
                                {/*begin::Event end date/time*/}
                                <div className="fs-6">
                                    <span className="fw-bold">Ends</span>
                                    <span data-kt-calendar="event_end_date"></span>
                                </div>
                                {/*end::Event end date/time*/}
                            </div>
                            {/*end::Row*/}
                            {/*begin::Row*/}
                            <div className="d-flex align-items-center">
                                {/*begin::Icon*/}
                                <i className="ki-outline ki-geolocation fs-1 text-muted me-5"></i>
                                {/*end::Icon*/}
                                {/*begin::Event location*/}
                                <div className="fs-6" data-kt-calendar="event_location"></div>
                                {/*end::Event location*/}
                            </div>
                            {/*end::Row*/}
                        </div>
                        {/*end::Modal body*/}
                    </div>
                </div>
            </div>
            {/*end::Modal - View Event*/}
        </div>
    );
};

export default CalendarTab;
