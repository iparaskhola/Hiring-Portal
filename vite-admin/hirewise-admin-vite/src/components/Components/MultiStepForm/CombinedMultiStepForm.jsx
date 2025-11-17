import React, { useState, useEffect } from 'react';
import './MultiStepForm.css';
import { supabase } from '../../../../lib/supabase-client';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../../../lib/config';
import { COUNTRY_CODES } from '../../../lib/country-codes';
import { COUNTRIES } from '../../../lib/countries';
import { COLLEGES } from '../../../lib/colleges';

// Step 1: PositionSelection
const PositionSelection = ({ formData, setFormData, onNext, onSaveExit }) => {
  const [errors, setErrors] = useState({});
  const [departments, setDepartments] = useState([]);
  const [branches, setBranches] = useState([]);
  const teachingDepartments = [
    { id: 'engineering', name: 'School of Engineering' },
    { id: 'law', name: 'School of Law' },
    { id: 'management', name: 'School of Management' },
    { id: 'liberal', name: 'School of Liberal Studies' },
  ];
  const nonTeachingDepartments = [
    { id: 'admin', name: 'Administration' },
    { id: 'it', name: 'IT Maintenance' },
    { id: 'security', name: 'Security' },
    { id: 'lab', name: 'Lab Assistants' },
  ];
  const engineeringBranches = [
    { id: 'cse', name: 'Computer Science Engineering' },
    { id: 'mech', name: 'Mechanical Engineering' },
    { id: 'ece', name: 'Electronics and Communication Engineering' },
  ];
  const lawBranches = [
    { id: 'criminal', name: 'Criminal Law' },
    { id: 'corporate', name: 'Corporate Law' },
    { id: 'civil', name: 'Civil Law' },
  ];
  const managementBranches = [
    { id: 'finance', name: 'Finance' },
    { id: 'marketing', name: 'Marketing' },
    { id: 'hr', name: 'Human Resources' },
  ];
  const liberalBranches = [
    { id: 'english', name: 'English' },
    { id: 'history', name: 'History' },
    { id: 'sociology', name: 'Sociology' },
  ];
  useEffect(() => {
    if (formData.position === 'teaching') {
      setDepartments(teachingDepartments);
    } else if (formData.position === 'non-teaching') {
      setDepartments(nonTeachingDepartments);
    } else {
      setDepartments([]);
    }
  }, [formData.position]);
  useEffect(() => {
    if (formData.department) {
      switch (formData.department) {
        case 'engineering':
          setBranches(engineeringBranches);
          break;
        case 'law':
          setBranches(lawBranches);
          break;
        case 'management':
          setBranches(managementBranches);
          break;
        case 'liberal':
          setBranches(liberalBranches);
          break;
        default:
          setBranches([]);
      }
    } else {
      setBranches([]);
    }
  }, [formData.department]);
  const validateForm = () => {
    const newErrors = {};
    if (!formData.position) {
      newErrors.position = 'Please select a position';
    }
    if (!formData.department) {
      newErrors.department = 'Please select a department';
    }
    if (formData.position === 'teaching' && !formData.branch) {
      newErrors.branch = 'Please select a branch';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Normalize 'Other' institute fields to the provided custom values before moving on
      const normalized = { ...formData };
      if (normalized.bachelorInstitute === 'Other' && normalized.bachelorInstituteOther) {
        normalized.bachelorInstitute = normalized.bachelorInstituteOther;
      }
      if (normalized.masterInstitute === 'Other' && normalized.masterInstituteOther) {
        normalized.masterInstitute = normalized.masterInstituteOther;
      }
      if (normalized.phdInstitute === 'Other' && normalized.phdInstituteOther) {
        normalized.phdInstitute = normalized.phdInstituteOther;
      }
      setFormData(normalized);
      onNext();
    }
  };
  return (
    <form onSubmit={handleSubmit}>
      <div className="form-field">
        <label htmlFor="position">Position Applying For*</label>
        <select
          id="position"
          value={formData.position}
          onChange={(e) => {
            const newPosition = e.target.value;
            setFormData({
              ...formData,
              position: newPosition,
              department: '',
              branch: '',
            });
          }}
        >
          <option value="">Select Position</option>
          <option value="teaching">Teaching</option>
          <option value="non-teaching">Non-Teaching</option>
        </select>
        {errors.position && <span className="error">{errors.position}</span>}
      </div>
      <div className="form-field">
        <label htmlFor="department">Schools*</label>
        <select
          id="department"
          value={formData.department}
          onChange={(e) => {
            setFormData({
              ...formData,
              department: e.target.value,
              branch: '',
            });
          }}
          disabled={!formData.position}
        >
          <option value="">Select School</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.name}
            </option>
          ))}
        </select>
        {errors.department && <span className="error">{errors.department}</span>}
      </div>
      {formData.position === 'teaching' && (
        <div className="form-field">
          <label htmlFor="branch">Department*</label>
          <select
            id="branch"
            value={formData.branch}
            onChange={(e) =>
              setFormData({ ...formData, branch: e.target.value })
            }
            disabled={!formData.department}
          >
            <option value="">Select Department</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
          {errors.branch && <span className="error">{errors.branch}</span>}
        </div>
      )}
      <div className="form-buttons">
        <div style={{ flex: 1 }}></div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <button type="button" className="btn btn-secondary save-exit-btn" onClick={onSaveExit}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.6667 4.66667V1.33333H3.33333V4.66667M8 8V14M8 14L5.33333 11.3333M8 14L10.6667 11.3333M1.33333 14.6667H14.6667V4.66667H1.33333V14.66667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Save & Exit
          </button>
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn btn-primary">
            Next
          </button>
        </div>
      </div>
    </form>
  );
};

