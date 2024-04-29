function access(rights = [], json = false) {
    return (req, res, next) => {
        if ((!rights && req.isAuthenticated())) return next();
        else if (rights && req?.user?.role && !req?.user?.deleted && req?.user?.status) {
            const isAccessable = req?.user?.access.filter(e => rights.includes(e)).length !== 0;

            if (isAccessable) return next();

            if (json) return res.status(403).json({ status: 403, message: 'no permission to access content' });
            else return res.status(403).render('managers', { render: 'managers/no-access.html', account: req?.user });
        };

        if (json) return res.status(401).json({ status: 401, message: 'no permission to access content' })
        else return res.redirect('/managers/login');
    }
}

module.exports = access;