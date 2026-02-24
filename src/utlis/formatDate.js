// dateUtils.js

export function formatDate(dateString) {
    const date = new Date(dateString);

    // Function to get the ordinal suffix for the day
    function getOrdinalSuffix(day) {
        const suffixes = ['th', 'st', 'nd', 'rd'];
        const value = day % 100;
        return suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0];
    }

    // Get the day, month, year, hours, and minutes
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = date.getMinutes();
    
    // Adjust hours for AM/PM format
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'

    // Format minutes with leading zero if needed
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;

    // Get the formatted date string
    return `${day}${getOrdinalSuffix(day)} ${month} ${year} at ${hours}:${formattedMinutes} ${ampm}`;
}
