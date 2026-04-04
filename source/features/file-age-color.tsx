/*

This feature is documented at https://github.com/refined-github/refined-github/wiki/Customization

*/

import './file-age-color.css';

import * as pageDetect from 'github-url-detection';

import observe from '../helpers/selector-observer.js';
import features from '../feature-manager.js';
import {
	defaultGrayDays,
	defaultOrangeDays,
	getCustomPropertyNumber,
	getFileAgeColorMix,
	parseDateAge,
} from '../helpers/file-age-color.js';

const millisecondsPerDay = 86_400_000;
const mutedColor = 'var(--fgColor-muted, var(--color-fg-muted, fuchsia))';
const defaultHotColor = '#c24e00';
const defaultMinOpacity = 0.55;

type FileAgeColorConfig = {
	orangeThresholdInMilliseconds: number;
	grayThresholdInMilliseconds: number;
	hotColor: string;
	minOpacity: number;
};

function getConfig(): FileAgeColorConfig {
	const styles = getComputedStyle(document.documentElement);

	return {
		orangeThresholdInMilliseconds: getCustomPropertyNumber(styles, '--rgh-file-age-orange-days', defaultOrangeDays) * millisecondsPerDay,
		grayThresholdInMilliseconds: getCustomPropertyNumber(styles, '--rgh-file-age-gray-days', defaultGrayDays) * millisecondsPerDay,
		hotColor: styles.getPropertyValue('--rgh-file-age-hot-color').trim() || defaultHotColor,
		minOpacity: Math.min(1, getCustomPropertyNumber(styles, '--rgh-file-age-min-opacity', defaultMinOpacity)),
	};
}

function addFileAgeColor(lastUpdateElement: HTMLElement, config: FileAgeColorConfig): void {
	const ageInMilliseconds = parseDateAge(lastUpdateElement.getAttribute('datetime') ?? lastUpdateElement.title);
	if (ageInMilliseconds === undefined) {
		return;
	}

	const colorMix = getFileAgeColorMix(
		ageInMilliseconds,
		config.orangeThresholdInMilliseconds,
		config.grayThresholdInMilliseconds,
	);
	if (!colorMix) {
		return;
	}

	if (colorMix.segment === 'hot') {
		lastUpdateElement.style.setProperty(
			'--rgh-file-age-color',
			`color-mix(in srgb, ${config.hotColor} ${colorMix.percentage.toFixed(2)}%, ${mutedColor})`,
		);
		lastUpdateElement.style.setProperty('--rgh-file-age-opacity', '1');
	} else {
		const opacity = 1 - ((colorMix.percentage / 100) * (1 - config.minOpacity));
		lastUpdateElement.style.setProperty('--rgh-file-age-color', mutedColor);
		lastUpdateElement.style.setProperty('--rgh-file-age-opacity', opacity.toFixed(2));
	}

	lastUpdateElement.setAttribute('data-rgh-file-age-color', '');
}

function init(signal: AbortSignal): void {
	const config = getConfig();
	observe('.react-directory-commit-age > [title]', element => {
		if (!(element instanceof HTMLElement)) {
			return;
		}

		addFileAgeColor(element, config);
	}, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoTree,
	],
	exclude: [
		pageDetect.isRepoFile404,
	],
	init,
});

/*

Test URLs:

https://github.com/refined-github/refined-github
https://github.com/refined-github/refined-github/tree/main/source

*/
