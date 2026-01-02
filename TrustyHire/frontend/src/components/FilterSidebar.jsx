import React from 'react';

const FilterSidebar = () => {
  const categories = [
    "Programming", "Data Science", "Designing", 
    "Networking", "Management", "Marketing", "Cybersecurity"
  ];

  const locations = [
    "Bangladesh", "Washington", "Remote", "Seattle", "New York", "Dubai"
  ];

  const FilterGroup = ({ title, items }) => (
    <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
      <h3 className="text-lg font-black text-gray-900 mb-5 italic tracking-tight">{title}</h3>
      <div className="space-y-4">
        {items.map((item, index) => (
          <label key={index} className="flex items-center group cursor-pointer">
            <div className="relative flex items-center">
              <input 
                type="checkbox" 
                className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 checked:bg-blue-600 checked:border-blue-600 transition-all" 
              />
              <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
            </div>
            <span className="ml-3 text-gray-600 font-bold text-sm group-hover:text-blue-600 transition-colors">
              {item}
            </span>
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <FilterGroup title="Search by Categories" items={categories} />
      <FilterGroup title="Search by Locations" items={locations} />
    </div>
  );
};

export default FilterSidebar;