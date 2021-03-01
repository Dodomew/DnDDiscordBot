const fetch = require('node-fetch');

export interface ApiResponseProps {
    slug: string;
}

const apiGET = async (apiEndpoint: string) => {
    const responseData = await fetch(apiEndpoint + '?format=json').then((response) => {
        if (response.status === 200) {
            return response.json();
        }
    });

    return responseData;
}

export default apiGET;