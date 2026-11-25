<template>
	<view class="page-shell home-page">
		<view class="safe-top" />

		<view class="topbar">
			<view class="brand-lockup">
				<text class="brand-cn">银幕</text>
				<text class="brand-en">SCREEN CLUB</text>
			</view>
			<button class="icon-button pressable" aria-label="搜索电影" @tap="goSearch">
				<view class="search-glyph" />
			</button>
		</view>

		<view v-if="loading" class="hero-skeleton">
			<view class="skeleton-line skeleton-small" />
			<view class="skeleton-line skeleton-title" />
			<view class="skeleton-line skeleton-copy" />
		</view>

		<view v-else-if="heroMovies.length" class="hero-section page-pad">
			<view class="hero-panel">
				<view
					class="hero-fallback"
					:style="{ background: heroBackground }"
				>
					<text class="hero-fallback-word">{{ currentHero.originalTitle }}</text>
				</view>
				<image
					v-if="currentHero.backdrop && !heroImageFailed"
					class="hero-image"
					:src="currentHero.backdrop"
					mode="aspectFill"
					@error="heroImageFailed = true"
				/>
				<view class="hero-shade" />

				<view class="hero-content">
					<view class="hero-kicker-row">
						<text class="hero-kicker">正在热映</text>
						<text class="hero-rank">NO. {{ String(heroIndex + 1).padStart(2, '0') }}</text>
					</view>
					<text class="hero-title">{{ currentHero.title }}</text>
					<text class="hero-original">{{ currentHero.originalTitle }}</text>
					<view class="hero-meta">
						<text>{{ currentHero.year }}</text>
						<text class="meta-dot">·</text>
						<text>{{ currentHero.genres?.join(' / ') }}</text>
						<text class="meta-dot">·</text>
						<text class="hero-score">★ {{ Number(currentHero.rating).toFixed(1) }}</text>
					</view>
					<view class="hero-actions">
						<button class="hero-primary pressable" @tap="openMovie(currentHero)">
							<text>查看详情</text>
							<view class="mini-arrow" />
						</button>
						<button class="hero-secondary pressable" @tap="toggleHeroFavorite">
							<text>{{ isHeroFavorite ? '已收藏' : '收藏' }}</text>
						</button>
					</view>
				</view>

				<view class="hero-dots">
					<button
						v-for="(movie, index) in heroMovies"
						:key="movie.id"
						class="hero-dot"
						:class="{ active: index === heroIndex }"
						:aria-label="`查看第${index + 1}部电影`"
						@tap="selectHero(index)"
					/>
				</view>
			</view>
		</view>

		<view class="content-section">
			<SectionHeader
				kicker="NOW SHOWING"
				title="正在热映"
				action="全部片库"
				@action="goLibrary"
			/>
			<scroll-view class="poster-rail" scroll-x :show-scrollbar="false">
				<view class="poster-track">
					<MoviePoster
						v-for="movie in feed.nowPlaying"
						:key="movie.id"
						:movie="movie"
						@select="openMovie"
					/>
				</view>
			</scroll-view>
		</view>

		<view class="content-section trend-section">
			<SectionHeader kicker="TRENDING" title="本周趋势榜" />
			<view class="trend-list">
				<button
					v-for="(movie, index) in feed.topRated.slice(0, 5)"
					:key="movie.id"
					class="trend-row pressable"
					@tap="openMovie(movie)"
				>
					<text class="trend-index">{{ String(index + 1).padStart(2, '0') }}</text>
					<view class="trend-thumb">
						<image
							v-if="movie.poster"
							class="trend-image"
							:src="movie.poster"
							mode="aspectFill"
							lazy-load
						/>
						<view
							v-else
							class="trend-fallback"
							:style="{ background: movie.tone || '#4d514b' }"
						/>
					</view>
					<view class="trend-copy">
						<text class="trend-title">{{ movie.title }}</text>
						<text class="trend-meta">{{ movie.year }} · {{ movie.genres?.[0] }}</text>
						<text class="trend-overview line-clamp-2">{{ movie.overview }}</text>
					</view>
					<view class="trend-score">
						<text class="trend-star">★</text>
						<text>{{ Number(movie.rating).toFixed(1) }}</text>
					</view>
				</button>
			</view>
		</view>

		<view class="editorial-band">
			<text class="editorial-index">01</text>
			<view class="editorial-copy">
				<text class="editorial-kicker">SCREEN NOTE</text>
				<text class="editorial-title">好电影不是逃离生活，而是让我们重新看见它。</text>
			</view>
		</view>

		<view class="content-section final-section">
			<SectionHeader
				kicker="COMING SOON"
				title="即将上映"
				action="查看片库"
				@action="goLibrary"
			/>
			<scroll-view class="poster-rail" scroll-x :show-scrollbar="false">
				<view class="poster-track">
					<MoviePoster
						v-for="movie in feed.upcoming"
						:key="movie.id"
						:movie="movie"
						@select="openMovie"
					/>
				</view>
			</scroll-view>
		</view>

		<AppTabBar active="home" />
	</view>
