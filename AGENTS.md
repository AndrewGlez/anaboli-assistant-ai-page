# AGENTS.md

## Project Structure

This is a React chat application built with Vite, TypeScript, and Tailwind CSS.

- `src/` - Main source code
  - `components/` - React components (including ErrorFallback/)
  - `config/` - Application configuration singletons
  - `context/` - React context providers (split state/dispatch pattern)
  - `errors/` - Custom error classes
  - `hooks/` - Custom hooks
  - `services/` - API services
  - `test/` - Test setup and utilities
  - `types/` - TypeScript type definitions
  - `utils/` - Utility functions and constants
- `public/` - Static assets
- `package.json` - Dependencies and scripts
- `vite.config.ts` - Vite configuration
- `tailwind.config.js` - Tailwind CSS configuration

## Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run test:coverage` - Run tests with coverage
- `npm run test:ui` - Run tests with UI

## Conventions

- Use TypeScript strict mode
- Follow React functional components with hooks
- Use Tailwind CSS for styling
- Memoize components with React.memo when appropriate
- Use split context pattern (state + dispatch contexts)
- Add tests for new features
- Follow accessibility best practices
- Centralize configuration in src/config/
- Use path aliases (@/, @components/, etc.) for imports
- Run lint before committing
- Use semantic commit messages

## Developer Tools

- ESLint for linting
- TypeScript for type checking
- Vite for fast development
- Vitest for testing
- Husky for pre-commit hooks
- lint-staged for running linters on staged files