import React from 'react';
import { css } from '@emotion/core';
import { palette } from '@guardian/src-foundations';
import { from } from '@guardian/src-foundations/mq';
import { headlineSizes } from '@guardian/src-foundations/typography';
import { visuallyHidden } from '@guardian/src-foundations/accessibility';
import { FontsContext } from './FontsContext';
import { FontsContextInterface } from '../types';

const collapseItemButtonStyles = (collapsed: boolean, bodySans: string) => css`
	background-color: transparent;
	border: 0;
	box-sizing: border-box;
	cursor: pointer;
	outline: none;
	padding: 0 0 4px 20px;
	position: relative;
	margin-right: 3px;
	margin-left: -3px;
	> * {
		pointer-events: none;
	}
	font-family: ${bodySans};
	font-size: ${headlineSizes.xxxsmall}px;
	${from.mobileLandscape} {
		font-size: ${headlineSizes.xxsmall}px;
	}
	line-height: 1.15rem;
	font-weight: 700;
	color: ${palette.neutral[7]};
	text-align: left;
	::before {
		position: absolute;
		top: ${collapsed ? '9px' : '7px'};
		left: 6px;
		border: 2px solid ${palette.neutral[7]};
		border-top: 0;
		border-left: 0;
		content: '';
		display: inline-block;
		transform: ${collapsed ? 'rotate(-135deg)' : 'rotate(45deg)'};
		height: 6px;
		width: 6px;
		box-sizing: content-box;
	}
	:focus,
	:hover {
		color: ${palette.brand.bright};

		::before {
			border-color: ${palette.brand.bright};
		}
	}
`;

const visuallyHiddenStyles = css`
	${visuallyHidden};
`;

interface Props {
	collapsed: boolean;
	title: string;
	panelId: string;
}

export const CollapseItemButton: React.FC<Props> = ({
	collapsed,
	title,
	panelId,
}: Props) => {
	return (
		<FontsContext.Consumer>
			{({ bodySans }: FontsContextInterface) => (
				<button
					type="button"
					css={collapseItemButtonStyles(collapsed, bodySans)}
					aria-expanded={collapsed}
					aria-controls={panelId}
				>
					<span css={visuallyHiddenStyles}>Show</span> {title}
				</button>
			)}
		</FontsContext.Consumer>
	);
};
