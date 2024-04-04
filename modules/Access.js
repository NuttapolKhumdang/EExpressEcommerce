function access(rights = [], json = false) {
    return (req, res, next) => {
        if ((!rights && req.isAuthenticated())) return next();
        else if (rights && req?.user?.role) {
            const isAccessable = req?.user?.access.filter(e => rights.includes(e)).length !== 0;

            if (isAccessable) return next();

            if (json) return res.json({ status: 403, message: 'no permission to access content' });
            else return res.render('errors/403');
        };

        if (json) return res.status(401).json({ status: 401, message: 'no permission to access content' })
        else return res.redirect('/managers/login');
    }
}

module.exports = access;