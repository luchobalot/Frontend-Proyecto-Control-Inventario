// Servicio para manejar operaciones con materiales
class MaterialService {
    static async getByPersona(personaId) {
        const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MATERIALES}/persona/${personaId}`;
        return await HttpClient.get(url);
    }

    static async getAll(pageNumber = 1, pageSize = API_CONFIG.DEFAULT_PAGE_SIZE) {
        const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MATERIALES}`;
        const params = {
            pageNumber: pageNumber,
            pageSize: pageSize
        };
        
        return await HttpClient.get(url, params);
    }

    static async getById(id) {
        const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MATERIALES}/${id}`;
        return await HttpClient.get(url);
    }
}