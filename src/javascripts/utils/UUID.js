/**
 *
 * author: Robert Kieffer <robert@broofa.com>
 * license: Dual licensed under the MIT and GPL licenses.
 *
 */

// A more compact, but less performant, RFC4122v4 compliant solution WITHOUT DASHES AND LOWER CASE:
export default function UUID(){
    return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    }).toLowerCase();
}

/**
 * Determines if the given string is a UUID (i.e. an S9ID).
 *
 * @param {string} str The string to check whether it is a UUID/S9ID.
 *
 * @return {boolean} True if string is a UUID/S9ID, false otherwise.
 */
UUID.isUUID = function(str){
    if (!str){
        return false;
    }

    return (/^[0-9a-f]{12}4[0-9a-f]{19}$/i).test(str);
};
