// simulator.js - Interactive Step-by-Step Practice Simulator
// This module replaces the calculator-style analyzeVectors flow with a guided practice wizard.

// ===== Simulator State =====
let simState = {
    active: false,
    currentStep: 0,
    totalSteps: 0,
    score: 0,
    maxScore: 0,
    steps: [],
    correctAnswers: {},
    completed: false,
    attemptsPerStep: {}
};

// ===== Step Definitions =====
function buildSteps(results) {
    const steps = [
        {
            id: 'form-matrix',
            title: 'Step 1: Form the Matrix',
            subtitle: 'Arrange vectors as rows of a matrix',
            instruction: 'Place the given vectors as <strong>rows</strong> of a matrix. Enter each element in the grid below.',
            type: 'matrix',
            marks: 2,
            hint: 'Each vector becomes one row of the matrix. The first vector\'s components go in the first row, the second vector in the second row, and so on.',
            correctValue: vectors.map(v => [...v])
        },
        {
            id: 'row-echelon',
            title: 'Step 2: Row Echelon Form (REF)',
            subtitle: 'Apply row operations to reduce the matrix',
            instruction: 'Reduce the matrix to <strong>Row Echelon Form</strong> using elementary row operations. Enter the resulting matrix below. <em>(Values are checked with tolerance ±0.01)</em>',
            type: 'matrix',
            marks: 3,
            hint: 'Start from the leftmost column. Make the first pivot = 1 by dividing, then eliminate all entries below it using row subtraction. Move to the next column and repeat.',
            correctValue: computeREF(vectors)
        },
        {
            id: 'pivot-positions',
            title: 'Step 3: Identify Pivot Positions',
            subtitle: 'Click on the leading entry in each non-zero row',
            instruction: 'In the Row Echelon Form shown below, <strong>click on the pivot positions</strong> (the leading non-zero entry in each row).',
            type: 'pivot',
            marks: 2,
            hint: 'A pivot is the first non-zero entry in each non-zero row of the REF. Scan each row from left to right — the first non-zero value is the pivot.',
            correctValue: findPivotPositions(computeREF(vectors))
        },
        {
            id: 'rank',
            title: 'Step 4: Determine the Rank',
            subtitle: 'Count the number of non-zero rows / pivots',
            instruction: 'Based on the Row Echelon Form and pivot positions, what is the <strong>rank</strong> of the matrix?',
            type: 'single',
            marks: 2,
            hint: 'The rank equals the number of non-zero rows in the Row Echelon Form, which is the same as the number of pivot positions you identified.',
            correctValue: results.rank
        }
    ];

    // Add determinant step only for square matrices
    if (vectors.length === currentDimension) {
        steps.push({
            id: 'determinant',
            title: 'Step 5: Calculate Determinant',
            subtitle: 'Compute det(A) for the square matrix',
            instruction: `Calculate the <strong>determinant</strong> of the ${currentDimension}×${currentDimension} matrix. <em>(Tolerance ±0.01)</em>`,
            type: 'single',
            marks: 2,
            hint: currentDimension === 2
                ? 'For a 2×2 matrix [[a,b],[c,d]], det = ad - bc.'
                : currentDimension === 3
                    ? 'For a 3×3 matrix, expand along the first row: a₁₁(a₂₂a₃₃−a₂₃a₃₂) − a₁₂(a₂₁a₃₃−a₂₃a₃₁) + a₁₃(a₂₁a₃₂−a₂₂a₃₁).'
                    : 'Use cofactor expansion along the first row, or use the row-reduced form. Remember row swaps flip the sign.',
            correctValue: results.determinant
        });
    }

    // Final dependency step
    steps.push({
        id: 'dependency',
        title: vectors.length === currentDimension ? 'Step 6: Linear Dependency' : 'Step 5: Linear Dependency',
        subtitle: 'Are the vectors linearly independent or dependent?',
        instruction: `Based on your calculations (rank = ${results.rank}, number of vectors = ${vectors.length}), are these vectors <strong>linearly independent or dependent</strong>?`,
        type: 'radio',
        marks: 1,
        hint: `Compare the rank with the number of vectors. If rank equals the number of vectors, they are independent. If rank < number of vectors, they are dependent.`,
        correctValue: results.isLinearlyIndependent ? 'independent' : 'dependent'
    });

    return steps;
}

