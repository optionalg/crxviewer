/**
 * (c) 2013 Rob Wu <gwnRob@gmail.com>
 */

/* globals location, getPlatformInfo */
'use strict';

// cws_pattern[1] = extensionID
var cws_pattern = /^https?:\/\/chrome.google.com\/webstore\/.+?\/([a-z]{32})(?=[\/#?]|$)/;
var cws_download_pattern = /^https?:\/\/clients2\.google\.com\/service\/update2\/crx\b.*?%3D([a-z]{32})%26uc/;
// match pattern per Chrome spec
var cws_match_pattern = '*://chrome.google.com/webstore/detail/*';

// Opera add-on gallery
var ows_pattern = /^https?:\/\/addons.opera.com\/.*?extensions\/(?:details|download)\/([^\/]+)/i;
var ows_match_pattern = '*://addons.opera.com/*extensions/details/*';

// string extensionID if valid URL
// null otherwise
function get_extensionID(url) {
    var match = cws_pattern.exec(url);
    if (match) return match[1];
    match = cws_download_pattern.exec(url);
    return match && match[1];
}

// Returns location of CRX file for a given extensionID or CWS url or Opera add-on URL
function get_crx_url(extensionID_or_url) {
    var url;
    var match = ows_pattern.exec(extensionID_or_url);
    if (match) {
        url = 'https://addons.opera.com/extensions/download/';
        url += match[1];
        url += '/';
        return url;
    }
    // Chrome Web Store
    match = get_extensionID(extensionID_or_url);
    var extensionID = match ? match : extensionID_or_url;

    if (!/^[a-z]{32}$/.test(extensionID)) {
        return extensionID_or_url;
    }
    var platformInfo = getPlatformInfo();

    url = 'https://clients2.google.com/service/update2/crx?response=redirect';
    url += '&os=' + platformInfo.os;
    url += '&arch=' + platformInfo.arch;
    url += '&nacl_arch=' + platformInfo.nacl_arch;
    url += '&x=id%3D' + extensionID;
    url += '%26uc';
    return url;
}

// Get location of addon gallery for a given extension
function get_webstore_url(url) {
    var cws = cws_pattern.exec(url) || cws_download_pattern.exec(url);
    if (cws) {
        return 'https://chrome.google.com/webstore/detail/' + cws[1];
    }
    var ows = ows_pattern.exec(url);
    if (ows) {
        return 'https://addons.opera.com/extensions/details/' + ows[1];
    }
}

// Return the suggested name of the zip file.
function get_zip_name(url, /*optional*/filename) {
    if (!filename) {
        var extensionID = get_extensionID(url);
        if (extensionID) {
            filename = extensionID;
        } else {
            filename = /([^\/]+?)\/*$/.exec(url)[1];
        }
    }
    return filename.replace(/\.(crx|nex|zip)$/i, '') + '.zip';
}

function is_crx_url(url) {
    return cws_pattern.test(url) || ows_pattern.test(url) || /\.(crx|nex)\b/.test(url);
}

function getParam(name) { // Assume name contains no RegEx-specific char
    var haystack = location.search || location.hash;
    var pattern = new RegExp('[&?#]' + name + '=([^&]*)');
    var needle = pattern.exec(haystack);
    return needle && decodeURIComponent(needle[1]);
}
