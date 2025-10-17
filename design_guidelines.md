# Design Guidelines: Creative Data Dashboard Tool

## Design Approach

**Selected Framework:** Design System Approach using Material Design 3 principles with custom enhancements for data visualization

**Justification:** This is a utility-focused, information-dense application requiring consistency, scalability, and clarity. Material Design 3 provides robust patterns for data-heavy interfaces while allowing customization for creative audiences.

**Key Design Principles:**
- Data clarity over decoration
- Progressive disclosure of complexity
- Immediate visual feedback for all interactions
- Consistent spatial relationships across all views

---

## Core Design Elements

### A. Color Palette

**Light Mode:**
- Primary: 220 90% 56% (vibrant blue for CTAs, active states)
- Surface: 0 0% 100% (pure white for main backgrounds)
- Surface Variant: 220 20% 96% (subtle gray for cards, panels)
- Outline: 220 15% 85% (borders, dividers)
- Text Primary: 220 15% 15% (near-black for body text)
- Text Secondary: 220 10% 45% (muted for labels, metadata)

**Dark Mode:**
- Primary: 220 85% 65% (slightly lighter blue for contrast)
- Surface: 220 15% 12% (dark charcoal base)
- Surface Variant: 220 12% 18% (elevated cards, panels)
- Outline: 220 10% 30% (subtle borders)
- Text Primary: 0 0% 95% (off-white for readability)
- Text Secondary: 220 5% 65% (muted labels)

**Data Visualization Palette:**
- Chart colors: Use a perceptually uniform sequential palette
- Primary series: 200 75% 55%, 160 70% 50%, 280 65% 58%, 30 80% 55%, 340 70% 52%
- Avoid red/green combinations for accessibility

### B. Typography

**Font Family:**
- Primary: 'Inter' via Google Fonts CDN (UI, data labels, body text)
- Monospace: 'JetBrains Mono' via Google Fonts CDN (data values, code snippets)

**Type Scale:**
- Display: text-4xl font-bold (dashboard titles)
- Heading 1: text-2xl font-semibold (section headers)
- Heading 2: text-xl font-medium (widget titles)
- Body: text-base font-normal (content, descriptions)
- Caption: text-sm font-normal (metadata, timestamps)
- Data Values: text-base font-mono (numeric displays)

### C. Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, 12, 16 (p-2, m-4, gap-6, h-8, py-12, space-y-16)

**Grid Structure:**
- Main container: max-w-7xl mx-auto px-6
- Dashboard grid: 12-column responsive grid (grid-cols-12)
- Widget sizing: Snap to 4-column increments (col-span-4, col-span-6, col-span-12)
- Consistent gap-6 between all grid items

**Layout Zones:**
- Top navigation: h-16 with fixed positioning
- Sidebar (if applicable): w-64 for data source management
- Main canvas: Remaining viewport with py-6 padding
- Widget containers: Minimum h-64, expand with content

### D. Component Library

**1. File Upload Zone:**
- Large dropzone (min-h-48) with dashed border (border-2 border-dashed)
- Upload icon centered above "Drag & drop or click to upload" text
- Supported formats displayed below (CSV, XLSX, XLS)
- Active state: Primary color border and background tint
- Progress bar (h-2) during upload with percentage display

**2. Data Preview Table:**
- Sticky header row (sticky top-0) with sort indicators
- Alternating row backgrounds (Surface Variant every other row)
- Fixed column widths with text truncation (truncate)
- Row hover state: Surface Variant background
- Compact cell padding: px-4 py-2

**3. Chart Widgets:**
- Card container: Surface Variant background, rounded-lg, p-6
- Widget header: Title (Heading 2), actions menu (top-right), gap-4 between
- Chart area: Minimum h-64, responsive scaling
- Legend: Below chart, horizontal layout with gap-4 items
- Empty state: Centered icon + "Select data to visualize" text

**4. Drag-and-Drop Dashboard Builder:**
- Dashboard canvas: Grid with visible columns when dragging (border-dashed guides)
- Widget handles: Top-left corner, 6x6 drag icon, appears on hover
- Drop zones: Highlighted with Primary color at 20% opacity
- Widget resize handles: Bottom-right corner, 4x4 diagonal arrows

**5. Chart Type Selector:**
- Horizontal icon grid: Bar, Line, Scatter, Pie, Donut options
- Icon buttons: w-16 h-16 with chart preview icons
- Active state: Primary background, white icon
- Inactive state: Surface Variant background, Text Secondary icon

**6. Data Column Selector:**
- Multi-select dropdown with checkboxes
- Column name + data type icon (123 for numbers, ABC for text, calendar for dates)
- Search filter at top (p-2 sticky)
- Selected count badge on dropdown trigger

**7. Statistics Panel:**
- Horizontal cards: gap-4 between metrics
- Large number display (text-3xl font-semibold) with label below (text-sm)
- Icon indicating metric type (sum, average, count)
- Surface Variant background, p-6, rounded-lg

**8. Navigation:**
- Top bar: Logo left, breadcrumbs center, user menu right
- Tab navigation for views: File Upload → Chart Builder → Dashboard
- Active tab: Primary color bottom border (border-b-2), font-semibold

**9. Action Buttons:**
- Primary CTA: bg-Primary text-white, px-6 py-2.5, rounded-md
- Secondary: border-2 border-Outline, px-6 py-2.5, rounded-md
- Icon buttons: p-2, rounded-md, hover:bg-Surface-Variant
- Save/Load dashboard: Icon + text, prominent positioning

### E. Animations

**Use Sparingly:**
- Chart data loading: Simple fade-in (opacity transition 200ms)
- Widget drag: Slight lift shadow (transition-shadow 150ms)
- Dropdown menus: Slide down 200ms with ease-out
- **No page transitions, no floating elements, no decorative animations**

---

## Images

**No images required** for this utility-focused dashboard tool. All visual elements are data-driven charts, tables, and UI components. Focus on clarity and information architecture over illustrative content.

---

## Additional UX Patterns

**Empty States:** Each view has centered illustrations with actionable CTAs ("Upload your first file" with upload button)

**Loading States:** Skeleton screens for data tables, pulsing rectangles matching final content layout

**Error Handling:** Inline validation messages below inputs, toast notifications (top-right) for system feedback

**Responsive Behavior:** Dashboard grid collapses to single column on mobile (<768px), charts maintain aspect ratio