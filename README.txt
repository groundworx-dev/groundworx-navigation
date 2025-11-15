=== Groundworx Navigation - Responsive Menu & Mobile Navigation Block ===
Contributors: alexandrie
Tags: navigation, menu, gutenberg, responsive-menu, mobile-menu
Plugin URI: https://wordpress.org/plugins/groundworx-navigation
Author URI: https://groundworx.dev
Donate link: https://ko-fi.com/groundworx
GitHub URI: https://github.com/groundworx-dev/groundworx-navigation
Requires at least: 6.5
Tested up to: 6.9
Requires PHP: 8.2
Stable tag: 1.0.6
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Responsive navigation menu block for WordPress block themes. Build mobile menus, hamburger navigation, modal overlays, dropdown menus & sticky headers with Gutenberg blocks.

== Description ==

**Groundworx Navigation** is a powerful **responsive navigation block** for WordPress block themes. Build professional navigation menus, mobile-responsive hamburger menus, modal overlays, dropdown navigation, and sticky headers—all with native Gutenberg blocks. No coding required.

Perfect for **theme.json block themes**, this navigation block gives you complete control over your site's header navigation, mobile menu behavior, and responsive breakpoints.

= Why Choose Groundworx Navigation? =

Replace complex navigation plugins with a native Gutenberg block solution. Whether you need a simple navigation bar, mobile hamburger menu, full-screen modal overlay, or off-canvas slide-in drawer—Groundworx Navigation handles it all.

**Perfect for:**
* Block theme developers building custom navigation headers
* Sites requiring mobile-first responsive navigation menus
* Accessibility-focused WordPress navigation
* Portfolio and business sites with sticky navigation headers
* Multi-level navigation structures and deep site menus

= Key Features =

**Native Gutenberg Navigation Block**
Build your navigation menu entirely in the WordPress Block Editor—no shortcodes, no legacy menu screens, just blocks.

**Four Responsive Layout Templates**
  - **Modal Navigation** - Full-screen overlay menu for mobile devices
  - **Modal Dropdown** - Dropdown header navigation on desktop, modal on mobile
  - **Slide-In Navigation** - Off-canvas drawer navigation from right edge
  - **Classic Navigation** - Traditional navigation bar with hamburger menu collapse

**Multiple Menu Display Styles**
Accordion menus · Accordion Alt · List navigation · Vertical menus · Horizontal navigation bars — mix and match with any layout template.

**Smart Responsive Behavior**
Set responsive breakpoints (`tablet`, `laptop`, `desktop`, `large-desktop`) and watch your navigation automatically collapse to a hamburger menu or modal overlay at your chosen screen size.

**Flexible Position Controls**
Relative, Sticky Header, Fixed Navigation, or Scroll-Up Reveal—create sticky navigation headers without writing custom CSS.

**Accessibility-First Navigation**
Built-in focus traps, ESC key close, arrow-key navigation, and proper ARIA attributes make your menu accessible by default.

**Branding Integration**
Add **Site Logo**, **Site Title**, or **Site Tagline** blocks anywhere in your navigation header for seamless branding.

**Lightweight & Fast**
No jQuery bloat. Powered by WordPress's native Interactivity API with vanilla JavaScript—no external libraries needed for responsive navigation.

**Submenu Controls**
* Control nesting depth (1-5 levels) for complex navigation structures
* Indent or flatten submenu display
* Hover or click to open dropdown submenus
* Icon controls for submenu indicators

= Navigation Templates In Detail =

**Modal Navigation**
Perfect for mobile-first sites. Creates a full-screen overlay navigation menu that slides in from the top or side. Ideal for clean, distraction-free mobile navigation.

**Modal Dropdown Navigation**
Best of both worlds: traditional dropdown navigation on desktop, modal overlay on mobile devices. Great for sites with many navigation items.

**Slide-In Navigation**
Off-canvas navigation drawer that slides in from the right edge. Popular for modern web apps and mobile-optimized sites.

**Classic Navigation**
Traditional horizontal navigation bar that collapses to a hamburger menu icon on smaller screens. The most familiar navigation pattern for users.

= Block Theme Ready =

Groundworx Navigation is built specifically for **theme.json block themes**. Works perfectly with:
* Twenty Twenty-Four
* Twenty Twenty-Five  
* Blockbase
* Frost
* Any FSE (Full Site Editing) block theme

**Note:** Requires a theme.json-ready block theme. Not compatible with classic PHP themes.


== Installation ==

= Automatic Installation =
1. Go to **Plugins → Add New** in your WordPress admin
2. Search for "**Groundworx Navigation**"
3. Click **Install Now** then **Activate**
4. Add the **Groundworx Navigation** block in the Block Editor

= Manual Installation =
1. Download the plugin zip file
2. Upload to `/wp-content/plugins/` or install via **Plugins → Add New → Upload Plugin**
3. Activate **Groundworx Navigation**
4. Start building responsive navigation menus in the Block Editor

