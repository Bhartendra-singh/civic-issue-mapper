import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import {
  LayoutDashboard, ClipboardList, Building2, ScrollText,
  Loader2, AlertTriangle, Plus, Image as ImageIcon,
  RefreshCw, Trash2, FolderPlus, Users, Clock, CheckCircle2, Link2,
  MessageSquare, Send, Bot, Sparkles,
} from 'lucide-react';
import {
  getAllReports, updateReportStatus, getAnalytics,
  getDepartments, createDepartment, getAuditLogs, sendAdminChatQuery,
} from '../../services/api';
import { timeAgo } from '../../utils/timeAgo';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';

const CATEGORY_LABELS = {
  pothole: 'Pothole',
  garbage: 'Garbage',
  waterlogging: 'Waterlogging',
  streetlight: 'Streetlight',
  drain: 'Drain',
  other: 'Other',
};

const STATUS_LABELS = {
  pending: 'Pending',
  'in-progress': 'In Progress',
  resolved: 'Resolved',
  reopened: 'Reopened',
};

const ALL_CATEGORIES = ['pothole', 'garbage', 'waterlogging', 'streetlight', 'drain', 'other'];

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'reports', label: 'Reports', icon: ClipboardList },
  { id: 'departments', label: 'Departments', icon: Building2 },
  { id: 'audit', label: 'Audit Log', icon: ScrollText },
  { id: 'assistant', label: 'Assistant', icon: MessageSquare },
];

const AUDIT_ACTION_META = {
  'status-update': { icon: RefreshCw, bg: 'bg-cyan-dim', text: 'text-cyan' },
  'delete-report': { icon: Trash2, bg: 'bg-status-open-bg', text: 'text-status-open' },
  'create-department': { icon: FolderPlus, bg: 'bg-status-resolved-bg', text: 'text-status-resolved' },
};

