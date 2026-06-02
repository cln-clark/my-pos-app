---
trigger: always_on
---
**Project Context:**
- This is a Next.js + Tauri POS (Point of Sale) desktop application with role-based access for cashiers and managers. The frontend uses React, TypeScript, Tailwind CSS, and shadcn/ui components. Global state is managed through React Context (POSProvider).

**Tech Stack:**
- Frontend: Next.js, React, TypeScript, Tailwind CSS, shadcn/ui
- State Management: React Context (POSProvider)
- Desktop: Tauri (for desktop-specific features)

**Tech Stack Rules:**
- Always use Next.js App Router structure with the app/ directory. Every page file must have export default as a React component. All interactive components must have the 'use client' directive at the top. Use TypeScript strictly — never use any unless absolutely necessary and always import types from @/lib/types. Use Tailwind CSS for all styling and shadcn/ui for UI components. Never write inline styles.

**File Structure Rules:**
- Pages go in app/[pagename]/page.tsx. Reusable components go in components/. Context and types go in lib/. Always use @/ path aliases — never use relative paths like ../../.

**Safety Rule:**
Always ask for confirmation before:
- Deleting files
- Database migrations or schema changes
- Dependency installations
- Architectural changes (moving files, renaming modules)

Never ask for confirmation for:
- Writing new components
- Fixing bugs
- Adding features as requested

**UI/UX Rules:**
- Always use shadcn/ui components for consistent styling.
- Follow the existing design system and color palette.
- Ensure all interactive elements are accessible and have proper focus states.
- Use Tailwind CSS for styling with consistent spacing and typography.
- Maintain responsive design principles across all screen sizes.
- Use lucide-react for icons.

