import type { ColorResolvable } from 'discord.js';

const Colors: string[] = [
	// Green
	'#10eb4e',
	// Blue
	'#0a64f5',
	// Yellow
	'#e7eb10',
	// Purple
	'#2922f2',
	// Pink
	'#eb10bb',
	// Cyan
	'#6efffa',
];

/**
 * Function for getting a random color
 * @return {ColorResolvable} - A random Color from the Colors list
*/
export const randomColor = (): ColorResolvable => {
	return Colors[Math.floor(Math.random() * Colors.length)] as ColorResolvable;
};
