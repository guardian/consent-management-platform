/**
 * List of permitted use-cases for cookies/storage:
 *
 * - `Targeted advertising`: if the user can be targeted for personalised advertising according to the active consent framework
 * - 'Targeted marketing': if the user can be targeted for personalised marketing, e.g. article count
 * - `Essential`: if essential cookies/storage can be used according to the active consent framework
 *
 */
export const ConsentUseCaseOptions = [
	"Targeted advertising",
	"Targeted marketing",
	"Essential"
] as const;
export type ConsentUseCases = typeof ConsentUseCaseOptions[number];
