import React from 'react';
import { css } from '@emotion/core';

const CMP: React.FC = () => (
    <div
        css={css`
            color: red;
            border: 2px solid blue;
        `}
    >
        HELLO WORLD
    </div>
);

export { CMP };
