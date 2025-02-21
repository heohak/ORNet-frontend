import { useState, useMemo } from 'react';

const MaintenanceSort = (items, initialConfig = { key: null, direction: 'ascending' }, getSortValue = (item, key) => item[key]) => {
    const [sortConfig, setSortConfig] = useState(initialConfig);

    const sortedItems = useMemo(() => {
        if (!sortConfig.key) return items;

        return [...items].sort((a, b) => {
            const valueA = getSortValue(a, sortConfig.key);
            const valueB = getSortValue(b, sortConfig.key);

            if (valueA < valueB) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (valueA > valueB) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
        });
    }, [items, sortConfig, getSortValue]);

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
