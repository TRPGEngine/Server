import axios from 'axios';

const port = global.port || '23256';

export const request = axios.create({
  baseURL: `http://127.0.0.1:${port}`,
});

export default request;
