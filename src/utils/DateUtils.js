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

export const parseLocalDate = (dateString) => {
    if (!dateString) return null;
    const parts = dateString.split("-");
    return new Date(parts[0], parts[1] - 1, parts[2]); // creates a local date
};

export const formatLocalDate = (date) => {
    if (!date) return "";
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
};

