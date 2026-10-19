# Pipeline Kanban Design - Based on Bitrix24 CRM Patterns

## Column Structure (Stages)
Based on our existing pipeline funnel data:
1. **Lead** (جديد) - New inquiries
2. **Contact** (تم التواصل) - Initial contact made
3. **Qualified** (مؤهل) - Qualified opportunity
4. **Proposal** (عرض سعر) - Quote sent
5. **Won** (رابح) - Closed deal
6. **Lost** (خاسر) - Lost deal

## Card Layout
Each card displays:
- **Deal name** (Customer name) - Bold, primary text
- **Value** - Prominent, currency formatted (SAR)
- **Company/Source badge** - Small colored tag
- **Assigned employee** - Avatar + name
- **Days in stage** - Small muted text
- **Expected close date** - Calendar icon + date
- **Priority indicator** - Colored left border or badge

## Drag-Drop Behavior
- **Native HTML5 Drag API** (no external deps)
- Visual feedback: opacity change, shadow, rotate slight
- Drop zones highlight on drag enter
- Auto-scroll when dragging near edges
- Optimistic UI update, sync with store

## Color Coding / Stage Indicators
- Lead: Slate (neutral)
- Contact: Blue (info)
- Qualified: Amber (warning)
- Proposal: Violet (action)
- Won: Emerald (success)
- Lost: Red (danger)
- Column headers show stage color as accent bar

## Quick Actions on Cards (hover or click)
- ✏️ Edit deal
- 💬 New conversation
- ✅ Add task
- 📋 View details (drawer)
- 🗑️ Delete (with confirmation)

## Summary/Counters Per Column
- **Deal count** - Bold number in header
- **Total value** - Sum of all cards in column
- **Average days in stage** - Optional metric
- **Conversion rate** - Won / Total entering

## Filter/Search Capabilities
- **Quick filters**: My deals, High value, Stale (>30 days)
- **Search box**: Filter by customer name, company, value
- **Column visibility**: Toggle stages on/off
- **Group by**: Employee, Source, Company

## Unique UX Patterns from Bitrix24
1. **Compact/Card view toggle** - Dense vs comfortable cards
2. **Inline editing** - Click value/name to edit directly
3. **Stage probability** - Show % under column header
4. **Activity log** - Small clock icon with last activity time
5. **Bulk actions** - Select multiple cards, move together
6. **Keyboard navigation** - Arrow keys, Enter to edit, Esc to cancel
7. **Empty state** - "Add deal" button in empty columns
8. **Column collapse** - Hide/show columns to focus
9. **Swimlanes** - Optional grouping by employee/source

## Technical Implementation Notes
- Use @dnd-kit or native HTML5 Drag API
- Virtualized columns for performance (react-window)
- Persist column order in localStorage
- RTL support for Arabic
- Skeleton loaders while fetching
- Toast notifications on move success/error