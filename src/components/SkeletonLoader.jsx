import React from 'react';

export const SkeletonCard = () => (
    <div className="card p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between">
            <div className="space-y-2">
                <div className="h-4 w-20 bg-surface-700 rounded-lg shimmer" />
                <div className="h-3 w-32 bg-surface-700/60 rounded-lg shimmer" />
            </div>
            <div className="h-7 w-16 bg-surface-700 rounded-xl shimmer" />
        </div>
        <div className="flex items-end gap-3">
            <div className="space-y-1.5 flex-shrink-0">
                <div className="h-8 w-28 bg-surface-700 rounded-lg shimmer" />
                <div className="h-3 w-20 bg-surface-700/60 rounded-lg shimmer" />
            </div>
            <div className="flex-1 h-12 bg-surface-700/40 rounded-lg shimmer" />
        </div>
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/5">
            {[1, 2, 3].map(i => (
                <div key={i} className="space-y-1.5">
                    <div className="h-3 w-12 bg-surface-700/60 rounded shimmer" />
                    <div className="h-4 w-16 bg-surface-700 rounded shimmer" />
                </div>
            ))}
        </div>
        <div className="space-y-1.5">
            <div className="flex justify-between">
                <div className="h-3 w-14 bg-surface-700/60 rounded shimmer" />
                <div className="h-3 w-14 bg-surface-700/60 rounded shimmer" />
            </div>
            <div className="h-1 w-full bg-surface-700 rounded-full shimmer" />
        </div>
    </div>
);

export const SkeletonHeader = () => (
    <div className="flex flex-wrap gap-3">
        {[1, 2, 3].map(i => (
            <div key={i} className="card flex-1 min-w-0 p-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-surface-700 shimmer flex-shrink-0" />
                <div className="space-y-2 flex-1">
                    <div className="h-3 w-20 bg-surface-700/60 rounded shimmer" />
                    <div className="h-5 w-32 bg-surface-700 rounded shimmer" />
                    <div className="h-3 w-24 bg-surface-700/40 rounded shimmer" />
                </div>
            </div>
        ))}
    </div>
);

export default function SkeletonLoader({ count = 6 }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: count }, (_, i) => (
                <SkeletonCard key={i} />
            ))}
        </div>
    );
}
