function readEnv(name, fallback = '') {
	try {
		return import.meta.env?.[name] || fallback
	} catch (error) {
		return fallback
	}
}

export const MEDIA_API_BASE = readEnv('VITE_MEDIA_API_BASE').replace(/\/+$/, '')

export const DEMO_TRAILER_URL = readEnv(
	'VITE_DEMO_TRAILER_URL'
)
