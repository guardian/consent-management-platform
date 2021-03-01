let isGuardian: boolean | undefined;

export const isGuardianDomain = (): boolean => {
	if (typeof isGuardian === 'undefined' && typeof window !== 'undefined')
		isGuardian = window.location.host.endsWith('.theguardian.com');
	return <boolean>isGuardian;
};
