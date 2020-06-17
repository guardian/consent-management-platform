import React from 'react';
import { DEFAULT_FONT_FAMILIES } from './utils/config';
import { FontsContextInterface } from '../types';

export const FontsContext = React.createContext<FontsContextInterface>(
	DEFAULT_FONT_FAMILIES,
);
