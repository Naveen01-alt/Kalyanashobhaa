import React, { useState, useRef, useEffect } from 'react'; 
import { useNavigate, useSearchParams } from 'react-router-dom'; 
import toast, { Toaster } from 'react-hot-toast'; 
import SignatureCanvas from 'react-signature-canvas'; 
import './Registration.css';
import Navbar from "../../Components/Navbar.jsx";

// --- STATIC DATA ---
const RELIGIONS = ["Hindu", "Muslim", "Christian", "Sikh", "Jain", "Buddhist", "Parsi", "Jewish", "Spiritual - No Religion", "Other"];
const COUNTRIES = ["India", "United States", "United Kingdom", "Canada", "Australia", "UAE", "Singapore", "Germany", "New Zealand", "Malaysia", "Saudi Arabia", "Kuwait", "Others"];
const STATES = ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi NCR", "Jammu & Kashmir"];

// Categorized Cities (Top 10, TS, AP, Others)
const TOP_CITIES = ["Hyderabad", "Visakhapatnam", "Vijayawada", "Bangalore", "Chennai", "Warangal", "Tirupati", "Guntur", "Pune", "Delhi NCR"];
const TS_CITIES = ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam", "Ramagundam", "Mahabubnagar", "Nalgonda", "Adilabad", "Suryapet", "Miryalaguda", "Siddipet", "Jagtial", "Mancherial", "Bodhan"];
const AP_CITIES = ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Kakinada", "Rajahmundry", "Tirupati", "Kadapa", "Anantapur", "Vizianagaram", "Eluru", "Ongole", "Nandyal", "Machilipatnam"];
const OTHER_CITIES = ["Bangalore", "Chennai", "Mumbai", "Pune", "Delhi NCR", "Kolkata", "Ahmedabad", "Surat", "Jaipur", "Lucknow", "Patna", "Bhopal", "Indore", "Chandigarh", "Kochi", "Thiruvananthapuram", "Mysore", "Mangalore", "Coimbatore", "Madurai", "Nagpur"];

const HEIGHTS = ["4ft 5in (134cm)", "4ft 6in (137cm)", "4ft 7in (139cm)", "4ft 8in (142cm)", "4ft 9in (144cm)", "5ft 0in (152cm)", "5ft 1in (154cm)", "5ft 2in (157cm)", "5ft 3in (160cm)", "5ft 4in (162cm)", "5ft 5in (165cm)", "5ft 6in (167cm)", "5ft 7in (170cm)", "5ft 8in (172cm)", "5ft 9in (175cm)", "5ft 10in (177cm)", "5ft 11in (180cm)", "6ft 0in (182cm)", "6ft 1in (185cm)", "6ft 2in (187cm)", "6ft 3in (190cm)", "6ft 4in (193cm)"];
const INCOMES = ["No Income", "INR 0 - 1 Lakh", "INR 1 Lakh - 2 Lakh", "INR 2 Lakh - 4 Lakh", "INR 4 Lakh - 7 Lakh", "INR 7 Lakh - 10 Lakh", "INR 10 Lakh - 15 Lakh", "INR 15 Lakh - 20 Lakh", "INR 20 Lakh - 30 Lakh", "INR 30 Lakh - 50 Lakh", "INR 50 Lakh - 1 Crore", "INR 1 Crore+"];

// Exhaustive Professional Designations List
const PROFESSIONS = [
  "Agriculture / Farming", "Architect", "Aviation Professional", "Banking Professional", "Business / Entrepreneur", 
  "Chartered Accountant", "Civil Engineer", "Civil Services (IAS/IPS)", "Consultant", "Data Scientist", 
  "Defence (Army/Navy/Airforce)", "Dentist", "DevOps Engineer", "Doctor", "Electrical Engineer", 
  "Financial Analyst", "Frontend Developer", "Full Stack Developer", "Govt Employee", "HR Professional", 
  "Interior Designer", "IT Consultant", "Lawyer", "Lecturer", "Marketing Manager", 
  "Mechanical Engineer", "Media / Entertainment", "Not Working", "Nurse", "Pharmacist", 
  "Physiotherapist", "Product Manager", "QA Engineer", "Research Scientist", "Sales Manager", 
  "Software Engineer", "Student", "Surgeon", "Teacher / Professor", "UI/UX Designer", 
  "Veterinarian", "Writer / Journalist", "Other Designations"
];

