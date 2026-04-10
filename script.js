// Global Student Grade Calculator - Modern JavaScript

class GradeCalculator {
    constructor() {
        this.subjects = [];
        this.isDarkMode = false;
        this.commonSubjects = [
            'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English',
            'History', 'Geography', 'Computer Science', 'Economics', 'Art',
            'Music', 'Physical Education', 'Literature', 'Foreign Language'
        ];
        this.initializeEventListeners();
        this.addDefaultSubjects();
        this.loadTheme();
    }

    initializeEventListeners() {
        document.getElementById('add-subject').addEventListener('click', () => this.addSubject());
        document.getElementById('calculate-btn').addEventListener('click', () => this.calculate());
        document.getElementById('reset').addEventListener('click', () => this.reset());
        document.getElementById('theme-toggle').addEventListener('click', () => this.toggleTheme());
        document.getElementById('export-results').addEventListener('click', () => this.exportResults());

        // Use event delegation for dynamic elements
        document.getElementById('subjects-container').addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-subject') || e.target.closest('.remove-subject')) {
                const subjectId = e.target.dataset.id || e.target.closest('.remove-subject').dataset.id;
                if (subjectId) {
                    this.removeSubject(subjectId);
                }
            }
        });

        document.getElementById('subjects-container').addEventListener('input', (e) => {
            if (e.target.classList.contains('subject-name') ||
                e.target.classList.contains('subject-marks') ||
                e.target.classList.contains('subject-max')) {
                this.updateSubject(e);
            }
        });

        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'Enter':
                        e.preventDefault();
                        this.calculate();
                        break;
                    case 'r':
                        e.preventDefault();
                        this.reset();
                        break;
                    case 'n':
                        e.preventDefault();
                        this.addSubject();
                        break;
                }
            }
        });
    }

    addDefaultSubjects() {
        const defaultSubjects = ['Mathematics', 'Physics', 'Chemistry', 'English'];
        defaultSubjects.forEach(subject => this.addSubject(subject));
    }

    addSubject(subjectName = '') {
        const subjectId = Date.now() + Math.random();
        const subject = {
            id: subjectId,
            name: subjectName || this.getRandomSubject(),
            marks: '',
            maxMarks: 100
        };
        this.subjects.push(subject);
        this.renderSubjects();
    }

    getRandomSubject() {
        const availableSubjects = this.commonSubjects.filter(sub =>
            !this.subjects.some(s => s.name === sub)
        );
        return availableSubjects.length > 0
            ? availableSubjects[Math.floor(Math.random() * availableSubjects.length)]
            : `Subject ${this.subjects.length + 1}`;
    }

    removeSubject(subjectId) {
        this.subjects = this.subjects.filter(s => s.id !== subjectId);
        this.renderSubjects();
    }

    renderSubjects() {
        const container = document.getElementById('subjects-container');
        container.innerHTML = '';

        this.subjects.forEach(subject => {
            const subjectRow = document.createElement('div');
            subjectRow.className = 'subject-row';
            subjectRow.innerHTML = `
                <input type="text" class="form-control subject-name" placeholder="Subject Name"
                       value="${this.escapeHtml(subject.name)}" data-id="${subject.id}">
                <input type="number" class="form-control subject-marks" placeholder="Marks Obtained"
                       value="${subject.marks}" min="0" max="${subject.maxMarks}" step="0.1" data-id="${subject.id}">
                <input type="number" class="form-control subject-max" placeholder="Max Marks"
                       value="${subject.maxMarks}" min="1" step="0.1" data-id="${subject.id}">
                <button class="remove-subject" data-id="${subject.id}" title="Remove Subject">×</button>
            `;
            container.appendChild(subjectRow);
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    updateSubject(event) {
        const id = event.target.dataset.id;
        const subject = this.subjects.find(s => s.id == id);
        if (!subject) return;

        if (event.target.classList.contains('subject-name')) {
            subject.name = event.target.value.trim();
        } else if (event.target.classList.contains('subject-marks')) {
            const marks = parseFloat(event.target.value);
            subject.marks = isNaN(marks) ? '' : Math.max(0, marks);
        } else if (event.target.classList.contains('subject-max')) {
            const maxMarks = parseFloat(event.target.value);
            subject.maxMarks = isNaN(maxMarks) || maxMarks <= 0 ? 100 : maxMarks;
            // Update the max attribute of marks input
            event.target.previousElementSibling.max = subject.maxMarks;
            // Ensure marks don't exceed new max
            if (subject.marks > subject.maxMarks) {
                subject.marks = subject.maxMarks;
                event.target.previousElementSibling.value = subject.maxMarks;
            }
        }
    }

    calculate() {
        const resultsDiv = document.getElementById('results');
        resultsDiv.innerHTML = '';

        // Check if there are any subjects
        if (this.subjects.length === 0) {
            resultsDiv.innerHTML = `
                <div class="alert alert-warning">
                    <strong>Warning:</strong> Please add at least one subject to calculate results.
                </div>
            `;
            return;
        }

        // Validate inputs
        const invalidSubjects = this.subjects.filter(subject =>
            !subject.name.trim() ||
            subject.marks === '' ||
            isNaN(subject.marks) ||
            subject.marks < 0 ||
            subject.marks > subject.maxMarks ||
            subject.maxMarks <= 0
        );

        if (invalidSubjects.length > 0) {
            const errorMessages = [];
            invalidSubjects.forEach(subject => {
                if (!subject.name.trim()) errorMessages.push(`"${subject.name || 'Unnamed Subject'}" has no name`);
                if (subject.marks === '' || isNaN(subject.marks)) errorMessages.push(`"${subject.name}" has invalid marks`);
                if (subject.marks < 0) errorMessages.push(`"${subject.name}" has negative marks`);
                if (subject.marks > subject.maxMarks) errorMessages.push(`"${subject.name}" marks exceed maximum (${subject.marks}/${subject.maxMarks})`);
                if (subject.maxMarks <= 0) errorMessages.push(`"${subject.name}" has invalid maximum marks`);
            });

            resultsDiv.innerHTML = `
                <div class="alert alert-danger">
                    <strong>Please fix the following errors:</strong>
                    <ul class="mb-0 mt-2">
                        ${errorMessages.map(msg => `<li>${msg}</li>`).join('')}
                    </ul>
                </div>
            `;
            return;
        }

        try {
            // Calculate totals
            const totalObtained = this.subjects.reduce((sum, s) => sum + s.marks, 0);
            const totalMax = this.subjects.reduce((sum, s) => sum + s.maxMarks, 0);
            const percentage = (totalObtained / totalMax) * 100;

            // Calculate GPA (assuming 4.0 scale)
            const gpa = this.calculateGPA(percentage);

            // Determine grade
            const grade = this.getGrade(percentage);

        // Pass/Fail logic: 40% and above = PASS, below 40% = FAIL
        const passed = percentage >= 40;
            resultsDiv.innerHTML = `
                <div class="alert alert-info">
                    <h4 class="alert-heading">📊 Your Results</h4>
                    <hr>
                    <div class="row text-center">
                        <div class="col-md-3">
                            <h5>Total Marks</h5>
                            <p class="h3">${totalObtained.toFixed(1)} / ${totalMax.toFixed(1)}</p>
                        </div>
                        <div class="col-md-3">
                            <h5>Percentage</h5>
                            <p class="h3">${percentage.toFixed(2)}%</p>
                        </div>
                        <div class="col-md-3">
                            <h5>GPA</h5>
                            <p class="h3">${gpa.toFixed(2)}</p>
                        </div>
                        <div class="col-md-3">
                            <h5>Grade</h5>
                            <p class="h3"><span class="grade-badge grade-${grade}">${grade}</span></p>
                        </div>
                    </div>
                    <hr>
                    <p class="mb-0">
                        <strong>Status:</strong>
                        ${percentage >= 40 ? '<span class="text-success">🎉 Passed</span>' : '<span class="text-danger">❌ Failed</span>'}
                        <br><small class="text-muted">Pass threshold: 40% and above</small>
                    </p>
                </div>
                <div class="mt-3">
                    <h5>Subject-wise Breakdown:</h5>
                    <div class="table-responsive">
                        <table class="table table-striped">
                            <thead>
                                <tr>
                                    <th>Subject</th>
                                    <th>Marks</th>
                                    <th>Percentage</th>
                                    <th>Grade</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${this.subjects.map(s => {
                                    const subjectPercentage = (s.marks / s.maxMarks) * 100;
                                    const subjectGrade = this.getGrade(subjectPercentage);
                                    const subjectPassed = subjectPercentage >= 40;
                                    return `
                                        <tr>
                                            <td>${this.escapeHtml(s.name)}</td>
                                            <td>${s.marks.toFixed(1)}/${s.maxMarks.toFixed(1)}</td>
                                            <td>${subjectPercentage.toFixed(1)}%</td>
                                            <td><span class="grade-badge grade-${subjectGrade}">${subjectGrade}</span></td>
                                            <td>${subjectPassed ? '<span class="text-success">✅ Pass</span>' : '<span class="text-danger">❌ Fail</span>'}</td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Calculation error:', error);
            resultsDiv.innerHTML = `
                <div class="alert alert-danger">
                    <strong>Error:</strong> An unexpected error occurred during calculation. Please try again.
                </div>
            `;
        }
    }

    calculateGPA(percentage) {
        if (percentage >= 90) return 4.0;
        if (percentage >= 80) return 3.7;
        if (percentage >= 70) return 3.3;
        if (percentage >= 60) return 3.0;
        if (percentage >= 50) return 2.7;
        if (percentage >= 40) return 2.3;
        return 0.0;
    }

    getGrade(percentage) {
        if (percentage >= 90) return 'A+';
        if (percentage >= 80) return 'A';
        if (percentage >= 70) return 'B';
        if (percentage >= 60) return 'C';
        if (percentage >= 50) return 'D';
        if (percentage >= 40) return 'E';
        return 'F';
    }

    reset() {
        this.subjects = [];
        this.addDefaultSubjects();
        document.getElementById('results').innerHTML = '';
        document.getElementById('export-results').style.display = 'none';
        this.lastResults = null;
    }

    exportResults() {
        if (!this.lastResults) return;

        const { totalObtained, totalMax, percentage, gpa, grade, subjects, passed } = this.lastResults;

        const report = `
STUDENT GRADE REPORT
====================

SUMMARY:
--------
Total Marks: ${totalObtained.toFixed(1)} / ${totalMax.toFixed(1)}
Percentage: ${percentage.toFixed(2)}%
GPA: ${gpa.toFixed(2)}
Grade: ${grade}
Status: ${passed ? 'PASSED' : 'FAILED'} (Pass threshold: 40%)

SUBJECT BREAKDOWN:
------------------
${subjects.map(s => `${s.name}: ${s.marks.toFixed(1)}/${s.maxMarks.toFixed(1)} (${s.percentage.toFixed(1)}%) - Grade: ${s.grade}`).join('\n')}

Generated on: ${new Date().toLocaleString()}
        `.trim();

        // Create and download file
        const blob = new Blob([report], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `grade-report-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            this.enableDarkMode();
        }
    }

    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        if (this.isDarkMode) {
            this.enableDarkMode();
        } else {
            this.disableDarkMode();
        }
        localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    }

    enableDarkMode() {
        this.isDarkMode = true;
        document.body.classList.add('dark-mode');
        document.getElementById('theme-toggle').innerHTML = '☀️';
        document.getElementById('theme-toggle').title = 'Switch to Light Mode';
    }

    disableDarkMode() {
        this.isDarkMode = false;
        document.body.classList.remove('dark-mode');
        document.getElementById('theme-toggle').innerHTML = '🌙';
        document.getElementById('theme-toggle').title = 'Switch to Dark Mode';
    }
}

// Initialize the calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new GradeCalculator();
});