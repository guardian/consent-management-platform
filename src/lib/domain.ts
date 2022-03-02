let isGuardian: boolean | undefined;

const isServerSide = typeof window === 'undefined';

export const isGuardianDomain = (): boolean => {
	if (typeof isGuardian === 'undefined') {
		// If this code is running server-side set isGuardian to a sensible default
		if (isServerSide) {
			isGuardian = true;
		} else {
			isGuardian = window.location.host.endsWith('.theguardian.com');
		}
	}

	return isGuardian;
};
