function flattenObject(obj, prefix = '', result = {}) {
    for (const key in obj) {
        const value = obj[key];
        const newKey = prefix ? `${prefix}.${key}` : key;

        if (value === null || value === undefined) {
            result[newKey] = '';
        } else if (Array.isArray(value)) {
            const containsObject = value.some(item => typeof item === 'object');
            result[newKey] = containsObject ? JSON.stringify(value) : value.join(', ');
        } else if (typeof value === 'object') {
            result[newKey] = JSON.stringify(value);
        } else {
            result[newKey] = value;
        }
    }
    return result;
}

function parseFields(item) {
    const parsed = {};
    for (const key in item) {
        const value = item[key];
        try {
            if (typeof value === 'string') {
                const trimmed = value.trim();
                if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
                    parsed[key] = JSON.parse(trimmed);
                } else if (trimmed.includes(',')) {
                    parsed[key] = trimmed.split(',').map(v => v.trim());
                } else {
                    parsed[key] = trimmed;
                }
            } else {
                parsed[key] = value;
            }
        } catch {
            parsed[key] = value;
        }
    }
    return parsed;
}

module.exports = {
    flattenObject,
    parseFields
};
