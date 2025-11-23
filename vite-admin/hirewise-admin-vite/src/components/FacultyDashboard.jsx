import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const FacultyDashboard = () => {
  const location = useLocation();
  const [assignedCandidates, setAssignedCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loading, setLoading] = useState(true);

  const facultyInfo = location.state?.facultyInfo || JSON.parse(localStorage.getItem('facultyInfo') || '{}');

  // Mock assigned candidates data - in real app, this would come from API
  const allCandidatesData = {
    1: {
      id: 1,
      first_name: 'Bottle',
      last_name: 'Test',
      email: 'bottle@gmail.com',
      position: 'Teaching',
      department: 'Management',
      experience: '5 years',
      publications: 11,
      scopus_general_papers: 5,
      conference_papers: 5,
      edited_books: 6,
      status: 'pending'
    }
  };

  useEffect(() => {
    // Simulate loading and fetch assignments from localStorage
    setTimeout(() => {
      const facultyAssignments = JSON.parse(localStorage.getItem('facultyAssignments') || '{}');
      
      // Find candidates assigned to this faculty
      const assigned = [];
      for (const [candidateId, facultyIds] of Object.entries(facultyAssignments)) {
        if (facultyIds.includes(facultyInfo.id)) {
          const candidate = allCandidatesData[candidateId];
          if (candidate) {
            assigned.push(candidate);
          }
        }
      }
      
      setAssignedCandidates(assigned);
      setLoading(false);
    }, 500);
  }, [facultyInfo.email, facultyInfo.id]);

  const handleViewDetails = (candidate) => {
    setSelectedCandidate(candidate);
  };

  const closeModal = () => {
    setSelectedCandidate(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">My Assigned Candidates</h2>
            <p className="text-sm text-gray-600 mt-1">
              {assignedCandidates.length} candidate{assignedCandidates.length !== 1 ? 's' : ''} assigned for review
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {assignedCandidates.length > 0 ? (
          <div className="grid gap-6">
            {assignedCandidates.map((candidate, index) => (
              <div key={candidate.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-2xl font-bold text-white">#{index + 1}</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          {candidate.first_name} {candidate.last_name}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs font-medium text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                            {candidate.department}
                          </span>
                          <span className="text-xs font-medium text-green-600 bg-green-100 px-3 py-1 rounded-full">
                            {candidate.position}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">Email:</span> {candidate.email}
                      </p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-sm text-gray-600">
                          <span className="font-medium">Experience:</span> {candidate.experience}
                        </span>
                        <span className="text-sm text-gray-600">
                          <span className="font-medium">Publications:</span> {candidate.publications}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => handleViewDetails(candidate)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-medium shadow-md hover:shadow-lg"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Assigned Candidates</h3>
            <p className="text-gray-600">You don't have any candidates assigned to review yet.</p>
          </div>
        )}
      </div>

      {/* Candidate Details Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedCandidate.first_name} {selectedCandidate.last_name}
                </h2>
                <div className="flex items-center space-x-2 mt-1">
                  <p className="text-sm text-gray-600">{selectedCandidate.position}</p>
                  <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                    {selectedCandidate.department}
                  </span>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="text-sm font-medium text-gray-900">{selectedCandidate.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Experience</p>
                      <p className="text-sm font-medium text-gray-900">{selectedCandidate.experience}</p>
                    </div>
                  </div>
                </div>

                {/* Research Metrics */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Research Metrics</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center bg-white p-4 rounded-lg shadow-sm">
                      <p className="text-3xl font-bold text-blue-600">{selectedCandidate.scopus_general_papers || 0}</p>
                      <p className="text-sm text-gray-600 mt-1">Scopus Papers</p>
                    </div>
                    <div className="text-center bg-white p-4 rounded-lg shadow-sm">
                      <p className="text-3xl font-bold text-green-600">{selectedCandidate.conference_papers || 0}</p>
                      <p className="text-sm text-gray-600 mt-1">Conference Papers</p>
                    </div>
                    <div className="text-center bg-white p-4 rounded-lg shadow-sm">
                      <p className="text-3xl font-bold text-purple-600">{selectedCandidate.edited_books || 0}</p>
                      <p className="text-sm text-gray-600 mt-1">Edited Books</p>
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Application Status</h3>
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                      {selectedCandidate.status || 'Pending Review'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t p-6 bg-gray-50 flex space-x-3">
              <button
                onClick={closeModal}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-3 rounded-lg transition-colors font-medium"
              >
                Close
              </button>
              <button
                onClick={() => alert('Review functionality coming soon')}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors font-medium"
              >
                Add Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyDashboard;
