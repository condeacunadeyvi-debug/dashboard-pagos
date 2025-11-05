// Datos de ejemplo
let payments = [
    { person: 'maria', amount: 100, date: new Date(2023, 9, 15) },
    { person: 'patrick', amount: 50, date: new Date(2023, 9, 16) },
    { person: 'maria', amount: 75, date: new Date(2023, 9, 18) },
    { person: 'patrick', amount: 120, date: new Date(2023, 9, 20) }
];

let currentWeekOffset = 0;
let selectedPerson = 'maria';
let autoProcessEnabled = true;

// Cargar pagos desde localStorage
function loadPayments() {
    const savedPayments = localStorage.getItem('dashboardPayments');
    if (savedPayments) {
        payments = JSON.parse(savedPayments).map(p => ({
            ...p,
            date: new Date(p.date)
        }));
    }
}

// Guardar pagos en localStorage
function savePayments() {
    localStorage.setItem('dashboardPayments', JSON.stringify(payments));
}

// ✅ FUNCIÓN: Actualizar cuadro de Mi Pago automáticamente
function updateMyPayment() {
    const totalGeneral = payments.reduce((sum, p) => sum + p.amount, 0);
    const thirtyPercent = totalGeneral * 0.3;
    const remaining = totalGeneral - thirtyPercent;
    
    // Actualizar el cuadro principal
    document.getElementById('my-payment-amount').textContent = `S/${thirtyPercent.toFixed(2)}`;
    
    // Actualizar el desglose
    document.getElementById('breakdown-total').textContent = `S/${totalGeneral}`;
    document.getElementById('breakdown-percent').textContent = `S/${thirtyPercent.toFixed(2)}`;
    document.getElementById('breakdown-remaining').textContent = `S/${remaining.toFixed(2)}`;
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', function() {
    loadPayments();
    updateDashboard();
    setupEventListeners();
});

// ✅ CORREGIDO: Configurar arrastrar y soltar - VERSIÓN SIMPLIFICADA
function setupFileDrop() {
    const dropArea = document.getElementById('payment-notes');
    
    if (!dropArea) {
        console.error('❌ No se encontró el elemento payment-notes');
        return;
    }

    console.log('✅ Configurando área de arrastre para:', dropArea);

    // Prevenir comportamientos por defecto
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // Resaltar área de drop
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });

    function highlight(e) {
        console.log('📁 Drag over area');
        dropArea.classList.add('highlight');
        dropArea.style.backgroundColor = '#f0f8ff';
        dropArea.style.border = '2px dashed #3498db';
    }

    function unhighlight(e) {
        console.log('📁 Drag leave area');
        dropArea.classList.remove('highlight');
        dropArea.style.backgroundColor = '';
        dropArea.style.border = '';
    }

    // Manejar drop
    dropArea.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        console.log('📁 Archivo soltado');
        const dt = e.dataTransfer;
        const files = dt.files;

        console.log('Archivos detectados:', files.length);

        if (files.length > 0) {
            const file = files[0];
            console.log('Procesando archivo:', file.name, 'Tipo:', file.type);
            
            // Verificar que sea un archivo de texto
            if (file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt')) {
                console.log('✅ Archivo TXT válido');
                processDroppedFile(file);
            } else {
                console.log('❌ Archivo no es TXT');
                showAutoNotification('❌ Por favor, suelta solo archivos .txt');
            }
        }
    }
}

