/** Superficie pública del paquete de configuración local. */

export {
  DEFAULT_PREFERENCES,
  PREFERENCES_KEY,
  PREFERENCES_SCHEMA_VERSION,
  PreferencesStorage,
  createBrowserPreferencesStorage,
  type ClearResult,
  type LoadResult,
  type Preferences,
  type SaveResult,
  type StorageLike,
} from "./preferences";