// ===== Compute Row Echelon Form (not reduced — upper triangular) =====
function computeREF(matrix) {
    const A = matrix.map(row => [...row]);
    const m = A.length;
    const n = A[0].length;
    let pivotRow = 0;

    for (let col = 0; col < n && pivotRow < m; col++) {
        // Find pivot in this column
        let maxRow = -1;
        let maxVal = 1e-10;
        for (let row = pivotRow; row < m; row++) {
            if (Math.abs(A[row][col]) > maxVal) {
                maxVal = Math.abs(A[row][col]);
                maxRow = row;
            }
        }
        if (maxRow === -1) continue;

        // Swap rows
        [A[pivotRow], A[maxRow]] = [A[maxRow], A[pivotRow]];

        // Normalize pivot row
        const pivot = A[pivotRow][col];
        for (let j = col; j < n; j++) {
            A[pivotRow][j] /= pivot;
        }

        // Eliminate below
        for (let row = pivotRow + 1; row < m; row++) {
            const factor = A[row][col];
            for (let j = col; j < n; j++) {
                A[row][j] -= factor * A[pivotRow][j];
            }
        }
        pivotRow++;
    }

    // Clean near-zero values
    for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
            if (Math.abs(A[i][j]) < 1e-10) A[i][j] = 0;
        }
    }
    return A;
}

// ===== Find Pivot Positions =====
function findPivotPositions(refMatrix) {
    const pivots = [];
    for (let i = 0; i < refMatrix.length; i++) {
        for (let j = 0; j < refMatrix[i].length; j++) {
            if (Math.abs(refMatrix[i][j]) > 1e-10) {
                pivots.push({ row: i, col: j });
                break;
            }
        }
    }
    return pivots;
}

