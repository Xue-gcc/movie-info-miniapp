import {
	findMovieById,
	heroMovies,
	movies,
	nowPlaying,
	topRated,
	upcoming
} from '@/data/movies'
import { DEMO_TRAILER_URL, MEDIA_API_BASE } from '@/config/media'

const TMDB_BASE = 'https://api.themoviedb.org/3'
const IMAGE_BASE = 'https://image.tmdb.org/t/p'

function readApiKey() {
	let envKey = ''
	try {
		envKey = import.meta.env?.VITE_TMDB_API_KEY || ''
	} catch (error) {
		envKey = ''
	}
	if (envKey) return envKey
	try {
		return uni.getStorageSync('tmdb_api_key') || ''
	} catch (error) {
		return ''
	}
}

export function hasTmdbAccess() {
	return Boolean(readApiKey())
}

function tmdbImage(path, size = 'w500') {
	return path ? `${IMAGE_BASE}/${size}${path}` : ''
}

function request(path, params = {}) {
	const apiKey = readApiKey()
	if (!apiKey) {
		return Promise.reject(new Error('TMDB API Key is not configured'))
	}

	return new Promise((resolve, reject) => {
		uni.request({
			url: `${TMDB_BASE}${path}`,
			method: 'GET',
			data: {
				api_key: apiKey,
				language: 'zh-CN',
				...params
			},
			timeout: 12000,
			success(response) {
				if (response.statusCode >= 200 && response.statusCode < 300) {
					resolve(response.data)
					return
				}
				reject(new Error(`TMDB request failed: ${response.statusCode}`))
			},
			fail(error) {
				reject(error)
			}
		})
	})
}

function mapMovie(item = {}) {
	const date = item.release_date || item.first_air_date || ''
	return {
		id: String(item.id),
		title: item.title || item.name || '未命名电影',
		originalTitle: item.original_title || item.original_name || '',
		year: date ? Number(date.slice(0, 4)) : 0,
		releaseDate: date,
		rating: Number(item.vote_average || 0),
		voteCount: Number(item.vote_count || 0),
		genres: (item.genres || []).map((genre) => genre.name),
		duration: Number(item.runtime || 0),
		country: item.production_countries?.[0]?.name || '',
		director:
			item.credits?.crew?.find((member) => member.job === 'Director')?.name || '资料待补充',
		cast: (item.credits?.cast || []).slice(0, 8).map((member) => ({
			name: member.name,
			role: member.character || '演员'
		})),
		overview: item.overview || '暂无剧情简介。',
		poster: tmdbImage(item.poster_path, 'w500'),
		backdrop: tmdbImage(item.backdrop_path, 'w780'),
		stills: item.images?.backdrops?.slice(0, 4).map((still) => tmdbImage(still.file_path, 'w780')) || [],
		trailerUrl: item.trailer_url || '',
		trailerProvider: item.trailer_provider || '',
		tone: '#2e3731',
		accent: '#b88650',
		reviews: (item.reviews?.results || []).slice(0, 5).map((review) => ({
			id: review.id,
			author: review.author || 'TMDB 用户',
			text: review.content,
			rating: review.author_details?.rating || '-',
			date: review.created_at
		}))
	}
}

function localFeed() {
	return {
		source: 'demo',
		hero: heroMovies,
		nowPlaying,
		upcoming,
		topRated
	}
}

export async function getHomeFeed() {
	if (!hasTmdbAccess()) {
		return localFeed()
	}

	try {
		const [trending, playing, soon, rated] = await Promise.all([
			request('/trending/movie/week'),
			request('/movie/now_playing'),
			request('/movie/upcoming'),
			request('/movie/top_rated')
		])
		const trendingMovies = (trending.results || []).map(mapMovie)
		const playingMovies = (playing.results || []).map(mapMovie)
		const upcomingMovies = (soon.results || []).map(mapMovie)
		const ratedMovies = (rated.results || []).map(mapMovie)

		return {
			source: 'tmdb',
			hero: trendingMovies.slice(0, 4),
			nowPlaying: playingMovies.slice(0, 8),
			upcoming: upcomingMovies.slice(0, 8),
			topRated: ratedMovies.slice(0, 8)
		}
	} catch (error) {
		console.warn('TMDB unavailable, using local demo data', error)
		return localFeed()
	}
}

