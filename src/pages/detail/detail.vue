<template>
	<view class="page-shell detail-page">
		<view v-if="loading" class="detail-loading">
			<view class="loading-poster" />
			<view class="loading-copy">
				<view class="loading-line title" />
				<view class="loading-line short" />
				<view class="loading-line" />
			</view>
		</view>

		<template v-else-if="movie">
			<view class="detail-hero">
				<view
					class="backdrop-fallback"
					:style="{ background: heroBackground }"
				>
					<text class="backdrop-word">{{ movie.originalTitle }}</text>
				</view>
				<image
					v-if="movie.backdrop && !backdropFailed"
					class="backdrop"
					:src="movie.backdrop"
					mode="aspectFill"
					@error="backdropFailed = true"
				/>
				<view class="backdrop-shade" />
				<view class="safe-top" />

				<view class="detail-nav">
					<button class="round-nav pressable" aria-label="返回" @tap="goBack">
						<view class="back-arrow" />
					</button>
					<button class="round-nav pressable favorite-nav" @tap="handleFavorite">
						<text class="favorite-star" :class="{ filled: favorite }">★</text>
					</button>
				</view>

				<view class="hero-copy page-pad">
					<view class="hero-tags">
						<text class="hero-tag accent">{{ movie.genres?.[0] || '电影' }}</text>
						<text class="hero-tag">{{ movie.country || '地区待定' }}</text>
					</view>
					<text class="detail-title">{{ movie.title }}</text>
					<text class="detail-original">{{ movie.originalTitle }}</text>
				</view>
			</view>

			<view class="detail-content">
				<view class="facts page-pad">
					<view class="fact">
						<text class="fact-value score">{{ Number(movie.rating || 0).toFixed(1) }}</text>
						<text class="fact-label">TMDB 评分</text>
					</view>
					<view class="fact">
						<text class="fact-value">{{ movie.year || '—' }}</text>
						<text class="fact-label">上映年份</text>
					</view>
					<view class="fact">
						<text class="fact-value">{{ movie.duration ? `${movie.duration}m` : '—' }}</text>
						<text class="fact-label">片长</text>
					</view>
				</view>

				<view class="action-row page-pad">
					<button class="detail-action primary pressable" @tap="playTrailer">
						<view class="play-glyph small" />
						<text>播放预告</text>
					</button>
					<button class="detail-action pressable" @tap="openReviewSheet">
						<text>写短评</text>
					</button>
				</view>

				<view class="detail-section page-pad">
					<text class="eyebrow">STORY</text>
					<text class="section-title story-title">剧情简介</text>
					<text class="overview">{{ movie.overview }}</text>
					<view class="credit-line">
						<text class="credit-label">导演</text>
						<text class="credit-value">{{ movie.director }}</text>
					</view>
					<view class="credit-line">
						<text class="credit-label">类型</text>
						<text class="credit-value">{{ movie.genres?.join(' / ') }}</text>
					</view>
					<view class="credit-line">
						<text class="credit-label">上映</text>
						<text class="credit-value">{{ formatDate(movie.releaseDate) || movie.year }}</text>
					</view>
				</view>

				<view v-if="movie.cast?.length" class="detail-section cast-section">
					<view class="page-pad">
						<text class="eyebrow">CAST</text>
						<text class="section-title story-title">主要演员</text>
					</view>
					<scroll-view class="cast-scroll" scroll-x :show-scrollbar="false">
						<view class="cast-track">
							<view v-for="(member, index) in movie.cast" :key="`${member.name}-${index}`" class="cast-item">
								<view class="cast-avatar" :class="`tone-${index % 5}`">
									<text>{{ member.name.slice(0, 1) }}</text>
								</view>
								<text class="cast-name">{{ member.name }}</text>
								<text class="cast-role line-clamp-2">{{ member.role }}</text>
							</view>
						</view>
					</scroll-view>
				</view>

				<view class="detail-section page-pad">
					<text class="eyebrow">TRAILER</text>
					<text class="section-title story-title">预告片</text>
					<button
						class="trailer-card pressable"
						:style="{ background: heroBackground }"
						@tap="playTrailer"
					>
						<view class="trailer-lines">
							<text class="trailer-kicker">OFFICIAL TRAILER</text>
							<text class="trailer-title">{{ movie.title }}</text>
							<text class="trailer-meta">{{ movie.originalTitle }}</text>
						</view>
						<view class="play-button">
							<view class="play-glyph" />
						</view>
					</button>
				</view>

				<view v-if="movie.stills?.length" class="detail-section">
					<view class="page-pad">
						<text class="eyebrow">STILLS</text>
						<text class="section-title story-title">剧照</text>
					</view>
					<scroll-view class="stills-scroll" scroll-x :show-scrollbar="false">
						<view class="stills-track">
							<view
								v-for="(still, index) in movie.stills"
								:key="`${still}-${index}`"
								class="still-card"
							>
								<image class="still-image" :src="still" mode="aspectFill" lazy-load />
							</view>
						</view>
					</scroll-view>
				</view>

				<view class="detail-section page-pad reviews-section">
					<view class="reviews-heading">
						<view>
							<text class="eyebrow">REVIEWS</text>
							<text class="section-title story-title">观众短评</text>
						</view>
						<text class="reviews-count">{{ allReviews.length }} 条精选</text>
					</view>
					<view class="review-list">
						<view
							v-for="review in allReviews.slice(0, 7)"
							:key="review.id"
							class="review-item"
						>
							<view class="review-head">
								<view class="review-author">
									<view class="review-avatar">{{ review.author.slice(0, 1) }}</view>
									<view class="review-author-copy">
										<text class="author-name">{{ review.author }}</text>
										<text class="author-date">{{ formatDate(review.date) }}</text>
									</view>
								</view>
								<view v-if="review.isUser" class="user-review-tag">我的短评</view>
								<text v-else class="review-rating">{{ review.rating }}</text>
							</view>
							<text class="review-copy">{{ review.text }}</text>
						</view>
					</view>
				</view>
			</view>

			<view class="action-dock">
				<button class="dock-secondary pressable" @tap="handleFavorite">
					<text class="dock-star" :class="{ filled: favorite }">★</text>
					<text>{{ favorite ? '已收藏' : '收藏' }}</text>
				</button>
				<button class="dock-primary pressable" @tap="openReviewSheet">
					<text>写一条短评</text>
					<view class="mini-arrow" />
				</button>
			</view>

			<view v-if="showReviewSheet" class="sheet-mask" @tap="closeReviewSheet">
				<view class="review-sheet" @tap.stop>
					<view class="sheet-handle" />
					<view class="sheet-heading">
						<view>
							<text class="eyebrow">YOUR NOTE</text>
							<text class="sheet-title">写下观影感受</text>
						</view>
						<button class="sheet-close pressable" aria-label="关闭" @tap="closeReviewSheet">
							<view class="close-line first" />
							<view class="close-line second" />
						</button>
					</view>
					<text class="sheet-movie">{{ movie.title }}</text>
					<view class="rating-picker">
						<text class="rating-label">评分</text>
						<button
							v-for="star in 5"
							:key="star"
							class="rating-star pressable"
							:class="{ filled: star <= reviewRating }"
							:aria-label="`${star}星`"
							@tap="reviewRating = star"
						>
							★
						</button>
					</view>
					<textarea
						v-model="reviewText"
						class="review-input"
						maxlength="220"
						auto-height
						placeholder="电影里最打动你的一个瞬间……"
						placeholder-class="review-placeholder"
					/>
					<view class="input-foot">
						<text class="input-note">短评保存在本机</text>
						<text class="input-count">{{ reviewText.length }}/220</text>
					</view>
					<button class="submit-review pressable" @tap="submitReview">
						<text>发布短评</text>
						<view class="mini-arrow light-arrow" />
					</button>
				</view>
			</view>
		</template>

		<view v-else class="not-found">
			<text class="section-title">没有找到这部电影</text>
			<text class="muted">返回片库重新选择。</text>
			<button class="primary-button pressable" @tap="goBack">返回片库</button>
		</view>
	</view>
