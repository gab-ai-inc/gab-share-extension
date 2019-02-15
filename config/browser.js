class Browser {
    constructor(options={}) {
        this.name = options.name || '';
        this.slug = options.slug || '';
        this.scriptVariableMap = options.scriptVariableMap || {};
        this.manifestMap = options.manifestMap || {};
        this.version = options.version || '';
    };

    get path() {
        if (this.slug === 'safari') return `build/${this.slug}/gabshareextension.safariextension`
        return `build/${this.slug}`;
    };
};

module.exports = Browser;
