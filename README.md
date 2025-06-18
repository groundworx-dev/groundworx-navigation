# Groundworx Navigation

Modern, accessible navigation built entirely with Gutenberg blocks and designed for **theme.json-ready** themes.

[Website](https://groundworx.dev) • [Plugin Repo](https://github.com/groundworx-dev/groundworx-navigation) • [License: GPL v2 or later](https://www.gnu.org/licenses/gpl-2.0.html)  
[![Support on Ko-fi](https://img.shields.io/badge/Ko--fi-Support%20Groundworx-ff5f5f?logo=ko-fi&logoColor=white&style=flat-square)](https://ko-fi.com/groundworx)

---

## At a Glance

Groundworx Navigation lets you drop in sticky headers, full-screen modals, or slide-in menus **without writing any code**.  
Choose a layout, add your links, publish—done.

---

## Key Features

### Native Gutenberg Block  
Everything happens in the Block Editor—no shortcodes or legacy menu screens.

### Four Layout Templates
  - **Modal** (full-screen overlay)  
  - **Modal Dropdown** (dropdown in the header on small screens, modal on mobile)  
  - **Slide-In** (off-canvas, right-edge drawer)  
  - **Classic** (inline bar that collapses to a hamburger)  

### Flexible Menu Displays  
Accordion · Stacked · List · Vertical · Horizontal — mix & match with any template.

### Responsive Behaviour Switcher  
Pick a breakpoint (`tablet`, `laptop`, `desktop`, `large-desktop`) and the menu collapses to a hamburger or modal automatically.

### Position Controls  
Relative, Sticky, Fixed, or Scroll-Up Reveal—no custom CSS required.

### Accessibility by Default  
Focus traps, ESC to close, arrow-key navigation, ARIA attributes—all handled for you.

### Branding Slots  
Drop in **Site Logo**, **Site Title**, or **Site Tagline** blocks anywhere inside the navigation.

### Lightweight Tech Stack  
No jQuery; powered by WordPress’s Interactivity API (vanilla JS, no external libraries).

---

## Installation

1. Upload the plugin folder to `/wp-content/plugins/` or install it through **Plugins → Add New**.  
2. Activate **Groundworx Navigation**.  
3. In the Block Editor, add the **Groundworx Navigation** block.  
4. Choose a layout template (Modal, Slide-In, etc.).  
5. In the sidebar, create a new menu (or select an existing one) under **Menu Settings → Create New Menu**.
6. Insert **Menu**, **Branding**, or **Spacer** blocks as needed.  
7. Configure behaviour (breakpoint, sticky/fixed, accordion, etc.) in the Inspector panel.
8. No coding needed—just hit Publish and view your new menu on the front end.

---

## Frequently Asked Questions

### Does it replace the core Navigation block?

It’s an alternative that makes complex layouts—modals, slide-ins, sticky headers—possible without custom code or extra plugins. Use whichever block fits your project best; both can coexist.

### Why can’t I pick Fixed or Scroll-Up Reveal in some layouts?

Those position options are only exposed when the Navigation block is placed inside a Header template part (or another template part whose slug is header). When you insert the block as regular page content, only positions that make sense in-flow—Relative and (for Classic) Sticky—are offered.

### What breakpoints can I target?

`tablet`, `laptop`, `desktop`, and `large-desktop`—matching the Groundworx breakpoint utilities. Set **Toggle Behaviour → Responsive** and pick the breakpoint icon.

### Which menu displays are included?

Accordion, Stacked, List, Vertical, and Horizontal. All can be mixed with any of the four layout templates (Modal, Modal Dropdown, Slide-In, Classic) provided by the plugin.

### Why does the menu not work with my theme?

Groundworx Navigation relies on WordPress’s **block-theme framework**—the theme.json system—for its markup and styles.  
If you’re using a classic (PHP-template) theme, or a block theme that hasn’t fully implemented theme.json settings, the menu will not load properly.  
**Solution:** activate any theme that’s explicitly “theme.json-ready” (e.g., Twenty Twenty-Four, Twenty Twenty-Five, Blockbase, Frost, or any modern FSE theme).