</template>

<script setup>
	import { computed, ref } from 'vue'
	import { onLoad, onShow } from '@dcloudio/uni-app'
	import { getMovieDetail } from '@/services/movieService'
	import {
		addReview,
		getReviewsByMovie,
		isFavorite,
		recordHistory,
		toggleFavorite
	} from '@/utils/storage'
	import { formatDate } from '@/utils/format'

	const movieId = ref('')
	const movie = ref(null)
	const loading = ref(true)
	const backdropFailed = ref(false)
	const favorite = ref(false)
	const showReviewSheet = ref(false)
	const reviewText = ref('')
	const reviewRating = ref(4)
	const userReviews = ref([])

	const heroBackground = computed(
		() =>
			`linear-gradient(145deg, ${movie.value?.tone || '#30342f'}, ${movie.value?.accent || '#9d6d45'})`
	)

	const allReviews = computed(() => {
		const localReviews = userReviews.value.map((review) => ({
			...review,
			author: '银幕观众',
			isUser: true
		}))
		return [...localReviews, ...(movie.value?.reviews || [])]
	})

	async function loadMovie(id) {
		movieId.value = String(id || '')
		loading.value = true
		movie.value = await getMovieDetail(movieId.value)
		if (movie.value) {
			recordHistory(movie.value.id)
			refreshUserState()
		}
		loading.value = false
	}

	function refreshUserState() {
		favorite.value = isFavorite(movieId.value)
		userReviews.value = getReviewsByMovie(movieId.value)
	}

	function handleFavorite() {
		if (!movie.value?.id) return
		favorite.value = toggleFavorite(movie.value.id)
		uni.showToast({
			title: favorite.value ? '已加入收藏' : '已取消收藏',
			icon: 'none'
		})
	}

	function playTrailer() {
		if (!movie.value?.trailerKey) {
			uni.showToast({ title: '预告片暂未收录', icon: 'none' })
			return
		}
		const url = `https://www.youtube.com/watch?v=${movie.value.trailerKey}`
		// #ifdef H5
		window.open(url, '_blank', 'noopener,noreferrer')
		// #endif
		// #ifndef H5
		uni.setClipboardData({
			data: url,
			success() {
				uni.showToast({ title: '预告片链接已复制', icon: 'none' })
			}
		})
		// #endif
	}

	function openReviewSheet() {
		reviewText.value = ''
		reviewRating.value = 4
		showReviewSheet.value = true
	}

	function closeReviewSheet() {
		showReviewSheet.value = false
	}

	function submitReview() {
		if (!reviewText.value.trim()) {
			uni.showToast({ title: '先写一点内容吧', icon: 'none' })
			return
		}
		addReview(movie.value.id, reviewText.value, reviewRating.value)
		refreshUserState()
		closeReviewSheet()
		uni.showToast({ title: '短评已保存', icon: 'none' })
	}

	function goBack() {
		const pages = getCurrentPages()
		if (pages.length > 1) {
			uni.navigateBack()
			return
		}
		uni.reLaunch({ url: '/pages/library/library' })
	}

	onLoad((options) => {
		loadMovie(options?.id)
	})

	onShow(() => {
		if (movie.value) refreshUserState()
	})
