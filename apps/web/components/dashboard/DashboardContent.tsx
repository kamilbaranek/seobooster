import React, { useEffect, useState } from 'react';
import ApexCharts from 'apexcharts';
import { ArticleActivityItem, fetchArticleActivity } from '../../lib/article-activity';

const DashboardContent = () => {
	const [activeFilter, setActiveFilter] = useState<'all' | 'published' | 'generated'>('all');
	const [activityItems, setActivityItems] = useState<ArticleActivityItem[]>([]);
	const [activityLoading, setActivityLoading] = useState(false);
	const [activityError, setActivityError] = useState<string | null>(null);

	const statusBadgeClass = (status: ArticleActivityItem['currentStatus']) => {
		if (status === 'PUBLISHED') return 'badge badge-lg badge-light-success fw-bold my-2 fs-8';
		if (status === 'GENERATED') return 'badge badge-lg badge-light-primary fw-bold my-2 fs-8';
		return 'badge badge-lg badge-light fw-bold my-2 fs-8';
	};

	const formatTime = (iso: string) =>
		new Intl.DateTimeFormat('cs-CZ', {
			day: '2-digit',
			month: '2-digit',
			hour: '2-digit',
			minute: '2-digit'
		}).format(new Date(iso));

	const symbolForIndex = (index: number) => {
		const symbols = [
			'ki-outline ki-ship',
			'ki-outline ki-truck',
			'ki-outline ki-delivery',
			'ki-outline ki-airplane-square'
		];
		return symbols[index % symbols.length];
	};

	useEffect(() => {
		let cancelled = false;
		const load = async () => {
			setActivityLoading(true);
			setActivityError(null);
			try {
				const data = await fetchArticleActivity(activeFilter, 4);
				if (!cancelled) {
					setActivityItems(data);
				}
			} catch (error) {
				if (!cancelled) {
					setActivityError(error instanceof Error ? error.message : 'Failed to load activity');
				}
			} finally {
				if (!cancelled) {
					setActivityLoading(false);
				}
			}
		};
		load();
		return () => {
			cancelled = true;
		};
	}, [activeFilter]);

	useEffect(() => {
		const rootStyles = getComputedStyle(document.documentElement);
		const getVar = (name: string, fallback: string) => rootStyles.getPropertyValue(name).trim() || fallback;

		const initChart47 = (ApexChartsLib: any) => {
			const element = document.getElementById('kt_charts_widget_47');
			if (!element) return;

			const height = parseInt(getComputedStyle(element).height || '0', 10) || 200;
			const baseColor = getVar('--bs-white', '#ffffff');
			const lightColor = getVar('--bs-white', '#ffffff');

			const options: ApexCharts.ApexOptions = {
				series: [
					{
						name: 'Sales',
						data: [5, 5, 15, 15, 19, 16, 27, 24, 34, 25, 40, 30, 19, 17, 22, 10, 14, 14],
					},
				],
				chart: {
					fontFamily: 'inherit',
					type: 'area',
					height,
					toolbar: { show: false },
				},
				legend: { show: false },
				dataLabels: { enabled: false },
				fill: {
					type: 'gradient',
					gradient: {
						shadeIntensity: 1,
						opacityFrom: 0.5,
						opacityTo: 0,
						stops: [0, 80, 100],
					},
				},
				stroke: {
					curve: 'smooth',
					show: true,
					width: 2,
					colors: [baseColor],
				},
				xaxis: {
					axisBorder: { show: false },
					axisTicks: { show: false },
					labels: { show: false },
					crosshairs: {
						position: 'front',
						stroke: { color: baseColor, width: 1, dashArray: 3 },
					},
					tooltip: { enabled: false },
				},
				yaxis: { labels: { show: false } },
				states: {
					hover: { filter: { type: 'none' } },
					active: { allowMultipleDataPointsSelection: false, filter: { type: 'none' } },
				},
				tooltip: { enabled: false },
				colors: [lightColor],
				grid: { yaxis: { lines: { show: false } } },
				markers: { strokeColors: baseColor, strokeWidth: 2 },
			};

			const chart = new ApexChartsLib(element, options);
			chart.render();
			return chart;
		};

		const initChart48 = (ApexChartsLib: any) => {
			const element = document.getElementById('kt_charts_widget_48');
			if (!element) return;

			const height = parseInt(getComputedStyle(element).height || '0', 10) || 200;
			const baseColor = getVar('--bs-danger', '#f1416c');
			const lightColor = baseColor;

			const options: ApexCharts.ApexOptions = {
				series: [
					{
						name: 'Sales',
						data: [5, 5, 15, 15, 19, 16, 27, 24, 34, 25, 40, 30, 19, 17, 22, 10, 14, 14],
					},
				],
				chart: {
					fontFamily: 'inherit',
					type: 'area',
					height,
					toolbar: { show: false },
				},
				legend: { show: false },
				dataLabels: { enabled: false },
				fill: {
					type: 'gradient',
					gradient: {
						shadeIntensity: 1,
						opacityFrom: 0.5,
						opacityTo: 0,
						stops: [0, 120, 50],
					},
				},
				stroke: {
					curve: 'smooth',
					show: true,
					width: 2,
					colors: [baseColor],
				},
				xaxis: {
					axisBorder: { show: false },
					axisTicks: { show: false },
					labels: { show: false },
					crosshairs: {
						position: 'front',
						stroke: { color: baseColor, width: 1, dashArray: 3 },
					},
					tooltip: { enabled: false },
				},
				yaxis: { labels: { show: false } },
				states: {
					hover: { filter: { type: 'none' } },
					active: { allowMultipleDataPointsSelection: false, filter: { type: 'none' } },
				},
				tooltip: { enabled: false },
				colors: [lightColor],
				grid: { yaxis: { lines: { show: false } } },
				markers: { strokeColors: baseColor, strokeWidth: 2 },
			};

			const chart = new ApexChartsLib(element, options);
			chart.render();
			return chart;
		};

		const initTableChart = (ApexChartsLib: any, selector: string, data: number[]) => {
			const element = document.querySelector<HTMLElement>(selector);
			if (!element) return;

			const height = parseInt(getComputedStyle(element).height || '0', 10) || 50;
			const color = element.getAttribute('data-kt-chart-color') ?? 'primary';

			const strokeColor = getVar('--bs-gray-300', '#e4e6ef');
			const baseColor = getVar(`--bs-${color}`, '#009ef7');
			const lightColor = getVar('--bs-body-bg', '#ffffff');

			const options: ApexCharts.ApexOptions = {
				series: [{ name: 'Net Profit', data }],
				chart: {
					fontFamily: 'inherit',
					type: 'area',
					height,
					toolbar: { show: false },
					zoom: { enabled: false },
					sparkline: { enabled: true },
				},
				legend: { show: false },
				dataLabels: { enabled: false },
				fill: { type: 'solid', opacity: 1 },
				stroke: {
					curve: 'smooth',
					show: true,
					width: 2,
					colors: [baseColor],
				},
				xaxis: {
					axisBorder: { show: false },
					axisTicks: { show: false },
					labels: { show: false },
					crosshairs: {
						show: false,
						position: 'front',
						stroke: { color: strokeColor, width: 1, dashArray: 3 },
					},
					tooltip: { enabled: false },
				},
				yaxis: {
					min: 0,
					max: 60,
					labels: { show: false },
				},
				states: {
					hover: { filter: { type: 'none' } },
					active: { allowMultipleDataPointsSelection: false, filter: { type: 'none' } },
				},
				tooltip: { enabled: false },
				colors: [lightColor],
				markers: { strokeColors: [baseColor], strokeWidth: 3 },
			};

			const chart = new ApexChartsLib(element, options);
			chart.render();
			return chart;
		};

		let cancelled = false;
		const charts: any[] = [];

		(async () => {
			const { default: ApexChartsLib } = await import('apexcharts');
			if (cancelled) {
				return;
			}

			const c47 = initChart47(ApexChartsLib);
			if (c47) charts.push(c47);
			const c48 = initChart48(ApexChartsLib);
			if (c48) charts.push(c48);

			const chart1Data = [7, 10, 5, 21, 6, 11, 5, 23, 5, 11, 18, 7, 21, 13];
			const chart2Data = [17, 5, 23, 2, 21, 9, 17, 23, 4, 24, 9, 17, 21, 7];
			const chart3Data = [2, 24, 5, 17, 7, 2, 12, 24, 5, 24, 2, 8, 12, 7];
			const chart4Data = [24, 3, 5, 19, 3, 7, 25, 14, 5, 14, 2, 8, 5, 17];
			const chart5Data = [3, 23, 1, 19, 3, 17, 3, 9, 25, 4, 2, 18, 25, 3];

			[chart1Data, chart2Data, chart3Data, chart4Data, chart5Data].forEach((data, index) => {
				const c = initTableChart(ApexChartsLib, `#kt_table_widget_15_chart_${index + 1}`, data);
				if (c) charts.push(c);
			});
		})();

		return () => {
			cancelled = true;
			charts.forEach((chart) => chart.destroy());
		};
	}, []);

	const renderHistory = (item: ArticleActivityItem) => {
		const history = item.history
			.filter((h) => !(h.status === item.currentStatus && h.at === item.currentStatusAt))
			.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

		if (!history.length) {
			return (
				<div className="timeline">
					<div className="timeline-item align-items-center">
						<div className="timeline-line"></div>
						<div className="timeline-icon">
							<i className="ki-outline ki-geolocation fs-2 text-info"></i>
						</div>
						<div className="timeline-content m-0">
							<span className="fs-6 text-gray-500 fw-semibold d-block">Bez historie</span>
						</div>
					</div>
				</div>
			);
		}

		return (
			<div className="timeline">
				{history.map((h, idx) => (
					<div className={`timeline-item align-items-center${idx < history.length - 1 ? ' mb-7' : ''}`} key={`${item.articleId ?? item.webId}-${h.at}-${h.status}`}>
						<div className={`timeline-line${idx === 0 ? '' : ' mt-1 mb-n6 mb-sm-n7'}`}></div>
						<div className="timeline-icon">
							<i className={idx === 0 ? 'ki-outline ki-cd fs-2 text-danger' : 'ki-outline ki-geolocation fs-2 text-info'}></i>
						</div>
						<div className="timeline-content m-0">
							<span className="fs-6 text-gray-500 fw-semibold d-block">{formatTime(h.at)}</span>
							<span className="fs-6 fw-bold text-gray-800 text-uppercase">{h.status}</span>
						</div>
					</div>
				))}
			</div>
		);
	};

	const renderActivityItems = () => {
		if (activityLoading) {
			return <div className="text-gray-500">Načítám poslední články…</div>;
		}
		if (activityError) {
			return <div className="text-danger">{activityError}</div>;
		}
		if (!activityItems.length) {
			return <div className="text-gray-500">Zatím nemáte žádnou aktivitu článků.</div>;
		}

		return activityItems.slice(0, 4).map((item, index) => (
			<div className="m-0" key={item.articleId ?? `${item.webId}-${index}`}>
				<div className="d-flex align-items-sm-center mb-5">
					<div className="symbol symbol-45px me-4">
						<span className="symbol-label bg-primary">
							<i className={`${symbolForIndex(index)} text-inverse-primary fs-1`}></i>
						</span>
					</div>
					<div className="d-flex align-items-center flex-row-fluid flex-wrap">
						<div className="flex-grow-1 me-2">
							<a href="#" className="text-gray-500 fs-6 fw-semibold text-uppercase">{item.currentStatus}</a>
							<span className="text-gray-800 fw-bold d-block fs-4">#{item.titlePreview}</span>
						</div>
						<span className={statusBadgeClass(item.currentStatus)}>{item.currentStatus}</span>
					</div>
				</div>
				{renderHistory(item)}
				{index < Math.min(activityItems.length, 4) - 1 && <div className="separator separator-dashed my-6"></div>}
			</div>
		));
	};

	return (
		<div className="row g-5 g-xl-10">
			{/*begin::Col*/}
			<div className="col-xl-8 mb-xl-10">
				{/*begin::Row*/}
				<div className="row g-5 g-xl-10">
					{/*begin::Col*/}
					<div className="col-lg-6 mb-xl-10">
						{/*begin::Chart Widget 47*/}
						<div className="card card-flush" style={{ background: 'linear-gradient(180deg, #1858FD 0%, #1652EA 100%)', boxShadow: '0px 14px 40px 0px rgba(24, 85, 243, 0.20)' }}>
							{/*begin::Header*/}
							<div className="card-header align-items-center pt-6">
								{/*begin::Symbol*/}
								<div className="symbol symbol-50px me-4">
									<div className="symbol-label bg-transparent rounded-lg" style={{ border: '1px dashed rgba(255, 255, 255, 0.20)' }}>
										<i className="ki-outline ki-handcart text-white fs-1"></i>
									</div>
								</div>
								{/*end::Symbol*/}
								{/*begin::Info*/}
								<div className="card-title flex-column flex-grow-1">
									<span className="card-label fw-bold fs-3 text-white">New Articles</span>
									<span className="text-white opacity-50 fw-semibold fs-base">Recent customer purchase trends</span>
								</div>
								{/*end::Info*/}
								{/*begin::Toolbar*/}
								<div className="card-toolbar">
									<a href="#" className="btn btn-sm btn-text-white bg-white bg-opacity-10" style={{ border: '1px solid rgba(255, 255, 255, 0.20)' }}>Today</a>
								</div>
								{/*end::Toolbar*/}
							</div>
							{/*end::Header*/}
							{/*begin::Card body*/}
							<div className="card-body d-flex align-items-end pb-0">
								{/*begin::Wrapper*/}
								<div className="d-flex flex-stack flex-row-fluid">
									{/*begin::Block*/}
									<div className="d-flex flex-column">
										{/*begin::Stats*/}
										<div className="d-flex align-items-center mb-1">
											{/*begin::Amount*/}
											<span className="fs-2hx fw-bold text-white me-2">$1,934</span>
											{/*end::Amount*/}
											{/*begin::Label*/}
											<span className="fw-semibold text-success fs-6">+6.83%</span>
											{/*end::Label*/}
										</div>
										{/*end::Stats*/}
										{/*begin::Total*/}
										<span className="fw-semibold text-white opacity-50">For past 24 hours</span>
										{/*end::Total*/}
									</div>
									{/*end::Block*/}
									{/*begin::Chart*/}
									<div id="kt_charts_widget_47" className="h-125px w-200px min-h-auto"></div>
									{/*end::Chart*/}
								</div>
								{/*end::Wrapper*/}
							</div>
							{/*end::Card body*/}
						</div>
						{/*end::Chart Widget 47*/}
					</div>
					{/*end::Col*/}
					{/*begin::Col*/}
					<div className="col-lg-6 mb-5 mb-xl-10">
						{/*begin::Chart Widget 47*/}
						{/*begin::Chart Widget 48*/}
						<div className="card card-flush">
							{/*begin::Header*/}
							<div className="card-header justify-content-start align-items-center pt-6">
								{/*begin::Symbol*/}
								<div className="symbol symbol-50px me-4">
									<div className="symbol-label border border-dashed border-gray-300">
										<i className="ki-outline ki-handcart text-info fs-1"></i>
									</div>
								</div>
								{/*end::Symbol*/}
								{/*begin::Info*/}
								<div className="card-title flex-column flex-grow-1">
									<span className="card-label fw-bold fs-3 text-gray-800">New Articles</span>
									<span className="text-gray-500 fw-semibold fs-base">Recent customer purchase trends</span>
								</div>
								{/*end::Info*/}
								{/*begin::Toolbar*/}
								<div className="card-toolbar">
									<a href="#" className="btn btn-sm btn-secondary">Month</a>
								</div>
								{/*end::Toolbar*/}
							</div>
							{/*end::Header*/}
							{/*begin::Card body*/}
							<div className="card-body d-flex align-items-end pb-0">
								{/*begin::Wrapper*/}
								<div className="d-flex flex-stack flex-row-fluid">
									{/*begin::Block*/}
									<div className="d-flex flex-column">
										{/*begin::Stats*/}
										<div className="d-flex align-items-center mb-1">
											{/*begin::Amount*/}
											<span className="fs-2hx fw-bold text-gray-800 me-2">16%</span>
											{/*end::Amount*/}
											{/*begin::Label*/}
											<span className="fw-semibold text-success fs-6">+4,245$</span>
											{/*end::Label*/}
										</div>
										{/*end::Stats*/}
										{/*begin::Total*/}
										<span className="fw-semibold text-gray-500">For past 30 days</span>
										{/*end::Total*/}
									</div>
									{/*end::Wrapper*/}
									{/*begin::Chart*/}
									<div id="kt_charts_widget_48" className="h-125px w-200px min-h-auto"></div>
									{/*end::Chart*/}
								</div>
								{/*end::Wrapper*/}
							</div>
							{/*end::Card body*/}
						</div>
						{/*end::Chart Widget 48*/}
					</div>
					{/*end::Col*/}
				</div>
				{/*end::Row*/}
				{/*begin::Row*/}
				<div className="row gx-5 gx-xl-10">
					{/*begin::Col*/}
					<div className="col-xl-6 mb-5 mb-xl-10">
						{/*begin::Table widget 9*/}
						<div className="card card-flush h-xl-100">
							{/*begin::Header*/}
							<div className="card-header pt-5">
								{/*begin::Title*/}
								<h3 className="card-title align-items-start flex-column">
									<span className="card-label fw-bold text-gray-800">Top Referral Sources</span>
									<span className="text-gray-500 pt-1 fw-semibold fs-6">Counted in Millions</span>
								</h3>
								{/*end::Title*/}
								{/*begin::Toolbar*/}
								<div className="card-toolbar">
									<a href="#" className="btn btn-sm btn-light">PDF Report</a>
								</div>
								{/*end::Toolbar*/}
							</div>
							{/*end::Header*/}
							{/*begin::Body*/}
							<div className="card-body py-3">
								{/*begin::Table container*/}
								<div className="table-responsive">
									{/*begin::Table*/}
									<table className="table table-row-dashed align-middle gs-0 gy-4">
										{/*begin::Table head*/}
										<thead>
											<tr className="fs-7 fw-bold border-0 text-gray-500">
												<th className="min-w-150px" colSpan={2}>CAMPAIGN</th>
												<th className="min-w-150px text-end pe-0" colSpan={2}>SESSIONS</th>
												<th className="text-end min-w-150px" colSpan={2}>CONVERSION RATE</th>
											</tr>
										</thead>
										{/*end::Table head*/}
										{/*begin::Table body*/}
										<tbody>
											<tr>
												<td className="" colSpan={2}>
													<a href="#" className="text-gray-800 fw-bold text-hover-primary mb-1 fs-6">Google</a>
												</td>
												<td className="pe-0" colSpan={2}>
													<div className="d-flex justify-content-end">
														<span className="text-gray-800 fw-bold fs-6 me-1">1,256</span>
														<span className="text-danger min-w-50px d-block text-end fw-bold fs-6">-935</span>
													</div>
												</td>
												<td className="" colSpan={2}>
													<div className="d-flex justify-content-end">
														<span className="text-gray-900 fw-bold fs-6 me-3">23.63%</span>
														<span className="text-danger min-w-60px d-block text-end fw-bold fs-6">-9.35%</span>
													</div>
												</td>
											</tr>
											<tr>
												<td className="" colSpan={2}>
													<a href="#" className="text-gray-800 fw-bold text-hover-primary mb-1 fs-6">Facebook</a>
												</td>
												<td className="pe-0" colSpan={2}>
													<div className="d-flex justify-content-end">
														<span className="text-gray-800 fw-bold fs-6 me-1">446</span>
														<span className="text-danger min-w-50px d-block text-end fw-bold fs-6">-576</span>
													</div>
												</td>
												<td className="" colSpan={2}>
													<div className="d-flex justify-content-end">
														<span className="text-gray-900 fw-bold fs-6 me-3">12.45%</span>
														<span className="text-danger min-w-60px d-block text-end fw-bold fs-6">-57.02%</span>
													</div>
												</td>
											</tr>
											<tr>
												<td className="" colSpan={2}>
													<a href="#" className="text-gray-800 fw-bold text-hover-primary mb-1 fs-6">Bol.com</a>
												</td>
												<td className="pe-0" colSpan={2}>
													<div className="d-flex justify-content-end">
														<span className="text-gray-800 fw-bold fs-6 me-1">67</span>
														<span className="text-success min-w-50px d-block text-end fw-bold fs-6">+24</span>
													</div>
												</td>
												<td className="" colSpan={2}>
													<div className="d-flex justify-content-end">
														<span className="text-gray-900 fw-bold fs-6 me-3">73.63%</span>
														<span className="text-success min-w-60px d-block text-end fw-bold fs-6">+28.73%</span>
													</div>
												</td>
											</tr>
											<tr>
												<td className="" colSpan={2}>
													<a href="#" className="text-gray-800 fw-bold text-hover-primary mb-1 fs-6">Dutchnews.nl</a>
												</td>
												<td className="pe-0" colSpan={2}>
													<div className="d-flex justify-content-end">
														<span className="text-gray-800 fw-bold fs-6 me-1">2,136</span>
														<span className="text-danger min-w-50px d-block text-end fw-bold fs-6">-1,229</span>
													</div>
												</td>
												<td className="" colSpan={2}>
													<div className="d-flex justify-content-end">
														<span className="text-gray-900 fw-bold fs-6 me-3">3.67%</span>
														<span className="text-danger min-w-60px d-block text-end fw-bold fs-6">-12.29%</span>
													</div>
												</td>
											</tr>
											<tr>
												<td className="" colSpan={2}>
													<a href="#" className="text-gray-800 fw-bold text-hover-primary mb-1 fs-6">Stackoverflow</a>
												</td>
												<td className="pe-0" colSpan={2}>
													<div className="d-flex justify-content-end">
														<span className="text-gray-800 fw-bold fs-6 me-1">945</span>
														<span className="text-danger min-w-50px d-block text-end fw-bold fs-6">-634</span>
													</div>
												</td>
												<td className="" colSpan={2}>
													<div className="d-flex justify-content-end">
														<span className="text-gray-900 fw-bold fs-6 me-3">25.03%</span>
														<span className="text-danger min-w-60px d-block text-end fw-bold fs-6">-9.35%</span>
													</div>
												</td>
											</tr>
											<tr>
												<td className="" colSpan={2}>
													<a href="#" className="text-gray-800 fw-bold text-hover-primary mb-1 fs-6">Themeforest</a>
												</td>
												<td className="pe-0" colSpan={2}>
													<div className="d-flex justify-content-end">
														<span className="text-gray-800 fw-bold fs-6 me-1">237</span>
														<span className="text-success min-w-50px d-block text-end fw-bold fs-6">106</span>
													</div>
												</td>
												<td className="" colSpan={2}>
													<div className="d-flex justify-content-end">
														<span className="text-gray-900 fw-bold fs-6 me-3">36.52%</span>
														<span className="text-success min-w-60px d-block text-end fw-bold fs-6">+3.06%</span>
													</div>
												</td>
											</tr>
										</tbody>
										{/*end::Table body*/}
									</table>
									{/*end::Table*/}
								</div>
								{/*end::Table container*/}
							</div>
							{/*end::Body*/}
						</div>
						{/*end::Table Widget 9*/}
					</div>
					{/*end::Col*/}
					{/*begin::Col*/}
					<div className="col-xl-6 mb-5 mb-xl-10">
						{/*begin::Table widget 10*/}
						<div className="card card-flush h-xl-100">
							{/*begin::Header*/}
							<div className="card-header pt-5">
								{/*begin::Title*/}
								<h3 className="card-title align-items-start flex-column">
									<span className="card-label fw-bold text-gray-800">Top Performing Pages</span>
									<span className="text-gray-500 pt-1 fw-semibold fs-6">Counted in Millions</span>
								</h3>
								{/*end::Title*/}
								{/*begin::Toolbar*/}
								<div className="card-toolbar">
									<a href="#" className="btn btn-sm btn-light">PDF Report</a>
								</div>
								{/*end::Toolbar*/}
							</div>
							{/*end::Header*/}
							{/*begin::Body*/}
							<div className="card-body py-3">
								{/*begin::Table container*/}
								<div className="table-responsive">
									{/*begin::Table*/}
									<table className="table table-row-dashed align-middle gs-0 gy-4">
										{/*begin::Table head*/}
										<thead>
											<tr className="fs-7 fw-bold border-0 text-gray-500">
												<th className="min-w-200px" colSpan={2}>LANDING PAGE</th>
												<th className="min-w-100px text-end pe-0" colSpan={2}>CLICKS</th>
												<th className="text-end min-w-100px" colSpan={2}>AVG. POSITION</th>
											</tr>
										</thead>
										{/*end::Table head*/}
										{/*begin::Table body*/}
										<tbody>
											<tr>
												<td className="" colSpan={2}>
													<a href="#" className="text-gray-800 fw-bold text-hover-primary mb-1 fs-6">Index</a>
												</td>
												<td className="pe-0" colSpan={2}>
													<div className="d-flex justify-content-end">
														<span className="text-gray-800 fw-bold fs-6">1,256</span>
														<span className="text-danger min-w-50px d-block text-end fw-bold fs-6">-935</span>
													</div>
												</td>
												<td className="" colSpan={2}>
													<div className="d-flex justify-content-end">
														<span className="text-gray-900 fw-bold fs-6">2.63</span>
														<span className="text-danger min-w-50px d-block text-end fw-bold fs-6">-1.35</span>
													</div>
												</td>
											</tr>
											<tr>
												<td className="" colSpan={2}>
													<a href="#" className="text-gray-800 fw-bold text-hover-primary mb-1 fs-6">Products</a>
												</td>
												<td className="pe-0" colSpan={2}>
													<div className="d-flex justify-content-end">
														<span className="text-gray-800 fw-bold fs-6">446</span>
														<span className="text-danger min-w-50px d-block text-end fw-bold fs-6">-576</span>
													</div>
												</td>
												<td className="" colSpan={2}>
													<div className="d-flex justify-content-end">
														<span className="text-gray-900 fw-bold fs-6">1.45</span>
														<span className="text-danger min-w-50px d-block text-end fw-bold fs-6">0.32</span>
													</div>
												</td>
											</tr>
											<tr>
												<td className="" colSpan={2}>
													<a href="#" className="text-gray-800 fw-bold text-hover-primary mb-1 fs-6">devs.keenthemes.com</a>
												</td>
												<td className="pe-0" colSpan={2}>
													<div className="d-flex justify-content-end">
														<span className="text-gray-800 fw-bold fs-6">67</span>
														<span className="text-success min-w-50px d-block text-end fw-bold fs-6">+24</span>
													</div>
												</td>
												<td className="" colSpan={2}>
													<div className="d-flex justify-content-end">
														<span className="text-gray-900 fw-bold fs-6">7.63</span>
														<span className="text-success min-w-50px d-block text-end fw-bold fs-6">+8.73</span>
													</div>
												</td>
											</tr>
											<tr>
												<td className="" colSpan={2}>
													<a href="#" className="text-gray-800 fw-bold text-hover-primary mb-1 fs-6">studio.keenthemes.com</a>
												</td>
												<td className="pe-0" colSpan={2}>
													<div className="d-flex justify-content-end">
														<span className="text-gray-800 fw-bold fs-6">2,136</span>
														<span className="text-danger min-w-50px d-block text-end fw-bold fs-6">-1,229</span>
													</div>
												</td>
												<td className="" colSpan={2}>
													<div className="d-flex justify-content-end">
														<span className="text-gray-900 fw-bold fs-6">3.67</span>
														<span className="text-danger min-w-50px d-block text-end fw-bold fs-6">-2.29</span>
													</div>
												</td>
											</tr>
											<tr>
												<td className="" colSpan={2}>
													<a href="#" className="text-gray-800 fw-bold text-hover-primary mb-1 fs-6">graphics.keenthemes.com</a>
												</td>
												<td className="pe-0" colSpan={2}>
													<div className="d-flex justify-content-end">
														<span className="text-gray-800 fw-bold fs-6">945</span>
														<span className="text-danger min-w-50px d-block text-end fw-bold fs-6">-634</span>
													</div>
												</td>
												<td className="" colSpan={2}>
													<div className="d-flex justify-content-end">
														<span className="text-gray-900 fw-bold fs-6">5.03</span>
														<span className="text-danger min-w-50px d-block text-end fw-bold fs-6">-0.35</span>
													</div>
												</td>
											</tr>
											<tr>
												<td className="" colSpan={2}>
													<a href="#" className="text-gray-800 fw-bold text-hover-primary mb-1 fs-6">Licenses</a>
												</td>
												<td className="pe-0" colSpan={2}>
													<div className="d-flex justify-content-end">
														<span className="text-gray-800 fw-bold fs-6">237</span>
														<span className="text-success min-w-50px d-block text-end fw-bold fs-6">106</span>
													</div>
												</td>
												<td className="" colSpan={2}>
													<div className="d-flex justify-content-end">
														<span className="text-gray-900 fw-bold fs-6">3.52</span>
														<span className="text-success min-w-50px d-block text-end fw-bold fs-6">+3.06</span>
													</div>
												</td>
											</tr>
										</tbody>
										{/*end::Table body*/}
									</table>
									{/*end::Table*/}
								</div>
								{/*end::Table container*/}
							</div>
							{/*end::Body*/}
						</div>
						{/*end::Table Widget 10*/}
					</div>
					{/*end::Col*/}
				</div>
				{/*end::Row*/}
				{/*begin::Table widget 15*/}
				<div className="card card-flush mb-5 mb-xl-10">
					{/*begin::Header*/}
					<div className="card-header pt-7">
						{/*begin::Title*/}
						<h3 className="card-title align-items-start flex-column">
							<span className="card-label fw-bold text-gray-800">Projects Stats</span>
							<span className="text-gray-500 mt-1 fw-semibold fs-6">Updated 37 minutes ago</span>
						</h3>
						{/*end::Title*/}
						{/*begin::Toolbar*/}
						<div className="card-toolbar">
							{/*begin::Daterangepicker(defined in src/js/layout/app.js)*/}
							<div data-kt-daterangepicker="true" data-kt-daterangepicker-opens="left" className="btn btn-sm btn-light d-flex align-items-center px-4">
								{/*begin::Display range*/}
								<div className="text-gray-600 fw-bold">Loading date range...</div>
								{/*end::Display range*/}
								<i className="ki-outline ki-calendar-8 fs-1 ms-2 me-0"></i>
							</div>
							{/*end::Daterangepicker*/}
						</div>
						{/*end::Toolbar*/}
					</div>
					{/*end::Header*/}
					{/*begin::Body*/}
					<div className="card-body pt-6">
						{/*begin::Table container*/}
						<div className="table-responsive">
							{/*begin::Table*/}
							<table className="table table-row-dashed align-middle gs-0 gy-3 my-0">
								{/*begin::Table head*/}
								<thead>
									<tr className="fs-7 fw-bold text-gray-500 border-bottom-0">
										<th className="p-0 pb-3 min-w-175px text-start">ITEM</th>
										<th className="p-0 pb-3 min-w-100px text-end">CALLS</th>
										<th className="p-0 pb-3 min-w-100px text-end">CRP RANK</th>
										<th className="p-0 pb-3 min-w-150px text-end pe-12">PROGRESS</th>
										<th className="p-0 pb-3 w-125px text-end pe-7">CHART</th>
										<th className="p-0 pb-3 w-50px text-end">VIEW</th>
									</tr>
								</thead>
								{/*end::Table head*/}
								{/*begin::Table body*/}
								<tbody>
									<tr>
										<td>
											<div className="d-flex align-items-center">
												<div className="symbol symbol-50px me-3">
													<img src="assets/media/avatars/300-3.jpg" className="" alt="" />
												</div>
												<div className="d-flex justify-content-start flex-column">
													<a href="apps/projects/users.html" className="text-gray-800 fw-bold text-hover-primary mb-1 fs-6">Guy Hawkins</a>
													<span className="text-gray-500 fw-semibold d-block fs-7">Haiti</span>
												</div>
											</div>
										</td>
										<td className="text-end pe-0">
											<span className="text-gray-600 fw-bold fs-6">245</span>
										</td>
										<td className="text-end pe-0">
											<span className="text-gray-600 fw-bold fs-6">$78.34%</span>
										</td>
										<td className="text-end pe-12">
											{/*begin::Label*/}
											<span className="badge badge-light-success fs-base">
												<i className="ki-outline ki-arrow-up fs-5 text-success ms-n1"></i>9.2%</span>
											{/*end::Label*/}
										</td>
										<td className="text-end pe-0">
											<div id="kt_table_widget_15_chart_1" className="h-50px mt-n8 pe-7" data-kt-chart-color="success"></div>
										</td>
										<td className="text-end">
											<a href="#" className="btn btn-sm btn-icon btn-bg-light btn-active-color-primary w-30px h-30px">
												<i className="ki-outline ki-black-right fs-2 text-gray-500"></i>
											</a>
										</td>
									</tr>
									<tr>
										<td>
											<div className="d-flex align-items-center">
												<div className="symbol symbol-50px me-3">
													<img src="assets/media/avatars/300-10.jpg" className="" alt="" />
												</div>
												<div className="d-flex justify-content-start flex-column">
													<a href="apps/projects/users.html" className="text-gray-800 fw-bold text-hover-primary mb-1 fs-6">Jane Cooper</a>
													<span className="text-gray-500 fw-semibold d-block fs-7">Monaco</span>
												</div>
											</div>
										</td>
										<td className="text-end pe-0">
											<span className="text-gray-600 fw-bold fs-6">725</span>
										</td>
										<td className="text-end pe-0">
											<span className="text-gray-600 fw-bold fs-6">$63.83%</span>
										</td>
										<td className="text-end pe-12">
											{/*begin::Label*/}
											<span className="badge badge-light-danger fs-base">
												<i className="ki-outline ki-arrow-down fs-5 text-danger ms-n1"></i>0.4%</span>
											{/*end::Label*/}
										</td>
										<td className="text-end pe-0">
											<div id="kt_table_widget_15_chart_2" className="h-50px mt-n8 pe-7" data-kt-chart-color="danger"></div>
										</td>
										<td className="text-end">
											<a href="#" className="btn btn-sm btn-icon btn-bg-light btn-active-color-primary w-30px h-30px">
												<i className="ki-outline ki-black-right fs-2 text-gray-500"></i>
											</a>
										</td>
									</tr>
									<tr>
										<td>
											<div className="d-flex align-items-center">
												<div className="symbol symbol-50px me-3">
													<img src="assets/media/avatars/300-9.jpg" className="" alt="" />
												</div>
												<div className="d-flex justify-content-start flex-column">
													<a href="apps/projects/users.html" className="text-gray-800 fw-bold text-hover-primary mb-1 fs-6">Jacob Jones</a>
													<span className="text-gray-500 fw-semibold d-block fs-7">Poland</span>
												</div>
											</div>
										</td>
										<td className="text-end pe-0">
											<span className="text-gray-600 fw-bold fs-6">173</span>
										</td>
										<td className="text-end pe-0">
											<span className="text-gray-600 fw-bold fs-6">$92.56%</span>
										</td>
										<td className="text-end pe-12">
											{/*begin::Label*/}
											<span className="badge badge-light-success fs-base">
												<i className="ki-outline ki-arrow-up fs-5 text-success ms-n1"></i>9.2%</span>
											{/*end::Label*/}
										</td>
										<td className="text-end pe-0">
											<div id="kt_table_widget_15_chart_3" className="h-50px mt-n8 pe-7" data-kt-chart-color="success"></div>
										</td>
										<td className="text-end">
											<a href="#" className="btn btn-sm btn-icon btn-bg-light btn-active-color-primary w-30px h-30px">
												<i className="ki-outline ki-black-right fs-2 text-gray-500"></i>
											</a>
										</td>
									</tr>
									<tr>
										<td>
											<div className="d-flex align-items-center">
												<div className="symbol symbol-50px me-3">
													<img src="assets/media/avatars/300-2.jpg" className="" alt="" />
												</div>
												<div className="d-flex justify-content-start flex-column">
													<a href="apps/projects/users.html" className="text-gray-800 fw-bold text-hover-primary mb-1 fs-6">Esther Howard</a>
													<span className="text-gray-500 fw-semibold d-block fs-7">Kiribatir</span>
												</div>
											</div>
										</td>
										<td className="text-end pe-0">
											<span className="text-gray-600 fw-bold fs-6">642</span>
										</td>
										<td className="text-end pe-0">
											<span className="text-gray-600 fw-bold fs-6">$64.02%</span>
										</td>
										<td className="text-end pe-12">
											{/*begin::Label*/}
											<span className="badge badge-light-success fs-base">
												<i className="ki-outline ki-arrow-up fs-5 text-success ms-n1"></i>9.2%</span>
											{/*end::Label*/}
										</td>
										<td className="text-end pe-0">
											<div id="kt_table_widget_15_chart_4" className="h-50px mt-n8 pe-7" data-kt-chart-color="success"></div>
										</td>
										<td className="text-end">
											<a href="#" className="btn btn-sm btn-icon btn-bg-light btn-active-color-primary w-30px h-30px">
												<i className="ki-outline ki-black-right fs-2 text-gray-500"></i>
											</a>
										</td>
									</tr>
									<tr>
										<td>
											<div className="d-flex align-items-center">
												<div className="symbol symbol-50px me-3">
													<img src="assets/media/avatars/300-1.jpg" className="" alt="" />
												</div>
												<div className="d-flex justify-content-start flex-column">
													<a href="apps/projects/users.html" className="text-gray-800 fw-bold text-hover-primary mb-1 fs-6">Ralph Edwards</a>
													<span className="text-gray-500 fw-semibold d-block fs-7">Iceland</span>
												</div>
											</div>
										</td>
										<td className="text-end pe-0">
											<span className="text-gray-600 fw-bold fs-6">329</span>
										</td>
										<td className="text-end pe-0">
											<span className="text-gray-600 fw-bold fs-6">$89.31%</span>
										</td>
										<td className="text-end pe-12">
											{/*begin::Label*/}
											<span className="badge badge-light-danger fs-base">
												<i className="ki-outline ki-arrow-down fs-5 text-danger ms-n1"></i>0.4%</span>
											{/*end::Label*/}
										</td>
										<td className="text-end pe-0">
											<div id="kt_table_widget_15_chart_5" className="h-50px mt-n8 pe-7" data-kt-chart-color="danger"></div>
										</td>
										<td className="text-end">
											<a href="#" className="btn btn-sm btn-icon btn-bg-light btn-active-color-primary w-30px h-30px">
												<i className="ki-outline ki-black-right fs-2 text-gray-500"></i>
											</a>
										</td>
									</tr>
								</tbody>
								{/*end::Table body*/}
							</table>
						</div>
						{/*end::Table*/}
					</div>
					{/*end: Card Body*/}
				</div>
				{/*end::Table widget 15*/}
				{/*begin::Row*/}
				<div className="row gx-5 gx-xl-10">
					{/*begin::Col*/}
					<div className="col-sm-6 mb-5 mb-sm-0">
						{/*begin::List widget 1*/}
						<div className="card card-flush">
							{/*begin::Header*/}
							<div className="card-header pt-5">
								{/*begin::Title*/}
								<h3 className="card-title align-items-start flex-column">
									<span className="card-label fw-bold text-gray-900">Highlights</span>
									<span className="text-gray-500 mt-1 fw-semibold fs-6">Latest social statistics</span>
								</h3>
								{/*end::Title*/}
								{/*begin::Toolbar*/}
								<div className="card-toolbar">
									{/*begin::Menu*/}
									<button className="btn btn-icon btn-color-gray-500 btn-active-color-primary justify-content-end" data-kt-menu-trigger="click" data-kt-menu-placement="bottom-end" data-kt-menu-overflow="true">
										<i className="ki-outline ki-dots-square fs-1"></i>
									</button>
									{/*begin::Menu 2*/}
									<div className="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-800 menu-state-bg-light-primary fw-semibold w-200px" data-kt-menu="true">
										{/*begin::Menu item*/}
										<div className="menu-item px-3">
											<div className="menu-content fs-6 text-gray-900 fw-bold px-3 py-4">Quick Actions</div>
										</div>
										{/*end::Menu item*/}
										{/*begin::Menu separator*/}
										<div className="separator mb-3 opacity-75"></div>
										{/*end::Menu separator*/}
										{/*begin::Menu item*/}
										<div className="menu-item px-3">
											<a href="#" className="menu-link px-3">New Ticket</a>
										</div>
										{/*end::Menu item*/}
										{/*begin::Menu item*/}
										<div className="menu-item px-3">
											<a href="#" className="menu-link px-3">New Customer</a>
										</div>
										{/*end::Menu item*/}
										{/*begin::Menu item*/}
										<div className="menu-item px-3" data-kt-menu-trigger="hover" data-kt-menu-placement="right-start">
											{/*begin::Menu item*/}
											<a href="#" className="menu-link px-3">
												<span className="menu-title">New Group</span>
												<span className="menu-arrow"></span>
											</a>
											{/*end::Menu item*/}
											{/*begin::Menu sub*/}
											<div className="menu-sub menu-sub-dropdown w-175px py-4">
												{/*begin::Menu item*/}
												<div className="menu-item px-3">
													<a href="#" className="menu-link px-3">Admin Group</a>
												</div>
												{/*end::Menu item*/}
												{/*begin::Menu item*/}
												<div className="menu-item px-3">
													<a href="#" className="menu-link px-3">Staff Group</a>
												</div>
												{/*end::Menu item*/}
												{/*begin::Menu item*/}
												<div className="menu-item px-3">
													<a href="#" className="menu-link px-3">Member Group</a>
												</div>
												{/*end::Menu item*/}
											</div>
											{/*end::Menu sub*/}
										</div>
										{/*end::Menu item*/}
										{/*begin::Menu item*/}
										<div className="menu-item px-3">
											<a href="#" className="menu-link px-3">New Contact</a>
										</div>
										{/*end::Menu item*/}
										{/*begin::Menu separator*/}
										<div className="separator mt-3 opacity-75"></div>
										{/*end::Menu separator*/}
										{/*begin::Menu item*/}
										<div className="menu-item px-3">
											<div className="menu-content px-3 py-3">
												<a className="btn btn-primary btn-sm px-4" href="#">Generate Reports</a>
											</div>
										</div>
										{/*end::Menu item*/}
									</div>
									{/*end::Menu 2*/}
									{/*end::Menu*/}
								</div>
								{/*end::Toolbar*/}
							</div>
							{/*end::Header*/}
							{/*begin::Body*/}
							<div className="card-body pt-5">
								{/*begin::Item*/}
								<div className="d-flex flex-stack">
									{/*begin::Section*/}
									<div className="text-gray-700 fw-semibold fs-6 me-2">Avg. Client Rating</div>
									{/*end::Section*/}
									{/*begin::Statistics*/}
									<div className="d-flex align-items-senter">
										<i className="ki-outline ki-arrow-up-right fs-2 text-success me-2"></i>
										{/*begin::Number*/}
										<span className="text-gray-900 fw-bolder fs-6">7.8</span>
										{/*end::Number*/}
										<span className="text-gray-500 fw-bold fs-6">/10</span>
									</div>
									{/*end::Statistics*/}
								</div>
								{/*end::Item*/}
								{/*begin::Separator*/}
								<div className="separator separator-dashed my-3"></div>
								{/*end::Separator*/}
								{/*begin::Item*/}
								<div className="d-flex flex-stack">
									{/*begin::Section*/}
									<div className="text-gray-700 fw-semibold fs-6 me-2">Instagram Followers</div>
									{/*end::Section*/}
									{/*begin::Statistics*/}
									<div className="d-flex align-items-senter">
										<i className="ki-outline ki-arrow-down-right fs-2 text-danger me-2"></i>
										{/*begin::Number*/}
										<span className="text-gray-900 fw-bolder fs-6">730k</span>
										{/*end::Number*/}
									</div>
									{/*end::Statistics*/}
								</div>
								{/*end::Item*/}
								{/*begin::Separator*/}
								<div className="separator separator-dashed my-3"></div>
								{/*end::Separator*/}
								{/*begin::Item*/}
								<div className="d-flex flex-stack">
									{/*begin::Section*/}
									<div className="text-gray-700 fw-semibold fs-6 me-2">Google Ads CPC</div>
									{/*end::Section*/}
									{/*begin::Statistics*/}
									<div className="d-flex align-items-senter">
										<i className="ki-outline ki-arrow-up-right fs-2 text-success me-2"></i>
										{/*begin::Number*/}
										<span className="text-gray-900 fw-bolder fs-6">$2.09</span>
										{/*end::Number*/}
									</div>
									{/*end::Statistics*/}
								</div>
								{/*end::Item*/}
							</div>
							{/*end::Body*/}
						</div>
						{/*end::LIst widget 1*/}
					</div>
					{/*end::Col*/}
					{/*begin::Col*/}
					<div className="col-sm-6">
						{/*begin::List widget 2*/}
						<div className="card card-flush">
							{/*begin::Header*/}
							<div className="card-header pt-5">
								{/*begin::Title*/}
								<h3 className="card-title align-items-start flex-column">
									<span className="card-label fw-bold text-gray-900">External Links</span>
									<span className="text-gray-500 mt-1 fw-semibold fs-6">Most used resources</span>
								</h3>
								{/*end::Title*/}
								{/*begin::Toolbar*/}
								<div className="card-toolbar">
									{/*begin::Menu*/}
									<button className="btn btn-icon btn-color-gray-500 btn-active-color-primary justify-content-end" data-kt-menu-trigger="click" data-kt-menu-placement="bottom-end" data-kt-menu-overflow="true">
										<i className="ki-outline ki-dots-square fs-1"></i>
									</button>
									{/*begin::Menu 3*/}
									<div className="menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-800 menu-state-bg-light-primary fw-semibold w-200px py-3" data-kt-menu="true">
										{/*begin::Heading*/}
										<div className="menu-item px-3">
											<div className="menu-content text-muted pb-2 px-3 fs-7 text-uppercase">Payments</div>
										</div>
										{/*end::Heading*/}
										{/*begin::Menu item*/}
										<div className="menu-item px-3">
											<a href="#" className="menu-link px-3">Create Invoice</a>
										</div>
										{/*end::Menu item*/}
										{/*begin::Menu item*/}
										<div className="menu-item px-3">
											<a href="#" className="menu-link flex-stack px-3">Create Payment
												<span className="ms-2" data-bs-toggle="tooltip" title="Specify a target name for future usage and reference">
													<i className="ki-outline ki-information fs-6"></i>
												</span></a>
										</div>
										{/*end::Menu item*/}
										{/*begin::Menu item*/}
										<div className="menu-item px-3">
											<a href="#" className="menu-link px-3">Generate Bill</a>
										</div>
										{/*end::Menu item*/}
										{/*begin::Menu item*/}
										<div className="menu-item px-3" data-kt-menu-trigger="hover" data-kt-menu-placement="right-end">
											<a href="#" className="menu-link px-3">
												<span className="menu-title">Subscription</span>
												<span className="menu-arrow"></span>
											</a>
											{/*begin::Menu sub*/}
											<div className="menu-sub menu-sub-dropdown w-175px py-4">
												{/*begin::Menu item*/}
												<div className="menu-item px-3">
													<a href="#" className="menu-link px-3">Plans</a>
												</div>
												{/*end::Menu item*/}
												{/*begin::Menu item*/}
												<div className="menu-item px-3">
													<a href="#" className="menu-link px-3">Billing</a>
												</div>
												{/*end::Menu item*/}
												{/*begin::Menu item*/}
												<div className="menu-item px-3">
													<a href="#" className="menu-link px-3">Statements</a>
												</div>
												{/*end::Menu item*/}
												{/*begin::Menu separator*/}
												<div className="separator my-2"></div>
												{/*end::Menu separator*/}
												{/*begin::Menu item*/}
												<div className="menu-item px-3">
													<div className="menu-content px-3">
														{/*begin::Switch*/}
														<label className="form-check form-switch form-check-custom form-check-solid">
															{/*begin::Input*/}
															<input className="form-check-input w-30px h-20px" type="checkbox" value="1" defaultChecked={true} name="notifications" />
															{/*end::Input*/}
															{/*end::Label*/}
															<span className="form-check-label text-muted fs-6">Recuring</span>
															{/*end::Label*/}
														</label>
														{/*end::Switch*/}
													</div>
												</div>
												{/*end::Menu item*/}
											</div>
											{/*end::Menu sub*/}
										</div>
										{/*end::Menu item*/}
										{/*begin::Menu item*/}
										<div className="menu-item px-3 my-1">
											<a href="#" className="menu-link px-3">Settings</a>
										</div>
										{/*end::Menu item*/}
									</div>
									{/*end::Menu 3*/}
									{/*end::Menu*/}
								</div>
								{/*end::Toolbar*/}
							</div>
							{/*end::Header*/}
							{/*begin::Body*/}
							<div className="card-body pt-5">
								{/*begin::Item*/}
								<div className="d-flex flex-stack">
									{/*begin::Title*/}
									<a href="#" className="text-primary opacity-75-hover fs-6 fw-semibold">Google Analytics</a>
									{/*end::Title*/}
									{/*begin::Action*/}
									<button type="button" className="btn btn-icon btn-sm h-auto btn-color-gray-500 btn-active-color-primary justify-content-end">
										<i className="ki-outline ki-exit-right-corner fs-2"></i>
									</button>
									{/*end::Action*/}
								</div>
								{/*end::Item*/}
								{/*begin::Separator*/}
								<div className="separator separator-dashed my-3"></div>
								{/*end::Separator*/}
								{/*begin::Item*/}
								<div className="d-flex flex-stack">
									{/*begin::Title*/}
									<a href="#" className="text-primary opacity-75-hover fs-6 fw-semibold">Facebook Ads</a>
									{/*end::Title*/}
									{/*begin::Action*/}
									<button type="button" className="btn btn-icon btn-sm h-auto btn-color-gray-500 btn-active-color-primary justify-content-end">
										<i className="ki-outline ki-exit-right-corner fs-2"></i>
									</button>
									{/*end::Action*/}
								</div>
								{/*end::Item*/}
								{/*begin::Separator*/}
								<div className="separator separator-dashed my-3"></div>
								{/*end::Separator*/}
								{/*begin::Item*/}
								<div className="d-flex flex-stack">
									{/*begin::Title*/}
									<a href="#" className="text-primary opacity-75-hover fs-6 fw-semibold">Seranking</a>
									{/*end::Title*/}
									{/*begin::Action*/}
									<button type="button" className="btn btn-icon btn-sm h-auto btn-color-gray-500 btn-active-color-primary justify-content-end">
										<i className="ki-outline ki-exit-right-corner fs-2"></i>
									</button>
									{/*end::Action*/}
								</div>
								{/*end::Item*/}
							</div>
							{/*end::Body*/}
						</div>
						{/*end::List widget 2*/}
					</div>
					{/*end::Col*/}
				</div>
				{/*end::Row*/}
			</div>
			{/*end::Col*/}
			{/*begin::Col*/}
			<div className="col-xl-4">
				{/*begin::Row*/}
				<div className="row gx-5 gx-xl-10">
					{/*begin::Col*/}
					<div className="col-sm-6 col-xl-12 mb-5 mb-xl-10">
						{/*begin::List widget 10*/}
						<div className="card card-flush">
							{/*begin::Header*/}
							<div className="card-header pt-7">
								{/*begin::Title*/}
								<h3 className="card-title align-items-start flex-column">
									<span className="card-label fw-bold text-gray-800">Shipment History</span>
									<span className="text-gray-500 mt-1 fw-semibold fs-6">Latest article updates</span>
								</h3>
								{/*end::Title*/}
								{/*begin::Toolbar*/}
								<div className="card-toolbar">
									<a href="#" className="btn btn-sm btn-light" data-bs-toggle='tooltip' data-bs-dismiss='click' data-bs-custom-className="tooltip-inverse" title="Logistics App is coming soon">View All</a>
								</div>
								{/*end::Toolbar*/}
							</div>
							{/*end::Header*/}
							{/*begin::Body*/}
							<div className="card-body">
								{/*begin::Nav*/}
								<ul className="nav nav-pills nav-pills-custom row position-relative mx-0 mb-9">
									<li className="nav-item col-4 mx-0 p-0">
										<a
											className={`nav-link d-flex justify-content-center w-100 border-0 h-100 ${activeFilter === 'all' ? 'active' : ''}`}
											href="#kt_list_widget_10_tab_all"
											onClick={(e) => { e.preventDefault(); setActiveFilter('all'); }}
										>
											<span className="nav-text text-gray-800 fw-bold fs-6 mb-3">ALL</span>
											<span className="bullet-custom position-absolute z-index-2 bottom-0 w-100 h-4px bg-primary rounded"></span>
										</a>
									</li>
									<li className="nav-item col-4 mx-0 px-0">
										<a
											className={`nav-link d-flex justify-content-center w-100 border-0 h-100 ${activeFilter === 'published' ? 'active' : ''}`}
											href="#kt_list_widget_10_tab_published"
											onClick={(e) => { e.preventDefault(); setActiveFilter('published'); }}
										>
											<span className="nav-text text-gray-800 fw-bold fs-6 mb-3">PUBLISHED</span>
											<span className="bullet-custom position-absolute z-index-2 bottom-0 w-100 h-4px bg-primary rounded"></span>
										</a>
									</li>
									<li className="nav-item col-4 mx-0 px-0">
										<a
											className={`nav-link d-flex justify-content-center w-100 border-0 h-100 ${activeFilter === 'generated' ? 'active' : ''}`}
											href="#kt_list_widget_10_tab_generated"
											onClick={(e) => { e.preventDefault(); setActiveFilter('generated'); }}
										>
											<span className="nav-text text-gray-800 fw-bold fs-6 mb-3">GENERATED</span>
											<span className="bullet-custom position-absolute z-index-2 bottom-0 w-100 h-4px bg-primary rounded"></span>
										</a>
									</li>
									<span className="position-absolute z-index-1 bottom-0 w-100 h-4px bg-light rounded"></span>
								</ul>
								{/*end::Nav*/}
								{/*begin::Tab Content*/}
								<div className="tab-content">
									<div className={`tab-pane fade ${activeFilter === 'all' ? 'show active' : ''}`} id="kt_list_widget_10_tab_all">
										{activeFilter === 'all' && renderActivityItems()}
									</div>
									<div className={`tab-pane fade ${activeFilter === 'published' ? 'show active' : ''}`} id="kt_list_widget_10_tab_published">
										{activeFilter === 'published' && renderActivityItems()}
									</div>
									<div className={`tab-pane fade ${activeFilter === 'generated' ? 'show active' : ''}`} id="kt_list_widget_10_tab_generated">
										{activeFilter === 'generated' && renderActivityItems()}
									</div>
								</div>
								{/*end::Tab Content*/}
							</div>
							{/*end: Card Body*/}
						</div>
						{/*end::List widget 10*/}
					</div>
					{/*end::Col*/}
					{/*begin::Col*/}
					<div className="col-sm-6 col-xl-12 mb-xl-10">
						{/*begin::List widget 11*/}
						<div className="card card-flush">
							{/*begin::Header*/}
							<div className="card-header pt-7 mb-3">
								{/*begin::Title*/}
								<h3 className="card-title align-items-start flex-column">
									<span className="card-label fw-bold text-gray-800">Our Fleet Tonnage</span>
									<span className="text-gray-500 mt-1 fw-semibold fs-6">Total 1,247 vehicles</span>
								</h3>
								{/*end::Title*/}
								{/*begin::Toolbar*/}
								<div className="card-toolbar">
									<a href="#" className="btn btn-sm btn-light" data-bs-toggle='tooltip' data-bs-dismiss='click' data-bs-custom-className="tooltip-inverse" title="Logistics App is coming soon">Review Fleet</a>
								</div>
								{/*end::Toolbar*/}
							</div>
							{/*end::Header*/}
							{/*begin::Body*/}
							<div className="card-body pt-4">
								{/*begin::Item*/}
								<div className="d-flex flex-stack">
									{/*begin::Section*/}
									<div className="d-flex align-items-center me-5">
										{/*begin::Symbol*/}
										<div className="symbol symbol-40px me-4">
											<span className="symbol-label">
												<i className="ki-outline ki-ship text-gray-600 fs-1"></i>
											</span>
										</div>
										{/*end::Symbol*/}
										{/*begin::Content*/}
										<div className="me-5">
											{/*begin::Title*/}
											<a href="#" className="text-gray-800 fw-bold text-hover-primary fs-6">Ships</a>
											{/*end::Title*/}
											{/*begin::Desc*/}
											<span className="text-gray-500 fw-semibold fs-7 d-block text-start ps-0">234 Ships</span>
											{/*end::Desc*/}
										</div>
										{/*end::Content*/}
									</div>
									{/*end::Section*/}
									{/*begin::Wrapper*/}
									<div className="text-gray-500 fw-bold fs-7 text-end">
										{/*begin::Number*/}
										<span className="text-gray-800 fw-bold fs-6 d-block">2,345,500</span>
										{/*end::Number*/}Tons</div>
									{/*end::Wrapper*/}
								</div>
								{/*end::Item*/}
								{/*begin::Separator*/}
								<div className="separator separator-dashed my-5"></div>
								{/*end::Separator*/}
								{/*begin::Item*/}
								<div className="d-flex flex-stack">
									{/*begin::Section*/}
									<div className="d-flex align-items-center me-5">
										{/*begin::Symbol*/}
										<div className="symbol symbol-40px me-4">
											<span className="symbol-label">
												<i className="ki-outline ki-truck text-gray-600 fs-1"></i>
											</span>
										</div>
										{/*end::Symbol*/}
										{/*begin::Content*/}
										<div className="me-5">
											{/*begin::Title*/}
											<a href="#" className="text-gray-800 fw-bold text-hover-primary fs-6">Trucks</a>
											{/*end::Title*/}
											{/*begin::Desc*/}
											<span className="text-gray-500 fw-semibold fs-7 d-block text-start ps-0">1,460 Trucks</span>
											{/*end::Desc*/}
										</div>
										{/*end::Content*/}
									</div>
									{/*end::Section*/}
									{/*begin::Wrapper*/}
									<div className="text-gray-500 fw-bold fs-7 text-end">
										{/*begin::Number*/}
										<span className="text-gray-800 fw-bold fs-6 d-block">457,200</span>
										{/*end::Number*/}Tons</div>
									{/*end::Wrapper*/}
								</div>
								{/*end::Item*/}
								{/*begin::Separator*/}
								<div className="separator separator-dashed my-5"></div>
								{/*end::Separator*/}
								{/*begin::Item*/}
								<div className="d-flex flex-stack">
									{/*begin::Section*/}
									<div className="d-flex align-items-center me-5">
										{/*begin::Symbol*/}
										<div className="symbol symbol-40px me-4">
											<span className="symbol-label">
												<i className="ki-outline ki-airplane-square text-gray-600 fs-1"></i>
											</span>
										</div>
										{/*end::Symbol*/}
										{/*begin::Content*/}
										<div className="me-5">
											{/*begin::Title*/}
											<a href="#" className="text-gray-800 fw-bold text-hover-primary fs-6">Planes</a>
											{/*end::Title*/}
											{/*begin::Desc*/}
											<span className="text-gray-500 fw-semibold fs-7 d-block text-start ps-0">8 Aircrafts</span>
											{/*end::Desc*/}
										</div>
										{/*end::Content*/}
									</div>
									{/*end::Section*/}
									{/*begin::Wrapper*/}
									<div className="text-gray-500 fw-bold fs-7 text-end">
										{/*begin::Number*/}
										<span className="text-gray-800 fw-bold fs-6 d-block">1,240</span>
										{/*end::Number*/}Tons</div>
									{/*end::Wrapper*/}
								</div>
								{/*end::Item*/}
								{/*begin::Separator*/}
								<div className="separator separator-dashed my-5"></div>
								{/*end::Separator*/}
								{/*begin::Item*/}
								<div className="d-flex flex-stack">
									{/*begin::Section*/}
									<div className="d-flex align-items-center me-5">
										{/*begin::Symbol*/}
										<div className="symbol symbol-40px me-4">
											<span className="symbol-label">
												<i className="ki-outline ki-bus text-gray-600 fs-1"></i>
											</span>
										</div>
										{/*end::Symbol*/}
										{/*begin::Content*/}
										<div className="me-5">
											{/*begin::Title*/}
											<a href="#" className="text-gray-800 fw-bold text-hover-primary fs-6">Trains</a>
											{/*end::Title*/}
											{/*begin::Desc*/}
											<span className="text-gray-500 fw-semibold fs-7 d-block text-start ps-0">36 Trains</span>
											{/*end::Desc*/}
										</div>
										{/*end::Content*/}
									</div>
									{/*end::Section*/}
									{/*begin::Wrapper*/}
									<div className="text-gray-500 fw-bold fs-7 text-end">
										{/*begin::Number*/}
										<span className="text-gray-800 fw-bold fs-6 d-block">804,300</span>
										{/*end::Number*/}Tons</div>
									{/*end::Wrapper*/}
								</div>
								{/*end::Item*/}
								<div className="text-center pt-9">
									<a href="apps/ecommerce/catalog/add-product.html" className="btn btn-primary">Add Vehicle</a>
								</div>
							</div>
							{/*end::Body*/}
						</div>
						{/*end::List widget 11*/}
					</div>
					{/*end::Col*/}
				</div>
				{/*end::Row*/}
			</div>
			{/*end::Col*/}
		</div>

	);
};

export default DashboardContent;
