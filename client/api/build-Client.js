import axios from 'axios';


const buildClient = ({ req }) => {
    
    let baseURL = '/';
    let headers = null;

    if (typeof window === 'undefined') {
        baseURL = `${req['x-forwarded-proto']}://${req.headers.host}`;
        headers = req.headers;
    }
    
    return axios.create({
        baseURL,
        headers
    });
};

export default buildClient;