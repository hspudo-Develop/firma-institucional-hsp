// === CONFIGURACIÓN DE APPS SCRIPT (CORREOS) ===
const UDO_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwTV4rOvjm_iSAAxW6nDbvagegJ2FvOq5JnKg4Hi2jSAfPeMLShA7jTTZ7fRE9KJyM/exec"; 

// BASE DE DATOS DE LA ESTRUCTURA JERÁRQUICA
const hospitalStructure = {
    "Dirección": ["Dirección"],
    "Subdirección": [
        "de Gestión y Desarrollo de las Personas",
        "de Gestión Administrativa",
        "de Gestión Clínica",
        "de Gestión del Cuidado",
        "de Gestión Apoyo Clínico"
    ],
    "Departamento": [
        "de Calidad y Seguridad de la Atención",
        "de Análisis Control de Gestión",
        "de Desarrollo Institucional y Puesta en Marcha"
    ],
    "Subdepartamento": [
        "de Gestión Operacional",
        "de Gestión Financiera",
        "de Seguridad y Salud en el trabajo",
        "de Ciclo de Vida Laboral",
        "de Calidad de Vida Laboral",
        "de Abastecimiento",
        "de Gestión de Pacientes",
        "de Gestión Química",
        "de Gestión Hospitalaria",
        "de Gestión Ambulatoria",
        "de Salud Mental"
    ]
};

// === 1. LÓGICA DE VISTA PREVIA EN TIEMPO REAL ===
document.addEventListener('DOMContentLoaded', () => {
    const udoDefaults = {
        'name': 'Nombre Apellido',
        'job': 'Cargo / Profesión',
        'unit': 'Unidad o Servicio',
        'anexo': '000000',
        'publica': '(+56) 51 2000000'
    };

    // 🟢 Quitamos 'email' de este array para que no busque un espacio en la firma visual
    ['name', 'job', 'unit', 'anexo', 'publica'].forEach(id => {
        const inputEl = document.getElementById(`udo-${id}`);
        const sigEl = document.getElementById(`udo-sig-${id}`);
        
        if (inputEl && sigEl) {
            inputEl.addEventListener('input', function() {
                const val = this.value.trim() || udoDefaults[id];
                sigEl.innerText = val;
            });
        }
    });

    const catSelect = document.getElementById('udo-category');
    const subSelect = document.getElementById('udo-subcategory');
    const sigDep = document.getElementById('udo-sig-department');

    if (catSelect && subSelect) {
        catSelect.addEventListener('change', function() {
            const cat = this.value;
            subSelect.innerHTML = '<option value="">Seleccione la unidad...</option>';
            
            if (cat && hospitalStructure[cat]) {
                subSelect.disabled = false;
                hospitalStructure[cat].forEach(sub => {
                    let opt = document.createElement('option');
                    let textValue = cat === "Dirección" ? cat : `${cat} ${sub}`;
                    opt.value = textValue;
                    opt.text = textValue;
                    subSelect.add(opt);
                });
            } else {
                subSelect.disabled = true;
            }
            sigDep.innerText = "Subdirección o Departamento";
        });

        subSelect.addEventListener('change', function() {
            sigDep.innerText = this.value || "Subdirección o Departamento";
        });
    }
});

