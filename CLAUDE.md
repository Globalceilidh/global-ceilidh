# GlobalCeilidh.com — Project Briefing

## WHO I AM
I'm Whitey, building GlobalCeilidh.com and LewisHighlandGroup.com under Lewis Highland Group LLC. Both sites are live on Vercel connected to GitHub.

## THE MISSION
GlobalCeilidh.com is a Scottish Gaelic language learning platform — think Duolingo but rooted in Highland culture, diaspora identity, and community. The lesson engine is called **Abair De**. The flagship lesson location is **An Cafaidh Balla Cloiche** (The Stone Wall Café).

## TECH STACK
- **Next.js** (web), **Expo** (iOS/Android — same design language as web)
- **Supabase** (database + RLS)
- **Clerk** (auth + webhook syncing users to Supabase)
- **Vercel** (deployment)
- **GitHub:** Globalceilidh/global-ceilidh

## WHAT'S BUILT AND WORKING
- Supabase schema live, Migrations 001 & 002 applied
- RLS protecting user data
- Clerk auth with webhook syncing
- LessonEngine connected to Supabase — pulling live phrases, phonetics, grammar notes for Unit 1, An Cafaidh, Toiseachadh level
- Learn tab working end to end
- Vercel deployed, analytics live

## WHAT'S NOT BUILT YET
- Practice and Challenge tabs (logic not finalized)
- User progress tracking (lesson_sessions, question_attempts)
- Migration 003 (community chat schema)
- Units 2–10 content
- Pedagogy decisions (question counts per level, lesson flow)
- Cosmetic redesign (warm, circular, spatial — approved direction but not started)

## CURRICULUM STRUCTURE
- 4 levels: Toiseachadh, Meadhanach, Adhartach, Fileanta
- 10 units per level
- 3 tabs per lesson: Learn, Practice, Challenge
- 5 flag figures: Scotland (F), Canada (M), USA (F), Australia (M), New Zealand (F)
- Spirals replace hearts as the lives/currency system
- Speech via Web Speech API is the core differentiator

## DESIGN DIRECTION (approved, not built)
- Kill the grey/corporate feel
- Warm, circular spatial language — the swirl is the UI logic
- Café bleeds into the lesson (no hard cut from photo to app)
- Circular level selector, slight arc/asymmetry
- Conversation exchange feels spoken, not tabulated
- Motion and flag figure sharpening come after core pedagogy is locked

## IMMEDIATE PRIORITIES
1. Lock the pedagogy — lesson flow, question counts per level
2. Build Practice and Challenge tabs
3. Wire user progress tracking
4. Migration 003
5. Cosmetic pass (after structure is stable)

## HOW TO WORK WITH ME
- I lose context between sessions — always start from this file
- Don't ask me to recreate lost conversation — move forward
- Be direct, concise, decisive — I want to get things DONE
- Aileen is my AI design consultant voice — her feedback carries weight
