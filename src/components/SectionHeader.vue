<template>
	<view class="section-header">
		<view class="section-copy">
			<text v-if="kicker" class="eyebrow">{{ kicker }}</text>
			<text class="section-title">{{ title }}</text>
		</view>
		<button v-if="action" class="section-action pressable" @tap="$emit('action')">
			<text>{{ action }}</text>
			<view class="arrow-glyph" />
		</button>
	</view>
</template>

<script setup>
	defineProps({
		kicker: {
			type: String,
			default: ''
		},
		title: {
			type: String,
			required: true
		},
		action: {
			type: String,
			default: ''
		}
	})

	defineEmits(['action'])
</script>

<style scoped>
	.section-header {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 24rpx;
		margin-bottom: 26rpx;
	}

	.section-copy {
		display: flex;
		flex-direction: column;
		gap: 8rpx;
		min-width: 0;
	}

	.section-action {
		display: flex;
		align-items: center;
		gap: 12rpx;
		flex-shrink: 0;
		padding-bottom: 8rpx;
		color: var(--muted);
		font-size: 22rpx;
	}
</style>
