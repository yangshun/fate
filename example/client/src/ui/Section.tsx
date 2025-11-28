import { ReactNode } from 'react';
import { VStack } from '@nkzw/stack';
import cx from '../lib/cx.tsx';

export default function Section({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <VStack as="section" className={cx('max-w-8xl container mx-auto p-8', className)} gap>
      {children}
    </VStack>
  );
}
