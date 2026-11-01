# Platform QA — 2026-11-01

Both repositories: 17 automated tests passed; production build passed. Browser checks covered sample playback/progress, watchlist, guided draft reload, real video export, ZIP restore, bilingual switching, preserved project filtering, and a real cross-site film handoff/return. Mobile 320/390 widths had no horizontal overflow.

## Design comparison

Concepts: design/platform-home-concept.png and design/creator-concept.png (BlueFruit repository). Compared both with latest IAB captures using view_image.

| Point | Reference and render | Resolution |
| --- | --- | --- |
| Hierarchy | Full-width cinema hero, short headline, watch/create actions | Preserved |
| Palette | Navy surface and pale blue actions | Shared explicit CSS tokens |
| Typography | Editorial Chinese headings, compact utility controls | Explicit heading/control styles; no browser-default controls |
| Workflow | Story, storyboard, image/audio, export | Four real editable stages |
| Containers | Open content rails and two-column creator | Preserved, stacked on mobile |
| Media | Concept imagined film stills/titles/durations | Replaced with real existing sample frames, names and durations to avoid false catalog claims |
| Copy | Hero and creator title/subtitle/actions | Preserved; returning viewers see Continue watching and saved progress |
| Assets | Concept planet scene and sample narration | Existing owned planet artwork reused; original ambient audio replaces unlicensed/sample voice |

Intentional functional deviations: shared navigational header across screens, simpler accessible progress buttons, saved-progress strip, honest concept-art disclosure, original catalog titles instead of generated fictional names. These preserve the design direction while reflecting available content and actual state. No claim of pixel-identical reproduction.

Native-size viewport overrides were attempted at 1434×1096 and 1672×941; IAB compositor captures remained at the current 1265×712 output. Current desktop capture and separate mobile checks were reviewed. Screenshots saved in the Codex visualization folder for this chat.

Cloud SQL, private storage, JWT verification, quotas and moderation endpoints have automated coverage. The free Supabase project is now provisioned and integration-tested, with server credentials stored as encrypted Vercel production variables. GitHub is the enabled public provider; email login remains disabled because custom SMTP has not been configured. Images remain disabled due provider quota limitations.

Update: free Supabase project lknxzljgongrnixugfav created and schema migration executed successfully. GitHub OAuth application created; provider credential setup is waiting for GitHub identity verification. Twenty automated tests now pass, including browser-bound PKCE callback exchange and rejection cases. Account services remain gated until real sign-in and storage verification.

## Live cloud verification

Free Supabase project lknxzljgongrnixugfav is healthy. Migration succeeded. GitHub OAuth provider and six exact production redirect entries are configured. Both production domains return configured=true and GitHub=true, email=false.

Two real temporary identities verified private upload, own listing/download, denial of cross-user and anonymous reads, direct RLS filtering, and rejected forged storage paths. Real pending submissions, owner-only review, approval, withdrawal and retained private originals passed. Durable daily quota denied the sixth reservation without contacting an AI provider.

Both deployed Vercel APIs independently passed authenticated project save/list and byte-exact private ZIP downloads. Verification identities and artifacts were removed. Twenty automated tests pass per repository.

The browser OAuth flow reached GitHub consent with only user:email scope. The user must approve their own account association before the final real-user callback and guided cloud UI checks can complete. No repository scope is requested.
