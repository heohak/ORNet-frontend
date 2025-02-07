export class DateUtils {
    static formatDate(dateString) {
        if (!dateString || dateString === "No Data") {
            return "None";
        }

        const date = new Date(dateString);
        if (isNaN(date.getTime())) { // Ensure the date is valid
            return "None";
        }

        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return new Intl.DateTimeFormat('en-GB', options).format(date).replace(/\//g, '.');
    }
}
