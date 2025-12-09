
// trustyhire-frontend/src/components/AddExperience.jsx
import React from 'react';

const AddExperience = ({ experience, index, handleChange, handleRemove }) => {
  return (
    <div className="border border-gray-300 p-4 rounded-lg mb-4 bg-gray-50">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-lg font-semibold text-indigo-700">Experience #{index + 1}</h4>
        <button
          type="button"
          onClick={() => handleRemove(index)}
          className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition"
        >
          Remove
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Job Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Title*</label>
          <input
            type="text"
            name="title"
            value={experience.title || ''}
            onChange={(e) => handleChange(index, e)}
            required
            className="w-full p-2 border rounded mt-1"
          />
        </div>
        
        {/* Company */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Company*</label>
          <input
            type="text"
            name="company"
            value={experience.company || ''}
            onChange={(e) => handleChange(index, e)}
            required
            className="w-full p-2 border rounded mt-1"
          />
        </div>

        {/* From Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700">From Date*</label>
          <input
            type="date"
            name="from"
            value={experience.from ? new Date(experience.from).toISOString().split('T')[0] : ''}
            onChange={(e) => handleChange(index, e)}
            required
            className="w-full p-2 border rounded mt-1"
          />
        </div>

        {/* Current Job Checkbox */}
        <div className="flex items-center mt-6">
          <input
            id={`current-${index}`}
            type="checkbox"
            name="current"
            checked={experience.current || false}
            onChange={(e) => handleChange(index, e)}
            className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
          />
          <label htmlFor={`current-${index}`} className="ml-2 text-sm text-gray-900">
            Currently working here
          </label>
        </div>

        {/* To Date (Optional, hidden if current is checked) */}
        {!experience.current && (
          <div>
            <label className="block text-sm font-medium text-gray-700">To Date</label>
            <input
              type="date"
              name="to"
              value={experience.to ? new Date(experience.to).toISOString().split('T')[0] : ''}
              onChange={(e) => handleChange(index, e)}
              className="w-full p-2 border rounded mt-1"
            />
          </div>
        )}
      </div>
      
      {/* Description */}
      <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">Job Description</label>
          <textarea
            name="description"
            value={experience.description || ''}
            onChange={(e) => handleChange(index, e)}
            rows="2"
            className="w-full p-2 border rounded mt-1"
          ></textarea>
      </div>

    </div>
  );
};

export default AddExperience;