// ✅ NUEVA FUNCIÓN: Procesar archivo arrastrado
function processDroppedFile(file) {
    console.log('📁 Iniciando procesamiento de archivo arrastrado:', file.name);
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        console.log('✅ Archivo leído correctamente');
        const content = e.target.result;
        console.log('Contenido del archivo:', content);
        
        const lines = content.split('\n');
        let processedCount = 0;
        let errorCount = 0;
        
        console.log(`📝 Procesando ${lines.length} líneas...`);
        
        lines.forEach((line, index) => {
            if (line.trim()) {
                console.log(`Línea ${index + 1}: "${line.trim()}"`);
                if (processPaymentLine(line.trim())) {
                    processedCount++;
                    console.log(`✅ Línea ${index + 1} procesada correctamente`);
                } else {
                    errorCount++;
                    console.log(`❌ Error en línea ${index + 1}`);
                }
            }
        });
        
        // Actualizar la interfaz
        updateDashboard();
        
        // Mostrar resultados
        if (processedCount > 0) {
            const message = `✅ ${processedCount} pagos procesados desde ${file.name}`;
            console.log(message);
            showAutoNotification(message);
        } else {
            const message = '❌ No se pudieron procesar pagos. Verifica el formato del archivo.';
            console.log(message);
            showAutoNotification(message);
        }
    };
    
    reader.onerror = function(e) {
        console.error('❌ Error al leer el archivo:', e);
        showAutoNotification('❌ Error al leer el archivo');
    };
    
    reader.readAsText(file);
}

// ✅ FUNCIÓN: Mostrar notificación
function showAutoNotification(message) {
    // Eliminar notificación anterior si existe
    const existingNotification = document.querySelector('.auto-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = 'auto-notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #27ae60;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        z-index: 10000;
        font-weight: bold;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        max-width: 400px;
        word-wrap: break-word;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Auto-eliminar después de 5 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
}

function setupEventListeners() {
    console.log('🔄 Configurando event listeners...');
    
    // Botón para procesar pagos
    document.getElementById('process-btn').addEventListener('click', processPaymentNotes);
    
    // Botón para limpiar pagos
    document.getElementById('clear-btn').addEventListener('click', clearAllPayments);
    
    // Botón para restablecer datos de ejemplo
    document.getElementById('reset-btn').addEventListener('click', resetToExampleData);
    
    // Botón para calcular 30%
    document.getElementById('percent-btn').addEventListener('click', calculateThirtyPercent);
    
    // Botón para Mi Pago
    document.getElementById('mypayment-btn').addEventListener('click', calculateMyPayment);
    
    // Botón para descargar backup
    document.getElementById('backup-btn').addEventListener('click', downloadBackup);
    
    // Input para archivos TXT
    document.getElementById('txt-file').addEventListener('change', processTXTFile);
    
    // ✅ CONFIGURAR ARRASTRE - ¡ESTO ES CLAVE!
    setupFileDrop();
    
    // Selectores de persona
    document.querySelectorAll('.person-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.person-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            selectedPerson = this.getAttribute('data-person');
            updateCalendar();
        });
    });
    
    // Navegación de semanas
    document.getElementById('prev-week').addEventListener('click', function() {
        currentWeekOffset--;
        updateCalendar();
    });
    
    document.getElementById('next-week').addEventListener('click', function() {
        currentWeekOffset++;
        updateCalendar();
    });
    
    // Botón para cargar backup
    document.getElementById('load-backup-btn').addEventListener('click', function() {
        document.getElementById('backup-file').click();
    });
    
    // Input para cargar backup
    document.getElementById('backup-file').addEventListener('change', loadBackupFile);
    
    console.log('✅ Todos los event listeners configurados');
}

function processPaymentNotes() {
    const notes = document.getElementById('payment-notes').value;
    if (!notes.trim()) {
        showAutoNotification('❌ Por favor, ingresa algún texto para procesar');
        return;
    }
    
    console.log('📝 Procesando texto manual...');
    
    const lines = notes.split('\n');
    let processedCount = 0;
    
    lines.forEach(line => {
        if (line.trim()) {
            if (processPaymentLine(line.trim())) {
                processedCount++;
            }
        }
    });
    
    // Limpiar el área de texto
    document.getElementById('payment-notes').value = '';
    
    // Actualizar el dashboard
    updateDashboard();
    
    if (processedCount > 0) {
        console.log(`✅ ${processedCount} pagos procesados correctamente`);
        showAutoNotification(`✅ ${processedCount} pagos procesados correctamente`);
    } else {
        showAutoNotification('❌ No se pudieron procesar los pagos. Verifica el formato.');
    }
}

