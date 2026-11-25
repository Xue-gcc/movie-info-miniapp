'use strict'

const db = uniCloud.database()

exports.main = async (event = {}) => {
	const movieId = String(event.movieId || '').trim()
	if (!movieId) {
		return {
			code: 400,
			message: '缺少 movieId'
		}
	}

	try {
		const result = await db
			.collection('movie_trailers')
			.where({
				movieId,
				enabled: true
			})
			.limit(1)
			.get()

		if (!result.data.length) {
			return {
				code: 404,
				message: '该电影暂未配置国内预告片'
			}
		}

		const trailer = result.data[0]
		return {
			code: 0,
			data: {
				playUrl: trailer.playUrl,
				poster: trailer.poster || '',
				provider: trailer.provider || '国内媒体服务',
				duration: Number(trailer.duration || 0)
			}
		}
	} catch (error) {
		console.error('getMovieTrailer failed', error)
		return {
			code: 500,
			message: '预告片服务暂时不可用'
		}
	}
}
