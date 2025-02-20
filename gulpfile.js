// =============================================================================
// # Staticus Website Compiler
// =============================================================================

// =============================================================================
// ## Document
// =============================================================================

/**
 * @function functionLibrary_*
 *
 * This prefix indicates that the function belongs to the `functionLibrary`
 * collection, which comprises utility functions designed to assist with
 * various operations within the codebase. Functions prefixed with
 * `functionLibrary_` are meant to provide reusable and consistent
 * functionality for tasks such as variable manipulation, file operations,
 * caching, and error handling.
 *
 * These functions are intended to be utilized as part of larger workflows
 * or processing tasks, ensuring that common operations are handled
 * efficiently and maintainability. The prefix helps distinguish these
 * utility functions from other parts of the code, promoting clarity and
 * organization.
 */

/**
 * @function functionProcess_primary_*
 *
 * This is the primary function for executing a specific task.
 * It serves as the main entry point that coordinates the workflow
 * and invokes necessary handler functions for processing.
 *
 * To accomplish the task effectively, use this function
 * rather than calling handler functions directly.
 */

/**
 * @function functionProcess_handle_*
 *
 * This function acts as a processing handler designed to
 * be executed as part of the `functionProcess_primary_*`
 * function. It is **not** intended to be run on its own.
 *
 * Always call the corresponding `functionProcess_primary_*`
 * function to ensure that tasks are processed correctly and
 * in the appropriate context.
 */

// =============================================================================
// ## Initialize
// =============================================================================

// -----------------------------------------------------------------------------
// ### Initialize - Node Module (Pre)
// -----------------------------------------------------------------------------

const loadedModules = {};

async function loadModule(moduleName, importPath = null, isESM = false) {
  if (loadedModules[moduleName]) {
    return loadedModules[moduleName]; // Return if already loaded
  }

  try {
    if (!isESM) {
      loadedModules[moduleName] = require(importPath || moduleName);
    } else {
      loadedModules[moduleName] = (await import(importPath || moduleName)).default;
    }
    return loadedModules[moduleName];
  } catch (error) {
    console.error(`Failed to load module: ${moduleName}`, error);
    return null;
  }
}

const NODE_FS   = require('fs');
const NODE_PATH = require('path');

// -----------------------------------------------------------------------------
// ### Initialize - Path (Pre)
// -----------------------------------------------------------------------------

const PATH_DIR_ROOT = `${NODE_PATH.resolve(__dirname)}/`;
const PATH_DIR_ROOT_CONFIG = `${PATH_DIR_ROOT}config/`;
const PATH_DIR_ROOT_CONFIG_DEFAULT = `${PATH_DIR_ROOT_CONFIG}default/`;
const PATH_DIR_ROOT_CONFIG_DEFAULT_PROJECT = `${PATH_DIR_ROOT_CONFIG_DEFAULT}project/`;
const PATH_DIR_ROOT_SOURCE = `${PATH_DIR_ROOT}source/`;
const PATH_DIR_ROOT_SOURCE_NODE_MODULES_CUSTOM = `${PATH_DIR_ROOT_SOURCE}node_modules_custom/`;

// -----------------------------------------------------------------------------
// ### Initialize - Utility
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// #### Initialize - Utility - ANSI
// -----------------------------------------------------------------------------

const NODE_CURE_ANSI = require(`${PATH_DIR_ROOT_SOURCE_NODE_MODULES_CUSTOM}cure-ansi`);
const ANSI = new NODE_CURE_ANSI.ANSI();

// -----------------------------------------------------------------------------
// #### Initialize - Utility - LOG
// -----------------------------------------------------------------------------

const NODE_CURE_LOG = require(`${PATH_DIR_ROOT_SOURCE_NODE_MODULES_CUSTOM}cure-log`);
const LOG = new NODE_CURE_LOG.Log(`${PATH_DIR_ROOT}_log/gulpfile.log`);

const LOG_TAG_STATICUS = '[🧩 Staticus]';

LOG.init(LOG_TAG_STATICUS, 'Initializing...');

// -----------------------------------------------------------------------------
// ##### Initialize - Utility - LOG - Extend
// -----------------------------------------------------------------------------

const LOG_TAG_LOG_EXTEND = '[📜 Log] [🌿 Extend]'

LOG.begin(LOG_TAG_LOG_EXTEND, 'Initializing...');

// Override the default warning handler in Node.js
// const originalEmitWarning = process.emitWarning;
process.emitWarning = function (message, ...args) {
  if (args[0] === 'DeprecationWarning') {
    // Pass the message to your custom function
    LOG.debug('⚠️ [Warning]', '🚧 [Deprecation]', {message});
  } else {
    LOG.warning(warningType, {message}, { details: args[1] });
    // // Call the original handler for non-deprecation warnings
    // originalEmitWarning.call(process, message, ...args);
  }
};

LOG.end(LOG_TAG_LOG_EXTEND, 'Complete.');

// -----------------------------------------------------------------------------
// ### Initialize - Path
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// #### Initialize - Path - Node Modules
// -----------------------------------------------------------------------------

function initPathDirNodeModules() {
  const LOG_TAG_PATH_NODE = '[🧩 Node.js PATH]';

  LOG.begin(LOG_TAG_PATH_NODE, 'Initializing...');

  const NODE_MODULE = require('module');
  const NODE_OS = require("os");

  // Determine the platform
  const PLATFORM_CURRENT = NODE_OS.platform(); // 'win32' for Windows, 'linux' for Linux

  // Define the custom node_modules path based on OS
  let PATH_DIR_ROOT_SOURCE_NODE_MODULES;
  if (PLATFORM_CURRENT === 'win32') {
    PATH_DIR_ROOT_SOURCE_NODE_MODULES = `${PATH_DIR_ROOT}source/node_modules/windows/`;
  } else if (PLATFORM_CURRENT === 'linux') {
    PATH_DIR_ROOT_SOURCE_NODE_MODULES = `${PATH_DIR_ROOT}source/node_modules/linux/`;
  } else {
    throw new Error(`Unsupported platform: ${PLATFORM_CURRENT}`);
  }

  // Update NODE_PATH
  process.env.NODE_PATH = [
    PATH_DIR_ROOT_SOURCE_NODE_MODULES,
    PATH_DIR_ROOT_SOURCE_NODE_MODULES_CUSTOM,
    ...(process.env.NODE_PATH ? process.env.NODE_PATH.split(NODE_PATH.delimiter) : [])
  ].filter(Boolean).join(NODE_PATH.delimiter);

  NODE_MODULE.Module._initPaths();

  LOG.debug(LOG_TAG_PATH_NODE, 'process.env.NODE_PATH:', (process.env.NODE_PATH || '').split(';'));

  LOG.end(LOG_TAG_PATH_NODE, 'Complete.');
}

initPathDirNodeModules();

// -----------------------------------------------------------------------------
// #### Initialize - Path - Process Environment
// -----------------------------------------------------------------------------

function initProcessEnv() {
  const NODE_OS = require("os");
  const NODE_PROCESS = require('process');

  const LOG_TAG_PROCESS_ENV = '[🧭 Environment PATH]';

  // Determine platform-specific GraphicsMagick binary path
  const PLATFORM_CURRENT = NODE_OS.platform(); // 'win32' for Windows, 'linux' for Linux
  let pathDirGraphicsMagick = '';

  // Add GraphicsMagick path to the environment's PATH variable
  if (PLATFORM_CURRENT === 'win32') {
    pathDirGraphicsMagick = NODE_PATH.join(PATH_DIR_ROOT, './source/tool/graphicsmagick/windows');
  } else if (PLATFORM_CURRENT === 'linux') {
    // FIXME Issue: "Add static GraphicsMagick for Linux #81"
    // pathDirGraphicsMagick = NODE_PATH.join(PATH_DIR_ROOT, './source/tool/graphicsmagick/linux/bin');
  } else {
    throw new Error(ANSI.format(ANSI.fg.red, 'Unsupported platform. Only Windows and Linux are supported.'));
  }

  LOG.begin(LOG_TAG_PROCESS_ENV, 'Initializing...');

  LOG.info(LOG_TAG_PROCESS_ENV, 'Looking for local GraphicsMagick for watermark support...');

  // Normalize path separators
  pathDirGraphicsMagick = pathDirGraphicsMagick.split(NODE_PATH.sep).join("/");

  if (pathDirGraphicsMagick) {
    // Check if the path exists before adding to PATH
    if (NODE_FS.existsSync(pathDirGraphicsMagick)) {
      const pathDelimiter = PLATFORM_CURRENT === "win32" ? ";" : ":";
      NODE_PROCESS.env.PATH = `${pathDirGraphicsMagick}${pathDelimiter}${NODE_PROCESS.env.PATH}`;
      LOG.success(LOG_TAG_PROCESS_ENV, 'GraphicsMagick local path added to process.env.PATH:', {pathDirGraphicsMagick});
    } else {
      LOG.notice(LOG_TAG_PROCESS_ENV, 'GraphicsMagick local path not found:', {pathDirGraphicsMagick});
    }
  } else {
    LOG.notice(LOG_TAG_PROCESS_ENV, 'No local GraphicsMagick path to add, will attempt to use a global installation for watermark support.');
  }

  LOG.debug(LOG_TAG_PROCESS_ENV, 'process.env.PATH:', (process.env.PATH || '').split(NODE_PATH.delimiter));

  LOG.end(LOG_TAG_PROCESS_ENV, 'Complete.');
}

initProcessEnv();

// -----------------------------------------------------------------------------
// ### Initialize - Info
// -----------------------------------------------------------------------------

const LOG_TAG_INFO = '[🧾 Info]';

LOG.init(LOG_TAG_INFO, 'Initializing...');

const CONFIG_INFO = require(NODE_PATH.join(PATH_DIR_ROOT, `source/resource/info.json`));

LOG.end(LOG_TAG_INFO, 'Complete.');

// -----------------------------------------------------------------------------
// ### Initialize - Project
// -----------------------------------------------------------------------------

const LOG_TAG_PROJECT = '[🏗️ Project]';

LOG.begin(LOG_TAG_PROJECT, 'Initializing...');

// -----------------------------------------------------------------------------
// #### Initialize - Project - Path
// -----------------------------------------------------------------------------

function getPathDirProject() {
  const PATH_FILE_CONFIG_SETTINGS = `${PATH_DIR_ROOT_CONFIG}settings.json`;
  const CONFIG_SETTINGS = require(PATH_FILE_CONFIG_SETTINGS);

  let dirPath = CONFIG_SETTINGS.dir;

  // Resolve relative paths based on the script's directory
  if (!NODE_PATH.isAbsolute(dirPath)) {
    dirPath = NODE_PATH.resolve(__dirname, dirPath);
  }

  return `${dirPath}/`;
}

const PATH_DIR_PROJECT = getPathDirProject();

// -----------------------------------------------------------------------------
// #### Initialize - Project - Info
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// #### Initialize - Project - Info - Version
// -----------------------------------------------------------------------------

const VERSION_COMPARE = {
  OLD: -1,
  EQUAL: 0,
  NEW: 1
};
function compareVersions(v1, v2) {
  const v1Parts = v1.split('.').map(Number);
  const v2Parts = v2.split('.').map(Number);

  for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
    const v1Part = v1Parts[i] || 0;
    const v2Part = v2Parts[i] || 0;

    if (v1Part > v2Part) return VERSION_COMPARE.NEW; // v1 is newer
    if (v1Part < v2Part) return VERSION_COMPARE.OLD; // v2 is newer
  }
  return VERSION_COMPARE.EQUAL; // Equal
}

// -----------------------------------------------------------------------------
// #### Initialize - Project - Info - Prompt
// -----------------------------------------------------------------------------

const NODE_READLINE = require('readline');

function promptUser(question, callback) {
  const rl = NODE_READLINE.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question(question, (answer) => {
    callback(answer.trim().toLowerCase());
    rl.close();
  });
}

// -----------------------------------------------------------------------------
// #### Initialize - Project - Info - Check
// -----------------------------------------------------------------------------

const LOG_TAG_PROJECT_INFO = LOG_TAG_PROJECT + ' ' + LOG_TAG_INFO;

let configProjectInfo = {};
let versionInfo = {
  project: '0.0.0',
  current: CONFIG_INFO.version,
  status: VERSION_COMPARE.EQUAL
};

const PATH_FILE_CONFIG_PROJECT_INFO = NODE_PATH.join(PATH_DIR_PROJECT, `info.json`);

function initProjectInfo() {
  LOG.begin(LOG_TAG_PROJECT_INFO, 'Running...');

  LOG.info(LOG_TAG_PROJECT_INFO, 'Checking project version...');

  if (!NODE_FS.existsSync(PATH_FILE_CONFIG_PROJECT_INFO)) {
    const CONFIG_PROJECT_INFO = {
      version: versionInfo.current
    };
    NODE_FS.writeFileSync(
      PATH_FILE_CONFIG_PROJECT_INFO,
      JSON.stringify(CONFIG_PROJECT_INFO, null, 2),
      'utf8'
    );
    LOG.info(LOG_TAG_PROJECT_INFO, 'Created new project info file with version:', versionInfo.current);
  }

  configProjectInfo = require(PATH_FILE_CONFIG_PROJECT_INFO);

  LOG.debug(LOG_TAG_PROJECT_INFO, {configProjectInfo});

  LOG.end(LOG_TAG_PROJECT_INFO, 'Complete.');
}

initProjectInfo();

const LOG_TAG_PROJECT_VERSION_CHECK = LOG_TAG_PROJECT + ' [✅ Version Check]';

versionInfo.project = configProjectInfo.version;

function initVersionCheck() {
  LOG.begin(LOG_TAG_PROJECT_VERSION_CHECK, 'Running...');

  versionInfo.status = compareVersions(versionInfo.project, versionInfo.current);

  LOG.detail(LOG_TAG_PROJECT_VERSION_CHECK, 'Version Info:', versionInfo);

  switch (versionInfo.status) {
    case VERSION_COMPARE.NEW: // running might fail
      LOG.warning(LOG_TAG_PROJECT_VERSION_CHECK,
        'Project was built using a newer version of Staticus, project may not be compatible...'
      );
      break;
    case VERSION_COMPARE.OLD: // update available
      LOG.info(LOG_TAG_PROJECT_VERSION_CHECK,
        'Project was built using a older version of Staticus. An in-place upgrade will be performed to continue...'
      );
      break;
    default:
      LOG.success(LOG_TAG_PROJECT_VERSION_CHECK, 'Versions match. Proceeding with tasks.');
  }

  function userAbort() {
    LOG.info(LOG_TAG_PROJECT_VERSION_CHECK, '[🛑 Aborted]', 'Process aborted by user.');
    process.exit(0);
  }

  if (versionInfo.status != VERSION_COMPARE.EQUAL) {
    promptUser('Would you like to continue anyway? (yes/no): ', (response) => {
      if (!(response === 'yes' || response === 'y')) {
        userAbort();
      }
    });

    if (versionInfo.status == VERSION_COMPARE.NEW) {
      promptUser('Project may not be compatible, are you absolutely sure? (yes/no): ', (response) => {
        if (!(response === 'yes' || response === 'y')) {
          userAbort();
        }
      });
    }

    LOG.info(LOG_TAG_PROJECT_VERSION_CHECK, 'Process continued by user.');
  }

  LOG.end(LOG_TAG_PROJECT_VERSION_CHECK, 'Complete.');
}

initVersionCheck();

LOG.init(LOG_TAG_PROJECT_INFO, 'Complete.');

// -----------------------------------------------------------------------------
// #### Initialize - Project - Info - Upgrade
// -----------------------------------------------------------------------------

// const LOG_TAG_PROJECT_UPGRADE = LOG_TAG_PROJECT + ' [⬆️ Upgrade]';

// function projectUpgrade() {
//   LOG.begin(LOG_TAG_PROJECT_UPGRADE, 'Running...');

//   if (!isProjectVersionUpgrade) {
//     LOG.notice('No project upgrade needed.')
//   }

//   const PATH_FILE_CONFIG_PROJECT_INFO = NODE_PATH.join(PATH_DIR_PROJECT, `info.json`);

//   if (isProjectVersionUpgrade === 'new') {
//     // create CONFIG_PROJECT_INFO populated with CONFIG_INFO.version
//     const CONFIG_PROJECT_INFO = {
//       version: CONFIG_INFO.version
//     };
//     NODE_FS.writeFileSync(PATH_FILE_CONFIG_PROJECT_INFO, JSON.stringify(CONFIG_PROJECT_INFO, null, 2));
//     LOG.info(LOG_TAG_PROJECT_UPGRADE, 'Created new project info file with version:', CONFIG_INFO.version);
//   }
//   else {

//   }

//   LOG.end(LOG_TAG_PROJECT_UPGRADE, 'Complete.');
// }

// -----------------------------------------------------------------------------
// ### Initialize - Config
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// #### Initialize - Config - Ensure
// -----------------------------------------------------------------------------

const LOG_TAG_CONFIG = '[⚙️ Config]';

function initStaticusDefaults() {
  LOG.begin(LOG_TAG_CONFIG, 'Initializing...');
  require('staticus-defaults').configEnsure(); // Ensure config is initialized before anything else
  LOG.end(LOG_TAG_CONFIG, 'Complete.');
}

initStaticusDefaults();

// -----------------------------------------------------------------------------
// #### Initialize - Config - Common
// -----------------------------------------------------------------------------

// function getConfigValue(config, path) {
//   // Try to get the value from the config object
//   const value = path.split('.').reduce((acc, key) => {
//     return acc && acc[key] !== undefined ? acc[key] : undefined;
//   }, config);

//   return value !== undefined ? value : undefined;
// }

// Utility to flatten nested config objects into `CONFIG_*` placeholders
function getConfigFlat(config, prefix = 'CONFIG_', result = {}, pathCurrent = '') {
  // Ensure the input is an object
  if (typeof config !== 'object' || config === null) {
    LOG.error(LOG_TAG_CONFIG, 'Invalid configuration object.');
    return result; // Return empty result if input is not a valid object
  }

  Object.keys(config).forEach(key => {
    const CONFIG_VALUE = config[key];
    const PATH_NEW = pathCurrent ? `${pathCurrent}.${key}` : key;

    if (typeof CONFIG_VALUE === 'object' && CONFIG_VALUE !== null) {
      // Recursively process nested objects
      getConfigFlat(CONFIG_VALUE, prefix, result, PATH_NEW);
    } else {
      // Replace dots with underscores and convert to uppercase
      const KEY_FLAT = `${prefix}${PATH_NEW.replace(/\./g, '_').toUpperCase()}`;
      result[KEY_FLAT] = CONFIG_VALUE;
    }
  });

  return result;
}

