/**
 * Typed constants matching docs/SEED_DATA.md exactly.
 * Single source of truth for all test credentials and known data.
 */

export const USERS = {
  acmeAdmin: {
    name: 'Acme Admin',
    email: 'admin@acme.com',
    password: 'Password123!',
    role: 'ORG_ADMIN' as const,
    org: 'acme',
  },
  acmeManager: {
    name: 'Acme Manager',
    email: 'manager@acme.com',
    password: 'Password123!',
    role: 'MANAGER' as const,
    org: 'acme',
  },
  acmeEmployee: {
    name: 'Acme Employee',
    email: 'employee@acme.com',
    password: 'Password123!',
    role: 'EMPLOYEE' as const,
    org: 'acme',
  },
  globexAdmin: {
    name: 'Globex Admin',
    email: 'admin@globex.com',
    password: 'Password123!',
    role: 'ORG_ADMIN' as const,
    org: 'globex',
  },
  globexEmployee: {
    name: 'Globex Employee',
    email: 'employee@globex.com',
    password: 'Password123!',
    role: 'EMPLOYEE' as const,
    org: 'globex',
  },
} as const;

export const ORGANIZATIONS = {
  acme: { name: 'Acme Corp', slug: 'acme' },
  globex: { name: 'Globex', slug: 'globex' },
} as const;

export const DEPARTMENTS = {
  acme: ['Engineering', 'HR', 'Sales'],
  globex: ['Engineering', 'Support'],
} as const;

export const ARTICLES = {
  acme: [
    {
      title: 'Employee Onboarding Guide',
      status: 'PUBLISHED' as const,
      department: 'HR',
      tags: 'onboarding,hr,policy',
    },
    {
      title: 'VPN Access Setup',
      status: 'PUBLISHED' as const,
      department: 'Engineering',
      tags: 'vpn,it,onboarding',
    },
    {
      title: 'Quarterly Sales Process',
      status: 'DRAFT' as const,
      department: 'Sales',
      tags: 'sales,process,q1',
    },
  ],
  globex: [
    {
      title: 'Support Escalation Process',
      status: 'PUBLISHED' as const,
      department: 'Support',
      tags: 'support,incident,process',
    },
  ],
} as const;

// Convenience: a fresh article payload for creation tests
export function buildArticle(overrides: Partial<{
  title: string;
  content: string;
  tags: string;
  status: 'DRAFT' | 'PUBLISHED';
  department_id: number | null;
}> = {}) {
  return {
    title: 'Test Article',
    content: 'This is test article content.',
    tags: 'test,automation',
    status: 'DRAFT' as 'DRAFT' | 'PUBLISHED',
    department_id: null,
    ...overrides,
  };
}
