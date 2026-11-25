<template>
	<view class="page-shell profile-page">
		<view class="profile-hero">
			<view class="safe-top" />
			<view class="topbar hero-topbar">
				<view class="brand-lockup">
					<text class="brand-cn light">我的</text>
					<text class="brand-en gold">PROFILE</text>
				</view>
				<text class="profile-source">{{ sourceLabel }}</text>
			</view>

			<view class="identity page-pad">
				<view class="avatar">
					<text class="avatar-letter">S</text>
					<view class="avatar-dot" />
				</view>
				<view class="identity-copy">
					<text class="identity-name">银幕观众</text>
					<text class="identity-note">把看过的好电影留在这里</text>
				</view>
				<view class="member-mark">
					<text class="member-line">SC</text>
					<text class="member-year">2026</text>
				</view>
			</view>

			<view class="stats page-pad">
				<view class="stat-item">
					<text class="stat-value">{{ favoriteMovies.length }}</text>
					<text class="stat-label">收藏</text>
				</view>
				<view class="stat-divider" />
				<view class="stat-item">
					<text class="stat-value">{{ historyItems.length }}</text>
					<text class="stat-label">浏览</text>
				</view>
				<view class="stat-divider" />
				<view class="stat-item">
					<text class="stat-value">{{ reviewItems.length }}</text>
					<text class="stat-label">短评</text>
				</view>
			</view>
		</view>

		<view class="profile-body">
			<view class="section-tabs page-pad">
				<button
					v-for="tab in tabs"
					:key="tab.key"
					class="section-tab pressable"
					:class="{ active: activeTab === tab.key }"
					@tap="activeTab = tab.key"
				>
					<text>{{ tab.label }}</text>
					<text class="tab-count">{{ tab.count }}</text>
				</button>
			</view>

			<view v-if="activeTab === 'favorites'" class="tab-panel page-pad">
				<view v-if="favoriteMovies.length" class="favorite-grid">
					<MoviePoster
						v-for="movie in favoriteMovies"
						:key="movie.id"
						:movie="movie"
						variant="grid"
						@select="openMovie"
					/>
				</view>
				<EmptyState
					v-else
					title="还没有收藏电影"
					description="在电影详情页点一下收藏，片单就会出现在这里。"
				/>
			</view>

			<view v-else-if="activeTab === 'history'" class="tab-panel page-pad">
				<view v-if="historyItems.length" class="history-list">
					<button
						v-for="(item, index) in historyItems"
						:key="`${item.movie.id}-${item.viewedAt}`"
						class="history-row pressable"
						@tap="openMovie(item.movie)"
					>
						<text class="row-index">{{ String(index + 1).padStart(2, '0') }}</text>
						<view class="row-thumb">
							<image
								v-if="item.movie.poster"
								class="row-image"
								:src="item.movie.poster"
								mode="aspectFill"
								lazy-load
							/>
							<view
								v-else
								class="row-fallback"
								:style="{ background: item.movie.tone }"
							/>
						</view>
						<view class="row-copy">
							<text class="row-title">{{ item.movie.title }}</text>
							<text class="row-meta">{{ item.movie.year }} · {{ item.movie.genres?.[0] }}</text>
							<text class="row-time">{{ formatDate(item.viewedAt) }} 浏览</text>
						</view>
						<view class="arrow-glyph row-arrow" />
					</button>
				</view>
				<EmptyState
					v-else
					title="还没有浏览记录"
					description="打开任意电影详情，最近浏览会保留在这里。"
				/>
			</view>

			<view v-else class="tab-panel page-pad">
				<view v-if="reviewItems.length" class="review-list">
					<view
						v-for="review in reviewItems"
						:key="review.id"
						class="review-item"
					>
						<view class="review-head">
							<button class="review-movie pressable" @tap="openMovie(review.movie)">
								<text>{{ review.movie?.title || '已下架电影' }}</text>
								<view class="arrow-glyph small-arrow" />
							</button>
							<button
								class="delete-review pressable"
								aria-label="删除短评"
								@tap="removeReview(review.id)"
							>
								删除
							</button>
						</view>
						<view class="review-score">
							<text v-for="star in 5" :key="star" :class="{ filled: star <= review.rating }">★</text>
						</view>
						<text class="review-text">{{ review.text }}</text>
						<text class="review-date">{{ formatDate(review.createdAt) }}</text>
					</view>
				</view>
				<EmptyState
					v-else
					title="还没有写过短评"
					description="在电影详情页写下感受，你的短评会集中在这里。"
				/>
			</view>

			<view class="utility page-pad">
				<view class="utility-heading">
					<text class="eyebrow">LOCAL DATA</text>
					<text class="utility-title">本地数据</text>
				</view>
				<button class="utility-row pressable" @tap="confirmClear">
					<view class="utility-copy">
						<text class="utility-label">清空收藏与浏览记录</text>
						<text class="utility-note">不会删除项目代码或 TMDB 配置</text>
					</view>
					<view class="chevron" />
				</button>
				<view class="utility-row static">
					<view class="utility-copy">
						<text class="utility-label">数据来源</text>
						<text class="utility-note">{{ sourceLabel }}</text>
					</view>
					<view class="source-badge">{{ hasLiveSource ? 'LIVE' : 'DEMO' }}</view>
				</view>
			</view>
		</view>

		<AppTabBar active="profile" />
	</view>
