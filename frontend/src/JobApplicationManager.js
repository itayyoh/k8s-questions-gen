import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  MapPin, 
  Building, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Eye, 
  Edit2, 
  Trash2, 
  TrendingUp, 
  Target, 
  Users,
  Award,
  BarChart3,
  Home
} from 'lucide-react';

const JobApplicationManager = () => {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [editingApp, setEditingApp] = useState(null);
  const [viewMode, setViewMode] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    company: '',
    appliedDate: new Date().toISOString().split('T')[0],
    status: 'applied',
    location: ''
  });

  // Load applications from API
  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/job-applications');
      if (response.ok) {
        const data = await response.json();
        setApplications(data || []);
        setFilteredApplications(data || []);
      } else {
        console.error('Failed to fetch applications');
        setApplications([]);
        setFilteredApplications([]);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      setApplications([]);
      setFilteredApplications([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter and search logic
  useEffect(() => {
    let filtered = applications;
    
    if (searchTerm) {
      filtered = filtered.filter(app => 
        app.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }
    
    setFilteredApplications(filtered);
  }, [applications, searchTerm, statusFilter]);

  const getStatusColor = (status) => {
    const colors = {
      applied: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
      interview: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30',
      offer: 'bg-green-500/20 text-green-300 border-green-400/30',
      rejected: 'bg-red-500/20 text-red-300 border-red-400/30',
      withdrawn: 'bg-gray-500/20 text-gray-300 border-gray-400/30'
    };
    return colors[status] || 'bg-gray-500/20 text-gray-300 border-gray-400/30';
  };

  const getStatusIcon = (status) => {
    const icons = {
      applied: <Clock className="h-4 w-4" />,
      interview: <Users className="h-4 w-4" />,
      offer: <Award className="h-4 w-4" />,
      rejected: <XCircle className="h-4 w-4" />,
      withdrawn: <AlertCircle className="h-4 w-4" />
    };
    return icons[status] || <Clock className="h-4 w-4" />;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getAnalytics = () => {
    const total = applications.length;
    const byStatus = applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {});
    
    const responseRate = total > 0 ? Math.round(((byStatus.interview || 0) + (byStatus.offer || 0)) / total * 100) : 0;
    const offerRate = total > 0 ? Math.round((byStatus.offer || 0) / total * 100) : 0;
    
    return { total, byStatus, responseRate, offerRate };
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const url = editingApp ? `/api/job-applications/${editingApp.id}` : '/api/job-applications';
      const method = editingApp ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchApplications(); // Refresh the list
        resetForm();
      } else {
        console.error('Failed to save application');
      }
    } catch (error) {
      console.error('Error saving application:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this application?')) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/job-applications/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchApplications();
      } else {
        console.error('Failed to delete application');
      }
    } catch (error) {
      console.error('Error deleting application:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      company: '',
      appliedDate: new Date().toISOString().split('T')[0],
      status: 'applied',
      location: ''
    });
    setShowAddForm(false);
    setEditingApp(null);
  };

  const handleEdit = (app) => {
    setFormData({
      company: app.company,
      appliedDate: app.appliedDate,
      status: app.status,
      location: app.location || ''
    });
    setEditingApp(app);
    setShowAddForm(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const analytics = getAnalytics();

  const EmptyState = () => (
    <div className="text-center py-16">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 border border-white/20 max-w-md mx-auto">
        <Target className="h-16 w-16 text-blue-400 mx-auto mb-6" />
        <h3 className="text-2xl font-bold text-white mb-4">No Applications Yet</h3>
        <p className="text-blue-200 mb-8">Start tracking your job applications by adding your first one!</p>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add First Application</span>
        </button>
      </div>
    </div>
  );

  const Dashboard = () => (
    <div className="space-y-8">
      {applications.length === 0 ? <EmptyState /> : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-200">Total Applications</p>
                  <p className="text-3xl font-bold text-white">{analytics.total}</p>
                </div>
                <Target className="h-8 w-8 text-blue-400" />
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-200">Response Rate</p>
                  <p className="text-3xl font-bold text-white">{analytics.responseRate}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-400" />
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-200">Interviews</p>
                  <p className="text-3xl font-bold text-white">{analytics.byStatus.interview || 0}</p>
                </div>
                <Users className="h-8 w-8 text-yellow-400" />
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-200">Offers</p>
                  <p className="text-3xl font-bold text-white">{analytics.byStatus.offer || 0}</p>
                </div>
                <Award className="h-8 w-8 text-purple-400" />
              </div>
            </div>
          </div>

          {/* Recent Applications */}
          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20">
            <div className="p-6 border-b border-white/10">
              <h3 className="text-xl font-semibold text-white">Recent Applications</h3>
            </div>
            <div className="divide-y divide-white/10">
              {filteredApplications.slice(0, 10).map((app) => (
                <div key={app.id} className="p-6 hover:bg-white/5 transition duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h4 className="text-lg font-semibold text-white">{app.company}</h4>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(app.status)}`}>
                          {getStatusIcon(app.status)}
                          <span className="ml-1 capitalize">{app.status}</span>
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-blue-200">
                        {app.location && (
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {app.location}
                          </div>
                        )}
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Applied {formatDate(app.appliedDate)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleEdit(app)}
                        className="p-2 text-blue-300 hover:text-green-300 hover:bg-green-500/20 rounded transition duration-200"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(app.id)}
                        className="p-2 text-blue-300 hover:text-red-300 hover:bg-red-500/20 rounded transition duration-200" 
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );

  const ApplicationList = () => (
    <div className="space-y-6">
      {applications.length === 0 ? <EmptyState /> : (
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20">
          <div className="divide-y divide-white/10">
            {filteredApplications.map((app) => (
              <div key={app.id} className="p-6 hover:bg-white/5 transition duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h4 className="text-lg font-semibold text-white">{app.company}</h4>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(app.status)}`}>
                        {getStatusIcon(app.status)}
                        <span className="ml-1 capitalize">{app.status}</span>
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-blue-200">
                      {app.location && (
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {app.location}
                        </div>
                      )}
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Applied {formatDate(app.appliedDate)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => handleEdit(app)}
                      className="p-2 text-blue-300 hover:text-green-300 hover:bg-green-500/20 rounded transition duration-200"
                      title="Edit"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(app.id)}
                      className="p-2 text-blue-300 hover:text-red-300 hover:bg-red-500/20 rounded transition duration-200" 
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const AddApplicationForm = ({ onClose }) => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900/95 backdrop-blur-lg rounded-2xl max-w-2xl w-full border border-white/20">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {editingApp ? 'Edit Application' : 'Add New Application'}
              </h2>
              <p className="text-blue-200">Track a job application</p>
            </div>
            <button onClick={onClose} className="text-blue-300 hover:text-white transition duration-200">
              <XCircle className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        <form onSubmit={handleFormSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">Company Name *</label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-blue-300"
                placeholder="Enter company name"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">Applied Date *</label>
                <input
                  type="date"
                  name="appliedDate"
                  value={formData.appliedDate}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                >
                  <option value="applied" className="bg-slate-900">Applied</option>
                  <option value="interview" className="bg-slate-900">Interview</option>
                  <option value="offer" className="bg-slate-900">Offer</option>
                  <option value="rejected" className="bg-slate-900">Rejected</option>
                  <option value="withdrawn" className="bg-slate-900">Withdrawn</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-blue-300"
                placeholder="e.g., San Francisco, CA or Remote"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              <span>{loading ? 'Saving...' : editingApp ? 'Update Application' : 'Add Application'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-white/10 text-blue-200 px-6 py-3 rounded-lg hover:bg-white/20 transition-colors border border-white/20"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (loading && applications.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading applications...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => window.location.href = '/'}
                className="p-2 text-blue-300 hover:text-white hover:bg-white/10 rounded-lg transition duration-200"
                title="Back to Home"
              >
                <Home className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-4xl font-bold text-white">Job Applications</h1>
                <p className="text-blue-200 mt-1">Track your job search progress</p>
              </div>
            </div>
            <button 
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 shadow-lg"
            >
              <Plus className="h-4 w-4" />
              <span>Add Application</span>
            </button>
          </div>
          
          {/* Navigation */}
          <div className="flex items-center space-x-4 mb-6">
            <button 
              onClick={() => setViewMode('dashboard')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${viewMode === 'dashboard' ? 'bg-blue-600 text-white' : 'text-blue-200 hover:bg-white/10'}`}
            >
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-blue-200 hover:bg-white/10'}`}
            >
              <Building className="h-4 w-4" />
              <span>Applications</span>
            </button>
          </div>
          
          {/* Search and Filters */}
          {applications.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400" />
                <input
                  type="text"
                  placeholder="Search companies or locations..."
                  className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-blue-300"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-blue-400" />
                <select 
                  className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all" className="bg-slate-900">All Status</option>
                  <option value="applied" className="bg-slate-900">Applied</option>
                  <option value="interview" className="bg-slate-900">Interview</option>
                  <option value="offer" className="bg-slate-900">Offer</option>
                  <option value="rejected" className="bg-slate-900">Rejected</option>
                  <option value="withdrawn" className="bg-slate-900">Withdrawn</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        {viewMode === 'dashboard' ? <Dashboard /> : <ApplicationList />}
        
        {/* Add/Edit Application Form Modal */}
        {showAddForm && (
          <AddApplicationForm onClose={resetForm} />
        )}
      </div>
    </div>
  );
};

export default JobApplicationManager;