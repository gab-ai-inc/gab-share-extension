module.exports = manifest = {
    "manifest_version": 2,
    "name": "Gab.com Share Extension",
    "short_name": "Share to Gab",
    "description": "An extension to easily send a post from any webpage to Gab.com.",
    "homepage_url": "https://share.gab.com/download",
    "version": "0.1.0",
    "icons": {
        "16": "assets/images/logo/gab-g-16.png",
        "48": "assets/images/logo/gab-g-48.png",
        "128": "assets/images/logo/gab-g-128.png"
    },
    "permissions": [
        "activeTab",
        "storage",
        "__CONTEXT_MENUS__",
        "notifications",
        "https://*.gab.com/*"
    ],
    "browser_action": {
        "default_icon": "assets/images/logo/gab-g-128.png",
        "default_popup": "popup/popup.html"
    },
    "commands": {
        "_execute_browser_action": {
            "suggested_key": {
                "default": "Alt+Shift+G",
                "mac": "Alt+Shift+G"
            }
        }
    },
    "background": {
        "scripts": [
            "background/background.js"
        ]
    },
    "content_security_policy": "script-src 'self' 'unsafe-eval'; object-src 'self' https://*.gab.com/*"
}
