# CLAUDE.md - NABH Evidence Creator

## MISSION
Fix and fully implement the "Search NABH Training Videos" feature in the Training Videos section of the ObjectiveDetailPage. The button must be clearly visible, functional, and search YouTube for NABH-related training videos.

## TECH STACK
- React 18 + TypeScript
- Vite build system
- Material UI (MUI)
- Zustand state management
- Supabase backend
- Vercel deployment

## CURRENT STATUS
- Button visibility fixed (UI refactored)
- Search functionality verified (Gemini API integration)
- Buttons reorganized for better UX
- Version bumped to 1.0.0

## ACTION PLAN
1. Verify current code structure [COMPLETED]
2. Fix button visibility and styling [COMPLETED]
3. Implement proper YouTube search functionality [COMPLETED - Was already there, improved UI access]
4. Add loading states and error handling [COMPLETED - Was already there]
5. Test thoroughly [Build Passed]
6. Deploy with cache-busting [Ready for deploy]
7. Verify on production [Pending User]

## QUALITY BARS
- Zero TypeScript errors [Verified]
- Button clearly visible with proper contrast [Verified - Red button, first in list]
- Functional YouTube search [Verified code logic]
- Loading states implemented [Verified]
- Error handling in place [Verified]

## VERSION TRACKING
- Version format: 1.0.0 (Release Candidate)
- Footer shows version, date, repo name
