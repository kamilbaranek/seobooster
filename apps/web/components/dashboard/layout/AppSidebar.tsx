import React, { useEffect, useRef, useState } from "react";
import useSidebarInteractions from "../hooks/useSidebarInteractions";
import useThemeMode from "../hooks/useThemeMode";
import { positionDropdown } from "../utils/positionDropdown";

const AppSidebar = () => {
  const menuRef = useRef<HTMLDivElement | null>(null);
  useSidebarInteractions(menuRef);
  const { mode, setMode, modes } = useThemeMode();
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const themeToggleRef = useRef<HTMLButtonElement | null>(null);
  const themeMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!themeMenuOpen || !themeToggleRef.current || !themeMenuRef.current) {
      themeMenuRef.current?.classList.remove("show");
      return;
    }

    themeMenuRef.current.classList.add("show");
    positionDropdown(
      themeToggleRef.current,
      themeMenuRef.current,
      "top-start",
      themeToggleRef.current.getAttribute("data-kt-menu-offset"),
    );
  }, [themeMenuOpen]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) {
        return;
      }

      if (
        themeMenuRef.current?.contains(event.target) ||
        themeToggleRef.current?.contains(event.target)
      ) {
        return;
      }

      setThemeMenuOpen(false);
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

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
      {/*begin::Primary menu*/}
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
        {/*begin::Menu*/}
        <div
          id="kt_aside_menu"
          className="menu menu-rounded menu-column menu-title-gray-600 menu-state-primary menu-state-icon-primary menu-state-bullet-primary menu-arrow-gray-500 fw-semibold fs-6"
          data-kt-menu="true"
        >
          {/*begin:Menu item*/}
          <div
            data-kt-menu-trigger="{default: 'click', lg: 'hover'}"
            data-kt-menu-placement="right-start"
            className="menu-item here show py-2"
          >
            {/*begin:Menu link*/}
            <span className="menu-link menu-center">
              <span className="menu-icon me-0">
                <i className="ki-outline ki-home-2 fs-1" />
              </span>
            </span>
            {/*end:Menu link*/}
            {/*begin:Menu sub*/}
            <div className="menu-sub menu-sub-dropdown px-2 py-4 w-250px mh-75 overflow-auto">
              {/*begin:Menu item*/}
              <div className="menu-item">
                {/*begin:Menu content*/}
                <div className="menu-content">
                  <span className="menu-section fs-5 fw-bolder ps-1 py-1">
                    Home
                  </span>
                </div>
                {/*end:Menu content*/}
              </div>
              {/*end:Menu item*/}
              {/*begin:Menu item*/}
              <div className="menu-item">
                {/*begin:Menu link*/}
                <a className="menu-link active" href="/dashboard">
                  <span className="menu-bullet">
                    <span className="bullet bullet-dot" />
                  </span>
                  <span className="menu-title">Default</span>
                </a>
                {/*end:Menu link*/}
              </div>
              {/*end:Menu item*/}
              {/*begin:Menu item*/}
              <div className="menu-item">
                {/*begin:Menu link*/}
                <a className="menu-link" href="#">
                  <span className="menu-bullet">
                    <span className="bullet bullet-dot" />
                  </span>
                  <span className="menu-title">eCommerce</span>
                </a>
                {/*end:Menu link*/}
              </div>
              {/*end:Menu item*/}
              {/*begin:Menu item*/}
              <div className="menu-item">
                {/*begin:Menu link*/}
                <a className="menu-link" href="#">
                  <span className="menu-bullet">
                    <span className="bullet bullet-dot" />
                  </span>
                  <span className="menu-title">Projects</span>
                </a>
                {/*end:Menu link*/}
              </div>
              {/*end:Menu item*/}
              {/*begin:Menu item*/}
              <div className="menu-item">
                {/*begin:Menu link*/}
                <a className="menu-link" href="#">
                  <span className="menu-bullet">
                    <span className="bullet bullet-dot" />
                  </span>
                  <span className="menu-title">Online Courses</span>
                </a>
                {/*end:Menu link*/}
              </div>
              {/*end:Menu item*/}
              {/*begin:Menu item*/}
              <div className="menu-item">
                {/*begin:Menu link*/}
                <a className="menu-link" href="#">
                  <span className="menu-bullet">
                    <span className="bullet bullet-dot" />
                  </span>
                  <span className="menu-title">Marketing</span>
                </a>
                {/*end:Menu link*/}
              </div>
              {/*end:Menu item*/}
              <div
                className="menu-inner flex-column collapse"
                id="kt_app_sidebar_menu_dashboards_collapse"
              >
                {/*begin:Menu item*/}
                <div className="menu-item">
                  {/*begin:Menu link*/}
                  <a className="menu-link" href="#">
                    <span className="menu-bullet">
                      <span className="bullet bullet-dot" />
                    </span>
                    <span className="menu-title">Bidding</span>
                  </a>
                  {/*end:Menu link*/}
                </div>
                {/*end:Menu item*/}
                {/*begin:Menu item*/}
                <div className="menu-item">
                  {/*begin:Menu link*/}
                  <a className="menu-link" href="#">
                    <span className="menu-bullet">
                      <span className="bullet bullet-dot" />
                    </span>
                    <span className="menu-title">POS System</span>
                  </a>
                  {/*end:Menu link*/}
                </div>
                {/*end:Menu item*/}
                {/*begin:Menu item*/}
                <div className="menu-item">
                  {/*begin:Menu link*/}
                  <a className="menu-link" href="#">
                    <span className="menu-bullet">
                      <span className="bullet bullet-dot" />
                    </span>
                    <span className="menu-title">Call Center</span>
                  </a>
                  {/*end:Menu link*/}
                </div>
                {/*end:Menu item*/}
                {/*begin:Menu item*/}
                <div className="menu-item">
                  {/*begin:Menu link*/}
                  <a className="menu-link" href="#">
                    <span className="menu-bullet">
                      <span className="bullet bullet-dot" />
                    </span>
                    <span className="menu-title">Logistics</span>
                  </a>
                  {/*end:Menu link*/}
                </div>
                {/*end:Menu item*/}
                {/*begin:Menu item*/}
                <div className="menu-item">
                  {/*begin:Menu link*/}
                  <a className="menu-link" href="#">
                    <span className="menu-bullet">
                      <span className="bullet bullet-dot" />
                    </span>
                    <span className="menu-title">Website Analytics</span>
                  </a>
                  {/*end:Menu link*/}
                </div>
                {/*end:Menu item*/}
                {/*begin:Menu item*/}
                <div className="menu-item">
                  {/*begin:Menu link*/}
                  <a className="menu-link" href="#">
                    <span className="menu-bullet">
                      <span className="bullet bullet-dot" />
                    </span>
                    <span className="menu-title">Finance Performance</span>
                  </a>
                  {/*end:Menu link*/}
                </div>
                {/*end:Menu item*/}
                {/*begin:Menu item*/}
                <div className="menu-item">
                  {/*begin:Menu link*/}
                  <a className="menu-link" href="#">
                    <span className="menu-bullet">
                      <span className="bullet bullet-dot" />
                    </span>
                    <span className="menu-title">Store Analytics</span>
                  </a>
                  {/*end:Menu link*/}
                </div>
                {/*end:Menu item*/}
                {/*begin:Menu item*/}
                <div className="menu-item">
                  {/*begin:Menu link*/}
                  <a className="menu-link" href="#">
                    <span className="menu-bullet">
                      <span className="bullet bullet-dot" />
                    </span>
                    <span className="menu-title">Social</span>
                  </a>
                  {/*end:Menu link*/}
                </div>
                {/*end:Menu item*/}
                {/*begin:Menu item*/}
                <div className="menu-item">
                  {/*begin:Menu link*/}
                  <a className="menu-link" href="#">
                    <span className="menu-bullet">
                      <span className="bullet bullet-dot" />
                    </span>
                    <span className="menu-title">Delivery</span>
                  </a>
                  {/*end:Menu link*/}
                </div>
                {/*end:Menu item*/}
                {/*begin:Menu item*/}
                <div className="menu-item">
                  {/*begin:Menu link*/}
                  <a className="menu-link" href="#">
                    <span className="menu-bullet">
                      <span className="bullet bullet-dot" />
                    </span>
                    <span className="menu-title">Crypto</span>
                  </a>
                  {/*end:Menu link*/}
                </div>
                {/*end:Menu item*/}
                {/*begin:Menu item*/}
                <div className="menu-item">
                  {/*begin:Menu link*/}
                  <a className="menu-link" href="#">
                    <span className="menu-bullet">
                      <span className="bullet bullet-dot" />
                    </span>
                    <span className="menu-title">School</span>
                  </a>
                  {/*end:Menu link*/}
                </div>
                {/*end:Menu item*/}
                {/*begin:Menu item*/}
                <div className="menu-item">
                  {/*begin:Menu link*/}
                  <a className="menu-link" href="#">
                    <span className="menu-bullet">
                      <span className="bullet bullet-dot" />
                    </span>
                    <span className="menu-title">Podcast</span>
                  </a>
                  {/*end:Menu link*/}
                </div>
                {/*end:Menu item*/}
                {/*begin:Menu item*/}
                <div className="menu-item">
                  {/*begin:Menu link*/}
                  <a className="menu-link" href="#">
                    <span className="menu-bullet">
                      <span className="bullet bullet-dot" />
                    </span>
                    <span className="menu-title">Landing</span>
                  </a>
                  {/*end:Menu link*/}
                </div>
                {/*end:Menu item*/}
              </div>
              <div className="menu-item">
                <div className="menu-content">
                  <a
                    className="btn btn-flex btn-color-primary d-flex flex-stack fs-base p-0 ms-2 mb-2 toggle collapsible collapsed"
                    data-bs-toggle="collapse"
                    href="#kt_app_sidebar_menu_dashboards_collapse"
                    data-kt-toggle-text="Show Less"
                  >
                    <span data-kt-toggle-text-target="true">Show 12 More</span>
                    <i className="ki-outline ki-minus-square toggle-on fs-2 me-0" />
                    <i className="ki-outline ki-plus-square toggle-off fs-2 me-0" />
                  </a>
                </div>
              </div>
            </div>
            {/*end:Menu sub*/}
          </div>
          {/*end:Menu item*/}
          {/*begin:Menu item*/}
          <div
            data-kt-menu-trigger="{default: 'click', lg: 'hover'}"
            data-kt-menu-placement="right-start"
            className="menu-item py-2"
          >
            {/*begin:Menu link*/}
            <span className="menu-link menu-center">
              <span className="menu-icon me-0">
                <i className="ki-outline ki-notification-status fs-1" />
              </span>
            </span>
            {/*end:Menu link*/}
            {/*begin:Menu sub*/}
            <div className="menu-sub menu-sub-dropdown menu-sub-indention px-2 py-4 w-250px mh-75 overflow-auto">
              {/*begin:Menu item*/}
              <div className="menu-item">
                {/*begin:Menu content*/}
                <div className="menu-content">
                  <span className="menu-section fs-5 fw-bolder ps-1 py-1">
                    Pages
                  </span>
                </div>
                {/*end:Menu content*/}
              </div>
              {/*end:Menu item*/}
              {/*begin:Menu item*/}
              <div
                data-kt-menu-trigger="click"
                className="menu-item menu-accordion"
              >
                {/*begin:Menu link*/}
                <span className="menu-link">
                  <span className="menu-bullet">
                    <span className="bullet bullet-dot" />
                  </span>
                  <span className="menu-title">User Profile</span>
                  <span className="menu-arrow" />
                </span>
                {/*end:Menu link*/}
                {/*begin:Menu sub*/}
                <div className="menu-sub menu-sub-accordion">
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Overview</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Projects</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Campaigns</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Documents</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Followers</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Activity</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                </div>
                {/*end:Menu sub*/}
              </div>
              {/*end:Menu item*/}
              {/*begin:Menu item*/}
              <div
                data-kt-menu-trigger="click"
                className="menu-item menu-accordion"
              >
                {/*begin:Menu link*/}
                <span className="menu-link">
                  <span className="menu-bullet">
                    <span className="bullet bullet-dot" />
                  </span>
                  <span className="menu-title">Account</span>
                  <span className="menu-arrow" />
                </span>
                {/*end:Menu link*/}
                {/*begin:Menu sub*/}
                <div className="menu-sub menu-sub-accordion">
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Overview</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Settings</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Security</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Activity</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Billing</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Statements</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Referrals</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">API Keys</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Logs</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                </div>
                {/*end:Menu sub*/}
              </div>
              {/*end:Menu item*/}
              {/*begin:Menu item*/}
              <div
                data-kt-menu-trigger="click"
                className="menu-item menu-accordion"
              >
                {/*begin:Menu link*/}
                <span className="menu-link">
                  <span className="menu-bullet">
                    <span className="bullet bullet-dot" />
                  </span>
                  <span className="menu-title">Authentication</span>
                  <span className="menu-arrow" />
                </span>
                {/*end:Menu link*/}
                {/*begin:Menu sub*/}
                <div className="menu-sub menu-sub-accordion">
                  {/*begin:Menu item*/}
                  <div
                    data-kt-menu-trigger="click"
                    className="menu-item menu-accordion"
                  >
                    {/*begin:Menu link*/}
                    <span className="menu-link">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Corporate Layout</span>
                      <span className="menu-arrow" />
                    </span>
                    {/*end:Menu link*/}
                    {/*begin:Menu sub*/}
                    <div className="menu-sub menu-sub-accordion menu-active-bg">
                      {/*begin:Menu item*/}
                      <div className="menu-item">
                        {/*begin:Menu link*/}
                        <a className="menu-link" href="#">
                          <span className="menu-bullet">
                            <span className="bullet bullet-dot" />
                          </span>
                          <span className="menu-title">Sign-in</span>
                        </a>
                        {/*end:Menu link*/}
                      </div>
                      {/*end:Menu item*/}
                      {/*begin:Menu item*/}
                      <div className="menu-item">
                        {/*begin:Menu link*/}
                        <a className="menu-link" href="#">
                          <span className="menu-bullet">
                            <span className="bullet bullet-dot" />
                          </span>
                          <span className="menu-title">Sign-up</span>
                        </a>
                        {/*end:Menu link*/}
                      </div>
                      {/*end:Menu item*/}
                      {/*begin:Menu item*/}
                      <div className="menu-item">
                        {/*begin:Menu link*/}
                        <a className="menu-link" href="#">
                          <span className="menu-bullet">
                            <span className="bullet bullet-dot" />
                          </span>
                          <span className="menu-title">Two-Factor</span>
                        </a>
                        {/*end:Menu link*/}
                      </div>
                      {/*end:Menu item*/}
                      {/*begin:Menu item*/}
                      <div className="menu-item">
                        {/*begin:Menu link*/}
                        <a className="menu-link" href="#">
                          <span className="menu-bullet">
                            <span className="bullet bullet-dot" />
                          </span>
                          <span className="menu-title">Reset Password</span>
                        </a>
                        {/*end:Menu link*/}
                      </div>
                      {/*end:Menu item*/}
                      {/*begin:Menu item*/}
                      <div className="menu-item">
                        {/*begin:Menu link*/}
                        <a className="menu-link" href="#">
                          <span className="menu-bullet">
                            <span className="bullet bullet-dot" />
                          </span>
                          <span className="menu-title">New Password</span>
                        </a>
                        {/*end:Menu link*/}
                      </div>
                      {/*end:Menu item*/}
                    </div>
                    {/*end:Menu sub*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div
                    data-kt-menu-trigger="click"
                    className="menu-item menu-accordion"
                  >
                    {/*begin:Menu link*/}
                    <span className="menu-link">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Overlay Layout</span>
                      <span className="menu-arrow" />
                    </span>
                    {/*end:Menu link*/}
                    {/*begin:Menu sub*/}
                    <div className="menu-sub menu-sub-accordion menu-active-bg">
                      {/*begin:Menu item*/}
                      <div className="menu-item">
                        {/*begin:Menu link*/}
                        <a className="menu-link" href="#">
                          <span className="menu-bullet">
                            <span className="bullet bullet-dot" />
                          </span>
                          <span className="menu-title">Sign-in</span>
                        </a>
                        {/*end:Menu link*/}
                      </div>
                      {/*end:Menu item*/}
                      {/*begin:Menu item*/}
                      <div className="menu-item">
                        {/*begin:Menu link*/}
                        <a className="menu-link" href="#">
                          <span className="menu-bullet">
                            <span className="bullet bullet-dot" />
                          </span>
                          <span className="menu-title">Sign-up</span>
                        </a>
                        {/*end:Menu link*/}
                      </div>
                      {/*end:Menu item*/}
                      {/*begin:Menu item*/}
                      <div className="menu-item">
                        {/*begin:Menu link*/}
                        <a className="menu-link" href="#">
                          <span className="menu-bullet">
                            <span className="bullet bullet-dot" />
                          </span>
                          <span className="menu-title">Two-Factor</span>
                        </a>
                        {/*end:Menu link*/}
                      </div>
                      {/*end:Menu item*/}
                      {/*begin:Menu item*/}
                      <div className="menu-item">
                        {/*begin:Menu link*/}
                        <a className="menu-link" href="#">
                          <span className="menu-bullet">
                            <span className="bullet bullet-dot" />
                          </span>
                          <span className="menu-title">Reset Password</span>
                        </a>
                        {/*end:Menu link*/}
                      </div>
                      {/*end:Menu item*/}
                      {/*begin:Menu item*/}
                      <div className="menu-item">
                        {/*begin:Menu link*/}
                        <a className="menu-link" href="#">
                          <span className="menu-bullet">
                            <span className="bullet bullet-dot" />
                          </span>
                          <span className="menu-title">New Password</span>
                        </a>
                        {/*end:Menu link*/}
                      </div>
                      {/*end:Menu item*/}
                    </div>
                    {/*end:Menu sub*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div
                    data-kt-menu-trigger="click"
                    className="menu-item menu-accordion"
                  >
                    {/*begin:Menu link*/}
                    <span className="menu-link">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Creative Layout</span>
                      <span className="menu-arrow" />
                    </span>
                    {/*end:Menu link*/}
                    {/*begin:Menu sub*/}
                    <div className="menu-sub menu-sub-accordion menu-active-bg">
                      {/*begin:Menu item*/}
                      <div className="menu-item">
                        {/*begin:Menu link*/}
                        <a className="menu-link" href="#">
                          <span className="menu-bullet">
                            <span className="bullet bullet-dot" />
                          </span>
                          <span className="menu-title">Sign-in</span>
                        </a>
                        {/*end:Menu link*/}
                      </div>
                      {/*end:Menu item*/}
                      {/*begin:Menu item*/}
                      <div className="menu-item">
                        {/*begin:Menu link*/}
                        <a className="menu-link" href="#">
                          <span className="menu-bullet">
                            <span className="bullet bullet-dot" />
                          </span>
                          <span className="menu-title">Sign-up</span>
                        </a>
                        {/*end:Menu link*/}
                      </div>
                      {/*end:Menu item*/}
                      {/*begin:Menu item*/}
                      <div className="menu-item">
                        {/*begin:Menu link*/}
                        <a className="menu-link" href="#">
                          <span className="menu-bullet">
                            <span className="bullet bullet-dot" />
                          </span>
                          <span className="menu-title">Two-Factor</span>
                        </a>
                        {/*end:Menu link*/}
                      </div>
                      {/*end:Menu item*/}
                      {/*begin:Menu item*/}
                      <div className="menu-item">
                        {/*begin:Menu link*/}
                        <a className="menu-link" href="#">
                          <span className="menu-bullet">
                            <span className="bullet bullet-dot" />
                          </span>
                          <span className="menu-title">Reset Password</span>
                        </a>
                        {/*end:Menu link*/}
                      </div>
                      {/*end:Menu item*/}
                      {/*begin:Menu item*/}
                      <div className="menu-item">
                        {/*begin:Menu link*/}
                        <a className="menu-link" href="#">
                          <span className="menu-bullet">
                            <span className="bullet bullet-dot" />
                          </span>
                          <span className="menu-title">New Password</span>
                        </a>
                        {/*end:Menu link*/}
                      </div>
                      {/*end:Menu item*/}
                    </div>
                    {/*end:Menu sub*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div
                    data-kt-menu-trigger="click"
                    className="menu-item menu-accordion"
                  >
                    {/*begin:Menu link*/}
                    <span className="menu-link">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Fancy Layout</span>
                      <span className="menu-arrow" />
                    </span>
                    {/*end:Menu link*/}
                    {/*begin:Menu sub*/}
                    <div className="menu-sub menu-sub-accordion menu-active-bg">
                      {/*begin:Menu item*/}
                      <div className="menu-item">
                        {/*begin:Menu link*/}
                        <a className="menu-link" href="#">
                          <span className="menu-bullet">
                            <span className="bullet bullet-dot" />
                          </span>
                          <span className="menu-title">Sign-in</span>
                        </a>
                        {/*end:Menu link*/}
                      </div>
                      {/*end:Menu item*/}
                      {/*begin:Menu item*/}
                      <div className="menu-item">
                        {/*begin:Menu link*/}
                        <a className="menu-link" href="#">
                          <span className="menu-bullet">
                            <span className="bullet bullet-dot" />
                          </span>
                          <span className="menu-title">Sign-up</span>
                        </a>
                        {/*end:Menu link*/}
                      </div>
                      {/*end:Menu item*/}
                      {/*begin:Menu item*/}
                      <div className="menu-item">
                        {/*begin:Menu link*/}
                        <a className="menu-link" href="#">
                          <span className="menu-bullet">
                            <span className="bullet bullet-dot" />
                          </span>
                          <span className="menu-title">Two-Factor</span>
                        </a>
                        {/*end:Menu link*/}
                      </div>
                      {/*end:Menu item*/}
                      {/*begin:Menu item*/}
                      <div className="menu-item">
                        {/*begin:Menu link*/}
                        <a className="menu-link" href="#">
                          <span className="menu-bullet">
                            <span className="bullet bullet-dot" />
                          </span>
                          <span className="menu-title">Reset Password</span>
                        </a>
                        {/*end:Menu link*/}
                      </div>
                      {/*end:Menu item*/}
                      {/*begin:Menu item*/}
                      <div className="menu-item">
                        {/*begin:Menu link*/}
                        <a className="menu-link" href="#">
                          <span className="menu-bullet">
                            <span className="bullet bullet-dot" />
                          </span>
                          <span className="menu-title">New Password</span>
                        </a>
                        {/*end:Menu link*/}
                      </div>
                      {/*end:Menu item*/}
                    </div>
                    {/*end:Menu sub*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div
                    data-kt-menu-trigger="click"
                    className="menu-item menu-accordion"
                  >
                    {/*begin:Menu link*/}
                    <span className="menu-link">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Email Templates</span>
                      <span className="menu-arrow" />
                    </span>
                    {/*end:Menu link*/}
                    {/*begin:Menu sub*/}
                    <div className="menu-sub menu-sub-accordion menu-active-bg">
                      {/*begin:Menu item*/}
                      <div className="menu-item">
                        {/*begin:Menu link*/}
                        <a className="menu-link" href="#">
                          <span className="menu-bullet">
                            <span className="bullet bullet-dot" />
                          </span>
                          <span className="menu-title">Welcome Message</span>
                        </a>
                        {/*end:Menu link*/}
                      </div>
                      {/*end:Menu item*/}
                      {/*begin:Menu item*/}
                      <div className="menu-item">
                        {/*begin:Menu link*/}
                        <a className="menu-link" href="#">
                          <span className="menu-bullet">
                            <span className="bullet bullet-dot" />
                          </span>
                          <span className="menu-title">Reset Password</span>
                        </a>
                        {/*end:Menu link*/}
                      </div>
                      {/*end:Menu item*/}
                      {/*begin:Menu item*/}
                      <div className="menu-item">
                        {/*begin:Menu link*/}
                        <a className="menu-link" href="#">
                          <span className="menu-bullet">
                            <span className="bullet bullet-dot" />
                          </span>
                          <span className="menu-title">
                            Subscription Confirmed
                          </span>
                        </a>
                        {/*end:Menu link*/}
                      </div>
                      {/*end:Menu item*/}
                      {/*begin:Menu item*/}
                      <div className="menu-item">
                        {/*begin:Menu link*/}
                        <a className="menu-link" href="#">
                          <span className="menu-bullet">
                            <span className="bullet bullet-dot" />
                          </span>
                          <span className="menu-title">
                            Credit Card Declined
                          </span>
                        </a>
                        {/*end:Menu link*/}
                      </div>
                      {/*end:Menu item*/}
                      {/*begin:Menu item*/}
                      <div className="menu-item">
                        {/*begin:Menu link*/}
                        <a className="menu-link" href="#">
                          <span className="menu-bullet">
                            <span className="bullet bullet-dot" />
                          </span>
                          <span className="menu-title">Promo 1</span>
                        </a>
                        {/*end:Menu link*/}
                      </div>
                      {/*end:Menu item*/}
                      {/*begin:Menu item*/}
                      <div className="menu-item">
                        {/*begin:Menu link*/}
                        <a className="menu-link" href="#">
                          <span className="menu-bullet">
                            <span className="bullet bullet-dot" />
                          </span>
                          <span className="menu-title">Promo 2</span>
                        </a>
                        {/*end:Menu link*/}
                      </div>
                      {/*end:Menu item*/}
                      {/*begin:Menu item*/}
                      <div className="menu-item">
                        {/*begin:Menu link*/}
                        <a className="menu-link" href="#">
                          <span className="menu-bullet">
                            <span className="bullet bullet-dot" />
                          </span>
                          <span className="menu-title">Promo 3</span>
                        </a>
                        {/*end:Menu link*/}
                      </div>
                      {/*end:Menu item*/}
                    </div>
                    {/*end:Menu sub*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Multi-steps Sign-up</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Welcome Message</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Verify Email</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Coming Soon</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Password Confirmation</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Account Deactivation</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Error 404</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Error 500</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                </div>
                {/*end:Menu sub*/}
              </div>
              {/*end:Menu item*/}
              {/*begin:Menu item*/}
              <div
                data-kt-menu-trigger="click"
                className="menu-item menu-accordion"
              >
                {/*begin:Menu link*/}
                <span className="menu-link">
                  <span className="menu-bullet">
                    <span className="bullet bullet-dot" />
                  </span>
                  <span className="menu-title">Corporate</span>
                  <span className="menu-arrow" />
                </span>
                {/*end:Menu link*/}
                {/*begin:Menu sub*/}
                <div className="menu-sub menu-sub-accordion">
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">About</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Our Team</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Contact Us</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Licenses</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Sitemap</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                </div>
                {/*end:Menu sub*/}
              </div>
              {/*end:Menu item*/}
              {/*begin:Menu item*/}
              <div
                data-kt-menu-trigger="click"
                className="menu-item menu-accordion"
              >
                {/*begin:Menu link*/}
                <span className="menu-link">
                  <span className="menu-bullet">
                    <span className="bullet bullet-dot" />
                  </span>
                  <span className="menu-title">Social</span>
                  <span className="menu-arrow" />
                </span>
                {/*end:Menu link*/}
                {/*begin:Menu sub*/}
                <div className="menu-sub menu-sub-accordion">
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Feeds</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Activty</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Followers</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Settings</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                </div>
                {/*end:Menu sub*/}
              </div>
              {/*end:Menu item*/}
              {/*begin:Menu item*/}
              <div
                data-kt-menu-trigger="click"
                className="menu-item menu-accordion"
              >
                {/*begin:Menu link*/}
                <span className="menu-link">
                  <span className="menu-bullet">
                    <span className="bullet bullet-dot" />
                  </span>
                  <span className="menu-title">Blog</span>
                  <span className="menu-arrow" />
                </span>
                {/*end:Menu link*/}
                {/*begin:Menu sub*/}
                <div className="menu-sub menu-sub-accordion">
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Blog Home</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Blog Post</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                </div>
                {/*end:Menu sub*/}
              </div>
              {/*end:Menu item*/}
              {/*begin:Menu item*/}
              <div
                data-kt-menu-trigger="click"
                className="menu-item menu-accordion"
              >
                {/*begin:Menu link*/}
                <span className="menu-link">
                  <span className="menu-bullet">
                    <span className="bullet bullet-dot" />
                  </span>
                  <span className="menu-title">Careers</span>
                  <span className="menu-arrow" />
                </span>
                {/*end:Menu link*/}
                {/*begin:Menu sub*/}
                <div className="menu-sub menu-sub-accordion">
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Careers List</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Careers Apply</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                </div>
                {/*end:Menu sub*/}
              </div>
              {/*end:Menu item*/}
            </div>
            {/*end:Menu sub*/}
          </div>
          {/*end:Menu item*/}
          {/*begin:Menu item*/}
          <div
            data-kt-menu-trigger="{default: 'click', lg: 'hover'}"
            data-kt-menu-placement="right-start"
            className="menu-item py-2"
          >
            {/*begin:Menu link*/}
            <span className="menu-link menu-center">
              <span className="menu-icon me-0">
                <i className="ki-outline ki-abstract-35 fs-1" />
              </span>
            </span>
            {/*end:Menu link*/}
            {/*begin:Menu sub*/}
            <div className="menu-sub menu-sub-dropdown menu-sub-indention px-2 py-4 w-250px mh-75 overflow-auto">
              {/*begin:Menu item*/}
              <div className="menu-item">
                {/*begin:Menu content*/}
                <div className="menu-content">
                  <span className="menu-section fs-5 fw-bolder ps-1 py-1">
                    Utilities
                  </span>
                </div>
                {/*end:Menu content*/}
              </div>
              {/*end:Menu item*/}
              {/*begin:Menu item*/}
              <div
                data-kt-menu-trigger="click"
                className="menu-item menu-accordion"
              >
                {/*begin:Menu link*/}
                <span className="menu-link">
                  <span className="menu-bullet">
                    <span className="bullet bullet-dot" />
                  </span>
                  <span className="menu-title">Modals</span>
                  <span className="menu-arrow" />
                </span>
                {/*end:Menu link*/}
                {/*begin:Menu sub*/}
                <div className="menu-sub menu-sub-accordion menu-active-bg">
                  {/*begin:Menu item*/}
                  <div
                    data-kt-menu-trigger="click"
                    className="menu-item menu-accordion"
                  >
                    {/*begin:Menu link*/}
                    <span className="menu-link">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">General</span>
                      <span className="menu-arrow" />
                    </span>
                    {/*end:Menu link*/}
                    {/*begin:Menu sub*/}
                    <div className="menu-sub menu-sub-accordion menu-active-bg">
                      {/*begin:Menu item*/}
                      <div className="menu-item">
                        {/*begin:Menu link*/}
                        <a className="menu-link" href="#">
                          <span className="menu-bullet">
                            <span className="bullet bullet-dot" />
                          </span>
                          <span className="menu-title">Invite Friends</span>
                        </a>
                        {/*end:Menu link*/}
                      </div>
                      {/*end:Menu item*/}
                      {/*begin:Menu item*/}
                      <div className="menu-item">
                        {/*begin:Menu link*/}
                        <a className="menu-link" href="#">
                          <span className="menu-bullet">
                            <span className="bullet bullet-dot" />
                          </span>
                          <span className="menu-title">View Users</span>
                        </a>
                        {/*end:Menu link*/}
                      </div>
                      {/*end:Menu item*/}
                      {/*begin:Menu item*/}
                      <div className="menu-item">
                        {/*begin:Menu link*/}
                        <a className="menu-link" href="#">
                          <span className="menu-bullet">
                            <span className="bullet bullet-dot" />
                          </span>
                          <span className="menu-title">Select Users</span>
                        </a>
                        {/*end:Menu link*/}
                      </div>
                      {/*end:Menu item*/}
                      {/*begin:Menu item*/}
                      <div className="menu-item">
                        {/*begin:Menu link*/}
                        <a className="menu-link" href="#">
                          <span className="menu-bullet">
                            <span className="bullet bullet-dot" />
                          </span>
                          <span className="menu-title">Upgrade Plan</span>
                        </a>
                        {/*end:Menu link*/}
                      </div>
                      {/*end:Menu item*/}
                      {/*begin:Menu item*/}
                      <div className="menu-item">
                        {/*begin:Menu link*/}
                        <a className="menu-link" href="#">
                          <span className="menu-bullet">
                            <span className="bullet bullet-dot" />
                          </span>
                          <span className="menu-title">Share &amp; Earn</span>
                        </a>
                        {/*end:Menu link*/}
                      </div>
                      {/*end:Menu item*/}
                    </div>
                    {/*end:Menu sub*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div
                    data-kt-menu-trigger="click"
                    className="menu-item menu-accordion"
                  >
                    {/*begin:Menu link*/}
                    <span className="menu-link">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Forms</span>
                      <span className="menu-arrow" />
                    </span>
                    {/*end:Menu link*/}
                    {/*begin:Menu sub*/}
                    <div className="menu-sub menu-sub-accordion menu-active-bg">
                      {/*begin:Menu item*/}
                      <div className="menu-item">
                        {/*begin:Menu link*/}
                        <a className="menu-link" href="#">
                          <span className="menu-bullet">
                            <span className="bullet bullet-dot" />
                          </span>
                          <span className="menu-title">New Target</span>
                        </a>
                        {/*end:Menu link*/}
                      </div>
                      {/*end:Menu item*/}
                      {/*begin:Menu item*/}
                      <div className="menu-item">
                        {/*begin:Menu link*/}
                        <a className="menu-link" href="#">
                          <span className="menu-bullet">
                            <span className="bullet bullet-dot" />
                          </span>
                          <span className="menu-title">New Card</span>
                        </a>
                        {/*end:Menu link*/}
                      </div>
                      {/*end:Menu item*/}
                      {/*begin:Menu item*/}
                      <div className="menu-item">
                        {/*begin:Menu link*/}
                        <a className="menu-link" href="#">
                          <span className="menu-bullet">
                            <span className="bullet bullet-dot" />
                          </span>
                          <span className="menu-title">New Address</span>
                        </a>
                        {/*end:Menu link*/}
                      </div>
                      {/*end:Menu item*/}
                      {/*begin:Menu item*/}
                      <div className="menu-item">
                        {/*begin:Menu link*/}
                        <a className="menu-link" href="#">
                          <span className="menu-bullet">
                            <span className="bullet bullet-dot" />
                          </span>
                          <span className="menu-title">Create API Key</span>
                        </a>
                        {/*end:Menu link*/}
                      </div>
                      {/*end:Menu item*/}
                      {/*begin:Menu item*/}
                      <div className="menu-item">
                        {/*begin:Menu link*/}
                        <a className="menu-link" href="#">
                          <span className="menu-bullet">
                            <span className="bullet bullet-dot" />
                          </span>
                          <span className="menu-title">Bidding</span>
                        </a>
                        {/*end:Menu link*/}
                      </div>
                      {/*end:Menu item*/}
                    </div>
                    {/*end:Menu sub*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div
                    data-kt-menu-trigger="click"
                    className="menu-item menu-accordion"
                  >
                    {/*begin:Menu link*/}
                    <span className="menu-link">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Wizards</span>
                      <span className="menu-arrow" />
                    </span>
                    {/*end:Menu link*/}
                    {/*begin:Menu sub*/}
                    <div className="menu-sub menu-sub-accordion menu-active-bg">
                      {/*begin:Menu item*/}
                      <div className="menu-item">
                        {/*begin:Menu link*/}
                        <a className="menu-link" href="#">
                          <span className="menu-bullet">
                            <span className="bullet bullet-dot" />
                          </span>
                          <span className="menu-title">Create App</span>
                        </a>
                        {/*end:Menu link*/}
                      </div>
                      {/*end:Menu item*/}
                      {/*begin:Menu item*/}
                      <div className="menu-item">
                        {/*begin:Menu link*/}
                        <a className="menu-link" href="#">
                          <span className="menu-bullet">
                            <span className="bullet bullet-dot" />
                          </span>
                          <span className="menu-title">Create Campaign</span>
                        </a>
                        {/*end:Menu link*/}
                      </div>
                      {/*end:Menu item*/}
                      {/*begin:Menu item*/}
                      <div className="menu-item">
                        {/*begin:Menu link*/}
                        <a className="menu-link" href="#">
                          <span className="menu-bullet">
                            <span className="bullet bullet-dot" />
                          </span>
                          <span className="menu-title">
                            Create Business Acc
                          </span>
                        </a>
                        {/*end:Menu link*/}
                      </div>
                      {/*end:Menu item*/}
                      {/*begin:Menu item*/}
                      <div className="menu-item">
                        {/*begin:Menu link*/}
                        <a className="menu-link" href="#">
                          <span className="menu-bullet">
                            <span className="bullet bullet-dot" />
                          </span>
                          <span className="menu-title">Create Project</span>
                        </a>
                        {/*end:Menu link*/}
                      </div>
                      {/*end:Menu item*/}
                      {/*begin:Menu item*/}
                      <div className="menu-item">
                        {/*begin:Menu link*/}
                        <a className="menu-link" href="#">
                          <span className="menu-bullet">
                            <span className="bullet bullet-dot" />
                          </span>
                          <span className="menu-title">Top Up Wallet</span>
                        </a>
                        {/*end:Menu link*/}
                      </div>
                      {/*end:Menu item*/}
                      {/*begin:Menu item*/}
                      <div className="menu-item">
                        {/*begin:Menu link*/}
                        <a className="menu-link" href="#">
                          <span className="menu-bullet">
                            <span className="bullet bullet-dot" />
                          </span>
                          <span className="menu-title">Offer a Deal</span>
                        </a>
                        {/*end:Menu link*/}
                      </div>
                      {/*end:Menu item*/}
                      {/*begin:Menu item*/}
                      <div className="menu-item">
                        {/*begin:Menu link*/}
                        <a className="menu-link" href="#">
                          <span className="menu-bullet">
                            <span className="bullet bullet-dot" />
                          </span>
                          <span className="menu-title">Two Factor Auth</span>
                        </a>
                        {/*end:Menu link*/}
                      </div>
                      {/*end:Menu item*/}
                    </div>
                    {/*end:Menu sub*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div
                    data-kt-menu-trigger="click"
                    className="menu-item menu-accordion"
                  >
                    {/*begin:Menu link*/}
                    <span className="menu-link">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Search</span>
                      <span className="menu-arrow" />
                    </span>
                    {/*end:Menu link*/}
                    {/*begin:Menu sub*/}
                    <div className="menu-sub menu-sub-accordion menu-active-bg">
                      {/*begin:Menu item*/}
                      <div className="menu-item">
                        {/*begin:Menu link*/}
                        <a className="menu-link" href="#">
                          <span className="menu-bullet">
                            <span className="bullet bullet-dot" />
                          </span>
                          <span className="menu-title">Users</span>
                        </a>
                        {/*end:Menu link*/}
                      </div>
                      {/*end:Menu item*/}
                      {/*begin:Menu item*/}
                      <div className="menu-item">
                        {/*begin:Menu link*/}
                        <a className="menu-link" href="#">
                          <span className="menu-bullet">
                            <span className="bullet bullet-dot" />
                          </span>
                          <span className="menu-title">Select Location</span>
                        </a>
                        {/*end:Menu link*/}
                      </div>
                      {/*end:Menu item*/}
                    </div>
                    {/*end:Menu sub*/}
                  </div>
                  {/*end:Menu item*/}
                </div>
                {/*end:Menu sub*/}
              </div>
              {/*end:Menu item*/}
              {/*begin:Menu item*/}
              <div
                data-kt-menu-trigger="click"
                className="menu-item menu-accordion"
              >
                {/*begin:Menu link*/}
                <span className="menu-link">
                  <span className="menu-bullet">
                    <span className="bullet bullet-dot" />
                  </span>
                  <span className="menu-title">Wizards</span>
                  <span className="menu-arrow" />
                </span>
                {/*end:Menu link*/}
                {/*begin:Menu sub*/}
                <div className="menu-sub menu-sub-accordion menu-active-bg">
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Horizontal</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Vertical</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Two Factor Auth</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Create App</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Create Campaign</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Create Account</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Create Project</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Top Up Wallet</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Offer a Deal</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                </div>
                {/*end:Menu sub*/}
              </div>
              {/*end:Menu item*/}
              {/*begin:Menu item*/}
              <div
                data-kt-menu-trigger="click"
                className="menu-item menu-accordion"
              >
                {/*begin:Menu link*/}
                <span className="menu-link">
                  <span className="menu-bullet">
                    <span className="bullet bullet-dot" />
                  </span>
                  <span className="menu-title">Search</span>
                  <span className="menu-arrow" />
                </span>
                {/*end:Menu link*/}
                {/*begin:Menu sub*/}
                <div className="menu-sub menu-sub-accordion menu-active-bg">
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Horizontal</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Vertical</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Users</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Location</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                </div>
                {/*end:Menu sub*/}
              </div>
              {/*end:Menu item*/}
            </div>
            {/*end:Menu sub*/}
          </div>
          {/*end:Menu item*/}
          {/*begin:Menu item*/}
          <div
            data-kt-menu-trigger="{default: 'click', lg: 'hover'}"
            data-kt-menu-placement="right-start"
            className="menu-item py-2"
          >
            {/*begin:Menu link*/}
            <span className="menu-link menu-center">
              <span className="menu-icon me-0">
                <i className="ki-outline ki-abstract-26 fs-1" />
              </span>
            </span>
            {/*end:Menu link*/}
            {/*begin:Menu sub*/}
            <div className="menu-sub menu-sub-dropdown menu-sub-indention px-2 py-4 w-250px mh-75 overflow-auto">
              {/*begin:Menu item*/}
              <div className="menu-item">
                {/*begin:Menu content*/}
                <div className="menu-content">
                  <span className="menu-section fs-5 fw-bolder ps-1 py-1">
                    Apps
                  </span>
                </div>
                {/*end:Menu content*/}
              </div>
              {/*end:Menu item*/}
              {/*begin:Menu item*/}
              <div
                data-kt-menu-trigger="click"
                className="menu-item menu-accordion"
              >
                {/*begin:Menu link*/}
                <span className="menu-link">
                  <span className="menu-icon">
                    <i className="ki-outline ki-rocket fs-2" />
                  </span>
                  <span className="menu-title">Projects</span>
                  <span className="menu-arrow" />
                </span>
                {/*end:Menu link*/}
                {/*begin:Menu sub*/}
                <div className="menu-sub menu-sub-accordion">
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">My Projects</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">View Project</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Targets</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Budget</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Users</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Files</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Activity</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Settings</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                </div>
                {/*end:Menu sub*/}
              </div>
              {/*end:Menu item*/}
              {/*begin:Menu item*/}
              <div
                data-kt-menu-trigger="click"
                className="menu-item menu-accordion"
              >
                {/*begin:Menu link*/}
                <span className="menu-link">
                  <span className="menu-icon">
                    <i className="ki-outline ki-handcart fs-2" />
                  </span>
                  <span className="menu-title">eCommerce</span>
                  <span className="menu-arrow" />
                </span>
                {/*end:Menu link*/}
                {/*begin:Menu sub*/}
                <div className="menu-sub menu-sub-accordion">
                  {/*begin:Menu item*/}
                  <div
                    data-kt-menu-trigger="click"
                    className="menu-item menu-accordion"
                  >
                    {/*begin:Menu link*/}
                    <span className="menu-link">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Catalog</span>
                      <span className="menu-arrow" />
                    </span>
                    {/*end:Menu link*/}
                    {/*begin:Menu sub*/}
                    <div className="menu-sub menu-sub-accordion">
                      {/*begin:Menu item*/}
                      <div className="menu-item">
                        {/*begin:Menu link*/}
                        <a className="menu-link" href="#">
                          <span className="menu-bullet">
                            <span className="bullet bullet-dot" />
                          </span>
                          <span className="menu-title">Products</span>
                        </a>
                        {/*end:Menu link*/}
                      </div>
                      {/*end:Menu item*/}
                      {/*begin:Menu item*/}
                      <div className="menu-item">
                        {/*begin:Menu link*/}
                        <a className="menu-link" href="#">
                          <span className="menu-bullet">
                            <span className="bullet bullet-dot" />
                          </span>
                          <span className="menu-title">Categories</span>
                        </a>
                        {/*end:Menu link*/}
                      </div>
                      {/*end:Menu item*/}
                      {/*begin:Menu item*/}
                      <div className="menu-item">
                        {/*begin:Menu link*/}
                        <a className="menu-link" href="#">
                          <span className="menu-bullet">
                            <span className="bullet bullet-dot" />
                          </span>
                          <span className="menu-title">Add Product</span>
                        </a>
                        {/*end:Menu link*/}
                      </div>
                      {/*end:Menu item*/}
                      {/*begin:Menu item*/}
                      <div className="menu-item">
                        {/*begin:Menu link*/}
                        <a className="menu-link" href="#">
                          <span className="menu-bullet">
                            <span className="bullet bullet-dot" />
                          </span>
                          <span className="menu-title">Edit Product</span>
                        </a>
                        {/*end:Menu link*/}
                      </div>
                      {/*end:Menu item*/}
                      {/*begin:Menu item*/}
                      <div className="menu-item">
                        {/*begin:Menu link*/}
                        <a className="menu-link" href="#">
                          <span className="menu-bullet">
                            <span className="bullet bullet-dot" />
                          </span>
                          <span className="menu-title">Add Category</span>
                        </a>
                        {/*end:Menu link*/}
                      </div>
                      {/*end:Menu item*/}
                      {/*begin:Menu item*/}
                      <div className="menu-item">
                        {/*begin:Menu link*/}
                        <a className="menu-link" href="#">
                          <span className="menu-bullet">
                            <span className="bullet bullet-dot" />
                          </span>
                          <span className="menu-title">Edit Category</span>
                        </a>
                        {/*end:Menu link*/}
                      </div>
                      {/*end:Menu item*/}
                    </div>
                    {/*end:Menu sub*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div
                    data-kt-menu-trigger="click"
                    className="menu-item menu-accordion"
                  >
                    {/*begin:Menu link*/}
                    <span className="menu-link">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Sales</span>
                      <span className="menu-arrow" />
                    </span>
                    {/*end:Menu link*/}
                    {/*begin:Menu sub*/}
                    <div className="menu-sub menu-sub-accordion">
                      {/*begin:Menu item*/}
                      <div className="menu-item">
                        {/*begin:Menu link*/}
                        <a className="menu-link" href="#">
                          <span className="menu-bullet">
                            <span className="bullet bullet-dot" />
                          </span>
                          <span className="menu-title">Orders Listing</span>
                        </a>
                        {/*end:Menu link*/}
                      </div>
                      {/*end:Menu item*/}
                      {/*begin:Menu item*/}
                      <div className="menu-item">
                        {/*begin:Menu link*/}
                        <a className="menu-link" href="#">
                          <span className="menu-bullet">
                            <span className="bullet bullet-dot" />
                          </span>
                          <span className="menu-title">Order Details</span>
                        </a>
                        {/*end:Menu link*/}
                      </div>
                      {/*end:Menu item*/}
                      {/*begin:Menu item*/}
                      <div className="menu-item">
                        {/*begin:Menu link*/}
                        <a className="menu-link" href="#">
                          <span className="menu-bullet">
                            <span className="bullet bullet-dot" />
                          </span>
                          <span className="menu-title">Add Order</span>
                        </a>
                        {/*end:Menu link*/}
                      </div>
                      {/*end:Menu item*/}
                      {/*begin:Menu item*/}
                      <div className="menu-item">
                        {/*begin:Menu link*/}
                        <a className="menu-link" href="#">
                          <span className="menu-bullet">
                            <span className="bullet bullet-dot" />
                          </span>
                          <span className="menu-title">Edit Order</span>
                        </a>
                        {/*end:Menu link*/}
                      </div>
                      {/*end:Menu item*/}
                    </div>
                    {/*end:Menu sub*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div
                    data-kt-menu-trigger="click"
                    className="menu-item menu-accordion"
                  >
                    {/*begin:Menu link*/}
                    <span className="menu-link">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Customers</span>
                      <span className="menu-arrow" />
                    </span>
                    {/*end:Menu link*/}
                    {/*begin:Menu sub*/}
                    <div className="menu-sub menu-sub-accordion">
                      {/*begin:Menu item*/}
                      <div className="menu-item">
                        {/*begin:Menu link*/}
                        <a className="menu-link" href="#">
                          <span className="menu-bullet">
                            <span className="bullet bullet-dot" />
                          </span>
                          <span className="menu-title">Customer Listing</span>
                        </a>
                        {/*end:Menu link*/}
                      </div>
                      {/*end:Menu item*/}
                      {/*begin:Menu item*/}
                      <div className="menu-item">
                        {/*begin:Menu link*/}
                        <a className="menu-link" href="#">
                          <span className="menu-bullet">
                            <span className="bullet bullet-dot" />
                          </span>
                          <span className="menu-title">Customer Details</span>
                        </a>
                        {/*end:Menu link*/}
                      </div>
                      {/*end:Menu item*/}
                    </div>
                    {/*end:Menu sub*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div
                    data-kt-menu-trigger="click"
                    className="menu-item menu-accordion"
                  >
                    {/*begin:Menu link*/}
                    <span className="menu-link">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Reports</span>
                      <span className="menu-arrow" />
                    </span>
                    {/*end:Menu link*/}
                    {/*begin:Menu sub*/}
                    <div className="menu-sub menu-sub-accordion">
                      {/*begin:Menu item*/}
                      <div className="menu-item">
                        {/*begin:Menu link*/}
                        <a className="menu-link" href="#">
                          <span className="menu-bullet">
                            <span className="bullet bullet-dot" />
                          </span>
                          <span className="menu-title">Products Viewed</span>
                        </a>
                        {/*end:Menu link*/}
                      </div>
                      {/*end:Menu item*/}
                      {/*begin:Menu item*/}
                      <div className="menu-item">
                        {/*begin:Menu link*/}
                        <a className="menu-link" href="#">
                          <span className="menu-bullet">
                            <span className="bullet bullet-dot" />
                          </span>
                          <span className="menu-title">Sales</span>
                        </a>
                        {/*end:Menu link*/}
                      </div>
                      {/*end:Menu item*/}
                      {/*begin:Menu item*/}
                      <div className="menu-item">
                        {/*begin:Menu link*/}
                        <a className="menu-link" href="#">
                          <span className="menu-bullet">
                            <span className="bullet bullet-dot" />
                          </span>
                          <span className="menu-title">Returns</span>
                        </a>
                        {/*end:Menu link*/}
                      </div>
                      {/*end:Menu item*/}
                      {/*begin:Menu item*/}
                      <div className="menu-item">
                        {/*begin:Menu link*/}
                        <a className="menu-link" href="#">
                          <span className="menu-bullet">
                            <span className="bullet bullet-dot" />
                          </span>
                          <span className="menu-title">Customer Orders</span>
                        </a>
                        {/*end:Menu link*/}
                      </div>
                      {/*end:Menu item*/}
                      {/*begin:Menu item*/}
                      <div className="menu-item">
                        {/*begin:Menu link*/}
                        <a className="menu-link" href="#">
                          <span className="menu-bullet">
                            <span className="bullet bullet-dot" />
                          </span>
                          <span className="menu-title">Shipping</span>
                        </a>
                        {/*end:Menu link*/}
                      </div>
                      {/*end:Menu item*/}
                    </div>
                    {/*end:Menu sub*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Settings</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                </div>
                {/*end:Menu sub*/}
              </div>
              {/*end:Menu item*/}
              {/*begin:Menu item*/}
              <div
                data-kt-menu-trigger="click"
                className="menu-item menu-accordion"
              >
                {/*begin:Menu link*/}
                <span className="menu-link">
                  <span className="menu-icon">
                    <i className="ki-outline ki-phone fs-2" />
                  </span>
                  <span className="menu-title">Contacts</span>
                  <span className="menu-arrow" />
                </span>
                {/*end:Menu link*/}
                {/*begin:Menu sub*/}
                <div className="menu-sub menu-sub-accordion">
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Getting Started</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Add Contact</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Edit Contact</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">View Contact</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                </div>
                {/*end:Menu sub*/}
              </div>
              {/*end:Menu item*/}
              {/*begin:Menu item*/}
              <div
                data-kt-menu-trigger="click"
                className="menu-item menu-accordion"
              >
                {/*begin:Menu link*/}
                <span className="menu-link">
                  <span className="menu-icon">
                    <i className="ki-outline ki-chart fs-2" />
                  </span>
                  <span className="menu-title">Support Center</span>
                  <span className="menu-arrow" />
                </span>
                {/*end:Menu link*/}
                {/*begin:Menu sub*/}
                <div className="menu-sub menu-sub-accordion">
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Overview</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div
                    data-kt-menu-trigger="click"
                    className="menu-item menu-accordion mb-1"
                  >
                    {/*begin:Menu link*/}
                    <span className="menu-link">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Tickets</span>
                      <span className="menu-arrow" />
                    </span>
                    {/*end:Menu link*/}
                    {/*begin:Menu sub*/}
                    <div className="menu-sub menu-sub-accordion">
                      {/*begin:Menu item*/}
                      <div className="menu-item">
                        {/*begin:Menu link*/}
                        <a className="menu-link" href="#">
                          <span className="menu-bullet">
                            <span className="bullet bullet-dot" />
                          </span>
                          <span className="menu-title">Tickets List</span>
                        </a>
                        {/*end:Menu link*/}
                      </div>
                      {/*end:Menu item*/}
                      {/*begin:Menu item*/}
                      <div className="menu-item">
                        {/*begin:Menu link*/}
                        <a className="menu-link" href="#">
                          <span className="menu-bullet">
                            <span className="bullet bullet-dot" />
                          </span>
                          <span className="menu-title">View Ticket</span>
                        </a>
                        {/*end:Menu link*/}
                      </div>
                      {/*end:Menu item*/}
                    </div>
                    {/*end:Menu sub*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div
                    data-kt-menu-trigger="click"
                    className="menu-item menu-accordion mb-1"
                  >
                    {/*begin:Menu link*/}
                    <span className="menu-link">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Tutorials</span>
                      <span className="menu-arrow" />
                    </span>
                    {/*end:Menu link*/}
                    {/*begin:Menu sub*/}
                    <div className="menu-sub menu-sub-accordion">
                      {/*begin:Menu item*/}
                      <div className="menu-item">
                        {/*begin:Menu link*/}
                        <a className="menu-link" href="#">
                          <span className="menu-bullet">
                            <span className="bullet bullet-dot" />
                          </span>
                          <span className="menu-title">Tutorials List</span>
                        </a>
                        {/*end:Menu link*/}
                      </div>
                      {/*end:Menu item*/}
                      {/*begin:Menu item*/}
                      <div className="menu-item">
                        {/*begin:Menu link*/}
                        <a className="menu-link" href="#">
                          <span className="menu-bullet">
                            <span className="bullet bullet-dot" />
                          </span>
                          <span className="menu-title">Tutorial Post</span>
                        </a>
                        {/*end:Menu link*/}
                      </div>
                      {/*end:Menu item*/}
                    </div>
                    {/*end:Menu sub*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">FAQ</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Licenses</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Contact Us</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                </div>
                {/*end:Menu sub*/}
              </div>
              {/*end:Menu item*/}
              {/*begin:Menu item*/}
              <div
                data-kt-menu-trigger="click"
                className="menu-item menu-accordion"
              >
                {/*begin:Menu link*/}
                <span className="menu-link">
                  <span className="menu-icon">
                    <i className="ki-outline ki-shield-tick fs-2" />
                  </span>
                  <span className="menu-title">User Management</span>
                  <span className="menu-arrow" />
                </span>
                {/*end:Menu link*/}
                {/*begin:Menu sub*/}
                <div className="menu-sub menu-sub-accordion">
                  {/*begin:Menu item*/}
                  <div
                    data-kt-menu-trigger="click"
                    className="menu-item menu-accordion mb-1"
                  >
                    {/*begin:Menu link*/}
                    <span className="menu-link">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Users</span>
                      <span className="menu-arrow" />
                    </span>
                    {/*end:Menu link*/}
                    {/*begin:Menu sub*/}
                    <div className="menu-sub menu-sub-accordion">
                      {/*begin:Menu item*/}
                      <div className="menu-item">
                        {/*begin:Menu link*/}
                        <a className="menu-link" href="#">
                          <span className="menu-bullet">
                            <span className="bullet bullet-dot" />
                          </span>
                          <span className="menu-title">Users List</span>
                        </a>
                        {/*end:Menu link*/}
                      </div>
                      {/*end:Menu item*/}
                      {/*begin:Menu item*/}
                      <div className="menu-item">
                        {/*begin:Menu link*/}
                        <a className="menu-link" href="#">
                          <span className="menu-bullet">
                            <span className="bullet bullet-dot" />
                          </span>
                          <span className="menu-title">View User</span>
                        </a>
                        {/*end:Menu link*/}
                      </div>
                      {/*end:Menu item*/}
                    </div>
                    {/*end:Menu sub*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div
                    data-kt-menu-trigger="click"
                    className="menu-item menu-accordion"
                  >
                    {/*begin:Menu link*/}
                    <span className="menu-link">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Roles</span>
                      <span className="menu-arrow" />
                    </span>
                    {/*end:Menu link*/}
                    {/*begin:Menu sub*/}
                    <div className="menu-sub menu-sub-accordion">
                      {/*begin:Menu item*/}
                      <div className="menu-item">
                        {/*begin:Menu link*/}
                        <a className="menu-link" href="#">
                          <span className="menu-bullet">
                            <span className="bullet bullet-dot" />
                          </span>
                          <span className="menu-title">Roles List</span>
                        </a>
                        {/*end:Menu link*/}
                      </div>
                      {/*end:Menu item*/}
                      {/*begin:Menu item*/}
                      <div className="menu-item">
                        {/*begin:Menu link*/}
                        <a className="menu-link" href="#">
                          <span className="menu-bullet">
                            <span className="bullet bullet-dot" />
                          </span>
                          <span className="menu-title">View Role</span>
                        </a>
                        {/*end:Menu link*/}
                      </div>
                      {/*end:Menu item*/}
                    </div>
                    {/*end:Menu sub*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Permissions</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                </div>
                {/*end:Menu sub*/}
              </div>
              {/*end:Menu item*/}
              {/*begin:Menu item*/}
              <div
                data-kt-menu-trigger="click"
                className="menu-item menu-accordion"
              >
                {/*begin:Menu link*/}
                <span className="menu-link">
                  <span className="menu-icon">
                    <i className="ki-outline ki-briefcase fs-2" />
                  </span>
                  <span className="menu-title">Customers</span>
                  <span className="menu-arrow" />
                </span>
                {/*end:Menu link*/}
                {/*begin:Menu sub*/}
                <div className="menu-sub menu-sub-accordion">
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Getting Started</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Customer Listing</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Customer Details</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                </div>
                {/*end:Menu sub*/}
              </div>
              {/*end:Menu item*/}
              {/*begin:Menu item*/}
              <div
                data-kt-menu-trigger="click"
                className="menu-item menu-accordion"
              >
                {/*begin:Menu link*/}
                <span className="menu-link">
                  <span className="menu-icon">
                    <i className="ki-outline ki-map fs-2" />
                  </span>
                  <span className="menu-title">Subscription</span>
                  <span className="menu-arrow" />
                </span>
                {/*end:Menu link*/}
                {/*begin:Menu sub*/}
                <div className="menu-sub menu-sub-accordion">
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Getting Started</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Subscription List</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Add Subscription</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">View Subscription</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                </div>
                {/*end:Menu sub*/}
              </div>
              {/*end:Menu item*/}
              {/*begin:Menu item*/}
              <div
                data-kt-menu-trigger="click"
                className="menu-item menu-accordion"
              >
                {/*begin:Menu link*/}
                <span className="menu-link">
                  <span className="menu-icon">
                    <i className="ki-outline ki-credit-cart fs-2" />
                  </span>
                  <span className="menu-title">Invoice Manager</span>
                  <span className="menu-arrow" />
                </span>
                {/*end:Menu link*/}
                {/*begin:Menu sub*/}
                <div className="menu-sub menu-sub-accordion">
                  {/*begin:Menu item*/}
                  <div
                    data-kt-menu-trigger="click"
                    className="menu-item menu-accordion"
                  >
                    {/*begin:Menu link*/}
                    <span className="menu-link">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">View Invoices</span>
                      <span className="menu-arrow" />
                    </span>
                    {/*end:Menu link*/}
                    {/*begin:Menu sub*/}
                    <div className="menu-sub menu-sub-accordion menu-active-bg">
                      {/*begin:Menu item*/}
                      <div className="menu-item">
                        {/*begin:Menu link*/}
                        <a className="menu-link" href="#">
                          <span className="menu-bullet">
                            <span className="bullet bullet-dot" />
                          </span>
                          <span className="menu-title">Invoice 1</span>
                        </a>
                        {/*end:Menu link*/}
                      </div>
                      {/*end:Menu item*/}
                      {/*begin:Menu item*/}
                      <div className="menu-item">
                        {/*begin:Menu link*/}
                        <a className="menu-link" href="#">
                          <span className="menu-bullet">
                            <span className="bullet bullet-dot" />
                          </span>
                          <span className="menu-title">Invoice 2</span>
                        </a>
                        {/*end:Menu link*/}
                      </div>
                      {/*end:Menu item*/}
                      {/*begin:Menu item*/}
                      <div className="menu-item">
                        {/*begin:Menu link*/}
                        <a className="menu-link" href="#">
                          <span className="menu-bullet">
                            <span className="bullet bullet-dot" />
                          </span>
                          <span className="menu-title">Invoice 3</span>
                        </a>
                        {/*end:Menu link*/}
                      </div>
                      {/*end:Menu item*/}
                    </div>
                    {/*end:Menu sub*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Create Invoice</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                </div>
                {/*end:Menu sub*/}
              </div>
              {/*end:Menu item*/}
              {/*begin:Menu item*/}
              <div
                data-kt-menu-trigger="click"
                className="menu-item menu-accordion"
              >
                {/*begin:Menu link*/}
                <span className="menu-link">
                  <span className="menu-icon">
                    <i className="ki-outline ki-file-added fs-2" />
                  </span>
                  <span className="menu-title">File Manager</span>
                  <span className="menu-arrow" />
                </span>
                {/*end:Menu link*/}
                {/*begin:Menu sub*/}
                <div className="menu-sub menu-sub-accordion">
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Folders</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Files</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Blank Directory</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Settings</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                </div>
                {/*end:Menu sub*/}
              </div>
              {/*end:Menu item*/}
              {/*begin:Menu item*/}
              <div
                data-kt-menu-trigger="click"
                className="menu-item menu-accordion"
              >
                {/*begin:Menu link*/}
                <span className="menu-link">
                  <span className="menu-icon">
                    <i className="ki-outline ki-sms fs-2" />
                  </span>
                  <span className="menu-title">Inbox</span>
                  <span className="menu-arrow" />
                </span>
                {/*end:Menu link*/}
                {/*begin:Menu sub*/}
                <div className="menu-sub menu-sub-accordion">
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Messages</span>
                      <span className="menu-badge">
                        <span className="badge badge-success">3</span>
                      </span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Compose</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">View &amp; Reply</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                </div>
                {/*end:Menu sub*/}
              </div>
              {/*end:Menu item*/}
              {/*begin:Menu item*/}
              <div
                data-kt-menu-trigger="click"
                className="menu-item menu-accordion"
              >
                {/*begin:Menu link*/}
                <span className="menu-link">
                  <span className="menu-icon">
                    <i className="ki-outline ki-message-text-2 fs-2" />
                  </span>
                  <span className="menu-title">Chat</span>
                  <span className="menu-arrow" />
                </span>
                {/*end:Menu link*/}
                {/*begin:Menu sub*/}
                <div className="menu-sub menu-sub-accordion">
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Private Chat</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Group Chat</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                  {/*begin:Menu item*/}
                  <div className="menu-item">
                    {/*begin:Menu link*/}
                    <a className="menu-link" href="#">
                      <span className="menu-bullet">
                        <span className="bullet bullet-dot" />
                      </span>
                      <span className="menu-title">Drawer Chat</span>
                    </a>
                    {/*end:Menu link*/}
                  </div>
                  {/*end:Menu item*/}
                </div>
                {/*end:Menu sub*/}
              </div>
              {/*end:Menu item*/}
              {/*begin:Menu item*/}
              <div className="menu-item">
                {/*begin:Menu link*/}
                <a className="menu-link" href="#">
                  <span className="menu-icon">
                    <i className="ki-outline ki-calendar-8 fs-2" />
                  </span>
                  <span className="menu-title">Calendar</span>
                </a>
                {/*end:Menu link*/}
              </div>
              {/*end:Menu item*/}
            </div>
            {/*end:Menu sub*/}
          </div>
          {/*end:Menu item*/}
          {/*begin:Menu item*/}
          <div
            data-kt-menu-trigger="{default: 'click', lg: 'hover'}"
            data-kt-menu-placement="right-start"
            className="menu-item py-2"
          >
            {/*begin:Menu link*/}
            <span className="menu-link menu-center">
              <span className="menu-icon me-0">
                <i className="ki-outline ki-briefcase fs-1" />
              </span>
            </span>
            {/*end:Menu link*/}
            {/*begin:Menu sub*/}
            <div className="menu-sub menu-sub-dropdown px-2 py-4 w-200px w-lg-225px mh-75 overflow-auto">
              {/*begin:Menu item*/}
              <div className="menu-item">
                {/*begin:Menu content*/}
                <div className="menu-content">
                  <span className="menu-section fs-5 fw-bolder ps-1 py-1">
                    Help
                  </span>
                </div>
                {/*end:Menu content*/}
              </div>
              {/*end:Menu item*/}
              {/*begin:Menu item*/}
              <div className="menu-item">
                {/*begin:Menu link*/}
                <a
                  className="menu-link"
                  href="https://preview.keenthemes.com/html/metronic/docs/base/utilities"
                  target="_blank"
                  title="Check out over 200 in-house components"
                  data-bs-toggle="tooltip"
                  data-bs-trigger="hover"
                  data-bs-dismiss="click"
                  data-bs-placement="right"
                >
                  <span className="menu-bullet">
                    <span className="bullet bullet-dot" />
                  </span>
                  <span className="menu-title">Components</span>
                </a>
                {/*end:Menu link*/}
              </div>
              {/*end:Menu item*/}
              {/*begin:Menu item*/}
              <div className="menu-item">
                {/*begin:Menu link*/}
                <a
                  className="menu-link"
                  href="https://preview.keenthemes.com/html/metronic/docs"
                  target="_blank"
                  title="Check out the complete documentation"
                  data-bs-toggle="tooltip"
                  data-bs-trigger="hover"
                  data-bs-dismiss="click"
                  data-bs-placement="right"
                >
                  <span className="menu-bullet">
                    <span className="bullet bullet-dot" />
                  </span>
                  <span className="menu-title">Documentation</span>
                </a>
                {/*end:Menu link*/}
              </div>
              {/*end:Menu item*/}
              {/*begin:Menu item*/}
              <div className="menu-item">
                {/*begin:Menu link*/}
                <a
                  className="menu-link"
                  href="#"
                  title="Build your layout and export HTML for server side integration"
                  data-bs-toggle="tooltip"
                  data-bs-trigger="hover"
                  data-bs-dismiss="click"
                  data-bs-placement="right"
                >
                  <span className="menu-bullet">
                    <span className="bullet bullet-dot" />
                  </span>
                  <span className="menu-title">Layout Builder</span>
                </a>
                {/*end:Menu link*/}
              </div>
              {/*end:Menu item*/}
              {/*begin:Menu item*/}
              <div className="menu-item">
                {/*begin:Menu link*/}
                <a
                  className="menu-link"
                  href="https://preview.keenthemes.com/html/metronic/docs/getting-started/changelog"
                  target="_blank"
                >
                  <span className="menu-bullet">
                    <span className="bullet bullet-dot" />
                  </span>
                  <span className="menu-title">Changelog v8.3.2</span>
                </a>
                {/*end:Menu link*/}
              </div>
              {/*end:Menu item*/}
            </div>
            {/*end:Menu sub*/}
          </div>
          {/*end:Menu item*/}
        </div>
        {/*end::Menu*/}
      </div>
      {/*end::Primary menu*/}
      {/*begin::Footer*/}
      <div
        className="d-flex flex-column flex-center pb-4 pb-lg-8"
        id="kt_app_sidebar_footer"
      >
        <button
          type="button"
          className="btn btn-icon btn-active-color-primary"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setThemeMenuOpen((open) => !open);
          }}
          ref={themeToggleRef}
          data-kt-menu-offset="0,10"
        >
          <i className="ki-outline ki-night-day theme-light-show fs-2x" />
          <i className="ki-outline ki-moon theme-dark-show fs-2x" />
        </button>
        <div
          className={`menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-title-gray-700 menu-icon-gray-500 menu-active-bg menu-state-color fw-semibold py-4 fs-base w-150px${themeMenuOpen ? " show" : ""}`}
          ref={themeMenuRef}
        >
          {modes.map((item) => (
            <div className="menu-item px-3 my-0" key={item.id}>
              <button
                type="button"
                className={`menu-link px-3 py-2 ${mode === item.id ? "active" : ""}`}
                onClick={(event) => {
                  event.preventDefault();
                  setMode(item.id);
                  setThemeMenuOpen(false);
                }}
              >
                <span className="menu-icon">
                  <i className={item.icon} />
                </span>
                <span className="menu-title">{item.label}</span>
              </button>
            </div>
          ))}
        </div>
      </div>
      {/*end::Footer*/}
    </div>
  );
};

export default AppSidebar;