// ===== Start Practice (replaces analyzeVectors) =====
function startPractice() {
    // Close mobile menu if open
    if (hamburger && hamburger.classList.contains('active')) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (!validateVectors()) return;

    // Compute correct answers internally
    const results = calculateLinearAlgebraResults();

    // Build step definitions
    const steps = buildSteps(results);

    // Initialize simulator state
    simState = {
        active: true,
        currentStep: 0,
        totalSteps: steps.length,
        score: 0,
        maxScore: steps.reduce((sum, s) => sum + s.marks, 0),
        steps: steps,
        correctAnswers: results,
        completed: false,
        attemptsPerStep: {}
    };

    // Render the wizard
    renderWizard();

    showAlert('info', 'Practice Started!', `Solve ${steps.length} steps to analyze these vectors. Good luck!`);

    // Scroll to results on mobile
    if (isMobile) {
        mathResults.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// ===== Render Full Wizard =====
function renderWizard() {
    let html = '';

    // Score tracker
    const pct = simState.maxScore > 0 ? Math.round((simState.score / simState.maxScore) * 100) : 0;
    const completedCount = simState.steps.filter((_, i) => simState.attemptsPerStep[i] && simState.attemptsPerStep[i].correct).length;

    html += `
        <div class="sim-score-tracker">
            <div class="sim-score-badge">
                <i class="fas fa-trophy"></i>
                <span>Score: <span class="sim-score-value">${simState.score} / ${simState.maxScore}</span></span>
            </div>
            <div class="sim-progress-wrap">
                <div class="sim-progress-label">${completedCount} of ${simState.totalSteps} steps completed</div>
                <div class="sim-progress-bar">
                    <div class="sim-progress-fill" style="width: ${pct}%"></div>
                </div>
            </div>
        </div>
    `;

    // Step cards
    html += '<div class="step-wizard">';
    simState.steps.forEach((step, index) => {
        const isActive = index === simState.currentStep && !simState.completed;
        const isCompleted = simState.attemptsPerStep[index] && simState.attemptsPerStep[index].correct;
        const isLocked = index > simState.currentStep && !simState.completed;
        const hasIncorrect = simState.attemptsPerStep[index] && !simState.attemptsPerStep[index].correct;

        let cardClass = 'step-card';
        if (isCompleted) cardClass += ' completed';
        else if (isActive) cardClass += ' active';
        else if (isLocked) cardClass += ' locked';
        if (hasIncorrect && isActive) cardClass += ' incorrect-attempt';

        html += `<div class="${cardClass}" id="step-card-${index}">`;

        // Header
        html += `<div class="step-header">`;
        html += `<div class="step-number">${isCompleted ? '<i class="fas fa-check"></i>' : (index + 1)}</div>`;
        html += `<div class="step-title-area">
                    <div class="step-title">${step.title}</div>
                    <div class="step-subtitle">${step.subtitle}</div>
                 </div>`;
        html += `<span class="step-marks-badge"><i class="fas fa-star"></i> ${step.marks} marks</span>`;
        if (isCompleted) {
            html += `<span class="step-status-icon"><i class="fas fa-check-circle"></i></span>`;
        }
        html += `</div>`;

        // Body
        html += `<div class="step-body">`;
        html += `<div class="step-instruction">${step.instruction}</div>`;

        if (isCompleted) {
            html += renderCompletedStep(step, index);
        } else if (isActive) {
            html += renderActiveStep(step, index);
        }

        html += `</div>`; // end step-body
        html += `</div>`; // end step-card
    });
    html += '</div>'; // end step-wizard

    // Show Full Solution button
    if (!simState.completed) {
        html += `<button class="btn-show-solution" onclick="showFullSolution()">
                    <i class="fas fa-eye"></i> Show Full Solution (score resets to 0)
                 </button>`;
    }

    // Completion card
    if (simState.completed) {
        html += renderCompletionSummary();
    }

    mathResults.innerHTML = html;
}

// ===== Render Active Step Input =====
function renderActiveStep(step, index) {
    let html = '';

    if (step.type === 'matrix') {
        // Show original vectors for reference on step 2
        if (step.id === 'row-echelon') {
            html += `<p style="font-size:0.88rem;color:var(--neutral-gray-dark);margin-bottom:4px;"><strong>Original Matrix (your vectors as rows):</strong></p>`;
            html += renderReadonlyMatrix(vectors);
        }

        const rows = step.correctValue.length;
        const cols = step.correctValue[0].length;
        html += `<div class="step-matrix-grid" id="step-input-${index}">`;
        for (let i = 0; i < rows; i++) {
            html += `<div class="step-matrix-row">`;
            for (let j = 0; j < cols; j++) {
                const prefill = step.id === 'form-matrix' ? '' : '';
                html += `<input type="number" step="any" class="step-matrix-input" 
                          data-row="${i}" data-col="${j}" 
                          id="cell-${index}-${i}-${j}" 
                          placeholder="?" value="${prefill}">`;
            }
            html += `</div>`;
        }
        html += `</div>`;
    } else if (step.type === 'pivot') {
        const refMatrix = computeREF(vectors);
        html += `<p style="font-size:0.85rem;color:var(--neutral-gray-dark);margin-bottom:4px;"><strong>Row Echelon Form:</strong></p>`;
        html += `<div class="pivot-selector-grid" id="step-input-${index}">`;
        for (let i = 0; i < refMatrix.length; i++) {
            html += `<div class="pivot-selector-row">`;
            for (let j = 0; j < refMatrix[i].length; j++) {
                const val = parseFloat(refMatrix[i][j].toFixed(4));
                html += `<button type="button" class="pivot-cell-btn" 
                          data-row="${i}" data-col="${j}" 
                          onclick="togglePivot(this)">${val}</button>`;
            }
            html += `</div>`;
        }
        html += `</div>`;
    } else if (step.type === 'single') {
        html += `<div class="step-single-input-wrap">
                    <input type="number" step="any" class="step-single-input" id="step-input-${index}" placeholder="?">
                    <span style="font-weight:600;color:var(--neutral-gray-dark);">Enter your answer</span>
                 </div>`;
    } else if (step.type === 'radio') {
        html += `<div class="step-radio-group" id="step-input-${index}">
                    <div class="step-radio-option" data-value="independent" onclick="selectRadio(this)">
                        <div class="step-radio-dot"></div>
                        <div class="step-radio-label"><i class="fas fa-check-circle"></i> Linearly Independent</div>
                    </div>
                    <div class="step-radio-option" data-value="dependent" onclick="selectRadio(this)">
                        <div class="step-radio-dot"></div>
                        <div class="step-radio-label"><i class="fas fa-times-circle"></i> Linearly Dependent</div>
                    </div>
                 </div>`;
    }

    // Action buttons
    html += `<div class="step-actions">
                <button class="btn-check-answer" onclick="checkStepAnswer(${index})">
                    <i class="fas fa-check"></i> Check Answer
                </button>
                <button class="btn-skip-step" onclick="skipStep(${index})">
                    <i class="fas fa-forward"></i> Skip
                </button>
                <button class="btn-show-hint" id="hint-btn-${index}" onclick="showStepHint(${index})">
                    <i class="fas fa-lightbulb"></i> Show Hint
                </button>
             </div>`;

    // Hint box (hidden by default)
    html += `<div class="hint-box" id="hint-box-${index}">
                <div class="hint-box-title"><i class="fas fa-lightbulb"></i> Hint</div>
                <p class="hint-box-text">${step.hint}</p>
             </div>`;

    return html;
}

// ===== Render Completed Step =====
function renderCompletedStep(step, index) {
    let html = '';
    const marks = simState.attemptsPerStep[index].marksAwarded;

    if (step.type === 'matrix') {
        html += renderReadonlyMatrix(step.correctValue);
    } else if (step.type === 'pivot') {
        const refMatrix = computeREF(vectors);
        const pivots = step.correctValue;
        html += `<div class="pivot-selector-grid">`;
        for (let i = 0; i < refMatrix.length; i++) {
            html += `<div class="pivot-selector-row">`;
            for (let j = 0; j < refMatrix[i].length; j++) {
                const val = parseFloat(refMatrix[i][j].toFixed(4));
                const isPivot = pivots.some(p => p.row === i && p.col === j);
                html += `<div class="pivot-cell-btn ${isPivot ? 'pivot-correct' : ''}" style="cursor:default">${val}</div>`;
            }
            html += `</div>`;
        }
        html += `</div>`;
    } else if (step.type === 'single') {
        const val = typeof step.correctValue === 'number' ? parseFloat(step.correctValue.toFixed(4)) : step.correctValue;
        html += `<div class="step-completed-answer"><i class="fas fa-check-circle"></i> Answer: <strong>${val}</strong></div>`;
    } else if (step.type === 'radio') {
        const label = step.correctValue === 'independent' ? '✓ Linearly Independent' : '✗ Linearly Dependent';
        html += `<div class="step-completed-answer"><i class="fas fa-check-circle"></i> ${label}</div>`;
    }

    html += `<div class="step-completed-answer" style="margin-top:4px;background:rgba(14,165,233,0.08);color:var(--secondary-teal-dark)">
                <i class="fas fa-star" style="color:var(--accent-orange)"></i> Marks awarded: ${marks} / ${step.marks}
             </div>`;
    return html;
}

// ===== Render Readonly Matrix =====
function renderReadonlyMatrix(matrix) {
    let html = '<div class="step-original-matrix">';
    matrix.forEach(row => {
        html += '<div class="matrix-row">';
        row.forEach(cell => {
            const val = typeof cell === 'number' ? parseFloat(cell.toFixed(4)) : cell;
            html += `<div class="matrix-cell">${val}</div>`;
        });
        html += '</div>';
    });
    html += '</div>';
    return html;
}

// ===== Toggle Pivot Selection =====
function togglePivot(btn) {
    btn.classList.toggle('pivot-selected');
}

// ===== Select Radio =====
function selectRadio(option) {
    const group = option.parentElement;
    group.querySelectorAll('.step-radio-option').forEach(o => o.classList.remove('selected'));
    option.classList.add('selected');
}

// ===== Check Step Answer =====
function checkStepAnswer(stepIndex) {
    const step = simState.steps[stepIndex];
    let isCorrect = false;

    if (step.type === 'matrix') {
        isCorrect = validateMatrixAnswer(stepIndex, step);
    } else if (step.type === 'pivot') {
        isCorrect = validatePivotAnswer(stepIndex, step);
    } else if (step.type === 'single') {
        isCorrect = validateSingleAnswer(stepIndex, step);
    } else if (step.type === 'radio') {
        isCorrect = validateRadioAnswer(stepIndex, step);
    }

    const card = document.getElementById(`step-card-${stepIndex}`);

    if (isCorrect) {
        // First attempt = full marks, else half
        const attempts = (simState.attemptsPerStep[stepIndex] && simState.attemptsPerStep[stepIndex].attempts) || 0;
        const marksAwarded = attempts === 0 ? step.marks : Math.ceil(step.marks / 2);

        simState.attemptsPerStep[stepIndex] = { correct: true, attempts: attempts + 1, marksAwarded: marksAwarded };
        simState.score += marksAwarded;

        // Flash animation
        card.classList.add('correct-flash');
        setTimeout(() => card.classList.remove('correct-flash'), 600);

        showAlert('success', 'Correct! ✓', `You earned ${marksAwarded} / ${step.marks} marks for this step.`);

        // Move to next step
        setTimeout(() => {
            if (simState.currentStep < simState.totalSteps - 1) {
                simState.currentStep++;
                renderWizard();
            } else {
                // All steps done
                simState.completed = true;
                renderWizard();
                // Draw graph for 2D/3D
                if (currentDimension <= 3) drawGraph();
                showAlert('success', 'Practice Complete! 🎉', `Final score: ${simState.score} / ${simState.maxScore}`);
            }
        }, 700);

    } else {
        // Track attempt
        if (!simState.attemptsPerStep[stepIndex]) {
            simState.attemptsPerStep[stepIndex] = { correct: false, attempts: 1 };
        } else {
            simState.attemptsPerStep[stepIndex].attempts++;
        }

        // Flash animation
        card.classList.remove('incorrect-attempt');
        void card.offsetWidth; // reflow
        card.classList.add('incorrect-attempt', 'incorrect-flash');
        setTimeout(() => card.classList.remove('incorrect-flash'), 500);

        // Show hint button
        const hintBtn = document.getElementById(`hint-btn-${stepIndex}`);
        if (hintBtn) hintBtn.classList.add('visible');

        showAlert('error', 'Not quite right ✗', 'Check your calculation and try again. Use the hint if needed.');
    }
}

// ===== Validation Functions =====
function validateMatrixAnswer(stepIndex, step) {
    const correct = step.correctValue;
    const rows = correct.length;
    const cols = correct[0].length;
    let allCorrect = true;

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const input = document.getElementById(`cell-${stepIndex}-${i}-${j}`);
            if (!input) return false;
            const userVal = parseFloat(input.value);
            const correctVal = correct[i][j];

            if (isNaN(userVal) || Math.abs(userVal - correctVal) > 0.02) {
                input.classList.remove('correct-cell');
                input.classList.add('incorrect-cell');
                allCorrect = false;
            } else {
                input.classList.remove('incorrect-cell');
                input.classList.add('correct-cell');
            }
        }
    }
    return allCorrect;
}

