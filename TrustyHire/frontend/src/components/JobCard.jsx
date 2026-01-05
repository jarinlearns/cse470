import React from 'react';

const JobCard = ({ job, onApply }) => {
  return (
    <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col h-full hover:shadow-lg transition-all border-b-4 hover:border-blue-500">
      <div className="flex justify-between items-start mb-4">
        <div className="w-10 h-10 min-w-[2.5rem] rounded-lg overflow-hidden border border-gray-50 bg-white flex items-center justify-center p-1.5 shadow-sm">
          <img src={job.companyLogo} alt={job.companyName} className="w-full h-full object-contain" />
        </div>
        <span className="text-green-600 font-bold text-[9px] bg-green-50 px-2 py-0.5 rounded-md uppercase">
          {job.salary}
        </span>
      </div>

      <div className="mb-3">
        <h3 className="text-lg font-black text-gray-900 leading-tight italic line-clamp-1 uppercase">
          {job.title}
        </h3>
        <p className="text-blue-600 font-bold text-[10px] tracking-normal uppercase">
          {job.companyName}
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[9px] font-black rounded-sm uppercase">
          {job.location}
        </span>
        <span className="px-1.5 py-0.5 bg-red-50 text-red-600 text-[9px] font-black rounded-sm uppercase">
          {job.level}
        </span>
      </div>

      {/* ----- */}
      <p className="text-gray-500 text-[11px] leading-relaxed mb-6 flex-grow">
        {job.description}
      </p>
      {/* -------- */}

      <button 
        onClick={onApply} 
        className="w-full bg-blue-600 text-white font-black py-2.5 rounded-xl hover:bg-blue-700 transition-all uppercase text-[9px] tracking-widest shadow-md mt-auto"
      >
        Apply Now
      </button>
    </div>
  );
};

export default JobCard; 