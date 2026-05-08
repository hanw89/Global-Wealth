# Project Rules - Global Wealth

This document defines the development standards and architectural guidelines for the Global Wealth project.

## Tech Stack
- **Frontend**: React 19 (Vite)
- **Styling**: Tailwind CSS 4
- **Backend/Database**: Supabase
- **State Management**: TanStack Query (Server State), React Context (Local State)
- **Icons**: Lucide React
- **Charts**: Recharts

## Directory Structure
- `src/components`: Generic, reusable UI components.
- `src/features`: Feature-specific logic, components, and hooks.
- `src/hooks`: Global custom hooks.
- `src/lib`: Third-party library configurations (e.g., Supabase client).
- `src/services`: API calls and data fetching logic.
- `src/context`: React Context providers.
- `src/utils`: Helper functions.

## Development Guidelines
1. **Component Pattern**: Use functional components with hooks. Prefer named exports.
2. **Naming Conventions**:
   - Components: `PascalCase.jsx`
   - Hooks: `useCamelCase.js`
   - Utilities/Services: `camelCase.js`
3. **Styling**: Use Tailwind CSS 4 utility classes. Avoid inline styles unless necessary for dynamic values.
4. **Data Fetching**: Use TanStack Query for all asynchronous data fetching and mutations.
5. **State Management**: Keep state as local as possible. Use React Context for global UI state only.
6. **Supabase**: All database interactions should be centralized in the `src/services` directory.

## AI Instructions
- Maintain documentation integrity.
- Follow the established directory structure.
- Always use Tailwind CSS for styling.
- Prioritize performance and accessibility.
