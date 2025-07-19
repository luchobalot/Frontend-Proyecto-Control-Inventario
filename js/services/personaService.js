// Servicio para manejar operaciones con personas
class PersonaService {
    static async getAll(pageNumber = 1, pageSize = API_CONFIG.DEFAULT_PAGE_SIZE) {
        console.log('📋 PersonaService.getAll() iniciado');
        console.log('Página:', pageNumber, 'Tamaño:', pageSize);
        
        const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PERSONAS}`;
        const params = {
            pageNumber: pageNumber,
            pageSize: pageSize
        };
        
        console.log('URL construida:', url);
        console.log('Parámetros:', params);
        
        try {
            const result = await HttpClient.get(url, params);
            console.log('✅ PersonaService.getAll() completado exitosamente');
            return result;
        } catch (error) {
            console.error('❌ Error en PersonaService.getAll():', error);
            throw error;
        }
    }

    static async getById(id) {
        console.log('👤 PersonaService.getById() iniciado para ID:', id);
        
        const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PERSONAS}/${id}`;
        console.log('URL construida:', url);
        
        try {
            const result = await HttpClient.get(url);
            console.log('✅ PersonaService.getById() completado exitosamente');
            return result;
        } catch (error) {
            console.error('❌ Error en PersonaService.getById():', error);
            throw error;
        }
    }
}