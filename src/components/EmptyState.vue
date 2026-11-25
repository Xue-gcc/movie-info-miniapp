<template>
	<view class="empty-state">
		<view class="empty-mark">
			<view class="empty-circle" />
		</view>
		<text class="empty-title">{{ title }}</text>
		<text class="empty-text">{{ description }}</text>
	</view>
</template>

<script setup>
	defineProps({
		title: {
			type: String,
			default: '这里还是空的'
		},
		description: {
			type: String,
			default: '去片库发现一部新电影。'
		}
	})
</script>

<style scoped>
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 430rpx;
		padding: 70rpx 40rpx;
		text-align: center;
	}

	.empty-mark {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 128rpx;
		height: 128rpx;
		margin-bottom: 28rpx;
		border: 1rpx solid var(--line);
		border-radius: 50%;
		background: var(--paper);
	}

	.empty-circle {
		width: 42rpx;
		height: 42rpx;
		border: 4rpx solid var(--accent);
		border-radius: 50%;
		box-shadow: 22rpx -12rpx 0 -13rpx var(--gold);
	}

	.empty-title {
		font-family: "Songti SC", "STSong", "Noto Serif SC", serif;
		font-size: 36rpx;
		font-weight: 700;
		color: var(--ink);
	}

	.empty-text {
		max-width: 480rpx;
		margin-top: 14rpx;
		font-size: 24rpx;
		line-height: 1.7;
		color: var(--muted);
	}
</style>