// Step 2: PersonalInformation
const PersonalInformation = ({ formData, setFormData, onNext, onPrevious, onSaveExit }) => {
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Auto-fill email from auth
        if (!formData.email) {
          setFormData(prev => ({ ...prev, email: user.email }));
        }
        
        // Fetch profile data (name and phone from registration)
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('full_name, phone')
            .eq('id', user.id)
            .maybeSingle();
          
          if (!error && profile) {
            // Split full_name into first and last name
            const nameParts = (profile.full_name || '').trim().split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';
            
            // Extract phone number (remove country code if present)
            let phoneNumber = (profile.phone || '').trim();
            // If phone has country code like "+91 1234567890", extract just the number
            const phoneMatch = phoneNumber.match(/\d{10,}$/);
            if (phoneMatch) {
              phoneNumber = phoneMatch[0].slice(-10); // Get last 10 digits
            }
            
            setFormData(prev => ({
              ...prev,
              firstName: prev.firstName || firstName,
              lastName: prev.lastName || lastName,
              phone: prev.phone || phoneNumber,
            }));
          }
        } catch (err) {
          console.error('Error fetching profile:', err);
        }
      }
    };
    fetchUserData();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    // Last name is optional
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = 'Phone number must be 10 digits';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of Birth is required';
    else {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
      if (age < 21) newErrors.dateOfBirth = 'You must be at least 21 years old';
    }
    if (!formData.nationality) newErrors.nationality = 'Nationality is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onNext();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-fields-row">
        <div className="form-field">
          <label htmlFor="firstName">First Name*</label>
          <input
            type="text"
            id="firstName"
            value={formData.firstName || ''}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          />
          {errors.firstName && <span className="error">{errors.firstName}</span>}
        </div>
        <div className="form-field">
          <label htmlFor="middleName">Middle Name</label>
          <input
            type="text"
            id="middleName"
            value={formData.middleName || ''}
            onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
          />
        </div>
        <div className="form-field">
          <label htmlFor="lastName">Last Name</label>
          <input
            type="text"
            id="lastName"
            value={formData.lastName || ''}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          />
          {errors.lastName && <span className="error">{errors.lastName}</span>}
        </div>
      </div>
      <div className="form-fields-row">
        <div className="form-field">
          <label htmlFor="email">Email*</label>
          <input
            type="email"
            id="email"
            value={formData.email || ''}
            readOnly
            style={{ backgroundColor: '#f0f0f0' }}
          />
          {errors.email && <span className="error">{errors.email}</span>}
        </div>
        <div className="form-field" style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
          <div style={{ minWidth: '110px' }}>
            <label htmlFor="countryCode">Country Code</label>
            <select
              id="countryCode"
              value={formData.countryCode || '+91'}
              onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
            >
              {COUNTRY_CODES.map((c) => (
                <option key={c.code} value={c.code}>{c.label}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label htmlFor="phone">Phone Number*</label>
            <input
              type="tel"
              id="phone"
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              maxLength={10}
            />
            {errors.phone && <span className="error">{errors.phone}</span>}
          </div>
        </div>
      </div>
      <div className="form-field">
        <label>Gender*</label>
        <div className="radio-group">
          <label>
            <input
              type="radio"
              name="gender"
              value="Male"
              checked={formData.gender === 'Male'}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
            />
            Male
          </label>
          <label>
            <input
              type="radio"
              name="gender"
              value="Female"
              checked={formData.gender === 'Female'}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
            />
            Female
          </label>
          <label>
            <input
              type="radio"
              name="gender"
              value="Other"
              checked={formData.gender === 'Other'}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
            />
            Other
          </label>
        </div>
        {errors.gender && <span className="error">{errors.gender}</span>}
      </div>
      <div className="form-fields-row">
        <div className="form-field">
          <label htmlFor="dateOfBirth">Date of Birth*</label>
          <input
            type="date"
            id="dateOfBirth"
            value={formData.dateOfBirth || ''}
            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
          />
          {errors.dateOfBirth && <span className="error">{errors.dateOfBirth}</span>}
        </div>
        <div className="form-field">
          <label htmlFor="nationality">Nationality*</label>
          <select
            id="nationality"
            value={formData.nationality || ''}
            onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
          >
            <option value="">Select Nationality</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {errors.nationality && <span className="error">{errors.nationality}</span>}
        </div>
      </div>
      <div className="form-buttons">
        <div style={{ flex: 1 }}>
          <button type="button" className="btn btn-secondary" onClick={onPrevious}>
            Previous
          </button>
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <button type="button" className="btn btn-secondary save-exit-btn" onClick={onSaveExit}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.6667 4.66667V1.33333H3.33333V4.66667M8 8V14M8 14L5.33333 11.3333M8 14L10.6667 11.3333M1.33333 14.6667H14.6667V4.66667H1.33333V14.66667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Save & Exit
          </button>
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn btn-primary">
            Next
          </button>
        </div>
      </div>
    </form>
  );
};

// Step 3: EducationDetails
const EducationDetails = ({ formData, setFormData, onNext, onPrevious, onSaveExit }) => {
  const [errors, setErrors] = useState({});
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      bachelorInstitute: prev.bachelorInstitute || '',
      bachelorInstituteOther: prev.bachelorInstituteOther || '',
      bachelorDegreeName: prev.bachelorDegreeName || '',
      bachelorYear: prev.bachelorYear || '',
      bachelorCgpa: prev.bachelorCgpa || '',
      masterInstitute: prev.masterInstitute || '',
      masterInstituteOther: prev.masterInstituteOther || '',
      masterDegreeName: prev.masterDegreeName || '',
      masterYear: prev.masterYear || '',
      masterCgpa: prev.masterCgpa || '',
      phdStatus: prev.phdStatus || 'Not done',
      phdInstitute: prev.phdInstitute || '',
      phdInstituteOther: prev.phdInstituteOther || '',
      phdAreaSpecialization: prev.phdAreaSpecialization || '',
      phdYear: prev.phdYear || '',
      phdTitle: prev.phdTitle || '',
    }));
  }, [setFormData]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.bachelorInstitute || (formData.bachelorInstitute === 'Other' && !formData.bachelorInstituteOther)) {
      newErrors.bachelorInstitute = 'Institution/University is required';
    }
    if (!formData.bachelorDegreeName) {
      newErrors.bachelorDegreeName = 'Degree Name is required';
    }
    if (!formData.bachelorYear) {
      newErrors.bachelorYear = 'Year is required';
    } else {
      const bachelorYear = Number(formData.bachelorYear);
      const currentYear = new Date().getFullYear();
      if (bachelorYear < 1950 || bachelorYear > currentYear) {
        newErrors.bachelorYear = `Year must be between 1950 and ${currentYear}`;
      }
    }
    if (!formData.bachelorCgpa) {
      newErrors.bachelorCgpa = '%/CGPA is required';
    }
    if (!formData.masterInstitute || (formData.masterInstitute === 'Other' && !formData.masterInstituteOther)) {
      newErrors.masterInstitute = 'Institution/University is required';
    }
    if (!formData.masterDegreeName) {
      newErrors.masterDegreeName = 'Degree Name is required';
    }
    if (!formData.masterYear) {
      newErrors.masterYear = 'Year is required';
    } else {
      const masterYear = Number(formData.masterYear);
      const bachelorYear = Number(formData.bachelorYear);
      const currentYear = new Date().getFullYear();
      if (masterYear < 1950 || masterYear > currentYear) {
        newErrors.masterYear = `Year must be between 1950 and ${currentYear}`;
      } else if (bachelorYear && masterYear < bachelorYear) {
        newErrors.masterYear = 'Master year cannot be before Bachelor year';
      }
    }
    if (!formData.masterCgpa) {
      newErrors.masterCgpa = '%/CGPA is required';
    }
    if (formData.phdStatus !== 'Not done') {
      if (!formData.phdInstitute || (formData.phdInstitute === 'Other' && !formData.phdInstituteOther)) {
        newErrors.phdInstitute = 'Institution/University is required';
      }
      if (!formData.phdAreaSpecialization) {
        newErrors.phdAreaSpecialization = 'Area of Specialization is required';
      }
      const currentYear = new Date().getFullYear();
      if (!formData.phdYear) {
        newErrors.phdYear =
          formData.phdStatus === 'Pursuing'
            ? 'Pursuing Year is required'
            : 'Passing Year is required';
      } else if (formData.phdStatus === 'Awarded') {
        const yearNum = Number(formData.phdYear);
        if (Number.isFinite(yearNum) && yearNum > currentYear) {
          newErrors.phdYear = 'Passed year cannot be in the future';
        }
      }
      if (!formData.phdTitle) {
        newErrors.phdTitle = 'Title is required';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onNext();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3 className="degree-section-title">Bachelor's Degree</h3>
      <div className="degree-fields-row">
        <div className="form-field">
          <label htmlFor="bachelorInstitute">Institution/University*</label>
          <select
            id="bachelorInstitute"
            name="bachelorInstitute"
            value={formData.bachelorInstitute || ''}
            onChange={handleInputChange}
          >
            <option value="">Select Institution</option>
            {COLLEGES.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
            <option value="Other">Other</option>
          </select>
          {formData.bachelorInstitute === 'Other' && (
            <input
              type="text"
              placeholder="Enter college/university"
              value={formData.bachelorInstituteOther || ''}
              onChange={(e) => setFormData({ ...formData, bachelorInstituteOther: e.target.value })}
              style={{ marginTop: '8px' }}
            />
          )}
          {errors.bachelorInstitute && <span className="error">{errors.bachelorInstitute}</span>}
        </div>
        <div className="form-field">
          <label htmlFor="bachelorDegreeName">Degree Name*</label>
          <input
            type="text"
            id="bachelorDegreeName"
            name="bachelorDegreeName"
            value={formData.bachelorDegreeName || ''}
            onChange={handleInputChange}
          />
          {errors.bachelorDegreeName && <span className="error">{errors.bachelorDegreeName}</span>}
        </div>
        <div className="form-field">
          <label htmlFor="bachelorYear">Passing Year*</label>
          <input
            type="number"
            id="bachelorYear"
            name="bachelorYear"
            value={formData.bachelorYear || ''}
            onChange={handleInputChange}
          />
          {errors.bachelorYear && <span className="error">{errors.bachelorYear}</span>}
        </div>
        <div className="form-field">
          <label htmlFor="bachelorCgpa">Percentage/CGPA*</label>
          <input
            type="number"
            id="bachelorCgpa"
            name="bachelorCgpa"
            value={formData.bachelorCgpa || ''}
            onChange={handleInputChange}
          />
          {errors.bachelorCgpa && <span className="error">{errors.bachelorCgpa}</span>}
        </div>
      </div>

      <h3 className="degree-section-title">Master's Degree</h3>
      <div className="degree-fields-row">
        <div className="form-field">
          <label htmlFor="masterInstitute">Institution/University*</label>
          <select
            id="masterInstitute"
            name="masterInstitute"
            value={formData.masterInstitute || ''}
            onChange={handleInputChange}
          >
            <option value="">Select Institution</option>
            {COLLEGES.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
            <option value="Other">Other</option>
          </select>
          {formData.masterInstitute === 'Other' && (
            <input
              type="text"
              placeholder="Enter college/university"
              value={formData.masterInstituteOther || ''}
              onChange={(e) => setFormData({ ...formData, masterInstituteOther: e.target.value })}
              style={{ marginTop: '8px' }}
            />
          )}
          {errors.masterInstitute && <span className="error">{errors.masterInstitute}</span>}
        </div>
        <div className="form-field">
          <label htmlFor="masterDegreeName">Degree Name*</label>
          <input
            type="text"
            id="masterDegreeName"
            name="masterDegreeName"
            value={formData.masterDegreeName || ''}
            onChange={handleInputChange}
          />
          {errors.masterDegreeName && <span className="error">{errors.masterDegreeName}</span>}
        </div>
        <div className="form-field">
          <label htmlFor="masterYear">Passing Year*</label>
          <input
            type="number"
            id="masterYear"
            name="masterYear"
            value={formData.masterYear || ''}
            onChange={handleInputChange}
          />
          {errors.masterYear && <span className="error">{errors.masterYear}</span>}
        </div>
        <div className="form-field">
          <label htmlFor="masterCgpa">Percentage/CGPA*</label>
          <input
            type="number"
            id="masterCgpa"
            name="masterCgpa"
            value={formData.masterCgpa || ''}
            onChange={handleInputChange}
          />
          {errors.masterCgpa && <span className="error">{errors.masterCgpa}</span>}
        </div>
      </div>

      <h3 className="degree-section-title">Ph.D.</h3>
      <div className="form-field">
        <label htmlFor="phdStatus">Status*</label>
        <select
          id="phdStatus"
          name="phdStatus"
          value={formData.phdStatus || 'Not done'}
          onChange={handleInputChange}
        >
          <option value="Not done">Not done</option>
          <option value="Pursuing">Pursuing</option>
          <option value="Submitted">Submitted</option>
          <option value="Awarded">Awarded</option>
        </select>
      </div>
      {formData.phdStatus !== 'Not done' && (
        <div className="degree-fields-row">
          <div className="form-field">
            <label htmlFor="phdInstitute">Institution/University*</label>
            <select
              id="phdInstitute"
              name="phdInstitute"
              value={formData.phdInstitute || ''}
              onChange={handleInputChange}
            >
              <option value="">Select Institution</option>
              {COLLEGES.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
              <option value="Other">Other</option>
            </select>
            {formData.phdInstitute === 'Other' && (
              <input
                type="text"
                placeholder="Enter college/university"
                value={formData.phdInstituteOther || ''}
                onChange={(e) => setFormData({ ...formData, phdInstituteOther: e.target.value })}
                style={{ marginTop: '8px' }}
              />
            )}
            {errors.phdInstitute && <span className="error">{errors.phdInstitute}</span>}
          </div>
          <div className="form-field">
            <label htmlFor="phdAreaSpecialization">Area of Specialization*</label>
            <input
              type="text"
              id="phdAreaSpecialization"
              name="phdAreaSpecialization"
              value={formData.phdAreaSpecialization || ''}
              onChange={handleInputChange}
            />
            {errors.phdAreaSpecialization && <span className="error">{errors.phdAreaSpecialization}</span>}
          </div>
          <div className="form-field">
            <label htmlFor="phdYear">
              {formData.phdStatus === 'Pursuing' 
                ? 'Pursuing Year*' 
                : (formData.phdStatus === 'Awarded' ? 'Passed Year*' : 'Passing Year*')}
            </label>
            <input
              type="number"
              id="phdYear"
              name="phdYear"
              value={formData.phdYear || ''}
              onChange={handleInputChange}
              max={formData.phdStatus === 'Awarded' ? new Date().getFullYear() : undefined}
            />
            {errors.phdYear && <span className="error">{errors.phdYear}</span>}
          </div>
          <div className="form-field">
            <label htmlFor="phdTitle">Title*</label>
            <input
              type="text"
              id="phdTitle"
              name="phdTitle"
              value={formData.phdTitle || ''}
              onChange={handleInputChange}
            />
            {errors.phdTitle && <span className="error">{errors.phdTitle}</span>}
          </div>
        </div>
      )}

      <div className="form-buttons">
        <div style={{ flex: 1 }}>
          <button type="button" className="btn btn-secondary" onClick={onPrevious}>
            Previous
          </button>
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <button type="button" className="btn btn-secondary save-exit-btn" onClick={onSaveExit}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.6667 4.66667V1.33333H3.33333V4.66667M8 8V14M8 14L5.33333 11.3333M8 14L10.6667 11.3333M1.33333 14.6667H14.6667V4.66667H1.33333V14.66667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Save & Exit
          </button>
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn btn-primary">
            Next
          </button>
        </div>
      </div>
    </form>
  );
};

// Step 4: Experience
const Experience = ({ formData, setFormData, onNext, onPrevious, onSaveExit }) => {
  const [errors, setErrors] = useState({});
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      teachingExperiences: prev.teachingExperiences || [
        { teachingPost: '', teachingInstitution: '', teachingStartDate: '', teachingEndDate: '', teachingExperience: '' },
      ],
      researchExperiences: prev.researchExperiences || [
        { researchPost: '', researchInstitution: '', researchStartDate: '', researchEndDate: '', researchExperience: '' },
      ],
      totalExperience: prev.totalExperience || '',
    }));
  }, []);

  const calculateExperience = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    let totalMonths = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    if (end.getDate() < start.getDate()) totalMonths--;
    if (totalMonths < 0) return 0;
    return totalMonths;
  };

  const monthsToString = (months) => {
    const years = Math.floor(months / 12);
    const remMonths = months % 12;
    let str = '';
    if (years > 0) str += `${years} years`;
    if (remMonths > 0) str += (str ? ' ' : '') + `${remMonths} months`;
    return str || '0 years';
  };

  const updateTotalExperience = (teachingArr, researchArr) => {
    let totalMonths = 0;
    teachingArr.forEach((exp) => {
      totalMonths += calculateExperience(exp.teachingStartDate, exp.teachingEndDate);
    });
    researchArr.forEach((exp) => {
      totalMonths += calculateExperience(exp.researchStartDate, exp.researchEndDate);
    });
    setFormData((prev) => ({ ...prev, totalExperience: monthsToString(totalMonths) }));
  };

  const handleTeachingChange = (idx, e) => {
    const { name, value } = e.target;
    const teachingArr = [...(formData.teachingExperiences || [])];
    teachingArr[idx][name] = value;
    if (teachingArr[idx].teachingStartDate && teachingArr[idx].teachingEndDate) {
      // Validate that end date is after start date
      if (teachingArr[idx].teachingEndDate < teachingArr[idx].teachingStartDate) {
        teachingArr[idx].teachingExperience = 'Invalid dates';
      } else {
        const months = calculateExperience(teachingArr[idx].teachingStartDate, teachingArr[idx].teachingEndDate);
        teachingArr[idx].teachingExperience = monthsToString(months);
      }
    }
    setFormData((prev) => ({ ...prev, teachingExperiences: teachingArr }));
    updateTotalExperience(teachingArr, formData.researchExperiences || []);
  };

  const handleResearchChange = (idx, e) => {
    const { name, value } = e.target;
    const researchArr = [...(formData.researchExperiences || [])];
    researchArr[idx][name] = value;
    if (researchArr[idx].researchStartDate && researchArr[idx].researchEndDate) {
      // Validate that end date is after start date
      if (researchArr[idx].researchEndDate < researchArr[idx].researchStartDate) {
        researchArr[idx].researchExperience = 'Invalid dates';
      } else {
        const months = calculateExperience(researchArr[idx].researchStartDate, researchArr[idx].researchEndDate);
        researchArr[idx].researchExperience = monthsToString(months);
      }
    }
    setFormData((prev) => ({ ...prev, researchExperiences: researchArr }));
    updateTotalExperience(formData.teachingExperiences || [], researchArr);
  };

  const addTeachingExperience = () => {
    const teachingArr = [...(formData.teachingExperiences || [])];
    teachingArr.push({ teachingPost: '', teachingInstitution: '', teachingStartDate: '', teachingEndDate: '', teachingExperience: '' });
    setFormData((prev) => ({ ...prev, teachingExperiences: teachingArr }));
  };

  const addResearchExperience = () => {
    const researchArr = [...(formData.researchExperiences || [])];
    researchArr.push({ researchPost: '', researchInstitution: '', researchStartDate: '', researchEndDate: '', researchExperience: '' });
    setFormData((prev) => ({ ...prev, researchExperiences: researchArr }));
  };

  const validateForm = () => {
    const newErrors = { teaching: [], research: [] };
    const today = new Date().toISOString().split('T')[0];
    (formData.teachingExperiences || []).forEach((exp, idx) => {
      const entryErrors = {};
      // Check if institution is "Other" but no custom value provided
      if (exp.teachingInstitution === 'Other' && !exp.teachingInstitutionOther?.trim()) {
        entryErrors.teachingInstitution = 'Please specify your institution';
      }
      if (exp.teachingStartDate && exp.teachingStartDate > today) {
        entryErrors.teachingStartDate = 'Start date cannot be in the future';
      }
      if (exp.teachingEndDate && exp.teachingEndDate > today) {
        entryErrors.teachingEndDate = 'End date cannot be in the future';
      }
      // Validate end date is after start date
      if (exp.teachingStartDate && exp.teachingEndDate && exp.teachingEndDate < exp.teachingStartDate) {
        entryErrors.teachingEndDate = 'End date must be after start date';
      }
      newErrors.teaching[idx] = entryErrors;
    });
    (formData.researchExperiences || []).forEach((exp, idx) => {
      const entryErrors = {};
      const hasResearchData = exp.researchPost || exp.researchInstitution || exp.researchStartDate || exp.researchEndDate;
      if (hasResearchData) {
        if (!exp.researchPost) entryErrors.researchPost = 'Research post is required';
        if (!exp.researchInstitution) entryErrors.researchInstitution = 'Institution/University is required';
        // Check if institution is "Other" but no custom value provided
        else if (exp.researchInstitution === 'Other' && !exp.researchInstitutionOther?.trim()) {
          entryErrors.researchInstitution = 'Please specify your institution';
        }
        if (!exp.researchStartDate) entryErrors.researchStartDate = 'Start date is required';
        else if (exp.researchStartDate > today) entryErrors.researchStartDate = 'Start date cannot be in the future';
        if (!exp.researchEndDate) entryErrors.researchEndDate = 'End date is required';
        else if (exp.researchEndDate > today) entryErrors.researchEndDate = 'End date cannot be in the future';
        // Validate end date is after start date
        if (exp.researchStartDate && exp.researchEndDate && exp.researchEndDate < exp.researchStartDate) {
          entryErrors.researchEndDate = 'End date must be after start date';
        }
      }
      newErrors.research[idx] = entryErrors;
    });
    setErrors(newErrors);
    const hasTeachingErrors = newErrors.teaching.some(e => Object.keys(e).length > 0);
    const hasResearchErrors = newErrors.research.some(e => Object.keys(e).length > 0);
    return !(hasTeachingErrors || hasResearchErrors);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Normalize "Other" institution values before proceeding
      const normalizedData = { ...formData };
      
      // Normalize teaching experiences
      if (normalizedData.teachingExperiences) {
        normalizedData.teachingExperiences = normalizedData.teachingExperiences.map(exp => {
          if (exp.teachingInstitution === 'Other' && exp.teachingInstitutionOther) {
            return { ...exp, teachingInstitution: exp.teachingInstitutionOther };
          }
          return exp;
        });
      }
      
      // Normalize research experiences
      if (normalizedData.researchExperiences) {
        normalizedData.researchExperiences = normalizedData.researchExperiences.map(exp => {
          if (exp.researchInstitution === 'Other' && exp.researchInstitutionOther) {
            return { ...exp, researchInstitution: exp.researchInstitutionOther };
          }
          return exp;
        });
      }
      
      setFormData(normalizedData);
      onNext();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3 className="degree-section-title">Teaching Experience</h3>
      {(formData.teachingExperiences || []).map((exp, idx) => (
        <div
          className="degree-fields-row"
          key={idx}
          style={{ marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '1rem', position: 'relative' }}
        >
          {idx > 0 && (
            <button
              type="button"
              onClick={() => {
                const teachingArr = [...formData.teachingExperiences];
                teachingArr.splice(idx, 1);
                setFormData((prev) => ({ ...prev, teachingExperiences: teachingArr }));
              }}
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                background: '#f8d7da',
                color: '#721c24',
                border: 'none',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                fontSize: '1.1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label="Remove Teaching Experience"
            >
              &minus;
            </button>
          )}
          <div className="form-field">
            <label htmlFor={`teachingPost${idx}`}>Post</label>
            <select
              id={`teachingPost${idx}`}
              name="teachingPost"
              value={exp.teachingPost}
              onChange={(e) => handleTeachingChange(idx, e)}
            >
              <option value="">Select Post</option>
              <option value="Assistant Professor">Assistant Professor</option>
              <option value="Associate Professor">Associate Professor</option>
              <option value="Professor">Professor</option>
            </select>
            {errors.teaching && errors.teaching[idx] && errors.teaching[idx].teachingPost && (
              <span className="error">{errors.teaching[idx].teachingPost}</span>
            )}
          </div>
          <div className="form-field">
            <label htmlFor={`teachingInstitution${idx}`}>Institution/University</label>
            <select
              id={`teachingInstitution${idx}`}
              name="teachingInstitution"
              value={exp.teachingInstitution}
              onChange={(e) => handleTeachingChange(idx, e)}
            >
              <option value="">Select Institution</option>
              {COLLEGES.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
              <option value="Other">Other</option>
            </select>
            {errors.teaching && errors.teaching[idx] && errors.teaching[idx].teachingInstitution && (
              <span className="error">{errors.teaching[idx].teachingInstitution}</span>
            )}
          </div>
          {exp.teachingInstitution === 'Other' && (
            <div className="form-field">
              <label htmlFor={`teachingInstitutionOther${idx}`}>Please specify Institution/University</label>
              <input
                type="text"
                id={`teachingInstitutionOther${idx}`}
                name="teachingInstitutionOther"
                value={exp.teachingInstitutionOther || ''}
                onChange={(e) => handleTeachingChange(idx, e)}
                placeholder="Enter your institution name"
              />
            </div>
          )}
          <div className="form-field">
            <label htmlFor={`teachingStartDate${idx}`}>Start Date</label>
            <input
              type="date"
              id={`teachingStartDate${idx}`}
              name="teachingStartDate"
              value={exp.teachingStartDate}
              onChange={(e) => handleTeachingChange(idx, e)}
            />
            {errors.teaching && errors.teaching[idx] && errors.teaching[idx].teachingStartDate && (
              <span className="error">{errors.teaching[idx].teachingStartDate}</span>
            )}
          </div>
          <div className="form-field">
            <label htmlFor={`teachingEndDate${idx}`}>End Date</label>
            <input
              type="date"
              id={`teachingEndDate${idx}`}
              name="teachingEndDate"
              value={exp.teachingEndDate}
              onChange={(e) => handleTeachingChange(idx, e)}
            />
            {errors.teaching && errors.teaching[idx] && errors.teaching[idx].teachingEndDate && (
              <span className="error">{errors.teaching[idx].teachingEndDate}</span>
            )}
          </div>
          <div className="form-field">
            <label>Experience</label>
            <input type="text" value={exp.teachingExperience} readOnly className="readonly-field" />
          </div>
        </div>
      ))}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
        <button
          type="button"
          className="btn btn-primary"
          onClick={addTeachingExperience}
          style={{ fontSize: '0.9rem', padding: '0.5rem 1.2rem', borderRadius: '6px' }}
        >
          + Add Teaching Experience
        </button>
      </div>

      <h3 className="degree-section-title">Research Experience</h3>
      {(formData.researchExperiences || []).map((exp, idx) => (
        <div
          className="degree-fields-row"
          key={idx}
          style={{ marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '1rem', position: 'relative' }}
        >
          {idx > 0 && (
            <button
              type="button"
              onClick={() => {
                const researchArr = [...formData.researchExperiences];
                researchArr.splice(idx, 1);
                setFormData((prev) => ({ ...prev, researchExperiences: researchArr }));
              }}
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                background: '#f8d7da',
                color: '#721c24',
                border: 'none',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                fontSize: '1.1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label="Remove Research Experience"
            >
              &minus;
            </button>
          )}
          <div className="form-field">
            <label htmlFor={`researchPost${idx}`}>Post</label>
            <input
              type="text"
              id={`researchPost${idx}`}
              name="researchPost"
              value={exp.researchPost}
              onChange={(e) => handleResearchChange(idx, e)}
              placeholder="e.g., Research Associate"
            />
            {errors.research && errors.research[idx] && errors.research[idx].researchPost && (
              <span className="error">{errors.research[idx].researchPost}</span>
            )}
          </div>
          <div className="form-field">
            <label htmlFor={`researchInstitution${idx}`}>Institution/University</label>
            <select
              id={`researchInstitution${idx}`}
              name="researchInstitution"
              value={exp.researchInstitution}
              onChange={(e) => handleResearchChange(idx, e)}
            >
              <option value="">Select Institution</option>
              {COLLEGES.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
              <option value="Other">Other</option>
            </select>
            {errors.research && errors.research[idx] && errors.research[idx].researchInstitution && (
              <span className="error">{errors.research[idx].researchInstitution}</span>
            )}
          </div>
          {exp.researchInstitution === 'Other' && (
            <div className="form-field">
              <label htmlFor={`researchInstitutionOther${idx}`}>Please specify Institution/University</label>
              <input
                type="text"
                id={`researchInstitutionOther${idx}`}
                name="researchInstitutionOther"
                value={exp.researchInstitutionOther || ''}
                onChange={(e) => handleResearchChange(idx, e)}
                placeholder="Enter your institution name"
              />
            </div>
          )}
          <div className="form-field">
            <label htmlFor={`researchStartDate${idx}`}>Start Date</label>
            <input
              type="date"
              id={`researchStartDate${idx}`}
              name="researchStartDate"
              value={exp.researchStartDate}
              onChange={(e) => handleResearchChange(idx, e)}
            />
            {errors.research && errors.research[idx] && errors.research[idx].researchStartDate && (
              <span className="error">{errors.research[idx].researchStartDate}</span>
            )}
          </div>
          <div className="form-field">
            <label htmlFor={`researchEndDate${idx}`}>End Date</label>
            <input
              type="date"
              id={`researchEndDate${idx}`}
              name="researchEndDate"
              value={exp.researchEndDate}
              onChange={(e) => handleResearchChange(idx, e)}
            />
            {errors.research && errors.research[idx] && errors.research[idx].researchEndDate && (
              <span className="error">{errors.research[idx].researchEndDate}</span>
            )}
          </div>
          <div className="form-field">
            <label>Experience</label>
            <input type="text" value={exp.researchExperience} readOnly className="readonly-field" />
          </div>
        </div>
      ))}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
        <button
          type="button"
          className="btn btn-primary"
          onClick={addResearchExperience}
          style={{ fontSize: '0.9rem', padding: '0.5rem 1.2rem', borderRadius: '6px' }}
        >
          + Add Research Experience
        </button>
      </div>

      <div className="form-field total-experience">
        <label>Total Experience</label>
        <input type="text" value={formData.totalExperience || ''} readOnly className="readonly-field" />
      </div>

      <div className="form-buttons">
        <div style={{ flex: 1 }}>
          <button type="button" className="btn btn-secondary" onClick={onPrevious}>
            Previous
          </button>
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <button type="button" className="btn btn-secondary save-exit-btn" onClick={onSaveExit}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.6667 4.66667V1.33333H3.33333V4.66667M8 8V14M8 14L5.33333 11.3333M8 14L10.6667 11.3333M1.33333 14.6667H14.6667V4.66667H1.33333V14.66667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Save & Exit
          </button>
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn btn-primary">
            Next
          </button>
        </div>
      </div>
    </form>
  );
};

// Step 5: ResearchInformation
const ResearchInformation = ({ formData, setFormData, onNext, onPrevious, onSaveExit }) => {
  const [errors, setErrors] = useState({});
  const validateForm = () => {
    const newErrors = {};
    if (!formData.scopusId) newErrors.scopusId = 'Scopus ID is required';
    if (!formData.googleScholarId) {
      newErrors.googleScholarId = 'Google Scholar ID is required';
    } else if (!/^[a-zA-Z0-9]{10,20}$/.test(formData.googleScholarId)) {
      newErrors.googleScholarId = 'Google Scholar ID must be alphanumeric, e.g., YBxwE6gAAAAJ';
    }
    if (formData.orchidId) {
      if (!/^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/.test(formData.orchidId)) {
        newErrors.orchidId = 'ORCID ID must be in the format 0000-0001-5109-3700';
      }
    }
    if (formData.scopus_general_papers === '') newErrors.scopus_general_papers = 'No. of Scopus Index General Papers is required';
    if (formData.conference_papers === '') newErrors.conference_papers = 'No. of Scopus Index Conference Papers is required';
    if (formData.edited_books === '') newErrors.edited_books = 'No. of Edited Books is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onNext();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-fields-row">
        <div className="form-field">
          <label htmlFor="scopusId">
            Scopus ID*
            <a 
              href="https://www.scopus.com/freelookup/form/author.uri" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ marginLeft: '8px', cursor: 'pointer', textDecoration: 'none', fontSize: '14px', color: '#2196F3' }}
              title="Find your Scopus ID"
            >
              ℹ️
            </a>
          </label>
          <input
            type="text"
            id="scopusId"
            name="scopusId"
            value={formData.scopusId || ''}
            onChange={handleInputChange}
          />
          {errors.scopusId && <span className="error">{errors.scopusId}</span>}
        </div>
        <div className="form-field">
          <label htmlFor="orchidId">
            ORCID ID
            <a 
              href="https://orcid.org/" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ marginLeft: '8px', cursor: 'pointer', textDecoration: 'none', fontSize: '14px', color: '#2196F3' }}
              title="Find your ORCID ID"
            >
              ℹ️
            </a>
          </label>
          <input
            type="text"
            id="orchidId"
            name="orchidId"
            value={formData.orchidId || ''}
            onChange={handleInputChange}
          />
          {errors.orchidId && <span className="error">{errors.orchidId}</span>}
        </div>
        <div className="form-field">
          <label htmlFor="googleScholarId">
            Google Scholar ID*
            <a 
              href="https://scholar.google.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ marginLeft: '8px', cursor: 'pointer', textDecoration: 'none', fontSize: '14px', color: '#2196F3' }}
              title="Find your Google Scholar ID"
            >
              ℹ️
            </a>
          </label>
          <input
            type="text"
            id="googleScholarId"
            name="googleScholarId"
            value={formData.googleScholarId || ''}
            onChange={handleInputChange}
          />
          {errors.googleScholarId && <span className="error">{errors.googleScholarId}</span>}
        </div>
      </div>
      <div className="form-fields-row">
        <div className="form-field">
          <label htmlFor="scopus_general_papers">No. of Scopus Index General Papers*</label>
          <input
            type="number"
            id="scopus_general_papers"
            name="scopus_general_papers"
            value={formData.scopus_general_papers || ''}
            onChange={handleInputChange}
          />
          {errors.scopus_general_papers && <span className="error">{errors.scopus_general_papers}</span>}
        </div>
        <div className="form-field">
          <label htmlFor="conference_papers">No. of Scopus Index Conference Papers*</label>
          <input
            type="number"
            id="conference_papers"
            name="conference_papers"
            value={formData.conference_papers || ''}
            onChange={handleInputChange}
          />
          {errors.conference_papers && <span className="error">{errors.conference_papers}</span>}
        </div>
        <div className="form-field">
          <label htmlFor="edited_books">No. of Edited Books*</label>
          <input
            type="number"
            id="edited_books"
            name="edited_books"
            value={formData.edited_books || ''}
            onChange={handleInputChange}
          />
          {errors.edited_books && <span className="error">{errors.edited_books}</span>}
        </div>
      </div>
      <div className="form-buttons">
        <div style={{ flex: 1 }}>
          <button type="button" className="btn btn-secondary" onClick={onPrevious}>
            Previous
          </button>
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <button type="button" className="btn btn-secondary save-exit-btn" onClick={onSaveExit}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.6667 4.66667V1.33333H3.33333V4.66667M8 8V14M8 14L5.33333 11.3333M8 14L10.6667 11.3333M1.33333 14.6667H14.6667V4.66667H1.33333V14.66667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Save & Exit
          </button>
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn btn-primary">
            Next
          </button>
        </div>
      </div>
    </form>
  );
};

