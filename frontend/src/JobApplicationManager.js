import React, { useState, useEffect, useCallback } from 'react';
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

// Move components outside to prevent recreation
const EmptyState = ({ onAddClick }) => (
  <div className="text-center py-16">
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 border border-white/20 max-w-md mx-auto">
      <Target className="h-16 w-16 text-blue-400 mx-auto mb-6" />
      <h3 className="text-2xl font-bold text-white mb-4">No Applications Yet</h3>
      <p className="text-blue-200 mb-8">Start tracking your job applications by adding your first one!</p>
      <button
        onClick={onAddClick}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
      >
        <Plus className="h-4 w-4" />
        <span>Add First Application</span>
      </button>
    </div>
  </div>
);

const SearchAndFilters = ({ 
  searchTerm, 
  statusFilter, 
  onSearchChange, 
  onStatusFilterChange 
}) => (
  <div className="flex flex-col sm:flex-row gap-4">
    <div className="flex-1 relative">
      <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400" />
      <input
        type="text"
        placeholder="Search companies or locations..."
        className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-blue-300"
        value={searchTerm}
        onChange={onSearchChange}
      />
    </div>
    <div className="flex items-center space-x-2">
      <Filter className="h-4 w-4 text-blue-400" />
      <select 
        className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
        value={statusFilter}
        onChange={onStatusFilterChange}
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
);

