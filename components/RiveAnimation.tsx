import React from 'react';
import { useRive, Layout, Fit, Alignment } from '@rive-app/react-canvas';

interface RiveAnimationProps {
    src: string;
    artboard?: string;
    stateMachines?: string | string[];
    autoplay?: boolean;
    className?: string;
    fit?: Fit;
    alignment?: Alignment;
}

export const RiveAnimation: React.FC<RiveAnimationProps> = ({
    src,
    artboard,
    stateMachines,
    autoplay = true,
    className,
    fit = Fit.Contain,
    alignment = Alignment.Center,
}) => {
    const { RiveComponent } = useRive({
        src,
        artboard,
        stateMachines,
        autoplay,
        layout: new Layout({
            fit,
            alignment,
        }),
    });

    return (
        <div className={className}>
            <RiveComponent />
        </div>
    );
};