function validatePivotAnswer(stepIndex, step) {
    const correctPivots = step.correctValue;
    const grid = document.getElementById(`step-input-${stepIndex}`);
    if (!grid) return false;

    const selectedBtns = grid.querySelectorAll('.pivot-selected');
    const userPivots = [];
    selectedBtns.forEach(btn => {
        userPivots.push({ row: parseInt(btn.dataset.row), col: parseInt(btn.dataset.col) });
    });

    // Check same count and same positions
    if (userPivots.length !== correctPivots.length) return false;

    const allMatch = correctPivots.every(cp =>
        userPivots.some(up => up.row === cp.row && up.col === cp.col)
    );

    // Visual feedback
    grid.querySelectorAll('.pivot-cell-btn').forEach(btn => {
        const r = parseInt(btn.dataset.row);
        const c = parseInt(btn.dataset.col);
        const isCorrectPivot = correctPivots.some(p => p.row === r && p.col === c);
        const isSelected = btn.classList.contains('pivot-selected');

        if (isCorrectPivot && isSelected) {
            btn.classList.add('pivot-correct');
        } else if (!isCorrectPivot && isSelected) {
            btn.classList.add('pivot-incorrect');
        }
    });

    return allMatch;
}

function validateSingleAnswer(stepIndex, step) {
    const input = document.getElementById(`step-input-${stepIndex}`);
    if (!input) return false;
    const userVal = parseFloat(input.value);
    const correctVal = step.correctValue;

    if (isNaN(userVal)) {
        input.classList.add('incorrect-input');
        return false;
    }

    const isCorrect = Math.abs(userVal - correctVal) < 0.02;
    if (isCorrect) {
        input.classList.remove('incorrect-input');
        input.classList.add('correct-input');
    } else {
        input.classList.remove('correct-input');
        input.classList.add('incorrect-input');
    }
    return isCorrect;
}

