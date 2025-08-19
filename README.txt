=== Groundworx Navigation ===
Contributors: alexandrie
Tags: navigation, menu, gutenberg, block-theme, responsive
Plugin URI: https://wordpress.org/plugins/groundworx-navigation
Author URI: https://groundworx.dev
Donate link: https://ko-fi.com/groundworx
GitHub URI: https://github.com/groundworx-dev/groundworx-navigation
Requires at least: 6.5
Tested up to: 6.8
Requires PHP: 8.2
Stable tag: 1.0.2
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Responsive Gutenberg navigation block for theme.json themes — modal, dropdown, slide-in & classic layouts with accordion, stacked, list menus.

== Description ==
Modern, accessible navigation built entirely with Gutenberg blocks and designed for **theme.json-ready** themes.

= Key Features =

**Native Gutenberg Block**
Everything happens in the Block Editor—no shortcodes or legacy menu screens.

**Four Layout Templates**
  - **Modal** (full-screen overlay)  
  - **Modal Dropdown** (dropdown in the header on small screens, modal on mobile)  
  - **Slide-In** (off-canvas, right-edge drawer)  
  - **Classic** (inline bar that collapses to a hamburger)  

**Flexible Menu Displays**
Accordion · Stacked · List · Vertical · Horizontal — mix & match with any template.

**Responsive Behaviour Switcher**
Pick a breakpoint (`tablet`, `laptop`, `desktop`, `large-desktop`) and the menu collapses to a hamburger or modal automatically.

**Position Controls**
Relative, Sticky, Fixed, or Scroll-Up Reveal—no custom CSS required.

**Accessibility by Default**
Focus traps, ESC to close, arrow-key navigation, ARIA attributes—all handled for you.

**Branding Slots**
Drop in **Site Logo**, **Site Title**, or **Site Tagline** blocks anywhere inside the navigation.

**Lightweight Tech Stack**
No jQuery; powered by WordPress’s Interactivity API (vanilla JS, no external libraries).


== Installation ==

1. Upload the plugin folder to `/wp-content/plugins/` or install via **Plugins → Add New**.  
2. Activate **Groundworx Navigation**.  
3. In the Block Editor, add the **Groundworx Navigation** block.  
4. Choose a layout template (Modal, Slide-In, etc.).  
5. In **Menu Settings**, click **Create New Menu** (or pick an existing one).  
6. Insert **Navigation Menu**, **Branding**, or **Spacer** blocks as needed.  
7. Configure breakpoint, sticky/fixed, accordion/list, etc., in **Layout Settings**.  
8. Hit **Publish** and view your new menu—no coding required.

== Frequently Asked Questions ==

= Does it replace the core Navigation block? =  
It’s an alternative that makes complex layouts—modals, slide-ins, sticky headers—possible without custom CSS or extra plugins. Use whichever block fits your project; both can coexist.

= Why can’t I pick Fixed or Scroll-Up Reveal in some layouts? =  
Those positions appear only when the block sits inside a `Header` template part (or another part whose `slug` is `header`). In normal page content, only **Relative** and (for Classic) **Sticky** are available.

= What breakpoints can I target? =  
`tablet`, `laptop`, `desktop`, `large-desktop`—matching Groundworx breakpoint utilities. Set **Toggle Behaviour → Responsive** and choose a breakpoint icon.

= Which menu displays are included? =  
Accordion, Stacked, List, Vertical, and Horizontal. Each works with any layout template (Modal, Modal Dropdown, Slide-In, Classic).

= Why doesn’t the menu work with my theme? =  
Groundworx Navigation relies on WordPress’s **block-theme framework** (theme.json). If you’re using a classic PHP theme, or a block theme without full theme.json support, the menu won’t load correctly.  
**Solution:** switch to a theme explicitly “theme.json-ready” (e.g. Twenty Twenty-Four, Twenty Twenty-Five, Blockbase, Frost).


== Screenshots ==
1. Block Editor – Layout templates in Inspector.
2. Slide-In layout
4. Classic layout
5. Dropdown layout
6. Modal layout


== Changelog ==

= 1.0.2 =
* Improved UX
* Fixed issue where sometimes menu would not open
* Fixed editing behavior bug

= 1.0.1 =
* Fix: Adjusted editor canvas width detection for iframe-less block editor in WordPress 6.8+

= 1.0.0 =
* Initial public release – Modal, Modal Dropdown, Slide-In, and Classic layouts with accordion/stacked/list/vertical/horizontal displays.

== Upgrade Notice ==

= 1.0.0 =
First stable release. Install or update for responsive modal, slide-in, and classic hamburger navigation layouts.