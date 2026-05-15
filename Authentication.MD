🌟 Core Authentication Infrastructure
   * Role-Based Access Control (RBAC):
       * Strict differentiation between admin (builder editors) and user (site visitors).
       * Updated all builder APIs and stores to enforce admin role checks.
       * Existing users and invited editors are automatically assigned the admin role.
   * CMS User Synchronization:
       * Implemented userSyncService.ts to mirror Supabase Auth users into a system "Users" collection in the CMS.
       * Supports bidirectional sync of Email, Name, Avatar, and Role.
       * Includes a migration (20260515000001_initialize_auth_system.ts) to auto-sync existing admins.
   * Auth Localisation Service:
       * Implemented authLocalisationService.ts to manage translatable auth messages.
       * All error/success messages (e.g., "Invalid credentials") are stored in the database and context-aware (supports multi-language sites).

  ---

  🎨 New UI Builder Components
   * User Status Component:
       * States: Automatically toggles between a "Log in" button and a User Avatar Menu.
       * Interactive Dropdown: Displays user details, custom profile links, and a secure Logout button.
   * Login Form Template:
       * Pre-configured form with Email and Password fields.
       * Supports custom "Success Redirect" page.
   * Registration Form Template:
       * Highly customizable form for new user signups.
       * Supports custom "Success Redirect" page.
   * Social Login Button:
       * Configurable button for Supabase OAuth providers (Google, GitHub).

  ---

  ⚙️ Settings & Logic
   * Page-Level Protection:
       * "Require login" toggle: Restricts access to specific pages or entire folders to logged-in users only.
       * Login Redirect Page: Global and per-page setting to define where unauthenticated visitors are sent.
   * Granular Field Mapping:
       * Added "CMS Field" mapping to the Sidebar for all Input/Checkbox/Radio elements.
       * Allows admins to decide exactly which custom user data to collect during registration.
   * "Current User" Collection Filter:
       * Added a high-level "Filter by logged-in user" toggle for Collection Lists.
       * Enables easy building of private "My Profile" pages.

  ---

  📂 Commit File Audit
  To have a complete and clean commit, you should include the following 38 files (ignoring GEMINI.md, conductor/, and supabase/ if you don't want local config/history in the repo):

  New Files (12)
   1. app/(builder)/ycode/components/AuthSettings.tsx (Sidebar UI)
   2. app/(builder)/ycode/settings/auth/page.tsx (Global Auth Settings Page)
   3. app/api/auth/login/route.ts (Login API)
   4. app/api/auth/register/route.ts (Registration API)
   5. app/api/auth/me/route.ts (Session & Profile API)
   6. app/api/auth/logout/route.ts (Logout API)
   7. components/layers/AuthForm.tsx (Form Logic)
   8. components/layers/UserStatus.tsx (Profile Menu)
   9. components/ui/avatar.tsx (Avatar UI Primitive)
   10. database/migrations/20260515000001_initialize_auth_system.ts (System Setup)
   11. lib/auth-constants.ts (Shared constants)
   12. lib/services/authLocalisationService.ts & userSyncService.ts (Core Services)
   13. lib/templates/auth.ts (Builder Block Templates)

  Modified Files (26)
   * Core Logic: lib/supabase-auth.ts, lib/page-auth.ts, lib/page-fetcher.ts, stores/useAuthStore.ts, types/index.ts.
   * Builder UI: app/(builder)/ycode/components/RightSidebar.tsx, PageSettingsPanel.tsx, InputSettings.tsx, ElementLibrary.tsx, CollectionFiltersSettings.tsx,
     lib/settings-nav-items.ts.
   * Rendering: components/LayerRenderer.tsx, components/LayerRendererPublic.tsx, components/PageRenderer.tsx, components/FilterableCollection.tsx.
   * Repositories: lib/repositories/collectionItemRepository.ts, lib/repositories/collectionRepository.ts.
   * APIs: app/(builder)/ycode/api/auth/invite/route.ts, api/auth/users/route.ts, api/collections/[id]/items/filter/route.ts, and profile/* routes.
   * UI Primitives: components/ui/icon.tsx.

  > Note: I recommend excluding GEMINI.md, the conductor/ folder (my plan history), and the supabase/ folder (local docker config) from your main feature commit unless you want them
  versioned.
