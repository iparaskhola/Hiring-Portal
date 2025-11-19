import React, { useEffect, useState } from 'react';
import { Users, Eye, CheckCircle, XCircle, User, Building, ChevronDown, Filter, X } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Charts from './charts'; // Adjust path as needed
import { API_BASE } from '../lib/config';



import StatsCardsClient from './stats-cardclient';

const Dashboard = () => {
  const [selectedView, setSelectedView] = useState('teaching');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [isDepartmentFilterOpen, setIsDepartmentFilterOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [schoolFilter, setSchoolFilter] = useState('All');
  const [isSchoolFilterOpen, setIsSchoolFilterOpen] = useState(false);
  const [isPositionFilterOpen, setIsPositionFilterOpen] = useState(false);
  const [positionFilter, setPositionFilter] = useState('All');
  const [candidates, setCandidates] = useState([]);
  const [rankingMetric, setRankingMetric] = useState('QS'); // University ranking: QS or NIRF
  const [isRankingMetricOpen, setIsRankingMetricOpen] = useState(false);
  const [researchMetric, setResearchMetric] = useState('Papers'); // Research metric: Papers or H-Index
  const [isResearchMetricOpen, setIsResearchMetricOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  

  // Remove default margins from body and html
  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';
    
    return () => {
      // Cleanup on unmount
      document.body.style.margin = '';
      document.body.style.padding = '';
      document.documentElement.style.margin = '';
      document.documentElement.style.padding = '';
    };
  }, []);

  // Helper to deduplicate candidates (prefer higher research score for same email)
  const dedupeCandidates = (arr) => {
    if (!Array.isArray(arr)) return [];
    const map = new Map();
    for (const c of arr) {
      const key = (c.email || '').toLowerCase() || String(c.id || '') || `${c.first_name || ''}-${c.last_name || ''}`;
      if (!map.has(key)) {
        map.set(key, c);
      } else {
        const prev = map.get(key);
        const scorePrev = typeof prev.researchScore10 === 'number' ? prev.researchScore10 : -1;
        const scoreCurr = typeof c.researchScore10 === 'number' ? c.researchScore10 : -1;
        // Keep the one with the higher research score
        if (scoreCurr > scorePrev) map.set(key, c);
      }
    }
    return Array.from(map.values());
  };

  // Fetch real candidates data
  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setLoading(true);
  // Fetch a generous limit and let the UI show exactly what's available after filters
  const response = await fetch(`${API_BASE}/api/applications/rankings/top?limit=100`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const data = await response.json();
        const arr = Array.isArray(data) ? data : [];
        const unique = dedupeCandidates(arr);
        setCandidates(unique);
      } catch (error) {
        console.error('Error fetching candidates:', error);
        // No fallback dummy data — show empty state if the API fails
        setCandidates([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, []);

  // Remove hardcoded candidates; only show fetched candidates
  // Filter by teaching/non-teaching view first
  const displayCandidates = React.useMemo(() => {
    return candidates.filter(candidate => {
      const position = (candidate.positionApplied || candidate.position || '').toLowerCase();
      
      if (selectedView === 'teaching') {
        // Teaching positions include Professor, Associate Professor, Assistant Professor
        return position.includes('professor') || position === 'teaching';
      } else {
        // Non-teaching positions
        return !position.includes('professor') && position !== 'teaching';
      }
    });
  }, [candidates, selectedView]);

  // Get available departments/categories for filter
  const getFilterOptions = () => {
    const departments = [...new Set(displayCandidates.map(candidate => candidate.department))];
    return ['All', ...departments];
  };

  // Filter candidates based on selected department
const getFilteredCandidates = () => {
  let filtered = displayCandidates;
  
  // Department filter (existing)
  if (departmentFilter !== 'All') {
    filtered = filtered.filter(candidate => candidate.department === departmentFilter);
  }
  
  // School filter - match against both 'school' field and 'department' for backwards compatibility
  if (schoolFilter !== 'All') {
    filtered = filtered.filter(candidate => {
      const candidateSchool = candidate.school || '';
      const candidateDept = candidate.department || '';
      
      // Map department names to school names for filtering
      const deptToSchoolMap = {
        'engineering': 'School of Engineering',
        'law': 'School of Law',
        'management': 'School of Management',
        'liberal': 'School of Liberal Studies'
      };
      
      const expectedSchool = deptToSchoolMap[candidateDept.toLowerCase()] || candidateSchool;
      
      return candidateSchool === schoolFilter || expectedSchool === schoolFilter;
    });
  }
  
  // Position filter - check multiple possible fields for the position
  if (positionFilter !== 'All') {
    filtered = filtered.filter(candidate => {
      // Check various possible fields where position might be stored
      const positionApplied = candidate.positionApplied || candidate.position || '';
      const teachingPost = candidate.teachingPost || candidate.teaching_post || '';
      const post = candidate.post || '';
      
      // Check if any of these fields match the filter
      return positionApplied === positionFilter || 
             teachingPost === positionFilter || 
             post === positionFilter ||
             // Also check if the position contains the filter (for partial matches)
             positionApplied.includes(positionFilter) ||
             teachingPost.includes(positionFilter) ||
             post.includes(positionFilter);
    });
  }
  
  // Status filter - exclude rejected applications from Top 10 list
  filtered = filtered.filter(candidate => {
    const status = (candidate.status || '').toLowerCase();
    return status !== 'rejected';
  });
  
  return filtered;
};
  const filteredCandidates = getFilteredCandidates();

  // Sort by the active ranking metric (QS or NIRF) in descending order
  const sortedCandidates = React.useMemo(() => {
    const val = (c) => {
      if (rankingMetric === 'NIRF') return typeof c.nirf10 === 'number' ? c.nirf10 : -Infinity;
      return typeof c.qs10 === 'number' ? c.qs10 : -Infinity;
    };
    const copy = [...filteredCandidates];
    copy.sort((a, b) => val(b) - val(a));
    return copy;
  }, [filteredCandidates, rankingMetric]);

  // Get paper count for display (sorted descending, highest on top)
  const computeResearchRank = (list, cand) => {
    if (!list || !list.length) return '—';
    
    // If H-Index is selected, show N/A since we don't have Scopus H-Index data yet
    if (researchMetric === 'H-Index') {
      return 'N/A';
    }
    
    // For Papers metric, just return the paper count (no rank)
    const paperCount = typeof cand.totalPapers === 'number' ? cand.totalPapers : -1;
    if (paperCount < 0) return '—';
    return paperCount;
  };

  const handleCardClick = (type) => {
    console.log(`Clicked on ${type} for ${selectedView}`);
    // Add your navigation logic here
  };

  const handleViewChange = (view) => {
    setSelectedView(view);
    setIsDropdownOpen(false);
    setDepartmentFilter('All');
    setSchoolFilter('All');
  };

  const handleDepartmentFilterChange = (department) => {
    setDepartmentFilter(department);
    setIsDepartmentFilterOpen(false);
  };

  //Total application count,inreview, shortlisted value
  
  // here is the code for school filter
  const getSchoolFilterOptions = () => {
    // Use the same school options as in the submission form
    return [
      'All',
      'School of Engineering',
      'School of Law',
      'School of Management',
      'School of Liberal Studies'
    ];
  };
  
  const handleSchoolFilterChange = (school) => {
    setSchoolFilter(school);
    setIsSchoolFilterOpen(false);
  };


  //code for PositionApplied filter
const getPositionFilterOptions = () => {
  // Use the standard positions from the form
  return [
    'All',
    'Professor',
    'Associate Professor',
    'Assistant Professor'
  ];
};

  const openCandidatePopup = async (candidate) => {
    setIsPopupOpen(true);
    setSelectedCandidate({ ...candidate, loading: true });
    
    // Fetch complete application details including education, experience, etc.
    try {
      const response = await fetch(`${API_BASE}/api/applications/${candidate.id}`);
      if (response.ok) {
        const fullData = await response.json();
        setSelectedCandidate({ 
          ...candidate, 
          ...fullData,
          listRank: candidate.listRank,
          loading: false 
        });
      } else {
        setSelectedCandidate({ ...candidate, loading: false });
      }
    } catch (error) {
      console.error('Error fetching candidate details:', error);
      setSelectedCandidate({ ...candidate, loading: false });
    }
  };

  const closeCandidatePopup = () => {
    setSelectedCandidate(null);
    setIsPopupOpen(false);
  };

  const generateReport = async (applicationId) => {
    try {
      const response = await fetch(`${API_BASE}/api/documents/generate/${applicationId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ format: 'pdf' })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Open the generated report in a new tab
        window.open(data.report.url, '_blank');
      } else {
        alert('Failed to generate report');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error generating report');
    }
  };

  const getDepartmentColor = (department) => {
    if (selectedView === 'teaching') {
      switch (department) {
        case 'SOET': return 'bg-blue-100 text-blue-800';
        case 'SOL': return 'bg-purple-100 text-purple-800';
        case 'Research': return 'bg-green-100 text-green-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    } else {
      switch (department) {
        case 'Administration': return 'bg-blue-100 text-blue-800';
        case 'Technical Support': return 'bg-purple-100 text-purple-800';
        case 'Library': return 'bg-green-100 text-green-800';
        case 'Lab Assistant': return 'bg-orange-100 text-orange-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    }
  };

  return (
    <div className="admin-dashboard min-h-screen bg-gray-50 w-full flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            
            {/* Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span className="font-medium">
                  {selectedView === 'teaching' ? 'Teaching' : 'Non-Teaching'}
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border z-50">
                  <div className="py-1">
                    <button
                      onClick={() => handleViewChange('teaching')}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-50 ${
                        selectedView === 'teaching' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                      }`}
                    >
                      Teaching
                    </button>
                    <button
                      onClick={() => handleViewChange('non-teaching')}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-50 ${
                        selectedView === 'non-teaching' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                      }`}
                    >
                      Non-Teaching
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Scrollable */}
     <div className="flex-1 overflow-y-auto">
  <div className="p-4 space-y-4">
          {/* Stats Cards */}
          <StatsCardsClient selectedView={selectedView} />
        </div>

        {/* Charts Section */}
        
           <Charts selectedView={selectedView} />


        {/* Top 10 Selected Candidates */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4 mx-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">
              Top Selected Candidates ({loading ? 0 : Math.min(filteredCandidates.length, 10)}/10)
            </h2>
            
            {/* Filters Row - All aligned together */}
            <div className="flex gap-3">
              {/* Position Filter */}
              <div className="relative">
                <button
                  onClick={() => setIsPositionFilterOpen(!isPositionFilterOpen)}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Filter className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {positionFilter === 'All' ? 'All Positions' : positionFilter}
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isPositionFilterOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isPositionFilterOpen && (
                  <div className="absolute top-full right-0 mt-1 w-56 bg-white rounded-lg shadow-lg border z-50 max-h-60 overflow-y-auto">
                    <div className="py-1">
                      {getPositionFilterOptions().map((option) => (
                        <button
                          key={option}
                          onClick={() => {
                            setPositionFilter(option);
                            setIsPositionFilterOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 hover:bg-gray-50 ${
                            positionFilter === option ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* School Filter */}
              <div className="relative">
                <button
                  onClick={() => setIsSchoolFilterOpen(!isSchoolFilterOpen)}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Filter className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {schoolFilter === 'All' ? 'All Schools' : schoolFilter}
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isSchoolFilterOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isSchoolFilterOpen && (
                  <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border z-50">
                    <div className="py-1">
                      {getSchoolFilterOptions().map((option) => (
                        <button
                          key={option}
                          onClick={() => handleSchoolFilterChange(option)}
                          className={`w-full text-left px-4 py-2 hover:bg-gray-50 ${
                            schoolFilter === option ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                          }`}
                        >
                          {option === 'All' ? 'All Schools' : option}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Department Filter */}
              <div className="relative">
                <button
                  onClick={() => setIsDepartmentFilterOpen(!isDepartmentFilterOpen)}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Filter className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {departmentFilter === 'All' ? 'All Departments' : departmentFilter}
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isDepartmentFilterOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isDepartmentFilterOpen && (
                  <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border z-50">
                    <div className="py-1">
                      {getFilterOptions().map((option) => (
                        <button
                          key={option}
                          onClick={() => handleDepartmentFilterChange(option)}
                          className={`w-full text-left px-4 py-2 hover:bg-gray-50 ${
                            departmentFilter === option ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                          }`}
                        >
                          {option === 'All' ? 'All Departments' : option}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-2 text-xl font-medium text-gray-700">Rank</th>
                  <th className="text-left py-2 px-2 text-xl font-medium text-gray-700">Name</th>
                  <th className="text-left py-2 px-2 text-xl font-medium text-gray-700">Position Applied</th>
                  <th className="text-left py-2 px-2 text-xl font-medium text-gray-700">Department</th>
                  <th className="text-left py-2 px-2 text-xl font-medium text-gray-700">
                    <div className="flex items-center gap-2">
                      <span>Research Rank ({researchMetric})</span>
                      {/* Research Metric Dropdown (Papers/H-Index) */}
                      <div className="relative">
                        <button
                          onClick={() => setIsResearchMetricOpen(!isResearchMetricOpen)}
                          className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-xs"
                        >
                          <span className="font-medium">{researchMetric}</span>
                          <ChevronDown className={`h-3 w-3 transition-transform ${isResearchMetricOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isResearchMetricOpen && (
                          <div className="absolute top-full right-0 mt-1 w-32 bg-white rounded-lg shadow-lg border z-50">
                            <div className="py-1">
                              {['Papers','H-Index'].map(opt => (
                                <button
                                  key={opt}
                                  onClick={() => { setResearchMetric(opt); setIsResearchMetricOpen(false); }}
                                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${researchMetric === opt ? 'bg-green-50 text-green-700' : 'text-gray-700'}`}
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </th>
                  <th className="text-left py-2 px-2 text-xl font-medium text-gray-700">
                    <div className="flex items-center gap-2">
                      <span>{rankingMetric} (out of 10)</span>
                      {/* Ranking Metric Dropdown (NIRF/QS) */}
                      <div className="relative">
                        <button
                          onClick={() => setIsRankingMetricOpen(!isRankingMetricOpen)}
                          className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs"
                        >
                          <span className="font-medium">{rankingMetric}</span>
                          <ChevronDown className={`h-3 w-3 transition-transform ${isRankingMetricOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isRankingMetricOpen && (
                          <div className="absolute top-full right-0 mt-1 w-32 bg-white rounded-lg shadow-lg border z-50">
                            <div className="py-1">
                              {['NIRF','QS'].map(opt => (
                                <button
                                  key={opt}
                                  onClick={() => { setRankingMetric(opt); setIsRankingMetricOpen(false); }}
                                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${rankingMetric === opt ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </th>
                  <th className="text-left py-2 px-2 text-xl font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-gray-500">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mr-2"></div>
                        Loading candidates...
                      </div>
                    </td>
                  </tr>
                ) : sortedCandidates.length > 0 ? (
                  sortedCandidates.slice(0, 10).map((candidate, index) => (
                    <tr key={candidate.id || candidate.rank || index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 px-2">
                        <div className="flex items-center">
                          {/* Rank colored by gender: blue for Male, pink for Female */}
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                            (candidate.gender || '').toLowerCase() === 'female' ? 'bg-pink-500' : 'bg-blue-500'
                          }`}>
                            {index + 1}
                          </div>
                        </div>
                      </td>
                      <td className="py-2 px-2 text-xl font-medium text-gray-900" style={{ fontFamily: 'Arial, sans-serif' }}>
                        {candidate.first_name 
                          ? `${candidate.first_name}${candidate.last_name ? ' ' + candidate.last_name : ''}`
                          : 'N/A'
                        }
                      </td>
                      <td className="py-2 px-2 text-xl text-gray-700">
                        {candidate.teachingPost || candidate.positionApplied || candidate.position || 'N/A'}
                      </td>
                      <td className="py-2 px-2">
                        <span className={`inline-flex px-2 py-1 text-lg font-medium rounded-full ${getDepartmentColor(candidate.department)}`}>
                          {candidate.department || 'N/A'}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-xl font-bold text-gray-900">
                        {(() => {
                          // compute research rank among current view list
                          const key = candidate.id ?? index;
                          return computeResearchRank(sortedCandidates, candidate);
                        })()}
                      </td>
                      <td className="py-2 px-2 text-xl font-bold text-gray-900">
                        {(() => {
                          const metricValue = rankingMetric === 'NIRF' 
                            ? (candidate.nirf10 ?? null)
                            : (candidate.qs10 ?? null);
                          const val = typeof metricValue === 'number' ? metricValue : null;
                          return (
                            <span className={`px-2 py-1 rounded-full text-xl font-medium ${
                              val === null ? 'bg-gray-100 text-gray-600' :
                              val >= 7 ? 'bg-green-100 text-green-800' :
                              val >= 4 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {val !== null ? val.toFixed(1) : 'N/A'}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="py-2 px-2">
                        <div className="flex space-x-1">
                          <button
                            onClick={() => openCandidatePopup({ ...candidate, listRank: index + 1 })}
                            className="px-2 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors"
                          >
                            View
                          </button>
                          <button
                            onClick={() => generateReport(candidate.id || candidate.rank)}
                            className="px-2 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700 transition-colors"
                          >
                            Report
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-gray-500">
                      No candidates found for the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {isDropdownOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsDropdownOpen(false)}
        />
      )}

      {/* Click outside to close department filter */}
      {isDepartmentFilterOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsDepartmentFilterOpen(false)}
        />
      )}

      {/* Candidate Details Popup */}
      {isPopupOpen && selectedCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white ${
                  (selectedCandidate.gender || '').toLowerCase() === 'female' ? 'bg-pink-500' : 'bg-blue-500'
                }`}>
                  {selectedCandidate.listRank || 1}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedCandidate.first_name 
                      ? `${selectedCandidate.first_name}${selectedCandidate.middle_name ? ' ' + selectedCandidate.middle_name : ''}${selectedCandidate.last_name ? ' ' + selectedCandidate.last_name : ''}`
                      : 'N/A'
                    }
                  </h2>
                  <p className="text-sm text-gray-600">{selectedCandidate.email}</p>
                </div>
              </div>
              <button
                onClick={closeCandidatePopup}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
                {/* Left Side - Detailed Information */}
                <div className="space-y-6">
                  {selectedCandidate.loading ? (
                    <div className="text-center py-8 text-gray-500">Loading details...</div>
                  ) : (
                    <>
                      {/* Basic Info */}
                      <div className="bg-white border rounded-lg p-4 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Basic Information</h3>
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase">Position Applied</p>
                              <p className="text-sm text-gray-900">{selectedCandidate.positionApplied || selectedCandidate.position || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase">Department</p>
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getDepartmentColor(selectedCandidate.department)}`}>
                                {selectedCandidate.department || 'N/A'}
                              </span>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase">School</p>
                              <p className="text-sm text-gray-900">{selectedCandidate.school || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase">Branch</p>
                              <p className="text-sm text-gray-900">{selectedCandidate.branch || 'N/A'}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase">Phone</p>
                              <p className="text-sm text-gray-900">{selectedCandidate.phone || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase">Gender</p>
                              <p className="text-sm text-gray-900">{selectedCandidate.gender || 'N/A'}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase">Address</p>
                            <p className="text-sm text-gray-900">{selectedCandidate.address || 'N/A'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Education */}
                      <div className="bg-white border rounded-lg p-4 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Education</h3>
                        <div className="space-y-4">
                          {/* PhD */}
                          {selectedCandidate.phd_status && selectedCandidate.phd_status !== 'Not done' && (
                            <div className="border-l-4 border-indigo-500 pl-4">
                              <p className="text-xs font-semibold text-indigo-600 uppercase">PhD</p>
                              <p className="text-sm font-medium text-gray-900">{selectedCandidate.phd_institute || selectedCandidate.institution || 'N/A'}</p>
                              <p className="text-xs text-gray-600">
                                {selectedCandidate.phd_degree_name || 'N/A'} | Year: {selectedCandidate.phd_year || 'N/A'}
                              </p>
                              {selectedCandidate.phd_specialization && (
                                <p className="text-xs text-gray-600 mt-1">Specialization: {selectedCandidate.phd_specialization}</p>
                              )}
                            </div>
                          )}
                          
                          {/* Master's */}
                          {selectedCandidate.master_institute && (
                            <div className="border-l-4 border-blue-500 pl-4">
                              <p className="text-xs font-semibold text-blue-600 uppercase">Master's Degree</p>
                              <p className="text-sm font-medium text-gray-900">{selectedCandidate.master_institute}</p>
                              <p className="text-xs text-gray-600">
                                {selectedCandidate.master_degree_name || 'N/A'} | Year: {selectedCandidate.master_year || 'N/A'}
                              </p>
                            </div>
                          )}
                          
                          {/* Bachelor's */}
                          {selectedCandidate.bachelor_institute && (
                            <div className="border-l-4 border-green-500 pl-4">
                              <p className="text-xs font-semibold text-green-600 uppercase">Bachelor's Degree</p>
                              <p className="text-sm font-medium text-gray-900">{selectedCandidate.bachelor_institute}</p>
                              <p className="text-xs text-gray-600">
                                {selectedCandidate.bachelor_degree_name || 'N/A'} | Year: {selectedCandidate.bachelor_year || 'N/A'}
                              </p>
                            </div>
                          )}
                          
                          {/* Highest Degree Summary */}
                          <div className="bg-gray-50 rounded p-3 mt-2">
                            <p className="text-xs font-semibold text-gray-500 uppercase">Highest Qualification</p>
                            <p className="text-sm text-gray-900">{selectedCandidate.highest_degree || selectedCandidate.qualification || 'N/A'}</p>
                            <p className="text-xs text-gray-600">
                              {selectedCandidate.university || 'N/A'} | Graduated: {selectedCandidate.graduation_year || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Experience */}
                      <div className="bg-white border rounded-lg p-4 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Experience</h3>
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs font-semibold text-gray-500 uppercase">Total Experience</p>
                            <p className="text-sm text-gray-900">{selectedCandidate.experience || selectedCandidate.total_experience || 'N/A'}</p>
                          </div>
                          {selectedCandidate.teachingPost && (
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase">Current/Recent Position</p>
                              <p className="text-sm text-gray-900">{selectedCandidate.teachingPost}</p>
                            </div>
                          )}
                          {selectedCandidate.teaching_experience && (
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase">Teaching Experience</p>
                              <p className="text-sm text-gray-900">{selectedCandidate.teaching_experience}</p>
                            </div>
                          )}
                          {selectedCandidate.research_experience && (
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase">Research Experience</p>
                              <p className="text-sm text-gray-900">{selectedCandidate.research_experience}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Research & Publications */}
                      <div className="bg-white border rounded-lg p-4 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Research & Publications</h3>
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase">Total Papers</p>
                              <p className="text-2xl font-bold text-indigo-600">{selectedCandidate.totalPapers || 0}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase">Research Score</p>
                              <p className="text-2xl font-bold text-green-600">{selectedCandidate.researchScore10 || 'N/A'}/10</p>
                            </div>
                          </div>
                          {selectedCandidate.scopus_id && (
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase">Scopus ID</p>
                              <p className="text-sm text-gray-900">{selectedCandidate.scopus_id}</p>
                            </div>
                          )}
                          {selectedCandidate.orchid_id && (
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase">ORCID</p>
                              <p className="text-sm text-gray-900">{selectedCandidate.orchid_id}</p>
                            </div>
                          )}
                          {selectedCandidate.specialization && (
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase">Specialization</p>
                              <p className="text-sm text-gray-900">{selectedCandidate.specialization}</p>
                            </div>
                          )}
                          {selectedCandidate.publications && (
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase">Publications</p>
                              <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedCandidate.publications}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Additional Info */}
                      {selectedCandidate.certifications && (
                        <div className="bg-white border rounded-lg p-4 shadow-sm">
                          <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Certifications</h3>
                          <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedCandidate.certifications}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Right Side - Visual Representation */}
                <div className="space-y-4">
                  {!selectedCandidate.loading && (
                    <>
                      {/* Score Overview Card - Compact */}
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-indigo-200 rounded-lg p-4 shadow-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Overall Ranking</p>
                            <p className="text-3xl font-bold text-indigo-600">{selectedCandidate.total_score?.toFixed(1) || 'N/A'}</p>
                          </div>
                          <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white ${
                            (selectedCandidate.gender || '').toLowerCase() === 'female' ? 'bg-pink-500' : 'bg-blue-500'
                          } shadow-xl`}>
                            #{selectedCandidate.listRank || 1}
                          </div>
                        </div>
                      </div>

                      {/* Quick Stats Grid - Moved to top */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                          <p className="text-xs font-semibold text-blue-600 uppercase mb-1">QS Score</p>
                          <p className="text-2xl font-bold text-blue-700">{selectedCandidate.qs10 || 0}</p>
                        </div>
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
                          <p className="text-xs font-semibold text-orange-600 uppercase mb-1">NIRF Score</p>
                          <p className="text-2xl font-bold text-orange-700">{selectedCandidate.nirf10 || 0}</p>
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                          <p className="text-xs font-semibold text-green-600 uppercase mb-1">Research</p>
                          <p className="text-2xl font-bold text-green-700">{selectedCandidate.researchScore10 || 0}</p>
                        </div>
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
                          <p className="text-xs font-semibold text-purple-600 uppercase mb-1">Papers</p>
                          <p className="text-2xl font-bold text-purple-700">{selectedCandidate.totalPapers || 0}</p>
                        </div>
                      </div>

                      {/* University Ranking Scores - Compact bars */}
                      <div className="bg-white border rounded-lg p-4 shadow-sm">
                        <h3 className="text-sm font-bold text-gray-900 mb-3">Score Breakdown</h3>
                        <div className="space-y-3">
                          {/* QS Score Bar */}
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs font-semibold text-gray-700">QS Ranking</span>
                              <span className="text-sm font-bold text-blue-600">{selectedCandidate.qs10 || 0}/10</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                              <div 
                                className="bg-gradient-to-r from-blue-400 to-blue-600 h-full rounded-full transition-all duration-500"
                                style={{ width: `${((selectedCandidate.qs10 || 0) / 10) * 100}%` }}
                              ></div>
                            </div>
                          </div>

                          {/* NIRF Score Bar */}
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs font-semibold text-gray-700">NIRF Ranking</span>
                              <span className="text-sm font-bold text-orange-600">{selectedCandidate.nirf10 || 0}/10</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                              <div 
                                className="bg-gradient-to-r from-orange-400 to-orange-600 h-full rounded-full transition-all duration-500"
                                style={{ width: `${((selectedCandidate.nirf10 || 0) / 10) * 100}%` }}
                              ></div>
                            </div>
                          </div>

                          {/* Research Score Bar */}
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs font-semibold text-gray-700">Research Score</span>
                              <span className="text-sm font-bold text-green-600">{selectedCandidate.researchScore10 || 0}/10</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                              <div 
                                className="bg-gradient-to-r from-green-400 to-green-600 h-full rounded-full transition-all duration-500"
                                style={{ width: `${((selectedCandidate.researchScore10 || 0) / 10) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Score Distribution Pie Chart - Compact */}
                      <div className="bg-white border rounded-lg p-4 shadow-sm">
                        <h3 className="text-sm font-bold text-gray-900 mb-2">Score Distribution</h3>
                        <ResponsiveContainer width="100%" height={200}>
                          <PieChart>
                            <Pie
                              data={[
                                { name: 'University', value: Math.max(selectedCandidate.qs10 || 0, selectedCandidate.nirf10 || 0), color: '#3b82f6' },
                                { name: 'Research', value: selectedCandidate.researchScore10 || 0, color: '#10b981' },
                                { name: 'Other', value: Math.max(0, (selectedCandidate.total_score || 0) - (Math.max(selectedCandidate.qs10 || 0, selectedCandidate.nirf10 || 0) + (selectedCandidate.researchScore10 || 0))), color: '#f59e0b' }
                              ].filter(item => item.value > 0)}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, value }) => `${name}: ${value.toFixed(1)}`}
                              outerRadius={70}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {[
                                { name: 'University', value: Math.max(selectedCandidate.qs10 || 0, selectedCandidate.nirf10 || 0), color: '#3b82f6' },
                                { name: 'Research', value: selectedCandidate.researchScore10 || 0, color: '#10b981' },
                                { name: 'Other', value: Math.max(0, (selectedCandidate.total_score || 0) - (Math.max(selectedCandidate.qs10 || 0, selectedCandidate.nirf10 || 0) + (selectedCandidate.researchScore10 || 0))), color: '#f59e0b' }
                              ].filter(item => item.value > 0).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Research Metrics - Compact */}
                      <div className="bg-white border rounded-lg p-4 shadow-sm">
                        <h3 className="text-sm font-bold text-gray-900 mb-2">Research Metrics</h3>
                        <ResponsiveContainer width="100%" height={150}>
                          <BarChart
                            data={[
                              { 
                                name: 'Publications', 
                                count: selectedCandidate.totalPapers || 0 
                              }
                            ]}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Bar dataKey="count" fill="#8b5cf6" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Comparison Chart - New Addition */}
                      <div className="bg-white border rounded-lg p-4 shadow-sm">
                        <h3 className="text-sm font-bold text-gray-900 mb-2">Performance Overview</h3>
                        <ResponsiveContainer width="100%" height={180}>
                          <BarChart
                            data={[
                              { metric: 'QS', score: selectedCandidate.qs10 || 0, fill: '#3b82f6' },
                              { metric: 'NIRF', score: selectedCandidate.nirf10 || 0, fill: '#f97316' },
                              { metric: 'Research', score: selectedCandidate.researchScore10 || 0, fill: '#10b981' }
                            ]}
                            layout="horizontal"
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" domain={[0, 10]} tick={{ fontSize: 12 }} />
                            <YAxis dataKey="metric" type="category" tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Bar dataKey="score" radius={[0, 8, 8, 0]}>
                              {[
                                { metric: 'QS', score: selectedCandidate.qs10 || 0, fill: '#3b82f6' },
                                { metric: 'NIRF', score: selectedCandidate.nirf10 || 0, fill: '#f97316' },
                                { metric: 'Research', score: selectedCandidate.researchScore10 || 0, fill: '#10b981' }
                              ].map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* University & Contact Info */}
                      <div className="bg-white border rounded-lg p-4 shadow-sm">
                        <h3 className="text-sm font-bold text-gray-900 mb-3">Institution Details</h3>
                        <div className="space-y-2 text-xs">
                          <div>
                            <p className="font-semibold text-gray-500 uppercase">University</p>
                            <p className="text-sm text-gray-900">{selectedCandidate.university || selectedCandidate.phd_institute || selectedCandidate.institution || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-500 uppercase">Graduation Year</p>
                            <p className="text-sm text-gray-900">{selectedCandidate.graduation_year || selectedCandidate.phd_year || 'N/A'}</p>
                          </div>
                          {selectedCandidate.phd_status && selectedCandidate.phd_status !== 'Not done' && (
                            <div>
                              <p className="font-semibold text-gray-500 uppercase">PhD Status</p>
                              <p className="text-sm text-gray-900">{selectedCandidate.phd_status}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-end gap-3 p-4 border-t bg-gray-50">
              <button
                onClick={closeCandidatePopup}
                className="px-5 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors font-medium"
              >
                Close
              </button>
              <button
                onClick={() => console.log('Contact candidate:', selectedCandidate.email)}
                className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                Contact Candidate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;