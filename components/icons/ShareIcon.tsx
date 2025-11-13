import React from 'react';

export const ShareIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={1.5} 
        stroke="currentColor" 
        {...props}
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.195.025.39.042.586.05a2.25 2.25 0 0 1 2.25 2.25v.109c0 .41-.164.79-.44 1.082a2.25 2.25 0 1 0-2.618 2.618m0-4.8a2.25 2.25 0 0 0-2.618-2.618m2.618 2.618c.41.164.79.44 1.082.44h.109a2.25 2.25 0 0 0 2.25-2.25v-.109c0-.196-.017-.39-.05-.586m-2.25 2.25a2.25 2.25 0 0 0 2.25-2.25m0 0a2.25 2.25 0 0 0-2.25-2.25m2.25 2.25v.109c0 .196-.017.39-.05.586m0-2.186a2.25 2.25 0 0 0-2.25-2.25m0 0a2.25 2.25 0 0 0-2.25 2.25m0 0v.109c0 .196.017.39.05.586" />
    </svg>
);
