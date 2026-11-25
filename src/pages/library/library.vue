<template>
	<view class="page-shell library-page">
		<view class="safe-top" />

		<view class="topbar">
			<view class="brand-lockup">
				<text class="brand-cn">片库</text>
				<text class="brand-en">LIBRARY</text>
			</view>
			<button class="icon-button pressable" aria-label="搜索电影" @tap="goSearch">
				<view class="search-glyph" />
			</button>
		</view>

		<view class="page-heading page-pad">
			<text class="eyebrow">CURATED COLLECTION</text>
			<text class="display-title">找到今晚<br />要看的电影</text>
			<view class="heading-foot">
				<text class="heading-caption">{{ filteredMovies.length }} 部影片</text>
				<view class="heading-rule" />
				<text class="heading-caption">更新于本周</text>
			</view>
		</view>

		<view class="filter-panel">
			<view class="filter-group">
				<text class="filter-label">类型</text>
				<scroll-view class="chip-scroll" scroll-x :show-scrollbar="false">
					<view class="chip-row">
						<button
							v-for="genre in genreOptions"
							:key="genre"
							class="filter-chip pressable"
							:class="{ active: activeGenre === genre }"
							@tap="activeGenre = genre"
						>
							{{ genre }}
						</button>
					</view>
				</scroll-view>
			</view>

			<view class="filter-split">
				<view class="filter-group compact">
					<text class="filter-label">年代</text>
					<scroll-view class="chip-scroll" scroll-x :show-scrollbar="false">
						<view class="chip-row">
							<button
								v-for="item in decadeOptions"
								:key="item.value"
								class="filter-chip pressable"
								:class="{ active: activeDecade === item.value }"
								@tap="activeDecade = item.value"
							>
								{{ item.label }}
							</button>
						</view>
					</scroll-view>
				</view>
				<view class="filter-group compact">
					<text class="filter-label">评分</text>
					<scroll-view class="chip-scroll" scroll-x :show-scrollbar="false">
						<view class="chip-row">
							<button
								v-for="item in scoreOptions"
								:key="item.value"
								class="filter-chip pressable"
								:class="{ active: activeRating === item.value }"
								@tap="activeRating = item.value"
							>
								{{ item.label }}
							</button>
						</view>
					</scroll-view>
				</view>
			</view>
		</view>

		<view class="results-panel page-pad">
			<view class="result-toolbar">
				<view class="result-copy">
					<text class="result-title">{{ activeGenre === '全部' ? '全部电影' : activeGenre }}</text>
					<text class="result-note">{{ activeSummary }}</text>
				</view>
				<view class="view-switch">
					<button
						class="view-button pressable"
						:class="{ active: viewMode === 'grid' }"
						aria-label="网格视图"
						@tap="viewMode = 'grid'"
					>
						<view class="grid-glyph">
							<view v-for="item in 4" :key="item" class="grid-cell" />
						</view>
					</button>
					<button
						class="view-button pressable"
						:class="{ active: viewMode === 'list' }"
						aria-label="列表视图"
						@tap="viewMode = 'list'"
					>
						<view class="list-glyph">
							<view v-for="item in 3" :key="item" class="list-line" />
						</view>
					</button>
				</view>
			</view>

			<view v-if="visibleMovies.length" class="movie-grid" :class="{ 'movie-list': viewMode === 'list' }">
				<MoviePoster
					v-for="movie in visibleMovies"
					:key="movie.id"
					:movie="movie"
					:variant="viewMode === 'list' ? 'list' : 'grid'"
					@select="openMovie"
				/>
			</view>
			<EmptyState
				v-else
				title="没有找到匹配的电影"
				description="换一个类型、年代或评分条件试试。"
			/>

			<button
				v-if="visibleCount < filteredMovies.length"
				class="load-more pressable"
				@tap="loadMore"
			>
				<text>加载更多</text>
				<text class="load-count">{{ Math.min(visibleCount, filteredMovies.length) }} / {{ filteredMovies.length }}</text>
			</button>
		</view>

		<AppTabBar active="library" />
	</view>
</template>