</script>

<style scoped>
	.detail-page {
		padding-bottom: calc(170rpx + env(safe-area-inset-bottom));
		background: var(--canvas);
	}

	.detail-hero {
		position: relative;
		min-height: 760rpx;
		overflow: hidden;
		background: var(--charcoal);
	}

	.backdrop,
	.backdrop-fallback {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}

	.backdrop {
		z-index: 1;
	}

	.backdrop-fallback {
		display: flex;
		align-items: flex-end;
		padding: 40rpx;
	}

	.backdrop-word {
		font-family: "Songti SC", "STSong", "Noto Serif SC", serif;
		font-size: 96rpx;
		line-height: 0.94;
		font-weight: 700;
		color: rgba(255, 248, 236, 0.14);
	}

	.backdrop-shade {
		position: absolute;
		z-index: 2;
		inset: 0;
		background:
			linear-gradient(180deg, rgba(9, 9, 8, 0.24), transparent 28%),
			linear-gradient(0deg, rgba(9, 9, 8, 0.96), rgba(9, 9, 8, 0.08) 66%);
	}

	.detail-nav {
		position: absolute;
		z-index: 3;
		top: calc(24rpx + env(safe-area-inset-top));
		right: 32rpx;
		left: 32rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.round-nav {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 78rpx;
		height: 78rpx;
		border: 1rpx solid rgba(255, 248, 236, 0.34);
		border-radius: 50%;
		background: rgba(15, 14, 12, 0.38);
		color: #fff8ec;
		backdrop-filter: blur(12px);
	}

	.back-arrow {
		position: relative;
		width: 28rpx;
		height: 3rpx;
		background: currentColor;
	}

	.back-arrow::before {
		content: "";
		position: absolute;
		left: 0;
		top: -6rpx;
		width: 13rpx;
		height: 13rpx;
		border-left: 3rpx solid currentColor;
		border-bottom: 3rpx solid currentColor;
		transform: rotate(45deg);
	}

	.favorite-star {
		font-size: 34rpx;
		color: rgba(255, 248, 236, 0.48);
	}

	.favorite-star.filled {
		color: var(--gold);
	}

	.hero-copy {
		position: absolute;
		z-index: 3;
		right: 0;
		bottom: 54rpx;
		left: 0;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		color: #fff8ec;
	}

	.hero-tags {
		display: flex;
		gap: 12rpx;
		margin-bottom: 16rpx;
	}

	.hero-tag {
		display: inline-flex;
		align-items: center;
		height: 38rpx;
		padding: 0 14rpx;
		border: 1rpx solid rgba(255, 248, 236, 0.28);
		border-radius: 8px;
		font-size: 18rpx;
	}

	.hero-tag.accent {
		border-color: var(--accent);
		background: var(--accent);
	}

	.detail-title {
		max-width: 680rpx;
		font-family: "Songti SC", "STSong", "Noto Serif SC", serif;
		font-size: 76rpx;
		line-height: 1.04;
		font-weight: 700;
	}

	.detail-original {
		margin-top: 12rpx;
		font-size: 21rpx;
		color: rgba(255, 248, 236, 0.62);
	}

	.detail-content {
		position: relative;
		margin-top: -2rpx;
		background: var(--canvas);
	}

	.facts {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		padding-top: 34rpx;
		padding-bottom: 30rpx;
		border-bottom: 1rpx solid var(--line);
	}

	.fact {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 7rpx;
		border-right: 1rpx solid var(--line);
	}

	.fact:last-child {
		border-right: none;
	}

	.fact-value {
		font-family: "Songti SC", "STSong", serif;
		font-size: 42rpx;
		font-weight: 700;
		color: var(--ink);
	}

	.fact-value.score {
		color: var(--accent);
	}

	.fact-label {
		font-size: 18rpx;
		color: var(--muted);
	}

	.action-row {
		display: grid;
		grid-template-columns: 1.25fr 0.75fr;
		gap: 14rpx;
		padding-top: 28rpx;
	}

	.detail-action {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 14rpx;
		height: 82rpx;
		border: 1rpx solid var(--line);
		border-radius: 8px;
		background: var(--paper);
		color: var(--ink);
		font-size: 24rpx;
		font-weight: 700;
	}

	.detail-action.primary {
		background: var(--ink);
		color: #fff8ec;
	}

	.play-glyph {
		width: 0;
		height: 0;
		margin-left: 5rpx;
		border-top: 18rpx solid transparent;
		border-bottom: 18rpx solid transparent;
		border-left: 28rpx solid currentColor;
	}

	.play-glyph.small {
		border-top-width: 10rpx;
		border-bottom-width: 10rpx;
		border-left-width: 16rpx;
	}

	.detail-section {
		padding-top: 64rpx;
	}

	.story-title {
		display: block;
		margin-top: 8rpx;
	}

	.overview {
		display: block;
		margin-top: 24rpx;
		font-family: "Songti SC", "STSong", "Noto Serif SC", serif;
		font-size: 30rpx;
		line-height: 1.9;
		color: #3e3a34;
	}

	.credit-line {
		display: flex;
		align-items: baseline;
		gap: 24rpx;
		padding: 18rpx 0;
		border-bottom: 1rpx solid var(--line);
	}

	.credit-line:first-of-type {
		margin-top: 26rpx;
		border-top: 1rpx solid var(--line);
	}

	.credit-label {
		width: 60rpx;
		flex-shrink: 0;
		font-size: 19rpx;
		color: var(--muted);
	}

	.credit-value {
		font-size: 23rpx;
		color: var(--ink);
	}

	.cast-scroll {
		width: 100%;
		margin-top: 24rpx;
	}

	.cast-track {
		display: flex;
		gap: 22rpx;
		padding: 0 32rpx 8rpx;
	}

	.cast-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 142rpx;
		flex-shrink: 0;
		text-align: center;
	}

	.cast-avatar {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 112rpx;
		height: 112rpx;
		border-radius: 50%;
		background: #d7c2a5;
		color: var(--ink);
		font-family: "Songti SC", "STSong", serif;
		font-size: 44rpx;
		font-weight: 700;
	}

	.cast-avatar.tone-1 {
		background: #b8c4bc;
	}

	.cast-avatar.tone-2 {
		background: #d5b3a8;
	}

	.cast-avatar.tone-3 {
		background: #c4bfce;
	}

	.cast-avatar.tone-4 {
		background: #d0c69e;
	}

	.cast-name {
		margin-top: 13rpx;
		font-size: 21rpx;
		font-weight: 700;
		color: var(--ink);
	}

	.cast-role {
		margin-top: 5rpx;
		font-size: 18rpx;
		line-height: 1.4;
		color: var(--muted);
	}

	.trailer-card {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		min-height: 250rpx;
		margin-top: 24rpx;
		padding: 32rpx;
		overflow: hidden;
		border-radius: 8px;
		text-align: left;
		color: #fff8ec;
	}

	.trailer-card::after {
		content: "";
		position: absolute;
		right: -60rpx;
		bottom: -110rpx;
		width: 300rpx;
		height: 300rpx;
		border: 1rpx solid rgba(255, 248, 236, 0.24);
		border-radius: 50%;
	}

	.trailer-lines {
		position: relative;
		z-index: 2;
		display: flex;
		flex-direction: column;
		gap: 10rpx;
		max-width: 65%;
	}

	.trailer-kicker {
		font-size: 17rpx;
		font-weight: 700;
		color: rgba(255, 248, 236, 0.62);
	}

	.trailer-title {
		font-family: "Songti SC", "STSong", serif;
		font-size: 46rpx;
		line-height: 1.1;
		font-weight: 700;
	}

	.trailer-meta {
		font-size: 19rpx;
		color: rgba(255, 248, 236, 0.56);
	}

	.play-button {
		position: relative;
		z-index: 2;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 110rpx;
		height: 110rpx;
		flex-shrink: 0;
		border: 1rpx solid rgba(255, 248, 236, 0.46);
		border-radius: 50%;
		background: rgba(14, 13, 11, 0.18);
		color: #fff8ec;
		backdrop-filter: blur(10px);
	}

	.stills-scroll {
		width: 100%;
		margin-top: 24rpx;
	}

	.stills-track {
		display: flex;
		gap: 18rpx;
		padding: 0 32rpx 8rpx;
	}

	.still-card {
		width: 470rpx;
		height: 280rpx;
		overflow: hidden;
		flex-shrink: 0;
		border-radius: 8px;
		background: #d7d0c5;
	}

	.still-image {
		width: 100%;
		height: 100%;
	}

	.reviews-heading {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 24rpx;
	}

	.reviews-count {
		padding-bottom: 6rpx;
		font-size: 19rpx;
		color: var(--muted);
	}

	.review-list {
		margin-top: 20rpx;
		border-top: 1rpx solid var(--line);
	}

	.review-item {
		padding: 28rpx 0;
		border-bottom: 1rpx solid var(--line);
	}

	.review-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 20rpx;
	}

	.review-author {
		display: flex;
		align-items: center;
		gap: 14rpx;
	}

	.review-avatar {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 62rpx;
		height: 62rpx;
		border-radius: 50%;
		background: #e3d8c8;
		font-family: "Songti SC", "STSong", serif;
		font-size: 28rpx;
		font-weight: 700;
		color: var(--ink);
	}

	.review-author-copy {
		display: flex;
		flex-direction: column;
		gap: 4rpx;
	}

	.author-name {
		font-size: 23rpx;
		font-weight: 700;
		color: var(--ink);
	}

	.author-date {
		font-size: 17rpx;
		color: #9d968c;
	}

	.review-rating {
		font-family: "Songti SC", "STSong", serif;
		font-size: 30rpx;
		font-weight: 700;
		color: var(--accent);
	}

	.user-review-tag {
		padding: 7rpx 12rpx;
		border-radius: 8px;
		background: var(--accent-soft);
		font-size: 17rpx;
		color: var(--accent);
	}

	.review-copy {
		display: block;
		margin-top: 18rpx;
		font-size: 25rpx;
		line-height: 1.78;
		color: #4c4740;
	}

	.action-dock {
		position: fixed;
		z-index: 20;
		left: 50%;
		bottom: 0;
		display: grid;
		grid-template-columns: 0.75fr 1.25fr;
		gap: 14rpx;
		width: 100%;
		max-width: 750px;
		padding: 16rpx 28rpx calc(16rpx + env(safe-area-inset-bottom));
		transform: translateX(-50%);
		border-top: 1rpx solid var(--line);
		background: rgba(250, 247, 240, 0.95);
		backdrop-filter: blur(18px);
	}

	.dock-secondary,
	.dock-primary {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 11rpx;
		height: 84rpx;
		border-radius: 8px;
		font-size: 24rpx;
		font-weight: 700;
	}

	.dock-secondary {
		border: 1rpx solid var(--line);
		background: var(--paper);
		color: var(--ink);
	}

	.dock-primary {
		background: var(--ink);
		color: #fff8ec;
	}

	.dock-star {
		color: #b5aea3;
		font-size: 28rpx;
	}

	.dock-star.filled {
		color: var(--gold);
	}

	.mini-arrow {
		position: relative;
		width: 28rpx;
		height: 3rpx;
		background: currentColor;
	}

	.mini-arrow::after {
		content: "";
		position: absolute;
		right: 0;
		top: -5rpx;
		width: 11rpx;
		height: 11rpx;
		border-top: 3rpx solid currentColor;
		border-right: 3rpx solid currentColor;
		transform: rotate(45deg);
	}

	.sheet-mask {
		position: fixed;
		z-index: 50;
		inset: 0;
		display: flex;
		align-items: flex-end;
		justify-content: center;
		background: rgba(18, 17, 15, 0.58);
		backdrop-filter: blur(5px);
	}

	.review-sheet {
		width: 100%;
		max-width: 750px;
		padding: 16rpx 32rpx calc(30rpx + env(safe-area-inset-bottom));
		border-radius: 22rpx 22rpx 0 0;
		background: var(--paper);
	}

	.sheet-handle {
		width: 74rpx;
		height: 7rpx;
		margin: 0 auto 22rpx;
		border-radius: 7rpx;
		background: #d4ccc0;
	}

	.sheet-heading {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 22rpx;
	}

	.sheet-title {
		display: block;
		margin-top: 7rpx;
		font-family: "Songti SC", "STSong", serif;
		font-size: 44rpx;
		font-weight: 700;
		color: var(--ink);
	}

	.sheet-close {
		position: relative;
		width: 58rpx;
		height: 58rpx;
		flex-shrink: 0;
		border-radius: 50%;
		background: #e9e2d7;
	}

	.close-line {
		position: absolute;
		left: 17rpx;
		top: 28rpx;
		width: 24rpx;
		height: 2rpx;
		background: var(--muted);
	}

	.close-line.first {
		transform: rotate(45deg);
	}

	.close-line.second {
		transform: rotate(-45deg);
	}

	.sheet-movie {
		display: block;
		margin-top: 8rpx;
		font-size: 22rpx;
		color: var(--muted);
	}

	.rating-picker {
		display: flex;
		align-items: center;
		gap: 8rpx;
		margin-top: 24rpx;
	}

	.rating-label {
		margin-right: 8rpx;
		font-size: 21rpx;
		color: var(--muted);
	}

	.rating-star {
		font-size: 42rpx;
		color: #d1c8bb;
	}

	.rating-star.filled {
		color: var(--gold);
	}

	.review-input {
		width: 100%;
		min-height: 210rpx;
		margin-top: 22rpx;
		padding: 24rpx;
		border: 1rpx solid var(--line);
		border-radius: 8px;
		background: #f8f4ec;
		font-size: 25rpx;
		line-height: 1.7;
		color: var(--ink);
	}

	.review-placeholder {
		color: #a19a8f;
	}

	.input-foot {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: 10rpx;
		font-size: 18rpx;
		color: #9d968c;
	}

	.submit-review {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 16rpx;
		width: 100%;
		height: 88rpx;
		margin-top: 22rpx;
		border-radius: 8px;
		background: var(--ink);
		color: #fff8ec;
		font-size: 25rpx;
		font-weight: 700;
	}

	.light-arrow {
		color: #fff8ec;
	}

	.detail-loading {
		min-height: 100vh;
		background: var(--canvas);
	}

	.loading-poster {
		width: 100%;
		height: 760rpx;
		background: #d8d0c3;
	}

	.loading-copy {
		display: flex;
		flex-direction: column;
		gap: 18rpx;
		padding: 38rpx 32rpx;
	}

	.loading-line {
		width: 100%;
		height: 22rpx;
		border-radius: 8px;
		background: #ded7cb;
	}

	.loading-line.title {
		width: 62%;
		height: 48rpx;
	}

	.loading-line.short {
		width: 38%;
	}

	.not-found {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 22rpx;
		min-height: 100vh;
		padding: 40rpx;
		text-align: center;
	}

	.not-found .primary-button {
		min-width: 260rpx;
	}
</style>