const EDUCATIONS = ["B.Tech / B.E.", "M.Tech / M.E.", "BCA", "MCA", "B.Sc", "M.Sc", "B.Com", "M.Com", "BBA", "MBA", "BA", "MA", "MBBS", "BDS", "MD / MS", "Ph.D", "Diploma", "High School", "Others"];

// --- UI ICONS ---
const UI_Icons = {
  ChevronDown: () => <svg className="ks-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>,
  Eye: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>,
  EyeOff: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>,
  ArrowRight: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
};

// --- STEP HEADER ICONS ---
const HeaderIcons = {
    User: () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
    IdCard: () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><circle cx="8" cy="10" r="3"></circle><line x1="14" y1="9" x2="20" y2="9"></line><line x1="14" y1="13" x2="20" y2="13"></line><line x1="5" y1="17" x2="11" y2="17"></line></svg>,
    Users: () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
    Shield: () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10"></polyline></svg>,
    MapPin: () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>,
    Heart: () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>,
    Book: () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>,
    Briefcase: () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>,
    Pen: () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path><path d="M2 2l7.586 7.586"></path><circle cx="11" cy="11" r="2"></circle></svg>
};

// Updated KsSelect to support Multi-Group Options and Top Cities
const KsSelect = ({ label, name, value, onChange, options, error, placeholder = "Select", groupedOptions }) => (
  <div className={`ks-input-block ks-stagger ${error ? 'ks-error-state' : ''}`}>
    <label className="ks-label">{label}</label>
    <div className="ks-select-box">
      <select name={name} value={value} onChange={onChange} className="ks-control">
        <option value="">{placeholder}</option>
        {groupedOptions ? (
          <>
            {groupedOptions.top && (
              <optgroup label="Frequently Used Cities">
                {groupedOptions.top.map((opt, idx) => (
                  <option key={`top-${idx}`} value={opt}>{opt}</option>
                ))}
              </optgroup>
            )}
            <optgroup label="Telangana">
              {groupedOptions.ts.map((opt, idx) => (
                <option key={`ts-${idx}`} value={opt}>{opt}</option>
              ))}
            </optgroup>
            <optgroup label="Andhra Pradesh">
              {groupedOptions.ap.map((opt, idx) => (
                <option key={`ap-${idx}`} value={opt}>{opt}</option>
              ))}
            </optgroup>
            <optgroup label="Other Major Cities">
              {groupedOptions.others.map((opt, idx) => (
                <option key={`oth-${idx}`} value={opt}>{opt}</option>
              ))}
            </optgroup>
          </>
        ) : (
          options?.map((opt, idx) => (
            <option key={idx} value={typeof opt === 'string' ? opt : opt.name}>{typeof opt === 'string' ? opt : opt.name}</option>
          ))
        )}
      </select>
      <UI_Icons.ChevronDown />
    </div>
    {error && <span className="ks-error-text">{error}</span>}
  </div>
);

const KsInput = ({ label, name, type="text", placeholder, value, onChange, error, autoComplete }) => (
  <div className={`ks-input-block ks-stagger ${error ? 'ks-error-state' : ''}`}>
    <label className="ks-label">{label}</label>
    <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} autoComplete={autoComplete} className="ks-control" />
    {error && <span className="ks-error-text">{error}</span>}
  </div>
);

