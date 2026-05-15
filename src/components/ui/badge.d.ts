import React from 'react';

export declare function Badge(props: {
  className?: string;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link';
  render?: React.ReactElement | ((props: React.HTMLAttributes<any>, state: any) => React.ReactElement) | null;
  children?: React.ReactNode;
  [key: string]: any;
}): React.ReactElement;

export declare const badgeVariants: (props?: { variant?: string }) => string;
