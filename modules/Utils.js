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

function articleMapContent(content) {
    try {
        return content.map(e => {
            if (e?.text?.startsWith("[TABLE]")) {
                let table = [];
                let tname = "";

                for (let l of e.text.split("\n")) {
                    let r, tag, rawChild;

                    if (l.startsWith("[TABLE]")) {
                        tname = l.split("[TABLE]")[1];
                        continue;
                    }

                    if (l.startsWith("[HEAD]")) {
                        rawChild = l.split("[HEAD]")[1].split("|");
                        tag = 'TH';
                    }
                    else {
                        rawChild = l.split("|");
                        tag = 'TD';
                    }

                    if (!tag) continue;
                    r = {
                        tag,
                        child: rawChild.map(e => e.trim()),
                    }
                    table.push(r);
                }
                return { tag: 'TABLE', table, tname };
            } else return e;
        });
    } catch (e) { 
        return null;
    };
}
module.exports = {
    Months,
    fdiffp,
    token,
    articleMapContent,
}