const STATUS_SELECT_STYLES = {
  pending: 'bg-status-open-bg border-status-open/40 text-status-open',
  'in-progress': 'bg-status-progress-bg border-status-progress/40 text-status-progress',
  resolved: 'bg-status-resolved-bg border-status-resolved/40 text-status-resolved',
  reopened: 'bg-status-open-bg border-status-open/40 text-status-open',
};

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  // Reports
  const [reports, setReports] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [reportsError, setReportsError] = useState('');

  // Analytics
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState('');

  // Departments
  const [departments, setDepartments] = useState([]);
  const [deptLoading, setDeptLoading] = useState(true);
  const [deptError, setDeptError] = useState('');
  const [deptName, setDeptName] = useState('');
  const [deptDescription, setDeptDescription] = useState('');
  const [deptCategories, setDeptCategories] = useState([]);
  const [deptSubmitting, setDeptSubmitting] = useState(false);
  const [deptFormError, setDeptFormError] = useState('');

  // Audit Log
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(true);
  const [auditError, setAuditError] = useState('');

  // Chat Assistant
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState('');

  useEffect(() => {
  getAllReports()
    .then((data) => {
      const isActive = (r) => r.status === 'pending' || r.status === 'in-progress';

      const sorted = [...data.reports].sort((a, b) => {
        const aActive = isActive(a);
        const bActive = isActive(b);

        if (aActive && !bActive) return -1;
        if (!aActive && bActive) return 1;

        return (b.priorityScore ?? 0) - (a.priorityScore ?? 0);
      });

      setReports(sorted);
    })
    .catch((err) => setReportsError(err.message))
    .finally(() => setReportsLoading(false));

    getAnalytics()
      .then((data) => setAnalytics(data))
      .catch((err) => setAnalyticsError(err.message))
      .finally(() => setAnalyticsLoading(false));

    getDepartments()
      .then((data) => setDepartments(data.departments))
      .catch((err) => setDeptError(err.message))
      .finally(() => setDeptLoading(false));

    getAuditLogs()
      .then((data) => setAuditLogs(data.logs))
      .catch((err) => setAuditError(err.message))
      .finally(() => setAuditLoading(false));
  }, []);

  const handleStatusChange = async (reportId, newStatus) => {
  try {
    await updateReportStatus(reportId, newStatus);
    setReports((prev) =>
      prev.map((r) => (r._id === reportId ? { ...r, status: newStatus } : r))
    );

    const freshAnalytics = await getAnalytics();
    setAnalytics(freshAnalytics);
  } catch (err) {
    setReportsError(err.message);
  }
  };

  const toggleDeptCategory = (category) => {
    setDeptCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    setDeptFormError('');

    if (!deptName.trim()) {
      setDeptFormError('Department name is required');
      return;
    }

    setDeptSubmitting(true);
    try {
      const data = await createDepartment(deptName, deptDescription, deptCategories);
      setDepartments((prev) => [...prev, data.department].sort((a, b) => a.name.localeCompare(b.name)));
      setDeptName('');
      setDeptDescription('');
      setDeptCategories([]);
    } catch (err) {
      setDeptFormError(err.message);
    } finally {
      setDeptSubmitting(false);
    }
  };


  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userQuery = chatInput;
    setChatMessages((prev) => [...prev, { role: 'user', text: userQuery }]);
    setChatInput('');
    setChatError('');
    setChatLoading(true);

    try {
      const data = await sendAdminChatQuery(userQuery);
      setChatMessages((prev) => [...prev, { role: 'assistant', text: data.answer }]);
    } catch (err) {
      setChatError(err.message);
    } finally {
      setChatLoading(false);
    }
  };

  const statusChartData = analytics?.statusCounts?.map((s) => ({
    name: STATUS_LABELS[s._id] || s._id,
    count: s.count,
  })) || [];

  const categoryChartData = analytics?.categoryCounts?.map((c) => ({
    name: CATEGORY_LABELS[c._id] || c._id,
    count: c.count,
  })) || [];

  return (
    <div className="min-h-screen bg-light">

      {/* ── Dark Hero-Strip with Tabs ── */}
      <div className="relative bg-navy px-6 pt-10 pb-0 overflow-hidden">
        <div className="absolute -top-16 right-10 w-56 h-56 rounded-full border border-cyan-dim"></div>

        <div className="relative max-w-6xl mx-auto">
          <h2 className="font-heading text-3xl font-bold text-text-primary">
            Admin Dashboard
          </h2>
          <p className="font-body text-sm text-text-muted mt-1">
            Manage reports, departments, and track admin activity.
          </p>

          <div className="flex gap-1 mt-8 overflow-x-auto items-center">
            {TABS.map((tab) =>
              tab.id === 'assistant' ? (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 ml-2 rounded-full font-body text-sm font-semibold whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-cyan to-cyan-deep text-navy shadow-lg shadow-cyan/20'
                      : 'bg-cyan-dim/40 text-cyan border border-cyan-dim hover:bg-cyan-dim'
                  }`}
                >
                  <Sparkles size={14} /> {tab.label}
                </button>
              ) : (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3 font-body text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-cyan text-cyan'
                      : 'border-transparent text-text-muted hover:text-text-primary'
                  }`}
                >
                  <tab.icon size={16} /> {tab.label}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div>
            {analyticsError && (
              <div className="flex items-center gap-2 bg-status-open-bg border border-status-open/30 text-status-open text-sm rounded-lg px-4 py-3 mb-6">
                <AlertTriangle size={16} /> {analyticsError}
              </div>
            )}

            {analyticsLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={28} className="text-cyan animate-spin" />
              </div>
            ) : analytics && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 mb-8">
                  {[
                    { icon: ClipboardList, value: analytics.totalReports, label: 'Total Reports', tint: 'bg-cyan-dim text-cyan' },
                    { icon: Users, value: analytics.activeUsers, label: 'Active Citizens', tint: 'bg-cyan-dim text-cyan' },
                    {
                      icon: Clock,
                      value: statusChartData.find((s) => s.name === 'Pending')?.count ?? 0,
                      label: 'Pending',
                      tint: 'bg-status-open-bg text-status-open',
                    },
                    {
                      icon: CheckCircle2,
                      value: statusChartData.find((s) => s.name === 'Resolved')?.count ?? 0,
                      label: 'Resolved',
                      tint: 'bg-status-resolved-bg text-status-resolved',
                    },
                  ].map((stat) => (
                    <Card key={stat.label} padding="lg">
                      <div className={`w-11 h-11 rounded-lg flex items-center justify-center mb-4 ${stat.tint}`}>
                        <stat.icon size={20} />
                      </div>
                      <p className="font-heading text-3xl font-bold text-ink">{stat.value}</p>
                      <p className="font-body text-xs text-ink/60 mt-1.5">{stat.label}</p>
                    </Card>
                  ))}
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  <Card padding="lg">
                    <p className="font-heading text-sm font-bold text-ink mb-5">Reports by Status</p>
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={statusChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e8ecef" vertical={false} />
                          <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} />
                          <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} />
                          <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                          <Bar dataKey="count" fill="#22d3ee" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>

                  <Card padding="lg">
                    <p className="font-heading text-sm font-bold text-ink mb-5">Reports by Category</p>
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={categoryChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e8ecef" vertical={false} />
                          <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} />
                          <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} />
                          <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                          <Bar dataKey="count" fill="#0e1c30" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </div>
              </>
            )}
          </div>
        )}

        {/* REPORTS TAB */}
        {activeTab === 'reports' && (
          <div>
            {reportsError && (
              <div className="flex items-center gap-2 bg-status-open-bg border border-status-open/30 text-status-open text-sm rounded-lg px-4 py-3 mb-6">
                <AlertTriangle size={16} /> {reportsError}
              </div>
            )}

            {reportsLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={28} className="text-cyan animate-spin" />
              </div>
            ) : (
              <Card padding="none" className="overflow-hidden overflow-x-auto">
                <table className="w-full font-body text-sm">
                  <thead className="bg-light border-b border-hairline">
                    <tr>
                      <th className="text-left px-4 py-3 text-ink/60 font-semibold">Photo</th>
                      <th className="text-left px-4 py-3 text-ink/60 font-semibold">Category</th>
                      <th className="text-left px-4 py-3 text-ink/60 font-semibold">Cluster</th>
                      <th className="text-left px-4 py-3 text-ink/60 font-semibold">Description</th>
                      <th className="text-left px-4 py-3 text-ink/60 font-semibold">Reported By</th>
                      <th className="text-left px-4 py-3 text-ink/60 font-semibold">Priority</th>
                      <th className="text-left px-4 py-3 text-ink/60 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report) => {
                      const thumbnail = report.photoUrls?.[0]?.url;
                      const reporterName = report.user?.name || 'Unknown';
                      return (
                        <tr key={report._id} className="border-b border-hairline last:border-0 hover:bg-light/60 transition-colors">
                          <td className="px-4 py-3">
                            {thumbnail ? (
                              <img src={thumbnail} alt={report.category} className="w-12 h-12 object-cover rounded-lg" />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-light flex items-center justify-center">
                                <ImageIcon size={16} className="text-ink/30" />
                              </div>
                            )} 
                          </td>
                          <td className="px-4 py-3">
                            <Badge status="neutral">{CATEGORY_LABELS[report.category] || report.category}</Badge>
                          </td>

                          <td className="px-4 py-3">
                            {report.clusterId ? (
                              <span className="flex items-center gap-1 text-xs text-cyan font-semibold">
                                <Link2 size={12} /> Duplicate
                              </span>
                            ) : (
                              <span className="text-xs text-ink/30">—</span>
                            )}
                          </td>

                          <td className="px-4 py-3 text-ink max-w-xs truncate" title={report.description}>
                            {report.description}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-navy text-cyan flex items-center justify-center text-xs font-bold shrink-0">
                                {reporterName.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-ink">{reporterName}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {report.status === 'pending' || report.status === 'in-progress' ? (
                              <span className={`text-xs font-bold ${
                                report.priorityScore >= 70 ? 'text-status-open' :
                                report.priorityScore >= 40 ? 'text-status-progress' :
                                'text-ink/40'
                              }`}>
                                {report.priorityScore ?? 0}
                              </span>
                            ) : (
                              <span className="text-xs text-ink/30">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={report.status}
                              onChange={(e) => handleStatusChange(report._id, e.target.value)}
                              className={`border rounded-full px-3 py-1.5 text-xs font-semibold outline-none focus:ring-2 focus:ring-cyan/30 cursor-pointer transition-colors ${STATUS_SELECT_STYLES[report.status] || 'bg-light border-hairline text-ink'}`}
                            >
                              <option value="pending" style={{ backgroundColor: '#ffffff', color: '#2C3E5C' }}>Pending</option>
                              <option value="in-progress" style={{ backgroundColor: '#ffffff', color: '#2C3E5C' }}>In Progress</option>
                              <option value="resolved" style={{ backgroundColor: '#ffffff', color: '#2C3E5C' }}>Resolved</option>
                              <option value="reopened" style={{ backgroundColor: '#ffffff', color: '#2C3E5C' }}>Reopened</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>

                </table>
              </Card>
            )}
          </div>
        )}

        {/* DEPARTMENTS TAB */}
        {activeTab === 'departments' && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {deptError && (
                <div className="flex items-center gap-2 bg-status-open-bg border border-status-open/30 text-status-open text-sm rounded-lg px-4 py-3 mb-6">
                  <AlertTriangle size={16} /> {deptError}
                </div>
              )}

              {deptLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 size={28} className="text-cyan animate-spin" />
                </div>
              ) : departments.length === 0 ? (
                <p className="font-body text-sm text-ink/60">No departments created yet.</p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-5">
                  {departments.map((dept) => (
                    <Card key={dept._id} padding="lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-cyan-dim flex items-center justify-center text-cyan shrink-0">
                          <Building2 size={18} />
                        </div>
                        <p className="font-heading text-base font-bold text-ink">{dept.name}</p>
                      </div>

                      {dept.description && (
                        <p className="font-body text-xs text-ink/60 mt-3">{dept.description}</p>
                      )}

                      <div className="flex flex-wrap gap-1.5 mt-4">
                        {(dept.categories || []).map((cat) => (
                          <Badge key={cat} status="neutral">{CATEGORY_LABELS[cat] || cat}</Badge>
                        ))}
                      </div>

                        <p className="font-body text-xs text-ink/50 mt-4">
                          {reports.filter((r) => r.department === dept._id).length} report(s) assigned
                        </p>
                        <p className="font-body text-xs text-ink/40 mt-1 pt-3 border-t border-hairline">
                          SLA: {dept.slaHours ?? 72}h
                        </p>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <div>
              <form
                onSubmit={handleCreateDepartment}
                className="bg-white border border-hairline rounded-xl p-5"
              >
                <p className="font-heading text-sm font-bold text-ink mb-4">New Department</p>

                {deptFormError && (
                  <div className="bg-status-open-bg border border-status-open/30 text-status-open text-xs rounded-lg px-3 py-2 mb-4">
                    {deptFormError}
                  </div>
                )}

                <Input
                  id="dept-name"
                  label="Name"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  placeholder="e.g. Sanitation Dept."
                />

                <div className="mt-4">
                  <Input
                    id="dept-description"
                    label="Description"
                    type="textarea"
                    value={deptDescription}
                    onChange={(e) => setDeptDescription(e.target.value)}
                    placeholder="Optional"
                  />
                </div>

                <div className="mt-4">
                  <label className="text-sm font-medium text-ink block mb-2">Categories</label>
                  <div className="flex flex-wrap gap-2">
                    {ALL_CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleDeptCategory(cat)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                          deptCategories.includes(cat)
                            ? 'bg-cyan-dim border-cyan text-cyan'
                            : 'border-hairline text-ink/60 hover:border-cyan hover:text-cyan'
                        }`}
                      >
                        {CATEGORY_LABELS[cat]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-5">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    icon={Plus}
                    loading={deptSubmitting}
                    className="w-full"
                  >
                    Create Department
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* AUDIT LOG TAB */}
        {activeTab === 'audit' && (
          <div>
            {auditError && (
              <div className="flex items-center gap-2 bg-status-open-bg border border-status-open/30 text-status-open text-sm rounded-lg px-4 py-3 mb-6">
                <AlertTriangle size={16} /> {auditError}
              </div>
            )}

            {auditLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 size={28} className="text-cyan animate-spin" />
              </div>
            ) : auditLogs.length === 0 ? (
              <p className="font-body text-sm text-ink/60">No admin activity logged yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {auditLogs.map((log) => {
                  const meta = AUDIT_ACTION_META[log.action] || AUDIT_ACTION_META['status-update'];
                  return (
                    <Card key={log._id} padding="md">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${meta.bg} ${meta.text}`}>
                          <meta.icon size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-body text-sm text-ink">{log.description}</p>
                          <p className="font-body text-xs text-ink/50 mt-0.5">
                            by {log.admin?.name || 'Unknown admin'}
                          </p>
                        </div>
                        <span className="font-body text-xs text-ink/40 whitespace-nowrap">
                          {timeAgo(log.createdAt)}
                        </span>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ASSISTANT TAB */}
        {activeTab === 'assistant' && (
          <div className="max-w-3xl mx-auto">
            <Card padding="none" className="overflow-hidden flex flex-col h-[600px]">
              <div className="flex items-center gap-3 px-6 py-5 bg-navy relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full border border-cyan-dim"></div>
                <div className="w-10 h-10 rounded-xl bg-cyan-dim flex items-center justify-center text-cyan shrink-0 relative z-10">
                  <Bot size={20} />
                </div>
                <div className="relative z-10">
                  <p className="font-heading text-sm font-bold text-text-primary">Report Assistant</p>
                  <p className="font-body text-xs text-text-muted">Ask anything about your civic reports</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 bg-light">
                {chatMessages.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center gap-5 py-10">
                    <div className="w-14 h-14 rounded-2xl bg-cyan-dim flex items-center justify-center text-cyan">
                      <Bot size={26} />
                    </div>
                    <p className="font-body text-sm text-ink/50 text-center max-w-xs">
                      Ask me about report counts, status breakdowns, SLA breaches, or anything else in your data.
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center max-w-sm">
                      {[
                        'How many pending reports are there?',
                        'Show me all resolved reports',
                        'Which category has the most complaints?',
                      ].map((suggestion) => (
                        <button
                          key={suggestion}
                          onClick={() => setChatInput(suggestion)}
                          className="font-body text-xs text-cyan bg-cyan-dim/50 border border-cyan-dim rounded-full px-3 py-1.5 hover:bg-cyan-dim transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  chatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex items-end gap-2 ${msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                        msg.role === 'user' ? 'bg-navy text-cyan' : 'bg-cyan-dim text-cyan'
                      }`}>
                        {msg.role === 'user' ? <Users size={13} /> : <Bot size={13} />}
                      </div>
                      <div
                        className={`max-w-[75%] px-4 py-2.5 font-body text-sm shadow-sm ${
                          msg.role === 'user'
                            ? 'bg-cyan text-navy rounded-2xl rounded-br-md'
                            : 'bg-white text-ink rounded-2xl rounded-bl-md border border-hairline'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))
                )}

                {chatLoading && (
                  <div className="flex items-end gap-2 self-start">
                    <div className="w-7 h-7 rounded-full bg-cyan-dim text-cyan flex items-center justify-center shrink-0">
                      <Bot size={13} />
                    </div>
                    <div className="bg-white border border-hairline rounded-2xl rounded-bl-md px-4 py-3 flex gap-1 items-center">
                      <span className="w-1.5 h-1.5 bg-cyan rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-cyan rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-cyan rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                )}
              </div>

              {chatError && (
                <div className="px-5 py-2 text-xs text-status-open border-t border-hairline bg-status-open-bg">
                  {chatError}
                </div>
              )}

              <form onSubmit={handleSendChat} className="flex items-center gap-2 p-4 border-t border-hairline bg-white">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask a question about your reports..."
                  className="flex-1 border border-hairline rounded-full px-4 py-2.5 font-body text-sm text-ink outline-none focus:border-cyan focus:ring-2 focus:ring-cyan/20 transition-all"
                />
                <Button type="submit" variant="primary" size="md" icon={Send} loading={chatLoading} className="!rounded-full !px-5">
                  Send
                </Button>
              </form>
            </Card>
          </div>
        )}

      </div>
    </div>
  );
}

export default AdminDashboard;