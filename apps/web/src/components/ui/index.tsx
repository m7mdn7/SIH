import React from 'react';
import { cn } from '../../lib/utils';

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("bg-white rounded-none shadow-sm border border-slate-200 overflow-hidden", className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-6 py-5 border-b border-slate-100", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("text-lg font-semibold text-slate-900 leading-tight", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("p-6", className)} {...props}>
      {children}
    </div>
  );
}

export function Badge({ children, variant = 'default', className, ...props }: React.HTMLAttributes<HTMLSpanElement> & { variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' }) {
  const variants = {
    default: "bg-slate-100 text-slate-800",
    success: "bg-emerald-100 text-emerald-800",
    warning: "bg-orange-100 text-orange-800",
    danger: "bg-red-100 text-red-800",
    info: "bg-blue-100 text-blue-800"
  };
  
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-none text-xs font-medium uppercase tracking-wider", variants[variant], className)} {...props}>
      {children}
    </span>
  );
}

export function Button({ children, variant = 'primary', className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'ghost' }) {
  const baseStyle = "inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-none uppercase tracking-wider focus:outline-none focus:ring-0 focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm",
    secondary: "bg-slate-800 text-white hover:bg-slate-900",
    outline: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
    ghost: "bg-transparent text-slate-700 hover:bg-slate-100"
  };

  return (
    <button className={cn(baseStyle, variants[variant], className)} {...props}>
      {children}
    </button>
  );
}

export function Progress({ value, className, ...props }: React.HTMLAttributes<HTMLDivElement> & { value: number }) {
  return (
    <div className={cn("w-full bg-slate-200 rounded-none h-2.5 overflow-hidden", className)} {...props}>
      <div 
        className="bg-emerald-600 h-2.5 rounded-none" 
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      ></div>
    </div>
  );
}
