// Datos de ejemplo
let payments = [
    { person: 'maria', amount: 100, date: new Date(2023, 9, 15) },
    { person: 'patrick', amount: 50, date: new Date(2023, 9, 16) },
    { person: 'maria', amount: 75, date: new Date(2023, 9, 18) },
    { person: 'patrick', amount: 120, date: new Date(2023, 9, 20) }
];

let currentWeekOffset = 0;
let selectedPerson = 'maria';

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', function() {
    updateDashboard();
    setupEventListeners();
});

function setupEventListeners() {
    // Botón para procesar pagos
    document.getElementById('process-btn').addEventListener('click', processPaymentNotes);
    
    // Botón para limpiar pagos
    document.getElementById('clear-btn').addEventListener('click', clearAllPayments);
    
    // Botón para restablecer datos de ejemplo
    document.getElementById('reset-btn').addEventListener('click', resetToExampleData);
    
    // Botón para calcular 30%
    document.getElementById('percent-btn').addEventListener('click', calculateThirtyPercent);
    
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
}

function processPaymentNotes() {
    const notes = document.getElementById('payment-notes').value;
    if (!notes.trim()) return;
    
    const lines = notes.split('\n');
    lines.forEach(line => {
        processPaymentLine(line);
    });
    
    // Limpiar el área de texto
    document.getElementById('payment-notes').value = '';
    
    // Actualizar el dashboard
    updateDashboard();
}

function clearAllPayments() {
    if (confirm('¿Estás seguro de que quieres eliminar TODOS los pagos? Esta acción no se puede deshacer.')) {
        payments = [];
        updateDashboard();
        console.log('✅ Todos los pagos han sido eliminados');
        alert('Todos los pagos han sido eliminados');
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
        updateDashboard();
        console.log('✅ Datos restablecidos a ejemplos');
        alert('Datos restablecidos a ejemplos');
    }
}

function calculateThirtyPercent() {
    const totalGeneral = payments.reduce((sum, p) => sum + p.amount, 0);
    const thirtyPercent = totalGeneral * 0.3;
    
    const percentResult = document.getElementById('percent-result');
    percentResult.innerHTML = `
        <div>30% del Total:</div>
        <div style="font-size: 1.2rem;">S/${thirtyPercent.toFixed(2)}</div>
    `;
    
    console.log(`30% calculado: S/${totalGeneral} → S/${thirtyPercent.toFixed(2)}`);
}

function processPaymentLine(line) {
    console.log('Procesando línea:', line);
    
    // Siempre usa fecha de hoy por ahora (para simplificar)
    let date = new Date();
    console.log('Fecha: hoy');
    
    // Buscar patrones: "88 maria" o "maria 88"
    let amount, person;
    
    // Buscar: número seguido de nombre
    const pattern1 = /(\d+)\s+(maria|patrick)/i;
    // Buscar: nombre seguido de número  
    const pattern2 = /(maria|patrick)\s+(\d+)/i;
    
    let match = line.match(pattern1) || line.match(pattern2);
    
    if (match) {
        if (pattern1.test(line)) {
            // Formato: "88 maria"
            amount = parseInt(match[1]);
            person = match[2].toLowerCase();
        } else {
            // Formato: "maria 88"  
            person = match[1].toLowerCase();
            amount = parseInt(match[2]);
        }
        console.log(`✅ Detectado: ${person} - S/${amount}`);
    } else {
        console.log('❌ No se pudo detectar monto y nombre');
    }
    
    // Si tenemos todos los datos, agregar el pago
    if (person && amount && date) {
        payments.push({
            person: person,
            amount: amount,
            date: date
        });
        console.log(`✅ Pago registrado: ${person} - S/${amount} - ${date.toLocaleDateString()}`);
        return true;
    } else {
        console.log('❌ Datos incompletos para registrar pago');
        return false;
    }
}

function updateDashboard() {
    updateTotals();
    updateCalendar();
    updatePaymentHistory();
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
    
    // Obtener la fecha de inicio de la semana actual
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1 + (currentWeekOffset * 7)); // Lunes como inicio de semana
    
    // Actualizar el texto de la semana actual
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    const options = { day: 'numeric', month: 'short' };
    document.getElementById('current-week').textContent = 
        `${startOfWeek.toLocaleDateString('es-ES', options)} - ${endOfWeek.toLocaleDateString('es-ES', options)}`;
    
    // Generar los días del calendario
    for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day';
        
        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = day.getDate();
        dayEl.appendChild(dayNumber);
        
        // Mostrar pagos para este día y persona seleccionada
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
    
    // Ordenar pagos por fecha (más reciente primero)
    const sortedPayments = [...payments].sort((a, b) => b.date - a.date);
    
    sortedPayments.forEach(payment => {
        const paymentEl = document.createElement('div');
        paymentEl.className = 'payment-item';
        paymentEl.style.marginBottom = '10px';
        paymentEl.style.padding = '10px';
        paymentEl.style.backgroundColor = payment.person === 'maria' ? '#f0e6f6' : '#fdebd0';
        paymentEl.style.borderRadius = '5px';
        
        const personName = payment.person === 'maria' ? 'María' : 'Patrick';
        const dateStr = payment.date.toLocaleDateString('es-ES');
        
        paymentEl.innerHTML = `
            <strong>${personName}</strong> - S/${payment.amount} - ${dateStr}
        `;
        
        historyEl.appendChild(paymentEl);
    });
}

function isSameDay(date1, date2) {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
}