function clearAllPayments() {
    if (confirm('¿Estás seguro de que quieres eliminar TODOS los pagos? Esta acción no se puede deshacer.')) {
        payments = [];
        localStorage.removeItem('dashboardPayments');
        updateDashboard();
        console.log('✅ Todos los pagos han sido eliminados');
        showAutoNotification('✅ Todos los pagos han sido eliminados');
    }
}

function resetToExampleData() {
    if (confirm('¿Restablecer a los datos de ejemplo? Se perderán los datos actuales.')) {
        payments = [
            { person: 'maria', amount: 100, date: new Date(2023, 9, 15) },
            { person: 'patrick', amount: 50, date: new Date(2023, 9, 16) },
            { person: 'maria', amount: 75, date: new Date(2023, 9, 18) },
            { person: 'patrick', amount: 120, date: new Date(2023, 9, 20) }
        ];
        savePayments();
        updateDashboard();
        console.log('✅ Datos restablecidos a ejemplos');
        showAutoNotification('✅ Datos restablecidos a ejemplos');
    }
}

function calculateThirtyPercent() {
    const totalGeneral = payments.reduce((sum, p) => sum + p.amount, 0);
    const thirtyPercent = totalGeneral * 0.3;
    
    const percentResult = document.getElementById('percent-result');
    percentResult.innerHTML = `
        <div style="margin-bottom: 5px;">
            <span style="color: #27ae60;">Total General: S/${totalGeneral}</span>
        </div>
        <div style="font-size: 1.1rem; color: #27ae60; font-weight: bold;">
            30%: S/${thirtyPercent.toFixed(2)}
        </div>
    `;
    
    console.log(`30% calculado: S/${totalGeneral} → S/${thirtyPercent.toFixed(2)}`);
}

function calculateMyPayment() {
    const totalGeneral = payments.reduce((sum, p) => sum + p.amount, 0);
    const thirtyPercent = totalGeneral * 0.3;
    const remaining = totalGeneral - thirtyPercent;
    const myPayment = thirtyPercent;
    
    const percentResult = document.getElementById('percent-result');
    percentResult.innerHTML = `
        <div style="margin-bottom: 5px;">
            <span style="color: #27ae60;">Total General: S/${totalGeneral}</span>
        </div>
        <div style="margin-bottom: 5px;">
            <span style="color: #e74c3c;">30%: S/${thirtyPercent.toFixed(2)}</span>
        </div>
        <div style="margin-bottom: 5px;">
            <span style="color: #3498db;">Restante: S/${remaining.toFixed(2)}</span>
        </div>
        <div style="font-size: 1.1rem; color: #8e44ad; font-weight: bold;">
            💰 Mi Pago: S/${myPayment.toFixed(2)}
        </div>
    `;
    
    console.log(`Cálculo: S/${totalGeneral} - 30% (S/${thirtyPercent.toFixed(2)}) = S/${remaining.toFixed(2)} | Mi Pago: S/${myPayment.toFixed(2)}`);
}

function processPaymentLine(line) {
    console.log('Procesando línea:', line);
    
    let date = new Date();
    let amount, person;
    
    // Patrones mejorados para detectar pagos
    const patterns = [
        /(\d+)\s+(maria|patrick)/i,
        /(maria|patrick)\s+(\d+)/i,
        /(\d+)\s+(m|p)/i,
        /(m|p)\s+(\d+)/i
    ];
    
    let match = null;
    for (const pattern of patterns) {
        match = line.match(pattern);
        if (match) break;
    }
    
    if (match) {
        if (match[1] && (match[1].toLowerCase() === 'maria' || match[1].toLowerCase() === 'patrick' || match[1].toLowerCase() === 'm' || match[1].toLowerCase() === 'p')) {
            // Formato: persona cantidad
            person = match[1].toLowerCase();
            amount = parseInt(match[2]);
        } else {
            // Formato: cantidad persona
            amount = parseInt(match[1]);
            person = match[2].toLowerCase();
        }
        
        // Convertir m/p a nombres completos
        if (person === 'm') person = 'maria';
        if (person === 'p') person = 'patrick';
        
        console.log(`✅ Detectado: ${person} - S/${amount}`);
    } else {
        console.log('❌ No se pudo detectar monto y nombre');
        return false;
    }
    
    if (person && amount && !isNaN(amount) && amount > 0) {
        payments.push({
            person: person,
            amount: amount,
            date: date
        });
        savePayments();
        console.log(`✅ Pago registrado: ${person} - S/${amount} - ${date.toLocaleDateString()}`);
        return true;
    } else {
        console.log('❌ Datos incompletos o inválidos para registrar pago');
        return false;
    }
}

