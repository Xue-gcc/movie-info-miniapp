<template>
	<view class="page-shell search-page">
		<view class="safe-top" />

		<view class="topbar">
			<view class="brand-lockup">
				<text class="brand-cn">搜索</text>
				<text class="brand-en">FIND A FILM</text>
			</view>
			<text class="source-label">{{ sourceLabel }}</text>
		</view>

		<view class="search-heading page-pad">
			<text class="display-title">下一部电影，<br />从片名开始。</text>
			<view class="search-box">
				<view class="search-glyph dark" />
				<input
					v-model="query"
					class="search-input"
					type="text"
					confirm-type="search"
					:focus="autoFocus"
					placeholder="搜索电影、导演或演员"
					placeholder-class="search-placeholder"
					@confirm="submitSearch"
				/>
				<button v-if="query" class="clear-button pressable" aria-label="清空搜索" @tap="clearSearch">
					<view class="clear-line first" />
					<view class="clear-line second" />
				</button>
			</view>
		</view>

		<view v-if="!query" class="discovery page-pad">
			<view v-if="searchHistory.length" class="discovery-block">
				<view class="block-heading">
					<text class="block-title">最近搜索</text>
					<button class="text-action pressable" @tap="clearHistory">清空</button>
				</view>
				<view class="keyword-wrap">
					<button
						v-for="keyword in searchHistory"
						:key="keyword"
						class="keyword-chip pressable"
						@tap="useKeyword(keyword)"
					>
						{{ keyword }}
					</button>
				</view>
			</view>

			<view class="discovery-block">
				<view class="block-heading">
					<text class="block-title">本周热搜</text>
					<text class="block-caption">TRENDING</text>
				</view>
				<view class="trend-keywords">
					<button
						v-for="(keyword, index) in trendingKeywords"
						:key="keyword"
						class="trend-keyword pressable"
						@tap="useKeyword(keyword)"
					>
						<text class="keyword-index">{{ String(index + 1).padStart(2, '0') }}</text>
						<text class="keyword-text">{{ keyword }}</text>
						<view class="arrow-glyph" />
					</button>
				</view>
			</view>
		</view>

		<view v-else class="results page-pad">
			<view class="results-heading">
				<view>
					<text class="eyebrow">SEARCH RESULTS</text>
					<text class="results-title">关于“{{ query }}”</text>
				</view>
				<text class="results-count">{{ results.length }} 部</text>
			</view>

			<view v-if="searching" class="loading-row">
				<view class="loading-bar" />
			</view>
			<view v-else-if="results.length" class="result-grid">
				<MoviePoster
					v-for="movie in results"
					:key="movie.id"
					:movie="movie"
					variant="grid"
					@select="openMovie"
				/>
			</view>
			<EmptyState
				v-else
				title="没有找到这部电影"
				description="可以尝试缩短片名，或改用导演和演员姓名搜索。"
			/>
		</view>

		<AppTabBar active="search" />
	</view>
</template>

<script setup>
	import { onMounted, onUnmounted, ref, watch } from 'vue'
	import { onShow } from '@dcloudio/uni-app'
	import AppTabBar from '@/components/AppTabBar.vue'
	import EmptyState from '@/components/EmptyState.vue'
	import MoviePoster from '@/components/MoviePoster.vue'
	import { getSourceLabel, searchMovies } from '@/services/movieService'
	import {
		clearSearchHistory,
		getSearchHistory,
		recordSearch
	} from '@/utils/storage'

	const query = ref('')
	const results = ref([])
	const searching = ref(false)
	const autoFocus = ref(false)
	const searchHistory = ref([])
	const sourceLabel = getSourceLabel()
	const trendingKeywords = ['沙丘', '奥本海默', '宫崎骏', '蜘蛛侠', '高分经典', '2024']
	let searchTimer = null
	let requestToken = 0

	async function performSearch(keyword) {
		const currentToken = ++requestToken
		const value = String(keyword || '').trim()
		if (!value) {
			results.value = []
			searching.value = false
			return
		}
		searching.value = true
		const nextResults = await searchMovies(value)
		if (currentToken !== requestToken) return
		results.value = nextResults
		searching.value = false
	}

	function submitSearch() {
		const value = query.value.trim()
		if (!value) return
		recordSearch(value)
		searchHistory.value = getSearchHistory()
		performSearch(value)
	}

	function useKeyword(keyword) {
		query.value = keyword
		submitSearch()
	}

	function clearSearch() {
		query.value = ''
		results.value = []
		autoFocus.value = true
	}

	function clearHistory() {
		clearSearchHistory()
		searchHistory.value = []
	}

	function openMovie(movie) {
		uni.navigateTo({
			url: `/pages/detail/detail?id=${movie.id}`
		})
	}

	watch(query, (value) => {
		clearTimeout(searchTimer)
		const keyword = String(value || '').trim()
		if (!keyword) {
			results.value = []
			searching.value = false
			return
		}
		searchTimer = setTimeout(() => performSearch(keyword), 220)
	})

	onMounted(() => {
		searchHistory.value = getSearchHistory()
		setTimeout(() => {
			autoFocus.value = true
		}, 180)
	})

	onShow(() => {
		searchHistory.value = getSearchHistory()
	})

	onUnmounted(() => {
		clearTimeout(searchTimer)
	})
