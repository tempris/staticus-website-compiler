# Staticus Website Compiler - 🚀 Tasks

## ⚡ **Terminal Task Commands Overview**

Staticus Website Compiler automates building and processing files in `in/*` and outputs them to `out/*`. The primary commands follow the format:

```sh
npx gulp <task name>
```

For example:

```sh
npx gulp build
```

### 🔨 Core Tasks

| Task Type         | Task Name            | Description                                  |
| :---------------- | :------------------- | :------------------------------------------- |
| **Build Tasks**   | `build`              | Performs a full build                        |
|                   | `watch`              | Starts Live Preview, watches for changes     |
|                   | `package`            | Packages compiled files into a zip           |
|                   | `about`              | Prints info about Staticus & current project |
| **Asset Tasks**   | `build_audio`        | Builds all audio files                       |
|                   | `build_brand`        | Builds branding assets                       |
|                   | `build_config`       | Builds configuration files                   |
|                   | `build_data`         | Builds data files (e.g., web manifests)      |
|                   | `build_favicon`      | Processes favicon files                      |
|                   | `build_file`         | Builds general file assets                   |
|                   | `build_font`         | Builds font files                            |
|                   | `build_font_icon`    | Builds font icons                            |
|                   | `build_html`         | Builds HTML files                            |
|                   | `build_image`        | Builds image assets                          |
|                   | `build_javascript`   | Builds JavaScript files                      |
|                   | `build_module`       | Builds additional modules                    |
|                   | `build_stylesheet`   | Builds CSS/SCSS files                        |
|                   | `build_video`        | Builds video files                           |
| **Cache Tasks**   | `reset`              | Clears all caches and output files           |
|                   | `reset_audio`        | Clears audio cache                           |
|                   | `reset_brand`        | Clears branding cache                        |
|                   | `reset_config`       | Clears configuration cache                   |
|                   | `reset_data`         | Clears data cache                            |
|                   | `reset_favicon`      | Clears favicon cache                         |
|                   | `reset_file`         | Clears file cache                            |
|                   | `reset_font`         | Clears font cache                            |
|                   | `reset_font_icon`    | Clears font icon cache                       |
|                   | `reset_html`         | Clears HTML cache                            |
|                   | `reset_image`        | Clears image cache                           |
|                   | `reset_javascript`   | Clears JavaScript cache                      |
|                   | `reset_module`       | Clears module cache                          |
|                   | `reset_stylesheet`   | Clears CSS/SCSS cache                        |
|                   | `reset_video`        | Clears video cache                           |
| **Rebuild Tasks** | `rebuild`            | Clears caches and runs `build`               |
|                   | `rebuild_audio`      | Clears and rebuilds audio                    |
|                   | `rebuild_brand`      | Clears and rebuilds branding assets          |
|                   | `rebuild_config`     | Clears and rebuilds configuration            |
|                   | `rebuild_data`       | Clears and rebuilds data files               |
|                   | `rebuild_favicon`    | Clears and rebuilds favicon files            |
|                   | `rebuild_file`       | Clears and rebuilds file assets              |
|                   | `rebuild_font`       | Clears and rebuilds font files               |
|                   | `rebuild_font_icon`  | Clears and rebuilds font icons               |
|                   | `rebuild_html`       | Clears and rebuilds HTML files               |
|                   | `rebuild_image`      | Clears and rebuilds image assets             |
|                   | `rebuild_javascript` | Clears and rebuilds JavaScript files         |
|                   | `rebuild_module`     | Clears and rebuilds modules                  |
|                   | `rebuild_stylesheet` | Clears and rebuilds CSS/SCSS files           |
|                   | `rebuild_video`      | Clears and rebuilds video files              |

### 🔍 Additional Notes

- `watch` **automatically rebuilds** files on changes and reloads the browser.
- `reset` clears caches and is recommended before a **full build** when starting fresh.
- **Avoid `npm update`** unless necessary—it may break dependencies.
