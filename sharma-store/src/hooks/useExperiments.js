import { useState, useEffect } from 'react';
import { useEngagement } from './useEngagement';

// Simple persistence for experiment assignments
const STORAGE_KEY = 'sharma_experiments';

export const useExperiments = () => {
    const { logEvent } = useEngagement();
    const [assignments, setAssignments] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        } catch {
            return {};
        }
    });

    const getVariant = (experimentId, variants = ['A', 'B']) => {
        // If already assigned, return it
        if (assignments[experimentId]) {
            return assignments[experimentId];
        }

        // Random assignment
        const randomVariant = variants[Math.floor(Math.random() * variants.length)];

        // Persist
        const newAssignments = { ...assignments, [experimentId]: randomVariant };
        setAssignments(newAssignments);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newAssignments));

        // Log Exposure
        logEvent('experiment_exposure', 'growth', { experimentId, variant: randomVariant });

        return randomVariant;
    };

    return { getVariant };
};