function validateRadioAnswer(stepIndex, step) {
    const group = document.getElementById(`step-input-${stepIndex}`);
    if (!group) return false;
    const selected = group.querySelector('.step-radio-option.selected');
    if (!selected) {
        showAlert('warning', 'No Selection', 'Please select an option before checking.');
        return false;
    }

    const userVal = selected.dataset.value;
    const isCorrect = userVal === step.correctValue;

    if (isCorrect) {
        selected.classList.add('correct-choice');
    } else {
        selected.classList.add('incorrect-choice');
        // Highlight the correct one
        group.querySelectorAll('.step-radio-option').forEach(opt => {
            if (opt.dataset.value === step.correctValue) {
                opt.classList.add('correct-choice');
            }
        });
    }
    return isCorrect;
}

// ===== Show Hint =====
function showStepHint(stepIndex) {
    const hintBox = document.getElementById(`hint-box-${stepIndex}`);
    if (hintBox) hintBox.classList.add('visible');
}

// ===== Skip Step =====
function skipStep(stepIndex) {
    const step = simState.steps[stepIndex];
    simState.attemptsPerStep[stepIndex] = { correct: true, attempts: 0, marksAwarded: 0, skipped: true };

    showAlert('info', 'Step Skipped', `${step.title} skipped. 0 marks awarded.`);

    setTimeout(() => {
        if (simState.currentStep < simState.totalSteps - 1) {
            simState.currentStep++;
            renderWizard();
        } else {
            simState.completed = true;
            renderWizard();
            if (currentDimension <= 3) drawGraph();
            showAlert('success', 'Practice Complete! 🎉', `Final score: ${simState.score} / ${simState.maxScore}`);
        }
    }, 400);
}

