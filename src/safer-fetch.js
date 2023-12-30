/* eslint-disable no-use-before-define */

const {scratchFetch} = require('./scratchFetch');

// This throttles and retries scratchFetch() to mitigate the effect of random network errors and
// random browser errors (especially in Chrome)

let currentFetches = 0;
const queue = [];

const startNextFetch = ([resolve, url, options]) => {
    let firstError;
    let failedAttempts = 0;

    const attemptToFetch = () => scratchFetch(url, options)
        .then(result => {
            currentFetches--;
            checkStartNextFetch();
            return result;
        })
        .catch(error => {
            if (error === 403) {
                // Retrying this request will not help, so return an error now.
                throw error;
            }

            console.warn(`Attempt to fetch ${url} failed`, error);
            if (!firstError) {
                firstError = error;
            }

            if (failedAttempts < 2) {
                failedAttempts++;
                return new Promise(cb => setTimeout(cb, (failedAttempts + Math.random() - 1) * 5000))
                    .then(attemptToFetch);
            }

            currentFetches--;
            checkStartNextFetch();
            throw firstError;
        });

    return resolve(attemptToFetch());
};

const checkStartNextFetch = () => {
    if (currentFetches < 100 && queue.length > 0) {
        currentFetches++;
        startNextFetch(queue.shift());
    }
};

const saferFetch = (url, options) => new Promise(resolve => {
    queue.push([resolve, url, options]);
    checkStartNextFetch();
});

module.exports = saferFetch;
