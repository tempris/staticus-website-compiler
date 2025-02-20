# Staticus Website Compiler - Comprehensive Project Configuration

This document provides a complete reference to all configuration variables used in the **Staticus Website Compiler**, accurately reflecting the definitions from **config.json** and their implementations in Staticus. All options, including advanced configurations such as the `{ "toplevel": true }` setting for `mangle`, are now fully detailed.

---

## Required Settings

### `require.site.url`
- **Type:** `string`
- **Example:**
  ```json
  "require": {
    "site": {
      "url": "https://www.staticuswebsitecompiler.com"
    }
  }
  ```
- **Description:** Defines the **base URL** of the website. It is essential for setting `og:url` meta tags and generating the sitemap.
- **Parameters:**
  - Must be a valid URL.
- **Usage in Code:**
  - Referenced for `og:url` generation.
  - Used in sitemap creation to establish accurate links.

---

## Optional Settings

### Brand Settings (`option.brand`)

Controls branding elements such as icons, backgrounds, and alignment for visual consistency.

#### `option.brand.adjust`
- **Description:** Configures how foreground and background images are processed, including alignment, blur, and visual effects.
- **Usage in Code:**
  - Utilized for image composition and favicon generation.

##### Foreground:
  ```json
  "foreground": {
    "alignment": { "x": "center", "y": "center" },
    "blur": 0,
    "modulate": {}
  }
  ```
- **Parameters:**
  - **alignment:** X and Y values (`left`, `center`, `right`, `top`, `bottom`).
  - **blur:** Integer specifying blur intensity.
  - **modulate:** Object for additional visual effects.

##### Background:
  ```json
  "background": {
    "alignment": { "x": "center", "y": "center" },
    "apply": { "square": true, "wide": true },
    "blur": 0,
    "modulate": {}
  }
  ```
- **Parameters:**
  - **apply.square:** Boolean; applies settings to square images.
  - **apply.wide:** Boolean; applies settings to wide images.
  - **blur:** Integer for blur effect.
  - **modulate:** Object for color modulation.

#### `option.brand.size`
- **Description:** Specifies the sizes for various branding images including favicons and touch icons.
- **Usage in Code:**
  - Processed for favicon and touch icon generation.

- **ICO Sizes:**
  ```json
  "ico": [16, 32, 48, 64, 96, 128]
  ```
- **Image Sizes:**
  ```json
  "image": {
    "apple-touch-icon-57x57.png": { "width": 57, "height": 57 },
    "apple-touch-icon-120x120.png": { "width": 120, "height": 120 },
    "mstile-310x310.png": { "width": 310, "height": 310 },
    "favicon-512.png": { "width": 512, "height": 512 }
  }
  ```

---

### Minification Settings (`option.minify.js`)
- **Description:** Defines JavaScript minification options to reduce file size.
- **Usage in Code:**
  - Applied during JS processing.
- **Parameters:**
  - **keep_classnames:** If `true`, retains class names.
  - **keep_fnames:** If `true`, retains function names.
  - **compress:** Enables JS compression.
  - **mangle:** Controls mangling of names.
    - **Boolean:** `true` for full mangling, `false` to disable.
    - **Object:**
      ```json
      { "toplevel": true }
      ```
      Enables mangling of top-level variable and function names.

  ```json
  "minify": {
    "js": {
      "keep_classnames": false,
      "keep_fnames": false,
      "compress": true,
      "mangle": { "toplevel": true }
    }
  }
  ```

---

### Path Settings (`option.path`)
- **Description:** Manages file and directory handling during compilation.
- **Usage in Code:**
  - Used to filter paths during processing.

- **Ignore Navigation:**
  ```json
  "ignore_nav": ["index", "404"]
  ```
- **Ignore Prefix:**
  ```json
  "ignore_prefix": "_"
  ```
- **Ignore Package:**
  ```json
  "ignore_package": ["example"]
  ```
- **Ignore Sitemap:**
  ```json
  "ignore_sitemap": ["404", "503"]
  ```

---

### Table of Contents Settings (`option.toc`)
- **Description:** Controls ToC generation for HTML pages.
- **Usage in Code:**
  - Implemented for HTML ToC creation.

- **Depth:**
  ```json
  "depth": 4
  ```
- **Collapsible:**
  ```json
  "collapsible": false
  ```

---

### URL Configuration (`option.url.html_extension`)
- **Description:** Specifies whether URLs should include `.html` extensions.
- **Usage in Code:**
  - Applied during watch process.

  ```json
  "html_extension": true
  ```

---

### File Watching Settings (`option.watch`)
- **Description:** Defines file watching behaviors for live reloading.
- **Usage in Code:**
  - Used with BrowserSync.

- **Delay Browser:**
  ```json
  "delay_browser": 1250
  ```
- **Delay Change:**
  ```json
  "delay_change": 750
  ```

---

**Note:** All configurations presented here now include advanced settings such as `{ "toplevel": true }` for `mangle`, ensuring no options have been omitted and maintaining consistency across all related files for proper functionality within the **Staticus Website Compiler** project.