// Step 6: Documentation
const Documentation = ({ formData, setFormData, onPrevious, onSubmit, onSaveExit, submitting }) => {
  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, [field]: file }));
    }
  };

  return (
    <form>
      <div className="form-field">
        <label>Cover Letter</label>
        <input type="file" onChange={(e) => handleFileChange(e, 'coverLetterPath')} />
      </div>
      <div className="form-field">
        <label>Teaching Statement *</label>
        <input type="file" onChange={(e) => handleFileChange(e, 'teachingStatement')} />
      </div>
      <div className="form-field">
        <label>Research Statement *</label>
        <input type="file" onChange={(e) => handleFileChange(e, 'researchStatement')} />
      </div>
      <div className="form-field">
        <label>Upload CV *</label>
        <input 
          type="file" 
          accept=".pdf,.doc,.docx" 
          onChange={(e) => handleFileChange(e, 'cvPath')} 
        />
      </div>
      <div className="form-field">
        <label>Top 3 Published Papers (1 compiled PDF)*</label>
        <input type="file" onChange={(e) => handleFileChange(e, 'otherPublications')} />
      </div>
      <div className="form-buttons">
        <div style={{ flex: 1 }}>
          <button type="button" className="btn btn-secondary" onClick={onPrevious}>
            Previous
          </button>
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <button type="button" className="btn btn-secondary save-exit-btn" onClick={onSaveExit}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.6667 4.66667V1.33333H3.33333V4.66667M8 8V14M8 14L5.33333 11.3333M8 14L10.6667 11.3333M1.33333 14.6667H14.6667V4.66667H1.33333V14.66667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Save & Exit
          </button>
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onSubmit}
            disabled={submitting}
            aria-busy={submitting}
            style={{
              position: 'relative',
              cursor: submitting ? 'wait' : 'pointer',
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting && (
              <span style={{
                display: 'inline-block',
                width: '14px',
                height: '14px',
                border: '2px solid #ffffff',
                borderTop: '2px solid transparent',
                borderRadius: '50%',
                animation: 'spin 0.6s linear infinite',
                marginRight: '8px',
              }}></span>
            )}
            {submitting ? 'Submitting Application…' : 'Submit Application'}
          </button>
        </div>
      </div>
    </form>
  );
};