= Quick Start Guide =
1. In the Block Editor, add the **Groundworx Navigation** block
2. Choose a navigation layout template (Modal, Slide-In, Dropdown, or Classic)
3. In **Menu Settings**, click **Create New Menu** or select existing navigation menu
4. Insert **Navigation Menu**, **Branding**, or **Spacer** blocks
5. Configure responsive breakpoint, sticky header, accordion/list display in **Layout Settings**
6. Publish and view your responsive navigation menu—no coding required


== Frequently Asked Questions ==

= Does this replace WordPress core Navigation block? =  
Groundworx Navigation is an alternative focused on complex responsive layouts—modal overlays, slide-in navigation, sticky headers, hamburger menus—without requiring custom CSS. Both navigation blocks can coexist in WordPress.

= Why can't I select Fixed or Scroll-Up Reveal position? =  
Fixed and Scroll-Up Reveal navigation positions only appear when the block is placed inside a `Header` template part. In regular page content, only **Relative** and **Sticky** positions are available for navigation menus.

= What responsive breakpoints are available? =  
Choose from `tablet`, `laptop`, `desktop`, or `large-desktop` breakpoints—matching Groundworx breakpoint utilities. Set **Toggle Behaviour → Responsive** in navigation settings and pick your breakpoint.

= Which menu display styles are included? =  
Accordion, Accordion Alt, List, Vertical, and Horizontal navigation displays. Each menu style works with any layout template (Modal, Modal Dropdown, Slide-In, or Classic navigation).

= Will this work with my WordPress theme? =  
Groundworx Navigation requires a **theme.json block theme** (also called FSE or Full Site Editing theme). If you're using a classic PHP theme or older block theme without full theme.json support, the navigation block won't function correctly.  

**Solution:** Use a modern block theme like Twenty Twenty-Four, Twenty Twenty-Five, Blockbase, or Frost—all fully compatible with Groundworx Navigation.

= Can I create mega menus with multiple columns? =
Yes! Use the flexible block structure to create multi-column navigation menus and mega menu layouts within any navigation template.

= Does it work with WooCommerce? =
Absolutely. Groundworx Navigation works with any WordPress block theme, including WooCommerce-enabled sites. Build custom navigation menus with your product categories.

= Is the navigation mobile-responsive? =
Yes! That's the core feature. Choose responsive behavior and breakpoints, and your navigation automatically adapts—collapsing to a hamburger menu, modal, or slide-in drawer on mobile devices.

= Can I have sticky navigation headers? =
Yes. Select **Sticky** or **Fixed** position in navigation settings to create sticky header navigation that stays visible while scrolling.


== Screenshots ==
1. Block Editor – Navigation layout templates in Inspector settings
2. Slide-In navigation drawer on mobile
3. Modal navigation full-screen overlay
4. Classic navigation bar with hamburger menu
5. Dropdown navigation with submenus
6. Sticky header navigation in action


== Changelog ==

= 1.0.6 =
* Fix: Resolved slide-in template layout propagation issue that caused menu to display incorrect layout type (horizontal-menu instead of accordion)
* Fix: Improved scrollbar color and behavior for long navigation menus that exceed screen height
* Fix: Corrected React hook dependency array to prevent crash when switching toggle behavior modes

= 1.0.5 =
* New: Added Max Visible Nesting Level control (1-5 levels) to limit submenu depth for visitors
* New: Added Indent Submenu and Flatten Submenu options for enhanced menu structure control  
* Improvement: Refactored responsive layout logic into reusable hook, reducing code duplication
* Fix: Resolved React hook dependency issues that caused crashes when switching toggle behavior
* Fix: Fixed memory leak in navigation bounds measurement (resize listener cleanup)
* Fix: Corrected infinite loop in navigation-menu attribute updates
* Enhancement: Renamed "Stacked Menu" to "Accordion Alt" for better clarity

= 1.0.4 =
- Fix: geometry mismatch when OS is set to "Always show scroll bars" could mis-detect nav bounds.
- Improve: no layout shift when locking body; close button no longer jumps.
- Improve: optional menu scrollbar styling.

= 1.0.3 =
* Fixed editor icon display issue (now hidden when SVG is used)
* General stability and performance improvements for navigation menu

= 1.0.2 =
* Improved navigation UX
* Fixed issue where navigation menu would sometimes not open
* Fixed navigation editing behavior bug

= 1.0.1 =
* Fix: Adjusted editor canvas width detection for iframe-less block editor in WordPress 6.8+

= 1.0.0 =
* Initial public release – Modal, Modal Dropdown, Slide-In, and Classic navigation layouts with accordion/accordion-alt/list/vertical/horizontal menu displays.


== Upgrade Notice ==

= 1.0.6 =
Critical fix for slide-in template layout issues and improved scrollbar behavior. Update recommended for all users.