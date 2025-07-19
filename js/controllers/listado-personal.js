// Controlador para la página de listado de personal
class ListadoPersonalController {
    constructor() {
        this.currentPage = 1;
        this.pageSize = 8; // Como tienes en tu HTML
        this.init();
    }

    async init() {
        try {
            console.log('Iniciando carga de personal...');
            await this.loadPersonal();
        } catch (error) {
            console.error('Error al inicializar:', error);
            this.showError('Error al cargar los datos del personal');
        }
    }

    async loadPersonal() {
        try {
            // Mostrar loading
            this.showLoading();
            
            // Llamar a la API
            const response = await PersonaService.getAll(this.currentPage, this.pageSize);
            console.log('=== DEBUG COMPLETO ===');
            console.log('Respuesta completa:', response);
            console.log('Tipo de response:', typeof response);
            console.log('¿Es array response?', Array.isArray(response));
            console.log('Propiedades de response:', Object.keys(response));
            
            // Verificar todas las posibles propiedades
            console.log('response.items:', response.items);
            console.log('response.Items:', response.Items);
            console.log('¿Es array response.items?', Array.isArray(response.items));
            console.log('¿Es array response.Items?', Array.isArray(response.Items));
            
            // Extraer datos de forma más robusta
            let personas;
            let totalCount;
            
            if (response.items && Array.isArray(response.items)) {
                personas = response.items;
                totalCount = response.totalCount || response.items.length;
            } else if (response.Items && Array.isArray(response.Items)) {
                personas = response.Items;
                totalCount = response.TotalCount || response.Items.length;
            } else if (Array.isArray(response)) {
                personas = response;
                totalCount = response.length;
            } else {
                console.error('No se pudo extraer array de personas de:', response);
                this.showError('Formato de respuesta no válido');
                return;
            }
            
            console.log('Personas extraídas:', personas);
            console.log('Total count:', totalCount);
            console.log('¿Es array personas?', Array.isArray(personas));
            
            // Renderizar datos
            this.renderPersonal(personas);
            this.updateStats(totalCount);
            
        } catch (error) {
            console.error('Error al cargar personal:', error);
            this.showError('Error al cargar los datos del personal: ' + error.message);
        }
    }

    showLoading() {
        const tbody = document.getElementById('personal-tbody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 2rem;">Cargando...</td></tr>';
        }
    }

    renderPersonal(personas) {
        console.log('=== RENDERIZANDO ===');
        console.log('Entrando a renderPersonal con:', personas);
        console.log('Tipo:', typeof personas);
        console.log('¿Es array?', Array.isArray(personas));
        
        const tbody = document.getElementById('personal-tbody');
        if (!tbody) {
            console.error('No se encontró el tbody con id personal-tbody');
            return;
        }

        // Verificar que personas sea un array
        if (!Array.isArray(personas)) {
            console.error('Error: personas no es un array:', personas);
            this.showError('Error en el formato de datos recibidos');
            return;
        }

        if (personas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 2rem;">No se encontraron personas</td></tr>';
            return;
        }

        // DIAGNÓSTICO: Ver qué propiedades tiene el primer objeto
        if (personas.length > 0) {
            console.log('Primera persona completa:', personas[0]);
            console.log('Propiedades disponibles:', Object.keys(personas[0]));
        }

        tbody.innerHTML = personas.map(persona => `
            <tr>
                <td>
                    <div class="employee-cell">
                        <div class="employee-avatar">${this.getInitials(persona.nombre, persona.apellido)}</div>
                        <span>${persona.nombre}</span>
                    </div>
                </td>
                <td>${persona.apellido}</td>
                <td>
                    <span class="username">${persona.nombreUsuario}</span>
                </td>
                <td>
                    <span class="role-badge ${this.getRoleClass(persona.rol)}">${this.getRoleText(persona.rol)}</span>
                </td>
                <td>${persona.oficinaNumero ? `Oficina ${persona.oficinaNumero}` : 'Sin oficina'}</td>
                <td>
                    <span class="status-badge active">Activo</span>
                </td>
                <td>-</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn view-btn" title="Ver perfil" data-id="${persona.idPersona}">👁️</button>
                        <button class="action-btn edit-btn" title="Editar" data-id="${persona.idPersona}">✏️</button>
                        <button class="action-btn assign-btn" title="Asignaciones" data-id="${persona.idPersona}">📋</button>
                        <button class="action-btn delete-btn" title="Eliminar" data-id="${persona.idPersona}">🗑️</button>
                    </div>
                </td>
            </tr>
        `).join('');
        
        console.log('Tabla renderizada exitosamente');
    }

    getInitials(nombre, apellido) {
        const n = nombre ? nombre.charAt(0).toUpperCase() : '';
        const a = apellido ? apellido.charAt(0).toUpperCase() : '';
        return n + a;
    }

    getRoleClass(rol) {
        switch(rol) {
            case 1: return 'operator'; // Usuario
            case 2: return 'admin'; // Administrador  
            case 3: return 'admin'; // SuperAdmin
            case 4: return 'technician'; // Sin Usuario
            default: return 'operator';
        }
    }

    getRoleText(rol) {
        switch(rol) {
            case 1: return 'Usuario';
            case 2: return 'Administrador';
            case 3: return 'SuperAdmin';
            case 4: return 'Sin Usuario';
            default: return 'Usuario';
        }
    }

    updateStats(totalCount) {
        // Actualizar contador principal
        const totalElement = document.getElementById('total-empleados');
        if (totalElement) {
            totalElement.textContent = `${totalCount} personas registradas`;
        }
        
        // Actualizar info de paginación
        const paginationInfo = document.querySelector('.pagination-info span');
        if (paginationInfo) {
            const showing = Math.min(this.pageSize, totalCount);
            const startItem = ((this.currentPage - 1) * this.pageSize) + 1;
            const endItem = Math.min(this.currentPage * this.pageSize, totalCount);
            
            paginationInfo.innerHTML = `Mostrando <strong>${startItem}-${endItem}</strong> de <strong>${totalCount}</strong> personas`;
        }
    }

    showError(message) {
        const tbody = document.getElementById('personal-tbody');
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 2rem; color: #ef4444;">${message}</td></tr>`;
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new ListadoPersonalController();
});