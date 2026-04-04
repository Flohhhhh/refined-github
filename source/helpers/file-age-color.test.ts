import {assert, test} from 'vitest';

import {
	defaultGrayDays,
	defaultOrangeDays,
	getFileAgeColorMix,
	parseDateAge,
} from './file-age-color.js';

const millisecondsPerDay = 86_400_000;
const orangeThresholdInMilliseconds = defaultOrangeDays * millisecondsPerDay;
const grayThresholdInMilliseconds = defaultGrayDays * millisecondsPerDay;

test('getFileAgeColorMix keeps recent files on the orange scale', () => {
	assert.deepEqual(
		getFileAgeColorMix(0, orangeThresholdInMilliseconds, grayThresholdInMilliseconds),
		{segment: 'hot', percentage: 100},
	);

	assert.deepEqual(
		getFileAgeColorMix(orangeThresholdInMilliseconds / 2, orangeThresholdInMilliseconds, grayThresholdInMilliseconds),
		{segment: 'hot', percentage: 50},
	);

	assert.deepEqual(
		getFileAgeColorMix(orangeThresholdInMilliseconds, orangeThresholdInMilliseconds, grayThresholdInMilliseconds),
		{segment: 'hot', percentage: 0},
	);
});

test('getFileAgeColorMix fades older files toward gray', () => {
	const midpoint = orangeThresholdInMilliseconds + ((grayThresholdInMilliseconds - orangeThresholdInMilliseconds) / 2);

	assert.deepEqual(
		getFileAgeColorMix(midpoint, orangeThresholdInMilliseconds, grayThresholdInMilliseconds),
		{segment: 'cold', percentage: 50},
	);

	assert.deepEqual(
		getFileAgeColorMix(grayThresholdInMilliseconds, orangeThresholdInMilliseconds, grayThresholdInMilliseconds),
		{segment: 'cold', percentage: 100},
	);

	assert.deepEqual(
		getFileAgeColorMix(grayThresholdInMilliseconds * 2, orangeThresholdInMilliseconds, grayThresholdInMilliseconds),
		{segment: 'cold', percentage: 100},
	);
});

test('parseDateAge rejects invalid input', () => {
	assert.equal(parseDateAge('not a real date'), undefined);
});
