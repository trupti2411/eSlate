import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock the toast hook (no Toaster mounted in tests).
vi.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: vi.fn() }) }));

// Mock the API layer: apiRequest is used for the school typeahead + the POST.
vi.mock('@/lib/queryClient', () => ({
  apiRequest: vi.fn(async (url: string) => {
    if (url.includes('/api/schools/search')) {
      return { schools: [{ name: 'Sydney Public School', suburb: 'Sydney', state: 'NSW' }] };
    }
    return { id: 99 };
  }),
}));

import StudentFormModal, { ageFromDob, dobDisplay } from './StudentFormModal';
import { apiRequest } from '@/lib/queryClient';

function renderModal(props: Partial<React.ComponentProps<typeof StudentFormModal>> = {}) {
  const qc = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        // Year-group dropdown data (the only useQuery without an explicit fn).
        queryFn: async ({ queryKey }) => {
          const k = String(queryKey[0]);
          if (k.includes('/api/year-groups')) {
            return [{ id: 1, state_code: 'NSW', order: 5, label: 'Year 5', code: 'Y5' }];
          }
          return [];
        },
      },
    },
  });
  return render(
    <QueryClientProvider client={qc}>
      <StudentFormModal mode="add" businessId="16" onClose={() => {}} {...props} />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ESLATE-5 — Add Student form', () => {
  // ---- AC-1: Birth date calendar with quick year navigation + DD/MM/YYYY ----
  describe('AC-1 birth-date calendar', () => {
    it('renders a calendar picker, not a plain text/date input', () => {
      const { container } = renderModal();
      // No native date input — the AC requires a calendar UI.
      expect(container.querySelector('input[type="date"]')).toBeNull();
      // Calendar trigger present with a clear placeholder.
      expect(screen.getByText('Select date of birth')).toBeInTheDocument();
    });

    it('formats the selected date as DD/MM/YYYY', () => {
      expect(dobDisplay('2015-03-12')).toBe('12/03/2015');
    });
  });

  // ---- AC-2: Age < 5 non-blocking warning ----
  describe('AC-2 age warning', () => {
    it('computes age from a date of birth', () => {
      const recent = new Date();
      recent.setFullYear(recent.getFullYear() - 3);
      expect(ageFromDob(recent.toISOString().slice(0, 10))).toBe(3);

      const older = new Date();
      older.setFullYear(older.getFullYear() - 10);
      expect(ageFromDob(older.toISOString().slice(0, 10))).toBe(10);
    });
  });

  // ---- AC-3: Address required ----
  describe('AC-3 address required', () => {
    it('shows an inline "Address is required" error on empty submit', async () => {
      const user = userEvent.setup();
      renderModal();
      await user.click(screen.getByRole('button', { name: /add student/i }));
      expect(await screen.findByText('Address is required')).toBeInTheDocument();
    });
  });

  // ---- AC-4: School searchable dropdown, min 2 chars ----
  describe('AC-4 school typeahead', () => {
    it('does NOT search until at least 2 characters are typed', async () => {
      const user = userEvent.setup();
      renderModal();
      const school = screen.getByPlaceholderText(/start typing a school name/i);
      await user.type(school, 'S');
      // Debounce window; still under 2 chars → no API call.
      await new Promise(r => setTimeout(r, 350));
      expect(apiRequest).not.toHaveBeenCalledWith(
        expect.stringContaining('/api/schools/search'), expect.anything(),
      );
    });

    it('queries the schools API once 2+ characters are typed', async () => {
      const user = userEvent.setup();
      renderModal();
      const school = screen.getByPlaceholderText(/start typing a school name/i);
      await user.type(school, 'Syd');
      await waitFor(() => {
        expect(apiRequest).toHaveBeenCalledWith(
          expect.stringContaining('/api/schools/search'), 'GET',
        );
      }, { timeout: 1500 });
    });
  });

  // ---- AC-5: full submission check ----
  describe('AC-5 form validation', () => {
    it('blocks submit and shows required-field errors when empty', async () => {
      const user = userEvent.setup();
      renderModal();
      await user.click(screen.getByRole('button', { name: /add student/i }));

      expect(await screen.findByText('First name is required')).toBeInTheDocument();
      expect(screen.getByText('Last name is required')).toBeInTheDocument();
      expect(screen.getByText('Year group is required')).toBeInTheDocument();
      expect(screen.getByText('Date of birth is required')).toBeInTheDocument();
      expect(screen.getByText('Address is required')).toBeInTheDocument();

      // Must NOT have POSTed the student.
      expect(apiRequest).not.toHaveBeenCalledWith(
        '/api/businesses/16/students', 'POST', expect.anything(),
      );
    });

    it('marks required fields with an asterisk', () => {
      renderModal();
      // First name / Last name / Year group / DOB / Address all carry a "*".
      const asterisks = screen.getAllByText('*');
      expect(asterisks.length).toBeGreaterThanOrEqual(5);
    });
  });
});