// Main MultiStepForm
const CombinedMultiStepForm = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    position: '',
    department: '',
    branch: '',
    countryCode: '+91',
  });
  const [profile, setProfile] = useState({
    full_name: '',
    loading: true,
    error: null,
  });

  // Load draft on component mount
  useEffect(() => {
    const loadDraft = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('draft_applications')
          .select('form_data, current_step')
          .eq('user_id', user.id)
          .single();

        if (data) {
          setFormData(data.form_data);
          setCurrentStep(data.current_step);
        }
      } catch (err) {
        console.log('No draft found or error:', err.message);
      }
    };

    loadDraft();
  }, []);

  useEffect(() => {
    setProfile((prev) => ({ ...prev, loading: true }));
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', session.user.id)
            .maybeSingle();
          if (error) throw error;
          setProfile({
            full_name: data?.full_name || '',
            loading: false,
            error: null,
          });
        } catch (err) {
          console.error('Error fetching profile:', err);
          setProfile({
            full_name: '',
            loading: false,
            error: err.message,
          });
        }
      } else {
        setProfile({
          full_name: '',
          loading: false,
          error: 'User not authenticated',
        });
      }
    });
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const { loading, error, full_name: fullName } = profile;
  const [completedSteps, setCompletedSteps] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Helper function for department short names
  const getDepartmentShortName = (dept) => {
    if (!dept) return '';
    const map = {
      engineering: 'SOET',
      law: 'SOL',
      management: 'SOM',
      liberal: 'SOLS',
      admin: 'Admin',
      it: 'IT',
      security: 'Sec',
      lab: 'Lab'
    };
    return map[dept] || dept;
  };

  const steps = [
    { id: 1, name: 'Position Selection' },
    { id: 2, name: 'Personal Information' },
    { id: 3, name: 'Education Details' },
    { id: 4, name: 'Experience' },
    { id: 5, name: 'Research Information' },
    { id: 6, name: 'Documentation' },
  ];

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Save draft function
  const saveDraftAndExit = async () => {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      alert('You must be logged in to save progress.');
      return;
    }

    try {
      const draftData = {
        user_id: user.id,
       form_data: formData,
        current_step: currentStep,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('draft_applications')
        .upsert(draftData, { onConflict: 'user_id' });

      if (error) throw error;

      alert('✅ Progress saved successfully! You can resume later.');
      navigate('/register');
    } catch (err) {
      console.error('Save draft error:', err);
      alert('❌ Failed to save progress: ' + err.message);
    }
  };

 const onSubmitFinalApplication = async () => {
  // Client-side double-submit guard: prevents multiple rapid clicks
  if (submitting) return;
  setSubmitting(true);
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    console.error('❌ User not authenticated:', authError);
    alert('❌ You must be logged in to submit an application.');
    setSubmitting(false);
    return;
  }
  // Normalize any 'Other' institute choices defensively before deriving values
  const normalized = { ...formData };
  if (normalized.bachelorInstitute === 'Other' && normalized.bachelorInstituteOther) {
    normalized.bachelorInstitute = normalized.bachelorInstituteOther;
  }
  if (normalized.masterInstitute === 'Other' && normalized.masterInstituteOther) {
    normalized.masterInstitute = normalized.masterInstituteOther;
  }
  if (normalized.phdInstitute === 'Other' && normalized.phdInstituteOther) {
    normalized.phdInstitute = normalized.phdInstituteOther;
  }

  // Derive highest degree, university, and graduation year from education step
  let derivedHighestDegree = '';
  let derivedUniversity = '';
  let derivedGradYear = '';
  if ((normalized.phdStatus || '') !== 'Not done') {
    derivedHighestDegree = 'PhD';
    derivedUniversity = normalized.phdInstitute || '';
    derivedGradYear = normalized.phdYear || '';
  } else if (normalized.masterInstitute) {
    derivedHighestDegree = 'Masters';
    derivedUniversity = normalized.masterInstitute || '';
    derivedGradYear = normalized.masterYear || '';
  } else if (normalized.bachelorInstitute) {
    derivedHighestDegree = 'Bachelors';
    derivedUniversity = normalized.bachelorInstitute || '';
    derivedGradYear = normalized.bachelorYear || '';
  }

  // Build multipart/form-data so files are actually uploaded via multer on the server
  const fd = new FormData();
  fd.append('position', normalized.position || '');
  fd.append('department', normalized.department || '');
  fd.append('branch', normalized.branch || '');
  fd.append('first_name', normalized.firstName || '');
  fd.append('middle_name', normalized.middleName || '');
  fd.append('last_name', normalized.lastName || '');
  fd.append('email', normalized.email || '');
  const phoneWithCode = `${normalized.countryCode || ''}${normalized.phone ? ' ' + normalized.phone : ''}`;
  fd.append('phone', phoneWithCode.trim());
  fd.append('address', normalized.address || '');
  // Use derived values to ensure university exists for NIRF/QS scoring
  fd.append('highest_degree', derivedHighestDegree);
  fd.append('university', derivedUniversity);
  fd.append('graduation_year', derivedGradYear);
  fd.append('previous_positions', normalized.previous_positions || '');
  fd.append('years_of_experience', normalized.totalExperience || '');
  fd.append('gender', normalized.gender || '');
  fd.append('date_of_birth', normalized.dateOfBirth || '');
  fd.append('nationality', normalized.nationality || '');
  fd.append('user_id', user?.id || '');

  // Complex fields as JSON strings (server will JSON.parse)
  fd.append('teachingExperiences', JSON.stringify((normalized.teachingExperiences || []).map((t) => ({
    teachingPost: t.teachingPost || '',
    teachingInstitution: t.teachingInstitution || '',
    teachingStartDate: t.teachingStartDate || '',
    teachingEndDate: t.teachingEndDate || '',
    teachingExperience: t.teachingExperience || '',
  }))));
  fd.append('researchExperiences', JSON.stringify((normalized.researchExperiences || []).map((r) => ({
    researchPost: r.researchPost || '',
    researchInstitution: r.researchInstitution || '',
    researchStartDate: r.researchStartDate || '',
    researchEndDate: r.researchEndDate || '',
    researchExperience: r.researchExperience || '',
  }))));
  fd.append('researchInfo', JSON.stringify({
    scopus_id: normalized.scopusId || '',
    orchid_id: normalized.orchidId || '',
    google_scholar_id: normalized.googleScholarId || '',
    scopus_general_papers: Number(normalized.scopus_general_papers) || 0,
    conference_papers: Number(normalized.conference_papers) || 0,
    edited_books: Number(normalized.edited_books) || 0,
  }));

  // Files (only append when File objects exist)
  if (formData.coverLetterPath instanceof File) {
    fd.append('coverLetterPath', formData.coverLetterPath, formData.coverLetterPath.name);
  }
  if (formData.teachingStatement instanceof File) {
    fd.append('teachingStatement', formData.teachingStatement, formData.teachingStatement.name);
  }
  if (formData.researchStatement instanceof File) {
    fd.append('researchStatement', formData.researchStatement, formData.researchStatement.name);
  }
  if (formData.cvPath instanceof File) {
    fd.append('cvPath', formData.cvPath, formData.cvPath.name);
  }
  if (formData.otherPublications instanceof File) {
    fd.append('otherPublications', formData.otherPublications, formData.otherPublications.name);
  }

  try {
    // Show warning about Render cold start
    console.log('⏳ Submitting to backend... (This may take up to 60 seconds on first request)');
    
    // Add timeout of 90 seconds for Render cold starts
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000);
    
    const response = await fetch(API_BASE + '/api/applications', {
      method: 'POST',
      body: fd,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorRes = await response.json();
      console.error('❌ Server error response:', errorRes);
      
      // Check for duplicate submission
      if (response.status === 409) {
        alert('⚠️ You have already submitted an application for this position.\n\nPlease wait or contact support if you believe this is a mistake.');
      } else {
        alert('❌ Submission failed: ' + (errorRes.error || 'Unknown error'));
      }
      throw new Error(errorRes.error || 'Failed to submit');
    }

    const result = await response.json();
    console.log('✅ Submission successful:', result);
    alert('✅ Application submitted successfully!\n\n' + (result.message || 'Your application is being processed. You will receive confirmation via email.'));
    
    // Navigate to thank you page or dashboard
    setTimeout(() => {
      navigate('/register');
    }, 1500);
  } catch (err) {
    console.error('❌ Submission error:', err);
    // Only show alert if we haven't already shown one above
    if (!err.message.includes('Failed to submit')) {
      alert('❌ Submission failed: ' + err.message);
    }
  } finally {
    setSubmitting(false);
  }
};
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <PositionSelection 
          formData={formData} 
          setFormData={setFormData} 
          onNext={handleNext}
          onSaveExit={saveDraftAndExit}
        />;
      case 2:
        return <PersonalInformation 
          formData={formData} 
          setFormData={setFormData} 
          onNext={handleNext} 
          onPrevious={handlePrevious}
          onSaveExit={saveDraftAndExit}
        />;
      case 3:
        return <EducationDetails 
          formData={formData} 
          setFormData={setFormData} 
          onNext={handleNext} 
          onPrevious={handlePrevious}
          onSaveExit={saveDraftAndExit}
        />;
      case 4:
        return <Experience 
          formData={formData} 
          setFormData={setFormData} 
          onNext={handleNext} 
          onPrevious={handlePrevious}
          onSaveExit={saveDraftAndExit}
        />;
      case 5:
        return <ResearchInformation 
          formData={formData} 
          setFormData={setFormData} 
          onNext={handleNext} 
          onPrevious={handlePrevious}
          onSaveExit={saveDraftAndExit}
        />;
      case 6:
        return <Documentation 
          formData={formData} 
          setFormData={setFormData} 
          onPrevious={handlePrevious} 
          onSubmit={onSubmitFinalApplication}
          onSaveExit={saveDraftAndExit}
          submitting={submitting}
        />;
      default:
        return null;
    }
  };

  return (
    <div className="multi-step-form">
      {/* Header */}
      <div
        className="form-header"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '0 20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div className="university-logo" style={{ width: '60px', marginRight: '15px' }}>
            <img src="/image 2.png" alt="University Logo" style={{ width: '100%', height: 'auto' }} />
          </div>
          <div className="university-info">
            <div className="university-name" style={{ fontWeight: 'bold', fontSize: '1.4rem' }}>
              BML Munjal University
            </div>
            <div className="recruitment-text" style={{ color: '#555', fontSize: '1.15rem' }}>
              Faculty Recruitment {new Date().getFullYear()}
            </div>
          </div>
        </div>
        <div className="profile-display" style={{ marginLeft: 'auto' }}>
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div className="error">Error: {error}</div>
          ) : (
            <>
              {fullName && (
                <div
                  className="user-name"
                  style={{
                    fontWeight: '600',
                    fontSize: '1.1rem',
                    color: '#333',
                    fontFamily: 'Arial, sans-serif',
                  }}
                >
                  Welcome, <span style={{ fontWeight: '700', color: '#000' }}>{fullName}</span>
                </div>
              )}
              {formData.position && (
                <div
                  className="user-position"
                  style={{
                    fontWeight: '500',
                    fontSize: '1.05rem',
                    color: '#333',
                    marginTop: '2px',
                    fontFamily: 'Arial, sans-serif',
                  }}
                >
                  Position: <span style={{ fontWeight: '600' }}>
                    {typeof formData.position === 'string'
                      ? formData.position.charAt(0).toUpperCase() + formData.position.slice(1)
                      : formData.position}
                  </span>
                  {formData.department && (
                    <> • <span>{getDepartmentShortName(formData.department)}</span></>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Progress Steps */}
      <div className="form-progress">
        {steps.map((step) => {
          const isCompleted = completedSteps.includes(step.id);
          const isActive = currentStep === step.id;
          return (
            <div
              key={step.id}
              className={`step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${isCompleted ? 'clickable' : 'disabled'}`}
              onClick={() => {
                if (isCompleted) setCurrentStep(step.id);
              }}
              style={{ cursor: isCompleted ? 'pointer' : 'not-allowed' }}
              aria-disabled={!isCompleted}
              tabIndex={isCompleted ? 0 : -1}
            >
              <div className="step-number">{step.id}</div>
              <div className="step-name">
                {step.name}
                {isCompleted && <span className="checkmark">&#10003;</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Form Content */}
      <div className="form-content">{renderStep()}</div>
    </div>
  );
};

export default CombinedMultiStepForm;