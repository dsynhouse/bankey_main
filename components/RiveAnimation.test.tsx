import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { RiveAnimation } from './RiveAnimation';

// Mock the Rive hook since canvas is not supported in JSDOM
vi.mock('@rive-app/react-canvas', () => ({
    useRive: vi.fn(() => ({
        RiveComponent: () => <div data-testid="rive-mock" />,
        rive: {},
    })),
    Layout: vi.fn(),
    Fit: { Contain: 'contain' },
    Alignment: { Center: 'center' },
}));

describe('RiveAnimation Component', () => {
    it('renders without crashing', () => {
        const { getByTestId } = render(
            <RiveAnimation src="test.riv" />
        );
        expect(getByTestId('rive-mock')).toBeInTheDocument();
    });
});
