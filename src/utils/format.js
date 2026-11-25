export function formatCount(value) {
	const count = Number(value || 0)
	if (count >= 1000000) {
		return `${(count / 1000000).toFixed(1)}m`
	}
	if (count >= 1000) {
		return `${(count / 1000).toFixed(0)}k`
	}
	return String(count)
}

export function formatDuration(minutes) {
	const value = Number(minutes || 0)
	if (!value) return '待定'
	const hours = Math.floor(value / 60)
	const rest = value % 60
	return hours ? `${hours}小时${rest ? `${rest}分` : ''}` : `${rest}分钟`
}

export function formatDate(value) {
	if (!value) return ''
	const date = new Date(value)
	if (Number.isNaN(date.getTime())) return value
	return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
}

export function getMovieMeta(movie) {
	if (!movie) return ''
	return [movie.year, movie.genres?.[0], movie.duration ? formatDuration(movie.duration) : '']
		.filter(Boolean)
		.join(' · ')
}