// -----------------------------------------------------------------------------
// #### Initialize - Config - Project
// -----------------------------------------------------------------------------

const LOG_TAG_CONFIG_PROJECT = LOG_TAG_CONFIG + ' ' + LOG_TAG_PROJECT;

const PATH_FILE_CONFIG_PROJECT = `${PATH_DIR_PROJECT}config.json`;

// Load default project config once
const CONFIG_PROJECT_DEFAULT = require(`${PATH_DIR_ROOT_CONFIG_DEFAULT_PROJECT}config.json`);

let configProject = {};
let configProjectMerge = {};
let configProjectFlat = {};

// Utility function to deeply merge objects
function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key])
    ) {
      if (!target[key] || typeof target[key] !== 'object') {
        target[key] = {};
      }
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

function loadConfigProject() {
  LOG.begin(LOG_TAG_CONFIG_PROJECT, 'Loading...');

  // Log the file being processed
  LOG.info(LOG_TAG_CONFIG_PROJECT, 'Processing file:', { PATH_FILE_CONFIG_PROJECT });

  // Clear cache if it exists
  if (require.cache[require.resolve(PATH_FILE_CONFIG_PROJECT)]) {
    delete require.cache[require.resolve(PATH_FILE_CONFIG_PROJECT)];
  }

  // Reload the project config
  try {
    configProject = require(PATH_FILE_CONFIG_PROJECT);
    LOG.success(LOG_TAG_CONFIG_PROJECT, 'Project configuration loaded.');
  } catch (error) {
    LOG.warning(LOG_TAG_CONFIG_PROJECT, `Failed to load ${PATH_FILE_CONFIG_PROJECT}, using defaults.`, error);
    configProject = {};
  }

  // Ensure required variables exist in project config
  const requiredKeys = Object.keys(CONFIG_PROJECT_DEFAULT.require || {});
  let missingKeys = [];
  let duplicateKeys = [];
  let uniqueValueCheck = new Set();

  requiredKeys.forEach(key => {
    const projectValue = configProject.require?.[key];
    const defaultValue = CONFIG_PROJECT_DEFAULT.require[key];

    if (projectValue === undefined || projectValue === null) {
      // If the required key is missing in project config, use the default
      configProject.require = configProject.require || {};
      configProject.require[key] = defaultValue;
      missingKeys.push(key);
    }

    // Check for duplicate values across required fields
    if (uniqueValueCheck.has(projectValue)) {
      duplicateKeys.push(key);
    } else {
      uniqueValueCheck.add(projectValue);
    }
  });

  // Log warnings for missing or duplicate keys
  if (missingKeys.length > 0) {
    LOG.warning(LOG_TAG_CONFIG_PROJECT, `Missing required keys in project config. Using defaults:`, missingKeys);
  }
  if (duplicateKeys.length > 0) {
    LOG.error(LOG_TAG_CONFIG_PROJECT, `Duplicate values detected in required config fields:`, duplicateKeys);
    process.exit(1); // Terminate execution if duplicates are found
  }

  // Deep merge default config with project config (project config takes priority)
  configProjectMerge = deepMerge({ ...CONFIG_PROJECT_DEFAULT }, configProject);
  LOG.debug(LOG_TAG_CONFIG_PROJECT, 'Merged Config Values:', configProjectMerge);

  // Create a shallow copy of configProjectMerge without the 'option' property
  const { option, ...configProjectMergeWithoutOption } = configProjectMerge;

  // Flatten config without 'option'
  configProjectFlat = getConfigFlat(configProjectMergeWithoutOption);

  LOG.end(LOG_TAG_CONFIG_PROJECT, 'Loaded.');
}

loadConfigProject();

LOG.init(LOG_TAG_STATICUS, 'Complete.');

// =============================================================================
// ## Variable
// =============================================================================

// -----------------------------------------------------------------------------
// ### Variable - Path
// -----------------------------------------------------------------------------

const LOG_TAG_PATH = '[🛤️ Path]';

LOG.begin(LOG_TAG_PATH, 'Initializing...');

const PATH_ROOT = './';
const PATH_ALL = `**/*`;

const PATH_DIR_PROJECT_IN        = `${PATH_DIR_PROJECT}in/`;
const PATH_DIR_PROJECT_OUT       = `${PATH_DIR_PROJECT}out/`;
const PATH_DIR_PROJECT_IN_ASSET  = `${PATH_DIR_PROJECT_IN}asset/`;
const PATH_DIR_PROJECT_OUT_ASSET = `${PATH_DIR_PROJECT_OUT}asset/`;

const PATH_DIR_OUT_SOURCEMAP = PATH_ROOT;

const getPathIgnorePrefix = () => configProjectMerge.option.path.ignore_prefix;
const getPathIgnoreAll = () => `**/${getPathIgnorePrefix()}*`;

const createPathIgnoreArray = (basePath = '') => [
  `!${basePath}${getPathIgnorePrefix()}*`, // Excludes any files directly under `basePath` starting with `path.ignore_prefix`
  `!${basePath}${getPathIgnoreAll()}`,     // Excludes any file or directory directly under any level within `basePath` that starts with `path.ignore_prefix`
  `!${basePath}${getPathIgnoreAll()}/**`   // Excludes any subdirectory starting with `path.ignore_prefix` and all its contents
];

const PATH_DIR_IN_IGNORE_BASE_ROOT    = PATH_ROOT;
const PATH_DIR_IN_IGNORE_BASE_PROJECT = PATH_DIR_PROJECT_IN;

const PATH_DIR_IN_IGNORE_ROOT    = createPathIgnoreArray(PATH_DIR_IN_IGNORE_BASE_ROOT);
const PATH_DIR_IN_IGNORE_PROJECT = createPathIgnoreArray(PATH_DIR_IN_IGNORE_BASE_PROJECT);

const PATH_DIR_IN_IGNORE_PROJECT_ASSET = `!${PATH_DIR_PROJECT_IN_ASSET}`;

LOG.end(LOG_TAG_PATH, 'Initialized:', {
  "PATH_DIR_PROJECT": PATH_DIR_PROJECT,
  "PATH_DIR_PROJECT_IN": PATH_DIR_PROJECT_IN
  // ,
  // "getPathIgnorePrefix": getPathIgnorePrefix()
});

// =============================================================================
// ## Node Modules
// =============================================================================

const NODE_GULP           = require('gulp');
const NODE_CHILD_PROCESS  = require('child_process');
const NODE_GULP_IF        = require('gulp-if');
const NODE_GULP_REPLACE   = require('gulp-replace');
const NODE_GULP_RENAME    = require('gulp-rename');
const NODE_GULP_SOURCEMAP = require('gulp-sourcemaps');
const NODE_GULP_TAP       = require('gulp-tap');
const NODE_CHOKIDAR       = require('chokidar');
const NODE_PICOMATCH      = require('picomatch');
const NODE_TIMERS         = require('timers');

// =============================================================================
// ## Library
// =============================================================================

// -----------------------------------------------------------------------------
// ### Library - Brand
// -----------------------------------------------------------------------------

function appendBrandComment() {
  return NODE_GULP_TAP(file => {
    let content = file.contents.toString();
    let comment = "";
    const COMMENT_BODY = `Built with Staticus Website Compiler ${CONFIG_INFO.version}`

    if (file.path.endsWith('.html') || file.path.endsWith('.xml')) {
      comment = `<!-- ${COMMENT_BODY} -->`;
    } else if (file.path.endsWith('.css') || file.path.endsWith('.js')) {
      comment = `/* ${COMMENT_BODY} */`;
    }
    // else if (file.path.endsWith('.txt')) || file.path.endsWith('.md')) {
    //   comment = ` (${COMMENT_BODY})`;
    // }

    file.contents = Buffer.from(content + comment);
  });
}

// -----------------------------------------------------------------------------
// ### Library - Variable
// -----------------------------------------------------------------------------

function functionLibrary_variable_ensureIsArray(value) {
  return Array.isArray(value) ? value : [value];
}

// -----------------------------------------------------------------------------
// ### Library - Path
// -----------------------------------------------------------------------------

// Normalize paths for consistent matching
const functionLibrary_path_normalize = (path) => path.replace(/\\/g, '/');

const LOG_TAG_PATH_EXIST = '[🔍 Path Exist]';

function functionLibrary_path_exists(path) {
  LOG.debug(LOG_TAG_PATH_EXIST, 'Checking path existance:', {path});

  if (!NODE_FS.existsSync(path)) {
    LOG.warn(LOG_TAG_PATH_EXIST, 'Path not found:', {path});
    return false;
    // return Readable({ objectMode: true }).push(null); // returns an empty pipeline, for use in a pipeline
  }

  LOG.debug(LOG_TAG_PATH_EXIST, 'Path found:', {path});

  return true;
}

// -----------------------------------------------------------------------------
// ### Library - File
// -----------------------------------------------------------------------------

function functionLibrary_file_getRootRelativePath(path) {
  return NODE_PATH.relative(PATH_DIR_PROJECT, path)
}

function functionLibrary_file_getInfo(file) {
  return {
    path: functionLibrary_file_getRootRelativePath(file.path),
    size: `${(file.contents.length / 1024).toFixed(2)} KB`, // Calculate file size in KB
  };
}

function functionLibrary_file_isDirectory(path) {
  return NODE_FS.lstatSync(path).isDirectory();
}

function functionLibrary_file_getSubdirectories(path) {
  return NODE_FS.readdirSync(path, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
}

async function functionLibrary_file_countFiles(path) {
  const entries = await NODE_FS.promises.readdir(path, { withFileTypes: true });
  let count = 0;
  for (const entry of entries) {
    if (entry.isDirectory()) {
      count += await functionLibrary_file_countFiles(`${path}/${entry.name}`);
    } else {
      count++;
    }
  }
  return count;
}

const LOG_TAG_LIST_FILES = '[📄 List Files]';

async function functionLibrary_file_listFiles(path, recursive = true, verbose = 0) {
  LOG.info(LOG_TAG_LIST_FILES, `${verbose ? 'Listing' : 'Counting'} files in \`${path}\` (recursive: ${recursive}):`)

  return new Promise((resolve, reject) => {
    let files = [];

    function readDirectory(dir) {
      let items;
      try {
        items = NODE_FS.readdirSync(dir, { withFileTypes: true });
      } catch (err) {
        LOG.error(LOG_TAG_LIST_FILES, 'Error reading directory contents:', err);
        reject(err);
        return;
      }

      items.forEach(item => {
        const fullPath = NODE_PATH.join(dir, item.name);
        if (recursive && item.isDirectory()) {
          readDirectory(fullPath);
        } else {
          files.push(fullPath);
        }
      });
    }

    try {
      // Check if directory exists before attempting to read it
      if (!NODE_FS.existsSync(path)) {
        LOG.error(LOG_TAG_LIST_FILES, 'Directory does not exist:', path);
        resolve([]);  // Return an empty array if directory doesn't exist
        return;
      }

      readDirectory(path);

      if (verbose) {
        LOG.detail(LOG_TAG_LIST_FILES, 'Files:', files);
      }

      LOG.detail(LOG_TAG_LIST_FILES, `${verbose ? 'Listing' : 'Counting'} files in:`, path, '(recursive:', recursive, ') complete, total:', files.length);

      resolve(files);
    } catch (err) {
      LOG.error(LOG_TAG_LIST_FILES, 'Reading matched files directory:', err);
      reject(err);
    }
  });
}

const VERBOSE_LISTFILES = {
  NONE: 0,
  BASIC: 1,
  DETAIL: 2
};

const LOG_TAG_LIST_FILES_MATCHED = '[📄 List Files Matched]';

async function functionLibrary_file_listFilesMatched(globPattern, globPatternIgnoreBase, verbose = VERBOSE_LISTFILES.NONE) {
  globPattern = functionLibrary_variable_ensureIsArray(globPattern);

  LOG.begin(LOG_TAG_LIST_FILES_MATCHED, 'Begin...');

  const NODE_MINIMATCH = require('minimatch');

  try {
    await new Promise(async (resolve, reject) => {
      let files = [];
      let files_count_allowed = 0;
      let files_count_ignored = 0;

      LOG.info(LOG_TAG_LIST_FILES_MATCHED, 'Listing files matched with Glob Pattern:', globPattern);

      const glob_pattern_allow = globPattern.filter(pattern => typeof pattern === 'string' && !pattern.startsWith('!'));
      const glob_pattern_exclude = globPattern.filter(pattern => typeof pattern === 'string' && pattern.startsWith('!'));

      LOG.detail(LOG_TAG_LIST_FILES_MATCHED, '✅ Pattern Allow:',  glob_pattern_allow);
      LOG.detail(LOG_TAG_LIST_FILES_MATCHED, '⛔ Pattern Ignore:', glob_pattern_exclude);

      NODE_GULP.src(glob_pattern_allow, {encoding: false})
        .on('data', function(file) {
          files.push(file.path);
        })

        .on('end', async () => {
          for (const file of files) {
            // let relativePath = NODE_PATH.relative(process.cwd(), file);
            // LOG.info(LOG_TAG_LIST_FILES_MATCHED, 'Checking file:', relativePath);
            let normalizedPath = NODE_PATH.relative(process.cwd(), file).replace(/\\/g, '/');

            if (verbose > VERBOSE_LISTFILES.BASIC) {
              LOG.detail(LOG_TAG_LIST_FILES_MATCHED, 'Normalized Checking file:', normalizedPath);
            }

            const isDirectory = functionLibrary_file_isDirectory(file);

            if (verbose > VERBOSE_LISTFILES.BASIC) {
              LOG.detail(LOG_TAG_LIST_FILES_MATCHED, 'isDirectory:', isDirectory ? '📁 Directory' : '📄 File');
            }

            let isDisallowed = glob_pattern_exclude.some(pattern => {
              // let adjustedPattern = pattern.replace('!', '');
              let adjustedPattern = pattern.replace(`!${globPatternIgnoreBase}`, '').replace(/\\/g, '/');

              if (verbose > VERBOSE_LISTFILES.BASIC) {
                LOG.detail(LOG_TAG_LIST_FILES_MATCHED, 'Against pattern:', adjustedPattern);
              }

              return NODE_MINIMATCH.minimatch(normalizedPath, adjustedPattern);
            });

            if (isDisallowed) {
              if (verbose > VERBOSE_LISTFILES.NONE) {
                LOG.detail(LOG_TAG_LIST_FILES_MATCHED, '⛔ Ignore:', NODE_PATH.relative(process.cwd(), file));
              }

              if (isDirectory) {
                let count = await functionLibrary_file_countFiles(file);

                if (verbose > VERBOSE_LISTFILES.BASIC) {
                  LOG.detail(LOG_TAG_LIST_FILES_MATCHED, 'Directory contains:', count, 'files');
                }

                files_count_ignored += count;
              } else {
                files_count_ignored++;
              }

              if (verbose > VERBOSE_LISTFILES.BASIC) {
                LOG.detail(LOG_TAG_LIST_FILES_MATCHED, '▶️ files_count_ignored:', files_count_ignored);
              }
            } else {
              if (verbose > VERBOSE_LISTFILES.NONE) {
                LOG.detail(LOG_TAG_LIST_FILES_MATCHED, '✅ Allow:', NODE_PATH.relative(process.cwd(), file));
              }

              if (!isDirectory) {
                files_count_allowed++;
              }

              if (verbose > VERBOSE_LISTFILES.BASIC) {
                LOG.detail(LOG_TAG_LIST_FILES_MATCHED, '▶️ files_count_allowed:', files_count_allowed);
              }
            }
          }

          let logData = verbose > VERBOSE_LISTFILES.NONE
            ? { "globPattern": globPattern }
            : {};

          Object.assign(logData, {
            "Total ✅ allowed files listed:": files_count_allowed,
            "Total ⛔ ignored files:": files_count_ignored
          });

          LOG.end(LOG_TAG_LIST_FILES_MATCHED, "Complete:", logData);

          resolve();
        })

        .on('error', (err) => {
          LOG.error(LOG_TAG_LIST_FILES_MATCHED, 'Error during matching files:', err);
          reject(err);
        });
    });
  } catch (error) {
    LOG.error(LOG_TAG_LIST_FILES_MATCHED, 'Error listing matched files:', error);
  }
}

// -----------------------------------------------------------------------------
// ### Library - Cache
// -----------------------------------------------------------------------------

class Cache {
  /**
   * Constructor for the Cache class.
   * @param {string} pathSiteCache - Path to the cache file.
   * @param {string} pathIn - Path representing the input source for caching.
   */
  constructor(pathSiteCache, pathIn) {
    this.LOG_TAG_CACHE = '🗃️ [Cache]';
    this.LOG_TAG_CACHE_REMOVE_ENTRY = this.LOG_TAG_CACHE + ' 🗑️ [Remove Entry]';

    LOG.init(this.LOG_TAG_CACHE, 'Initializing...');

    this.NODE_CUSTOM_GULP_ONCE       = require('custom-gulp-once');
    this.NODE_CUSTOM_GULP_ONCE_CLEAR = require('custom-gulp-once/clear');

    this.pathSiteCache = pathSiteCache;
    this.pathIn = pathIn;

    this.cacheConfig = {
      file: pathSiteCache, // Path to the cache file
      fileIndent: 2, // Indentation for the file
    };

    LOG.init(this.LOG_TAG_CACHE, 'Initialized.');
  }

  /**
   * Creates a caching stream using custom-gulp-once.
   * @param {string} namespace - The namespace to use for the cache.
   * @returns {Function} - The custom gulp caching function.
   */
  pipe(namespace) {
    return this.NODE_CUSTOM_GULP_ONCE({
      ...this.cacheConfig,
      context: this.pathIn,
      namespace: namespace,
    });
  }

  /**
   * Clears the cache, either completely or for a specific namespace.
   * @param {string|null} namespace - The namespace to clear. Clears all if not provided.
   */
  clear(namespace = 'all') {
    if (namespace == null) {
      return;
    }

    LOG.info(this.LOG_TAG_CACHE, 'Clearing:', {namespace});

    let clearConfig = {
      ...this.cacheConfig, // Spread the shared config - Clear all by default
    };

    if (namespace !== 'all') {
      clearConfig.namespace = namespace; // Add namespace if provided
    }

    this.NODE_CUSTOM_GULP_ONCE_CLEAR(clearConfig);

    LOG.info(this.LOG_TAG_CACHE, 'Cleared:', {namespace});
  }

  /**
   * Removes a specific cache entry or an entire namespace from the cache file.
   * @param {string} namespace - The namespace to target.
   * @param {string|null} key - The specific key within the namespace to remove. If null, removes the entire namespace.
   */
  remove(namespace, key = null) {
    LOG.begin(this.LOG_TAG_CACHE_REMOVE_ENTRY, 'Running...');

    if (!namespace) {
      LOG.info(this.LOG_TAG_CACHE_REMOVE_ENTRY, 'No cache namespace to remove an entry from.');
    }
    else {
      try {
        LOG.info(this.LOG_TAG_CACHE_REMOVE_ENTRY, 'Removing cache entry:', { namespace, key });

        // Load the cache file
        const cacheData = JSON.parse(NODE_FS.readFileSync(this.pathSiteCache, 'utf8'));

        if (cacheData[namespace]) {
          if (key === null || key === undefined) {
            // Remove the entire namespace if key is not provided
            delete cacheData[namespace];
            LOG.success(this.LOG_TAG_CACHE_REMOVE_ENTRY, 'Entire namespace removed:', { namespace });
          } else if (cacheData[namespace][key]) {
            // Remove the specified entry within the namespace
            delete cacheData[namespace][key];
            LOG.success(this.LOG_TAG_CACHE_REMOVE_ENTRY, 'Entry', { key }, 'removed from namespace:', { namespace });

            // Check if the namespace is now empty
            if (Object.keys(cacheData[namespace]).length === 0) {
              delete cacheData[namespace];
              LOG.success(this.LOG_TAG_CACHE_REMOVE_ENTRY, 'Removed empty namespace:', { namespace });
            }
          } else {
            LOG.debug(this.LOG_TAG_CACHE_REMOVE_ENTRY, 'Entry', { key }, 'not found in namespace:', { namespace });
            LOG.info(this.LOG_TAG_CACHE_REMOVE_ENTRY, 'Nothing to remove:', { namespace, key });
          }
        } else {
          LOG.debug(this.LOG_TAG_CACHE_REMOVE_ENTRY, 'Namespace not found in cache:', { namespace });
          LOG.info(this.LOG_TAG_CACHE_REMOVE_ENTRY, 'Nothing to remove:', { namespace });
        }

        // Write back the updated cache
        NODE_FS.writeFileSync(
          this.pathSiteCache,
          JSON.stringify(cacheData, null, 2), // Pretty print for better readability
          'utf8'
        );
      } catch (error) {
        LOG.error(this.LOG_TAG_CACHE_REMOVE_ENTRY, 'Updating:', { error });
      }
    }

    LOG.end(this.LOG_TAG_CACHE_REMOVE_ENTRY, 'Complete.');
  }
}

const CACHE_PROJECT = new Cache(`${PATH_DIR_PROJECT}cache.json`, PATH_DIR_PROJECT_IN);

// -----------------------------------------------------------------------------
// ### Library - Plumber
// -----------------------------------------------------------------------------

const LOG_TAG_PLUMBER = '[🚰 Plumber]';

function functionLibrary_plumber(isActiveCallback = () => true) {
  LOG.info(LOG_TAG_PLUMBER, 'Running...');

  const NODE_GULP_PLUMBER = require('gulp-plumber');

  const plumberStream = NODE_GULP_PLUMBER({
    errorHandler: function (error) {
      if (isActiveCallback()) {
        LOG.error(LOG_TAG_PLUMBER, 'Error occurred:', error);
      }
      this.emit('end'); // Prevents calling the callback more than once
    }
  });

  let fileCount = 0;

  plumberStream.on('data', (file) => {
    if (isActiveCallback() && !functionLibrary_file_isDirectory(file.path)) {
      fileCount++;
      LOG.detail(LOG_TAG_PLUMBER, 'Processing:', {
        "File count": fileCount,
        ...functionLibrary_file_getInfo(file)
      });
    }
  });

  // Listen for the 'end' or 'finish' event
  plumberStream.on('end', () => {
    LOG.detail(LOG_TAG_PLUMBER, 'Files processed count:', fileCount);
    LOG.info(LOG_TAG_PLUMBER, 'Complete.');
  });

  return plumberStream;
}

// =============================================================================
// ## Process Helper
// =============================================================================

// -----------------------------------------------------------------------------
// ### Process Helper - Plumber
// -----------------------------------------------------------------------------

function functionProcess_handle_plumber(done, cache_namespace, path_in, file_in, path_out) {
  LOG.info(LOG_TAG_PLUMBER, 'Processing:', { cache_namespace, path_in, file_in, path_out });

  if (!functionLibrary_path_exists(path_in)) {
    return done(); // Call done immediately if path does not exist
  }

  const PIPELINE = NODE_GULP.src(file_in, {encoding: false})
    .pipe(functionLibrary_plumber())
    .pipe(CACHE_PROJECT.pipe(cache_namespace))
    .pipe(NODE_GULP.dest(path_out));

  if (PIPELINE && typeof PIPELINE.on === 'function') {
    PIPELINE.on('end', done).on('error', done);
  } else {
    done(new Error('functionProcess_handle_plumber did not return a valid Gulp stream.'));
  }
}

// =============================================================================
// ## Process
// =============================================================================

// -----------------------------------------------------------------------------
// ### Process - About
// -----------------------------------------------------------------------------

const LOG_TAG_ABOUT = '[📘 About]';

function functionProcess_primaryGroup_about(done) {
  LOG.begin(LOG_TAG_ABOUT, 'Initializing...');

  LOG.info(LOG_TAG_ABOUT, {
    "Staticus": CONFIG_INFO,
    "Selected Project": {
      PATH_DIR_PROJECT,
      PATH_FILE_CONFIG_PROJECT,
      ...configProjectInfo,
    }
  })

  LOG.end(LOG_TAG_ABOUT, 'Complete.');
  done();
}

// -----------------------------------------------------------------------------
// ### Process - Audio
// -----------------------------------------------------------------------------

const CACHE_NAMESPACE_AUDIO = 'audio';

const PATH_DIR_PROJECT_IN_ASSET_AUDIO  =  `${PATH_DIR_PROJECT_IN_ASSET}audio/`;
const PATH_DIR_PROJECT_OUT_ASSET_AUDIO =  `${PATH_DIR_PROJECT_OUT_ASSET}audio/`;
const PATH_FILE_PROJECT_IN_ASSET_AUDIO = [
  `${PATH_DIR_PROJECT_IN_ASSET_AUDIO}${PATH_ALL}.*`,
  ...PATH_DIR_IN_IGNORE_PROJECT
];

function functionProcess_primary_audio(done) {
  functionProcess_handle_plumber(
    done,
    CACHE_NAMESPACE_AUDIO,
    PATH_DIR_PROJECT_IN_ASSET_AUDIO,
    PATH_FILE_PROJECT_IN_ASSET_AUDIO,
    PATH_DIR_PROJECT_OUT_ASSET_AUDIO
  );
};

// -----------------------------------------------------------------------------
// ### Process - Brand
// -----------------------------------------------------------------------------

const PATH_DIR_PROJECT_IN_ASSET_BRAND = `${PATH_DIR_PROJECT_IN_ASSET}brand/`;
const PATH_DIR_PROJECT_IN_ASSET_BRAND_ICONS = {
  foreground:      `${PATH_DIR_PROJECT_IN_ASSET_BRAND}foreground.png`,
  foreground_wide: `${PATH_DIR_PROJECT_IN_ASSET_BRAND}foreground_wide.png`,
  background:      `${PATH_DIR_PROJECT_IN_ASSET_BRAND}background.png`
};
const PATH_FILE_PROJECT_IN_ASSET_BRAND = [
  ...Object.values(PATH_DIR_PROJECT_IN_ASSET_BRAND_ICONS),  // Extracts all icon paths
  ...PATH_DIR_IN_IGNORE_PROJECT
];
const PATH_DIR_PROJECT_IN_ASSET_BRAND_IMAGE  = `${PATH_DIR_PROJECT_IN_ASSET}image/favicon/`;
const PATH_FILE_PROJECT_IN_ASSET_BRAND_ICO   = `${PATH_DIR_PROJECT_IN}favicon.ico`;
const PATTERN_RESET_BRAND = [
  PATH_DIR_PROJECT_IN_ASSET_BRAND_IMAGE,
  PATH_FILE_PROJECT_IN_ASSET_BRAND_ICO
];

function functionProcess_primary_brand(done) {
  const LOG_TAG_BRAND = '[🏷️ Brand]';

  LOG.begin(LOG_TAG_BRAND, 'Generating icons...');

  const options = {
    inputForeground:     PATH_DIR_PROJECT_IN_ASSET_BRAND_ICONS.foreground,
    inputForegroundWide: PATH_DIR_PROJECT_IN_ASSET_BRAND_ICONS.foreground_wide,
    inputBackground:     PATH_DIR_PROJECT_IN_ASSET_BRAND_ICONS.background,
    outputImage:         PATH_DIR_PROJECT_IN_ASSET_BRAND_IMAGE,
    outputIco:           PATH_FILE_PROJECT_IN_ASSET_BRAND_ICO,
    setting:             configProjectMerge.option.brand,
  };

  const NODE_STATICUS_BRAND = require('staticus-brand');

  NODE_STATICUS_BRAND(options)
    .then(() => {
      LOG.success(LOG_TAG_BRAND, 'Generating icons complete.');

      LOG.end(LOG_TAG_BRAND, 'Complete.');

      done(); // Notify completion
    })
    .catch((err) => {
      LOG.error(LOG_TAG_BRAND, 'Error processing favicon:', err);
      done(err); // Notify with error
    });
}

// -----------------------------------------------------------------------------
// ### Process - Config
// -----------------------------------------------------------------------------

const CACHE_NAMESPACE_CONFIG = 'config';

function functionProcess_handle_config(done) {
  LOG.begin(LOG_TAG_CONFIG_PROJECT, 'Running...');

  LOG.info(LOG_TAG_CONFIG_PROJECT, 'Checking for changes...'); // Before loading the project config file

  let configProjectChangesFound = false; // Initialize a flag to track if changes are found

  NODE_GULP.src(PATH_FILE_CONFIG_PROJECT)
    .pipe(functionLibrary_plumber())

    .pipe(CACHE_PROJECT.pipe(CACHE_NAMESPACE_CONFIG))

    .on('data', (file) => {
      configProjectChangesFound = true; // Set the flag to true if data is found

      LOG.info(LOG_TAG_CONFIG_PROJECT, 'Changes found, loading:');

      loadConfigProject();

      LOG.info(LOG_TAG_CONFIG_PROJECT, 'Memory has been updated.'); // Log the updated project config
    })

    .on('end', () => {
      if (!configProjectChangesFound) { // Check if changes were found
        LOG.info(LOG_TAG_CONFIG_PROJECT, 'No changes found.'); // Report if no changes were found
      }

      LOG.end(LOG_TAG_CONFIG_PROJECT, 'Complete.');

      done();
    })

    .on('error', (err) => {
      LOG.error(LOG_TAG_CONFIG_PROJECT, 'During update:', err); // Log the error
      done();
    });
}

// -----------------------------------------------------------------------------
// ### Process - Data
// -----------------------------------------------------------------------------

const CACHE_NAMESPACE_DATA = 'data';

const PATH_DIR_PROJECT_IN_DATA  = PATH_DIR_PROJECT_IN;
const PATH_DIR_PROJECT_OUT_DATA = PATH_DIR_PROJECT_OUT;

const DATA_FILES = ['manifest.webmanifest', 'browserconfig.xml'];

const PATH_FILE_PROJECT_IN_DATA = [
  ...DATA_FILES.map(file => `${PATH_DIR_PROJECT_IN_DATA}${file}`),
  ...PATH_DIR_IN_IGNORE_PROJECT
];

const PATTERN_RESET_DATA = DATA_FILES.map(file => `${PATH_DIR_PROJECT_OUT_DATA}${file}`);

function functionProcess_primary_data() {
  const LOG_TAG_DATA = '[💽 Data]';

  LOG.begin(LOG_TAG_DATA, 'Running...');

  let pipelineData = NODE_GULP.src(PATH_FILE_PROJECT_IN_DATA, { allowEmpty: true })

    .pipe(functionLibrary_plumber())

    .pipe(CACHE_PROJECT.pipe(CACHE_NAMESPACE_DATA));

  // Dynamically add `NODE_GULP_REPLACE` pipes for each replacement
  Object.entries(configProjectFlat).forEach(([placeholder, value]) => {
      pipelineData = pipelineData.pipe(NODE_GULP_REPLACE(placeholder, value));
  });

  return pipelineData
    .pipe(appendBrandComment()) // Append comment before output
    .pipe(NODE_GULP.dest(PATH_DIR_PROJECT_OUT_DATA)) // Output to the specified directory
    .on('end', () => {
      LOG.end(LOG_TAG_DATA, 'Complete.');
    });
};

// -----------------------------------------------------------------------------
// ### Process - Favicon
// -----------------------------------------------------------------------------

const CACHE_NAMESPACE_FAVICON = 'favicon';

const PATH_DIR_PROJECT_IN_FAVICON  =    PATH_DIR_PROJECT_IN;
const PATH_DIR_PROJECT_OUT_FAVICON =    PATH_DIR_PROJECT_OUT;
const PATH_FILE_PROJECT_IN_FAVICON = `${PATH_DIR_PROJECT_IN_FAVICON}favicon.ico`;
const PATTERN_RESET_FAVICON        = `${PATH_DIR_PROJECT_OUT_FAVICON}favicon.ico`;

// Create a Gulp task to handle the .ico file
function functionProcess_primary_favicon(done) {
  functionProcess_handle_plumber(
    done,
    CACHE_NAMESPACE_FAVICON,
    PATH_DIR_PROJECT_IN_FAVICON,
    PATH_FILE_PROJECT_IN_FAVICON,
    PATH_DIR_PROJECT_OUT_FAVICON
  );
}

// -----------------------------------------------------------------------------
// ### Process - File
// -----------------------------------------------------------------------------

const CACHE_NAMESPACE_FILE = 'file';

const PATH_DIR_PROJECT_IN_ASSET_FILE  = `${PATH_DIR_PROJECT_IN_ASSET}file/`;
const PATH_DIR_PROJECT_OUT_ASSET_FILE = `${PATH_DIR_PROJECT_OUT_ASSET}file/`;
const PATH_FILE_PROJECT_IN_ASSET_FILE = [
  `${PATH_DIR_PROJECT_IN_ASSET_FILE}${PATH_ALL}`,
  ...PATH_DIR_IN_IGNORE_PROJECT
];

function functionProcess_primary_file(done) {
  functionProcess_handle_plumber(
    done,
    CACHE_NAMESPACE_FILE,
    PATH_DIR_PROJECT_IN_ASSET_FILE,
    PATH_FILE_PROJECT_IN_ASSET_FILE,
    PATH_DIR_PROJECT_OUT_ASSET_FILE
  );
};

// -----------------------------------------------------------------------------
// ### Process - Font
// -----------------------------------------------------------------------------

const CACHE_NAMESPACE_FONT = 'font';

const PATH_DIR_PROJECT_IN_ASSET_FONT  =  `${PATH_DIR_PROJECT_IN_ASSET}font/`;
const PATH_DIR_PROJECT_OUT_ASSET_FONT =  `${PATH_DIR_PROJECT_OUT_ASSET}font/`;
const PATH_FILE_PROJECT_IN_ASSET_FONT = [
  `${PATH_DIR_PROJECT_IN_ASSET_FONT}${PATH_ALL}.*`,
  ...PATH_DIR_IN_IGNORE_PROJECT
];

function functionProcess_primary_font(done) {
  functionProcess_handle_plumber(
    done,
    CACHE_NAMESPACE_FONT,
    PATH_DIR_PROJECT_IN_ASSET_FONT,
    PATH_FILE_PROJECT_IN_ASSET_FONT,
    PATH_DIR_PROJECT_OUT_ASSET_FONT
  );
};

// -----------------------------------------------------------------------------
// ### Process - Font Icon
// -----------------------------------------------------------------------------

const CACHE_NAMESPACE_FONT_ICON = 'font_icon';

const PATH_DIR_PROJECT_IN_ASSET_FONT_ICON  = `${PATH_DIR_PROJECT_IN_ASSET}font_icon/`;
const PATH_DIR_PROJECT_OUT_ASSET_FONT_ICON = `${PATH_DIR_PROJECT_OUT_ASSET}font_icon/`;
const PATH_FILE_PROJECT_IN_ASSET_FONT_ICON_EXT = '.svg';
const PATH_FILE_PROJECT_IN_ASSET_FONT_ICON = [
  `${PATH_DIR_PROJECT_IN_ASSET_FONT_ICON}${PATH_ALL}${PATH_FILE_PROJECT_IN_ASSET_FONT_ICON_EXT}`,
  ...PATH_DIR_IN_IGNORE_PROJECT
];

const PATH_FILE_PROJECT_IN_ASSET_FONT_ICON_SCSS_TEMPLATE = `${PATH_DIR_ROOT_CONFIG_DEFAULT_PROJECT}font_icon_template.scss`;
const PATH_DIR_PROJECT_IN_ASSET_CSS_FONT_ICON = `${PATH_DIR_PROJECT_IN_ASSET}css/_variable_font_icon/`;

const PATH_FILE_PROJECT_IN_ASSET_FONT_ICON_WATCH = [
  ...PATH_FILE_PROJECT_IN_ASSET_FONT_ICON,
  PATH_FILE_PROJECT_IN_ASSET_FONT_ICON_SCSS_TEMPLATE
];

const FONT_ICON_NAME = 'font_icon';

const PATTERN_RESET_FONT_ICON = [
  PATH_DIR_PROJECT_OUT_ASSET_FONT_ICON,
  `${PATH_DIR_PROJECT_OUT_ASSET}css/${FONT_ICON_NAME}/`,
  PATH_DIR_PROJECT_IN_ASSET_CSS_FONT_ICON
];

async function functionProcess_primary_fontIcon(done) {
  const LOG_TAG_FONT_ICON = '[🔣 Font Icon]';

  LOG.begin(LOG_TAG_FONT_ICON, 'Running...');

  // Check if the font_icon root directory exists
  if (!functionLibrary_path_exists(PATH_DIR_PROJECT_IN_ASSET_FONT_ICON)) {
    LOG.end(LOG_TAG_FONT_ICON, 'Complete.');
    return done();
  }

  const PATH_DIR_PROJECT_IN_ASSET_FONT_ICON_SUB = functionLibrary_file_getSubdirectories(PATH_DIR_PROJECT_IN_ASSET_FONT_ICON);

  LOG.detail(LOG_TAG_FONT_ICON, {PATH_DIR_PROJECT_IN_ASSET_FONT_ICON_SUB});

  // If no subdirectories are present, return `done` early
  if (PATH_DIR_PROJECT_IN_ASSET_FONT_ICON_SUB.length === 0) {
    LOG.error(LOG_TAG_FONT_ICON, 'No subdirectories in:', {PATH_DIR_PROJECT_IN_ASSET_FONT_ICON});
    LOG.end(LOG_TAG_FONT_ICON, 'Complete.');
    return done();
  }

  const PATH_DIR_PROJECT_OUT_ASSET_FONT_icon_scss_dir = NODE_PATH.dirname(PATH_DIR_PROJECT_IN_ASSET_CSS_FONT_ICON);

  // Ensure the output directory exists
  if (!NODE_FS.existsSync(PATH_DIR_PROJECT_OUT_ASSET_FONT_icon_scss_dir)) {
    NODE_FS.mkdirSync(PATH_DIR_PROJECT_OUT_ASSET_FONT_icon_scss_dir, { recursive: true });
    LOG.debug(LOG_TAG_FONT_ICON, 'Created missing directory:', {PATH_DIR_PROJECT_OUT_ASSET_FONT_icon_scss_dir});
  }

  let scssImports = []; // Array to store @import statements

  const NODE_GULP_ICONFONT_CSS = require('gulp-iconfont-css');
  const NODE_GULP_ICONFONT     = (await import('gulp-iconfont')).default;
  const NODE_GULP_SASS         = require('gulp-sass')(require('sass'));
  const NODE_GULP_AUTOPREFIXER = (await import('gulp-autoprefixer')).default;

  try {
    // Collect promises for processing each subdirectory
    const TASKS_FONT_ICON = PATH_DIR_PROJECT_IN_ASSET_FONT_ICON_SUB.map(subdir => {
      LOG.detail(LOG_TAG_FONT_ICON, 'Processing subdirectory:', {subdir});
      return new Promise((resolve, reject) => {
        const FONT_ICON_NAME_SUBDIR = `${FONT_ICON_NAME}_${subdir}`;

        let scssVariables = []; // Array to store SASS variable declarations for each subdir

        LOG.debug(LOG_TAG_FONT_ICON, 'fontName:', FONT_ICON_NAME_SUBDIR);

        NODE_GULP.src(NODE_PATH.join(
          PATH_DIR_PROJECT_IN_ASSET_FONT_ICON,
          subdir,
          `*${PATH_FILE_PROJECT_IN_ASSET_FONT_ICON_EXT}`
        ), {encoding: false})
          .pipe(functionLibrary_plumber())

          // Can not cache font icons: each folder needs to process all font icons at compile time
          // .pipe(CACHE_PROJECT.pipe(CACHE_NAMESPACE_FONT_ICON))

          .pipe(NODE_GULP_ICONFONT_CSS({
            fontName: FONT_ICON_NAME_SUBDIR,
            path: PATH_FILE_PROJECT_IN_ASSET_FONT_ICON_SCSS_TEMPLATE,
            targetPath: `./../../css/${FONT_ICON_NAME}/${FONT_ICON_NAME}_${subdir}.css`, // FIXME: Dont use magic paths
            fontPath: `/asset/${FONT_ICON_NAME}/${subdir}/`, // FIXME: Dont use magic paths
          }))

          .pipe(NODE_GULP_ICONFONT({
            fontName: FONT_ICON_NAME_SUBDIR,
            // prependUnicode: true,
            formats: ['ttf', 'eot', 'woff', 'woff2', 'svg'],
            normalize: true,
            centerHorizontally: true,
            appendCodepoints: true,
            fontHeight: 1000
          }))
          .on('glyphs', (glyphs, options) => {
            LOG.detail(LOG_TAG_FONT_ICON, 'Glyphs emitted for:', {subdir}, ':', glyphs);

            glyphs.forEach(glyph => {
              let { name, unicode } = glyph;

              // Remove the hex color suffix from the name (assuming a format like 'name-HEXCODE')
              const nameWithoutHex = name.replace(/-\w{6}$/, '');

              // Convert the first Unicode character to its hexadecimal value
              const hexUnicode = unicode[0].charCodeAt(0).toString(16).toUpperCase();

              // Extract the color from the file name
              const hexColorMatch = name.match(/-(\w{6})$/);
              const hexColor = hexColorMatch ? `#${hexColorMatch[1]}` : null;

              // Generate SASS variable for the glyph
              scssVariables.push(`$font-icon--${subdir}-${nameWithoutHex}: "\\${hexUnicode}";`);

              if (hexColor) {
                scssVariables.push(`$font-icon--color--${subdir}-${nameWithoutHex}: ${hexColor};`);
              }
            });

            // Log the generated SCSS variables for debugging
            LOG.detail(LOG_TAG_FONT_ICON, 'SCSS Variables:', {subdir, scssVariables});
          })

          .pipe(NODE_GULP_IF(
            file => file.extname === '.css',
            NODE_GULP_RENAME({ suffix: '.min' })
          ))  // Rename the output file with a .min suffix

          .pipe(NODE_GULP_IF(
            file => file.extname === '.css',
            NODE_GULP_SASS({
              errLogToConsole: true, // Disable default error logging
              outputStyle: 'compressed',
              silenceDeprecations: ['legacy-js-api'],
            })
              // .on('data', file => {
              //   LOG.debug("✅ [DEBUG] - Sass input file path:", file.path);
              //   LOG.debug("✅ [DEBUG] - Sass processing result:", file.contents.toString());
              // })
              .on('error', function(error) {
                LOG.error(LOG_TAG_STYLESHEET + ' [🧵 SASS]', error);
                this.emit('end'); // Correctly refer to the Gulp stream & Prevents Gulp from crashing
              })
          ))

          .pipe(NODE_GULP_IF(
            file => file.extname === '.css',
            NODE_GULP_AUTOPREFIXER({ overrideBrowserslist: ['last 2 versions', '> 5%'], remove: false })
          ))  // Autoprefix CSS

          .pipe(NODE_GULP_IF(
            file => file.extname === '.css',
            appendBrandComment()
          )) // Append comment before output

          .pipe(NODE_GULP.dest(`${PATH_DIR_PROJECT_OUT_ASSET_FONT_ICON}${subdir}/`))

          .on('end', () => {
            LOG.detail(LOG_TAG_FONT_ICON, 'SCSS Variables: Finished processing:', {subdir, scssVariables});

            // Write SCSS variables to a file
            const PATH_FILE_PROJECT_IN_ASSET_CSS_FONT_ICON = NODE_PATH.join(PATH_DIR_PROJECT_IN_ASSET_CSS_FONT_ICON, `_${subdir}.scss`);

            // Ensure the directory exists
            if (!NODE_FS.existsSync(PATH_DIR_PROJECT_IN_ASSET_CSS_FONT_ICON)) {
              NODE_FS.mkdirSync(PATH_DIR_PROJECT_IN_ASSET_CSS_FONT_ICON, { recursive: true });
            }

            const SCSS_BODY = scssVariables.join('\n');
            NODE_FS.writeFileSync(PATH_FILE_PROJECT_IN_ASSET_CSS_FONT_ICON, SCSS_BODY);

            LOG.detail(LOG_TAG_FONT_ICON, 'SCSS file generated:', {subdir, PATH_FILE_PROJECT_IN_ASSET_CSS_FONT_ICON});

            // Add @import statement to the main _variable_font_icon.scss file
            scssImports.push(`@use "_variable_font_icon/_${subdir}" as *;`);

            resolve();
          })

          .on('error', (err) => {
            LOG.error(LOG_TAG_FONT_ICON, {subdir, err});
            reject(err);
          });
      });
    });

    // Wait for all processing tasks to finish
    const TASKS_FONT_ICON_RESULTS = await Promise.allSettled(TASKS_FONT_ICON);

    LOG.debug(LOG_TAG_FONT_ICON, {TASKS_FONT_ICON_RESULTS});

    // Check for errors
    const TASKS_FONT_ICON_RESULTS_ERRORS = TASKS_FONT_ICON_RESULTS.filter(result => result.status === 'rejected').map(result => result.reason);

    if (TASKS_FONT_ICON_RESULTS_ERRORS.length > 0) {
      LOG.error('Errors occurred during subdirectory processing:', TASKS_FONT_ICON_RESULTS_ERRORS);
      throw new Error(`Errors occurred during subdirectory processing:\n${TASKS_FONT_ICON_RESULTS_ERRORS.map(err => err.message || err).join('\n')}`);
    }
    else {
      LOG.success(LOG_TAG_FONT_ICON, 'All subdirectory processing.');
    }

    // After processing all subdirectories, write the main _variable_font_icon.scss file
    const PATH_FILE_PROJECT_IN_ASSET_CSS_FONT_ICON_ALL = NODE_PATH.join(PATH_DIR_PROJECT_IN_ASSET_CSS_FONT_ICON, '_include_all.scss');
    const CONTENT_PROJECT_IN_ASSET_SCSS_FONT_ICON_ALL = scssImports.join('\n');

    NODE_FS.writeFileSync(PATH_FILE_PROJECT_IN_ASSET_CSS_FONT_ICON_ALL, CONTENT_PROJECT_IN_ASSET_SCSS_FONT_ICON_ALL);

    LOG.info(LOG_TAG_FONT_ICON, 'Main SCSS file generated:', {PATH_FILE_PROJECT_IN_ASSET_CSS_FONT_ICON_ALL});

    LOG.end(LOG_TAG_FONT_ICON, 'Complete.');
    done();
  } catch (error) {
    LOG.error(LOG_TAG_FONT_ICON, error);
    LOG.end(LOG_TAG_FONT_ICON, 'Complete.');
    done();
  }
};

// -----------------------------------------------------------------------------
// ### Process - HTML Config
// -----------------------------------------------------------------------------

const LOG_TAG_HTML = '[📄 HTML]';

const CACHE_NAMESPACE_HTML_CONFIG = 'html_config';

const PATH_FILE_PROJECT_HANDLEBARS                      = `${PATH_DIR_PROJECT}handlebars.js`;
const PATH_DIR_PROJECT_IN_HTML_PARTIAL                  = `${PATH_DIR_PROJECT_IN}_html/`;
const PATH_DIR_PROJECT_IN_HTML_PARTIAL_CONFIG           = `${PATH_DIR_PROJECT_IN_HTML_PARTIAL}config/`;
const PATH_DIR_PROJECT_IN_HTML_PARTIAL_CONFIG_TEMPLATE  = `${PATH_DIR_PROJECT_IN_HTML_PARTIAL_CONFIG}template/`;
const PATH_FILE_PROJECT_IN_HTML_PARTIAL_CONFIG_TEMPLATE = `${PATH_DIR_PROJECT_IN_HTML_PARTIAL_CONFIG_TEMPLATE}*.hbs`;
const PATH_FILE_PROJECT_IN_HTML_CONFIG_WATCH = [
  PATH_FILE_PROJECT_HANDLEBARS,
  PATH_FILE_PROJECT_IN_HTML_PARTIAL_CONFIG_TEMPLATE
];
const PATTERN_RESET_HTML_PARTIAL_CONFIG = [
  `${PATH_DIR_PROJECT_IN_HTML_PARTIAL_CONFIG}${PATH_ALL}.html`,
  `!${PATH_DIR_PROJECT_IN_HTML_PARTIAL_CONFIG_TEMPLATE}`
];

function functionProcess_primary_html_config(done) {
  const LOG_TAG_HTML_CONFIG = LOG_TAG_HTML + ' [⚙️ Config]';

  LOG.begin(LOG_TAG_HTML_CONFIG, 'Running...');

  const NODE_GULP_COMPILE_HANDLEBARS = require('gulp-compile-handlebars');

  LOG.info(LOG_TAG_HTML_CONFIG, 'Attempting to load Handlebars Helpers from:', {PATH_FILE_PROJECT_HANDLEBARS});

  functionLibrary_path_exists(PATH_FILE_PROJECT_HANDLEBARS)

  let handlebarsHelpers = {};

  try {
    const Handlebars = require('handlebars'); // Load from node_modules
    handlebarsHelpers = require(PATH_FILE_PROJECT_HANDLEBARS)(Handlebars); // Pass Handlebars explicitly
  } catch (err) {
    LOG.debug(LOG_TAG_HTML_CONFIG, 'Handlebars Helpers load error:', err);
    LOG.notice(LOG_TAG_HTML_CONFIG, 'Proceeding without custom helpers. Failed to load Handlebars Helpers. See log for more information.', {"logfile": LOG.getLogFile()});
  }

  if (!functionLibrary_path_exists(PATH_DIR_PROJECT_IN_HTML_PARTIAL_CONFIG_TEMPLATE)) {
    return done();
  }

  const HANDLEBARS_OPTIONS = {
    batch: [PATH_DIR_PROJECT_IN_HTML_PARTIAL], // Directory for reusable partial templates
    helpers: handlebarsHelpers,
  };

  LOG.info(LOG_TAG_HTML_CONFIG, 'Handlebars Options Configured:', HANDLEBARS_OPTIONS);

  return NODE_GULP.src(PATH_FILE_PROJECT_IN_HTML_PARTIAL_CONFIG_TEMPLATE)
    .pipe(functionLibrary_plumber())

    .pipe(CACHE_PROJECT.pipe(CACHE_NAMESPACE_HTML_CONFIG))

    .pipe(NODE_GULP_COMPILE_HANDLEBARS(configProject.custom, HANDLEBARS_OPTIONS))

    .pipe(NODE_GULP_RENAME({ extname: '.html' })) // Rename output to .html

    .pipe(NODE_GULP.dest(PATH_DIR_PROJECT_IN_HTML_PARTIAL_CONFIG))

    .on('end', () => {
      LOG.success(LOG_TAG_HTML_CONFIG, 'Handlebars HTML Templates Processed Successfully!');

      LOG.end(LOG_TAG_HTML_CONFIG, 'Complete.');

      done();
    })
    .on('error', (err) => {
      LOG.error('Error in Gulp Pipeline:', err);
      done(err);
    })

    .on('end', done);
}

// -----------------------------------------------------------------------------
// ### Process - HTML
// -----------------------------------------------------------------------------

const CACHE_NAMESPACE_HTML =    'html';

const PATH_DIR_PROJECT_IN_HTML  = PATH_DIR_PROJECT_IN;
const PATH_DIR_PROJECT_OUT_HTML = PATH_DIR_PROJECT_OUT;
const PATH_FILE_PROJECT_IN_HTML = [
  `${PATH_DIR_PROJECT_IN_HTML}${PATH_ALL}.html`,
  PATH_DIR_IN_IGNORE_PROJECT_ASSET,
  ...PATH_DIR_IN_IGNORE_PROJECT
];

const PATH_DIR_PROJECT_IN_HTML_INCLUDE  = `${PATH_DIR_PROJECT_IN}_html/`;
const PATH_FILE_PROJECT_IN_HTML_INCLUDE = `${PATH_DIR_PROJECT_IN_HTML_INCLUDE}${PATH_ALL}.html`;

const PATTERN_RESET_HTML = `${PATH_DIR_PROJECT_OUT_HTML}${PATH_ALL}.html`

function functionProcess_handle_html(done) {
  LOG.begin(LOG_TAG_HTML, 'Running...');

  const NODE_CUSTOM_GULP_BREADCRUMB = require('custom-gulp-breadcrumb');
  const NODE_GULP_HTMLMIN           = require('gulp-htmlmin');
  const NODE_CUSTOM_GULP_HTML_TOC   = require('custom-gulp-html-toc');
  const NODE_GULP_FILE_INCLUDE      = require('gulp-file-include');

  const ignore_nav = configProjectMerge.option.path.ignore_nav;

  let pipelineHTML = NODE_GULP.src(PATH_FILE_PROJECT_IN_HTML)
    .pipe(functionLibrary_plumber())

    .pipe(CACHE_PROJECT.pipe(CACHE_NAMESPACE_HTML))

    .pipe(NODE_GULP_FILE_INCLUDE({
      prefix: '@@',
      basepath: PATH_DIR_PROJECT_IN // '@file', '@root'
    }))

    .on('data', () => {
      LOG.debug(LOG_TAG_HTML, 'Included files');
    })

    // Capture the URL dynamically
    .pipe(NODE_GULP_TAP((file) => {
      const relativePath = file.relative.replace(/\\/g, '/'); // Convert backslashes to forward slashes
      let pageUrl;

      if (relativePath === 'index.html') {
        // If the file is index.html, use the base URL only
        pageUrl = configProjectMerge.require.site.url;
      } else {
        // Otherwise, append the relative path to the base URL
        pageUrl = configProjectMerge.require.site.url + '/' + relativePath;
      }

      // Print URL for debugging
      LOG.debug(LOG_TAG_HTML, 'Generated page URL:', {
        filePath: file.path,
        pageUrl: pageUrl
      });

      // Attach the page URL to the file object for later use
      file.pageUrl = pageUrl;
    }));

  // Dynamically add `NODE_GULP_REPLACE` pipes for each replacement
  Object.entries(configProjectFlat).forEach(([placeholder, value]) => {
    pipelineHTML = pipelineHTML.pipe(NODE_GULP_REPLACE(placeholder, value));
  });

  // Replace Begin ==========================================================

  // Replace the 'og:url' tag with the correct URL
  pipelineHTML.pipe(NODE_GULP_REPLACE(/<meta property="og:url" content=".*"\/>/g, function(match, p1, offset, string) {
      // Use the URL stored in the file object
      return `<meta property="og:url" content="${this.file.pageUrl}"/>`;
    }))

    // .pipe(NODE_GULP_REPLACE(/REPLACE_REQUIRE_SITE_URL/g, configProject.require.site.url))

    // Replace End ============================================================

    .on('data', () => {
      LOG.debug(LOG_TAG_HTML, 'Breadcrumb Processing...');
    })
    .pipe(NODE_CUSTOM_GULP_BREADCRUMB({
      basePath: PATH_DIR_PROJECT_IN,
      ignoreFiles: ignore_nav,
      // replaceText: '<!-- breadcrumb -->',
      rootHTML: '<span class="font-icon--interface-home"></span> Home',
      // pathPrefix: '',
      pathSuffix: configProjectMerge.option.url.html_extension ? '.html' : '',
      containerElem: 'section',
      containerElemProps: 'id="breadcrumb"',
      useHeaderAsPageName: true,
      linkProps: 'class="button"',
      showPageName: true,
      debug: true,
    }))
    .on('data', () => {
      LOG.debug(LOG_TAG_HTML, 'Breadcrumb Processed.');
    })

    .on('data', () => {
      LOG.debug(LOG_TAG_HTML, 'Table of Contents Processing...');
    })
    .pipe(NODE_CUSTOM_GULP_HTML_TOC({
      ignoreFiles: ignore_nav,
      replaceTextTemplate: function() {
        const isCollapsible = configProjectMerge.option.toc.collapsible;
        return '<section id="section-toc">\n'
             + '  <span id="toc-title">Table of Contents</span>\n'
             + `  ${isCollapsible ? '<div id="toc"></div>' : '<ul id="toc"></ul>'}`
             + '</section>';
      },
      anchorTemplate: function(id) {
        // return ' <a href="#' + id + '" name="' + id + '" class="anchor" onclick="return false;"><span class="font-icon--interface-link"></span></a>';
        return '<span> <a href="#' + id + '" name="' + id + '" class="anchor ignore--print"><span class="font-icon--interface-link"></span></a></span>';
      },
      selectors: 'h1:not(.toc-ignore),h2:not(.toc-ignore),h3:not(.toc-ignore),h4:not(.toc-ignore),h5:not(.toc-ignore),h6:not(.toc-ignore)',
      headerPrepend: '<span class="counter"></span>',
      collapsible: configProjectMerge.option.toc.collapsible,
      maxDepth: configProjectMerge.option.toc.depth, // configProjectMerge.option.toc.depth.link,
      anchorMaxDepth: 6, // configProjectMerge.option.toc.depth.anchor,
      headerPrependMaxDepth: 6 // configProjectMerge.option.toc.depth.prepend
    }))
    .on('data', () => {
      LOG.debug(LOG_TAG_HTML, 'Table of Contents Processed.');
    })

    .on('data', () => {
      LOG.debug(LOG_TAG_HTML, 'Minification Running...');
    })
    .pipe(NODE_GULP_HTMLMIN({
      removeComments: true,
      collapseWhitespace: true,
      minifyCSS: true, // Comment out to not minify css (https://www.npmjs.com/package/html-minifier)
      minifyJS: true   // Comment out to not minify js  (https://www.npmjs.com/package/html-minifier)
    }))
    .on('data', () => {
      LOG.debug(LOG_TAG_HTML, 'Minification Complete.');
    })

    .pipe(appendBrandComment()) // Append comment before output

    .pipe(NODE_GULP.dest(PATH_DIR_PROJECT_OUT_HTML))

    .on('end', () => {
      LOG.end(LOG_TAG_HTML, 'Complete.');
      done();
    });
}

// -----------------------------------------------------------------------------
// Process - Image
// -----------------------------------------------------------------------------

const CACHE_NAMESPACE_IMAGE = 'image';

const PATH_DIR_PROJECT_IN_ASSET_IMAGE  = `${PATH_DIR_PROJECT_IN_ASSET}image/`;
const PATH_DIR_PROJECT_OUT_ASSET_IMAGE = `${PATH_DIR_PROJECT_OUT_ASSET}image/`;
const PATH_FILE_PROJECT_IN_ASSET_IMAGE = [
  `${PATH_DIR_PROJECT_IN_ASSET_IMAGE}${PATH_ALL}`,
  ...PATH_DIR_IN_IGNORE_PROJECT
];
const PATH_FILE_PROJECT_IN_ASSET_IMAGE_WATERMARK = `${PATH_DIR_PROJECT_IN_ASSET_IMAGE}brand/_watermark.png`;

const VERBOSE_IMAGE = {
  NONE: 0,
  BASIC: 1,
  DETAIL: 2,
  FULL: 3
};

async function functionProcess_primary_image(done) {
  const LOG_TAG_IMAGE = '[🖼️ Image]';
  const LOG_TAG_IMAGE_WATERMARK = LOG_TAG_IMAGE + ' [💧 Watermark]';

  LOG.begin(LOG_TAG_IMAGE, 'Running...');

  const VERBOSE_IMAGE_CURRENT = VERBOSE_IMAGE.BASIC
  const VERBOSE_IMAGE_CURRENT_SUBPROCESS = VERBOSE_IMAGE_CURRENT - 1;

  // Log the value of VERBOSE_IMAGE_CURRENT
  LOG[VERBOSE_IMAGE_CURRENT > VERBOSE_IMAGE.BASIC ? 'detail' : 'debug'](
    LOG_TAG_IMAGE, 'Verbose Levels:', {
      "Verbose (set)": VERBOSE_IMAGE_CURRENT,
      "Verbose Subprocess (set - 1)": VERBOSE_IMAGE_CURRENT_SUBPROCESS
    }
  );

  // Import modules synchronously
  const [
    { default: NODE_GULP_IMAGEMIN },
    { default: NODE_IMAGEMIN_GIFSICLE },
    { default: NODE_IMAGEMIN_MOZJPEG },
    { default: NODE_IMAGEMIN_OPTIPNG },
    { default: NODE_IMAGEMIN_SVGO }
  ] = await Promise.all([
    import('gulp-imagemin'),
    import('imagemin-gifsicle'),
    import('imagemin-mozjpeg'),
    import('imagemin-optipng'),
    import('imagemin-svgo')
  ]);

  const NODE_IMAGEMIN = [
    NODE_IMAGEMIN_GIFSICLE({ interlaced: true }),
    NODE_IMAGEMIN_MOZJPEG({ quality: 75, progressive: true }),
    NODE_IMAGEMIN_OPTIPNG({ optimizationLevel: 5 }),
    NODE_IMAGEMIN_SVGO({
      plugins: [
        { name: 'removeViewBox', active: true }
        // ,
        // { name: 'cleanupIDs', active: false }
      ]
    }),
  ];

  const NODE_CUSTOM_GULP_WATERMARK = require('custom-gulp-watermark');

  if (VERBOSE_IMAGE_CURRENT_SUBPROCESS > -1) {
    await functionLibrary_file_listFilesMatched(PATH_FILE_PROJECT_IN_ASSET_IMAGE, PATH_DIR_IN_IGNORE_BASE_PROJECT, VERBOSE_IMAGE_CURRENT_SUBPROCESS)
  }

  return new Promise((resolve, reject) => {
    NODE_GULP.src(PATH_FILE_PROJECT_IN_ASSET_IMAGE, {encoding: false})
      .pipe(functionLibrary_plumber())

      .pipe(CACHE_PROJECT.pipe(CACHE_NAMESPACE_IMAGE))

      // Add watermark if "watermark" is in file path/name
      .pipe(NODE_GULP_IF(
        file => file.path.includes('watermark'),
        NODE_CUSTOM_GULP_WATERMARK({
          image: PATH_FILE_PROJECT_IN_ASSET_IMAGE_WATERMARK,
          gravity: 'Center',
          background: '#0000',
          dissolve: 37.5,
          gmOptions: '-tile'
        })
      ))
      .on('error', (err) => {
        LOG.error(LOG_TAG_IMAGE_WATERMARK, err);
      })

      .pipe(NODE_GULP_IMAGEMIN(NODE_IMAGEMIN, {
        verbose: true
      }))

      .pipe(NODE_GULP_IF(file => { return !functionLibrary_file_isDirectory(file.path) && VERBOSE_IMAGE_CURRENT > VERBOSE_IMAGE.BASIC },
        NODE_GULP_TAP(file => {
          LOG.info(   LOG_TAG_IMAGE, '📦 Minified:   ',    functionLibrary_file_getRootRelativePath(file.path));
        })
      ))

      .pipe(NODE_GULP_IF(VERBOSE_IMAGE_CURRENT > VERBOSE_IMAGE.BASIC,
        NODE_GULP_TAP(async (file) => {
          const destinationPath = NODE_PATH.join(PATH_DIR_PROJECT_OUT_ASSET_IMAGE, NODE_PATH.relative(PATH_FILE_PROJECT_IN_ASSET_IMAGE[0].replace(/\/\*\*\/\*$/, ''), file.path));
          if (!functionLibrary_file_isDirectory(file.path)) {
            LOG.info( LOG_TAG_IMAGE, '💾 Destination:', functionLibrary_file_getRootRelativePath(destinationPath));
          } else {
            LOG.debug(LOG_TAG_IMAGE, '📂 Directory Destination:', functionLibrary_file_getRootRelativePath(destinationPath));
          }
        })
      ))

      .pipe(NODE_GULP.dest(PATH_DIR_PROJECT_OUT_ASSET_IMAGE))

      .on('error', error => {
        LOG.error(LOG_TAG_IMAGE, error);
        reject(error);
      })

      .on('end', async () => {
        LOG.success(LOG_TAG_IMAGE, 'Complete.');

        if (VERBOSE_IMAGE_CURRENT_SUBPROCESS > -1) {
          await functionLibrary_file_listFiles(PATH_DIR_PROJECT_OUT_ASSET_IMAGE, true, VERBOSE_IMAGE_CURRENT_SUBPROCESS)
        }

        LOG.end(LOG_TAG_IMAGE, 'Complete.');

        resolve();
      });
  }).then(() => done()).catch(done);
}

// -----------------------------------------------------------------------------
// ### Process - JavaScript
// -----------------------------------------------------------------------------

const CACHE_NAMESPACE_JAVASCRIPT = 'javascript';

const PATH_DIR_PROJECT_IN_ASSET_JAVASCRIPT  = `${PATH_DIR_PROJECT_IN_ASSET}js/`;
const PATH_DIR_PROJECT_OUT_ASSET_JAVASCRIPT = `${PATH_DIR_PROJECT_OUT_ASSET}js/`;
const PATH_FILE_PROJECT_IN_ASSET_JAVASCRIPT = [
  `${PATH_DIR_PROJECT_IN_ASSET_JAVASCRIPT}${PATH_ALL}.js`,
  ...PATH_DIR_IN_IGNORE_PROJECT
];

async function functionProcess_primary_javascript(done) {
  const LOG_TAG_JAVASCRIPT = '[📟 JavaScript]';
  const LOG_TAG_JAVASCRIPT_BROWSERIFY = LOG_TAG_JAVASCRIPT + ' [🌐 Browserify]';

  LOG.begin(LOG_TAG_JAVASCRIPT, 'Running...');

  const NODE_GULP_STRIP_DEBUG    = await import('gulp-strip-debug');
  const NODE_GULP_UGLIFY_ES      = require('gulp-uglify-es');
  const NODE_BABELIFY            = require('babelify');
  const NODE_BROWSERIFY          = require('browserify');
  const NODE_VINYL_SOURCE_STREAM = require('vinyl-source-stream');
  const NODE_VINYL_BUFFER        = require('vinyl-buffer');
  // const NODE_GLOB                = require('glob');
  const NODE_GULP_OPTIONS        = require('gulp-options');

  let hasErrorBrowserify = false;

  return new Promise((resolve, reject) => {
    const stream = NODE_GULP.src(PATH_FILE_PROJECT_IN_ASSET_JAVASCRIPT, { highWaterMark: 32 })
      .pipe(functionLibrary_plumber(() => !hasErrorBrowserify))
      .pipe(CACHE_PROJECT.pipe(CACHE_NAMESPACE_JAVASCRIPT))
      .on('end', async () => {
        if (!hasErrorBrowserify) {
          LOG.success(LOG_TAG_JAVASCRIPT, 'All files written.');
        }
        else {
          LOG.error(LOG_TAG_JAVASCRIPT, 'Error occured.');
        }
        LOG.end(LOG_TAG_JAVASCRIPT, 'Complete.');
        resolve(); // Resolve the Promise on completion
      })
      .on('error', (error) => {
        LOG.error(LOG_TAG_JAVASCRIPT, 'Pipeline error:', error);
        reject(error); // Reject the Promise on pipeline errors
      })
      .on('data', (file) => {
        if (hasErrorBrowserify) {
          return;
        }

        return NODE_BROWSERIFY({ entries: [file.path], debug: true })
          .transform(NODE_BABELIFY, { presets: ['@babel/preset-env'] })
          .bundle()
          .on('error', function (error) {
            if (hasErrorBrowserify) {
              return;
            }

            const errorDetails = {
              // message: error.message || 'Unknown error',
              // file: error.file ? NODE_PATH.relative(PATH_DIR_PROJECT_IN, error.file) : 'Unknown file',
              // line: error.line || 'N/A',
              // column: error.column || 'N/A',
              // formatted: error.formatted || error.stack || 'No additional details'
              message: error.message || 'Unknown error',
              code: error.code || 'No Code',
              // file: error.filename || 'Unknown file',
              stack: error.stack || 'No stack trace'
            };
            // Log formatted error message
            LOG.error(LOG_TAG_JAVASCRIPT_BROWSERIFY, '\n' +
              '========================================\n' +
              `[[ANSI_OFF]]\x1b[37mCode[[ANSI_ON]]:    \"[[ANSI_OFF]]${errorDetails.code}[[ANSI_ON]]\",\n` +
              `[[ANSI_OFF]]\x1b[37mMessage[[ANSI_ON]]: ${LOG.formatArg(errorDetails.message)},\n` +
              // `[[ANSI_OFF]]\x1b[37mFile[[ANSI_ON]]:   ${LOG.formatArg(errorDetails.file)},\n` +
              '----------------------------------------\n' +
              '[[ANSI_OFF]]\x1b[37mStack Trace[[ANSI_ON]]:\n' +
              `[[ANSI_OFF]]\x1b[37m${errorDetails.stack}[[ANSI_ON]]\n` +
              '========================================'
            );

            LOG.debug(LOG_TAG_JAVASCRIPT_BROWSERIFY, 'Full Error:', error);

            hasErrorBrowserify = true;

            this.emit('end'); // Prevents the process from crashing
            stream.emit('end'); // Prevents the process from crashing
          })
          .pipe(NODE_VINYL_SOURCE_STREAM(file.relative))
          .pipe(NODE_VINYL_BUFFER())
          .pipe(NODE_GULP_IF(NODE_GULP_OPTIONS.has('production'), NODE_GULP_STRIP_DEBUG.default()))
          .pipe(NODE_GULP_SOURCEMAP.init({ loadMaps: true }))
            // Add transformation tasks to the pipeline here.
            .pipe(NODE_GULP_UGLIFY_ES.default(configProjectMerge.option.minify.js))
          .pipe(appendBrandComment()) // Append comment before output
          .pipe(NODE_GULP_RENAME({ extname: '.min.js' }))
          .pipe(NODE_GULP_SOURCEMAP.write(PATH_DIR_OUT_SOURCEMAP))
          .pipe(NODE_GULP.dest(PATH_DIR_PROJECT_OUT_ASSET_JAVASCRIPT))
      });
  }).then(() => done()).catch(done);
};

// -----------------------------------------------------------------------------
// ### Process - Module
// -----------------------------------------------------------------------------

const CACHE_NAMESPACE_MODULE = 'module';

const PATH_DIR_PROJECT_IN_ASSET_MODULE  = `${PATH_DIR_PROJECT_IN_ASSET}module/`;
const PATH_DIR_PROJECT_OUT_ASSET_MODULE = `${PATH_DIR_PROJECT_OUT_ASSET}module/`;
const PATH_FILE_PROJECT_IN_ASSET_MODULE = [
  `${PATH_DIR_PROJECT_IN_ASSET_MODULE}${PATH_ALL}`,
  ...PATH_DIR_IN_IGNORE_PROJECT
];

function functionProcess_primary_module(done) {
  functionProcess_handle_plumber(
    done,
    CACHE_NAMESPACE_MODULE,
    PATH_DIR_PROJECT_IN_ASSET_MODULE,
    PATH_FILE_PROJECT_IN_ASSET_MODULE,
    PATH_DIR_PROJECT_OUT_ASSET_MODULE
  );
};

// -----------------------------------------------------------------------------
// ### Process - Package
// -----------------------------------------------------------------------------

function functionProcess_primary_package(done) {
  const LOG_TAG_PACKAGE = '[📦 Package]';

  LOG.begin(LOG_TAG_PACKAGE, 'Running...');

  NODE_CHILD_PROCESS.spawn(
    'python',
    [NODE_PATH.join(PATH_DIR_ROOT, 'package.py')],  // No need for './'
    { stdio: 'inherit', shell: process.platform === 'win32' } // Use `shell: true` on Windows
  )

  .on('error', (error) => {
    LOG.error(LOG_TAG_PACKAGE, 'Failed to start the Python script:', error.message);
    done(error);
  })

  .on('exit', (code) => {  // `exit` is more reliable than `close` for process completion
    if (code === null) {
      LOG.error(LOG_TAG_PACKAGE, 'Python script was terminated unexpectedly.');
      return done(new Error('Python script was terminated unexpectedly.'));
    }
    if (code !== 0) {
      LOG.error(LOG_TAG_PACKAGE, `Python script exited with code: ${code}`);
      return done(new Error(`Python script failed with exit code: ${code}`));
    }

    LOG.success(LOG_TAG_PACKAGE, 'Python script executed successfully.');
    done();
  });

  LOG.end(LOG_TAG_PACKAGE, 'Complete.');
}

// -----------------------------------------------------------------------------
// ### Process - Sitemap
// -----------------------------------------------------------------------------

function functionProcess_handle_sitemap() {
  const LOG_TAG_SITEMAP = '[🗺️ Sitemap]';

  LOG.begin(LOG_TAG_SITEMAP, 'Generating...');

  const NODE_GULP_SITEMAP = require('gulp-sitemap');

  const generateIgnorePatterns = (ignoreArray) => {
    return ignoreArray.flatMap(item => [
      `!${PATH_DIR_PROJECT_IN}**/${item}.html`,
      `!${PATH_DIR_PROJECT_IN}**/${item}/${PATH_ALL}.html`
    ]);
  }

  LOG.info(LOG_TAG_SITEMAP, {
    "Site URL": configProjectMerge.require.site.url
  });

  return NODE_GULP.src([
    ...PATH_FILE_PROJECT_IN_HTML,
    ...generateIgnorePatterns(configProjectMerge.option.path.ignore_sitemap),
    ...generateIgnorePatterns(configProjectMerge.option.path.ignore_package)
  ], {
    read: false
  })
    .pipe(NODE_GULP_SITEMAP({
      siteUrl: configProjectMerge.require.site.url
    }))
    .pipe(appendBrandComment()) // Append comment before output
    .pipe(NODE_GULP.dest(PATH_DIR_PROJECT_OUT_HTML))
    .on('end', () => {
      LOG.end(LOG_TAG_SITEMAP, 'Generated.');
    });
}

// -----------------------------------------------------------------------------
// ### Process - Stylesheet
// -----------------------------------------------------------------------------

const LOG_TAG_STYLESHEET = '[🎨 Stylesheet]';

// const CACHE_NAMESPACE_STYLESHEET = `stylesheet`;

const PATH_DIR_PROJECT_IN_ASSET_STYLESHEET        = `${PATH_DIR_PROJECT_IN_ASSET}css/`;
const PATH_DIR_PROJECT_OUT_ASSET_STYLESHEET       = `${PATH_DIR_PROJECT_OUT_ASSET}css/`;
const PATH_DIR_PROJECT_IN_ASSET_STYLESHEET_CONFIG = `${PATH_DIR_PROJECT_IN_ASSET_STYLESHEET}_config/`;

const PATH_FILE_PROJECT_IN_ASSET_STYLESHEET_TYPES = [
  `${PATH_DIR_PROJECT_IN_ASSET_STYLESHEET}${PATH_ALL}.scss`,
  `${PATH_DIR_PROJECT_IN_ASSET_STYLESHEET}${PATH_ALL}.css`
];
const PATH_FILE_PROJECT_IN_ASSET_STYLESHEET = [
  ...PATH_FILE_PROJECT_IN_ASSET_STYLESHEET_TYPES,
  ...PATH_DIR_IN_IGNORE_PROJECT
];
const PATH_FILE_PROJECT_IN_ASSET_STYLESHEET_WATCH = [
  ...PATH_FILE_PROJECT_IN_ASSET_STYLESHEET_TYPES,
  `!${PATH_DIR_PROJECT_IN_ASSET_STYLESHEET_CONFIG}${PATH_ALL}`
];

const PATTERN_RESET_STYLESHEET = [
  `${PATH_DIR_PROJECT_OUT_ASSET_STYLESHEET}${PATH_ALL}.css`,
  `${PATH_DIR_PROJECT_OUT_ASSET_STYLESHEET}${PATH_ALL}.map`,
  `!${PATH_DIR_PROJECT_OUT_ASSET_STYLESHEET}font_icon/${PATH_ALL}`
]

function functionProcess_handle_stylesheetConfig(done) {
  const LOG_TAG_STYLESHEET_CONFIG = LOG_TAG_STYLESHEET + ' [📜 Config]';

  LOG.begin(LOG_TAG_STYLESHEET_CONFIG, 'Running...');

  const CONFIG_PROJECT_FLAT_SCSS_BODY = Object.entries(getConfigFlat(configProject, '$CONFIG_'))
    .map(([key, value]) => {
      // Detect HEX colors
      if (typeof value === 'string' && /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(value)) {
        return `${key}: ${value};`;
      }
      // Detect RGB(A) colors
      if (typeof value === 'string' && /^rgb(a?)\((.+)\)$/.test(value)) {
        return `${key}: ${value};`;
      }
      // Check if the value is a number
      if (typeof value === 'number') {
        return `${key}: ${value};`;
      }
      // Fallback for strings and other types
      return `${key}: ${JSON.stringify(value)};`;
    })
    .join('\n');

  const PATH_FILE_PROJECT_IN_ASSET_STYLESHEET_CONFIG = `${PATH_DIR_PROJECT_IN_ASSET_STYLESHEET_CONFIG}_variable.scss`

  // Ensure the output directory exists
  if (!NODE_FS.existsSync(PATH_DIR_PROJECT_IN_ASSET_STYLESHEET_CONFIG)) {
      NODE_FS.mkdirSync(PATH_DIR_PROJECT_IN_ASSET_STYLESHEET_CONFIG, { recursive: true });
  }

  // Write the SCSS content to the specified output file
  NODE_FS.writeFileSync(PATH_FILE_PROJECT_IN_ASSET_STYLESHEET_CONFIG, CONFIG_PROJECT_FLAT_SCSS_BODY, 'utf8');
  LOG.detail(LOG_TAG_STYLESHEET_CONFIG, 'SCSS variables file created at:', PATH_FILE_PROJECT_IN_ASSET_STYLESHEET_CONFIG);

  LOG.end(LOG_TAG_STYLESHEET_CONFIG, 'Complete.');

  done();
}

async function functionProcess_handle_stylesheet() {
  LOG.begin(LOG_TAG_STYLESHEET, 'Running...');

  LOG.debug(LOG_TAG_STYLESHEET, 'Checking files in source path:', { PATH_FILE_PROJECT_IN_ASSET_STYLESHEET });

  const NODE_SASS = require('sass');
  const NODE_GULP_SASS = require('gulp-sass')(NODE_SASS);
  const NODE_GULP_AUTOPREFIXER = (await import('gulp-autoprefixer')).default;

  const LOG_TAG_STYLESHEET_SASS = LOG_TAG_STYLESHEET + ' [🧵 SASS]';

  LOG.debug(LOG_TAG_STYLESHEET_SASS, 'sass.info:', NODE_SASS.info);

  let hasSassError = false;

  return new Promise((resolve, reject) => {
    NODE_GULP.src(PATH_FILE_PROJECT_IN_ASSET_STYLESHEET)
      .pipe(functionLibrary_plumber(() => !hasSassError))
      .on('end', function () {
        if (!hasSassError) {
          LOG.success(LOG_TAG_STYLESHEET, 'All files written.');
        }
        else {
          LOG.error(LOG_TAG_STYLESHEET, 'Error occured.');
        }
        LOG.end(LOG_TAG_STYLESHEET, 'Complete.');
        resolve(); // Resolve the Promise when done
      })
      .on('error', (error) => {
        if (hasSassError) {
          resolve(); // Avoid repeating sass error reports
        }
        else {
          LOG.error(LOG_TAG_STYLESHEET, 'Pipeline error:', error);
          reject(error); // Reject the Promise to ensure Gulp does not continue
        }
      })
      .pipe(NODE_GULP_SOURCEMAP.init())
      .pipe(
        NODE_GULP_SASS.sync({
          errLogToConsole: true,
          outputStyle: 'compressed',
          silenceDeprecations: ['legacy-js-api'],
        })
          .on('data', file => {
            LOG.info(LOG_TAG_STYLESHEET_SASS, "Sass processed result:", {
              file: file.path
            });
            LOG.debug(LOG_TAG_STYLESHEET_SASS, "Sass processed result:", {
              content: file.contents.toString()
            });
          })
          .on('error', function (error) {
            const errorDetails = {
              // message: error.message || 'Unknown error',
              file: error.file ? NODE_PATH.relative(PATH_DIR_PROJECT_IN, error.file) : 'Unknown file',
              line: error.line || 'N/A',
              column: error.column || 'N/A',
              formatted: error.formatted || error.stack || 'No additional details'
            };
            // Log formatted error message
            LOG.error(LOG_TAG_STYLESHEET_SASS, '\n' +
              '========================================\n' +
              `[[ANSI_OFF]]\x1b[37mFile[[ANSI_ON]]:   ${LOG.formatArg(errorDetails.file)},\n` +
              `[[ANSI_OFF]]\x1b[37mLine[[ANSI_ON]]:   ${LOG.formatArg(errorDetails.line)},\n` +
              `[[ANSI_OFF]]\x1b[37mColumn[[ANSI_ON]]: ${LOG.formatArg(errorDetails.column)},\n` +
              '----------------------------------------\n' +
              `[[ANSI_OFF]]\x1b[37m${errorDetails.formatted}[[ANSI_ON]]\n` +
              '========================================'
            );
            LOG.debug(LOG_TAG_STYLESHEET_SASS, 'Error Full:', error);
            hasSassError = true;
            // this.destroy(); // **Destroy the stream instead of ending it**
            // resolve("SASS Error"); // Reject the Promise on error
            // reject(error); // Reject the Promise on error
            this.emit('end'); // End the stream gracefully
          })
      )
      .pipe(NODE_GULP_AUTOPREFIXER({ overrideBrowserslist: ['last 2 versions', '> 5%'], remove: false }))
      .pipe(NODE_GULP_RENAME({ suffix: '.min' }))
      .pipe(appendBrandComment())
      .pipe(NODE_GULP_SOURCEMAP.write(PATH_DIR_OUT_SOURCEMAP))
      .pipe(NODE_GULP.dest(PATH_DIR_PROJECT_OUT_ASSET_STYLESHEET));
  });
}

function functionProcess_primary_stylesheet(done) {
  NODE_GULP.series(functionProcess_handle_stylesheetConfig, functionProcess_handle_stylesheet)(done);
}

// -----------------------------------------------------------------------------
// ### Process - Video
// -----------------------------------------------------------------------------

const CACHE_NAMESPACE_VIDEO = 'video';

const PATH_DIR_PROJECT_IN_ASSET_VIDEO  =  `${PATH_DIR_PROJECT_IN_ASSET}video/`;
const PATH_DIR_PROJECT_OUT_ASSET_VIDEO =  `${PATH_DIR_PROJECT_OUT_ASSET}video/`;
const PATH_FILE_PROJECT_IN_ASSET_VIDEO = [
  `${PATH_DIR_PROJECT_IN_ASSET_VIDEO}${PATH_ALL}.*`,
  ...PATH_DIR_IN_IGNORE_PROJECT
];

function functionProcess_primary_video(done) {
  functionProcess_handle_plumber(
    done,
    CACHE_NAMESPACE_VIDEO,
    PATH_DIR_PROJECT_IN_ASSET_VIDEO,
    PATH_FILE_PROJECT_IN_ASSET_VIDEO,
    PATH_DIR_PROJECT_OUT_ASSET_VIDEO
  );
};

// =============================================================================
// ## Group Process
// =============================================================================

function functionProcess_primaryGroup_html(done) {
  NODE_GULP.series(
    functionProcess_primary_html_config,
    functionProcess_handle_html,
    functionProcess_handle_sitemap
  )(done);
};

function functionProcess_primaryGroup_html_include(done) {
  NODE_GULP.series(
    functionProcess_primary_reset_html,
    functionProcess_primaryGroup_html
  )(done);
}

function functionProcess_primaryGroup_config(done) {
  NODE_GULP.series(
    functionProcess_handle_config,

    functionProcess_primary_reset_data,
    functionProcess_primary_reset_html_config,
    functionProcess_primary_reset_html,

    functionProcess_primary_data,
    functionProcess_primaryGroup_html,
    functionProcess_primary_stylesheet
  )(done);
}

function functionProcess_primaryGroup_all(done) {
  NODE_GULP.series(
    functionProcess_primary_audio,
    functionProcess_primary_brand,
    functionProcess_primary_data,
    functionProcess_primary_favicon,
    functionProcess_primary_file,
    functionProcess_primary_font,
    functionProcess_primary_fontIcon,
    functionProcess_primaryGroup_html,
    functionProcess_primary_image,
    functionProcess_primary_javascript,
    functionProcess_primary_module,
    functionProcess_primary_stylesheet,
    functionProcess_primary_video
  )(done);
}

// =============================================================================
// ## Task Helper
// =============================================================================

// -----------------------------------------------------------------------------
// ### Task Helper - Watch
// -----------------------------------------------------------------------------

const LOG_TAG_BROWSER = '[🌐 Browser]';

// FIXME: Add browser button in future (needs to communicate with gui/cmd via a temp file likely)
// // Function to open the browser manually
// function openBrowser(url) {
//   // Detect the operating system and use the appropriate command
//   const platform = process.platform;

//   LOG.info(LOG_TAG_BROWSER, 'Open: Attempting Open Local URL:', url, '...');

//   if (platform === 'darwin') {
//     // macOS
//     NODE_CHILD_PROCESS.exec(`open ${url}`);
//   } else if (platform === 'win32') {
//     // Windows
//     NODE_CHILD_PROCESS.exec(`start ${url}`);
//   } else {
//     // Linux and other Unix-like systems
//     NODE_CHILD_PROCESS.exec(`xdg-open ${url}`);
//   }
// }

var browserSyncHandler = null;
// var localURL = null;
// const browserSyncConfig = `${PATH_DIR_PROJECT}browser.json`;

class BrowserSyncHandler {
  constructor(reloadDebouncDelay = 1000) {
    this.browserSyncInstance = null; // Delay instantiation
    this.reloadDebouncId = null;
    this.reloadDebouncDelay = reloadDebouncDelay;
  }

  start() {
    if (this.browserSyncInstance?.active) {
      LOG.notice(LOG_TAG_BROWSER, 'Already running.');
      return;
    }

    LOG.begin(LOG_TAG_BROWSER, 'Initializing...');

    // this.removeConfig();

    if (!this.browserSyncInstance) {
      this.browserSyncInstance = require('browser-sync').create(); // Create only when needed
    }

    this.browserSyncInstance.init({
      server: {
        baseDir: PATH_DIR_PROJECT_OUT,
        middleware: [
          (req, res, next) => {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');

            if (!configProjectMerge.option.url.html_extension) {
              LOG.detail(LOG_TAG_BROWSER, '🔗 Request URL: 📥 Incoming:', req.url);

              const originalPath = req.url.split('?')[0]; // Remove query string for file checks
              const htmlPath = `${originalPath}.html`;
              const fullHtmlPath = NODE_PATH.join(PATH_DIR_PROJECT_OUT, htmlPath);

              // Check if the .html file exists
              if (NODE_FS.existsSync(fullHtmlPath)) {
                req.url = htmlPath + (req.url.includes('?') ? `?${req.url.split('?')[1]}` : '');
                LOG.detail(LOG_TAG_BROWSER, '🔗 Request URL: ✍️ Rewritten:', req.url);
              }
            }

            next();
          }
        ]
      }
    }, (err, bs) => {
      if (err) {
        LOG.error(LOG_TAG_BROWSER, err);
        return;
      }

      // If NOT error:

      bs.addMiddleware("*", (req, res) => {
        // Provides the 404 content without redirect.
        const notFoundPath = NODE_PATH.join(PATH_DIR_PROJECT_OUT, '404.html');
        if (NODE_FS.existsSync(notFoundPath)) {
          res.write(NODE_FS.readFileSync(notFoundPath));
        } else {
          LOG.error(LOG_TAG_BROWSER, '404.html not found, returning default error response.');
          res.write('404 - Not Found');
        }
        res.end();
      });

      // this.createConfig(bs);
    });

    this.browserSyncInstance.emitter.on('init', () => {
      NODE_TIMERS.setTimeout(() => {
        LOG.init(LOG_TAG_BROWSER, '▶️ [READY]');
      }, configProjectMerge.option.watch.delay_browser);
    });

    this.browserSyncInstance.emitter.on('change', (file) => {
      LOG.detail(LOG_TAG_BROWSER, '📄 File changed:', functionLibrary_file_getInfo(file));
    });

    this.browserSyncInstance.emitter.on('reload', () => {
      LOG.detail(LOG_TAG_BROWSER, '🔄 Reload.');
    });

    this.browserSyncInstance.emitter.on('file:changed', (file) => {
      LOG.detail(LOG_TAG_BROWSER, '📄 Detailed file change:', functionLibrary_file_getInfo(file));
    });
  }

  reload() {
    if (this.reloadDebouncId) {
      clearTimeout(this.reloadDebouncId);
    }

    this.reloadDebouncId = NODE_TIMERS.setTimeout(() => {
      if (this.browserSyncInstance?.active) {
        LOG.info(LOG_TAG_BROWSER, '🔄 Reloading...');
        this.browserSyncInstance.reload();
      } else {
        LOG.error(LOG_TAG_BROWSER, 'Instance is not available for reload.');
      }
    }, configProjectMerge.option.watch.delay_browser);
  }

  // createConfig(bs) {
  //   if (!bs) {
  //     return;
  //   }

  //   // localURL = bs.options.get('urls').get('local');
  //   // NODE_FS.writeFileSync(browserSyncConfig, JSON.stringify({ localURL }));
  //   LOG.info(LOG_TAG_BROWSER, 'Config file created.');
  // }

  // removeConfig() {
  //   if (!NODE_FS.existsSync(browserSyncConfig)) {
  //     return;
  //   }

  //   NODE_FS.unlinkSync(browserSyncConfig);
  //   LOG.info(LOG_TAG_BROWSER, 'Config file deleted.');
  // }

  async stop() {
    LOG.begin(LOG_TAG_BROWSER, 'Begin...');

    if (!this.browserSyncInstance?.active) {
      LOG.notice(LOG_TAG_BROWSER, 'Not running.');
      return;
    }

    // this.removeConfig();

    this.browserSyncInstance.exit();

    LOG.end(LOG_TAG_BROWSER, 'Complete.');
  }
}

const TASK_WATCH_BROWSER_RELOAD = 'watch_browser_reload';
const PATH_WATCH_BROWSER = `${PATH_DIR_PROJECT_OUT}${PATH_ALL}`;

// function functionProcess_primary_browserOpen(done) {
//   if (!localURL) {
//     if (NODE_FS.existsSync(browserSyncConfig)) {
//       LOG.info(LOG_TAG_BROWSER, '[Open] Reading Local URL from file...'));
//       const data = NODE_FS.readFileSync(browserSyncConfig, 'utf-8');
//       const config = JSON.parse(data);
//       localURL = config.localURL;
//     }
//   }

//   if (!localURL) {
//     LOG.error(LOG_TAG_BROWSER, '[Open] Local URL not set."));
//     done();
//     return;
//   }

//   LOG.info(LOG_TAG_BROWSER, '[Open] Opening Local URL.');
//   openBrowser(localURL);
//   done();
// }

function functionProcess_primary_browserReload(done) {
  if (!browserSyncHandler) {
    LOG.error(LOG_TAG_BROWSER, '[Reload] Handler is not available.');
    done();
    return;
  }
  browserSyncHandler.reload();
  done();
}

const LOG_TAG_WATCH = '[👁️ Watch]';

async function functionProcess_handle_removeDeleted(path, type) {
  const LOG_TAG_WATCH_REMOVE_DELETED = LOG_TAG_WATCH + ' [🗑️ Remove Deleted]';

  LOG.begin(LOG_TAG_WATCH_REMOVE_DELETED, 'Running...');

  function getRelatedFiles(path) {
    const PATH_EXT = NODE_PATH.extname(path);
    const PATH_BASE = path.replace(PATH_EXT, '');

    // Build related files based on extension
    if (PATH_EXT === '.scss' || PATH_EXT === '.css') {
      return [`${PATH_BASE}.min.css`, `${PATH_BASE}.min.css.map`];
    } else if (PATH_EXT === '.js') {
      return [`${PATH_BASE}.min.js`, `${PATH_BASE}.min.js.map`];
    }

    // Default to the resolved path if no related files exist
    return [path];
  }

  const PATH_RELATED_OUT = NODE_PATH.resolve(
    PATH_DIR_PROJECT_OUT,
    NODE_PATH.relative(NODE_PATH.resolve(PATH_DIR_PROJECT_IN), path)
  );

  const PATH_TO_REMOVE_ARRAY = getRelatedFiles(PATH_RELATED_OUT);

  for (const PATH_TO_REMOVE of PATH_TO_REMOVE_ARRAY) {
    if (!functionLibrary_path_exists(PATH_TO_REMOVE)) {
      LOG.success(LOG_TAG_WATCH_REMOVE_DELETED, 'Path already does not exist:', {PATH_TO_REMOVE});
    } else {
      try {
        const PATH_TO_REMOVE_STAT = await NODE_FS.promises.stat(PATH_TO_REMOVE);

        if (PATH_TO_REMOVE_STAT.isDirectory()) {
          const PATH_REMOVED = await import('del').then(({ deleteAsync }) =>
            deleteAsync([`${PATH_TO_REMOVE}/**`, PATH_TO_REMOVE], { force: true })
          );
          LOG.success(LOG_TAG_WATCH_REMOVE_DELETED, 'Removed directory and contents:', {
            'Path': PATH_REMOVED
          });
        } else {
          await NODE_FS.promises.unlink(PATH_TO_REMOVE);
          LOG.success(LOG_TAG_WATCH_REMOVE_DELETED, 'Removed file:', {
            'Path': PATH_TO_REMOVE
          });
        }
      } catch (error) {
        if (error.code === 'ENOENT') {
          LOG.success(LOG_TAG_WATCH_REMOVE_DELETED, 'Path already does not exist (ENOENT):', {
            'Path': PATH_TO_REMOVE
          });
        } else {
          LOG.error(LOG_TAG_WATCH_REMOVE_DELETED, 'Error removing path:', {
            'Path': PATH_TO_REMOVE,
            'Error': error
          });
        }
      }
    }
  }
  LOG.end(LOG_TAG_WATCH_REMOVE_DELETED, 'Complete.');
}

class SubWatcher {
  constructor(pathRoot, taskname, watcherPatterns, initCallback, mainReady, isInput) {
    // this.debug = true;
    this.pathRoot = pathRoot;
    this.taskname = taskname;
    this.watcherPatterns = functionLibrary_variable_ensureIsArray(watcherPatterns);
    this.callbackDebouncId = null;
    this.initCallback = initCallback;
    this.mainReady = mainReady;
    this.isInput = isInput;
    this.watcher = null; // chokidar watcher instance
    this.isReady = false;

    // Compile separate matchers for inclusion and exclusion
    this.includeMatcher = NODE_PICOMATCH(this.watcherPatterns.filter(p => !p.startsWith('!')), { dot: true });
    this.excludeMatcher = NODE_PICOMATCH(this.watcherPatterns.filter(p => p.startsWith('!')).map(p => p.slice(1)), { dot: true });

    LOG.init(LOG_TAG_WATCH, 'initializing:', this.taskname, {
        pathRoot: this.pathRoot,
        watcherPatterns: this.watcherPatterns
      }
    );
  }

  start() {
    const options = {
      persistent: true,
      ignoreInitial: !this.mainReady,
      // depth: undefined, // Recursive watcher by default

      // awaitWriteFinish: {
      //   stabilityThreshold: 500, // Reduce time to stabilize writes
      //   pollInterval: 100
      // },
      // followSymlinks: false,  // Prevent symlink following which may cause locks
      // usePolling: false,      // Disable polling to avoid high CPU usage and locks
      // // depth: 1,               // Limit depth to reduce unnecessary locking
      // alwaysStat: false,       // Avoid unnecessary stat calls to minimize locking

      // persistent: false,

      usePolling: true,
      interval: 1000,//configProjectMerge.option.watch.delay_change, // being used in async onchange()
    }
    this.watcher = NODE_CHOKIDAR.watch(this.pathRoot, options);

    LOG.debug(LOG_TAG_WATCH, this.taskname, {mainReady: this.mainReady, options: options});

    this.watcher
    .on('add', (path) => {
      try {
        path = functionLibrary_path_normalize(path);

        // Match against precompiled glob patterns
        if (!this.matcher(path)) {
          return;
        }

        // if (this.isReady || this.debugInit) {
          LOG.detail(LOG_TAG_WATCH, '[ADD] 📄 File:', {taskname: this.taskname, path: path});
        // }

        this.onchange();
      } catch (error) {
        LOG.error(LOG_TAG_WATCH, this.taskname, '[ADD] 📄 File:', error);
      }
    })
    .on('change', (path) => {
      try {
        path = functionLibrary_path_normalize(path);

        // Match against precompiled glob patterns
        if (!this.matcher(path)) {
          return;
        }

        LOG.detail(LOG_TAG_WATCH, '[CHANGE] 📄 File:', {taskname: this.taskname, path: path});
        this.onchange();
      } catch (error) {
        LOG.error(LOG_TAG_WATCH, this.taskname, '[CHANGE] 📄 File:', error);
      }
    })
    .on('error', (error) => {
      if (error.code === 'EPERM') {
        console.notice(ANSI.format(ANSI.bc.fg.yellow, `👁️ Watcher \`${this.taskname}\`: EPERM Error: ${error.message}`));
      } else {
        LOG.error(LOG_TAG_WATCH, 'Unexpected:', error);
      }
    })
    .on('ready', () => {
      if (this.isReady) return;
      this.isReady = true;

      LOG.init([
        '[[NEWLINES]]',
        ['[[NORMAL]]', LOG_TAG_WATCH, 'Ready:', this.taskname],
        [ '[[LIST]]', 'All paths initialized.' ]
      ]);

      if (this.initCallback) {
        this.initCallback();
      }
    });
    // .on('all', (event, path) => {
    //   LOG.debug(LOG_TAG_WATCH, {event, path});
    // });

    if (this.isInput) {
      this.watcher
      .on('unlink', (path) => {
        try {
          path = functionLibrary_path_normalize(path);

          // Match against precompiled glob patterns
          if (!this.matcher(path)) {
            return;
          }

          LOG.detail(LOG_TAG_WATCH, '[REMOVE] 📄 File:', {taskname: this.taskname, path: path});
          const key = NODE_PATH.relative(NODE_PATH.resolve(PATH_DIR_PROJECT_IN), path).trim();
          functionProcess_handle_removeDeleted(path, 'file');
          CACHE_PROJECT.remove(this.cacheNamespace, key);
        } catch (error) {
          LOG.error(LOG_TAG_WATCH, this.taskname, '[REMOVE] 📄 File:', error);
        }
      })
      // .on('addDir', (path) => {
      //   try {
      //     path = functionLibrary_path_normalize(path);

      //     // Match against precompiled glob patterns
      //     if (!this.matcher(path)) {
      //       return;
      //     }

      //     // if (this.isReady || this.debugInit) {
      //       LOG.detail(LOG_TAG_WATCH, '[ADD] 📄 📂 Directory:', {taskname: this.taskname, path: path});
      //     // }
      //   } catch (error) {
      //     LOG.error(LOG_TAG_WATCH, this.taskname, '[ADD] 📄 📂 Directory:', error);
      //   }
      // })
      .on('unlinkDir', (path) => {
        try {
          path = functionLibrary_path_normalize(path);

          // // Match against precompiled glob patterns
          // if (!this.matcher(path)) {
          //   return;
          // }

          LOG.detail(LOG_TAG_WATCH, '[REMOVE] 📄 📂 Directory:', {taskname: this.taskname, path: path});
          functionProcess_handle_removeDeleted(path, 'directory');
          // CACHE_PROJECT.remove handled already by unlink
        } catch (error) {
          LOG.error(LOG_TAG_WATCH, this.taskname, '[ADD] 📄 📂 Directory:', error);
        }
      });
    }

    // LOG.init([
    //   '[[NEWLINES]]',
    //   ['[[NORMAL]]', LOG_TAG_WATCH, 'Ready:', this.taskname],
    //   ['[[LIST]]', 'All paths initialized.']
    // ], {
    //     pathRoot: this.pathRoot,
    //     watcherPatterns: this.watcherPatterns
    // });
    LOG.init([
      '[[NEWLINES]]',
      ['[[NORMAL]]', LOG_TAG_WATCH, 'Ready:', this.taskname],
      ['[[LIST]]', 'All paths initialized.']
    ]);

    if (this.mainReady) {
      this.onchange();
    }
  }

  matcher(path) {
    path = functionLibrary_path_normalize(path);

    // Check inclusion and exclusion
    const isIncluded = this.includeMatcher(path);
    const isExcluded = this.excludeMatcher(path);

    if (!isIncluded || isExcluded) {
      LOG.debug(LOG_TAG_WATCH, this.taskname, 'Ignored path:', {path});
      return false;
    }

    return true;
  }

  stop() {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
      LOG.shutdown([
        '[[NEWLINES]]',
        ['[[NORMAL]]', LOG_TAG_WATCH, this.taskname],
        ['[[LIST]]', 'Stopped watching path:', this.pathRoot]
      ]);
    }
  }

  async onchange() {
    const now = Date.now();

    if (this.callbackDebouncId) {
      const lastClearedDuration = now - (this.lastCallbackTime || now);
      LOG.debug(LOG_TAG_WATCH, this.taskname, '[CHANGE] Debounce: Remaining:', lastClearedDuration, 'ms');
      clearTimeout(this.callbackDebouncId);
    }

    const delay = configProjectMerge.option.watch.delay_change;

    this.callbackDebouncId = NODE_TIMERS.setTimeout(async () => {
      try {
        if (this.taskname) {
          // Use the named task in Gulp
          await NODE_GULP.series(this.taskname)();
        }
      } catch (error) {
        LOG.error(LOG_TAG_WATCH, this.taskname, 'Callback:', error);
      }
    }, delay);

    LOG.debug(LOG_TAG_WATCH, this.taskname, '[CHANGE] Debounce: Duration:', delay, 'ms');

    this.lastCallbackTime = now;
  }
}

const watchMainPaths = [
  PATH_DIR_PROJECT,
  PATH_DIR_PROJECT_IN,
  PATH_DIR_PROJECT_IN_ASSET,
  PATH_DIR_PROJECT_IN_FAVICON,
  PATH_DIR_PROJECT_IN_HTML_PARTIAL_CONFIG_TEMPLATE,
  PATH_DIR_PROJECT_IN_HTML_INCLUDE,
  PATH_DIR_PROJECT_OUT,
];

const TASK_BUILD              = 'build';
const TASK_BUILD_AUDIO        = 'build_audio';
const TASK_BUILD_BRAND        = 'build_brand';
const TASK_BUILD_CONFIG       = 'build_config';
const TASK_BUILD_DATA         = 'build_data';
const TASK_BUILD_FAVICON      = 'build_favicon';
const TASK_BUILD_FILE         = 'build_file';
const TASK_BUILD_FONT         = 'build_font';
const TASK_BUILD_FONT_ICON    = 'build_font_icon';
const TASK_BUILD_HTML_CONFIG  = 'build_html_config';
const TASK_BUILD_HTML         = 'build_html';
const TASK_BUILD_HTML_INCLUDE = 'build_html_include';
const TASK_BUILD_IMAGE        = 'build_image';
const TASK_BUILD_JAVASCRIPT   = 'build_javascript';
const TASK_BUILD_MODULE       = 'build_module';
const TASK_BUILD_STYLESHEET   = 'build_stylesheet';
const TASK_BUILD_VIDEO        = 'build_video';

// Function to process ignore patterns and debug
function createIgnoreFunction(watchMainPaths, ignorePatterns) {
  // Compile picomatch functions for ignore patterns
  const ignoreMatchers = ignorePatterns.map(pattern => NODE_PICOMATCH(pattern.replace(/!/g, ''), { dot: true }));

  // Compile picomatch functions for watch paths
  const watchMatchers = watchMainPaths.map(path => NODE_PICOMATCH(path, { dot: true }));

  return (path) => {
    const normalizedPath = path.replace(/\\/g, '/'); // Normalize path for cross-platform consistency

    // Check if the path explicitly matches one of the watch paths
    const isExplicitlyWatched = watchMatchers.some(matcher => matcher(normalizedPath));

    // Check if the path matches any of the ignore patterns
    const isIgnoredByPattern = ignoreMatchers.some(matcher => matcher(normalizedPath));

    // Ignore the path if it doesn't match any watch path or matches an ignore pattern
    const shouldIgnore = isIgnoredByPattern && !isExplicitlyWatched;

    // Debug output (optional)
    // LOG.detail(`[DEBUG] Path: ${normalizedPath}, Ignored: ${shouldIgnore}`);
    if (shouldIgnore) {
      LOG.debug(LOG_TAG_WATCH, '\`MAIN\`: [SKIP] Ignored path:', {normalizedPath});
    }

    return shouldIgnore;
  };
}

class WatchManager {
  constructor(watchPaths, shutdownCallback, browserSyncHandler) {
    this.watchPaths = functionLibrary_variable_ensureIsArray(watchPaths);
    this.watcher = null;
    this.subWatchers = new Map(); // Map of pathRoot -> SubWatcher instances
    this.shutdownCallback = shutdownCallback;
    this.countSubwatcher = 0;
    this.countSubwatcherReady = 0;
    this.isReady = false;
    this.browserSyncHandler = browserSyncHandler; // Instance of BrowserSyncHandler
    this.pathOut = PATH_DIR_PROJECT_OUT.replace(/\/+$/, '');

    this.watchMainFunctionMap = {
      [PATH_DIR_PROJECT_IN_ASSET_AUDIO]:                  { taskname: TASK_BUILD_AUDIO,          cacheNamespace: CACHE_NAMESPACE_AUDIO,       pattern: PATH_FILE_PROJECT_IN_ASSET_AUDIO },
      [PATH_DIR_PROJECT_IN_ASSET_BRAND]:                  { taskname: TASK_BUILD_BRAND,          cacheNamespace: null,                        pattern: PATH_FILE_PROJECT_IN_ASSET_BRAND },
      [PATH_FILE_CONFIG_PROJECT]:                         { taskname: TASK_BUILD_CONFIG,         cacheNamespace: CACHE_NAMESPACE_CONFIG,      pattern: PATH_FILE_CONFIG_PROJECT },
      [PATH_DIR_PROJECT_IN_DATA]:                         { taskname: TASK_BUILD_DATA,           cacheNamespace: CACHE_NAMESPACE_DATA,        pattern: PATH_FILE_PROJECT_IN_DATA },
      [PATH_DIR_PROJECT_IN_FAVICON]:                      { taskname: TASK_BUILD_FAVICON,        cacheNamespace: CACHE_NAMESPACE_FAVICON,     pattern: PATH_FILE_PROJECT_IN_FAVICON },
      [PATH_DIR_PROJECT_IN_ASSET_FILE]:                   { taskname: TASK_BUILD_FILE,           cacheNamespace: CACHE_NAMESPACE_FILE,        pattern: PATH_FILE_PROJECT_IN_ASSET_FILE },
      [PATH_DIR_PROJECT_IN_ASSET_FONT]:                   { taskname: TASK_BUILD_FONT,           cacheNamespace: CACHE_NAMESPACE_FONT,        pattern: PATH_FILE_PROJECT_IN_ASSET_FONT },
      [PATH_DIR_PROJECT_IN_ASSET_FONT_ICON]:              { taskname: TASK_BUILD_FONT_ICON,      cacheNamespace: CACHE_NAMESPACE_FONT_ICON,   pattern: PATH_FILE_PROJECT_IN_ASSET_FONT_ICON_WATCH },
      [PATH_DIR_PROJECT_IN_HTML_PARTIAL_CONFIG_TEMPLATE]: { taskname: TASK_BUILD_HTML_CONFIG,    cacheNamespace: CACHE_NAMESPACE_HTML_CONFIG, pattern: PATH_FILE_PROJECT_IN_HTML_CONFIG_WATCH },
      [PATH_DIR_PROJECT_IN_HTML]:                         { taskname: TASK_BUILD_HTML,           cacheNamespace: CACHE_NAMESPACE_HTML,        pattern: PATH_FILE_PROJECT_IN_HTML },
      [PATH_DIR_PROJECT_IN_HTML_INCLUDE]:                 { taskname: TASK_BUILD_HTML_INCLUDE,   cacheNamespace: null,                        pattern: PATH_FILE_PROJECT_IN_HTML_INCLUDE },
      [PATH_DIR_PROJECT_IN_ASSET_IMAGE]:                  { taskname: TASK_BUILD_IMAGE,          cacheNamespace: CACHE_NAMESPACE_IMAGE,       pattern: PATH_FILE_PROJECT_IN_ASSET_IMAGE },
      [PATH_DIR_PROJECT_IN_ASSET_JAVASCRIPT]:             { taskname: TASK_BUILD_JAVASCRIPT,     cacheNamespace: CACHE_NAMESPACE_JAVASCRIPT,  pattern: PATH_FILE_PROJECT_IN_ASSET_JAVASCRIPT },
      [PATH_DIR_PROJECT_IN_ASSET_MODULE]:                 { taskname: TASK_BUILD_MODULE,         cacheNamespace: CACHE_NAMESPACE_MODULE,      pattern: PATH_DIR_PROJECT_IN_ASSET_MODULE },
      [PATH_DIR_PROJECT_IN_ASSET_STYLESHEET]:             { taskname: TASK_BUILD_STYLESHEET,     cacheNamespace: null,                        pattern: PATH_FILE_PROJECT_IN_ASSET_STYLESHEET_WATCH },
      [PATH_DIR_PROJECT_IN_ASSET_VIDEO]:                  { taskname: TASK_BUILD_VIDEO,          cacheNamespace: CACHE_NAMESPACE_VIDEO,       pattern: PATH_FILE_PROJECT_IN_ASSET_VIDEO },
      [PATH_DIR_PROJECT_OUT]:                             { taskname: TASK_WATCH_BROWSER_RELOAD, cacheNamespace: null,                        pattern: PATH_WATCH_BROWSER },
    };

    LOG.debug(LOG_TAG_WATCH, '\`MAIN\`:', {watchPaths: this.watchPaths});
  }

  initMainWatcher() {
    this.watcher = NODE_CHOKIDAR.watch(this.watchPaths, {
      persistent: true,
      depth: 0, // Non-recursive watcher for main paths
      ignored: createIgnoreFunction(this.watchPaths, createPathIgnoreArray('')),
    });

    this.watcher
      .on('add', (path) => {
        path = functionLibrary_path_normalize(path);

        if (this.isReady) {
          LOG.detail(LOG_TAG_WATCH, '\`MAIN\`: 📄 [ADD] File:', {path});
        }

        this.setupSubWatcher(path);
      })
      .on('addDir', (path) => {
        path = functionLibrary_path_normalize(path);

        if (this.isReady) {
          LOG.detail(LOG_TAG_WATCH, '\`MAIN\`: 📂 [ADD] Directory:', {path});
        }

        this.setupSubWatcher(path);
      })
      .on('unlinkDir', (path) => {
        path = functionLibrary_path_normalize(path);

        if (this.isReady) {
          LOG.detail(LOG_TAG_WATCH, '\`MAIN\`: 📂 [REMOVE] Directory:', {path});
        }

        this.removeSubWatcher(path);

        if (path.startsWith(this.pathOut)) {
          return;
        }

        functionProcess_handle_removeDeleted(path, 'directory');

        const entry = this.watchMainFunctionMap[path  + '/'];

        let taskname = null;
        let cacheNamespace = null;
        if (Array.isArray(entry)) {
          // Handle multiple entries in the array case (e.g. image, script paths)
          taskname = entry.map(item => item.taskname);
          cacheNamespace = entry.map(item => item.cacheNamespace);
        } else if (entry) {
          taskname = entry.taskname;
          cacheNamespace = entry.cacheNamespace;
        }

        if (taskname) {
          this.removeSubWatcher(path);
          functionProcess_handle_removeDeleted(path, 'directory');

          // Handle multiple identities in the case of arrays
          if (Array.isArray(cacheNamespace)) {
            cacheNamespace.forEach(id => CACHE_PROJECT.remove(id));
          } else {
            CACHE_PROJECT.remove(cacheNamespace);
          }
        } else {
          LOG.error(LOG_TAG_WATCH, 'Error: Identity not found for path:', path);
        }

      })
      .on('error', (error) => {
        if (error.code === 'EPERM') {
          LOG.notice(LOG_TAG_WATCH, '\`MAIN\`: 📂 Directory EPERM Error:', error, '\n  > This usually occurs when attempting to watch a deleted or inaccessible path, check if following log reports a deleted or inaccessible path.');
        } else {
          LOG.error(LOG_TAG_WATCH, '\`MAIN\`: Unexpected:', error);
        }
      })
      .on('ready', () => {
        this.checkIsReady();
      });

      LOG.init(LOG_TAG_WATCH, '▶️ Initializing...');
  }

  setupSubWatcher(pathRoot) {
    // Find matching entry in this.watchMainFunctionMap
    const entry = Object.entries(this.watchMainFunctionMap).find(([key]) => {
      const normalizedKey = functionLibrary_path_normalize(key).replace(/\/+$/, ''); // Remove trailing slashes
      pathRoot = pathRoot.replace(/\/+$/, ''); // Remove trailing slashes from pathRoot
      LOG.debug(LOG_TAG_WATCH, '\`MAIN\`: Pre-Initialization:', this.taskname, 'Comparing normalized path to key:', {pathRoot, normalizedKey});
      // return pathRoot.startsWith(normalizedKey);
      return pathRoot === normalizedKey;
    });

    // If no match, skip creating the sub-watcher
    if (!entry) {
      LOG.debug(LOG_TAG_WATCH, '\`MAIN\`: Pre-Initialization:', this.taskname, '[SKIP] No matching pattern for path:', {pathRoot});
      return;
    }

    // Extract array of configurations from the matching entry
    const [matchedKey, configs] = entry;

    // Print success for matching entry
    LOG.debug(LOG_TAG_WATCH, '\`MAIN\`: Pre-Initialization:', this.taskname, '[SUCCESS] Match found for path with key:', {pathRoot, matchedKey});

    // Ensure configs is always treated as an array
    const watcherConfigs = functionLibrary_variable_ensureIsArray(configs);

    watcherConfigs.forEach(({ taskname, pattern }) => {
      if (this.subWatchers.has(`${pathRoot}:${taskname}`)) {
        LOG.notice(LOG_TAG_WATCH, '\`MAIN\`: Pre-Initialization:', taskname, '[SKIP] Already watching path:', {pathRoot});
        return; // Skip duplicate watcher creation
      }

      this.countSubwatcher++;

      const subWatcher = new SubWatcher(pathRoot, taskname, pattern, () => {
        NODE_TIMERS.setTimeout(() => {
          this.countSubwatcherReady++;
          this.checkIsReady();
        }, 1000); // give time for other sub watchers to begin init
      }, this.isReady, pathRoot !== this.pathOut);

      subWatcher.start();

      this.subWatchers.set(`${pathRoot}:${taskname}`, subWatcher);
    });
  }

  checkIsReady() {
    if (this.isReady || this.countSubwatcherReady != this.countSubwatcher) {
      return;
    }

    this.isReady = true;

    LOG.init([
      '[[NEWLINES]]',
      ['[[NORMAL]]', LOG_TAG_WATCH, '\`MAIN\` Ready:'],
      ['[[LIST]]', 'All paths initialized:', { subWatcherIdentities: Array.from(this.subWatchers.keys()) }]
    ]);

    // Start Browser after all paths are initialized
    if (this.browserSyncHandler) {
      this.browserSyncHandler.start();
    }
  }

  removeSubWatcher(path) {
    const keysToRemove = Array.from(this.subWatchers.keys()).filter(key => key.startsWith(`${path}:`));
    keysToRemove.forEach(key => {
      const subWatcher = this.subWatchers.get(key);
      if (subWatcher) {
        subWatcher.stop();
        this.subWatchers.delete(key);
      }
    });
  }

  async shutdown() {
    // Stop Browser during shutdown
    if (this.browserSyncHandler) {
      this.browserSyncHandler.stop();
    }

    LOG.detail(LOG_TAG_WATCH, { subWatcherIdentities: Array.from(this.subWatchers.keys()) });

    this.subWatchers.forEach((subWatcher) => subWatcher.stop());
    if (this.watcher) this.watcher.close();

    LOG.shutdown([
      '[[NEWLINES]]',
      ['[[NORMAL]]', LOG_TAG_WATCH, '\`MAIN\`:'],
      [
        '[[LIST]]',
        'MAIN and all sub-watchers shut down.',
        'Press `Ctrl+C` to exit process...'
      ]
    ]);

    this.shutdownCallback();
  }
}

var watchManager = null;

// Attach cleanup function to process exit signals
const cleanup = () => {
  if(watchManager) {
    watchManager.shutdown();
  }
  process.exit(0);
};

process.on('SIGINT', cleanup); // Handle Ctrl+C
process.on('SIGTERM', cleanup); // Handle termination signals
process.on('exit', cleanup); // Handle normal process exit

function functionProcess_primary_watch(done) {
  return new Promise((resolve) => {
    browserSyncHandler = new BrowserSyncHandler();
    watchManager = new WatchManager(watchMainPaths, () => {
      done();
      resolve();
    },
    browserSyncHandler);
    watchManager.initMainWatcher();
  });
}

// -----------------------------------------------------------------------------
// ### Task Helper - Cache
// -----------------------------------------------------------------------------

async function functionProcess_handle_removePaths(pattern) {
  const LOG_TAG_REMOVE_PATTERNS = '[🗑️ Remove Patterns]';

  LOG.begin(LOG_TAG_REMOVE_PATTERNS, 'Initializing:', {pattern});

  try {
    const deletedPaths = await import('del').then(({ deleteAsync }) =>
      deleteAsync(pattern, { force: true }) // Use "force: true" for outside CWD
    );

    if (deletedPaths.length === 0) {
      LOG.notice(LOG_TAG_REMOVE_PATTERNS, 'No matching files or directories found for deletion.');
    } else {
      LOG.success(LOG_TAG_REMOVE_PATTERNS, 'Deleted files and directories:', deletedPaths);
    }
  } catch (error) {
    LOG.error(LOG_TAG_REMOVE_PATTERNS, error);
  }

  LOG.end(LOG_TAG_REMOVE_PATTERNS, 'Complete.');
}

async function functionProcess_handle_reset(taskname = null, pattern = null) {
  const LOG_TAG_RESET = '[🔄 Reset]';

  LOG.begin(LOG_TAG_RESET, 'Running:', {taskname, pattern});
  // return;

  if (taskname) {
    CACHE_PROJECT.clear(taskname);
  }

  if (pattern) {
    await functionProcess_handle_removePaths(pattern);
  }

  LOG.end(LOG_TAG_RESET, 'Complete.');
}

function functionProcess_primary_reset(done)             { functionProcess_handle_reset("all",                       PATH_DIR_PROJECT_OUT)                   .then(done); };
function functionProcess_primary_reset_audio(done)       { functionProcess_handle_reset(CACHE_NAMESPACE_AUDIO,       PATH_DIR_PROJECT_OUT_ASSET_AUDIO)       .then(done); };
function functionProcess_primary_reset_brand(done)       { functionProcess_handle_reset(null,                        PATTERN_RESET_BRAND)                    .then(done); };
function functionProcess_primary_reset_config(done)      { functionProcess_handle_reset(CACHE_NAMESPACE_CONFIG,      null)                                   .then(done); };
function functionProcess_primary_reset_data(done)        { functionProcess_handle_reset(CACHE_NAMESPACE_DATA,        PATTERN_RESET_DATA)                     .then(done); };
function functionProcess_primary_reset_favicon(done)     { functionProcess_handle_reset(CACHE_NAMESPACE_FAVICON,     PATTERN_RESET_FAVICON)                  .then(done); };
function functionProcess_primary_reset_file(done)        { functionProcess_handle_reset(CACHE_NAMESPACE_FILE,        PATH_DIR_PROJECT_OUT_ASSET_FILE)        .then(done); };
function functionProcess_primary_reset_font(done)        { functionProcess_handle_reset(CACHE_NAMESPACE_FONT,        PATH_DIR_PROJECT_OUT_ASSET_FONT)        .then(done); };
function functionProcess_primary_reset_fontIcon(done)    { functionProcess_handle_reset(CACHE_NAMESPACE_FONT_ICON,   PATTERN_RESET_FONT_ICON)                .then(done); };
function functionProcess_primary_reset_html_config(done) { functionProcess_handle_reset(CACHE_NAMESPACE_HTML_CONFIG, PATTERN_RESET_HTML_PARTIAL_CONFIG).then(done); };
function functionProcess_primary_reset_html(done)        { functionProcess_handle_reset(CACHE_NAMESPACE_HTML,        PATTERN_RESET_HTML)                     .then(done); };
function functionProcess_primary_reset_image(done)       { functionProcess_handle_reset(CACHE_NAMESPACE_IMAGE,       PATH_DIR_PROJECT_OUT_ASSET_IMAGE)       .then(done); };
function functionProcess_primary_reset_javascript(done)  { functionProcess_handle_reset(CACHE_NAMESPACE_JAVASCRIPT,  PATH_DIR_PROJECT_OUT_ASSET_JAVASCRIPT)  .then(done); };
function functionProcess_primary_reset_module(done)      { functionProcess_handle_reset(CACHE_NAMESPACE_MODULE,      PATH_DIR_PROJECT_OUT_ASSET_MODULE)      .then(done); };
function functionProcess_primary_reset_stylesheet(done)  { functionProcess_handle_reset(null,                        PATTERN_RESET_STYLESHEET)               .then(done); };
function functionProcess_primary_reset_video(done)       { functionProcess_handle_reset(CACHE_NAMESPACE_VIDEO,       PATH_DIR_PROJECT_OUT_ASSET_VIDEO)       .then(done); };

// =============================================================================
// ## GUI Hidden Task
// =============================================================================

// -----------------------------------------------------------------------------
// ### GUI Hidden Task - Browser Reload
// -----------------------------------------------------------------------------

NODE_GULP.task(TASK_WATCH_BROWSER_RELOAD,  functionProcess_primary_browserReload);
// NODE_GULP.task('watch_browser_open',    functionProcess_primary_browserOpen);

// -----------------------------------------------------------------------------
// ### GUI Hidden Task - Intro
// -----------------------------------------------------------------------------

const MODULE_INTRO = require(NODE_PATH.join(PATH_DIR_ROOT, 'source/node_modules_custom/staticus-intro'));
let introComplete = false;

function intro(done) {
  return MODULE_INTRO.getIntroString()
    .then(introString => {
      LOG.plain(introString);
      introComplete = true;

      // MODULE_INTRO.getIntroString(true, true)
      // .then(introString => {
      //   LOG.plain(introString);
      //   done();
      // });
      done();
    })
    .catch(error => {
      LOG.plain(ANSI.fg.yellow + 'Staticus Website Compiler' + ANSI.reset); // Fallback output
      console.error('Error displaying intro:', error);
    });
}

// -----------------------------------------------------------------------------
// ### GUI Hidden Task - Create Task
// -----------------------------------------------------------------------------

// Function to conditionally run intro before tasks
function createTask(taskName, ...taskFunctions) {
  NODE_GULP.task(taskName, (done) => {
    if (!introComplete) {
      NODE_GULP.series(intro, ...taskFunctions)(() => {
        done();
      });
    } else {
      NODE_GULP.series(...taskFunctions)(done);
    }
  });
}

// =============================================================================
// ## Task Test
// =============================================================================

const path_in_test_file_match        = [`./source/test/file_match/${PATH_ALL}`].concat(PATH_DIR_IN_IGNORE_ROOT);

function functionProcess_primary_test_fileMatch(done) {
  functionLibrary_file_listFilesMatched(path_in_test_file_match, PATH_ROOT, VERBOSE_LISTFILES.BASIC);
  done();
};

function functionProcess_primary_test_config(done) {
  functionProcess_handle_config(done);
}

// createTask('test',               functionProcess_primary_test_config, functionProcess_primary_test_fileMatch);
createTask('test_config',        functionProcess_primary_test_config);
createTask('test_file_match',    functionProcess_primary_test_fileMatch);
createTask('test_ansi_standard', (done) => { ANSI.test.standard(); done(); });
createTask('test_ansi_color256', (done) => { ANSI.test.color256(); done(); });
createTask('test_ansi_screen',   (done) => { ANSI.test.screen(); done(); });
createTask('test_ansi_cursor',   (done) => { ANSI.test.cursor(); done(); });
createTask('test_ansi_reveal',   (done) => { ANSI.test.reveal(); done(); });
createTask('test_ansi_clean',    (done) => { ANSI.test.clean(); done(); });
createTask('test_ansi_all',      (done) => { ANSI.test.all(); done(); });

// =============================================================================
// ## Task
// =============================================================================

// -----------------------------------------------------------------------------
// ### Task - General - Bulk task that runs every Build task.
// -----------------------------------------------------------------------------

createTask('default', functionProcess_primaryGroup_all);
createTask('watch',   functionProcess_primary_watch); // Run live server (must have built all assets).
createTask('package', functionProcess_primary_package); // Package compiled files to zip (located in target directory).
createTask('about',   functionProcess_primaryGroup_about); // Get info about Staticus Website Compiler & selected project

// -----------------------------------------------------------------------------
// ### Task - Build - Individual task that builds one asset group, respects cache.
// -----------------------------------------------------------------------------

createTask(TASK_BUILD,              functionProcess_primaryGroup_all); // Bulk task that runs every Build task.
createTask(TASK_BUILD_AUDIO,        functionProcess_primary_audio);
createTask(TASK_BUILD_BRAND,        functionProcess_primary_brand);
createTask(TASK_BUILD_CONFIG,       functionProcess_primaryGroup_config);
createTask(TASK_BUILD_DATA,         functionProcess_primary_data);
createTask(TASK_BUILD_FAVICON,      functionProcess_primary_favicon);
createTask(TASK_BUILD_FILE,         functionProcess_primary_file);
createTask(TASK_BUILD_FONT,         functionProcess_primary_font);
createTask(TASK_BUILD_FONT_ICON,    functionProcess_primary_fontIcon);
createTask(TASK_BUILD_HTML_CONFIG,  functionProcess_primary_html_config);
createTask(TASK_BUILD_HTML_INCLUDE, functionProcess_primaryGroup_html_include);
createTask(TASK_BUILD_HTML,         functionProcess_primaryGroup_html);
createTask(TASK_BUILD_IMAGE,        functionProcess_primary_image);
createTask(TASK_BUILD_JAVASCRIPT,   functionProcess_primary_javascript);
createTask(TASK_BUILD_MODULE,       functionProcess_primary_module);
createTask(TASK_BUILD_STYLESHEET,   functionProcess_primary_stylesheet);
createTask(TASK_BUILD_VIDEO,        functionProcess_primary_video);

// -----------------------------------------------------------------------------
// ### Task - Rebuild - Reset and build for a specific asset group.
// -----------------------------------------------------------------------------

createTask('rebuild',             functionProcess_primary_reset,               functionProcess_primaryGroup_all); // Reset and build all asset groups.
createTask('rebuild_audio',       functionProcess_primary_reset_audio,         functionProcess_primary_audio);
createTask('rebuild_brand',       functionProcess_primary_reset_brand,         functionProcess_primary_brand);
createTask('rebuild_config',      functionProcess_primary_reset_config,        functionProcess_primaryGroup_config);
createTask('rebuild_data',        functionProcess_primary_reset_data,          functionProcess_primary_data);
createTask('rebuild_favicon',     functionProcess_primary_reset_favicon,       functionProcess_primary_favicon);
createTask('rebuild_file',        functionProcess_primary_reset_file,          functionProcess_primary_file);
createTask('rebuild_font',        functionProcess_primary_reset_font,          functionProcess_primary_font);
createTask('rebuild_font_icon',   functionProcess_primary_reset_fontIcon,      functionProcess_primary_fontIcon);
createTask('rebuild_html_config', functionProcess_primary_reset_html_config,   functionProcess_primary_html_config);
createTask('rebuild_html',        functionProcess_primary_reset_html,          functionProcess_primaryGroup_html);
createTask('rebuild_image',       functionProcess_primary_reset_image,         functionProcess_primary_image);
createTask('rebuild_javascript',  functionProcess_primary_reset_javascript,    functionProcess_primary_javascript);
createTask('rebuild_module',      functionProcess_primary_reset_module,        functionProcess_primary_module);
createTask('rebuild_stylesheet',  functionProcess_primary_reset_stylesheet,    functionProcess_primary_stylesheet);
createTask('rebuild_video',       functionProcess_primary_reset_video,         functionProcess_primary_video);

// -----------------------------------------------------------------------------
// ### Task - Reset - Empties cache & removes output so next build task performs as new.
// -----------------------------------------------------------------------------

createTask('reset',             functionProcess_primary_reset); // Empties entire cache & removes output so any further build tasks perform as new.
createTask('reset_audio',       functionProcess_primary_reset_audio);
createTask('reset_brand',       functionProcess_primary_reset_brand);
createTask('reset_config',      functionProcess_primary_reset_config);
createTask('reset_data',        functionProcess_primary_reset_data);
createTask('reset_favicon',     functionProcess_primary_reset_favicon);
createTask('reset_file',        functionProcess_primary_reset_file);
createTask('reset_font',        functionProcess_primary_reset_font);
createTask('reset_font_icon',   functionProcess_primary_reset_fontIcon);
createTask('reset_html_config', functionProcess_primary_reset_html_config);
createTask('reset_html',        functionProcess_primary_reset_html);
createTask('reset_image',       functionProcess_primary_reset_image);
createTask('reset_javascript',  functionProcess_primary_reset_javascript);
createTask('reset_module',      functionProcess_primary_reset_module);
createTask('reset_stylesheet',  functionProcess_primary_reset_stylesheet);
createTask('reset_video',       functionProcess_primary_reset_video);