// === 2. FUNCIÓN DE VALIDACIÓN MEJORADA ===
function validateRequiredFields() {
    const requiredFields = [
        { id: 'udo-name', invalidTexts: ['', 'nombre apellido'] },
        { id: 'udo-unit', invalidTexts: ['', 'unidad o servicio'] },
        { id: 'udo-job', invalidTexts: ['', 'cargo / profesión', 'cargo / profesion'] },
        { id: 'udo-category', invalidTexts: [''] },
        { id: 'udo-subcategory', invalidTexts: ['', 'seleccione la unidad...'] },
        { id: 'udo-anexo', invalidTexts: ['', '000000'] },
        { id: 'udo-publica', invalidTexts: ['', '(+56) 51 2000000'] }
    ];
    
    let isValid = true;
    let emailDomainError = false;

    function markError(element) {
        element.classList.add('udo-input-error');
        setTimeout(() => { element.classList.remove('udo-input-error'); }, 800);
    }

    requiredFields.forEach(field => {
        const inputEl = document.getElementById(field.id);
        if (inputEl) {
            const currentVal = inputEl.value.trim().toLowerCase();
            if (field.invalidTexts.includes(currentVal)) {
                isValid = false;
                markError(inputEl);
            }
        }
    });

    const emailEl = document.getElementById('udo-email');
    if (emailEl) {
        const emailVal = emailEl.value.trim().toLowerCase();
        const regexRedsalud = /^[^\s@]+@redsalud\.gob\.cl$/;
        
        if (emailVal === '' || 
            emailVal === 'correo@redsalud.gob.cl' || 
            emailVal === 'correo@hospitalcoquimbo.cl' || 
            !regexRedsalud.test(emailVal)) {
            
            isValid = false;
            emailDomainError = true;
            markError(emailEl);
        }
    }

    if (!isValid) {
        if (emailDomainError) {
            alert("⚠️ ¡Atención! El correo ingresado no es válido o no pertenece a la red. Debes escribir tu usuario seguido EXACTAMENTE de '@redsalud.gob.cl'.");
        } else {
            alert("⚠️ ¡Ups! Faltan datos o dejaste valores por defecto. Por favor, completa todos los campos con tus datos institucionales reales.");
        }
    }

    return isValid;
}

// === 3. FUNCIÓN PARA COPIAR AL PORTAPAPELES ===
function copyUDOSignature() {
    if (!validateRequiredFields()) return;

    const container = document.getElementById('udo-signature-content');
    const selection = window.getSelection();
    const range = document.createRange();
    
    range.selectNodeContents(container);
    selection.removeAllRanges();
    selection.addRange(range);
    
    try {
        document.execCommand('copy');
        const btn = document.getElementById('btnCopyUDO');
        if (btn) {
            btn.innerHTML = '✅ ¡Firma Copiada!';
            setTimeout(() => { btn.innerHTML = '📋 Copiar Firma'; }, 3000);
        }
    } catch (err) { 
        alert('Tu navegador bloquea el copiado automático. Selecciona la firma manualmente y presiona Ctrl+C.'); 
    }
    selection.removeAllRanges();
}

