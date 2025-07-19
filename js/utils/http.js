// Utilidades para hacer requests HTTP
class HttpClient {
    static async get(url, params = {}) {
        try {
            const urlWithParams = new URL(url);
            Object.keys(params).forEach(key => {
                if (params[key] !== null && params[key] !== undefined) {
                    urlWithParams.searchParams.append(key, params[key]);
                }
            });

            const response = await fetch(urlWithParams, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error en GET request:', error);
            throw error;
        }
    }
}

window.HttpClient = HttpClient;