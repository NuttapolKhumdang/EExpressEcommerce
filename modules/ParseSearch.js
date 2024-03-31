function parseSearch(title = "") {
    const rml = ".-=/\\[]{}()_+~`|<>?!@#$%^&*;:'\"\r\n";

    let result = '';
    for (const t of title.toLowerCase()) {
        let r = t;
        if (rml.includes(t)) r = '';
        if (t == ' ') r = '-';
        result += r;
    }

    return result;
}

module.exports = parseSearch;