const Register = () => {
  const [step, setStep] = useState(1);
  const [animDirection, setAnimDirection] = useState('ks-slide-fwd');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false); 
  const navigate = useNavigate(); 
  const [searchParams] = useSearchParams();
  const refId = searchParams.get('refId');
  const refName = searchParams.get('refName');

  const [masterCommunities, setMasterCommunities] = useState([]); 
  const [availableSubCommunities, setAvailableSubCommunities] = useState([]); 
  const sigRef = useRef(null); 
  const dobMonthRef = useRef(null);
  const dobYearRef = useRef(null);

  const [termsAccepted, setTermsAccepted] = useState(false);

  // Defaults injected here
  const [formData, setFormData] = useState({
    profileFor: 'Myself', gender: 'Male', firstName: '', lastName: '',
    dobDay: '', dobMonth: '', dobYear: '', religion: 'Hindu', community: '', country: 'India',
    email: '', password: '', mobileNumber: '', state: 'Telangana', city: '', subCommunity: '',
    maritalStatus: 'Never Married', height: '', diet: 'Veg',
    highestQualification: '', college: '', annualIncome: '', workWith: 'Private Company', workAs: '', companyName: ''
  });

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const response = await fetch('https://kalyanashobha-back.vercel.app/api/public/get-all-communities');
        const data = await response.json();
        if (data.success) {
          setMasterCommunities(data.data);
        }
      } catch (err) {
        console.error("Failed to load communities", err);
      }
    };
    fetchCommunities();
  }, []);

  const handleCommunityChange = (e) => {
    const selectedComm = e.target.value;
    setFormData({ ...formData, community: selectedComm, subCommunity: '' }); 
    
    const found = masterCommunities.find(c => c.name === selectedComm);
    if (found) {
      setAvailableSubCommunities(found.subCommunities || []);
    } else {
      setAvailableSubCommunities([]);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'community') {
      handleCommunityChange(e);
    } else {
      setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    }
    if (errors[name]) setErrors({ ...errors, [name]: '' });

    if (name === 'dobDay' && value.length === 2) dobMonthRef.current?.focus();
    if (name === 'dobMonth' && value.length === 2) dobYearRef.current?.focus();
  };

  const selectOption = (name, value) => {
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const clearSignature = () => sigRef.current.clear();

  const dataURLtoFile = (dataurl, filename) => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while(n--){ u8arr[n] = bstr.charCodeAt(n); }
    return new File([u8arr], filename, {type:mime});
  }

  const validateStep = (currentStep) => {
    let newErrors = {};
    let isValid = true;
    const require = (field, msg = "This field is required") => {
      if (!formData[field] || formData[field].toString().trim() === "") {
        newErrors[field] = msg;
        isValid = false;
      }
    };

    switch (currentStep) {
      case 1: require("profileFor"); require("gender"); break;
      case 2: require("firstName"); require("lastName"); require("dobDay"); require("dobMonth"); require("dobYear"); break;
      case 3: require("religion"); require("community"); require("subCommunity"); require("country"); break;
      case 4: 
        require("email");
        if (formData.email) {
            if (!/\S+@\S+\.\S+/.test(formData.email)) {
                newErrors.email = "Please enter a valid email";
                isValid = false;
            } else {
                const allowedDomains = ['gmail.com', 'yahoo.com', 'outlook.com'];
                const emailDomain = formData.email.split('@')[1].toLowerCase();
                if (!allowedDomains.includes(emailDomain)) {
                    newErrors.email = "Please use a standard provider (@gmail, @yahoo, @outlook)";
                    isValid = false;
                }
            }
        }
        require("password");
        if(formData.password && formData.password.length < 6) { newErrors.password = "Minimum 6 characters required"; isValid = false; }
        require("mobileNumber");
        break;
      case 5: require("state"); require("city"); break;
      case 6: require("maritalStatus"); require("height"); require("diet"); break;
      case 7: require("highestQualification"); require("college"); break;
      case 8: require("annualIncome"); require("workWith"); require("workAs"); require("companyName"); break;
      case 9:
        if (sigRef.current.isEmpty()) { toast.error("Please provide your signature."); isValid = false; }
        if (!termsAccepted) { toast.error("Please accept the Terms & Conditions."); isValid = false; }
        break;
      default: break;
    }
    setErrors(newErrors);
    return isValid;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setAnimDirection('ks-slide-fwd');
      setStep(step + 1);
    }
  };
  const prevStep = () => {
    setAnimDirection('ks-slide-bck');
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    if (!validateStep(9)) return;

    setLoading(true);
    const toastId = toast.loading("Processing profile setup..."); 

    try {
      const dobDate = new Date(`${formData.dobYear}-${formData.dobMonth}-${formData.dobDay}`);
      const signatureDataURL = sigRef.current.toDataURL("image/png");
      const signatureFile = dataURLtoFile(signatureDataURL, "signature.png");

      const data = new FormData();
      data.append('firstName', formData.firstName);
      data.append('lastName', formData.lastName);
      data.append('email', formData.email);
      data.append('password', formData.password);
      data.append('mobileNumber', formData.mobileNumber);
      data.append('profileFor', formData.profileFor);
      data.append('gender', formData.gender);
      data.append('dob', dobDate.toISOString());
      data.append('religion', formData.religion);
      data.append('community', formData.community);
      data.append('country', formData.country);
      data.append('state', formData.state);
      data.append('city', formData.city);
      if(formData.subCommunity) {
          data.append('subCommunity', formData.subCommunity);
          data.append('caste', formData.subCommunity);
      }
      data.append('maritalStatus', formData.maritalStatus);
      if(formData.diet) data.append('diet', formData.diet);
      const heightVal = parseInt(formData.height ? formData.height.match(/\d+/g)?.pop() || 0 : 0);
      data.append('height', heightVal);
      if(formData.highestQualification) data.append('highestQualification', formData.highestQualification);
      if(formData.college) data.append('collegeName', formData.college);

      let backendWorkType = '';
      if (formData.workWith === 'Private Company') backendWorkType = 'Private';
      else if (formData.workWith === 'Government / PSU' || formData.workWith === 'Defence') backendWorkType = 'Govt';
      else if (formData.workWith === 'Business / Self Employed') backendWorkType = 'Business';

      if (backendWorkType) data.append('workType', backendWorkType);
      if(formData.workAs) data.append('jobRole', formData.workAs);
      if(formData.companyName) data.append('companyName', formData.companyName);
      if(formData.annualIncome) data.append('annualIncome', formData.annualIncome);
      if (refId) { 
          data.append('referredByAgentId', refId); 
          data.append('referralType', "link"); 
      }
      if (refName) data.append('referredByAgentName', refName);
      data.append('digitalSignature', signatureFile);

      const response = await fetch('https://kalyanashobha-back.vercel.app/api/auth/register', {
        method: 'POST', body: data, 
      });

      const resText = await response.text();
      let resData;
      try { resData = JSON.parse(resText); } catch (jsonError) { throw new Error(`Server Error (${response.status})`); }

      if (!response.ok) throw new Error(resData.message || "Request failed");

      if (resData.success) {
        toast.success("Welcome to KalyanaShobha!", { id: toastId });
        setTimeout(() => { navigate('/login', { state: { savedEmail: formData.email } }); }, 1500);
      } else {
        throw new Error(resData.message || "Registration Failed");
      }
    } catch (error) {
      let displayMessage = error.message || "Connection Failed";

      if (displayMessage.includes('E11000') || displayMessage.includes('duplicate key')) {
        if (displayMessage.includes('mobileNumber')) {
          displayMessage = "This mobile number is already registered. Please use another number.";
        } else if (displayMessage.includes('email')) {
          displayMessage = "This email is already registered. Please use another email.";
        } else {
          displayMessage = "An account with these details already exists. Please try logging in.";
        }
      }

      toast.error(displayMessage, { id: toastId });
    } finally {
      setLoading(false);
    }

  };

  const renderStepIcon = (currentStep) => {
    const iconMap = {
        1: { Component: HeaderIcons.User, color: 'ks-icon-blue' },
        2: { Component: HeaderIcons.IdCard, color: 'ks-icon-purple' },
        3: { Component: HeaderIcons.Users, color: 'ks-icon-green' },
        4: { Component: HeaderIcons.Shield, color: 'ks-icon-gold' },
        5: { Component: HeaderIcons.MapPin, color: 'ks-icon-red' },
        6: { Component: HeaderIcons.Heart, color: 'ks-icon-pink' },
        7: { Component: HeaderIcons.Book, color: 'ks-icon-indigo' },
        8: { Component: HeaderIcons.Briefcase, color: 'ks-icon-teal' },
        9: { Component: HeaderIcons.Pen, color: 'ks-icon-dark' }
    };
    const { Component, color } = iconMap[currentStep] || iconMap[1];
    
    return (
        <div className={`ks-header-icon ks-stagger ${color}`}>
            <Component />
        </div>
    );
  };

  const renderStep = () => {
    return (
        <div key={step} className={`ks-form-body ${animDirection}`}>
            
            <div className="ks-title-area">
                {renderStepIcon(step)}
                <h2 className="ks-step-heading ks-stagger">
                    {step === 1 && "Create Account"}
                    {step === 2 && "Basic Details"}
                    {step === 3 && "Religion & Community"}
                    {step === 4 && "Contact & Security"}
                    {step === 5 && "Current Location"}
                    {step === 6 && "Personal Details"}
                    {step === 7 && "Education"}
                    {step === 8 && "Career & Lifestyle"}
                    {step === 9 && "Identity Verification"}
                </h2>
                {step === 1 && <p className="ks-step-sub ks-stagger">Let's start your journey to finding happiness.</p>}
                {step === 4 && <p className="ks-step-sub ks-stagger">An active email and phone number are required.</p>}
            </div>

            {step === 1 && (
                <>
                <h3 className="ks-group-title ks-stagger">This profile is for</h3>
                <div className="ks-grid-options ks-stagger">
                    {['Myself', 'My Son', 'My Daughter', 'My Brother', 'My Sister', 'Friend'].map((opt) => (
                    <button key={opt} type="button" className={`ks-opt-btn ${formData.profileFor === opt ? 'active' : ''}`} onClick={() => selectOption('profileFor', opt)}>{opt}</button>
                    ))}
                </div>
                <h3 className="ks-group-title ks-stagger">Gender</h3>
                <div className="ks-grid-options ks-stagger">
                    {['Male', 'Female'].map((gen) => (
                    <button key={gen} type="button" className={`ks-opt-btn ${formData.gender === gen ? 'active' : ''}`} onClick={() => selectOption('gender', gen)}>{gen}</button>
                    ))}
                </div>
                </>
            )}

            {step === 2 && (
                <>
                <KsInput label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} error={errors.firstName} placeholder="Enter your first name" />
                <KsInput label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} error={errors.lastName} placeholder="Enter your last name" />
                <div className={`ks-input-block ks-stagger ${errors.dobDay ? 'ks-error-state' : ''}`}>
                   <label className="ks-label">Date of Birth</label>
                   <div className="ks-dob-group">
                       <input type="text" inputMode="numeric" pattern="\d*" maxLength="2" name="dobDay" placeholder="DD" value={formData.dobDay} onChange={handleChange} className="ks-dob-input" />
                       <input type="text" inputMode="numeric" pattern="\d*" maxLength="2" name="dobMonth" placeholder="MM" value={formData.dobMonth} onChange={handleChange} ref={dobMonthRef} className="ks-dob-input" />
                       <input type="text" inputMode="numeric" pattern="\d*" maxLength="4" name="dobYear" placeholder="YYYY" value={formData.dobYear} onChange={handleChange} ref={dobYearRef} className="ks-dob-input" />
                   </div>
                   {(errors.dobDay || errors.dobMonth || errors.dobYear) && <span className="ks-error-text">Please enter a valid Date of Birth</span>}
                </div>
                </>
            )}

            {step === 3 && (
                <>
                <KsSelect label="Religion" name="religion" value={formData.religion} onChange={handleChange} error={errors.religion} options={RELIGIONS} />
                <KsSelect label="Community" name="community" value={formData.community} onChange={handleChange} error={errors.community} options={masterCommunities} />
                <KsSelect label="Sub-Community / Caste" name="subCommunity" value={formData.subCommunity} onChange={handleChange} error={errors.subCommunity} options={availableSubCommunities} />
                <KsSelect label="Country" name="country" value={formData.country} onChange={handleChange} error={errors.country} options={COUNTRIES} />
                </>
            )}

            {step === 4 && (
                <>
                <KsInput label="Email Address" name="email" type="email" value={formData.email} onChange={handleChange} error={errors.email} placeholder="name@example.com" />
                <div className={`ks-input-block ks-stagger ${errors.password ? 'ks-error-state' : ''}`}>
                    <label className="ks-label">Secure Password</label>
                    <div className="ks-password-wrap">
                        <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} placeholder="Minimum 6 characters" className="ks-control" />
                        <button type="button" className="ks-pwd-toggle" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <UI_Icons.EyeOff /> : <UI_Icons.Eye />}
                        </button>
                    </div>
                    {errors.password && <span className="ks-error-text">{errors.password}</span>}
                </div>
                <KsInput label="Mobile Number" name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} error={errors.mobileNumber} placeholder="+91 98765 43210" />
                </>
            )}

            {step === 5 && (
                <>
                <KsSelect label="State / Province" name="state" value={formData.state} onChange={handleChange} error={errors.state} options={STATES} />
                <KsSelect 
                  label="City / District" 
                  name="city" 
                  value={formData.city} 
                  onChange={handleChange} 
                  error={errors.city} 
                  options={[]} 
                  groupedOptions={{ top: TOP_CITIES, ts: TS_CITIES, ap: AP_CITIES, others: OTHER_CITIES }} 
                />
                </>
            )}

            {step === 6 && (
                <>
                <KsSelect label="Marital Status" name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} error={errors.maritalStatus} options={['Never Married', 'Divorced', 'Widowed', 'Awaiting Divorce']} />
                <KsSelect label="Height" name="height" value={formData.height} onChange={handleChange} error={errors.height} options={HEIGHTS} />
                <KsSelect label="Dietary Preference" name="diet" value={formData.diet} onChange={handleChange} error={errors.diet} options={['Veg', 'Non-Veg', 'Eggetarian', 'Jain', 'Vegan']} />
                </>
            )}

            {step === 7 && (
                <>
                <KsSelect label="Highest Qualification" name="highestQualification" value={formData.highestQualification} onChange={handleChange} error={errors.highestQualification} options={EDUCATIONS} />
                <KsInput label="College / University" name="college" value={formData.college} onChange={handleChange} error={errors.college} placeholder="e.g. IIT Bombay" />
                </>
            )}

            {step === 8 && (
                <>
                <KsSelect label="Annual Income" name="annualIncome" value={formData.annualIncome} onChange={handleChange} error={errors.annualIncome} options={INCOMES} />
                <KsSelect label="Employment Sector" name="workWith" value={formData.workWith} onChange={handleChange} error={errors.workWith} options={['Private Company', 'Government / PSU', 'Business / Self Employed', 'Defence', 'Not Working']} />
                <KsSelect label="Current Designation" name="workAs" value={formData.workAs} onChange={handleChange} error={errors.workAs} options={PROFESSIONS} />
                <KsInput label="Organization Name" name="companyName" value={formData.companyName} onChange={handleChange} error={errors.companyName} placeholder="e.g. Google, TCS" />
                </>
            )}

            {step === 9 && (
                <>
                <p className="ks-stagger ks-sig-instruct">Please provide your digital signature below to accept the Terms & Conditions.</p>
                <div className="ks-sig-wrapper ks-stagger">
                    <SignatureCanvas 
                        ref={sigRef}
                        penColor="#1A1A1A"
                        canvasProps={{ width: 340, height: 160, className: 'ks-sig-canvas' }}
                        backgroundColor="#FFFFFF"
                    />
                </div>
                <button className="ks-clear-sig ks-stagger" type="button" onClick={clearSignature}>
                    Clear Signature
                </button>
                <div className="ks-divider ks-stagger"></div>
                <div className="ks-terms-wrap ks-stagger">
                    <input type="checkbox" id="ks-terms" className="ks-checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} />
                   <label htmlFor="ks-terms" className="ks-terms-label">
    <span>I declare that the information provided is accurate and I accept the <span className="ks-highlight-red">Terms & Conditions</span> of KalyanaShobha.</span>
</label>

                </div>
                </>
            )}
        </div>
    );
  };

  return (
    <>
      <Navbar/>
      <Toaster position="top-center" toastOptions={{ style: { background: '#1F2937', color: '#fff', borderRadius: '10px' } }} />
      
      {/* Background Matrix Wrapper */}
      <div className="ks-main-wrapper">
          <div className="ks-auth-card">
            
            {/* Premium Progress Header */}
            <div className="ks-progress-header">
               <div className="ks-progress-text">Step {step} of 9</div>
               <div className="ks-progress-bar-container">
                  <div className="ks-progress-fill" style={{ width: `${(step / 9) * 100}%` }}></div>
               </div>
            </div>

            <div className="ks-form-content">
              <form onSubmit={step === 9 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>
                
                {renderStep()}
                
                <div className="ks-action-footer">
                  {step > 1 ? (
                    <button type="button" className="ks-btn ks-btn-secondary" onClick={prevStep} disabled={loading}>Back</button>
                  ) : (
                    <div></div> /* Empty div for flexbox spacing */
                  )}

                  {step === 9 ? (
                     <button type="submit" className="ks-btn ks-btn-primary" disabled={loading}>
                       {loading ? 'Submitting...' : 'Complete Profile'} <UI_Icons.ArrowRight />
                     </button>
                  ) : (
                     <button type="button" className="ks-btn ks-btn-primary" onClick={nextStep}>
                       Continue <UI_Icons.ArrowRight />
                     </button>
                  )}
                </div>
              </form>
            </div>

          </div>
      </div>
    </>
  );
};

export default Register;
