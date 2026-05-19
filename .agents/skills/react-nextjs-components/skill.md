---
name: react-nextjs-components
description: Guidelines for using React components within a Next.js project. This includes best practices for component structure, styling, and breaking down components into smaller, reusable pieces.
---

# React Next.js Components Checklist

Use this checklist when building or reviewing React components in this Next.js project.

## Structure

- [ ] Use functional components instead of class components.
- [ ] Name components in `PascalCase`.
- [ ] Keep files organized by feature or component group.
- [ ] Define clear props and use TypeScript for prop typing.

## Styling

- [ ] Prefer `tailwindcss` for component styling.
- [ ] Use CSS Modules only when component-scoped CSS is necessary.
- [ ] Use Next.js `Image` for optimized images.
- [ ] Prefer `lucide-react` for icons.
- [ ] Ensure components work well across screen sizes.

## Reusability

- [ ] Break large components into smaller reusable pieces.
- [ ] Share repeated logic with custom hooks or HOCs where appropriate.
- [ ] Prefer composition over tightly coupled component APIs.
- [ ] Avoid excessive prop drilling by using context when justified.
- [ ] Add or update tests for component behavior when needed.

## Design System

- [ ] Use `shadcn/ui` components to maintain consistency.
- [ ] Preserve the existing design language across the app.
- [ ] Ask for approval before making notable design system customizations.
- [ ] Document component usage when the component is shared or non-obvious.
