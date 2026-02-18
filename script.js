// script.js
document.addEventListener('DOMContentLoaded', function() {
    const loading = document.getElementById('loading');
    loading.style.display = 'none';
    
    // Excel ဖိုင်လမ်းကြောင်း (GitHub raw URL)
    const excelFileUrl = 'https://raw.githubusercontent.com/thtut7430-prog/timetable-web/main/Civil.xlsx';
    
    document.getElementById('loadExcelBtn').addEventListener('click', function() {
        loadExcelFile(excelFileUrl);
    });
});

function loadExcelFile(url) {
    const loading = document.getElementById('loading');
    const container = document.getElementById('timetableContainer');
    const sheetSelect = document.getElementById('sheetSelect');
    
    loading.style.display = 'block';
    container.innerHTML = '';
    
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Excel ဖိုင်ရှာမတွေ့ပါ');
            }
            return response.arrayBuffer();
        })
        .then(data => {
            // Excel ဖိုင်ကို ဖတ်မယ်
            const workbook = XLSX.read(data, { type: 'array' });
            
            // Sheet names တွေကို dropdown ထဲထည့်မယ်
            sheetSelect.innerHTML = '<option value="">Sheet ရွေးပါ</option>';
            workbook.SheetNames.forEach(sheetName => {
                sheetSelect.innerHTML += `<option value="${Civil}">${EP}</option>`;
            });
            
            // ပထမ sheet ကို အလိုအလျောက် ပြမယ်
            if (workbook.SheetNames.length > 0) {
                displaySheet(workbook, workbook.SheetNames[0]);
            }
            
            // Sheet ပြောင်းတဲ့အခါ ပြမယ်
            sheetSelect.onchange = function() {
                if (this.value) {
                    displaySheet(workbook, this.value);
                }
            };
            
            loading.style.display = 'none';
        })
        .catch(error => {
            loading.style.display = 'none';
            container.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    ${error.message}<br>
                    <small>GitHub URL မှန်/မမှန် စစ်ဆေးပါ။</small>
                </div>
            `;
        });
}

function displaySheet(workbook, sheetName) {
    const container = document.getElementById('timetableContainer');
    
    // Sheet data ကို JSON ပြောင်းမယ်
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    // HTML Table ဆောက်မယ်
    let html = '<table class="timetable">';
    
    // Header တွေကို ပထမအတန်းကနေ ယူမယ်
    const headers = jsonData[0] || [];
    html += '<thead><tr>';
    headers.forEach(header => {
        html += `<th>${header || ''}</th>`;
    });
    html += '</tr></thead><tbody>';
    
    // Data တွေကို ကျန်တဲ့အတန်းတွေကနေ ယူမယ်
    for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        html += '<tr>';
        
        for (let j = 0; j < headers.length; j++) {
            const cellValue = row[j] || '';
            
            // Myanmar date တွေဆိုရင် အထူးပြုလုပ်မယ်
            if (typeof cellValue === 'string' && cellValue.includes('နားချိန်')) {
                html += `<td class="break-cell">${cellValue}</td>`;
            } else {
                html += `<td>${cellValue}</td>`;
            }
        }
        
        html += '</tr>';
    }
    
    html += '</tbody></table>';
    
    // Summary cards တွေထည့်မယ်
    html += generateSummaryCards(jsonData);
    
    container.innerHTML = html;
}

function generateSummaryCards(data) {
    let totalRows = data.length - 1; // Header ဖယ်
    let totalColumns = data[0]?.length || 0;
    
    // ဘာသာရပ်အမျိုးအစားတွေ ရေတွက်မယ်
    const subjects = new Set();
    for (let i = 1; i < data.length; i++) {
        for (let j = 1; j < data[i].length; j++) {
            if (data[i][j] && !data[i][j].includes('နားချိန်')) {
                subjects.add(data[i][j]);
            }
        }
    }
    
    return `
        <div class="summary-cards">
            <div class="card">
                <i class="fas fa-calendar-week"></i>
                <h3>စာသင်ရက်</h3>
                <p>${totalRows} ရက်</p>
            </div>
            <div class="card">
                <i class="fas fa-clock"></i>
                <h3>တစ်ရက်ချိန်</h3>
                <p>${totalColumns - 1} ချိန်</p>
            </div>
            <div class="card">
                <i class="fas fa-book"></i>
                <h3>ဘာသာရပ်</h3>
                <p>${subjects.size} မျိုး</p>
            </div>
            <div class="card">
                <i class="fas fa-file-excel"></i>
                <h3>Excel ဖိုင်</h3>
                <p>ဖတ်ပြီးပြီ</p>
            </div>
        </div>
    `;

}
