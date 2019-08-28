interface GuPurposeState {
    [key: string]: boolean | null;
}

type PurposeEvent = 'functional' | 'performance' | 'advertisement';

type PurposeCallback = (state: boolean | null) => void;

interface Purpose {
    state: boolean | null;
    callbacks: PurposeCallback[];
}
