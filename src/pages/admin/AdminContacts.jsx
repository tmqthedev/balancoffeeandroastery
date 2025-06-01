import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const AdminContacts = () => {
  const { t } = useTranslation();
  const [contacts, setContacts] = useState([]);
  const [newsletters, setNewsletters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('contacts');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);

  const itemsPerPage = 15;

  useEffect(() => {
    if (activeTab === 'contacts') {
      fetchContacts();
    } else {
      fetchNewsletters();
    }
  }, [currentPage, searchTerm, statusFilter, activeTab]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('/api/admin/contacts', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: currentPage,
          limit: itemsPerPage,
          search: searchTerm,
          status: statusFilter !== 'all' ? statusFilter : undefined
        }
      });
      setContacts(response.data.contacts);
      setTotalPages(Math.ceil(response.data.total / itemsPerPage));
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNewsletters = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('/api/admin/newsletters', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: currentPage,
          limit: itemsPerPage,
          search: searchTerm
        }
      });
      setNewsletters(response.data.newsletters);
      setTotalPages(Math.ceil(response.data.total / itemsPerPage));
    } catch (error) {
      console.error('Error fetching newsletters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleViewContact = (contact) => {
    setSelectedContact(contact);
    setShowModal(true);
  };

  const handleStatusUpdate = async (contactId, newStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(`/api/admin/contacts/${contactId}`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (activeTab === 'contacts') {
        fetchContacts();
      }
    } catch (error) {
      console.error('Error updating contact status:', error);
      alert('Error updating status. Please try again.');
    }
  };

  const handleDeleteContact = async (contactId) => {
    if (!window.confirm(t('admin.confirmDelete'))) return;

    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`/api/admin/contacts/${contactId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (activeTab === 'contacts') {
        fetchContacts();
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
      alert('Error deleting contact. Please try again.');
    }
  };

  const handleDeleteNewsletter = async (newsletterId) => {
    if (!window.confirm(t('admin.confirmDelete'))) return;

    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`/api/admin/newsletters/${newsletterId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNewsletters();
    } catch (error) {
      console.error('Error deleting newsletter subscription:', error);
      alert('Error deleting subscription. Please try again.');
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      new: 'bg-blue-100 text-blue-800',
      read: 'bg-green-100 text-green-800',
      replied: 'bg-purple-100 text-purple-800',
      archived: 'bg-gray-100 text-gray-800'
    };
    return `px-2 py-1 rounded-full text-xs font-medium ${colors[status] || colors.new}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportToCSV = () => {
    const data = activeTab === 'contacts' ? contacts : newsletters;
    const headers = activeTab === 'contacts' 
      ? ['Name', 'Email', 'Phone', 'Subject', 'Status', 'Created At']
      : ['Email', 'Subscribed At'];
    
    const csvContent = [
      headers.join(','),
      ...data.map(item => {
        if (activeTab === 'contacts') {
          return [
            `"${item.name}"`,
            `"${item.email}"`,
            `"${item.phone || ''}"`,
            `"${item.subject}"`,
            `"${item.status}"`,
            `"${formatDate(item.created_at)}"`
          ].join(',');
        } else {
          return [
            `"${item.email}"`,
            `"${formatDate(item.created_at)}"`
          ].join(',');
        }
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${activeTab}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('admin.contactsManagement')}</h1>
        <button
          onClick={exportToCSV}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          {t('admin.exportCSV')}
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => {
              setActiveTab('contacts');
              setCurrentPage(1);
              setSearchTerm('');
              setStatusFilter('all');
            }}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'contacts'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t('admin.contactForms')}
          </button>
          <button
            onClick={() => {
              setActiveTab('newsletters');
              setCurrentPage(1);
              setSearchTerm('');
              setStatusFilter('all');
            }}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'newsletters'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t('admin.newsletterSubscriptions')}
          </button>
        </nav>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <input
              type="text"
              placeholder={activeTab === 'contacts' ? t('admin.searchContacts') : t('admin.searchEmails')}
              value={searchTerm}
              onChange={handleSearch}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          {activeTab === 'contacts' && (
            <div>
              <select
                value={statusFilter}
                onChange={handleStatusFilter}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">{t('admin.allStatuses')}</option>
                <option value="new">{t('admin.new')}</option>
                <option value="read">{t('admin.read')}</option>
                <option value="replied">{t('admin.replied')}</option>
                <option value="archived">{t('admin.archived')}</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Content Tables */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {activeTab === 'contacts' ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.contact')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.subject')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.createdAt')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contacts.map((contact) => (
                <tr key={contact.id} className={contact.status === 'new' ? 'bg-blue-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                      <div className="text-sm text-gray-500">{contact.email}</div>
                      {contact.phone && (
                        <div className="text-sm text-gray-500">{contact.phone}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {contact.subject}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getStatusBadge(contact.status)}>
                      {t(`admin.${contact.status}`)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(contact.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleViewContact(contact)}
                      className="text-amber-600 hover:text-amber-900 mr-4"
                    >
                      {t('admin.view')}
                    </button>
                    <select
                      value={contact.status}
                      onChange={(e) => handleStatusUpdate(contact.id, e.target.value)}
                      className="text-blue-600 border border-blue-300 rounded text-xs px-2 py-1 mr-4"
                    >
                      <option value="new">{t('admin.new')}</option>
                      <option value="read">{t('admin.read')}</option>
                      <option value="replied">{t('admin.replied')}</option>
                      <option value="archived">{t('admin.archived')}</option>
                    </select>
                    <button
                      onClick={() => handleDeleteContact(contact.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      {t('admin.delete')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.email')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.subscribedAt')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('admin.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {newsletters.map((newsletter) => (
                <tr key={newsletter.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{newsletter.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(newsletter.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDeleteNewsletter(newsletter.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      {t('admin.unsubscribe')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex space-x-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 rounded ${
                  currentPage === page
                    ? 'bg-amber-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } border`}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Contact Detail Modal */}
      {showModal && selectedContact && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {t('admin.contactDetails')}
                </h3>
                <span className={getStatusBadge(selectedContact.status)}>
                  {t(`admin.${selectedContact.status}`)}
                </span>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t('admin.name')}</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedContact.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t('admin.email')}</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedContact.email}</p>
                  </div>
                </div>
                
                {selectedContact.phone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t('admin.phone')}</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedContact.phone}</p>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('admin.subject')}</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedContact.subject}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('admin.message')}</label>
                  <div className="mt-1 p-3 border border-gray-300 rounded-lg bg-gray-50">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedContact.message}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('admin.receivedAt')}</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(selectedContact.created_at)}</p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-6 border-t">
                <div className="flex space-x-2">
                  <select
                    value={selectedContact.status}
                    onChange={(e) => {
                      handleStatusUpdate(selectedContact.id, e.target.value);
                      setSelectedContact({...selectedContact, status: e.target.value});
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="new">{t('admin.new')}</option>
                    <option value="read">{t('admin.read')}</option>
                    <option value="replied">{t('admin.replied')}</option>
                    <option value="archived">{t('admin.archived')}</option>
                  </select>
                  <a
                    href={`mailto:${selectedContact.email}?subject=Re: ${selectedContact.subject}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {t('admin.reply')}
                  </a>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  {t('admin.close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminContacts;
