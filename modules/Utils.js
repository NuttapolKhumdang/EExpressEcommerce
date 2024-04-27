const Months = {
    full: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    short: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
};

function fdiffp(data) {
    const y = Object.keys(data)[0];
    const m = Object.keys(data[y]).reverse();

    const ia = m[0]
    const ib = m[1]

    const a = data[y][ia];
    const b = data[y][ib] ?? 1;

    return (((a - b) / b) * 100).toFixed(2);
}

module.exports = {
    Months,
    fdiffp,
}