<script setup>
	import { computed, ref, watch } from 'vue'
	import { onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app'
	import AppTabBar from '@/components/AppTabBar.vue'
	import EmptyState from '@/components/EmptyState.vue'
	import MoviePoster from '@/components/MoviePoster.vue'
	import {
		decades as decadeOptions,
		genres as genreOptions,
		movies,
		ratingOptions as scoreOptions
	} from '@/data/movies'

	const activeGenre = ref('全部')
	const activeDecade = ref('all')
	const activeRating = ref(0)
	const viewMode = ref('grid')
	const visibleCount = ref(8)

	const filteredMovies = computed(() =>
		movies.filter((movie) => {
			const genreMatched =
				activeGenre.value === '全部' || movie.genres?.includes(activeGenre.value)
			const decadeMatched =
				activeDecade.value === 'all' ||
				Math.floor(Number(movie.year) / 10) * 10 === Number(activeDecade.value)
			const ratingMatched = Number(movie.rating) >= Number(activeRating.value)
			return genreMatched && decadeMatched && ratingMatched
		})
	)

	const visibleMovies = computed(() => filteredMovies.value.slice(0, visibleCount.value))

	const activeSummary = computed(() => {
		const decadeLabel =
			decadeOptions.find((item) => item.value === activeDecade.value)?.label || '全部年代'
		const ratingLabel =
			scoreOptions.find((item) => item.value === activeRating.value)?.label || '全部评分'
		return `${decadeLabel} · ${ratingLabel}`
	})

	function resetPaging() {
		visibleCount.value = 8
	}

	function loadMore() {
		if (visibleCount.value >= filteredMovies.value.length) return
		visibleCount.value = Math.min(visibleCount.value + 8, filteredMovies.value.length)
	}

	function openMovie(movie) {
		uni.navigateTo({
			url: `/pages/detail/detail?id=${movie.id}`
		})
	}

	function goSearch() {
		uni.reLaunch({ url: '/pages/search/search' })
	}

	watch([activeGenre, activeDecade, activeRating, viewMode], resetPaging)

	onReachBottom(loadMore)

	onPullDownRefresh(() => {
		resetPaging()
		setTimeout(() => uni.stopPullDownRefresh(), 260)
	})
</script>

<style scoped>
	.library-page {
		padding-bottom: calc(170rpx + env(safe-area-inset-bottom));
	}

	.page-heading {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 18rpx;
		padding-top: 26rpx;
		padding-bottom: 38rpx;
	}

	.heading-foot {
		display: flex;
		align-items: center;
		gap: 18rpx;
		width: 100%;
		margin-top: 4rpx;
	}

	.heading-caption {
		flex-shrink: 0;
		font-size: 20rpx;
		color: var(--muted);
	}

	.heading-rule {
		width: 100%;
		height: 1rpx;
		background: var(--line);
	}

	.filter-panel {
		border-top: 1rpx solid var(--line);
		border-bottom: 1rpx solid var(--line);
		background: rgba(255, 253, 248, 0.48);
	}

	.filter-group {
		display: flex;
		align-items: center;
		gap: 26rpx;
		padding: 24rpx 32rpx;
	}

	.filter-group + .filter-group {
		border-top: 1rpx solid var(--line);
	}

	.filter-label {
		width: 66rpx;
		flex-shrink: 0;
		font-size: 22rpx;
		font-weight: 700;
		color: var(--ink);
	}

	.chip-scroll {
		width: 100%;
		white-space: nowrap;
	}

	.chip-row {
		display: flex;
		gap: 14rpx;
		padding-right: 20rpx;
	}

	.filter-chip {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		height: 58rpx;
		padding: 0 22rpx;
		border: 1rpx solid var(--line);
		border-radius: 8px;
		background: var(--paper);
		color: var(--muted);
		font-size: 22rpx;
		white-space: nowrap;
	}

	.filter-chip.active {
		border-color: var(--ink);
		background: var(--ink);
		color: #fffdf8;
	}

	.filter-split {
		display: grid;
		grid-template-columns: 1fr;
		border-top: 1rpx solid var(--line);
	}

	.filter-split .filter-group {
		padding-top: 20rpx;
		padding-bottom: 20rpx;
	}

	.filter-split .filter-group + .filter-group {
		border-top: 1rpx solid var(--line);
	}

	.results-panel {
		padding-top: 38rpx;
	}

	.result-toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 24rpx;
		margin-bottom: 28rpx;
	}

	.result-copy {
		display: flex;
		flex-direction: column;
		gap: 6rpx;
	}

	.result-title {
		font-family: "Songti SC", "STSong", "Noto Serif SC", serif;
		font-size: 38rpx;
		font-weight: 700;
		color: var(--ink);
	}

	.result-note {
		font-size: 20rpx;
		color: var(--muted);
	}

	.view-switch {
		display: flex;
		align-items: center;
		height: 64rpx;
		padding: 5rpx;
		border: 1rpx solid var(--line);
		border-radius: 8px;
		background: var(--paper);
	}

	.view-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 58rpx;
		height: 52rpx;
		border-radius: 6px;
		color: var(--muted);
	}

	.view-button.active {
		background: var(--ink);
		color: #fffdf8;
	}

	.grid-glyph {
		display: grid;
		grid-template-columns: repeat(2, 8rpx);
		gap: 4rpx;
	}

	.grid-cell {
		width: 8rpx;
		height: 8rpx;
		background: currentColor;
	}

	.list-glyph {
		display: flex;
		flex-direction: column;
		gap: 5rpx;
	}

	.list-line {
		width: 24rpx;
		height: 3rpx;
		background: currentColor;
	}

	.movie-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 34rpx 22rpx;
	}

	.movie-list {
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	.load-more {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		height: 88rpx;
		margin-top: 48rpx;
		padding: 0 26rpx;
		border-top: 1rpx solid var(--line);
		border-bottom: 1rpx solid var(--line);
		color: var(--ink);
		font-size: 24rpx;
		font-weight: 700;
	}

	.load-count {
		color: var(--muted);
		font-weight: 400;
	}
</style>
