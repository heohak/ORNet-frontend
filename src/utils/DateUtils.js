// src/utils/dateUtils.js
export class DateUtils {
    static formatDate(dateString) {
        if (!dateString) {
            return "N/A";
        }
        const date = new Date(dateString);
        const options = {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        };
        return new Intl.DateTimeFormat('en-GB', options)
            .format(date)
            .replace(/\//g, '.')
    }
}
