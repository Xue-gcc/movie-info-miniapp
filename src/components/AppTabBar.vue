<template>
	<view class="tabbar-wrap">
		<view class="tabbar">
			<button
				v-for="item in tabs"
				:key="item.key"
				class="tab-item pressable"
				:class="{ active: item.key === active }"
				@tap="go(item)"
			>
				<view class="tab-icon" :class="`icon-${item.icon}`">
					<view v-if="item.icon === 'search'" class="search-dot" />
				</view>
				<text class="tab-label">{{ item.label }}</text>
			</button>
		</view>
	</view>
</template>

<script setup>
	const props = defineProps({
		active: {
			type: String,
			default: 'home'
		}
	})

	const tabs = [
		{ key: 'home', label: '首页', icon: 'home', path: '/pages/index/index' },
		{ key: 'library', label: '片库', icon: 'library', path: '/pages/library/library' },
		{ key: 'search', label: '搜索', icon: 'search', path: '/pages/search/search' },
		{ key: 'profile', label: '我的', icon: 'profile', path: '/pages/profile/profile' }
	]

	function go(item) {
		if (item.key === props.active) return
		uni.reLaunch({ url: item.path })
	}
</script>

<style scoped>
	.tabbar-wrap {
		position: fixed;
		z-index: 30;
		left: 50%;
		bottom: 0;
		width: 100%;
		max-width: 750px;
		transform: translateX(-50%);
		padding: 12rpx 22rpx calc(12rpx + env(safe-area-inset-bottom));
		border-top: 1rpx solid rgba(221, 213, 200, 0.9);
		background: rgba(250, 247, 240, 0.94);
		backdrop-filter: blur(18px);
	}

	.tabbar {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		align-items: center;
	}

	.tab-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 9rpx;
		height: 92rpx;
		color: #8a847b;
	}

	.tab-item.active {
		color: var(--ink);
	}

	.tab-label {
		font-size: 20rpx;
		font-weight: 600;
	}

	.tab-icon {
		position: relative;
		width: 34rpx;
		height: 34rpx;
		color: currentColor;
	}

	.icon-home::before {
		content: "";
		position: absolute;
		left: 5rpx;
		top: 13rpx;
		width: 24rpx;
		height: 17rpx;
		border: 3rpx solid currentColor;
		border-top: none;
	}

	.icon-home::after {
		content: "";
		position: absolute;
		left: 6rpx;
		top: 4rpx;
		width: 20rpx;
		height: 20rpx;
		border-top: 3rpx solid currentColor;
		border-left: 3rpx solid currentColor;
		transform: rotate(45deg);
		transform-origin: center;
	}

	.icon-library::before,
	.icon-library::after {
		content: "";
		position: absolute;
		border: 3rpx solid currentColor;
	}

	.icon-library::before {
		left: 3rpx;
		top: 7rpx;
		width: 27rpx;
		height: 22rpx;
	}

	.icon-library::after {
		left: 9rpx;
		top: 2rpx;
		width: 27rpx;
		height: 22rpx;
		background: #faf7f0;
	}

	.icon-search::before {
		content: "";
		position: absolute;
		left: 5rpx;
		top: 4rpx;
		width: 19rpx;
		height: 19rpx;
		border: 3rpx solid currentColor;
		border-radius: 50%;
	}

	.icon-search::after {
		content: "";
		position: absolute;
		right: 2rpx;
		bottom: 5rpx;
		width: 13rpx;
		height: 3rpx;
		background: currentColor;
		transform: rotate(45deg);
	}

	.icon-profile::before {
		content: "";
		position: absolute;
		left: 12rpx;
		top: 3rpx;
		width: 12rpx;
		height: 12rpx;
		border: 3rpx solid currentColor;
		border-radius: 50%;
	}

	.icon-profile::after {
		content: "";
		position: absolute;
		left: 4rpx;
		bottom: 3rpx;
		width: 27rpx;
		height: 14rpx;
		border: 3rpx solid currentColor;
		border-bottom: none;
		border-radius: 18rpx 18rpx 0 0;
	}
</style>
