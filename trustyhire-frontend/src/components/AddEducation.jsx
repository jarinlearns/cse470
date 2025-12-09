// trustyhire-frontend/src/components/AddEducation.jsx
import React from 'react';

const AddEducation = ({ education, index, handleChange, handleRemove }) => {
  return (
    <div className="border border-gray-300 p-4 rounded-lg mb-4 bg-gray-50">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-lg font-semibold text-indigo-700">Education #{index + 1}</h4>
        <button
          type="button"
          onClick={() => handleRemove(index)}
          className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition"
        >
          Remove
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* School / Institution */}
        <div>
          <label className="block text-sm font-medium text-gray-700">School / University*</label>
          <input
            type="text"
            name="school"
            value={education.school || ''}
            onChange={(e) => handleChange(index, e)}
            required
            className="w-full p-2 border rounded mt-1"
          />
        </div>
        
        {/* Degree */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Degree / Certificate*</label>
          <input
            type="text"
            name="degree"
            value={education.degree || ''}
            onChange={(e) => handleChange(index, e)}
            required
            className="w-full p-2 border rounded mt-1"
          />
        </div>

        {/* Field of Study */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Field of Study*</label>
          <input
            type="text"
            name="fieldofstudy"
            value={education.fieldofstudy || ''}
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
            value={education.from ? new Date(education.from).toISOString().split('T')[0] : ''}
            onChange={(e) => handleChange(index, e)}
            required
            className="w-full p-2 border rounded mt-1"
          />
        </div>

        {/* To Date (Optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700">To Date (or Expected)</label>
          <input
            type="date"
            name="to"
            value={education.to ? new Date(education.to).toISOString().split('T')[0] : ''}
            onChange={(e) => handleChange(index, e)}
            className="w-full p-2 border rounded mt-1"
          />
        </div>
      </div>
      
      {/* Description */}
      <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">Activities / Description</label>
          <textarea
            name="description"
            value={education.description || ''}
            onChange={(e) => handleChange(index, e)}
            rows="2"
            className="w-full p-2 border rounded mt-1"
          ></textarea>
      </div>

    </div>
  );
};

export default AddEducation;