</template>

<script setup>
	import { computed, ref } from 'vue'
	import { onShow } from '@dcloudio/uni-app'
	import AppTabBar from '@/components/AppTabBar.vue'
	import EmptyState from '@/components/EmptyState.vue'
	import MoviePoster from '@/components/MoviePoster.vue'
	import { findMovieById } from '@/data/movies'
	import { getSourceLabel, hasTmdbAccess } from '@/services/movieService'
	import {
		clearUserData,
		deleteReview,
		getFavoriteIds,
		getHistory,
		getReviews
	} from '@/utils/storage'
	import { formatDate } from '@/utils/format'

	const activeTab = ref('favorites')
	const favoriteIds = ref([])
	const history = ref([])
	const reviews = ref([])
	const sourceLabel = getSourceLabel()
	const hasLiveSource = hasTmdbAccess()

	const favoriteMovies = computed(() =>
		favoriteIds.value.map((id) => findMovieById(id)).filter(Boolean)
	)

	const historyItems = computed(() =>
		history.value
			.map((item) => ({
				...item,
				movie: findMovieById(item.movieId)
			}))
			.filter((item) => item.movie)
	)

	const reviewItems = computed(() =>
		reviews.value.map((item) => ({
			...item,
			movie: findMovieById(item.movieId)
		}))
	)

	const tabs = computed(() => [
		{ key: 'favorites', label: '我的收藏', count: favoriteMovies.value.length },
		{ key: 'history', label: '浏览历史', count: historyItems.value.length },
		{ key: 'reviews', label: '我的短评', count: reviewItems.value.length }
	])

	function refresh() {
		favoriteIds.value = getFavoriteIds()
		history.value = getHistory()
		reviews.value = getReviews()
	}

	function openMovie(movie) {
		if (!movie?.id) return
		uni.navigateTo({
			url: `/pages/detail/detail?id=${movie.id}`
		})
	}

	function removeReview(reviewId) {
		uni.showModal({
			title: '删除短评',
			content: '确定删除这条短评吗？',
			success(result) {
				if (!result.confirm) return
				deleteReview(reviewId)
				refresh()
			}
		})
	}

	function confirmClear() {
		uni.showModal({
			title: '清空本地数据',
			content: '收藏、浏览历史和短评都会被清除，是否继续？',
			confirmColor: '#d64b36',
			success(result) {
				if (!result.confirm) return
				clearUserData()
				refresh()
				uni.showToast({ title: '已清空', icon: 'none' })
			}
		})
	}

	onShow(refresh)
</script>

