/**
 * Empty function.
 *
 * @returns {undefined} undefined
 */
function noop() {
    return undefined;
}

/**
 * Returns a throttled function.
 *
 * @param {function} func - The function to throttle
 * @param {Number} time - The time to throttle invocations
 * @returns {function} throttled function
 */
function throttle(func, time) {
    let last = 0;
    let timeoutID;

    return function () {
        const now = Date.now();

        if (now - last > time) {
            last = now;
            if (timeoutID) {
                clearTimeout(timeoutID);
                timeoutID = false;
            }

            func.apply(null, arguments);
        } else {
            const args = arguments;
            timeoutID = setTimeout(function () {
                last = Date.now();
                func.apply(null, args);
            }, now - last);
        }
    };
}

export {
    noop,
    throttle
};