function processTXTFile(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    console.log('📁 Procesando archivo seleccionado:', file.name);
    processDroppedFile(file);
    
    // Limpiar el input
    event.target.value = '';
}

function downloadBackup() {
    try {
        const backupData = {
            payments: payments,
            exportDate: new Date().toISOString(),
            totalRecords: payments.length,
            version: '1.0'
        };
        
        const dataStr = JSON.stringify(backupData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `backup-pagos-${new Date().toISOString().split('T')[0]}.json`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
        
        console.log('✅ Backup descargado correctamente');
        showAutoNotification('✅ Backup descargado correctamente');
        
    } catch (error) {
        console.error('❌ Error al descargar backup:', error);
        showAutoNotification('❌ Error al descargar el backup');
    }
}

function loadBackupFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const backupData = JSON.parse(e.target.result);
            
            if (backupData.payments && Array.isArray(backupData.payments)) {
                if (confirm(`¿Cargar backup con ${backupData.payments.length} pagos? Se reemplazarán los datos actuales.`)) {
                    payments = backupData.payments.map(p => ({
                        ...p,
                        date: new Date(p.date)
                    }));
                    savePayments();
                    updateDashboard();
                    console.log('✅ Backup cargado correctamente');
                    showAutoNotification(`✅ Backup cargado: ${payments.length} pagos restaurados`);
                }
            } else {
                throw new Error('Formato de archivo inválido');
            }
        } catch (error) {
            console.error('❌ Error al cargar backup:', error);
            showAutoNotification('❌ Error: El archivo de backup no es válido');
        }
    };
    
    reader.readAsText(file);
    event.target.value = '';
}

// ✅ ACTUALIZADA: Función updateDashboard con Mi Pago
function updateDashboard() {
    updateTotals();
    updateCalendar();
    updatePaymentHistory();
    updateMyPayment(); // ← ¡AGREGA ESTA LÍNEA!
}

function updateTotals() {
    const totalMaria = payments
        .filter(p => p.person === 'maria')
        .reduce((sum, p) => sum + p.amount, 0);
        
    const totalPatrick = payments
        .filter(p => p.person === 'patrick')
        .reduce((sum, p) => sum + p.amount, 0);
    
    const totalGeneral = totalMaria + totalPatrick;
        
    document.getElementById('total-maria').textContent = `S/${totalMaria}`;
    document.getElementById('total-patrick').textContent = `S/${totalPatrick}`;
    document.getElementById('total-general').textContent = `S/${totalGeneral}`;
}

function updateCalendar() {
    const calendarEl = document.getElementById('calendar');
    calendarEl.innerHTML = '';
    
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1 + (currentWeekOffset * 7));
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    const options = { day: 'numeric', month: 'short' };
    document.getElementById('current-week').textContent = 
        `${startOfWeek.toLocaleDateString('es-ES', options)} - ${endOfWeek.toLocaleDateString('es-ES', options)}`;
    
    for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day';
        
        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = day.getDate();
        
        // Resaltar si es hoy
        if (isSameDay(day, new Date())) {
            dayNumber.style.backgroundColor = '#3498db';
            dayNumber.style.color = 'white';
        }
        
        dayEl.appendChild(dayNumber);
        
        const dayPayments = payments.filter(p => 
            p.person === selectedPerson && 
            isSameDay(p.date, day)
        );
        
        dayPayments.forEach(payment => {
            const paymentEl = document.createElement('div');
            paymentEl.className = `payment ${selectedPerson}`;
            paymentEl.textContent = `S/${payment.amount}`;
            dayEl.appendChild(paymentEl);
        });
        
        calendarEl.appendChild(dayEl);
    }
}

