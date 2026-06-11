import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// React Testing Library — unmount between tests so the DOM doesn't leak.
afterEach(() => cleanup());
