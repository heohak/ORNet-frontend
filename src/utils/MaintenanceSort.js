import { useState, useMemo } from 'react';

const MaintenanceSort = (items, initialConfig = { key: null, direction: 'ascending' }) => {
    const [sortConfig, setSortConfig] = useState(initialConfig);

    const sortedItems = useMemo(() => {
        if (!sortConfig.key) return items;

        return [...items].sort((a, b) => {
            const valueA = a[sortConfig.key];
            const valueB = b[sortConfig.key];

            if (valueA < valueB) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (valueA > valueB) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
        });
    }, [items, sortConfig]);

    const handleSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    return { sortedItems, sortConfig, handleSort };
};

export default MaintenanceSort;
