const fetch = require('node-fetch');
const throttle = require('fetch-throttle');
const fetchThrottle = throttle(fetch, 2, 10000);

export interface ApiResponseProps {
    slug: string;
}

const apiGET = async (apiEndpoint: string) => {
    const responseData = await fetchThrottle(apiEndpoint + '?format=json').then((response) => {
        if (response.status === 200) {
            return response.json();
        }
    });

    return responseData;
}

export default apiGET;