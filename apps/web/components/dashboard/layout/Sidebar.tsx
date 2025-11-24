import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../../lib/api-client';

const Sidebar = () => {
	const [isSuperAdmin, setIsSuperAdmin] = useState<boolean | null>(null);

	useEffect(() => {
		let active = true;
		const fetchRole = async () => {
			try {
				const me = await apiFetch<{ user: { role?: string } }>("/me");
				if (!active) return;
				setIsSuperAdmin(me.user.role === "SUPERADMIN");
			} catch (error) {
				console.error("Failed to fetch user role", error);
				if (active) setIsSuperAdmin(false);
			}
		};
		fetchRole();
		return () => {
			active = false;
		};
	}, []);
	return (
		<div id="kt_app_sidebar" className="app-sidebar" data-kt-drawer="true" data-kt-drawer-name="app-sidebar" data-kt-drawer-activate="{default: true, lg: false}" data-kt-drawer-overlay="true" data-kt-drawer-width="auto" data-kt-drawer-direction="start" data-kt-drawer-toggle="#kt_app_sidebar_mobile_toggle">
			{/*begin::Primary menu*/}
			<div id="kt_aside_menu_wrapper" className="app-sidebar-menu flex-grow-1 hover-scroll-y scroll-lg-ps my-5 pt-8" data-kt-scroll="true" data-kt-scroll-height="auto" data-kt-scroll-dependencies="#kt_app_sidebar_logo, #kt_app_sidebar_footer" data-kt-scroll-wrappers="#kt_app_sidebar_menu" data-kt-scroll-offset="5px">
				{/*begin::Menu*/}
				<div id="kt_aside_menu" className="menu menu-rounded menu-column menu-title-gray-600 menu-state-primary menu-state-icon-primary menu-state-bullet-primary menu-arrow-gray-500 fw-semibold fs-6" data-kt-menu="true">
					{/*begin:Menu item*/}
					<div data-kt-menu-trigger="{default: 'click', lg: 'hover'}" data-kt-menu-placement="right-start" className="menu-item here show py-2">
						{/*begin:Menu link*/}
						<span className="menu-link menu-center">
							<a className="menu-link" href="/dashboard">
								<span className="menu-icon me-0">
									<i className="ki-outline ki-home-2 fs-1"></i>
								</span>
							</a>
						</span>
						{/*end:Menu link*/}
					</div>
					{/*end:Menu item*/}
					{/*begin:Menu item*/}
					<div data-kt-menu-trigger="{default: 'click', lg: 'hover'}" data-kt-menu-placement="right-start" className="menu-item py-2">
						{/*begin:Menu link*/}
						<span className="menu-link menu-center">
							<a className="menu-link" href="/dashboard/calendar">
								<span className="menu-icon me-0">
									<i className="ki-outline ki-calendar-8 fs-1"></i>
								</span>
							</a>
						</span>
						{/*end:Menu link*/}
					</div>
					{/*end:Menu item*/}
					{/*begin:Menu item*/}
					<div data-kt-menu-trigger="{default: 'click', lg: 'hover'}" data-kt-menu-placement="right-start" className="menu-item py-2">
						{/*begin:Menu link*/}
						<span className="menu-link menu-center">
							<span className="menu-icon me-0">
								<i className="ki-outline ki-notification-status fs-1"></i>
							</span>
						</span>
						{/*end:Menu link*/}
						{/*begin:Menu sub*/}
						<div className="menu-sub menu-sub-dropdown menu-sub-indention px-2 py-4 w-250px mh-75 overflow-auto">
							{/*begin:Menu item*/}
							<div className="menu-item">
								{/*begin:Menu content*/}
								<div className="menu-content">
									<span className="menu-section fs-5 fw-bolder ps-1 py-1">Pages</span>
								</div>
								{/*end:Menu content*/}
							</div>
							{/*end:Menu item*/}
							{/*begin:Menu item*/}
							<div data-kt-menu-trigger="click" className="menu-item menu-accordion">
								{/*begin:Menu link*/}
								<span className="menu-link">
									<span className="menu-bullet">
										<span className="bullet bullet-dot"></span>
									</span>
									<span className="menu-title">User Profile</span>
									<span className="menu-arrow"></span>
								</span>
								{/*end:Menu link*/}
								{/*begin:Menu sub*/}
								<div className="menu-sub menu-sub-accordion">
									{/*begin:Menu item*/}
									<div className="menu-item">
										{/*begin:Menu link*/}
										<a className="menu-link" href="pages/user-profile/overview.html">
											<span className="menu-bullet">
												<span className="bullet bullet-dot"></span>
											</span>
											<span className="menu-title">Overview</span>
										</a>
										{/*end:Menu link*/}
									</div>
									{/*end:Menu item*/}
									{/*begin:Menu item*/}
									<div className="menu-item">
										{/*begin:Menu link*/}
										<a className="menu-link" href="pages/user-profile/projects.html">
											<span className="menu-bullet">
												<span className="bullet bullet-dot"></span>
											</span>
											<span className="menu-title">Projects</span>
										</a>
										{/*end:Menu link*/}
									</div>
									{/*end:Menu item*/}
									{/*begin:Menu item*/}
									<div className="menu-item">
										{/*begin:Menu link*/}
										<a className="menu-link" href="pages/user-profile/campaigns.html">
											<span className="menu-bullet">
												<span className="bullet bullet-dot"></span>
											</span>
											<span className="menu-title">Campaigns</span>
										</a>
										{/*end:Menu link*/}
									</div>
									{/*end:Menu item*/}
									{/*begin:Menu item*/}
									<div className="menu-item">
										{/*begin:Menu link*/}
										<a className="menu-link" href="pages/user-profile/documents.html">
											<span className="menu-bullet">
												<span className="bullet bullet-dot"></span>
											</span>
											<span className="menu-title">Documents</span>
										</a>
										{/*end:Menu link*/}
									</div>
									{/*end:Menu item*/}
									{/*begin:Menu item*/}
									<div className="menu-item">
										{/*begin:Menu link*/}
										<a className="menu-link" href="pages/user-profile/followers.html">
											<span className="menu-bullet">
												<span className="bullet bullet-dot"></span>
											</span>
											<span className="menu-title">Followers</span>
										</a>
										{/*end:Menu link*/}
									</div>
									{/*end:Menu item*/}
									{/*begin:Menu item*/}
									<div className="menu-item">
										{/*begin:Menu link*/}
										<a className="menu-link" href="pages/user-profile/activity.html">
											<span className="menu-bullet">
												<span className="bullet bullet-dot"></span>
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
							<div data-kt-menu-trigger="click" className="menu-item menu-accordion">
								{/*begin:Menu link*/}
								<span className="menu-link">
									<span className="menu-bullet">
										<span className="bullet bullet-dot"></span>
									</span>
									<span className="menu-title">Account</span>
									<span className="menu-arrow"></span>
								</span>
								{/*end:Menu link*/}
								{/*begin:Menu sub*/}
								<div className="menu-sub menu-sub-accordion">
									{/*begin:Menu item*/}
									<div className="menu-item">
										{/*begin:Menu link*/}
										<a className="menu-link" href="account/overview.html">
											<span className="menu-bullet">
												<span className="bullet bullet-dot"></span>
											</span>
											<span className="menu-title">Overview</span>
										</a>
										{/*end:Menu link*/}
									</div>
									{/*end:Menu item*/}
									{/*begin:Menu item*/}
									<div className="menu-item">
										{/*begin:Menu link*/}
										<a className="menu-link" href="account/settings.html">
											<span className="menu-bullet">
												<span className="bullet bullet-dot"></span>
											</span>
											<span className="menu-title">Settings</span>
										</a>
										{/*end:Menu link*/}
									</div>
									{/*end:Menu item*/}
									{/*begin:Menu item*/}
									<div className="menu-item">
										{/*begin:Menu link*/}
										<a className="menu-link" href="account/security.html">
											<span className="menu-bullet">
												<span className="bullet bullet-dot"></span>
											</span>
											<span className="menu-title">Security</span>
										</a>
										{/*end:Menu link*/}
									</div>
									{/*end:Menu item*/}
									{/*begin:Menu item*/}
									<div className="menu-item">
										{/*begin:Menu link*/}
										<a className="menu-link" href="account/activity.html">
											<span className="menu-bullet">
												<span className="bullet bullet-dot"></span>
											</span>
											<span className="menu-title">Activity</span>
										</a>
										{/*end:Menu link*/}
									</div>
									{/*end:Menu item*/}
									{/*begin:Menu item*/}
									<div className="menu-item">
										{/*begin:Menu link*/}
										<a className="menu-link" href="account/billing.html">
											<span className="menu-bullet">
												<span className="bullet bullet-dot"></span>
											</span>
											<span className="menu-title">Billing</span>
										</a>
										{/*end:Menu link*/}
									</div>
									{/*end:Menu item*/}
									{/*begin:Menu item*/}
									<div className="menu-item">
										{/*begin:Menu link*/}
										<a className="menu-link" href="account/statements.html">
											<span className="menu-bullet">
												<span className="bullet bullet-dot"></span>
											</span>
											<span className="menu-title">Statements</span>
										</a>
										{/*end:Menu link*/}
									</div>
									{/*end:Menu item*/}
									{/*begin:Menu item*/}
									<div className="menu-item">
										{/*begin:Menu link*/}
										<a className="menu-link" href="account/referrals.html">
											<span className="menu-bullet">
												<span className="bullet bullet-dot"></span>
											</span>
											<span className="menu-title">Referrals</span>
										</a>
										{/*end:Menu link*/}
									</div>
									{/*end:Menu item*/}
									{/*begin:Menu item*/}
									<div className="menu-item">
										{/*begin:Menu link*/}
										<a className="menu-link" href="account/api-keys.html">
											<span className="menu-bullet">
												<span className="bullet bullet-dot"></span>
											</span>
											<span className="menu-title">API Keys</span>
										</a>
										{/*end:Menu link*/}
									</div>
									{/*end:Menu item*/}
									{/*begin:Menu item*/}
									<div className="menu-item">
										{/*begin:Menu link*/}
										<a className="menu-link" href="account/logs.html">
											<span className="menu-bullet">
												<span className="bullet bullet-dot"></span>
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
							<div data-kt-menu-trigger="click" className="menu-item menu-accordion">
								{/*begin:Menu link*/}
								<span className="menu-link">
									<span className="menu-bullet">
										<span className="bullet bullet-dot"></span>
									</span>
									<span className="menu-title">Authentication</span>
									<span className="menu-arrow"></span>
								</span>
								{/*end:Menu link*/}
								{/*begin:Menu sub*/}
								<div className="menu-sub menu-sub-accordion">
									{/*begin:Menu item*/}
									<div data-kt-menu-trigger="click" className="menu-item menu-accordion">
										{/*begin:Menu link*/}
										<span className="menu-link">
											<span className="menu-bullet">
												<span className="bullet bullet-dot"></span>
											</span>
											<span className="menu-title">Corporate Layout</span>
											<span className="menu-arrow"></span>
										</span>
										{/*end:Menu link*/}
										{/*begin:Menu sub*/}
										<div className="menu-sub menu-sub-accordion menu-active-bg">
											{/*begin:Menu item*/}
											<div className="menu-item">
												{/*begin:Menu link*/}
												<a className="menu-link" href="authentication/layouts/corporate/sign-in.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
													</span>
													<span className="menu-title">Sign-in</span>
												</a>
												{/*end:Menu link*/}
											</div>
											{/*end:Menu item*/}
											{/*begin:Menu item*/}
											<div className="menu-item">
												{/*begin:Menu link*/}
												<a className="menu-link" href="authentication/layouts/corporate/sign-up.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
													</span>
													<span className="menu-title">Sign-up</span>
												</a>
												{/*end:Menu link*/}
											</div>
											{/*end:Menu item*/}
											{/*begin:Menu item*/}
											<div className="menu-item">
												{/*begin:Menu link*/}
												<a className="menu-link" href="authentication/layouts/corporate/two-factor.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
													</span>
													<span className="menu-title">Two-Factor</span>
												</a>
												{/*end:Menu link*/}
											</div>
											{/*end:Menu item*/}
											{/*begin:Menu item*/}
											<div className="menu-item">
												{/*begin:Menu link*/}
												<a className="menu-link" href="authentication/layouts/corporate/reset-password.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
													</span>
													<span className="menu-title">Reset Password</span>
												</a>
												{/*end:Menu link*/}
											</div>
											{/*end:Menu item*/}
											{/*begin:Menu item*/}
											<div className="menu-item">
												{/*begin:Menu link*/}
												<a className="menu-link" href="authentication/layouts/corporate/new-password.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
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
									<div data-kt-menu-trigger="click" className="menu-item menu-accordion">
										{/*begin:Menu link*/}
										<span className="menu-link">
											<span className="menu-bullet">
												<span className="bullet bullet-dot"></span>
											</span>
											<span className="menu-title">Overlay Layout</span>
											<span className="menu-arrow"></span>
										</span>
										{/*end:Menu link*/}
										{/*begin:Menu sub*/}
										<div className="menu-sub menu-sub-accordion menu-active-bg">
											{/*begin:Menu item*/}
											<div className="menu-item">
												{/*begin:Menu link*/}
												<a className="menu-link" href="authentication/layouts/overlay/sign-in.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
													</span>
													<span className="menu-title">Sign-in</span>
												</a>
												{/*end:Menu link*/}
											</div>
											{/*end:Menu item*/}
											{/*begin:Menu item*/}
											<div className="menu-item">
												{/*begin:Menu link*/}
												<a className="menu-link" href="authentication/layouts/overlay/sign-up.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
													</span>
													<span className="menu-title">Sign-up</span>
												</a>
												{/*end:Menu link*/}
											</div>
											{/*end:Menu item*/}
											{/*begin:Menu item*/}
											<div className="menu-item">
												{/*begin:Menu link*/}
												<a className="menu-link" href="authentication/layouts/overlay/two-factor.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
													</span>
													<span className="menu-title">Two-Factor</span>
												</a>
												{/*end:Menu link*/}
											</div>
											{/*end:Menu item*/}
											{/*begin:Menu item*/}
											<div className="menu-item">
												{/*begin:Menu link*/}
												<a className="menu-link" href="authentication/layouts/overlay/reset-password.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
													</span>
													<span className="menu-title">Reset Password</span>
												</a>
												{/*end:Menu link*/}
											</div>
											{/*end:Menu item*/}
											{/*begin:Menu item*/}
											<div className="menu-item">
												{/*begin:Menu link*/}
												<a className="menu-link" href="authentication/layouts/overlay/new-password.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
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
									<div data-kt-menu-trigger="click" className="menu-item menu-accordion">
										{/*begin:Menu link*/}
										<span className="menu-link">
											<span className="menu-bullet">
												<span className="bullet bullet-dot"></span>
											</span>
											<span className="menu-title">Creative Layout</span>
											<span className="menu-arrow"></span>
										</span>
										{/*end:Menu link*/}
										{/*begin:Menu sub*/}
										<div className="menu-sub menu-sub-accordion menu-active-bg">
											{/*begin:Menu item*/}
											<div className="menu-item">
												{/*begin:Menu link*/}
												<a className="menu-link" href="authentication/layouts/creative/sign-in.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
													</span>
													<span className="menu-title">Sign-in</span>
												</a>
												{/*end:Menu link*/}
											</div>
											{/*end:Menu item*/}
											{/*begin:Menu item*/}
											<div className="menu-item">
												{/*begin:Menu link*/}
												<a className="menu-link" href="authentication/layouts/creative/sign-up.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
													</span>
													<span className="menu-title">Sign-up</span>
												</a>
												{/*end:Menu link*/}
											</div>
											{/*end:Menu item*/}
											{/*begin:Menu item*/}
											<div className="menu-item">
												{/*begin:Menu link*/}
												<a className="menu-link" href="authentication/layouts/creative/two-factor.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
													</span>
													<span className="menu-title">Two-Factor</span>
												</a>
												{/*end:Menu link*/}
											</div>
											{/*end:Menu item*/}
											{/*begin:Menu item*/}
											<div className="menu-item">
												{/*begin:Menu link*/}
												<a className="menu-link" href="authentication/layouts/creative/reset-password.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
													</span>
													<span className="menu-title">Reset Password</span>
												</a>
												{/*end:Menu link*/}
											</div>
											{/*end:Menu item*/}
											{/*begin:Menu item*/}
											<div className="menu-item">
												{/*begin:Menu link*/}
												<a className="menu-link" href="authentication/layouts/creative/new-password.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
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
									<div data-kt-menu-trigger="click" className="menu-item menu-accordion">
										{/*begin:Menu link*/}
										<span className="menu-link">
											<span className="menu-bullet">
												<span className="bullet bullet-dot"></span>
											</span>
											<span className="menu-title">Fancy Layout</span>
											<span className="menu-arrow"></span>
										</span>
										{/*end:Menu link*/}
										{/*begin:Menu sub*/}
										<div className="menu-sub menu-sub-accordion menu-active-bg">
											{/*begin:Menu item*/}
											<div className="menu-item">
												{/*begin:Menu link*/}
												<a className="menu-link" href="authentication/layouts/fancy/sign-in.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
													</span>
													<span className="menu-title">Sign-in</span>
												</a>
												{/*end:Menu link*/}
											</div>
											{/*end:Menu item*/}
											{/*begin:Menu item*/}
											<div className="menu-item">
												{/*begin:Menu link*/}
												<a className="menu-link" href="authentication/layouts/fancy/sign-up.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
													</span>
													<span className="menu-title">Sign-up</span>
												</a>
												{/*end:Menu link*/}
											</div>
											{/*end:Menu item*/}
											{/*begin:Menu item*/}
											<div className="menu-item">
												{/*begin:Menu link*/}
												<a className="menu-link" href="authentication/layouts/fancy/two-factor.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
													</span>
													<span className="menu-title">Two-Factor</span>
												</a>
												{/*end:Menu link*/}
											</div>
											{/*end:Menu item*/}
											{/*begin:Menu item*/}
											<div className="menu-item">
												{/*begin:Menu link*/}
												<a className="menu-link" href="authentication/layouts/fancy/reset-password.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
													</span>
													<span className="menu-title">Reset Password</span>
												</a>
												{/*end:Menu link*/}
											</div>
											{/*end:Menu item*/}
											{/*begin:Menu item*/}
											<div className="menu-item">
												{/*begin:Menu link*/}
												<a className="menu-link" href="authentication/layouts/fancy/new-password.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
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
									<div data-kt-menu-trigger="click" className="menu-item menu-accordion">
										{/*begin:Menu link*/}
										<span className="menu-link">
											<span className="menu-bullet">
												<span className="bullet bullet-dot"></span>
											</span>
											<span className="menu-title">Email Templates</span>
											<span className="menu-arrow"></span>
										</span>
										{/*end:Menu link*/}
										{/*begin:Menu sub*/}
										<div className="menu-sub menu-sub-accordion menu-active-bg">
											{/*begin:Menu item*/}
											<div className="menu-item">
												{/*begin:Menu link*/}
												<a className="menu-link" href="authentication/email/welcome-message.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
													</span>
													<span className="menu-title">Welcome Message</span>
												</a>
												{/*end:Menu link*/}
											</div>
											{/*end:Menu item*/}
											{/*begin:Menu item*/}
											<div className="menu-item">
												{/*begin:Menu link*/}
												<a className="menu-link" href="authentication/email/reset-password.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
													</span>
													<span className="menu-title">Reset Password</span>
												</a>
												{/*end:Menu link*/}
											</div>
											{/*end:Menu item*/}
											{/*begin:Menu item*/}
											<div className="menu-item">
												{/*begin:Menu link*/}
												<a className="menu-link" href="authentication/email/subscription-confirmed.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
													</span>
													<span className="menu-title">Subscription Confirmed</span>
												</a>
												{/*end:Menu link*/}
											</div>
											{/*end:Menu item*/}
											{/*begin:Menu item*/}
											<div className="menu-item">
												{/*begin:Menu link*/}
												<a className="menu-link" href="authentication/email/card-declined.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
													</span>
													<span className="menu-title">Credit Card Declined</span>
												</a>
												{/*end:Menu link*/}
											</div>
											{/*end:Menu item*/}
											{/*begin:Menu item*/}
											<div className="menu-item">
												{/*begin:Menu link*/}
												<a className="menu-link" href="authentication/email/promo-1.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
													</span>
													<span className="menu-title">Promo 1</span>
												</a>
												{/*end:Menu link*/}
											</div>
											{/*end:Menu item*/}
											{/*begin:Menu item*/}
											<div className="menu-item">
												{/*begin:Menu link*/}
												<a className="menu-link" href="authentication/email/promo-2.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
													</span>
													<span className="menu-title">Promo 2</span>
												</a>
												{/*end:Menu link*/}
											</div>
											{/*end:Menu item*/}
											{/*begin:Menu item*/}
											<div className="menu-item">
												{/*begin:Menu link*/}
												<a className="menu-link" href="authentication/email/promo-3.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
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
										<a className="menu-link" href="authentication/extended/multi-steps-sign-up.html">
											<span className="menu-bullet">
												<span className="bullet bullet-dot"></span>
											</span>
											<span className="menu-title">Multi-steps Sign-up</span>
										</a>
										{/*end:Menu link*/}
									</div>
									{/*end:Menu item*/}
									{/*begin:Menu item*/}
									<div className="menu-item">
										{/*begin:Menu link*/}
										<a className="menu-link" href="authentication/general/welcome.html">
											<span className="menu-bullet">
												<span className="bullet bullet-dot"></span>
											</span>
											<span className="menu-title">Welcome Message</span>
										</a>
										{/*end:Menu link*/}
									</div>
									{/*end:Menu item*/}
									{/*begin:Menu item*/}
									<div className="menu-item">
										{/*begin:Menu link*/}
										<a className="menu-link" href="authentication/general/verify-email.html">
											<span className="menu-bullet">
												<span className="bullet bullet-dot"></span>
											</span>
											<span className="menu-title">Verify Email</span>
										</a>
										{/*end:Menu link*/}
									</div>
									{/*end:Menu item*/}
									{/*begin:Menu item*/}
									<div className="menu-item">
										{/*begin:Menu link*/}
										<a className="menu-link" href="authentication/general/coming-soon.html">
											<span className="menu-bullet">
												<span className="bullet bullet-dot"></span>
											</span>
											<span className="menu-title">Coming Soon</span>
										</a>
										{/*end:Menu link*/}
									</div>
									{/*end:Menu item*/}
									{/*begin:Menu item*/}
									<div className="menu-item">
										{/*begin:Menu link*/}
										<a className="menu-link" href="authentication/general/password-confirmation.html">
											<span className="menu-bullet">
												<span className="bullet bullet-dot"></span>
											</span>
											<span className="menu-title">Password Confirmation</span>
										</a>
										{/*end:Menu link*/}
									</div>
									{/*end:Menu item*/}
									{/*begin:Menu item*/}
									<div className="menu-item">
										{/*begin:Menu link*/}
										<a className="menu-link" href="authentication/general/account-deactivated.html">
											<span className="menu-bullet">
												<span className="bullet bullet-dot"></span>
											</span>
											<span className="menu-title">Account Deactivation</span>
										</a>
										{/*end:Menu link*/}
									</div>
									{/*end:Menu item*/}
									{/*begin:Menu item*/}
									<div className="menu-item">
										{/*begin:Menu link*/}
										<a className="menu-link" href="authentication/general/error-404.html">
											<span className="menu-bullet">
												<span className="bullet bullet-dot"></span>
											</span>
											<span className="menu-title">Error 404</span>
										</a>
										{/*end:Menu link*/}
									</div>
									{/*end:Menu item*/}
									{/*begin:Menu item*/}
									<div className="menu-item">
										{/*begin:Menu link*/}
										<a className="menu-link" href="authentication/general/error-500.html">
											<span className="menu-bullet">
												<span className="bullet bullet-dot"></span>
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
							<div data-kt-menu-trigger="click" className="menu-item menu-accordion">
								{/*begin:Menu link*/}
								<span className="menu-link">
									<span className="menu-bullet">
										<span className="bullet bullet-dot"></span>
									</span>
									<span className="menu-title">Corporate</span>
									<span className="menu-arrow"></span>
								</span>
								{/*end:Menu link*/}
								{/*begin:Menu sub*/}
								<div className="menu-sub menu-sub-accordion">
									{/*begin:Menu item*/}
									<div className="menu-item">
										{/*begin:Menu link*/}
										<a className="menu-link" href="pages/about.html">
											<span className="menu-bullet">
												<span className="bullet bullet-dot"></span>
											</span>
											<span className="menu-title">About</span>
										</a>
										{/*end:Menu link*/}
									</div>
									{/*end:Menu item*/}
									{/*begin:Menu item*/}
									<div className="menu-item">
										{/*begin:Menu link*/}
										<a className="menu-link" href="pages/team.html">
											<span className="menu-bullet">
												<span className="bullet bullet-dot"></span>
											</span>
											<span className="menu-title">Our Team</span>
										</a>
										{/*end:Menu link*/}
									</div>
									{/*end:Menu item*/}
									{/*begin:Menu item*/}
									<div className="menu-item">
										{/*begin:Menu link*/}
										<a className="menu-link" href="pages/contact.html">
											<span className="menu-bullet">
												<span className="bullet bullet-dot"></span>
											</span>
											<span className="menu-title">Contact Us</span>
										</a>
										{/*end:Menu link*/}
									</div>
									{/*end:Menu item*/}
									{/*begin:Menu item*/}
									<div className="menu-item">
										{/*begin:Menu link*/}
										<a className="menu-link" href="pages/licenses.html">
											<span className="menu-bullet">
												<span className="bullet bullet-dot"></span>
											</span>
											<span className="menu-title">Licenses</span>
										</a>
										{/*end:Menu link*/}
									</div>
									{/*end:Menu item*/}
									{/*begin:Menu item*/}
									<div className="menu-item">
										{/*begin:Menu link*/}
										<a className="menu-link" href="pages/sitemap.html">
											<span className="menu-bullet">
												<span className="bullet bullet-dot"></span>
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
							<div data-kt-menu-trigger="click" className="menu-item menu-accordion">
								{/*begin:Menu link*/}
								<span className="menu-link">
									<span className="menu-bullet">
										<span className="bullet bullet-dot"></span>
									</span>
									<span className="menu-title">Social</span>
									<span className="menu-arrow"></span>
								</span>
								{/*end:Menu link*/}
								{/*begin:Menu sub*/}
								<div className="menu-sub menu-sub-accordion">
									{/*begin:Menu item*/}
									<div className="menu-item">
										{/*begin:Menu link*/}
										<a className="menu-link" href="pages/social/feeds.html">
											<span className="menu-bullet">
												<span className="bullet bullet-dot"></span>
											</span>
											<span className="menu-title">Feeds</span>
										</a>
										{/*end:Menu link*/}
									</div>
									{/*end:Menu item*/}
									{/*begin:Menu item*/}
									<div className="menu-item">
										{/*begin:Menu link*/}
										<a className="menu-link" href="pages/social/activity.html">
											<span className="menu-bullet">
												<span className="bullet bullet-dot"></span>
											</span>
											<span className="menu-title">Activty</span>
										</a>
										{/*end:Menu link*/}
									</div>
									{/*end:Menu item*/}
									{/*begin:Menu item*/}
									<div className="menu-item">
										{/*begin:Menu link*/}
										<a className="menu-link" href="pages/social/followers.html">
											<span className="menu-bullet">
												<span className="bullet bullet-dot"></span>
											</span>
											<span className="menu-title">Followers</span>
										</a>
										{/*end:Menu link*/}
									</div>
									{/*end:Menu item*/}
									{/*begin:Menu item*/}
									<div className="menu-item">
										{/*begin:Menu link*/}
										<a className="menu-link" href="pages/social/settings.html">
											<span className="menu-bullet">
												<span className="bullet bullet-dot"></span>
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
							<div data-kt-menu-trigger="click" className="menu-item menu-accordion">
								{/*begin:Menu link*/}
								<span className="menu-link">
									<span className="menu-bullet">
										<span className="bullet bullet-dot"></span>
									</span>
									<span className="menu-title">Blog</span>
									<span className="menu-arrow"></span>
								</span>
								{/*end:Menu link*/}
								{/*begin:Menu sub*/}
								<div className="menu-sub menu-sub-accordion">
									{/*begin:Menu item*/}
									<div className="menu-item">
										{/*begin:Menu link*/}
										<a className="menu-link" href="pages/blog/home.html">
											<span className="menu-bullet">
												<span className="bullet bullet-dot"></span>
											</span>
											<span className="menu-title">Blog Home</span>
										</a>
										{/*end:Menu link*/}
									</div>
									{/*end:Menu item*/}
									{/*begin:Menu item*/}
									<div className="menu-item">
										{/*begin:Menu link*/}
										<a className="menu-link" href="pages/blog/post.html">
											<span className="menu-bullet">
												<span className="bullet bullet-dot"></span>
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
							<div data-kt-menu-trigger="click" className="menu-item menu-accordion">
								{/*begin:Menu link*/}
								<span className="menu-link">
									<span className="menu-bullet">
										<span className="bullet bullet-dot"></span>
									</span>
									<span className="menu-title">Careers</span>
									<span className="menu-arrow"></span>
								</span>
								{/*end:Menu link*/}
								{/*begin:Menu sub*/}
								<div className="menu-sub menu-sub-accordion">
									{/*begin:Menu item*/}
									<div className="menu-item">
										{/*begin:Menu link*/}
										<a className="menu-link" href="pages/careers/list.html">
											<span className="menu-bullet">
												<span className="bullet bullet-dot"></span>
											</span>
											<span className="menu-title">Careers List</span>
										</a>
										{/*end:Menu link*/}
									</div>
									{/*end:Menu item*/}
									{/*begin:Menu item*/}
									<div className="menu-item">
										{/*begin:Menu link*/}
										<a className="menu-link" href="pages/careers/apply.html">
											<span className="menu-bullet">
												<span className="bullet bullet-dot"></span>
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
					<div data-kt-menu-trigger="{default: 'click', lg: 'hover'}" data-kt-menu-placement="right-start" className="menu-item py-2">
						{/*begin:Menu link*/}
						<span className="menu-link menu-center">
							<span className="menu-icon me-0">
								<i className="ki-outline ki-abstract-35 fs-1"></i>
							</span>
						</span>
						{/*end:Menu link*/}
						{/*begin:Menu sub*/}
						<div className="menu-sub menu-sub-dropdown menu-sub-indention px-2 py-4 w-250px mh-75 overflow-auto">
							{/*begin:Menu item*/}
							<div className="menu-item">
								{/*begin:Menu content*/}
								<div className="menu-content">
									<span className="menu-section fs-5 fw-bolder ps-1 py-1">Utilities</span>
								</div>
								{/*end:Menu content*/}
							</div>
							{/*end:Menu item*/}
							{/*begin:Menu item*/}
							<div data-kt-menu-trigger="click" className="menu-item menu-accordion">
								{/*begin:Menu link*/}
								<span className="menu-link">
									<span className="menu-bullet">
										<span className="bullet bullet-dot"></span>
									</span>
									<span className="menu-title">Modals</span>
									<span className="menu-arrow"></span>
								</span>
								{/*end:Menu link*/}
								{/*begin:Menu sub*/}
								<div className="menu-sub menu-sub-accordion menu-active-bg">
									{/*begin:Menu item*/}
									<div data-kt-menu-trigger="click" className="menu-item menu-accordion">
										{/*begin:Menu link*/}
										<span className="menu-link">
											<span className="menu-bullet">
												<span className="bullet bullet-dot"></span>
											</span>
											<span className="menu-title">General</span>
											<span className="menu-arrow"></span>
										</span>
										{/*end:Menu link*/}
										{/*begin:Menu sub*/}
										<div className="menu-sub menu-sub-accordion menu-active-bg">
											{/*begin:Menu item*/}
											<div className="menu-item">
												{/*begin:Menu link*/}
												<a className="menu-link" href="utilities/modals/general/invite-friends.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
													</span>
													<span className="menu-title">Invite Friends</span>
												</a>
												{/*end:Menu link*/}
											</div>
											{/*end:Menu item*/}
											{/*begin:Menu item*/}
											<div className="menu-item">
												{/*begin:Menu link*/}
												<a className="menu-link" href="utilities/modals/general/view-users.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
													</span>
													<span className="menu-title">View Users</span>
												</a>
												{/*end:Menu link*/}
											</div>
											{/*end:Menu item*/}
											{/*begin:Menu item*/}
											<div className="menu-item">
												{/*begin:Menu link*/}
												<a className="menu-link" href="utilities/modals/general/select-users.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
													</span>
													<span className="menu-title">Select Users</span>
												</a>
												{/*end:Menu link*/}
											</div>
											{/*end:Menu item*/}
											{/*begin:Menu item*/}
											<div className="menu-item">
												{/*begin:Menu link*/}
												<a className="menu-link" href="utilities/modals/general/upgrade-plan.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
													</span>
													<span className="menu-title">Upgrade Plan</span>
												</a>
												{/*end:Menu link*/}
											</div>
											{/*end:Menu item*/}
											{/*begin:Menu item*/}
											<div className="menu-item">
												{/*begin:Menu link*/}
												<a className="menu-link" href="utilities/modals/general/share-earn.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
													</span>
													<span className="menu-title">Share & Earn</span>
												</a>
												{/*end:Menu link*/}
											</div>
											{/*end:Menu item*/}
										</div>
										{/*end:Menu sub*/}
									</div>
									{/*end:Menu item*/}
									{/*begin:Menu item*/}
									<div data-kt-menu-trigger="click" className="menu-item menu-accordion">
										{/*begin:Menu link*/}
										<span className="menu-link">
											<span className="menu-bullet">
												<span className="bullet bullet-dot"></span>
											</span>
											<span className="menu-title">Forms</span>
											<span className="menu-arrow"></span>
										</span>
										{/*end:Menu link*/}
										{/*begin:Menu sub*/}
										<div className="menu-sub menu-sub-accordion menu-active-bg">
											{/*begin:Menu item*/}
											<div className="menu-item">
												{/*begin:Menu link*/}
												<a className="menu-link" href="utilities/modals/forms/new-target.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
													</span>
													<span className="menu-title">New Target</span>
												</a>
												{/*end:Menu link*/}
											</div>
											{/*end:Menu item*/}
											{/*begin:Menu item*/}
											<div className="menu-item">
												{/*begin:Menu link*/}
												<a className="menu-link" href="utilities/modals/forms/new-card.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
													</span>
													<span className="menu-title">New Card</span>
												</a>
												{/*end:Menu link*/}
											</div>
											{/*end:Menu item*/}
											{/*begin:Menu item*/}
											<div className="menu-item">
												{/*begin:Menu link*/}
												<a className="menu-link" href="utilities/modals/forms/new-address.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
													</span>
													<span className="menu-title">New Address</span>
												</a>
												{/*end:Menu link*/}
											</div>
											{/*end:Menu item*/}
											{/*begin:Menu item*/}
											<div className="menu-item">
												{/*begin:Menu link*/}
												<a className="menu-link" href="utilities/modals/forms/create-api-key.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
													</span>
													<span className="menu-title">Create API Key</span>
												</a>
												{/*end:Menu link*/}
											</div>
											{/*end:Menu item*/}
											{/*begin:Menu item*/}
											<div className="menu-item">
												{/*begin:Menu link*/}
												<a className="menu-link" href="utilities/modals/forms/bidding.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
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
									<div data-kt-menu-trigger="click" className="menu-item menu-accordion">
										{/*begin:Menu link*/}
										<span className="menu-link">
											<span className="menu-bullet">
												<span className="bullet bullet-dot"></span>
											</span>
											<span className="menu-title">Wizards</span>
											<span className="menu-arrow"></span>
										</span>
										{/*end:Menu link*/}
										{/*begin:Menu sub*/}
										<div className="menu-sub menu-sub-accordion menu-active-bg">
											{/*begin:Menu item*/}
											<div className="menu-item">
												{/*begin:Menu link*/}
												<a className="menu-link" href="utilities/modals/wizards/create-app.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
													</span>
													<span className="menu-title">Create App</span>
												</a>
												{/*end:Menu link*/}
											</div>
											{/*end:Menu item*/}
											{/*begin:Menu item*/}
											<div className="menu-item">
												{/*begin:Menu link*/}
												<a className="menu-link" href="utilities/modals/wizards/create-campaign.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
													</span>
													<span className="menu-title">Create Campaign</span>
												</a>
												{/*end:Menu link*/}
											</div>
											{/*end:Menu item*/}
											{/*begin:Menu item*/}
											<div className="menu-item">
												{/*begin:Menu link*/}
												<a className="menu-link" href="utilities/modals/wizards/create-account.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
													</span>
													<span className="menu-title">Create Business Acc</span>
												</a>
												{/*end:Menu link*/}
											</div>
											{/*end:Menu item*/}
											{/*begin:Menu item*/}
											<div className="menu-item">
												{/*begin:Menu link*/}
												<a className="menu-link" href="utilities/modals/wizards/create-project.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
													</span>
													<span className="menu-title">Create Project</span>
												</a>
												{/*end:Menu link*/}
											</div>
											{/*end:Menu item*/}
											{/*begin:Menu item*/}
											<div className="menu-item">
												{/*begin:Menu link*/}
												<a className="menu-link" href="utilities/modals/wizards/top-up-wallet.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
													</span>
													<span className="menu-title">Top Up Wallet</span>
												</a>
												{/*end:Menu link*/}
											</div>
											{/*end:Menu item*/}
											{/*begin:Menu item*/}
											<div className="menu-item">
												{/*begin:Menu link*/}
												<a className="menu-link" href="utilities/modals/wizards/offer-a-deal.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
													</span>
													<span className="menu-title">Offer a Deal</span>
												</a>
												{/*end:Menu link*/}
											</div>
											{/*end:Menu item*/}
											{/*begin:Menu item*/}
											<div className="menu-item">
												{/*begin:Menu link*/}
												<a className="menu-link" href="utilities/modals/wizards/two-factor-authentication.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
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
									<div data-kt-menu-trigger="click" className="menu-item menu-accordion">
										{/*begin:Menu link*/}
										<span className="menu-link">
											<span className="menu-bullet">
												<span className="bullet bullet-dot"></span>
											</span>
											<span className="menu-title">Search</span>
											<span className="menu-arrow"></span>
										</span>
										{/*end:Menu link*/}
										{/*begin:Menu sub*/}
										<div className="menu-sub menu-sub-accordion menu-active-bg">
											{/*begin:Menu item*/}
											<div className="menu-item">
												{/*begin:Menu link*/}
												<a className="menu-link" href="utilities/modals/search/users.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
													</span>
													<span className="menu-title">Users</span>
												</a>
												{/*end:Menu link*/}
											</div>
											{/*end:Menu item*/}
											{/*begin:Menu item*/}
											<div className="menu-item">
												{/*begin:Menu link*/}
												<a className="menu-link" href="utilities/modals/search/select-location.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
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
							<div data-kt-menu-trigger="click" className="menu-item menu-accordion">
								{/*begin:Menu link*/}
								<span className="menu-link">
									<span className="menu-bullet">
										<span className="bullet bullet-dot"></span>
									</span>
									<span className="menu-title">Wizards</span>
									<span className="menu-arrow"></span>
								</span>
								{/*end:Menu link*/}
								{/*begin:Menu sub*/}
								<div className="menu-sub menu-sub-accordion menu-active-bg">
									{/*begin:Menu item*/}
									<div className="menu-item">
										{/*begin:Menu link*/}
										<a className="menu-link" href="utilities/wizards/horizontal.html">
											<span className="menu-bullet">
												<span className="bullet bullet-dot"></span>
											</span>
											<span className="menu-title">Horizontal</span>
										</a>
										{/*end:Menu link*/}
									</div>
									{/*end:Menu item*/}
									{/*begin:Menu item*/}
									<div className="menu-item">
										{/*begin:Menu link*/}
										<a className="menu-link" href="utilities/wizards/vertical.html">
											<span className="menu-bullet">
												<span className="bullet bullet-dot"></span>
											</span>
											<span className="menu-title">Vertical</span>
										</a>
										{/*end:Menu link*/}
									</div>
									{/*end:Menu item*/}
									{/*begin:Menu item*/}
									<div className="menu-item">
										{/*begin:Menu link*/}
										<a className="menu-link" href="utilities/wizards/two-factor-authentication.html">
											<span className="menu-bullet">
												<span className="bullet bullet-dot"></span>
											</span>
											<span className="menu-title">Two Factor Auth</span>
										</a>
										{/*end:Menu link*/}
									</div>
									{/*end:Menu item*/}
									{/*begin:Menu item*/}
									<div className="menu-item">
										{/*begin:Menu link*/}
										<a className="menu-link" href="utilities/wizards/create-app.html">
											<span className="menu-bullet">
												<span className="bullet bullet-dot"></span>
											</span>
											<span className="menu-title">Create App</span>
										</a>
										{/*end:Menu link*/}
									</div>
									{/*end:Menu item*/}
									{/*begin:Menu item*/}
									<div className="menu-item">
										{/*begin:Menu link*/}
										<a className="menu-link" href="utilities/wizards/create-campaign.html">
											<span className="menu-bullet">
												<span className="bullet bullet-dot"></span>
											</span>
											<span className="menu-title">Create Campaign</span>
										</a>
										{/*end:Menu link*/}
									</div>
									{/*end:Menu item*/}
									{/*begin:Menu item*/}
									<div className="menu-item">
										{/*begin:Menu link*/}
										<a className="menu-link" href="utilities/wizards/create-account.html">
											<span className="menu-bullet">
												<span className="bullet bullet-dot"></span>
											</span>
											<span className="menu-title">Create Account</span>
										</a>
										{/*end:Menu link*/}
									</div>
									{/*end:Menu item*/}
									{/*begin:Menu item*/}
									<div className="menu-item">
										{/*begin:Menu link*/}
										<a className="menu-link" href="utilities/wizards/create-project.html">
											<span className="menu-bullet">
												<span className="bullet bullet-dot"></span>
											</span>
											<span className="menu-title">Create Project</span>
										</a>
										{/*end:Menu link*/}
									</div>
									{/*end:Menu item*/}
									{/*begin:Menu item*/}
									<div className="menu-item">
										{/*begin:Menu link*/}
										<a className="menu-link" href="utilities/modals/wizards/top-up-wallet.html">
											<span className="menu-bullet">
												<span className="bullet bullet-dot"></span>
											</span>
											<span className="menu-title">Top Up Wallet</span>
										</a>
										{/*end:Menu link*/}
									</div>
									{/*end:Menu item*/}
									{/*begin:Menu item*/}
									<div className="menu-item">
										{/*begin:Menu link*/}
										<a className="menu-link" href="utilities/wizards/offer-a-deal.html">
											<span className="menu-bullet">
												<span className="bullet bullet-dot"></span>
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
							<div data-kt-menu-trigger="click" className="menu-item menu-accordion">
								{/*begin:Menu link*/}
								<span className="menu-link">
									<span className="menu-bullet">
										<span className="bullet bullet-dot"></span>
									</span>
									<span className="menu-title">Search</span>
									<span className="menu-arrow"></span>
								</span>
								{/*end:Menu link*/}
								{/*begin:Menu sub*/}
								<div className="menu-sub menu-sub-accordion menu-active-bg">
									{/*begin:Menu item*/}
									<div className="menu-item">
										{/*begin:Menu link*/}
										<a className="menu-link" href="utilities/search/horizontal.html">
											<span className="menu-bullet">
												<span className="bullet bullet-dot"></span>
											</span>
											<span className="menu-title">Horizontal</span>
										</a>
										{/*end:Menu link*/}
									</div>
									{/*end:Menu item*/}
									{/*begin:Menu item*/}
									<div className="menu-item">
										{/*begin:Menu link*/}
										<a className="menu-link" href="utilities/search/vertical.html">
											<span className="menu-bullet">
												<span className="bullet bullet-dot"></span>
											</span>
											<span className="menu-title">Vertical</span>
										</a>
										{/*end:Menu link*/}
									</div>
									{/*end:Menu item*/}
									{/*begin:Menu item*/}
									<div className="menu-item">
										{/*begin:Menu link*/}
										<a className="menu-link" href="utilities/search/users.html">
											<span className="menu-bullet">
												<span className="bullet bullet-dot"></span>
											</span>
											<span className="menu-title">Users</span>
										</a>
										{/*end:Menu link*/}
									</div>
									{/*end:Menu item*/}
									{/*begin:Menu item*/}
									<div className="menu-item">
										{/*begin:Menu link*/}
										<a className="menu-link" href="utilities/search/select-location.html">
											<span className="menu-bullet">
												<span className="bullet bullet-dot"></span>
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
					<div data-kt-menu-trigger="{default: 'click', lg: 'hover'}" data-kt-menu-placement="right-start" className="menu-item py-2">
						{/*begin:Menu link*/}
						<span className="menu-link menu-center">
							<span className="menu-icon me-0">
								<i className={`ki-outline ${isSuperAdmin === true ? 'ki-setting-2' : 'ki-abstract-26'} fs-1`}></i>
							</span>
						</span>
						{/*end:Menu link*/}
						{/*begin:Menu sub*/}
						<div className="menu-sub menu-sub-dropdown menu-sub-indention px-2 py-4 w-250px mh-75 overflow-auto">
							{/*begin:Menu item*/}
							{isSuperAdmin === true ? (
								<>
									<div className="menu-item">
										<div className="menu-content">
											<span className="menu-section fs-5 fw-bolder ps-1 py-1">Admin</span>
										</div>
									</div>
									<div className="menu-item">
										<a className="menu-link" href="/dashboard/admin">
											<span className="menu-bullet"><span className="bullet bullet-dot"></span></span>
											<span className="menu-title">Dashboard</span>
										</a>
									</div>
									<div className="menu-item">
										<a className="menu-link" href="/dashboard/admin/prompts">
											<span className="menu-bullet"><span className="bullet bullet-dot"></span></span>
											<span className="menu-title">Prompts</span>
										</a>
									</div>
								</>
							) : (
								<>
									<div className="menu-item">
										{/*begin:Menu content*/}
										<div className="menu-content">
											<span className="menu-section fs-5 fw-bolder ps-1 py-1">Apps</span>
										</div>
										{/*end:Menu content*/}
									</div>
									{/*end:Menu item*/}
									{/*begin:Menu item*/}
									<div data-kt-menu-trigger="click" className="menu-item menu-accordion">
										{/*begin:Menu link*/}
										<span className="menu-link">
											<span className="menu-icon">
												<i className="ki-outline ki-rocket fs-2"></i>
											</span>
											<span className="menu-title">Projects</span>
											<span className="menu-arrow"></span>
										</span>
										{/*end:Menu link*/}
										{/*begin:Menu sub*/}
										<div className="menu-sub menu-sub-accordion">
											{/*begin:Menu item*/}
											<div className="menu-item">
												{/*begin:Menu link*/}
												<a className="menu-link" href="apps/projects/list.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
													</span>
													<span className="menu-title">My Projects</span>
												</a>
												{/*end:Menu link*/}
											</div>
											{/*end:Menu item*/}
											{/*begin:Menu item*/}
											<div className="menu-item">
												{/*begin:Menu link*/}
												<a className="menu-link" href="apps/projects/project.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
													</span>
													<span className="menu-title">View Project</span>
												</a>
												{/*end:Menu link*/}
											</div>
											{/*end:Menu item*/}
											{/*begin:Menu item*/}
											<div className="menu-item">
												{/*begin:Menu link*/}
												<a className="menu-link" href="apps/projects/targets.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
													</span>
													<span className="menu-title">Targets</span>
												</a>
												{/*end:Menu link*/}
											</div>
											{/*end:Menu item*/}
											{/*begin:Menu item*/}
											<div className="menu-item">
												{/*begin:Menu link*/}
												<a className="menu-link" href="apps/projects/budget.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
													</span>
													<span className="menu-title">Budget</span>
												</a>
												{/*end:Menu link*/}
											</div>
											{/*end:Menu item*/}
											{/*begin:Menu item*/}
											<div className="menu-item">
												{/*begin:Menu link*/}
												<a className="menu-link" href="apps/projects/users.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
													</span>
													<span className="menu-title">Users</span>
												</a>
												{/*end:Menu link*/}
											</div>
											{/*end:Menu item*/}
											{/*begin:Menu item*/}
											<div className="menu-item">
												{/*begin:Menu link*/}
												<a className="menu-link" href="apps/projects/files.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
													</span>
													<span className="menu-title">Files</span>
												</a>
												{/*end:Menu link*/}
											</div>
											{/*end:Menu item*/}
											{/*begin:Menu item*/}
											<div className="menu-item">
												{/*begin:Menu link*/}
												<a className="menu-link" href="apps/projects/activity.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
													</span>
													<span className="menu-title">Activity</span>
												</a>
												{/*end:Menu link*/}
											</div>
											{/*end:Menu item*/}
											{/*begin:Menu item*/}
											<div className="menu-item">
												{/*begin:Menu link*/}
												<a className="menu-link" href="apps/projects/settings.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
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
									<div data-kt-menu-trigger="click" className="menu-item menu-accordion">
										{/*begin:Menu link*/}
										<span className="menu-link">
											<span className="menu-icon">
												<i className="ki-outline ki-handcart fs-2"></i>
											</span>
											<span className="menu-title">eCommerce</span>
											<span className="menu-arrow"></span>
										</span>
										{/*end:Menu link*/}
										{/*begin:Menu sub*/}
										<div className="menu-sub menu-sub-accordion">
											{/*begin:Menu item*/}
											<div data-kt-menu-trigger="click" className="menu-item menu-accordion">
												{/*begin:Menu link*/}
												<span className="menu-link">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
													</span>
													<span className="menu-title">Catalog</span>
													<span className="menu-arrow"></span>
												</span>
												{/*end:Menu link*/}
												{/*begin:Menu sub*/}
												<div className="menu-sub menu-sub-accordion">
													{/*begin:Menu item*/}
													<div className="menu-item">
														{/*begin:Menu link*/}
														<a className="menu-link" href="apps/ecommerce/catalog/products.html">
															<span className="menu-bullet">
																<span className="bullet bullet-dot"></span>
															</span>
															<span className="menu-title">Products</span>
														</a>
														{/*end:Menu link*/}
													</div>
													{/*end:Menu item*/}
													{/*begin:Menu item*/}
													<div className="menu-item">
														{/*begin:Menu link*/}
														<a className="menu-link" href="apps/ecommerce/catalog/categories.html">
															<span className="menu-bullet">
																<span className="bullet bullet-dot"></span>
															</span>
															<span className="menu-title">Categories</span>
														</a>
														{/*end:Menu link*/}
													</div>
													{/*end:Menu item*/}
													{/*begin:Menu item*/}
													<div className="menu-item">
														{/*begin:Menu link*/}
														<a className="menu-link" href="apps/ecommerce/catalog/add-product.html">
															<span className="menu-bullet">
																<span className="bullet bullet-dot"></span>
															</span>
															<span className="menu-title">Add Product</span>
														</a>
														{/*end:Menu link*/}
													</div>
													{/*end:Menu item*/}
													{/*begin:Menu item*/}
													<div className="menu-item">
														{/*begin:Menu link*/}
														<a className="menu-link" href="apps/ecommerce/catalog/edit-product.html">
															<span className="menu-bullet">
																<span className="bullet bullet-dot"></span>
															</span>
															<span className="menu-title">Edit Product</span>
														</a>
														{/*end:Menu link*/}
													</div>
													{/*end:Menu item*/}
													{/*begin:Menu item*/}
													<div className="menu-item">
														{/*begin:Menu link*/}
														<a className="menu-link" href="apps/ecommerce/catalog/add-category.html">
															<span className="menu-bullet">
																<span className="bullet bullet-dot"></span>
															</span>
															<span className="menu-title">Add Category</span>
														</a>
														{/*end:Menu link*/}
													</div>
													{/*end:Menu item*/}
													{/*begin:Menu item*/}
													<div className="menu-item">
														{/*begin:Menu link*/}
														<a className="menu-link" href="apps/ecommerce/catalog/edit-category.html">
															<span className="menu-bullet">
																<span className="bullet bullet-dot"></span>
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
											<div data-kt-menu-trigger="click" className="menu-item menu-accordion">
												{/*begin:Menu link*/}
												<span className="menu-link">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
													</span>
													<span className="menu-title">Sales</span>
													<span className="menu-arrow"></span>
												</span>
												{/*end:Menu link*/}
												{/*begin:Menu sub*/}
												<div className="menu-sub menu-sub-accordion">
													{/*begin:Menu item*/}
													<div className="menu-item">
														{/*begin:Menu link*/}
														<a className="menu-link" href="apps/ecommerce/sales/listing.html">
															<span className="menu-bullet">
																<span className="bullet bullet-dot"></span>
															</span>
															<span className="menu-title">Orders Listing</span>
														</a>
														{/*end:Menu link*/}
													</div>
													{/*end:Menu item*/}
													{/*begin:Menu item*/}
													<div className="menu-item">
														{/*begin:Menu link*/}
														<a className="menu-link" href="apps/ecommerce/sales/details.html">
															<span className="menu-bullet">
																<span className="bullet bullet-dot"></span>
															</span>
															<span className="menu-title">Order Details</span>
														</a>
														{/*end:Menu link*/}
													</div>
													{/*end:Menu item*/}
													{/*begin:Menu item*/}
													<div className="menu-item">
														{/*begin:Menu link*/}
														<a className="menu-link" href="apps/ecommerce/sales/add-order.html">
															<span className="menu-bullet">
																<span className="bullet bullet-dot"></span>
															</span>
															<span className="menu-title">Add Order</span>
														</a>
														{/*end:Menu link*/}
													</div>
													{/*end:Menu item*/}
													{/*begin:Menu item*/}
													<div className="menu-item">
														{/*begin:Menu link*/}
														<a className="menu-link" href="apps/ecommerce/sales/edit-order.html">
															<span className="menu-bullet">
																<span className="bullet bullet-dot"></span>
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
											<div data-kt-menu-trigger="click" className="menu-item menu-accordion">
												{/*begin:Menu link*/}
												<span className="menu-link">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
													</span>
													<span className="menu-title">Customers</span>
													<span className="menu-arrow"></span>
												</span>
												{/*end:Menu link*/}
												{/*begin:Menu sub*/}
												<div className="menu-sub menu-sub-accordion">
													{/*begin:Menu item*/}
													<div className="menu-item">
														{/*begin:Menu link*/}
														<a className="menu-link" href="apps/ecommerce/customers/listing.html">
															<span className="menu-bullet">
																<span className="bullet bullet-dot"></span>
															</span>
															<span className="menu-title">Customer Listing</span>
														</a>
														{/*end:Menu link*/}
													</div>
													{/*end:Menu item*/}
													{/*begin:Menu item*/}
													<div className="menu-item">
														{/*begin:Menu link*/}
														<a className="menu-link" href="apps/ecommerce/customers/details.html">
															<span className="menu-bullet">
																<span className="bullet bullet-dot"></span>
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
											<div data-kt-menu-trigger="click" className="menu-item menu-accordion">
												{/*begin:Menu link*/}
												<span className="menu-link">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
													</span>
													<span className="menu-title">Reports</span>
													<span className="menu-arrow"></span>
												</span>
												{/*end:Menu link*/}
												{/*begin:Menu sub*/}
												<div className="menu-sub menu-sub-accordion">
													{/*begin:Menu item*/}
													<div className="menu-item">
														{/*begin:Menu link*/}
														<a className="menu-link" href="apps/ecommerce/reports/view.html">
															<span className="menu-bullet">
																<span className="bullet bullet-dot"></span>
															</span>
															<span className="menu-title">Products Viewed</span>
														</a>
														{/*end:Menu link*/}
													</div>
													{/*end:Menu item*/}
													{/*begin:Menu item*/}
													<div className="menu-item">
														{/*begin:Menu link*/}
														<a className="menu-link" href="apps/ecommerce/reports/sales.html">
															<span className="menu-bullet">
																<span className="bullet bullet-dot"></span>
															</span>
															<span className="menu-title">Sales</span>
														</a>
														{/*end:Menu link*/}
													</div>
													{/*end:Menu item*/}
													{/*begin:Menu item*/}
													<div className="menu-item">
														{/*begin:Menu link*/}
														<a className="menu-link" href="apps/ecommerce/reports/returns.html">
															<span className="menu-bullet">
																<span className="bullet bullet-dot"></span>
															</span>
															<span className="menu-title">Returns</span>
														</a>
														{/*end:Menu link*/}
													</div>
													{/*end:Menu item*/}
													{/*begin:Menu item*/}
													<div className="menu-item">
														{/*begin:Menu link*/}
														<a className="menu-link" href="apps/ecommerce/reports/customer-orders.html">
															<span className="menu-bullet">
																<span className="bullet bullet-dot"></span>
															</span>
															<span className="menu-title">Customer Orders</span>
														</a>
														{/*end:Menu link*/}
													</div>
													{/*end:Menu item*/}
													{/*begin:Menu item*/}
													<div className="menu-item">
														{/*begin:Menu link*/}
														<a className="menu-link" href="apps/ecommerce/reports/shipping.html">
															<span className="menu-bullet">
																<span className="bullet bullet-dot"></span>
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
												<a className="menu-link" href="apps/ecommerce/settings.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
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
									<div data-kt-menu-trigger="click" className="menu-item menu-accordion">
										{/*begin:Menu link*/}
										<span className="menu-link">
											<span className="menu-icon">
												<i className="ki-outline ki-phone fs-2"></i>
											</span>
											<span className="menu-title">Contacts</span>
											<span className="menu-arrow"></span>
										</span>
										{/*end:Menu link*/}
										{/*begin:Menu sub*/}
										<div className="menu-sub menu-sub-accordion">
											{/*begin:Menu item*/}
											<div className="menu-item">
												{/*begin:Menu link*/}
												<a className="menu-link" href="apps/contacts/getting-started.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
													</span>
													<span className="menu-title">Getting Started</span>
												</a>
												{/*end:Menu link*/}
											</div>
											{/*end:Menu item*/}
											{/*begin:Menu item*/}
											<div className="menu-item">
												{/*begin:Menu link*/}
												<a className="menu-link" href="apps/contacts/add-contact.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
													</span>
													<span className="menu-title">Add Contact</span>
												</a>
												{/*end:Menu link*/}
											</div>
											{/*end:Menu item*/}
											{/*begin:Menu item*/}
											<div className="menu-item">
												{/*begin:Menu link*/}
												<a className="menu-link" href="apps/contacts/edit-contact.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
													</span>
													<span className="menu-title">Edit Contact</span>
												</a>
												{/*end:Menu link*/}
											</div>
											{/*end:Menu item*/}
											{/*begin:Menu item*/}
											<div className="menu-item">
												{/*begin:Menu link*/}
												<a className="menu-link" href="apps/contacts/view-contact.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
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
									<div data-kt-menu-trigger="click" className="menu-item menu-accordion">
										{/*begin:Menu link*/}
										<span className="menu-link">
											<span className="menu-icon">
												<i className="ki-outline ki-chart fs-2"></i>
											</span>
											<span className="menu-title">Support Center</span>
											<span className="menu-arrow"></span>
										</span>
										{/*end:Menu link*/}
										{/*begin:Menu sub*/}
										<div className="menu-sub menu-sub-accordion">
											{/*begin:Menu item*/}
											<div className="menu-item">
												{/*begin:Menu link*/}
												<a className="menu-link" href="apps/support-center/overview.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
													</span>
													<span className="menu-title">Overview</span>
												</a>
												{/*end:Menu link*/}
											</div>
											{/*end:Menu item*/}
											{/*begin:Menu item*/}
											<div data-kt-menu-trigger="click" className="menu-item menu-accordion mb-1">
												{/*begin:Menu link*/}
												<span className="menu-link">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
													</span>
													<span className="menu-title">Tickets</span>
													<span className="menu-arrow"></span>
												</span>
												{/*end:Menu link*/}
												{/*begin:Menu sub*/}
												<div className="menu-sub menu-sub-accordion">
													{/*begin:Menu item*/}
													<div className="menu-item">
														{/*begin:Menu link*/}
														<a className="menu-link" href="apps/support-center/tickets/list.html">
															<span className="menu-bullet">
																<span className="bullet bullet-dot"></span>
															</span>
															<span className="menu-title">Tickets List</span>
														</a>
														{/*end:Menu link*/}
													</div>
													{/*end:Menu item*/}
													{/*begin:Menu item*/}
													<div className="menu-item">
														{/*begin:Menu link*/}
														<a className="menu-link" href="apps/support-center/tickets/view.html">
															<span className="menu-bullet">
																<span className="bullet bullet-dot"></span>
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
											<div data-kt-menu-trigger="click" className="menu-item menu-accordion mb-1">
												{/*begin:Menu link*/}
												<span className="menu-link">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
													</span>
													<span className="menu-title">Tutorials</span>
													<span className="menu-arrow"></span>
												</span>
												{/*end:Menu link*/}
												{/*begin:Menu sub*/}
												<div className="menu-sub menu-sub-accordion">
													{/*begin:Menu item*/}
													<div className="menu-item">
														{/*begin:Menu link*/}
														<a className="menu-link" href="apps/support-center/tutorials/list.html">
															<span className="menu-bullet">
																<span className="bullet bullet-dot"></span>
															</span>
															<span className="menu-title">Tutorials List</span>
														</a>
														{/*end:Menu link*/}
													</div>
													{/*end:Menu item*/}
													{/*begin:Menu item*/}
													<div className="menu-item">
														{/*begin:Menu link*/}
														<a className="menu-link" href="apps/support-center/tutorials/post.html">
															<span className="menu-bullet">
																<span className="bullet bullet-dot"></span>
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
												<a className="menu-link" href="apps/support-center/faq.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
													</span>
													<span className="menu-title">FAQ</span>
												</a>
												{/*end:Menu link*/}
											</div>
											{/*end:Menu item*/}
											{/*begin:Menu item*/}
											<div className="menu-item">
												{/*begin:Menu link*/}
												<a className="menu-link" href="apps/support-center/licenses.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
													</span>
													<span className="menu-title">Licenses</span>
												</a>
												{/*end:Menu link*/}
											</div>
											{/*end:Menu item*/}
											{/*begin:Menu item*/}
											<div className="menu-item">
												{/*begin:Menu link*/}
												<a className="menu-link" href="apps/support-center/contact.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
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
									<div data-kt-menu-trigger="click" className="menu-item menu-accordion">
										{/*begin:Menu link*/}
										<span className="menu-link">
											<span className="menu-icon">
												<i className="ki-outline ki-shield-tick fs-2"></i>
											</span>
											<span className="menu-title">User Management</span>
											<span className="menu-arrow"></span>
										</span>
										{/*end:Menu link*/}
										{/*begin:Menu sub*/}
										<div className="menu-sub menu-sub-accordion">
											{/*begin:Menu item*/}
											<div data-kt-menu-trigger="click" className="menu-item menu-accordion mb-1">
												{/*begin:Menu link*/}
												<span className="menu-link">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
													</span>
													<span className="menu-title">Users</span>
													<span className="menu-arrow"></span>
												</span>
												{/*end:Menu link*/}
												{/*begin:Menu sub*/}
												<div className="menu-sub menu-sub-accordion">
													{/*begin:Menu item*/}
													<div className="menu-item">
														{/*begin:Menu link*/}
														<a className="menu-link" href="apps/user-management/users/list.html">
															<span className="menu-bullet">
																<span className="bullet bullet-dot"></span>
															</span>
															<span className="menu-title">Users List</span>
														</a>
														{/*end:Menu link*/}
													</div>
													{/*end:Menu item*/}
													{/*begin:Menu item*/}
													<div className="menu-item">
														{/*begin:Menu link*/}
														<a className="menu-link" href="apps/user-management/users/view.html">
															<span className="menu-bullet">
																<span className="bullet bullet-dot"></span>
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
											<div data-kt-menu-trigger="click" className="menu-item menu-accordion">
												{/*begin:Menu link*/}
												<span className="menu-link">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
													</span>
													<span className="menu-title">Roles</span>
													<span className="menu-arrow"></span>
												</span>
												{/*end:Menu link*/}
												{/*begin:Menu sub*/}
												<div className="menu-sub menu-sub-accordion">
													{/*begin:Menu item*/}
													<div className="menu-item">
														{/*begin:Menu link*/}
														<a className="menu-link" href="apps/user-management/roles/list.html">
															<span className="menu-bullet">
																<span className="bullet bullet-dot"></span>
															</span>
															<span className="menu-title">Roles List</span>
														</a>
														{/*end:Menu link*/}
													</div>
													{/*end:Menu item*/}
													{/*begin:Menu item*/}
													<div className="menu-item">
														{/*begin:Menu link*/}
														<a className="menu-link" href="apps/user-management/roles/view.html">
															<span className="menu-bullet">
																<span className="bullet bullet-dot"></span>
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
												<a className="menu-link" href="apps/user-management/permissions.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
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
									<div data-kt-menu-trigger="click" className="menu-item menu-accordion">
										{/*begin:Menu link*/}
										<span className="menu-link">
											<span className="menu-icon">
												<i className="ki-outline ki-briefcase fs-2"></i>
											</span>
											<span className="menu-title">Customers</span>
											<span className="menu-arrow"></span>
										</span>
										{/*end:Menu link*/}
										{/*begin:Menu sub*/}
										<div className="menu-sub menu-sub-accordion">
											{/*begin:Menu item*/}
											<div className="menu-item">
												{/*begin:Menu link*/}
												<a className="menu-link" href="apps/customers/getting-started.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
													</span>
													<span className="menu-title">Getting Started</span>
												</a>
												{/*end:Menu link*/}
											</div>
											{/*end:Menu item*/}
											{/*begin:Menu item*/}
											<div className="menu-item">
												{/*begin:Menu link*/}
												<a className="menu-link" href="apps/customers/list.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
													</span>
													<span className="menu-title">Customer Listing</span>
												</a>
												{/*end:Menu link*/}
											</div>
											{/*end:Menu item*/}
											{/*begin:Menu item*/}
											<div className="menu-item">
												{/*begin:Menu link*/}
												<a className="menu-link" href="apps/customers/view.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
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
									<div data-kt-menu-trigger="click" className="menu-item menu-accordion">
										{/*begin:Menu link*/}
										<span className="menu-link">
											<span className="menu-icon">
												<i className="ki-outline ki-map fs-2"></i>
											</span>
											<span className="menu-title">Subscription</span>
											<span className="menu-arrow"></span>
										</span>
										{/*end:Menu link*/}
										{/*begin:Menu sub*/}
										<div className="menu-sub menu-sub-accordion">
											{/*begin:Menu item*/}
											<div className="menu-item">
												{/*begin:Menu link*/}
												<a className="menu-link" href="apps/subscriptions/getting-started.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
													</span>
													<span className="menu-title">Getting Started</span>
												</a>
												{/*end:Menu link*/}
											</div>
											{/*end:Menu item*/}
											{/*begin:Menu item*/}
											<div className="menu-item">
												{/*begin:Menu link*/}
												<a className="menu-link" href="apps/subscriptions/list.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
													</span>
													<span className="menu-title">Subscription List</span>
												</a>
												{/*end:Menu link*/}
											</div>
											{/*end:Menu item*/}
											{/*begin:Menu item*/}
											<div className="menu-item">
												{/*begin:Menu link*/}
												<a className="menu-link" href="apps/subscriptions/add.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
													</span>
													<span className="menu-title">Add Subscription</span>
												</a>
												{/*end:Menu link*/}
											</div>
											{/*end:Menu item*/}
											{/*begin:Menu item*/}
											<div className="menu-item">
												{/*begin:Menu link*/}
												<a className="menu-link" href="apps/subscriptions/view.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
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
									<div data-kt-menu-trigger="click" className="menu-item menu-accordion">
										{/*begin:Menu link*/}
										<span className="menu-link">
											<span className="menu-icon">
												<i className="ki-outline ki-credit-cart fs-2"></i>
											</span>
											<span className="menu-title">Invoice Manager</span>
											<span className="menu-arrow"></span>
										</span>
										{/*end:Menu link*/}
										{/*begin:Menu sub*/}
										<div className="menu-sub menu-sub-accordion">
											{/*begin:Menu item*/}
											<div data-kt-menu-trigger="click" className="menu-item menu-accordion">
												{/*begin:Menu link*/}
												<span className="menu-link">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
													</span>
													<span className="menu-title">View Invoices</span>
													<span className="menu-arrow"></span>
												</span>
												{/*end:Menu link*/}
												{/*begin:Menu sub*/}
												<div className="menu-sub menu-sub-accordion menu-active-bg">
													{/*begin:Menu item*/}
													<div className="menu-item">
														{/*begin:Menu link*/}
														<a className="menu-link" href="apps/invoices/view/invoice-1.html">
															<span className="menu-bullet">
																<span className="bullet bullet-dot"></span>
															</span>
															<span className="menu-title">Invoice 1</span>
														</a>
														{/*end:Menu link*/}
													</div>
													{/*end:Menu item*/}
													{/*begin:Menu item*/}
													<div className="menu-item">
														{/*begin:Menu link*/}
														<a className="menu-link" href="apps/invoices/view/invoice-2.html">
															<span className="menu-bullet">
																<span className="bullet bullet-dot"></span>
															</span>
															<span className="menu-title">Invoice 2</span>
														</a>
														{/*end:Menu link*/}
													</div>
													{/*end:Menu item*/}
													{/*begin:Menu item*/}
													<div className="menu-item">
														{/*begin:Menu link*/}
														<a className="menu-link" href="apps/invoices/view/invoice-3.html">
															<span className="menu-bullet">
																<span className="bullet bullet-dot"></span>
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
												<a className="menu-link" href="apps/invoices/create.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
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
									<div data-kt-menu-trigger="click" className="menu-item menu-accordion">
										{/*begin:Menu link*/}
										<span className="menu-link">
											<span className="menu-icon">
												<i className="ki-outline ki-file-added fs-2"></i>
											</span>
											<span className="menu-title">File Manager</span>
											<span className="menu-arrow"></span>
										</span>
										{/*end:Menu link*/}
										{/*begin:Menu sub*/}
										<div className="menu-sub menu-sub-accordion">
											{/*begin:Menu item*/}
											<div className="menu-item">
												{/*begin:Menu link*/}
												<a className="menu-link" href="apps/file-manager/folders.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
													</span>
													<span className="menu-title">Folders</span>
												</a>
												{/*end:Menu link*/}
											</div>
											{/*end:Menu item*/}
											{/*begin:Menu item*/}
											<div className="menu-item">
												{/*begin:Menu link*/}
												<a className="menu-link" href="apps/file-manager/files.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
													</span>
													<span className="menu-title">Files</span>
												</a>
												{/*end:Menu link*/}
											</div>
											{/*end:Menu item*/}
											{/*begin:Menu item*/}
											<div className="menu-item">
												{/*begin:Menu link*/}
												<a className="menu-link" href="apps/file-manager/blank.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
													</span>
													<span className="menu-title">Blank Directory</span>
												</a>
												{/*end:Menu link*/}
											</div>
											{/*end:Menu item*/}
											{/*begin:Menu item*/}
											<div className="menu-item">
												{/*begin:Menu link*/}
												<a className="menu-link" href="apps/file-manager/settings.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
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
									<div data-kt-menu-trigger="click" className="menu-item menu-accordion">
										{/*begin:Menu link*/}
										<span className="menu-link">
											<span className="menu-icon">
												<i className="ki-outline ki-sms fs-2"></i>
											</span>
											<span className="menu-title">Inbox</span>
											<span className="menu-arrow"></span>
										</span>
										{/*end:Menu link*/}
										{/*begin:Menu sub*/}
										<div className="menu-sub menu-sub-accordion">
											{/*begin:Menu item*/}
											<div className="menu-item">
												{/*begin:Menu link*/}
												<a className="menu-link" href="apps/inbox/listing.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
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
												<a className="menu-link" href="apps/inbox/compose.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
													</span>
													<span className="menu-title">Compose</span>
												</a>
												{/*end:Menu link*/}
											</div>
											{/*end:Menu item*/}
											{/*begin:Menu item*/}
											<div className="menu-item">
												{/*begin:Menu link*/}
												<a className="menu-link" href="apps/inbox/reply.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
													</span>
													<span className="menu-title">View & Reply</span>
												</a>
												{/*end:Menu link*/}
											</div>
											{/*end:Menu item*/}
										</div>
										{/*end:Menu sub*/}
									</div>
									{/*end:Menu item*/}
									{/*begin:Menu item*/}
									<div data-kt-menu-trigger="click" className="menu-item menu-accordion">
										{/*begin:Menu link*/}
										<span className="menu-link">
											<span className="menu-icon">
												<i className="ki-outline ki-message-text-2 fs-2"></i>
											</span>
											<span className="menu-title">Chat</span>
											<span className="menu-arrow"></span>
										</span>
										{/*end:Menu link*/}
										{/*begin:Menu sub*/}
										<div className="menu-sub menu-sub-accordion">
											{/*begin:Menu item*/}
											<div className="menu-item">
												{/*begin:Menu link*/}
												<a className="menu-link" href="apps/chat/private.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
													</span>
													<span className="menu-title">Private Chat</span>
												</a>
												{/*end:Menu link*/}
											</div>
											{/*end:Menu item*/}
											{/*begin:Menu item*/}
											<div className="menu-item">
												{/*begin:Menu link*/}
												<a className="menu-link" href="apps/chat/group.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
													</span>
													<span className="menu-title">Group Chat</span>
												</a>
												{/*end:Menu link*/}
											</div>
											{/*end:Menu item*/}
											{/*begin:Menu item*/}
											<div className="menu-item">
												{/*begin:Menu link*/}
												<a className="menu-link" href="apps/chat/drawer.html">
													<span className="menu-bullet">
														<span className="bullet bullet-dot"></span>
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
										<a className="menu-link" href="apps/calendar.html">
											<span className="menu-icon">
												<i className="ki-outline ki-calendar-8 fs-2"></i>
											</span>
											<span className="menu-title">Calendar</span>
										</a>
										{/*end:Menu link*/}
									</div>
									{/*end:Menu item*/}
								</>
							)}
						</div>
						{/*end:Menu sub*/}
					</div>
					{/*end:Menu item*/}
					{/*begin:Menu item*/}
					<div data-kt-menu-trigger="{default: 'click', lg: 'hover'}" data-kt-menu-placement="right-start" className="menu-item py-2">
						{/*begin:Menu link*/}
						<span className="menu-link menu-center">
							<span className="menu-icon me-0">
								<i className="ki-outline ki-briefcase fs-1"></i>
							</span>
						</span>
						{/*end:Menu link*/}
						{/*begin:Menu sub*/}
						<div className="menu-sub menu-sub-dropdown px-2 py-4 w-200px w-lg-225px mh-75 overflow-auto">
							{/*begin:Menu item*/}
							<div className="menu-item">
								{/*begin:Menu content*/}
								<div className="menu-content">
									<span className="menu-section fs-5 fw-bolder ps-1 py-1">Help</span>
								</div>
								{/*end:Menu content*/}
							</div>
							{/*end:Menu item*/}
							{/*begin:Menu item*/}
							<div className="menu-item">
								{/*begin:Menu link*/}
								<a className="menu-link" href="https://preview.keenthemes.com/html/metronic/docs/base/utilities" target="_blank" title="Check out over 200 in-house components" data-bs-toggle="tooltip" data-bs-trigger="hover" data-bs-dismiss="click" data-bs-placement="right">
									<span className="menu-bullet">
										<span className="bullet bullet-dot"></span>
									</span>
									<span className="menu-title">Components</span>
								</a>
								{/*end:Menu link*/}
							</div>
							{/*end:Menu item*/}
							{/*begin:Menu item*/}
							<div className="menu-item">
								{/*begin:Menu link*/}
								<a className="menu-link" href="https://preview.keenthemes.com/html/metronic/docs" target="_blank" title="Check out the complete documentation" data-bs-toggle="tooltip" data-bs-trigger="hover" data-bs-dismiss="click" data-bs-placement="right">
									<span className="menu-bullet">
										<span className="bullet bullet-dot"></span>
									</span>
									<span className="menu-title">Documentation</span>
								</a>
								{/*end:Menu link*/}
							</div>
							{/*end:Menu item*/}
							{/*begin:Menu item*/}
							<div className="menu-item">
								{/*begin:Menu link*/}
								<a className="menu-link" href="https://preview.keenthemes.com/metronic8/demo58/layout-builder.html" title="Build your layout and export HTML for server side integration" data-bs-toggle="tooltip" data-bs-trigger="hover" data-bs-dismiss="click" data-bs-placement="right">
									<span className="menu-bullet">
										<span className="bullet bullet-dot"></span>
									</span>
									<span className="menu-title">Layout Builder</span>
								</a>
								{/*end:Menu link*/}
							</div>
							{/*end:Menu item*/}
							{/*begin:Menu item*/}
							<div className="menu-item">
								{/*begin:Menu link*/}
								<a className="menu-link" href="https://preview.keenthemes.com/html/metronic/docs/getting-started/changelog" target="_blank">
									<span className="menu-bullet">
										<span className="bullet bullet-dot"></span>
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
			<div className="d-flex flex-column flex-center pb-4 pb-lg-8" id="kt_app_sidebar_footer">
				{/*begin::Menu toggle*/}
				<a href="#" className="btn btn-icon btn-active-color-primary" data-kt-menu-trigger="{default:'click', lg: 'hover'}" data-kt-menu-attach="parent" data-kt-menu-placement="bottom-end">
					<i className="ki-outline ki-night-day theme-light-show fs-2x"></i>
					<i className="ki-outline ki-moon theme-dark-show fs-2x"></i>
				</a>
				{/*begin::Menu toggle*/}
				{/*begin::Menu*/}
				<div className="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-title-gray-700 menu-icon-gray-500 menu-active-bg menu-state-color fw-semibold py-4 fs-base w-150px" data-kt-menu="true" data-kt-element="theme-mode-menu">
					{/*begin::Menu item*/}
					<div className="menu-item px-3 my-0">
						<a href="#" className="menu-link px-3 py-2" data-kt-element="mode" data-kt-value="light">
							<span className="menu-icon" data-kt-element="icon">
								<i className="ki-outline ki-night-day fs-2"></i>
							</span>
							<span className="menu-title">Light</span>
						</a>
					</div>
					{/*end::Menu item*/}
					{/*begin::Menu item*/}
					<div className="menu-item px-3 my-0">
						<a href="#" className="menu-link px-3 py-2" data-kt-element="mode" data-kt-value="dark">
							<span className="menu-icon" data-kt-element="icon">
								<i className="ki-outline ki-moon fs-2"></i>
							</span>
							<span className="menu-title">Dark</span>
						</a>
					</div>
					{/*end::Menu item*/}
					{/*begin::Menu item*/}
					<div className="menu-item px-3 my-0">
						<a href="#" className="menu-link px-3 py-2" data-kt-element="mode" data-kt-value="system">
							<span className="menu-icon" data-kt-element="icon">
								<i className="ki-outline ki-screen fs-2"></i>
							</span>
							<span className="menu-title">System</span>
						</a>
					</div>
					{/*end::Menu item*/}
				</div>
				{/*end::Menu*/}
			</div>
			{/*end::Footer*/}
		</div>

	);
};

export default Sidebar;