</template>

<script setup>
	import { computed, onMounted, onUnmounted, ref } from 'vue'
	import { onPullDownRefresh, onShow } from '@dcloudio/uni-app'
	import AppTabBar from '@/components/AppTabBar.vue'
	import MoviePoster from '@/components/MoviePoster.vue'
	import SectionHeader from '@/components/SectionHeader.vue'
	import { getHomeFeed } from '@/services/movieService'
	import { isFavorite, toggleFavorite } from '@/utils/storage'

	const loading = ref(true)
	const feed = ref({
		hero: [],
		nowPlaying: [],
		upcoming: [],
		topRated: [],
		source: 'demo'
	})
	const heroIndex = ref(0)
	const heroImageFailed = ref(false)
	const isHeroFavorite = ref(false)
	let heroTimer = null

	const heroMovies = computed(() => feed.value.hero || [])
	const currentHero = computed(() => heroMovies.value[heroIndex.value] || {})
	const heroBackground = computed(
		() =>
			`linear-gradient(145deg, ${currentHero.value.tone || '#2f3430'}, ${currentHero.value.accent || '#8f5537'})`
	)

	async function loadFeed() {
		loading.value = true
		try {
			feed.value = await getHomeFeed()
			heroIndex.value = 0
			heroImageFailed.value = false
			refreshFavorite()
		} finally {
			loading.value = false
		}
	}

	function refreshFavorite() {
		isHeroFavorite.value = currentHero.value?.id
			? isFavorite(currentHero.value.id)
			: false
	}

	function startCarousel() {
		clearInterval(heroTimer)
		heroTimer = setInterval(() => {
			if (heroMovies.value.length > 1) {
				selectHero((heroIndex.value + 1) % heroMovies.value.length)
			}
		}, 5200)
	}

	function selectHero(index) {
		heroIndex.value = index
		heroImageFailed.value = false
		refreshFavorite()
	}

	function toggleHeroFavorite() {
		if (!currentHero.value?.id) return
		const added = toggleFavorite(currentHero.value.id)
		isHeroFavorite.value = added
		uni.showToast({
			title: added ? '已加入收藏' : '已取消收藏',
			icon: 'none'
		})
	}

	function openMovie(movie) {
		if (!movie?.id) return
		uni.navigateTo({
			url: `/pages/detail/detail?id=${movie.id}`
		})
	}

	function goSearch() {
		uni.reLaunch({ url: '/pages/search/search' })
	}

	function goLibrary() {
		uni.reLaunch({ url: '/pages/library/library' })
	}

	onMounted(async () => {
		await loadFeed()
		startCarousel()
	})

	onUnmounted(() => {
		clearInterval(heroTimer)
	})

	onShow(() => {
		refreshFavorite()
	})

	onPullDownRefresh(async () => {
		await loadFeed()
		uni.stopPullDownRefresh()
	})
</script>

