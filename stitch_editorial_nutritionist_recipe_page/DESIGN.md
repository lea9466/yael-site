---
name: Nourish & Bloom
colors:
  surface: '#faf9f5'
  surface-dim: '#dadad6'
  surface-bright: '#faf9f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f4f0'
  surface-container: '#eeeeea'
  surface-container-high: '#e8e8e4'
  surface-container-highest: '#e3e3df'
  on-surface: '#1a1c1a'
  on-surface-variant: '#424842'
  inverse-surface: '#2f312e'
  inverse-on-surface: '#f1f1ed'
  outline: '#727972'
  outline-variant: '#c2c8c0'
  surface-tint: '#45664d'
  primary: '#284731'
  on-primary: '#ffffff'
  primary-container: '#3f5f47'
  on-primary-container: '#b3d7b9'
  inverse-primary: '#accfb1'
  secondary: '#486548'
  on-secondary: '#ffffff'
  secondary-container: '#caecc6'
  on-secondary-container: '#4e6c4e'
  tertiary: '#503d25'
  on-tertiary: '#ffffff'
  tertiary-container: '#69543a'
  on-tertiary-container: '#e6caa8'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c7eccd'
  primary-fixed-dim: '#accfb1'
  on-primary-fixed: '#01210e'
  on-primary-fixed-variant: '#2e4e37'
  secondary-fixed: '#caecc6'
  secondary-fixed-dim: '#aecfab'
  on-secondary-fixed: '#05210a'
  on-secondary-fixed-variant: '#314d32'
  tertiary-fixed: '#fbdebc'
  tertiary-fixed-dim: '#dec2a1'
  on-tertiary-fixed: '#271904'
  on-tertiary-fixed-variant: '#57432a'
  background: '#faf9f5'
  on-background: '#1a1c1a'
  surface-variant: '#e3e3df'
typography:
  display-lg:
    fontFamily: Noto Serif
    fontSize: 64px
    fontWeight: '600'
    lineHeight: 72px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Noto Serif
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Noto Serif
    fontSize: 32px
    fontWeight: '500'
    lineHeight: 40px
  headline-sm:
    fontFamily: Noto Serif
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
  body-lg:
    fontFamily: Heebo
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Heebo
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Heebo
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Heebo
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  container-max: 1280px
  gutter: 24px
---

## Brand & Style

The design system is built for a premium nutritionist service, focusing on a high-end editorial aesthetic that feels more like a lifestyle magazine than a clinical tool. The brand personality is holistic, authoritative yet warm, and deeply rooted in wellness and organic growth. 

The visual style blends **Minimalism** with **Editorial Luxury**. It utilizes heavy whitespace to create a sense of calm and "breathing room," essential for health-focused content. Large, evocative imagery is paired with sophisticated typography to evoke an emotional response of inspiration, trust, and refined living.

## Colors

The palette is inspired by botanical and earth tones, designed to feel grounded and organic. 
- **Warm Ivory (#FBF8F3)**: The primary background color, providing a softer, more premium feel than pure white.
- **Deep Green (#3F5F47)**: Used for primary actions, headlines, and foundational brand elements to signal authority and nature.
- **Sage Green (#6F8E6E)**: A secondary tone for supporting elements and iconography.
- **Warm Beige (#E3C7A6)**: An accent used for decorative elements, subtle dividers, or specific callouts.
- **Soft Coral (#D98A80)**: A vibrant yet muted accent for highlights, nutrition-focused badges, or gentle warnings.
- **Surface (#FFFFFF)**: Reserved for cards and interactive components to create depth against the ivory background.

## Typography

This design system uses a pairing of **Noto Serif** (substituting for the editorial feel) for headlines and **Heebo** for body and interface text. The hierarchy is extremely generous to maintain a premium feel. 

Headlines use Noto Serif to provide a classic, literary tone that commands attention. Body text uses Heebo, ensuring high legibility for long-form nutritional guides and recipes. In accordance with the RTL (Hebrew) layout, text alignment is primarily right-aligned, with careful attention to line heights to accommodate Hebrew character heights.

## Layout & Spacing

The layout follows a **Fluid Grid** system optimized for Right-to-Left (RTL) reading patterns. 
- **Desktop**: A 12-column grid with a 1280px max-width. Margins are generous (80px+) to focus the user's eye on the content.
- **Mobile**: A 4-column grid with 20px side margins.
- **Spacing Philosophy**: This design system prioritizes "Negative Space" as a design element. Elements are grouped with tight internal spacing but separated by large "xl" spacing blocks to define distinct sections of a lifestyle story.

## Elevation & Depth

Hierarchy is achieved through **Tonal Layering** and **Ambient Shadows**. 
- **Surfaces**: Cards and containers use pure white (#FFFFFF) against the Warm Ivory background, creating a subtle natural lift.
- **Shadows**: Shadows are extremely soft and diffused, using the Deep Green color at a very low opacity (3-5%) rather than pure black. This keeps the elevation feeling "warm" and integrated with the organic theme.
- **Depth**: Background images may use a subtle scale-in animation on scroll to provide a sense of immersion.

## Shapes

The shape language is defined by **Rounded-XL** corners for all major containers and images, emphasizing a soft, approachable, and organic feel. 
- **Small Elements**: Buttons and input fields use a consistent 0.5rem (rounded) base.
- **Feature Elements**: Content cards, recipe images, and call-to-action blocks use 1.5rem (rounded-xl) to feel like premium, tactile objects.

## Components

- **Buttons**: Primary buttons are Deep Green with White text, using Rounded-XL shapes. Secondary buttons use a Sage Green outline.
- **Status Pills**: Use soft pastel backgrounds based on the accent colors (e.g., a desaturated version of Soft Coral for "High Protein") with dark text for contrast.
- **Checklist Ingredients**: Ingredients lists use custom thin-outline Deep Green checkmarks. The text should have a slight strike-through or opacity change when active.
- **Step Cards**: Numbered steps for recipes or plans should feature large, Noto Serif numbers in Warm Beige, positioned at the top-right (RTL) of the white card.
- **Input Fields**: Minimalist design with a thin 1px Deep Green bottom border or a very light Sage Green outline.
- **Icons**: Icons must be thin-weight (Light or Thin) to match the editorial elegance, using the Deep Green or Sage Green color.