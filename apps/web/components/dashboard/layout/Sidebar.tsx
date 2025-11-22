import React, { useEffect, useRef, useState } from 'react';
import { apiFetch } from '../../../lib/api-client';
import useSidebarInteractions from '../hooks/useSidebarInteractions';

const Sidebar = () => {
  const menuRef = useRef<HTMLDivElement | null>(null);
  useSidebarInteractions(menuRef);
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    const fetchRole = async () => {
      try {
        const me = await apiFetch<{ user: { role?: string } }>('/me');
        if (!active) return;
        setIsSuperAdmin(me.user.role === 'SUPERADMIN');
      } catch (err) {
        if (active) setIsSuperAdmin(false);
      }
    };
    fetchRole();
    return () => {
      active = false;
    };
  }, []);

  if (isSuperAdmin !== true) {
    return null;
  }

  return (
    <div
      id="kt_app_sidebar"
      className="app-sidebar"
      data-kt-drawer="true"
      data-kt-drawer-name="app-sidebar"
      data-kt-drawer-activate="{default: true, lg: false}"
      data-kt-drawer-overlay="true"
      data-kt-drawer-width="auto"
      data-kt-drawer-direction="start"
      data-kt-drawer-toggle="#kt_app_sidebar_mobile_toggle"
    >
      <div
        id="kt_aside_menu_wrapper"
        className="app-sidebar-menu flex-grow-1 hover-scroll-y scroll-lg-ps my-5 pt-8"
        data-kt-scroll="true"
        data-kt-scroll-height="auto"
        data-kt-scroll-dependencies="#kt_app_sidebar_logo, #kt_app_sidebar_footer"
        data-kt-scroll-wrappers="#kt_app_sidebar_menu"
        data-kt-scroll-offset="5px"
        ref={menuRef}
      >
        <div
          id="kt_aside_menu"
          className="menu menu-rounded menu-column menu-title-gray-600 menu-state-primary menu-state-icon-primary menu-state-bullet-primary menu-arrow-gray-500 fw-semibold fs-6"
          data-kt-menu="true"
        >
          <div
            data-kt-menu-trigger="{default: 'click', lg: 'hover'}"
            data-kt-menu-placement="right-start"
            className="menu-item here show py-2"
          >
            <span className="menu-link menu-center">
              <span className="menu-icon me-0">
                <i className="ki-outline ki-setting-2 fs-1" />
              </span>
              <span className="menu-title ms-2">Admin</span>
            </span>
            <div className="menu-sub menu-sub-dropdown px-2 py-4 w-250px mh-75 overflow-auto">
              <div className="menu-item">
                <div className="menu-content">
                  <span className="menu-section fs-5 fw-bolder ps-1 py-1">Admin</span>
                </div>
              </div>
              <div className="menu-item">
                <a className="menu-link" href="/dashboard/admin">
                  <span className="menu-bullet">
                    <span className="bullet bullet-dot" />
                  </span>
                  <span className="menu-title">Dashboard</span>
                </a>
              </div>
              <div className="menu-item">
                <a className="menu-link" href="/dashboard/admin/prompts">
                  <span className="menu-bullet">
                    <span className="bullet bullet-dot" />
                  </span>
                  <span className="menu-title">Prompts</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
