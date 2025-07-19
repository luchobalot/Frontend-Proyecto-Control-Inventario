// Servicio para manejar operaciones con personas
class PersonaService {
    static async getAll(pageNumber = 1, pageSize = API_CONFIG.DEFAULT_PAGE_SIZE) {
        const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PERSONAS}`;
        const params = {
            pageNumber: pageNumber,
            pageSize: pageSize
        };
        
        return await HttpClient.get(url, params);
    }
}