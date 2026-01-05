import React, { useState } from 'react';
import { X, CheckCircle } from 'lucide-react';

const ApplicationModal = ({ isOpen, onClose, jobTitle, onSuccess }) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    coverLetter: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSuccess) {
        onSuccess(`Successfully applied for: ${jobTitle}`);
    }
    setIsSubmitted(true);
  };

  const handleClose = () => {
    setIsSubmitted(false);
    setFormData({ fullName: '', email: '', coverLetter: '' });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl relative">
        <button onClick={handleClose} className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 transition-colors">
          <X size={24} />
        </button>

        {!isSubmitted ? (
          <>
            <h2 className="text-2xl font-black text-gray-900 text-center mb-8 italic uppercase tracking-tight">Apply for {jobTitle}</h2>
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Full Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" 
                  placeholder="Enter your full name" 
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                <input 
                  type="email" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none" 
                  placeholder="Enter your email (optional)" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Upload Resume (PDF) <span className="text-red-500">*</span></label>
                <input type="file" accept=".pdf" className="w-full text-sm text-gray-500 cursor-pointer" required />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Cover Letter</label>
                <textarea 
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none resize-none" 
                  placeholder="Tell us why you're a good fit (optional)" 
                  rows="4"
                  value={formData.coverLetter}
                  onChange={(e) => setFormData({...formData, coverLetter: e.target.value})}
                ></textarea>
              </div>

              <button type="submit" className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl hover:bg-blue-700 uppercase tracking-[0.2em] text-sm shadow-xl mt-4">
                Submit Application
              </button>
            </form>
          </>
        ) : (
          <div className="py-12 flex flex-col items-center text-center">
            <div className="bg-green-50 p-6 rounded-full mb-6"><CheckCircle className="text-green-500" size={64} /></div>
            <h2 className="text-3xl font-black text-gray-900 mb-2 italic">Success!</h2>
            <p className="text-gray-500 font-bold mb-8">Your application for <span className="text-blue-600">{jobTitle}</span> has been submitted.</p>
            <button onClick={handleClose} className="px-8 py-3 bg-gray-900 text-white font-black rounded-2xl uppercase tracking-widest text-xs">Close Window</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationModal; 