function updatePaymentHistory() {
    const historyEl = document.getElementById('payment-history');
    historyEl.innerHTML = '';
    
    const sortedPayments = [...payments].sort((a, b) => b.date - a.date);
    
    if (sortedPayments.length === 0) {
        historyEl.innerHTML = '<div style="text-align: center; color: #7f8c8d; padding: 20px;">No hay pagos registrados</div>';
        return;
    }
    
    sortedPayments.forEach(payment => {
        const paymentEl = document.createElement('div');
        paymentEl.className = 'payment-item';
        paymentEl.style.marginBottom = '10px';
        paymentEl.style.padding = '10px';
        paymentEl.style.backgroundColor = payment.person === 'maria' ? '#f0e6f6' : '#fdebd0';
        paymentEl.style.borderRadius = '5px';
        paymentEl.style.borderLeft = `4px solid ${payment.person === 'maria' ? '#9b59b6' : '#e67e22'}`;
        
        const personName = payment.person === 'maria' ? 'María' : 'Patrick';
        const dateStr = payment.date.toLocaleDateString('es-ES', { 
            weekday: 'short', 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
        
        paymentEl.innerHTML = `
            <div style="display: flex; justify-content: between; align-items: center;">
                <strong style="color: ${payment.person === 'maria' ? '#8e44ad' : '#d35400'}">${personName}</strong>
                <span style="margin-left: auto; font-weight: bold; color: #27ae60;">S/${payment.amount}</span>
            </div>
            <div style="font-size: 0.9em; color: #7f8c8d; margin-top: 5px;">${dateStr}</div>
        `;
        
        historyEl.appendChild(paymentEl);
    });
}

function isSameDay(date1, date2) {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
}

// Función para exportar a CSV
function exportToCSV() {
    if (payments.length === 0) {
        showAutoNotification('No hay datos para exportar');
        return;
    }
    
    const headers = ['Persona', 'Monto', 'Fecha'];
    const csvContent = [
        headers.join(','),
        ...payments.map(p => [
            p.person,
            p.amount,
            p.date.toISOString().split('T')[0]
        ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `pagos-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    URL.revokeObjectURL(url);
    
    showAutoNotification('✅ CSV exportado correctamente');
}

// ✅ Añadir CSS para el área de drop
const style = document.createElement('style');
style.textContent = `
    .highlight {
        background-color: #f0f8ff !important;
        border: 2px dashed #3498db !important;
        transition: all 0.3s ease;
    }
    
    #payment-notes {
        min-height: 100px;
        border: 2px solid #ddd;
        border-radius: 5px;
        padding: 10px;
        transition: all 0.3s ease;
    }
`;
document.head.appendChild(style);
// ✅ Actualizar contadores de pagos
function updatePaymentCounts() {
    const mariaCount = payments.filter(p => p.person === 'maria').length;
    const patrickCount = payments.filter(p => p.person === 'patrick').length;
    const totalCount = payments.length;
    
    document.getElementById('count-maria').textContent = `${mariaCount} pago${mariaCount !== 1 ? 's' : ''}`;
    document.getElementById('count-patrick').textContent = `${patrickCount} pago${patrickCount !== 1 ? 's' : ''}`;
    document.getElementById('count-total').textContent = `${totalCount} pago${totalCount !== 1 ? 's' : ''} totales`;
    document.getElementById('history-count').textContent = `${totalCount} pago${totalCount !== 1 ? 's' : ''}`;
}

// ✅ Actualizar última actualización
function updateLastUpdate() {
    const now = new Date();
    document.getElementById('last-update').textContent = now.toLocaleString('es-ES');
}

// ✅ Actualizar updateDashboard
function updateDashboard() {
    updateTotals();
    updateCalendar();
    updatePaymentHistory();
    updateMyPayment();
    updatePaymentCounts(); // ← Nueva función
    updateLastUpdate();    // ← Nueva función
}