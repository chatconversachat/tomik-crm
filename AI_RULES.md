# AI Rules for Tomik CRM

## Tech Stack
- React (v18.3.1) for building user interfaces
- TypeScript (v5.8.3) for static typing and type safety
- Tailwind CSS (v3.4.17) for styling components
- shadcn/ui (v1.0.0) for pre-built UI components
- Radix UI (v1.2.14) for accessible UI primitives
- React Router DOM (v6.30.1) for client-side routing
- TanStack Query (v5.83.0) for data fetching and caching
- Lucide React (v0.462.0) for icons
- Supabase (v2.76.1) for database and authentication
- Vite (v5.4.19) for build tooling

## Library Usage Guidelines

### UI Components
- **shadcn/ui**: Use for all buttons, inputs, cards, and other UI elements. Always import from `@/components/ui/`.
- **Radix UI**: Use for low-level accessible components when needed (e.g., dropdowns, tooltips).
- **Lucide React**: Use for icons. Always import from `lucide-react`.

### State Management
- **React Hooks**: Use `useState`, `useReducer`, and `useContext` for component state.
- **TanStack Query**: Use for data fetching, caching, and state management of API responses.

### Routing
- **React Router DOM**: Use for client-side routing. Always define routes in `src/App.tsx`.

### Forms
- **react-hook-form**: Use for form handling and validation. Import resolvers from `@hookform/resolvers`.

### UI Libraries
- **@dnd-kit/core**: Use for drag-and-drop functionality.
- **recharts**: Use for charts and data visualization.
- **date-fns**: Use for date manipulation.

### Styling
- **Tailwind CSS**: Use utility classes for styling. Do not use custom CSS unless absolutely necessary.
- **cn function**: Use the `cn` function from `@radix-ui/react-slot` for conditional class names.

### Database & API
- **Supabase**: Use for database operations and authentication. Always use the `supabase` client from `@/integrations/supabase/client`.
- **Edge Functions**: Use Supabase edge functions for server-side operations (e.g., AI chat, invoice generation).

### Testing
- **Jest**: Use for unit testing.
- **React Testing Library**: Use for component testing.

### Deployment
- **Vite**: Use Vite for building and deploying the application.
- **Lovable**: The application is deployed via Lovable. Do not deploy manually.

### Accessibility
- Follow WCAG 2.1 guidelines for accessibility.
- Use semantic HTML and ARIA attributes when needed.
- Ensure sufficient color contrast.

### Performance
- Use React.memo for memoizing components when necessary.
- Implement lazy loading for components that are not on the initial route.
- Use code splitting with Vite.

### Error Handling
- Do not catch errors unless specifically requested by the user.
- Let errors bubble up so they can be handled by the AI.

### File Structure
- Keep the `src` directory organized. Do not put files in the root of `src`.
- Follow the directory structure: `src/pages/`, `src/components/`, `src/hooks/`, `src/utils/`.

### Environment Variables
- Use `.env` for environment variables. Prefix with `VITE_` for Vite to pick them up.

### Deployment
- The app is deployed via Lovable. Do not deploy manually unless specified.

### Code Quality
- Use ESLint and Prettier for code formatting and linting.
- Follow the provided coding style and conventions.

### Accessibility
- Follow accessibility best practices. Use semantic HTML and ARIA attributes where necessary.

### Performance
- Use React.memo for memoizing components when necessary.
- Implement lazy loading for components that are not on the initial route.
- Use code splitting with Vite.

### Error Handling
- Do not catch errors unless specifically requested by the user.
- Let errors bubble up so they can be handled by the AI.