import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 50"
      width="200"
      height="50"
      aria-labelledby="logoTitle"
      {...props}
    >
      <title id="logoTitle">Tarpaulin Manager Logo</title>
      <path
        d="M25,5 C35,5 40,15 40,25 C40,35 35,45 25,45 C15,45 10,35 10,25 C10,15 15,5 25,5 Z M25,10 C29.41,10 33,18.33 33,25 C33,31.67 29.41,40 25,40 C20.59,40 17,31.67 17,25 C17,18.33 20.59,10 25,10 Z"
        fill="currentColor"
      />
      <path d="M25,5 C24,15 20,20 10,25" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" />
      <text x="50" y="32" fontFamily="var(--font-headline, PT Sans)" fontSize="24" fill="currentColor" className="font-headline">
        Tarpaulin Manager
      </text>
    </svg>
  );
}
