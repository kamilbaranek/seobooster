import React, { useEffect, useState, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventDropArg, EventInput } from '@fullcalendar/core';
import { apiFetch } from '../../../lib/api-client';
import Swal from 'sweetalert2';

interface Web {
    id: string;
    nickname: string | null;
    url: string;
}

interface ArticlePlan {
    id: string;
    webId: string;
    web: Web;
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
    autoPublishMode?: string;
}

interface UnifiedCalendarProps {
    plans: ArticlePlan[];
    onUpdate?: () => void;
}

const COLORS = [
    '#3E97FF', // Primary (Blue)
    '#7239EA', // Purple
    '#50CD89', // Success (Green)
    '#F6C000', // Warning (Yellow)
    '#F1416C', // Danger (Red)
    '#009EF7', // Info (Cyan)
    '#BE0027', // Dark Red
    '#303030', // Dark
    '#FF6B6B', // Pastel Red
    '#4ECDC4', // Teal
    '#45B7D1', // Light Blue
    '#96CEB4', // Sage
    '#FFEEAD', // Cream
    '#D4A5A5', // Dusty Rose
    '#9B59B6', // Amethyst
    '#34495E', // Wet Asphalt
    '#16A085', // Green Sea
    '#27AE60', // Nephritis
    '#2980B9', // Belize Hole
    '#8E44AD', // Wisteria
];

const UnifiedCalendar: React.FC<UnifiedCalendarProps> = ({ plans, onUpdate }) => {
    const [events, setEvents] = useState<EventInput[]>([]);

    // Assign colors to webs
    const webColors = useMemo(() => {
        const uniqueWebIds = Array.from(new Set(plans.map(p => p.webId)));
        const mapping: Record<string, string> = {};
        uniqueWebIds.forEach((webId, index) => {
            mapping[webId] = COLORS[index % COLORS.length];
        });
        return mapping;
    }, [plans]);

    // Get unique webs for legend
    const uniqueWebs = useMemo(() => {
        const map = new Map<string, Web>();
        plans.forEach(p => {
            if (!map.has(p.webId)) {
                map.set(p.webId, p.web);
            }
        });
        return Array.from(map.values());
    }, [plans]);

    useEffect(() => {
        const mapped = plans.map((plan) => ({
            id: plan.id,
            title: plan.articleTitle,
            start: plan.plannedPublishAt,
            allDay: false,
            backgroundColor: webColors[plan.webId],
            borderColor: webColors[plan.webId],
            editable: plan.status === 'PLANNED',
            extendedProps: {
                status: plan.status,
                description: plan.articleFunnelStage,
                webName: plan.web.nickname || plan.web.url,
                webId: plan.webId,
                autoPublishMode: plan.autoPublishMode
            }
        }));
        setEvents(mapped);
    }, [plans, webColors]);

    const handleEventDrop = async (info: EventDropArg) => {
        const webId = info.event.extendedProps.webId;
        const newStart = info.event.start;

        if (!newStart || !webId) {
            info.revert();
            return;
        }

        // Optimistic update
        setEvents((prev) =>
            prev.map((ev) =>
                ev.id === info.event.id ? { ...ev, start: newStart.toISOString() } : ev
            )
        );

        try {
            await apiFetch(`/webs/${webId}/article-plans/${info.event.id}`, {
                method: 'PATCH',
                body: JSON.stringify({ plannedPublishAt: newStart.toISOString() })
            });
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Failed to update plan date', error);
            info.revert();
            Swal.fire({
                text: "Failed to update event date.",
                icon: "error",
                buttonsStyling: false,
                confirmButtonText: "Ok",
                customClass: {
                    confirmButton: "btn btn-primary"
                }
            });
        }
    };

    return (
        <div className="card">
            <div className="card-header">
                <h2 className="card-title fw-bold">Global Content Calendar</h2>
            </div>
            <div className="card-body">
                <div id="kt_calendar_app">
                    <style>{`
                        .fc-event {
                            cursor: pointer;
                            border: 0;
                            border-radius: 4px;
                            padding: 2px 4px;
                            font-size: 0.85rem; /* Smaller font */
                            font-weight: 500;
                            transition: filter 120ms ease;
                            max-width: 100%;
                            color: #fff !important;
                        }
                        .fc-event.fc-event-dragging { cursor: grabbing; }
                        .fc-event:hover { filter: brightness(1.1); }
                        
                        /* Compact day cells */
                        .fc-daygrid-day-frame {
                            min-height: 100px !important;
                        }

                        /* Dark mode overrides */
                        [data-bs-theme="dark"] .fc-theme-standard th {
                            background-color: #15171c !important;
                            border-color: #2b2b40 !important;
                            color: #e1e3ea !important;
                        }
                        [data-bs-theme="dark"] .fc-theme-standard .fc-scrollgrid,
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
                        [data-bs-theme="dark"] .fc-toolbar-title,
                        [data-bs-theme="dark"] .fc-daygrid-day-top,
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
                        eventDrop={handleEventDrop}
                        eventContent={(arg) => {
                            const isAutoPublish = arg.event.extendedProps.autoPublishMode === 'auto_publish';
                            return (
                                <div className="d-flex flex-column overflow-hidden">
                                    <div className="text-truncate fw-bold">
                                        {isAutoPublish ? '⚡ ' : '📝 '}
                                        {arg.event.title}
                                    </div>
                                    <div className="d-flex align-items-center gap-1 opacity-75" style={{ fontSize: '0.7em' }}>
                                        <span className="text-truncate">{arg.event.extendedProps.webName}</span>
                                    </div>
                                </div>
                            );
                        }}
                    />
                </div>

                {/* Legend */}
                <div className="mt-10 border-top pt-5">
                    <h3 className="fs-6 fw-bold text-gray-700 mb-4">Projects Legend</h3>
                    <div className="d-flex flex-wrap gap-4">
                        {uniqueWebs.map(web => (
                            <div key={web.id} className="d-flex align-items-center">
                                <span
                                    className="w-15px h-15px rounded-circle me-2"
                                    style={{ backgroundColor: webColors[web.id] }}
                                ></span>
                                <span className="text-gray-600 fs-7 fw-semibold">
                                    {web.nickname || web.url}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UnifiedCalendar;
