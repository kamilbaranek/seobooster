import React, { useEffect } from "react";
import AppHeader from "./AppHeader";
import AppSidebar from "./AppSidebar";
import AppFooter from "./AppFooter";

export interface DashboardWeb {
  id: string;
  url: string;
  nickname?: string | null;
  faviconUrl?: string | null;
  faviconStatus?: "PENDING" | "SUCCESS" | "FAILED";
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  webs: DashboardWeb[];
}

const BODY_ATTRIBUTES: Record<string, string> = {
  "data-kt-app-header-fixed": "true",
  "data-kt-app-header-fixed-mobile": "true",
  "data-kt-app-sidebar-enabled": "true",
  "data-kt-app-sidebar-fixed": "true",
  "data-kt-app-sidebar-push-toolbar": "true",
  "data-kt-app-sidebar-push-footer": "true",
};

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  webs,
}) => {
  useEffect(() => {
    const body = document.body;
    const previous = {
      id: body.id,
      className: body.className,
      attributes: new Map<string, string | null>(),
    };

    body.id = "kt_app_body";
    body.className = "app-default";
    Object.entries(BODY_ATTRIBUTES).forEach(([key, value]) => {
      previous.attributes.set(key, body.getAttribute(key));
      body.setAttribute(key, value);
    });

    return () => {
      body.id = previous.id;
      body.className = previous.className;
      Object.entries(BODY_ATTRIBUTES).forEach(([key]) => {
        const prev = previous.attributes.get(key);
        if (prev) {
          body.setAttribute(key, prev);
        } else {
          body.removeAttribute(key);
        }
      });
    };
  }, []);

  return (
    <div className="d-flex flex-column flex-root app-root" id="kt_app_root">
      <div className="app-page flex-column flex-column-fluid" id="kt_app_page">
        <AppHeader webs={webs} />
        <div
          className="app-wrapper flex-column flex-row-fluid"
          id="kt_app_wrapper"
        >
          <AppSidebar />
          <div className="app-main flex-column flex-row-fluid" id="kt_app_main">
            <div className="d-flex flex-column flex-column-fluid">
              <div
                id="kt_app_content"
                className="app-content flex-column-fluid"
              >
                <div
                  id="kt_app_content_container"
                  className="app-container container-fluid"
                >
                  {children}
                </div>
              </div>
              <AppFooter />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