export async function getMovieDetail(movieId) {
	const localMovie = findMovieById(movieId)
	if (!hasTmdbAccess()) {
		return localMovie || null
	}

	try {
		const detail = await request(`/movie/${movieId}`, {
			append_to_response: 'credits,videos,images,reviews'
		})
		const liveMovie = mapMovie(detail)
		if (!localMovie) return liveMovie
		return {
			...localMovie,
			...liveMovie,
			tone: localMovie.tone,
			accent: localMovie.accent,
			reviews: liveMovie.reviews?.length ? liveMovie.reviews : localMovie.reviews,
			stills: liveMovie.stills?.length ? liveMovie.stills : localMovie.stills
		}
	} catch (error) {
		console.warn('Movie detail request failed, using local data', error)
		return localMovie || null
	}
}

function normalizeTrailer(data, fallbackPoster = '') {
	const payload = data?.data || data || {}
	const playUrl =
		payload.playUrl ||
		payload.play_url ||
		payload.videoUrl ||
		payload.video_url ||
		payload.url ||
		''
	if (!playUrl) return null
	return {
		playUrl,
		poster: payload.poster || payload.cover || fallbackPoster,
		provider: payload.provider || '国内媒体服务',
		duration: Number(payload.duration || 0),
		isDemo: false
	}
}

function requestDomesticTrailer(movieId) {
	if (!MEDIA_API_BASE) return Promise.resolve(null)

	return new Promise((resolve, reject) => {
		uni.request({
			url: `${MEDIA_API_BASE}/movies/${movieId}/trailer`,
			method: 'GET',
			header: {
				Accept: 'application/json'
			},
			timeout: 12000,
			success(response) {
				if (response.statusCode >= 200 && response.statusCode < 300) {
					resolve(normalizeTrailer(response.data))
					return
				}
				reject(new Error(`Trailer request failed: ${response.statusCode}`))
			},
			fail(error) {
				reject(error)
			}
		})
	})
}

async function requestCloudTrailer(movieId) {
	if (typeof uniCloud === 'undefined' || typeof uniCloud.callFunction !== 'function') {
		return null
	}

	const response = await uniCloud.callFunction({
		name: 'getMovieTrailer',
		data: {
			movieId: String(movieId)
		}
	})
	const result = response.result || {}
	if (result.code === 0) {
		return normalizeTrailer(result.data)
	}
	if (result.code === 404) {
		return null
	}
	throw new Error(result.message || 'Cloud trailer request failed')
}

export async function getMovieTrailer(movieId, fallbackPoster = '') {
	const localMovie = findMovieById(movieId)
	try {
		const cloudTrailer = await requestCloudTrailer(movieId)
		if (cloudTrailer) return cloudTrailer
	} catch (error) {
		console.warn('uniCloud trailer function unavailable', error)
	}

	try {
		const domesticTrailer = await requestDomesticTrailer(movieId)
		if (domesticTrailer) return domesticTrailer
	} catch (error) {
		console.warn('Domestic trailer service unavailable', error)
	}

	if (!localMovie?.trailerUrl && !DEMO_TRAILER_URL) {
		return null
	}

	return {
		playUrl: localMovie?.trailerUrl || DEMO_TRAILER_URL,
		poster: localMovie?.trailerPoster || fallbackPoster || localMovie?.backdrop || '',
		provider: localMovie?.trailerProvider || '国内 CDN',
		duration: 0,
		isDemo: !localMovie?.trailerUrl
	}
}

export function searchLocalMovies(keyword) {
	const query = String(keyword || '').trim().toLowerCase()
	if (!query) return []
	return movies.filter((movie) =>
		[movie.title, movie.originalTitle, movie.director, ...(movie.cast || []).map((item) => item.name)]
			.filter(Boolean)
			.some((value) => String(value).toLowerCase().includes(query))
	)
}

export async function searchMovies(keyword) {
	const localResults = searchLocalMovies(keyword)
	if (!hasTmdbAccess() || String(keyword || '').trim().length < 2) {
		return localResults
	}

	try {
		const response = await request('/search/movie', {
			query: keyword,
			include_adult: false,
			page: 1
		})
		const remoteResults = (response.results || []).map(mapMovie)
		return remoteResults.length ? remoteResults : localResults
	} catch (error) {
		return localResults
	}
}

export function getSourceLabel() {
	return hasTmdbAccess() ? 'TMDB 实时数据' : '本地演示数据'
}