<style scoped>
	.profile-page {
		padding-bottom: calc(170rpx + env(safe-area-inset-bottom));
	}

	.profile-hero {
		position: relative;
		overflow: hidden;
		background: var(--charcoal);
		color: #fff8ec;
	}

	.profile-hero::before {
		content: "";
		position: absolute;
		right: -130rpx;
		top: 70rpx;
		width: 460rpx;
		height: 460rpx;
		border: 1rpx solid rgba(212, 154, 47, 0.32);
		border-radius: 50%;
	}

	.profile-hero::after {
		content: "";
		position: absolute;
		right: 16rpx;
		top: 190rpx;
		width: 240rpx;
		height: 240rpx;
		border: 1rpx solid rgba(214, 75, 54, 0.28);
		border-radius: 50%;
	}

	.hero-topbar {
		position: relative;
		z-index: 2;
	}

	.brand-cn.light {
		color: #fff8ec;
	}

	.brand-en.gold {
		color: var(--gold);
	}

	.profile-source {
		font-size: 18rpx;
		color: rgba(255, 248, 236, 0.5);
	}

	.identity {
		position: relative;
		z-index: 2;
		display: flex;
		align-items: center;
		gap: 24rpx;
		padding-top: 42rpx;
		padding-bottom: 34rpx;
	}

	.avatar {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 116rpx;
		height: 116rpx;
		flex-shrink: 0;
		border: 1rpx solid rgba(255, 248, 236, 0.4);
		border-radius: 50%;
		background: #f0dfca;
	}

	.avatar-letter {
		font-family: "Songti SC", "STSong", serif;
		font-size: 62rpx;
		font-weight: 700;
		color: var(--ink);
	}

	.avatar-dot {
		position: absolute;
		right: 6rpx;
		bottom: 6rpx;
		width: 25rpx;
		height: 25rpx;
		border: 4rpx solid var(--charcoal);
		border-radius: 50%;
		background: var(--accent);
	}

	.identity-copy {
		display: flex;
		flex-direction: column;
		gap: 8rpx;
		min-width: 0;
		flex: 1;
	}

	.identity-name {
		font-family: "Songti SC", "STSong", "Noto Serif SC", serif;
		font-size: 44rpx;
		font-weight: 700;
	}

	.identity-note {
		font-size: 21rpx;
		color: rgba(255, 248, 236, 0.56);
	}

	.member-mark {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		flex-shrink: 0;
	}

	.member-line {
		font-family: "Songti SC", "STSong", serif;
		font-size: 46rpx;
		line-height: 1;
		font-weight: 700;
		color: var(--gold);
	}

	.member-year {
		margin-top: 5rpx;
		font-size: 16rpx;
		color: rgba(255, 248, 236, 0.46);
	}

	.stats {
		position: relative;
		z-index: 2;
		display: grid;
		grid-template-columns: 1fr 1rpx 1fr 1rpx 1fr;
		align-items: center;
		padding-top: 28rpx;
		padding-bottom: 36rpx;
		border-top: 1rpx solid rgba(255, 248, 236, 0.14);
	}

	.stat-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 7rpx;
	}

	.stat-value {
		font-family: "Songti SC", "STSong", serif;
		font-size: 42rpx;
		font-weight: 700;
	}

	.stat-label {
		font-size: 19rpx;
		color: rgba(255, 248, 236, 0.48);
	}

	.stat-divider {
		width: 1rpx;
		height: 46rpx;
		background: rgba(255, 248, 236, 0.16);
	}

	.profile-body {
		background: var(--canvas);
	}

	.section-tabs {
		display: flex;
		gap: 36rpx;
		padding-top: 34rpx;
		padding-bottom: 0;
		border-bottom: 1rpx solid var(--line);
		overflow-x: auto;
	}

	.section-tab {
		display: flex;
		align-items: center;
		gap: 8rpx;
		flex-shrink: 0;
		height: 76rpx;
		border-bottom: 3rpx solid transparent;
		color: var(--muted);
		font-size: 24rpx;
	}

	.section-tab.active {
		border-bottom-color: var(--accent);
		color: var(--ink);
		font-weight: 700;
	}

	.tab-count {
		font-size: 17rpx;
		color: #aaa297;
	}

	.tab-panel {
		padding-top: 34rpx;
		min-height: 400rpx;
	}

	.favorite-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 34rpx 22rpx;
	}

	.history-list,
	.review-list {
		display: flex;
		flex-direction: column;
	}

	.history-row {
		display: flex;
		align-items: center;
		gap: 20rpx;
		width: 100%;
		padding: 22rpx 0;
		border-bottom: 1rpx solid var(--line);
		text-align: left;
	}

	.row-index {
		width: 38rpx;
		flex-shrink: 0;
		font-family: "Songti SC", "STSong", serif;
		font-size: 22rpx;
		font-weight: 700;
		color: var(--accent);
	}

	.row-thumb {
		width: 104rpx;
		height: 148rpx;
		overflow: hidden;
		flex-shrink: 0;
		border-radius: 8px;
		background: var(--charcoal);
	}

	.row-image,
	.row-fallback {
		width: 100%;
		height: 100%;
	}

	.row-copy {
		display: flex;
		flex-direction: column;
		min-width: 0;
		flex: 1;
		gap: 6rpx;
	}

	.row-title {
		font-size: 29rpx;
		font-weight: 700;
		color: var(--ink);
	}

	.row-meta,
	.row-time {
		font-size: 20rpx;
		color: var(--muted);
	}

	.row-time {
		color: #9b9489;
	}

	.row-arrow {
		flex-shrink: 0;
		color: var(--muted);
	}

	.review-item {
		padding: 26rpx 0;
		border-bottom: 1rpx solid var(--line);
	}

	.review-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 20rpx;
	}

	.review-movie {
		display: flex;
		align-items: center;
		gap: 12rpx;
		font-size: 28rpx;
		font-weight: 700;
		color: var(--ink);
	}

	.small-arrow {
		transform: scale(0.72);
	}

	.delete-review {
		flex-shrink: 0;
		font-size: 20rpx;
		color: var(--accent);
	}

	.review-score {
		display: flex;
		gap: 4rpx;
		margin-top: 14rpx;
		color: #c9c2b7;
		font-size: 18rpx;
	}

	.review-score .filled {
		color: var(--gold);
	}

	.review-text {
		display: block;
		margin-top: 14rpx;
		font-size: 25rpx;
		line-height: 1.72;
		color: #504b44;
	}

	.review-date {
		display: block;
		margin-top: 14rpx;
		font-size: 19rpx;
		color: #9b9489;
	}

	.utility {
		margin-top: 54rpx;
		padding-bottom: 28rpx;
	}

	.utility-heading {
		display: flex;
		flex-direction: column;
		gap: 8rpx;
		margin-bottom: 20rpx;
	}

	.utility-title {
		font-family: "Songti SC", "STSong", serif;
		font-size: 36rpx;
		font-weight: 700;
	}

	.utility-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 24rpx;
		width: 100%;
		min-height: 104rpx;
		border-top: 1rpx solid var(--line);
		text-align: left;
	}

	.utility-row.static {
		border-bottom: 1rpx solid var(--line);
	}

	.utility-copy {
		display: flex;
		flex-direction: column;
		gap: 7rpx;
	}

	.utility-label {
		font-size: 26rpx;
		font-weight: 600;
		color: var(--ink);
	}

	.utility-note {
		font-size: 20rpx;
		color: var(--muted);
	}

	.chevron {
		width: 16rpx;
		height: 16rpx;
		border-top: 2rpx solid var(--muted);
		border-right: 2rpx solid var(--muted);
		transform: rotate(45deg);
	}

	.source-badge {
		padding: 8rpx 14rpx;
		border: 1rpx solid var(--line);
		border-radius: 8px;
		font-size: 17rpx;
		color: var(--muted);
	}
</style>