<style scoped>
	.home-page {
		padding-bottom: calc(170rpx + env(safe-area-inset-bottom));
	}

	.hero-section {
		padding-top: 6rpx;
	}

	.hero-panel {
		position: relative;
		min-height: 760rpx;
		overflow: hidden;
		border-radius: 8px;
		background: var(--charcoal);
	}

	.hero-image,
	.hero-fallback {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}

	.hero-image {
		z-index: 1;
	}

	.hero-fallback {
		display: flex;
		align-items: flex-end;
		padding: 34rpx;
	}

	.hero-fallback-word {
		position: absolute;
		left: 26rpx;
		bottom: 80rpx;
		max-width: 670rpx;
		font-family: "Songti SC", "STSong", "Noto Serif SC", serif;
		font-size: 118rpx;
		line-height: 0.92;
		font-weight: 700;
		color: rgba(255, 248, 236, 0.13);
	}

	.hero-shade {
		position: absolute;
		z-index: 2;
		inset: 0;
		background:
			linear-gradient(180deg, rgba(10, 9, 8, 0.04) 10%, rgba(10, 9, 8, 0.24) 48%, rgba(10, 9, 8, 0.94) 100%),
			linear-gradient(90deg, rgba(10, 9, 8, 0.5), transparent 72%);
	}

	.hero-content {
		position: absolute;
		z-index: 3;
		right: 34rpx;
		bottom: 58rpx;
		left: 34rpx;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		color: #fff8ec;
	}

	.hero-kicker-row {
		display: flex;
		align-items: center;
		gap: 18rpx;
		margin-bottom: 20rpx;
	}

	.hero-kicker,
	.hero-rank {
		display: inline-flex;
		align-items: center;
		height: 40rpx;
		padding: 0 14rpx;
		border: 1rpx solid rgba(255, 248, 236, 0.42);
		border-radius: 8px;
		font-size: 18rpx;
		font-weight: 700;
		color: #fff8ec;
	}

	.hero-kicker {
		border-color: var(--accent);
		background: var(--accent);
	}

	.hero-title {
		font-family: "Songti SC", "STSong", "Noto Serif SC", serif;
		font-size: 76rpx;
		line-height: 1.02;
		font-weight: 700;
		color: #fff8ec;
	}

	.hero-original {
		margin-top: 10rpx;
		font-size: 22rpx;
		color: rgba(255, 248, 236, 0.66);
	}

	.hero-meta {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 9rpx;
		margin-top: 20rpx;
		font-size: 22rpx;
		color: rgba(255, 248, 236, 0.8);
	}

	.meta-dot {
		color: rgba(255, 248, 236, 0.38);
	}

	.hero-score {
		color: #f1b53d;
		font-weight: 700;
	}

	.hero-actions {
		display: flex;
		gap: 16rpx;
		width: 100%;
		margin-top: 30rpx;
	}

	.hero-primary,
	.hero-secondary {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 82rpx;
		padding: 0 30rpx;
		border-radius: 8px;
		font-size: 26rpx;
		font-weight: 700;
	}

	.hero-primary {
		gap: 18rpx;
		background: #fff8ec;
		color: var(--ink);
	}

	.hero-secondary {
		min-width: 158rpx;
		border: 1rpx solid rgba(255, 248, 236, 0.48);
		background: rgba(17, 15, 13, 0.34);
		color: #fff8ec;
		backdrop-filter: blur(10px);
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

	.hero-dots {
		position: absolute;
		z-index: 3;
		left: 34rpx;
		bottom: 22rpx;
		display: flex;
		gap: 10rpx;
	}

	.hero-dot {
		width: 34rpx;
		height: 4rpx;
		border-radius: 4rpx;
		background: rgba(255, 248, 236, 0.3);
	}

	.hero-dot.active {
		width: 66rpx;
		background: #fff8ec;
	}

	.content-section {
		padding: 70rpx 32rpx 0;
	}

	.poster-rail {
		width: calc(100% + 32rpx);
		margin-right: -32rpx;
	}

	.poster-track {
		display: flex;
		gap: 22rpx;
		padding-right: 32rpx;
	}

	.trend-section {
		padding-top: 86rpx;
	}

	.trend-list {
		border-top: 1rpx solid var(--line);
	}

	.trend-row {
		display: flex;
		align-items: center;
		gap: 20rpx;
		width: 100%;
		padding: 24rpx 0;
		text-align: left;
		border-bottom: 1rpx solid var(--line);
	}

	.trend-index {
		width: 42rpx;
		flex-shrink: 0;
		font-family: "Songti SC", "STSong", serif;
		font-size: 26rpx;
		font-weight: 700;
		color: var(--accent);
	}

	.trend-thumb {
		width: 108rpx;
		height: 150rpx;
		overflow: hidden;
		flex-shrink: 0;
		border-radius: 8px;
		background: var(--charcoal);
	}

	.trend-image,
	.trend-fallback {
		width: 100%;
		height: 100%;
	}

	.trend-copy {
		display: flex;
		flex-direction: column;
		min-width: 0;
		flex: 1;
		gap: 6rpx;
	}

	.trend-title {
		font-size: 30rpx;
		font-weight: 700;
		color: var(--ink);
	}

	.trend-meta {
		font-size: 20rpx;
		color: var(--muted);
	}

	.trend-overview {
		font-size: 21rpx;
		line-height: 1.55;
		color: #615c55;
	}

	.trend-score {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 4rpx;
		flex-shrink: 0;
		font-size: 24rpx;
		font-weight: 700;
		color: var(--ink);
	}

	.trend-star {
		font-size: 18rpx;
		color: var(--gold);
	}

	.editorial-band {
		display: flex;
		gap: 24rpx;
		margin: 74rpx 32rpx 0;
		padding: 42rpx 34rpx;
		border-radius: 8px;
		background: var(--charcoal);
		color: #fff8ec;
	}

	.editorial-index {
		font-family: "Songti SC", "STSong", serif;
		font-size: 86rpx;
		line-height: 0.9;
		color: var(--gold);
	}

	.editorial-copy {
		display: flex;
		flex-direction: column;
		gap: 14rpx;
	}

	.editorial-kicker {
		font-size: 17rpx;
		font-weight: 700;
		color: rgba(255, 248, 236, 0.58);
	}

	.editorial-title {
		font-family: "Songti SC", "STSong", "Noto Serif SC", serif;
		font-size: 34rpx;
		line-height: 1.5;
	}

	.final-section {
		padding-top: 82rpx;
	}

	.hero-skeleton {
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		gap: 18rpx;
		height: 760rpx;
		margin: 6rpx 32rpx 0;
		padding: 42rpx;
		border-radius: 8px;
		background: #d9d1c4;
	}

	.skeleton-line {
		height: 24rpx;
		border-radius: 8px;
		background: rgba(255, 253, 248, 0.5);
	}

	.skeleton-small {
		width: 150rpx;
	}

	.skeleton-title {
		width: 72%;
		height: 76rpx;
	}

	.skeleton-copy {
		width: 55%;
	}
</style>