</script>

<style scoped>
	.search-page {
		padding-bottom: calc(170rpx + env(safe-area-inset-bottom));
	}

	.source-label {
		font-size: 18rpx;
		color: var(--muted);
	}

	.search-heading {
		display: flex;
		flex-direction: column;
		gap: 30rpx;
		padding-top: 28rpx;
		padding-bottom: 44rpx;
	}

	.search-box {
		display: flex;
		align-items: center;
		gap: 20rpx;
		width: 100%;
		height: 104rpx;
		padding: 0 24rpx;
		border-bottom: 2rpx solid var(--ink);
		background: transparent;
	}

	.search-glyph.dark {
		flex-shrink: 0;
	}

	.search-input {
		height: 100%;
		min-width: 0;
		flex: 1;
		font-size: 28rpx;
		color: var(--ink);
	}

	.search-placeholder {
		color: #9a9388;
	}

	.clear-button {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 52rpx;
		height: 52rpx;
		flex-shrink: 0;
		border-radius: 50%;
		background: #e3ddd2;
	}

	.clear-line {
		position: absolute;
		width: 22rpx;
		height: 2rpx;
		background: var(--muted);
	}

	.clear-line.first {
		transform: rotate(45deg);
	}

	.clear-line.second {
		transform: rotate(-45deg);
	}

	.discovery {
		display: flex;
		flex-direction: column;
		gap: 58rpx;
	}

	.discovery-block {
		display: flex;
		flex-direction: column;
		gap: 22rpx;
	}

	.block-heading {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-bottom: 18rpx;
		border-bottom: 1rpx solid var(--line);
	}

	.block-title {
		font-family: "Songti SC", "STSong", "Noto Serif SC", serif;
		font-size: 36rpx;
		font-weight: 700;
	}

	.block-caption,
	.text-action {
		font-size: 19rpx;
		color: var(--muted);
	}

	.keyword-wrap {
		display: flex;
		flex-wrap: wrap;
		gap: 14rpx;
	}

	.keyword-chip {
		display: inline-flex;
		align-items: center;
		height: 60rpx;
		padding: 0 22rpx;
		border: 1rpx solid var(--line);
		border-radius: 8px;
		background: var(--paper);
		color: var(--ink);
		font-size: 23rpx;
	}

	.trend-keywords {
		display: flex;
		flex-direction: column;
	}

	.trend-keyword {
		display: flex;
		align-items: center;
		gap: 18rpx;
		width: 100%;
		min-height: 90rpx;
		border-bottom: 1rpx solid var(--line);
		text-align: left;
	}

	.keyword-index {
		width: 38rpx;
		font-family: "Songti SC", "STSong", serif;
		font-size: 23rpx;
		font-weight: 700;
		color: var(--accent);
	}

	.keyword-text {
		flex: 1;
		font-size: 27rpx;
		font-weight: 600;
		color: var(--ink);
	}

	.results {
		padding-top: 8rpx;
	}

	.results-heading {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 24rpx;
		margin-bottom: 32rpx;
	}

	.results-title {
		display: block;
		margin-top: 8rpx;
		font-family: "Songti SC", "STSong", "Noto Serif SC", serif;
		font-size: 40rpx;
		font-weight: 700;
		color: var(--ink);
	}

	.results-count {
		flex-shrink: 0;
		padding-bottom: 6rpx;
		font-size: 22rpx;
		color: var(--muted);
	}

	.result-grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 34rpx 22rpx;
	}

	.loading-row {
		padding: 40rpx 0;
	}

	.loading-bar {
		width: 100%;
		height: 8rpx;
		overflow: hidden;
		border-radius: 8px;
		background: #ddd5c8;
		animation: loading-pulse 900ms ease-in-out infinite alternate;
	}

	@keyframes loading-pulse {
		from {
			opacity: 0.45;
		}
		to {
			opacity: 1;
		}
	}
</style>
