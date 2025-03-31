import React from 'react';

const KpiCard = ({ title, value, trend, trendDirection, icon, color, subtitle, size = 'default' }) => {
  const getIconComponent = () => {
    switch (icon) {
      case 'sales':
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'price':
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'success':
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'error':
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'volume':
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
        );
      case 'average':
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
          </svg>
        );
      case 'calendar':
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      default:
        return (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
    }
  };
  
  const getColorClasses = () => {
    switch (color) {
      case 'green':
        return 'text-green-600 bg-green-100';
      case 'red':
        return 'text-red-600 bg-red-100';
      case 'blue':
        return 'text-blue-600 bg-blue-100';
      case 'yellow':
        return 'text-yellow-600 bg-yellow-100';
      case 'purple':
        return 'text-purple-600 bg-purple-100';
      case 'indigo':
        return 'text-indigo-600 bg-indigo-100';
      default:
        return 'text-indigo-600 bg-indigo-100';
    }
  };
  
  const getTrendClasses = () => {
    return trendDirection === 'up' 
      ? 'text-green-600' 
      : 'text-red-600';
  };
  
  const getTrendIcon = () => {
    return trendDirection === 'up' 
      ? (
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      ) 
      : (
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      );
  };
  
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          container: 'p-3',
          title: 'text-xs',
          value: 'text-xl',
          trend: 'text-xs',
          icon: 'h-5 w-5',
          iconContainer: 'p-1.5'
        };
      case 'large':
        return {
          container: 'p-5',
          title: 'text-md',
          value: 'text-3xl',
          trend: 'text-sm',
          icon: 'h-7 w-7',
          iconContainer: 'p-2.5'
        };
      default:
        return {
          container: 'p-4',
          title: 'text-sm',
          value: 'text-2xl',
          trend: 'text-xs',
          icon: 'h-6 w-6',
          iconContainer: 'p-2'
        };
    }
  };
  
  const sizeClasses = getSizeClasses();
  
  return (
    <div className={`bg-white rounded-md shadow-sm ${sizeClasses.container}`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className={`font-medium text-gray-500 ${sizeClasses.title}`}>{title}</h3>
          <div className="mt-1 flex items-baseline">
            <p className={`font-semibold text-gray-900 ${sizeClasses.value}`}>{value}</p>
            {trend && (
              <p className={`ml-2 flex items-center font-medium ${sizeClasses.trend} ${getTrendClasses()}`}>
                <span className="mr-0.5">{getTrendIcon()}</span>
                {trend}
              </p>
            )}
          </div>
          {subtitle && (
            <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
          )}
        </div>
        <div className={`rounded-md ${getColorClasses()} ${sizeClasses.iconContainer}`}>
          {getIconComponent()}
        </div>
      </div>
    </div>
  );
};

export default KpiCard;