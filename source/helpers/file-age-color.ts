const millisecondsPerDay = 86_400_000;

export const defaultOrangeDays = 2_000_000_000 / millisecondsPerDay;
export const defaultGrayDays = 730;

export type FileAgeColorMix = {
	segment: 'hot' | 'cold';
	percentage: number;
};

export function parseDateAge(date: string, now = Date.now()): number | undefined {
	const timestamp = new Date(date).getTime();
	if (Number.isNaN(timestamp)) {
		return;
	}

	return Math.max(0, now - timestamp);
}

export function getCustomPropertyNumber(
	styles: CSSStyleDeclaration,
	propertyName: string,
	fallback: number,
): number {
	const value = Number.parseFloat(styles.getPropertyValue(propertyName));
	return Number.isFinite(value) && value >= 0 ? value : fallback;
}

export function getFileAgeColorMix(
	ageInMilliseconds: number,
	orangeThresholdInMilliseconds: number,
	grayThresholdInMilliseconds: number,
): FileAgeColorMix | undefined {
	if (!Number.isFinite(ageInMilliseconds)) {
		return;
	}

	if (ageInMilliseconds <= orangeThresholdInMilliseconds) {
		return {
			segment: 'hot',
			percentage: Math.max(0, 100 - (ageInMilliseconds / orangeThresholdInMilliseconds * 100)),
		};
	}

	const normalizedGrayThreshold = Math.max(orangeThresholdInMilliseconds, grayThresholdInMilliseconds);
	if (normalizedGrayThreshold === orangeThresholdInMilliseconds) {
		return {
			segment: 'cold',
			percentage: 100,
		};
	}

	return {
		segment: 'cold',
		percentage: Math.min(
			100,
			((ageInMilliseconds - orangeThresholdInMilliseconds) / (normalizedGrayThreshold - orangeThresholdInMilliseconds) * 100),
		),
	};
}