// === 4. FUNCIÓN PARA DESCARGAR EL ARCHIVO HTML ===
function downloadUDOSignature() {
    if (!validateRequiredFields()) return;

    const sName = document.getElementById('udo-sig-name').innerText;
    const sJob = document.getElementById('udo-sig-job').innerText;
    const sUnit = document.getElementById('udo-sig-unit').innerText;
    const sDepartment = document.getElementById('udo-sig-department').innerText;
    const sAnexo = document.getElementById('udo-sig-anexo').innerText;
    const sPublica = document.getElementById('udo-sig-publica').innerText;

    let fName = document.getElementById('udo-name').value.trim().replace(/ /g, '_');
    if (!fName) fName = 'Generada';

    const logoSrcUrl = "https://raw.githubusercontent.com/hspudo-Develop/Repo_IMG_HSP_Coquimbo/refs/heads/main/base_firma.png";

    const fullHTML = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>Firma Institucional Hospital San Pablo</title>
</head>
<body style="background:#ffffff; padding:20px; font-family: Arial, sans-serif;">
    <table cellpadding="0" cellspacing="0" border="0" style="font-family: Arial,  sans-serif; font-size: 14px; color: #333333; width: 100%; max-width: 550px; background-color: #ffffff;">
        <tr>
            <td style="vertical-align: middle; width: 130px;">
                <img src="${logoSrcUrl}" alt="Logo HSP" width="130" style="display: block; border: none; width: 130px; max-width: 130px;">
            </td>
            <td style="vertical-align: middle; padding: 0 15px; width: 4px;" width="4">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; background-color: #1167a4; width: 4px;" width="4">
                    <tr>
                        <td style="width: 4px; height: 110px; background-color: #1167a4; font-size: 0px; line-height: 0px; mso-line-height-rule: exactly;" width="4">&nbsp;</td>
                    </tr>
                </table>
            </td>
            <td style="vertical-align: middle; line-height: 1.15;">
                <strong style="font-family: Arial, sans-serif; font-weight: 900; color: #a0a09f; font-size: 18px; margin: 0; padding: 0;">${sName}</strong><br>
                <span style="color:"font-family: Arial, sans-serif; #a0a09f; font-size: 12px; margin: 0; padding: 0;">${sJob}</span><br>
                <span style="color:"font-family: Arial, sans-serif; #a0a09f; font-size: 12px; margin: 0; padding: 0;">${sUnit}</span><br>
                <span style="color:"font-family: Arial, sans-serif; #a0a09f; font-size: 12px; margin: 0; padding: 0;">${sDepartment}</span><br>
                <div style="height: 8px; line-height: 8px; font-size: 8px; margin: 0; padding: 0;">&nbsp;</div>
                <span style="font-family: Arial, sans-serif;"font-size: 10px; color: #a0a09f; line-height: 1.35;">
                    <strong style="font-family: Arial, sans-serif;"color: #a0a09f;">Red Minsal:</strong> ${sAnexo} / <strong style="font-family: Arial, sans-serif;"color: #a0a09f;">Red Pública:</strong> ${sPublica}<br>
                    <span style="font-family: Arial, sans-serif;"color: #a0a09f; font-size: 10px; line-height: 1.35;">Av. Videla S/N, Coquimbo.</span>
                    <div style="height: 1px; line-height: 1px; font-size: 1px; margin: 0; padding: 0;">&nbsp;</div>
                    <a href="https://www.hospitalcoquimbo.cl" target="_blank" style="font-family: Arial, sans-serif;"color: #F6b01c; text-decoration: none; font-weight: bold; font-style: italic;">www.hospitalcoquimbo.cl</a><br>
                </span>
            </td>
        </tr>
    </table>
</body>
</html>`;

    const blob = new Blob([fullHTML], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; 
    a.download = `Firma_HSP_${fName}.html`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
}

// === 5. DESCARGAR COMO IMAGEN (.PNG) - FIJADO CON CLON FLUIDO ===
function downloadSignatureAsImage() {
    if (!validateRequiredFields()) return;

    const btn = document.getElementById('btnImageUDO');
    const origText = btn ? btn.innerHTML : '🖼️ Descargar Imagen';
    if (btn) { btn.innerHTML = '⏳ Generando Imagen...'; btn.disabled = true; }

    const container = document.getElementById('udo-signature-content');
    let fName = document.getElementById('udo-name').value.trim().replace(/ /g, '_');
    if (!fName) fName = 'Institucional';

    try {
        // Clonamos la firma a una zona fantasma para burlar los estilos tridimensionales de la lupa
        const clone = container.cloneNode(true);
        clone.style.position = 'absolute';
        clone.style.top = '-9999px';
        clone.style.left = '-9999px';
        clone.style.transform = 'none';
        clone.style.transition = 'none';

        // --- ENFORZAMIENTO DE ANCHO FIJO EXCLUSIVO PARA LA EXPORTACIÓN ---
        clone.style.width = '550px';
        const cloneTable = clone.querySelector('table');
        if (cloneTable) {
            cloneTable.style.width = '550px';
        }
        // -----------------------------------------------------------------

        document.body.appendChild(clone);

        html2canvas(clone, { scale: 2, useCORS: true, allowTaint: false, backgroundColor: "#ffffff" }).then(canvas => {
            document.body.removeChild(clone); // Limpieza inmediata

            const imageURL = canvas.toDataURL("image/png", 1.0);
            const a = document.createElement('a');
            a.href = imageURL; a.download = `Firma_HSP_${fName}.png`;
            document.body.appendChild(a); a.click(); document.body.removeChild(a);

            if (btn) {
                btn.innerHTML = '✅ Imagen Descargada'; 
                btn.style.backgroundColor = '#28a745';
                btn.style.color = '#ffffff';
                btn.style.borderColor = '#28a745';
                setTimeout(() => { 
                    btn.innerHTML = origText; 
                    btn.style.backgroundColor = ''; 
                    btn.style.color = '';
                    btn.style.borderColor = '';
                    btn.disabled = false; 
                }, 3000);
            }
        });
    } catch (error) {
        console.error("Error al generar imagen:", error);
        if (btn) { btn.innerHTML = origText; btn.disabled = false; }
    }
}

// === 6. FUNCIÓN PARA LIMPIAR EL FORMULARIO ===
function clearUDOForm() {
    const udoDefaults = { 'name': 'Nombre Apellido', 'job': 'Cargo / Profesión', 'unit': 'Unidad o Servicio', 'anexo': '000000', 'publica': '(+56) 51 2000000', 'email': 'correo@redsalud.gob.cl' };

    ['name', 'job', 'unit', 'anexo', 'publica', 'email'].forEach(id => {
        const inputEl = document.getElementById(`udo-${id}`);
        const sigEl = document.getElementById(`udo-sig-${id}`);
        if (inputEl) inputEl.value = ''; 
        if (sigEl) sigEl.innerText = udoDefaults[id]; 
    });

    const catSelect = document.getElementById('udo-category');
    const subSelect = document.getElementById('udo-subcategory');
    const sigDep = document.getElementById('udo-sig-department');

    if (catSelect) catSelect.value = '';
    if (subSelect) { subSelect.innerHTML = '<option value="">Primero seleccione la categoría...</option>'; subSelect.disabled = true; }
    if (sigDep) sigDep.innerText = 'Subdirección o Departamento';
}

// === 7. FUNCIÓN PARA ENVIAR POR CORREO - FIJADO CON CLON FLUIDO ===
async function sendUDOToEmail() {
    if (validateRequiredFields() === false) return;

    if (!UDO_SCRIPT_URL || UDO_SCRIPT_URL.trim() === "") return alert("⚠️ La URL de Apps Script está vacía.");

    const userEmail = document.getElementById('udo-email').value.trim();
    const userName = document.getElementById('udo-name').value.trim();
    const btn = document.getElementById('btnEmailUDO');
    const origText = btn ? btn.innerHTML : '✉️ Enviar a mi Correo';
    if (btn) { btn.innerHTML = '⏳ Generando y enviando...'; btn.disabled = true; }
    
    const container = document.getElementById('udo-signature-content');

    try {
        // Clonamos la firma a una zona fantasma para burlar los estilos tridimensionales de la lupa
        const clone = container.cloneNode(true);
        clone.style.position = 'absolute';
        clone.style.top = '-9999px';
        clone.style.left = '-9999px';
        clone.style.transform = 'none';
        clone.style.transition = 'none';

        // --- ENFORZAMIENTO DE ANCHO FIJO EXCLUSIVO PARA EL CORREO ---
        clone.style.width = '550px';
        const cloneTable = clone.querySelector('table');
        if (cloneTable) {
            cloneTable.style.width = '550px';
        }
        // Extraemos el contenido HTML calibrado a 550px del clon para inyectarlo en el JSON
        const firmaCalibradaParaCorreo = clone.innerHTML;
        // -------------------------------------------------------------

        document.body.appendChild(clone);

        const canvas = await html2canvas(clone, { scale: 2, useCORS: true, allowTaint: false, backgroundColor: "#ffffff" });
        document.body.removeChild(clone); // Limpieza inmediata

        const imageBase64 = canvas.toDataURL("image/png", 1.0);

        const response = await fetch(UDO_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({ email: userEmail, name: userName, html: firmaCalibradaParaCorreo, image: imageBase64 }),
            headers: { 'Content-Type': 'text/plain;charset=utf-8' }
        });
        
        const result = await response.json();
        if (result.status === 'success') { 
            if (btn) { 
                btn.innerHTML = '✅ ¡Correo Enviado!'; 
                btn.style.backgroundColor = '#28a745'; 
                btn.style.color = '#ffffff';
            }
        } else throw new Error(result.message);
    } catch (e) { 
        console.error("Error:", e);
        if (btn) btn.innerHTML = '❌ Falló el envío (Error de Red)'; 
    }
    if (btn) { 
        setTimeout(() => { 
            btn.innerHTML = origText; 
            btn.style.backgroundColor = ''; 
            btn.style.color = '';
            btn.disabled = false; 
        }, 4000); 
    }
}

// === 8. FUNCIONES DEL POP-UP DE AYUDA (SISTEMA DE CLASES CORREGIDO) ===
function openHelpModal() { 
    document.getElementById('udoHelpModal').classList.add('udo-modal-open'); 
}
function closeHelpModal() { 
    document.getElementById('udoHelpModal').classList.remove('udo-modal-open'); 
}

// Cierre al hacer clic en el fondo oscuro del modal de ayuda
window.addEventListener('click', function(event) {
    const modal = document.getElementById('udoHelpModal');
    if (event.target === modal) closeHelpModal();
});

// === 9. CONTROL DEL VISOR DE LUPA DE LA FIRMA ===
function toggleUDOZoom(isOpen) {
    const previewBox = document.querySelector('.udo-preview-box');
    if (previewBox) {
        if (isOpen) {
            previewBox.classList.add('udo-zoom-active');
        } else {
            previewBox.classList.remove('udo-zoom-active');
        }
    }
}

// Escudo de cierre inteligente al hacer clic en el fondo esmerilado del visor
document.addEventListener('DOMContentLoaded', () => {
    const previewBox = document.querySelector('.udo-preview-box');
    if (previewBox) {
        previewBox.addEventListener('click', function(e) {
            if (previewBox.classList.contains('udo-zoom-active') && e.target === previewBox) {
                toggleUDOZoom(false);
            }
        });
    }
});

// === 10. FUNCIONES DEL POP-UP DE AYUDA Y SUB-MODALS INDIVIDUALES ===
function openHelpModal() { 
    document.getElementById('udoHelpModal').classList.add('udo-modal-open'); 
}
function closeHelpModal() { 
    document.getElementById('udoHelpModal').classList.remove('udo-modal-open'); 
}

// Control dinámico de apertura y cierre para los sub-modals de errores comunes
function openErrorModal(type) {
    if (type === 'logo') document.getElementById('udoErrorLogoModal').classList.add('udo-modal-open');
    if (type === 'order') document.getElementById('udoErrorOrderModal').classList.add('udo-modal-open');
    if (type === 'delivery') document.getElementById('udoErrorDeliveryModal').classList.add('udo-modal-open');
}

function closeErrorModal(type) {
    if (type === 'logo') document.getElementById('udoErrorLogoModal').classList.remove('udo-modal-open');
    if (type === 'order') document.getElementById('udoErrorOrderModal').classList.remove('udo-modal-open');
    if (type === 'delivery') document.getElementById('udoErrorDeliveryModal').classList.remove('udo-modal-open');
}

// Escudo global: Cierra el modal correspondiente si el usuario hace clic afuera en el fondo esmerilado
window.addEventListener('click', function(event) {
    const mainHelpModal = document.getElementById('udoHelpModal');
    if (event.target === mainHelpModal) closeHelpModal();
    
    const logoModal = document.getElementById('udoErrorLogoModal');
    if (event.target === logoModal) closeErrorModal('logo');
    
    const orderModal = document.getElementById('udoErrorOrderModal');
    if (event.target === orderModal) closeErrorModal('order');
    
    const deliveryModal = document.getElementById('udoErrorDeliveryModal');
    if (event.target === deliveryModal) closeErrorModal('delivery');
});
