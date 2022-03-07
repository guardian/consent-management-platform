import { isGuardianDomain } from './domain';

export type Property = string | null;

export const getProperty = ({
	live,
	test,
}: Record<string, Property>): Property => (isGuardianDomain() ? live : test);
