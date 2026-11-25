<template>
	<button
		class="poster-shell pressable"
		:class="`poster-${variant}`"
		@tap="$emit('select', movie)"
	>
		<view class="poster-frame" :style="{ background: posterBackground }">
			<view class="poster-fallback">
				<text class="fallback-brand">SCREEN CLUB</text>
				<text class="fallback-title">{{ movie.title }}</text>
				<text class="fallback-year">{{ movie.year }}</text>
			</view>
			<image
				v-if="movie.poster && !imageFailed"
				class="poster-image"
				:src="movie.poster"
				mode="aspectFill"
				lazy-load
				@error="imageFailed = true"
			/>
			<view class="rating-chip">
				<text class="rating-star">★</text>
				<text>{{ Number(movie.rating || 0).toFixed(1) }}</text>
			</view>
		</view>
		<view class="poster-copy">
			<text class="poster-title line-clamp-2">{{ movie.title }}</text>
			<text class="poster-meta">{{ metaText }}</text>
		</view>
	</button>
</template>

<script setup>
	import { computed, ref } from 'vue'

	const props = defineProps({
		movie: {
			type: Object,
			required: true
		},
		variant: {
			type: String,
			default: 'rail'
		}
	})

	defineEmits(['select'])

	const imageFailed = ref(false)

	const posterBackground = computed(
		() => `linear-gradient(145deg, ${props.movie.tone || '#2f3430'}, ${props.movie.accent || '#8f5537'})`
	)

	const metaText = computed(() =>
		[props.movie.year, props.movie.genres?.[0] || props.movie.genre].filter(Boolean).join(' · ')
	)
</script>

<style scoped>
	.poster-shell {
		display: block;
		text-align: left;
		background: transparent;
	}

	.poster-rail {
		width: 238rpx;
		flex-shrink: 0;
	}

	.poster-grid {
		width: 100%;
	}

	.poster-list {
		display: flex;
		align-items: center;
		gap: 22rpx;
		width: 100%;
		padding: 22rpx 0;
		border-bottom: 1rpx solid var(--line);
	}

	.poster-frame {
		position: relative;
		overflow: hidden;
		width: 100%;
		aspect-ratio: 2 / 3;
		border-radius: 8px;
		background: var(--charcoal);
	}

	.poster-image {
		position: absolute;
		z-index: 1;
		inset: 0;
		display: block;
		width: 100%;
		height: 100%;
	}

	.poster-fallback {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		width: 100%;
		height: 100%;
		padding: 18rpx;
		color: #fff8ec;
		background: rgba(10, 10, 10, 0.08);
	}

	.fallback-brand {
		font-size: 15rpx;
		font-weight: 700;
		color: rgba(255, 248, 236, 0.75);
	}

	.fallback-title {
		font-family: "Songti SC", "STSong", "Noto Serif SC", serif;
		font-size: 34rpx;
		font-weight: 700;
		line-height: 1.18;
	}

	.fallback-year {
		font-size: 20rpx;
		color: rgba(255, 248, 236, 0.72);
	}

	.rating-chip {
		position: absolute;
		z-index: 2;
		right: 12rpx;
		top: 12rpx;
		display: flex;
		align-items: center;
		gap: 5rpx;
		height: 42rpx;
		padding: 0 12rpx;
		border-radius: 8px;
		background: rgba(24, 22, 20, 0.86);
		color: #fff8ec;
		font-size: 20rpx;
		font-weight: 700;
		backdrop-filter: blur(10px);
	}

	.rating-star {
		color: #efb744;
		font-size: 18rpx;
	}

	.poster-copy {
		display: flex;
		flex-direction: column;
		gap: 6rpx;
		padding-top: 14rpx;
	}

	.poster-title {
		min-height: 68rpx;
		font-size: 28rpx;
		line-height: 1.22;
		font-weight: 700;
		color: var(--ink);
	}

	.poster-meta {
		font-size: 20rpx;
		color: var(--muted);
	}

	.poster-list .poster-frame {
		width: 120rpx;
		height: 180rpx;
		flex-shrink: 0;
		aspect-ratio: auto;
	}

	.poster-list .poster-copy {
		align-self: stretch;
		justify-content: center;
		padding-top: 0;
	}

	.poster-list .poster-title {
		min-height: auto;
		font-family: "Songti SC", "STSong", "Noto Serif SC", serif;
		font-size: 34rpx;
	}

	.poster-list .poster-meta {
		font-size: 21rpx;
	}
</style>