const Dashboard = ({ 
  applications, 
  filteredApplications, 
  analytics, 
  onEdit, 
  onDelete, 
  onAddClick,
  getStatusColor, 
  getStatusIcon, 
  formatDate 
}) => (
  <div className="space-y-8">
    {applications.length === 0 ? (
      <EmptyState onAddClick={onAddClick} />
    ) : (
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
            {filteredApplications.slice(0, 10).map((app) => {
              console.log('Rendering app:', app); // Debug log
              return (
                <div key={app.id || app._id} className="p-6 hover:bg-white/5 transition duration-200">
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
                        onClick={() => onEdit(app)}
                        className="p-2 text-blue-300 hover:text-green-300 hover:bg-green-500/20 rounded transition duration-200"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => onDelete(app.id || app._id)}
                        className="p-2 text-blue-300 hover:text-red-300 hover:bg-red-500/20 rounded transition duration-200" 
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </>
    )}
  </div>
);

const ApplicationList = ({ 
  applications, 
  filteredApplications, 
  onEdit, 
  onDelete, 
  onAddClick,
  getStatusColor, 
  getStatusIcon, 
  formatDate 
}) => (
  <div className="space-y-6">
    {applications.length === 0 ? (
      <EmptyState onAddClick={onAddClick} />
    ) : (
      <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20">
        <div className="divide-y divide-white/10">
          {filteredApplications.map((app) => (
            <div key={app.id || app._id} className="p-6 hover:bg-white/5 transition duration-200">
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
                    onClick={() => onEdit(app)}
                    className="p-2 text-blue-300 hover:text-green-300 hover:bg-green-500/20 rounded transition duration-200"
                    title="Edit"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => onDelete(app.id || app._id)}
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

const AddApplicationForm = ({ 
  editingApp, 
  formData, 
  loading, 
  onClose, 
  onSubmit, 
  onInputChange 
}) => (
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
      
      <form onSubmit={onSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-blue-200 mb-2">Company Name *</label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={onInputChange}
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
                onChange={onInputChange}
                required
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={onInputChange}
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
              onChange={onInputChange}
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

const JobApplicationManager = () => {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
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
        // Map MongoDB _id to id for frontend compatibility
        const mappedData = (data || []).map(app => ({
          ...app,
          id: app._id || app.id
        }));
        setApplications(mappedData);
        setFilteredApplications(mappedData);
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
        (app.location && app.location.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }
    
    setFilteredApplications(filtered);
  }, [applications, searchTerm, statusFilter]);

  const getStatusColor = useCallback((status) => {
    const colors = {
      applied: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
      interview: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30',
      offer: 'bg-green-500/20 text-green-300 border-green-400/30',
      rejected: 'bg-red-500/20 text-red-300 border-red-400/30',
      withdrawn: 'bg-gray-500/20 text-gray-300 border-gray-400/30'
    };
    return colors[status] || 'bg-gray-500/20 text-gray-300 border-gray-400/30';
  }, []);

  const getStatusIcon = useCallback((status) => {
    const icons = {
      applied: <Clock className="h-4 w-4" />,
      interview: <Users className="h-4 w-4" />,
      offer: <Award className="h-4 w-4" />,
      rejected: <XCircle className="h-4 w-4" />,
      withdrawn: <AlertCircle className="h-4 w-4" />
    };
    return icons[status] || <Clock className="h-4 w-4" />;
  }, []);

  const formatDate = useCallback((dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }, []);

  const getAnalytics = useCallback(() => {
    const total = applications.length;
    const byStatus = applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {});
    
    const responseRate = total > 0 ? Math.round(((byStatus.interview || 0) + (byStatus.offer || 0)) / total * 100) : 0;
    const offerRate = total > 0 ? Math.round((byStatus.offer || 0) / total * 100) : 0;
    
    return { total, byStatus, responseRate, offerRate };
  }, [applications]);

  const handleFormSubmit = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Use the correct ID field
      const applicationId = editingApp?.id || editingApp?._id;
      const url = editingApp ? `/api/job-applications/${applicationId}` : '/api/job-applications';
      const method = editingApp ? 'PUT' : 'POST';
      
      console.log('Submitting to:', url, 'Method:', method, 'Data:', formData);
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        console.log('Application saved successfully');
        await fetchApplications();
        // Reset form inline to avoid dependency issue
        setFormData({
          company: '',
          appliedDate: new Date().toISOString().split('T')[0],
          status: 'applied',
          location: ''
        });
        setShowAddForm(false);
        setEditingApp(null);
      } else {
        const errorText = await response.text();
        console.error('Failed to save application:', response.status, errorText);
      }
    } catch (error) {
      console.error('Error saving application:', error);
    } finally {
      setLoading(false);
    }
  }, [editingApp, formData]);

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('Are you sure you want to delete this application?')) return;
    
    // Handle both _id and id fields
    const applicationId = id || (typeof id === 'object' ? id._id || id.id : null);
    
    if (!applicationId) {
      console.error('No valid ID found for deletion');
      return;
    }
    
    console.log('Deleting application with ID:', applicationId);
    
    setLoading(true);
    try {
      const response = await fetch(`/api/job-applications/${applicationId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        console.log('Application deleted successfully');
        await fetchApplications();
      } else {
        const errorText = await response.text();
        console.error('Failed to delete application:', response.status, errorText);
      }
    } catch (error) {
      console.error('Error deleting application:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleEdit = useCallback((app) => {
    console.log('Editing application:', app);
    // Pre-populate the form with current data
    setFormData({
      company: app.company || '',
      appliedDate: app.appliedDate || new Date().toISOString().split('T')[0],
      status: app.status || 'applied',
      location: app.location || ''
    });
    setEditingApp(app);
    setShowAddForm(true);
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleStatusFilterChange = useCallback((e) => {
    setStatusFilter(e.target.value);
  }, []);

  const handleAddClick = useCallback(() => {
    setShowAddForm(true);
  }, []);

  const analytics = getAnalytics();

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
              onClick={handleAddClick}
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
            <SearchAndFilters 
              searchTerm={searchTerm}
              statusFilter={statusFilter}
              onSearchChange={handleSearchChange}
              onStatusFilterChange={handleStatusFilterChange}
            />
          )}
        </div>

        {/* Content */}
        {viewMode === 'dashboard' ? (
          <Dashboard 
            applications={applications}
            filteredApplications={filteredApplications}
            analytics={analytics}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAddClick={handleAddClick}
            getStatusColor={getStatusColor}
            getStatusIcon={getStatusIcon}
            formatDate={formatDate}
          />
        ) : (
          <ApplicationList 
            applications={applications}
            filteredApplications={filteredApplications}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAddClick={handleAddClick}
            getStatusColor={getStatusColor}
            getStatusIcon={getStatusIcon}
            formatDate={formatDate}
          />
        )}
        
        {/* Add/Edit Application Form Modal */}
        {showAddForm && (
          <AddApplicationForm 
            editingApp={editingApp}
            formData={formData}
            loading={loading}
            onClose={() => {
              setFormData({
                company: '',
                appliedDate: new Date().toISOString().split('T')[0],
                status: 'applied',
                location: ''
              });
              setShowAddForm(false);
              setEditingApp(null);
            }}
            onSubmit={handleFormSubmit}
            onInputChange={handleInputChange}
          />
        )}
      </div>
    </div>
  );
};

export default JobApplicationManager;