// ===== Show Full Solution =====
function showFullSolution() {
    if (!confirm('This will reveal all answers and reset your score to 0. Continue?')) return;

    simState.score = 0;
    simState.completed = true;

    // Mark all steps as completed with 0 marks
    simState.steps.forEach((step, index) => {
        if (!simState.attemptsPerStep[index] || !simState.attemptsPerStep[index].correct) {
            simState.attemptsPerStep[index] = { correct: true, attempts: 0, marksAwarded: 0 };
        }
    });

    renderWizard();
    if (currentDimension <= 3) drawGraph();
    showAlert('info', 'Full Solution Revealed', 'All answers are shown. Your score has been reset to 0.');
}

// ===== Completion Summary =====
function renderCompletionSummary() {
    const pct = simState.maxScore > 0 ? Math.round((simState.score / simState.maxScore) * 100) : 0;
    let grade = '';
    let gradeIcon = '';
    if (pct >= 90) { grade = 'Excellent!'; gradeIcon = '🏆'; }
    else if (pct >= 70) { grade = 'Great Job!'; gradeIcon = '🌟'; }
    else if (pct >= 50) { grade = 'Good Effort!'; gradeIcon = '👍'; }
    else { grade = 'Keep Practicing!'; gradeIcon = '💪'; }

    return `
        <div class="sim-completion-card">
            <div class="sim-completion-icon">${gradeIcon}</div>
            <div class="sim-completion-title">${grade}</div>
            <div class="sim-completion-score">${simState.score} / ${simState.maxScore} marks (${pct}%)</div>
            <p class="sim-completion-msg">
                You completed the analysis of ${vectors.length} vectors in ℝ<sup>${currentDimension}</sup>.
                ${simState.correctAnswers.isLinearlyIndependent 
                    ? 'The vectors are <strong>Linearly Independent</strong>.' 
                    : 'The vectors are <strong>Linearly Dependent</strong>.'}
            </p>
            <div class="sim-completion-actions">
                <button class="btn btn-primary" onclick="resetPractice()">
                    <i class="fas fa-redo"></i> Practice Again
                </button>
                <button class="btn btn-secondary" onclick="generateRandomVectors(); startPractice();">
                    <i class="fas fa-random"></i> New Random Problem
                </button>
            </div>
        </div>
    `;
}

// ===== Reset Practice =====
function resetPractice() {
    simState = {
        active: false, currentStep: 0, totalSteps: 0, score: 0, maxScore: 0,
        steps: [], correctAnswers: {}, completed: false, attemptsPerStep: {}
    };
    clearResults();
    showAlert('info', 'Practice Reset', 'Enter new vectors or use examples to start again.');
}
