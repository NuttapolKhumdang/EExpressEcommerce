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

function token(length) {
    let result = "";
    for (let i = 0; i < length; i++) result += (Math.random() * 16 | 0).toString(16);
    return result;
};

module.exports = {
    Months,
    fdiffp,
    token,
}
