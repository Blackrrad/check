let students = [];
let attendance = {};

// โหลดข้อมูルเมื่อเริ่มต้น
loadData();

function addStudent() {
    const name = document.getElementById('studentName').value.trim();
    const id = document.getElementById('studentId').value.trim();

    if (!name || !id) {
        alert('กรุณากรอกข้อมูลให้ครบถ้วน');
        return;
    }

    if (students.find(s => s.id === id)) {
        alert('รหัสนักศึกษานี้มีอยู่แล้ว');
        return;
    }

    students.push({ id, name });
    attendance[id] = null;

    document.getElementById('studentName').value = '';
    document.getElementById('studentId').value = '';

    updateDisplay();
    saveData();
    
    // เพิ่มแอนิเมชัน
    setTimeout(() => {
        const newItem = document.querySelector(`[data-student-id="${id}"]`);
        if (newItem) {
            newItem.style.transform = 'scale(1.05)';
            setTimeout(() => {
                newItem.style.transform = 'scale(1)';
            }, 200);
        }
    }, 100);
}

function checkAttendance() {
    const id = document.getElementById('checkStudentId').value.trim();
    const status = document.getElementById('attendanceStatus').value;

    if (!id) {
        alert('กรุณากรอกรหัสนักศึกษา');
        return;
    }

    const student = students.find(s => s.id === id);
    if (!student) {
        alert('ไม่พบนักศึกษารหัสนี้');
        return;
    }

    attendance[id] = status;
    document.getElementById('checkStudentId').value = '';

    updateDisplay();
    saveData();

    // แสดงข้อความยืนยัน
    const statusText = {
        'present': 'มาเรียน',
        'absent': 'ขาดเรียน',
        'late': 'มาสาย'
    };
    
    // สร้างการแจ้งเตือนแบบ toast
    showToast(`เช็คชื่อ ${student.name} (${id}) - ${statusText[status]}`);
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4facfe;
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        z-index: 1001;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        animation: slideIn 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function updateDisplay() {
    const list = document.getElementById('studentList');
    list.innerHTML = '';

    students.forEach(student => {
        const status = attendance[student.id];
        const statusClass = status || 'absent';
        const statusText = {
            'present': 'มาเรียน',
            'absent': 'ยังไม่เช็คชื่อ',
            'late': 'มาสาย'
        };

        const item = document.createElement('div');
        item.className = 'student-item';
        item.setAttribute('data-student-id', student.id);
        item.innerHTML = `
            <div class="student-info">
                <div class="student-name">${student.name}</div>
                <div class="student-id">รหัส: ${student.id}</div>
            </div>
            <div class="attendance-status ${statusClass}">
                ${statusText[status] || statusText['absent']}
            </div>
            <button class="btn btn-danger" onclick="removeStudent('${student.id}')">ลบ</button>
        `;
        list.appendChild(item);
    });

    updateStats();
}

function updateStats() {
    const total = students.length;
    const present = Object.values(attendance).filter(s => s === 'present').length;
    const absent = Object.values(attendance).filter(s => s === 'absent').length;
    const late = Object.values(attendance).filter(s => s === 'late').length;
    const notChecked = total - present - absent - late;

    document.getElementById('totalStudents').textContent = total;
    document.getElementById('presentCount').textContent = present;
    document.getElementById('absentCount').textContent = absent + notChecked;
    document.getElementById('lateCount').textContent = late;
}

function removeStudent(id) {
    if (confirm('คุณแน่ใจหรือไม่ที่จะลบนักศึกษาคนนี้?')) {
        students = students.filter(s => s.id !== id);
        delete attendance[id];
        updateDisplay();
        saveData();
    }
}

function clearAllStudents() {
    if (confirm('คุณแน่ใจหรือไม่ที่จะล้างข้อมูลทั้งหมด?')) {
        students = [];
        attendance = {};
        updateDisplay();
        saveData();
    }
}

function showAddBulkModal() {
    document.getElementById('bulkAddModal').style.display = 'block';
}

function closeBulkModal() {
    document.getElementById('bulkAddModal').style.display = 'none';
}

function addBulkStudents() {
    const data = document.getElementById('bulkStudentData').value.trim();
    if (!data) {
        alert('กรุณากรอกข้อมูลนักศึกษา');
        return;
    }

    const lines = data.split('\n');
    let added = 0;

    lines.forEach(line => {
        const parts = line.split(',');
        if (parts.length >= 2) {
            const id = parts[0].trim();
            const name = parts[1].trim();
            
            if (id && name && !students.find(s => s.id === id)) {
                students.push({ id, name });
                attendance[id] = null;
                added++;
            }
        }
    });

    if (added > 0) {
        updateDisplay();
        saveData();
        closeBulkModal();
        showToast(`เพิ่มนักศึกษาสำเร็จ ${added} คน`);
    } else {
        alert('ไม่สามารถเพิ่มนักศึกษาได้');
    }

    document.getElementById('bulkStudentData').value = '';
}

function exportToCSV() {
    if (students.length === 0) {
        alert('ไม่มีข้อมูลนักศึกษา');
        return;
    }

    let csv = 'รหัสนักศึกษา,ชื่อ-นามสกุล,สถานะ\n';
    
    students.forEach(student => {
        const status = attendance[student.id];
        const statusText = {
            'present': 'มาเรียน',
            'absent': 'ขาดเรียน',
            'late': 'มาสาย'
        };
        csv += `${student.id},${student.name},${statusText[status] || 'ยังไม่เช็คชื่อ'}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `รายชื่อนักศึกษา_${new Date().toLocaleDateString('th-TH')}.csv`;
    link.click();
}

function printReport() {
    const printWindow = window.open('', '_blank');
    let content = `
        <html>
        <head>
            <title>รายงานการเช็คชื่อนักศึกษา</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                .header { text-align: center; margin-bottom: 20px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>รายงานการเช็คชื่อนักศึกษา</h1>
                <p>วันที่: ${new Date().toLocaleDateString('th-TH')}</p>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>รหัสนักศึกษา</th>
                        <th>ชื่อ-นามสกุล</th>
                        <th>สถานะ</th>
                    </tr>
                </thead>
                <tbody>
    `;

    students.forEach(student => {
        const status = attendance[student.id];
        const statusText = {
            'present': 'มาเรียน',
            'absent': 'ขาดเรียน',
            'late': 'มาสาย'
        };
        content += `
            <tr>
                <td>${student.id}</td>
                <td>${student.name}</td>
                <td>${statusText[status] || 'ยังไม่เช็คชื่อ'}</td>
            </tr>
        `;
    });

    content += `
                </tbody>
            </table>
        </body>
        </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
}

function saveData() {
    const data = {
        students: students,
        attendance: attendance
    };
    try {
        localStorage.setItem('attendanceData', JSON.stringify(data));
    } catch (e) {
        console.log('ไม่สามารถบันทึกข้อมูลได้');
    }
}

function loadData() {
    try {
        const data = localStorage.getItem('attendanceData');
        if (data) {
            const parsed = JSON.parse(data);
            students = parsed.students || [];
            attendance = parsed.attendance || {};
        }
    } catch (e) {
        console.log('ไม่สามารถโหลดข้อมูลได้');
    }
    updateDisplay();
}

// ปิด modal เมื่อคลิกนอกพื้นที่
window.onclick = function(event) {
    const modal = document.getElementById('bulkAddModal');
    if (event.target === modal) {
        closeBulkModal();
    }
}

// เช็คชื่อด้วย Enter
document.getElementById('checkStudentId').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        checkAttendance();
    }
});

// เพิ่มนักศึกษาด้วย Enter
document.getElementById('studentId').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addStudent();
    }
});