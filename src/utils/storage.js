const FAVORITES_KEY = 'screenclub_favorites'
const HISTORY_KEY = 'screenclub_history'
const REVIEWS_KEY = 'screenclub_reviews'
const SEARCH_HISTORY_KEY = 'screenclub_search_history'

function readArray(key) {
	try {
		const value = uni.getStorageSync(key)
		return Array.isArray(value) ? value : []
	} catch (error) {
		return []
	}
}

function writeArray(key, value) {
	try {
		uni.setStorageSync(key, value)
	} catch (error) {
		console.warn('Storage write failed', key, error)
	}
}

export function getFavoriteIds() {
	return readArray(FAVORITES_KEY)
}

export function isFavorite(movieId) {
	return getFavoriteIds().some((id) => String(id) === String(movieId))
}

export function toggleFavorite(movieId) {
	const id = String(movieId)
	const current = getFavoriteIds()
	const exists = current.some((item) => String(item) === id)
	const next = exists ? current.filter((item) => String(item) !== id) : [id, ...current]
	writeArray(FAVORITES_KEY, next)
	return !exists
}

export function removeFavorite(movieId) {
	const id = String(movieId)
	writeArray(
		FAVORITES_KEY,
		getFavoriteIds().filter((item) => String(item) !== id)
	)
}

export function recordHistory(movieId) {
	const id = String(movieId)
	const current = readArray(HISTORY_KEY)
	const next = [
		{ movieId: id, viewedAt: Date.now() },
		...current.filter((item) => String(item.movieId) !== id)
	].slice(0, 30)
	writeArray(HISTORY_KEY, next)
}

export function getHistory() {
	return readArray(HISTORY_KEY)
}

export function getReviews() {
	return readArray(REVIEWS_KEY)
}

export function getReviewsByMovie(movieId) {
	const id = String(movieId)
	return getReviews().filter((item) => String(item.movieId) === id)
}

export function addReview(movieId, text, rating = 4) {
	const content = String(text || '').trim()
	if (!content) return false
	const review = {
		id: `local-${Date.now()}`,
		movieId: String(movieId),
		text: content,
		rating: Number(rating) || 4,
		createdAt: Date.now()
	}
	writeArray(REVIEWS_KEY, [review, ...getReviews()])
	return true
}

export function deleteReview(reviewId) {
	writeArray(
		REVIEWS_KEY,
		getReviews().filter((item) => item.id !== reviewId)
	)
}

export function getSearchHistory() {
	return readArray(SEARCH_HISTORY_KEY)
}

export function recordSearch(keyword) {
	const value = String(keyword || '').trim()
	if (!value) return
	const next = [value, ...getSearchHistory().filter((item) => item !== value)].slice(0, 8)
	writeArray(SEARCH_HISTORY_KEY, next)
}

export function clearSearchHistory() {
	try {
		uni.removeStorageSync(SEARCH_HISTORY_KEY)
	} catch (error) {
		console.warn('Storage clear failed', error)
	}
}

export function clearUserData() {
	;[FAVORITES_KEY, HISTORY_KEY, REVIEWS_KEY, SEARCH_HISTORY_KEY].forEach((key) => {
		try {
			uni.removeStorageSync(key)
		} catch (error) {
			console.warn('Storage clear failed', key, error)
		}
	})
}
