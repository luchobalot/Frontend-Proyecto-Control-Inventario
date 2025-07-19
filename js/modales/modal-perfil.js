// Clase para manejar el modal de perfil - VERSIÓN CORREGIDA
class ModalPerfilController {
    constructor() {
        this.modal = null;
        this.currentPersona = null;
        this.isLoading = false;
        this.init();
    }

    init() {
        console.log('🔧 Inicializando ModalPerfilController...');
        this.createModalHTML();
        this.setupEventListeners();
        this.setupListEventListeners();
        console.log('✅ ModalPerfilController inicializado correctamente');
    }

    createModalHTML() {
        // Crear el modal dinámicamente si no existe
        if (!document.getElementById('modal-perfil')) {
            const modalHTML = `
                <div class="modal-overlay" id="modal-perfil" style="display: none;">
                    <div class="modal-container">
                        <div class="modal-header">
                            <div class="modal-title-group">
                                <div class="modal-avatar" id="modal-avatar">
                                    <span id="avatar-initials">--</span>
                                </div>
                                <div class="modal-title-content">
                                    <h2 class="modal-title" id="modal-title">Cargando...</h2>
                                    <p class="modal-subtitle" id="modal-subtitle">Información del perfil</p>
                                </div>
                            </div>
                            <button class="modal-close-btn" id="btn-cerrar-modal" title="Cerrar">
                                <span>✕</span>
                            </button>
                        </div>

                        <div class="modal-content" id="modal-content">
                            <!-- Se rellenará dinámicamente -->
                        </div>

                        <div class="modal-footer">
                            <div class="modal-actions">
                                <button class="btn btn-secondary" id="btn-modal-cancelar">
                                    Cerrar
                                </button>
                                <button class="btn btn-primary" id="btn-modal-editar">
                                    <span>✏️</span>
                                    Editar Persona
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
        
        this.modal = document.getElementById('modal-perfil');
    }

    setupEventListeners() {
        // Cerrar modal con X
        const closeBtn = document.getElementById('btn-cerrar-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeModal();
            });
        }

        // Cerrar modal con botón Cancelar
        const cancelBtn = document.getElementById('btn-modal-cancelar');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.closeModal();
            });
        }

        // Cerrar modal con click fuera
        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.closeModal();
                }
            });
        }

        // Cerrar modal con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isModalOpen()) {
                this.closeModal();
            }
        });

        // Botón Editar
        const editBtn = document.getElementById('btn-modal-editar');
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                this.editarPersona();
            });
        }
    }

    setupListEventListeners() {
        // Agregar event listeners a los botones de "Ver perfil" en la tabla
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('view-btn') || e.target.closest('.view-btn')) {
                e.preventDefault();
                const btn = e.target.classList.contains('view-btn') ? e.target : e.target.closest('.view-btn');
                const personaId = btn.getAttribute('data-id');
                
                console.log('👁️ Click en ver perfil, ID:', personaId);
                
                if (personaId) {
                    this.openModal(personaId);
                }
            }
        });
    }

    async openModal(personaId) {
        if (this.isLoading) {
            console.log('⏳ Modal ya está cargando, ignorando...');
            return;
        }
        
        try {
            console.log('🔍 Abriendo modal para persona ID:', personaId);
            
            this.isLoading = true;
            this.showModal();
            this.showLoading();
            
            // **AQUÍ ESTÁ LA CORRECCIÓN PRINCIPAL**
            // Usar PersonaService en lugar de HttpClient directamente
            const persona = await PersonaService.getById(personaId);
            
            console.log('📄 Datos de persona recibidos:', persona);
            
            if (persona) {
                this.currentPersona = persona;
                this.populateModal(persona);
            } else {
                this.showError('No se pudieron cargar los datos de la persona');
            }
            
        } catch (error) {
            console.error('❌ Error al abrir modal:', error);
            this.showError('Error al cargar los datos: ' + error.message);
        } finally {
            this.isLoading = false;
        }
    }

    async populateModal(persona) { // ← AGREGAR 'async' aquí
    try {
        console.log('🖥️ Poblando modal con datos:', persona);
        
        // Avatar y título
        const initials = this.getInitials(persona.nombre, persona.apellido);
        this.setElementText('avatar-initials', initials);
        this.setElementText('modal-title', `${persona.nombre} ${persona.apellido}`);
        
        // 🔧 AGREGAR ESTA LÍNEA - Cargar materiales ANTES del template
        const materialesHTML = await this.renderMaterialesSection(persona);
        
        // Crear contenido del modal
        const content = `
            <!-- Información Personal -->
            <div class="info-section">
                <h3 class="section-title">
                    <span class="section-icon">👤</span>
                    Información Personal
                </h3>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">Nombre:</span>
                        <span class="info-value">${persona.nombre || '-'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Apellido:</span>
                        <span class="info-value">${persona.apellido || '-'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Jerarquía:</span>
                        <span class="info-value">${this.getJerarquiaText(persona.jerarquia)}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Usuario:</span>
                        <span class="info-value">${persona.nombreUsuario || '-'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Oficina:</span>
                        <span class="info-value">${this.getOficinaText(persona)}</span>
                    </div>
                </div>
            </div>

            <!-- Materiales Asignados -->
            <div class="info-section">
                <h3 class="section-title">
                    <span class="section-icon">📦</span>
                    Materiales Asignados
                    <span class="materials-count">${persona.materialesAsignados || 0} materiales</span>
                </h3>
                <div class="materials-container">
                    ${materialesHTML}
                </div>
            </div>
        `;
        
        const modalContent = document.getElementById('modal-content');
        if (modalContent) {
            modalContent.innerHTML = content;
        }
        
        console.log('✅ Modal poblado exitosamente');
        
    } catch (error) {
        console.error('❌ Error al poblar modal:', error);
        this.showError('Error al mostrar los datos');
    }
}

    async renderMaterialesSection(persona) {
        const count = persona.materialesAsignados || 0;
        
        if (count === 0) {
            return `
                <div class="no-materials">
                    <div class="no-materials-icon">📭</div>
                    <p>Esta persona no tiene materiales asignados</p>
                </div>
            `;
        }

        // Intentar obtener los materiales reales de la persona
        try {
            console.log('🔍 Cargando materiales para persona:', persona.idPersona);
            
            // Usar MaterialService si está disponible, sino HttpClient directo
            let materiales;
            if (typeof MaterialService !== 'undefined') {
                materiales = await MaterialService.getByPersona(persona.idPersona);
            } else {
                materiales = await HttpClient.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MATERIALES}/persona/${persona.idPersona}`);
            }
            
            console.log('📦 Materiales recibidos:', materiales);
            
            if (materiales && Array.isArray(materiales) && materiales.length > 0) {
                return materiales.map(material => {
                    // Construir nombre en el formato: Nombre + Marca + Modelo
                    let nombreCompleto = material.nombre || 'Material sin nombre';
                    
                    // Agregar marca si existe
                    if (material.marca) {
                        nombreCompleto += ` ${material.marca}`;
                    }
                    
                    // Agregar modelo si existe
                    if (material.modelo) {
                        nombreCompleto += ` ${material.modelo}`;
                    }
                    
                    return `
                        <div class="material-item">
                            <div class="material-header">
                                <div class="material-name">${nombreCompleto}</div>
                            </div>
                            <div class="material-info">
                                ${material.categoriaNombre ? `<span class="material-category">📂 ${material.categoriaNombre}</span>` : ''}
                                ${material.fechaAsignacion ? `<span class="material-date">📅 Asignado: ${this.formatDate(material.fechaAsignacion)}</span>` : ''}
                            </div>
                        </div>
                    `;
                }).join('');
            } else {
                console.log('⚠️ No se encontraron materiales o la respuesta está vacía');
                return this.renderFallbackMateriales(persona);
            }
        } catch (error) {
            console.log('⚠️ Error al cargar materiales detallados:', error.message);
            return this.renderFallbackMateriales(persona);
        }
    }

    renderFallbackMateriales(persona) {
        const count = persona.materialesAsignados || 0;
        return `
            <div class="material-item">
                <div class="material-header">
                    <div class="material-name">Información de materiales</div>
                </div>
                <div class="material-details">
                    <span class="material-count">Total: <strong>${count}</strong> materiales asignados</span>
                    ${persona.fechaUltimaAsignacion ? `<span class="material-date">Última asignación: ${this.formatDate(persona.fechaUltimaAsignacion)}</span>` : ''}
                    <span class="material-info">📋 Para ver detalles, ir a la sección de materiales</span>
                </div>
            </div>
        `;
    }

    getOficinaText(persona) {
        if (persona.oficinaNumero) {
            return `Oficina ${persona.oficinaNumero}${persona.oficinaDepartamento ? ' - ' + persona.oficinaDepartamento : ''}`;
        }
        return 'Sin oficina asignada';
    }

    getInitials(nombre, apellido) {
        const n = nombre ? nombre.charAt(0).toUpperCase() : '';
        const a = apellido ? apellido.charAt(0).toUpperCase() : '';
        return n + a || 'NA';
    }

    setElementText(elementId, text) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = text || '-';
        }
    }

    getRoleClass(rol) {
        switch(parseInt(rol)) {
            case 1: return 'operator'; // Usuario
            case 2: return 'admin'; // Administrador  
            case 3: return 'supervisor'; // SuperAdmin
            case 4: return 'technician'; // Sin Usuario
            default: return 'operator';
        }
    }

    getRoleText(rol) {
        switch(parseInt(rol)) {
            case 1: return 'Usuario';
            case 2: return 'Administrador';
            case 3: return 'SuperAdmin';
            case 4: return 'Sin Usuario';
            default: return 'Usuario';
        }
    }

    getJerarquiaText(jerarquia) {
        const jerarquias = {
            0: 'Agente Civil',
            1: 'Marinero Segundo',
            2: 'Marinero Primero',
            3: 'Cabo Segundo',
            4: 'Cabo Primero',
            5: 'Cabo Principal',
            6: 'Suboficial Segundo',
            7: 'Suboficial Primero',
            8: 'Suboficial Principal',
            9: 'Suboficial Mayor',
            10: 'Guardiamarina',
            11: 'Teniente de Corbeta',
            12: 'Teniente de Fragata',
            13: 'Teniente de Navío',
            14: 'Capitán de Corbeta',
            15: 'Capitán de Fragata',
            16: 'Capitán de Navío',
            17: 'Comodoro de Marina',
            18: 'Contraalmirante',
            19: 'Vicealmirante',
            20: 'Almirante'
        };
        
        return jerarquias[jerarquia] || 'Jerarquía desconocida';
    }

    formatDate(dateString) {
        if (!dateString) return null;
        
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (error) {
            return dateString;
        }
    }

    showModal() {
        if (this.modal) {
            this.modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            
            // Añadir clase active para animación
            setTimeout(() => {
                this.modal.classList.add('active');
            }, 10);
        }
    }

    closeModal() {
        if (this.modal) {
            this.modal.classList.remove('active');
            
            setTimeout(() => {
                this.modal.style.display = 'none';
                document.body.style.overflow = 'auto';
                this.currentPersona = null;
            }, 300);
        }
    }

    isModalOpen() {
        return this.modal && this.modal.style.display === 'flex';
    }

    showLoading() {
        const content = document.getElementById('modal-content');
        if (content) {
            content.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: #64748b;">
                    <div class="loading-spinner" style="margin: 0 auto 1rem auto; width: 32px; height: 32px; border: 3px solid #e2e8f0; border-top: 3px solid #3b82f6; border-radius: 50%; animation: modal-spin 1s linear infinite;"></div>
                    Cargando información...
                </div>
            `;
        }
    }

    showError(message) {
        const content = document.getElementById('modal-content');
        if (content) {
            content.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: #ef4444;">
                    <div style="font-size: 2rem; margin-bottom: 1rem;">⚠️</div>
                    ${message}
                    <br><br>
                    <button onclick="window.modalPerfil.closeModal()" style="padding: 0.5rem 1rem; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        Cerrar
                    </button>
                </div>
            `;
        }
    }

    editarPersona() {
        if (this.currentPersona) {
            window.location.href = `editar-personal.html?id=${this.currentPersona.idPersona}`;
        }
    }
}

// Inicializar el modal cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando Modal de Perfil...');
    
    // Verificar que las dependencias estén disponibles
    if (typeof API_CONFIG === 'undefined') {
        console.error('❌ API_CONFIG no está definido');
        return;
    }
    
    if (typeof PersonaService === 'undefined') {
        console.error('❌ PersonaService no está definido');
        return;
    }
    
    console.log('✅ API_CONFIG encontrado:', API_CONFIG);
    console.log('✅ PersonaService encontrado');
    
    window.modalPerfil = new ModalPerfilController();
    console.log('✅ Modal de perfil inicializado correctamente');
});

// Función global para abrir el modal (por si se necesita desde otros scripts)
window.abrirModalPerfil = function(personaId) {
    if (window.modalPerfil) {
        window.modalPerfil.openModal(personaId);
    }
};