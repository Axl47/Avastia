import { Colors } from '../typings/Colors';

/**
 * Class for storing Embed Colors
*/
export class EmbedColors {
	/**
	 * Gives a random color from a predetermined list
	 * @return {string} Random Color
	 */
	public get randomColor(): string {
		return getRandomEnumValue(Colors);
	}
}

/**
 * Function for generating a random value from an enum
 * @param {Colors} anEnum - Enum from which to generate the random value
 * @return {String} - The random value
 */
function getRandomEnumValue<Colors>(anEnum: Colors): Colors[keyof Colors] {
	// Save enums inside array
	const enumValues = Object.keys(anEnum as object) as Array<keyof Colors>;

	// Generate a random index
	const randomIndex = Math.floor(Math.random() * enumValues.length);

	// get the random enum value
	const randomEnumKey = enumValues[randomIndex];

	return anEnum[randomEnumKey];
}
