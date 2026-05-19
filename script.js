// script.js - Main JavaScript for Linear Algebra Vector Checker

// ===== Global Variables =====
let currentDimension = 3; // Default to 3D
let vectors = [];
let isRotating = false;
let showLabels = true;
let graphRotation = { x: 30, y: 45, z: 0 };
let isMobile = false;
let alertContainer = null;

// ===== DOM Elements =====
const dimensionInput = document.getElementById('dimensionInput');
const vectorCountSpan = document.getElementById('vectorCount');
const vectorInputsContainer = document.getElementById('vectorInputs');
const addVectorBtn = document.getElementById('addVectorBtn');
const removeVectorBtn = document.getElementById('removeVectorBtn');
const clearVectorsBtn = document.getElementById('clearVectorsBtn');
const analyzeBtn = document.getElementById('analyzeBtn');
const randomBtn = document.getElementById('randomBtn');
const mathResults = document.getElementById('mathResults');
const graphCanvas = document.getElementById('graphCanvas');
const graphPlaceholder = document.getElementById('graphPlaceholder');
const graphicalResults = document.getElementById('graphicalResults');
const highDimNote = document.getElementById('highDimNote');
const rotateBtn = document.getElementById('rotateBtn');
const exportGraphBtn = document.getElementById('exportGraphBtn');
const toggleLabelsBtn = document.getElementById('toggleLabelsBtn');
const exportResultsBtn = document.getElementById('exportResultsBtn');
const exportGraphImageBtn = document.getElementById('exportGraphImageBtn');
const copyResultsBtn = document.getElementById('copyResultsBtn');
const exampleBtns = document.querySelectorAll('.example-btn');
const quickDimBtns = document.querySelectorAll('.quick-dim-btn');

// ===== Alert System =====
function initAlertSystem() {
    // Create alert container if it doesn't exist
    if (!document.querySelector('.alert-container')) {
        alertContainer = document.createElement('div');
        alertContainer.className = 'alert-container';
        document.body.appendChild(alertContainer);
    } else {
        alertContainer = document.querySelector('.alert-container');
    }
}

function showAlert(type, title, message, duration = 5000) {
    if (!alertContainer) initAlertSystem();
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    
    // Set icon based on type
    let icon = 'info-circle';
    switch(type) {
        case 'success': icon = 'check-circle'; break;
        case 'error': icon = 'exclamation-circle'; break;
        case 'warning': icon = 'exclamation-triangle'; break;
        case 'info': icon = 'info-circle'; break;
    }
    
    alert.innerHTML = `
        <i class="fas fa-${icon} alert-icon"></i>
        <div class="alert-content">
            <div class="alert-title">${title}</div>
            <div class="alert-message">${message}</div>
        </div>
        <button class="alert-close"><i class="fas fa-times"></i></button>
    `;
    
    alertContainer.appendChild(alert);
    
    // Trigger animation
    setTimeout(() => {
        alert.style.opacity = '1';
        alert.style.transform = 'translateX(0)';
    }, 10);
    
    // Close button event
    alert.querySelector('.alert-close').addEventListener('click', () => {
        closeAlert(alert);
    });
    
    // Auto close after duration
    if (duration > 0) {
        setTimeout(() => {
            if (alert.parentNode) {
                closeAlert(alert);
            }
        }, duration);
    }
    
    return alert;
}

function closeAlert(alert) {
    alert.classList.add('hide');
    setTimeout(() => {
        if (alert.parentNode) {
            alert.parentNode.removeChild(alert);
        }
    }, 300);
}

// ===== Mobile Navigation =====
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

// ===== Initialize Application =====
document.addEventListener('DOMContentLoaded', function() {
    // Check if mobile device
    isMobile = window.innerWidth <= 768;
    
    // Initialize alert system
    initAlertSystem();
    
    // Show welcome message
    showAlert('info', 'Welcome to Virtual Lab!', 'Enter vectors or use the quick examples to get started.');
    
    // Initialize vector inputs
    vectors = Array(3).fill().map(() => Array(currentDimension).fill(0));
    
    // Set up event listeners
    setupEventListeners();
    
    // Update UI
    updateVectorInputs();
    updateVectorCount();
    updateGraphicalSection();
    
    // Draw initial graph placeholder
    drawGraphPlaceholder();
    
    // Set canvas size based on device
    updateCanvasSize();
    
    // Initialize mobile navigation
    initMobileNav();
    
    // Add resize listener for responsive canvas
    window.addEventListener('resize', handleResize);
});

// ===== Mobile Navigation =====
function initMobileNav() {
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            
            // Prevent body scroll when menu is open
            if (navMenu.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });
        
        // Close mobile menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !hamburger.contains(e.target) && navMenu.classList.contains('active')) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
}

// ===== Responsive Canvas Handling =====
function updateCanvasSize() {
    if (!graphCanvas) return;
    
    const container = graphCanvas.parentElement;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight || 300;
    
    // Set canvas dimensions
    graphCanvas.width = containerWidth;
    graphCanvas.height = containerHeight;
    
    // If graph is currently displayed, redraw it
    if (graphCanvas.style.display !== 'none') {
        drawGraph();
    }
}

function handleResize() {
    updateCanvasSize();
    
    // Check if we need to switch mobile state
    const wasMobile = isMobile;
    isMobile = window.innerWidth <= 768;
    
    // Update vector inputs if mobile state changed
    if (wasMobile !== isMobile) {
        updateVectorInputs();
    }
}

// ===== Event Listeners Setup =====
function setupEventListeners() {
    // Dimension input change
    dimensionInput.addEventListener('change', () => {
        const newDim = parseInt(dimensionInput.value);
        if (newDim < 2 || newDim > 10) {
            showAlert('error', 'Invalid Dimension', 'Dimension must be between 2 and 10');
            dimensionInput.value = currentDimension;
            return;
        }
        
        currentDimension = newDim;
        
        // Update quick dimension buttons
        updateQuickDimButtons();
        
        // Update vectors to new dimension
        vectors = vectors.map(vector => {
            if (vector.length < currentDimension) {
                // Add zeros for new dimensions
                return [...vector, ...Array(currentDimension - vector.length).fill(0)];
            } else if (vector.length > currentDimension) {
                // Truncate for lower dimensions
                return vector.slice(0, currentDimension);
            }
            return vector;
        });
        
        // If we have fewer vectors than dimension+2, add some
        if (vectors.length < currentDimension + 1 && vectors.length < 10) {
            const vectorsToAdd = Math.min(currentDimension + 1 - vectors.length, 10 - vectors.length);
            for (let i = 0; i < vectorsToAdd; i++) {
                vectors.push(Array(currentDimension).fill(0));
            }
        }
        
        // Update UI
        updateVectorInputs();
        updateVectorCount();
        updateGraphicalSection();
        clearResults();
        
        // Update canvas size
        updateCanvasSize();
        
        showAlert('info', 'Dimension Changed', `Now analyzing vectors in ${currentDimension}D space`);
    });
    
    // Quick dimension buttons
    quickDimBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const dim = parseInt(btn.dataset.dim);
            dimensionInput.value = dim;
            dimensionInput.dispatchEvent(new Event('change'));
        });
    });
    
    // Vector controls
    addVectorBtn.addEventListener('click', addVector);
    removeVectorBtn.addEventListener('click', removeVector);
    clearVectorsBtn.addEventListener('click', clearVectors);
    
    // Analysis button
    analyzeBtn.addEventListener('click', analyzeVectors);
    
    // Random vectors button
    randomBtn.addEventListener('click', generateRandomVectors);
    
    // Graph controls (only for 2D/3D)
    if (rotateBtn) rotateBtn.addEventListener('click', toggleRotation);
    if (exportGraphBtn) exportGraphBtn.addEventListener('click', exportGraph);
    if (toggleLabelsBtn) toggleLabelsBtn.addEventListener('click', toggleLabels);
    
    // Export buttons
    if (exportResultsBtn) exportResultsBtn.addEventListener('click', exportResults);
    if (exportGraphImageBtn) exportGraphImageBtn.addEventListener('click', exportGraphImage);
    if (copyResultsBtn) copyResultsBtn.addEventListener('click', copyResults);
    
    // Example buttons
    exampleBtns.forEach(btn => {
        btn.addEventListener('click', () => loadExample(btn.dataset.example));
    });
    
    // Improve touch experience on mobile
    improveMobileTouch();
}

function improveMobileTouch() {
    // Add touch-friendly class to buttons on mobile
    if (isMobile) {
        document.querySelectorAll('.btn, .btn-icon, .example-btn, .quick-dim-btn').forEach(btn => {
            btn.classList.add('touch-target');
        });
    }
    
    // Prevent zoom on double tap for number inputs
    document.querySelectorAll('.comp-input').forEach(input => {
        input.addEventListener('touchstart', (e) => {
            if (isMobile) {
                e.target.style.fontSize = '16px'; // Prevents iOS zoom
            }
        });
    });
}

// ===== Update Functions =====
function updateQuickDimButtons() {
    quickDimBtns.forEach(btn => {
        const dim = parseInt(btn.dataset.dim);
        if (dim === currentDimension) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

function updateGraphicalSection() {
    if (currentDimension <= 3) {
        // Show graphical section for 2D and 3D
        graphicalResults.style.display = 'block';
        highDimNote.style.display = 'none';
    } else {
        // Hide graphical section for higher dimensions
        graphicalResults.style.display = 'none';
        
        // Hide graph if visible
        graphPlaceholder.style.display = 'flex';
        graphCanvas.style.display = 'none';
    }
}

// ===== Vector Management Functions =====
function addVector() {
    if (vectors.length >= 10) {
        showAlert('warning', 'Maximum Vectors Reached', 'You can only add up to 10 vectors');
        return;
    }
    
    // Create new vector with zeros for current dimension
    vectors.push(Array(currentDimension).fill(0));
    
    // Update UI
    updateVectorInputs();
    updateVectorControls();
    updateVectorCount();
    
    showAlert('success', 'Vector Added', `Vector ${vectors.length} added with ${currentDimension} components`);
}

function removeVector() {
    if (vectors.length <= 2) {
        showAlert('warning', 'Minimum Vectors Required', 'At least 2 vectors are required');
        return;
    }
    
    vectors.pop();
    
    // Update UI
    updateVectorInputs();
    updateVectorControls();
    updateVectorCount();
    
    showAlert('info', 'Vector Removed', `Vector removed. Now have ${vectors.length} vectors`);
}

function clearVectors() {
    // Reset to three zero vectors
    vectors = Array(3).fill().map(() => Array(currentDimension).fill(0));
    
    // Update UI
    updateVectorInputs();
    updateVectorControls();
    updateVectorCount();
    clearResults();
    
    showAlert('info', 'Vectors Cleared', 'All vectors have been reset to zero');
}

function updateVectorInputs() {
    vectorInputsContainer.innerHTML = '';
    
    vectors.forEach((vector, index) => {
        const vectorElement = document.createElement('div');
        vectorElement.className = 'vector-input';
        
        const label = document.createElement('div');
        label.className = 'vector-label';
        label.textContent = `v${index + 1}:`;
        
        const components = document.createElement('div');
        components.className = 'vector-components';
        
        // Create input for each component
        vector.forEach((component, compIndex) => {
            const componentGroup = document.createElement('div');
            componentGroup.className = 'component-group';
            
            const compInput = document.createElement('input');
            compInput.type = 'number';
            compInput.className = 'comp-input';
            compInput.value = component;
            compInput.dataset.vectorIndex = index;
            compInput.dataset.componentIndex = compIndex;
            compInput.step = 'any';
            compInput.inputMode = 'decimal';
            
            // Optimize for mobile
            if (isMobile) {
                compInput.setAttribute('inputmode', 'decimal');
                compInput.setAttribute('pattern', '[0-9]*');
            }
            
            // Label components based on dimension
            if (currentDimension <= 3) {
                const labels = ['x', 'y', 'z'];
                compInput.placeholder = labels[compIndex] || `c${compIndex + 1}`;
                compInput.title = `${labels[compIndex] || `Component ${compIndex + 1}`} coordinate`;
            } else {
                compInput.placeholder = `c${compIndex + 1}`;
                compInput.title = `Component ${compIndex + 1}`;
            }
            
            compInput.addEventListener('input', (e) => {
                const vectorIndex = parseInt(e.target.dataset.vectorIndex);
                const componentIndex = parseInt(e.target.dataset.componentIndex);
                const value = parseFloat(e.target.value) || 0;
                
                vectors[vectorIndex][componentIndex] = value;
            });
            
            // Add touch events for better mobile experience
            if (isMobile) {
                compInput.addEventListener('touchstart', function() {
                    this.focus();
                });
            }
            
            const compLabel = document.createElement('div');
            compLabel.className = 'comp-label';
            if (currentDimension <= 3) {
                const labels = ['x', 'y', 'z'];
                compLabel.textContent = labels[compIndex] || `c${compIndex + 1}`;
            } else {
                compLabel.textContent = `c${compIndex + 1}`;
            }
            
            componentGroup.appendChild(compInput);
            componentGroup.appendChild(compLabel);
            components.appendChild(componentGroup);
        });
        
        vectorElement.appendChild(label);
        vectorElement.appendChild(components);
        vectorInputsContainer.appendChild(vectorElement);
    });
    
    // Scroll to bottom when adding new vectors
    vectorInputsContainer.scrollTop = vectorInputsContainer.scrollHeight;
}

function updateVectorControls() {
    removeVectorBtn.disabled = vectors.length <= 2;
    addVectorBtn.disabled = vectors.length >= 10;
}

function updateVectorCount() {
    vectorCountSpan.textContent = vectors.length;
}

// ===== Analysis Functions =====
function analyzeVectors() {
    // Delegate to the interactive step-by-step practice simulator
    if (typeof startPractice === 'function') {
        startPractice();
    } else {
        showAlert('error', 'Simulator Error', 'The practice simulator module failed to load.');
    }
}

function validateVectors() {
    // Check if all vectors are zero vectors
    const allZero = vectors.every(vector => 
        vector.every(component => Math.abs(component) < 1e-10)
    );
    
    if (allZero) {
        showAlert('warning', 'Invalid Input', 'Please enter at least one non-zero vector');
        return false;
    }
    
    // Check for NaN or invalid values
    for (let i = 0; i < vectors.length; i++) {
        for (let j = 0; j < vectors[i].length; j++) {
            if (isNaN(vectors[i][j])) {
                showAlert('error', 'Invalid Input', `Vector ${i+1}, component ${j+1} is not a valid number`);
                return false;
            }
        }
    }
    
    return true;
}

function showLoadingState() {
    const loadingHTML = `
        <div class="placeholder-content">
            <div class="spinner"></div>
            <p>Analyzing vectors...</p>
            <p class="dimension-note">Processing ${vectors.length} vectors in ${currentDimension}D space</p>
        </div>
    `;
    
    mathResults.innerHTML = loadingHTML;
}

function calculateLinearAlgebraResults() {
    const results = {
        vectors: vectors.map(v => [...v]),
        dimension: currentDimension,
        rank: 0,
        isLinearlyIndependent: false,
        determinant: null,
        rrefMatrix: [],
        dependencyRelation: null,
        basisVectors: []
    };
    
    // Calculate rank using Gaussian elimination
    results.rank = calculateRank(vectors);
    
    // Determine linear dependency
    results.isLinearlyIndependent = results.rank === vectors.length;
    
    // Calculate determinant for square matrices (when number of vectors equals dimension)
    if (vectors.length === currentDimension) {
        results.determinant = calculateDeterminant(vectors);
    }
    
    // Calculate RREF
    results.rrefMatrix = calculateRREF(vectors);
    
    // Find basis vectors (pivot columns)
    results.basisVectors = findBasisVectors(vectors);
    
    // Find dependency relation if dependent
    if (!results.isLinearlyIndependent) {
        results.dependencyRelation = findDependencyRelation(vectors);
    }
    
    return results;
}

function calculateRank(matrix) {
    // Create a copy to avoid modifying original
    const A = matrix.map(row => [...row]);
    const m = A.length; // number of vectors
    const n = A[0].length; // dimension
    
    let rank = 0;
    
    for (let col = 0; col < n && rank < m; col++) {
        // Find pivot
        let pivotRow = -1;
        for (let row = rank; row < m; row++) {
            if (Math.abs(A[row][col]) > 1e-10) {
                pivotRow = row;
                break;
            }
        }
        
        if (pivotRow === -1) continue;
        
        // Swap rows
        [A[rank], A[pivotRow]] = [A[pivotRow], A[rank]];
        
        // Normalize pivot row
        const pivot = A[rank][col];
        for (let j = col; j < n; j++) {
            A[rank][j] /= pivot;
        }
        
        // Eliminate other rows
        for (let row = 0; row < m; row++) {
            if (row !== rank && Math.abs(A[row][col]) > 1e-10) {
                const factor = A[row][col];
                for (let j = col; j < n; j++) {
                    A[row][j] -= factor * A[rank][j];
                }
            }
        }
        
        rank++;
    }
    
    return rank;
}

function calculateDeterminant(matrix) {
    // Only for square matrices
    const n = matrix.length;
    
    // Create a copy
    const A = matrix.map(row => [...row]);
    let det = 1;
    
    for (let i = 0; i < n; i++) {
        // Find pivot
        let pivotRow = i;
        for (let row = i + 1; row < n; row++) {
            if (Math.abs(A[row][i]) > Math.abs(A[pivotRow][i])) {
                pivotRow = row;
            }
        }
        
        // If pivot is zero, determinant is zero
        if (Math.abs(A[pivotRow][i]) < 1e-10) {
            return 0;
        }
        
        // Swap rows if necessary
        if (pivotRow !== i) {
            [A[i], A[pivotRow]] = [A[pivotRow], A[i]];
            det *= -1; // Row swap changes sign of determinant
        }
        
        // Multiply determinant by pivot
        det *= A[i][i];
        
        // Eliminate below
        for (let row = i + 1; row < n; row++) {
            const factor = A[row][i] / A[i][i];
            for (let col = i; col < n; col++) {
                A[row][col] -= factor * A[i][col];
            }
        }
    }
    
    return det;
}

function calculateRREF(matrix) {
    // Create a copy
    const A = matrix.map(row => [...row]);
    const m = A.length;
    const n = A[0].length;
    
    let lead = 0;
    for (let r = 0; r < m; r++) {
        if (lead >= n) break;
        
        let i = r;
        while (Math.abs(A[i][lead]) < 1e-10) {
            i++;
            if (i === m) {
                i = r;
                lead++;
                if (lead === n) return A;
            }
        }
        
        // Swap rows
        [A[r], A[i]] = [A[i], A[r]];
        
        // Normalize row
        const val = A[r][lead];
        for (let j = 0; j < n; j++) {
            A[r][j] /= val;
        }
        
        // Eliminate other rows
        for (let i = 0; i < m; i++) {
            if (i !== r) {
                const val = A[i][lead];
                for (let j = 0; j < n; j++) {
                    A[i][j] -= val * A[r][j];
                }
            }
        }
        
        lead++;
    }
    
    return A;
}

function findBasisVectors(matrix) {
    const rank = calculateRank(matrix);
    const basis = [];
    
    if (rank === 0) return basis;
    
    // Find pivot columns in RREF
    const rref = calculateRREF(matrix);
    
    for (let col = 0; col < matrix[0].length && basis.length < rank; col++) {
        for (let row = 0; row < matrix.length; row++) {
            if (Math.abs(rref[row][col] - 1) < 1e-10) {
                // Check if this is a pivot (1 in RREF and zeros in other rows)
                let isPivot = true;
                for (let r = 0; r < matrix.length; r++) {
                    if (r !== row && Math.abs(rref[r][col]) > 1e-10) {
                        isPivot = false;
                        break;
                    }
                }
                
                if (isPivot) {
                    basis.push(matrix[row]);
                    break;
                }
            }
        }
    }
    
    return basis;
}

function findDependencyRelation(matrix) {
    const rank = calculateRank(matrix);
    
    if (rank === matrix.length) {
        return "Vectors are linearly independent (no dependency relation).";
    }
    
    const dependentCount = matrix.length - rank;
    
    if (dependentCount === 1) {
        return `There is 1 linearly dependent vector that can be expressed as a linear combination of the other ${rank} vectors.`;
    } else {
        return `There are ${dependentCount} linearly dependent vectors that can be expressed as linear combinations of the other ${rank} vectors.`;
    }
}

function displayMathematicalResults(results) {
    const isIndependent = results.isLinearlyIndependent;
    const bannerClass = isIndependent ? 'independent-banner' : 'dependent-banner';
    const bannerIcon = isIndependent ? 'check-circle' : 'exclamation-circle';
    const bannerTitle = isIndependent ? 'Linearly Independent' : 'Linearly Dependent';
    const bannerSub = isIndependent
        ? `Rank ${results.rank} = ${vectors.length} vector(s) — no vector is a combination of others`
        : `Rank ${results.rank} < ${vectors.length} vector(s) — at least one vector is redundant`;

    let html = `
        <div class="result-summary-banner ${bannerClass}">
            <i class="fas fa-${bannerIcon}"></i>
            <div class="banner-text">
                <div class="banner-title">${bannerTitle}</div>
                <div class="banner-sub">${bannerSub}</div>
            </div>
        </div>

        <div class="result-item">
            <div class="result-title"><i class="fas fa-cube"></i> Space &amp; Dimension</div>
            <div class="result-value">ℝ<sup>${results.dimension}</sup></div>
            <p>Analyzing ${vectors.length} vector(s) in ${results.dimension}-dimensional space.</p>
        </div>
        
        <div class="result-item">
            <div class="result-title"><i class="fas fa-layer-group"></i> Matrix Rank</div>
            <div class="result-value">${results.rank} <span style="font-size:0.8em;font-weight:500;color:var(--neutral-gray-dark)">/ ${vectors.length}</span></div>
            <p>The rank is the maximum number of linearly independent vectors in the set. Max possible in ℝ<sup>${results.dimension}</sup> is ${results.dimension}.</p>
        </div>
        
        <div class="result-item" style="border-left-color: ${isIndependent ? 'var(--accent-green)' : 'var(--accent-red)'}">
            <div class="result-title"><i class="fas fa-link"></i> Linear Dependency</div>
            <div class="result-value ${isIndependent ? 'independent' : 'dependent'}">
                ${isIndependent ? '✓ LINEARLY INDEPENDENT' : '✗ LINEARLY DEPENDENT'}
            </div>
            <p>${isIndependent ? 
                'No vector in the set can be written as a linear combination of the others.' : 
                'At least one vector in the set can be written as a linear combination of the others.'}</p>
        </div>
    `;
    
    // Add determinant if available (square matrix)
    if (results.determinant !== null) {
        const detIsZero = Math.abs(results.determinant) < 1e-10;
        html += `
            <div class="result-item">
                <div class="result-title"><i class="fas fa-divide"></i> Determinant</div>
                <div class="result-value ${detIsZero ? 'dependent' : 'independent'}">${results.determinant.toFixed(4)}</div>
                <p>${detIsZero ? 
                    'det = 0 confirms linear dependency (matrix is singular).' : 
                    'det ≠ 0 confirms linear independence (matrix is invertible).'}</p>
            </div>
        `;
    }
    
    // Add basis vectors if available
    if (results.basisVectors.length > 0) {
        html += `
            <div class="result-item">
                <div class="result-title"><i class="fas fa-vector-square"></i> Basis Vectors (${results.basisVectors.length})</div>
                <div class="matrix-display">
        `;
        
        results.basisVectors.forEach((vector, idx) => {
            html += `<div class="matrix-row">`;
            html += `<div class="matrix-cell" style="min-width:90px;background:linear-gradient(135deg,rgba(14,165,233,0.1),rgba(14,165,233,0.05));font-size:0.8rem;color:var(--secondary-teal-dark)">b${idx + 1}</div>`;
            vector.forEach(component => {
                const val = parseFloat(component.toFixed(4));
                html += `<div class="matrix-cell">${val}</div>`;
            });
            html += `</div>`;
        });
        
        html += `
                </div>
                <p style="margin-top:var(--spacing-sm)">These vectors form a basis for the subspace spanned by the input vectors.</p>
            </div>
        `;
    }
    
    // Add RREF matrix
    html += `
        <div class="result-item">
            <div class="result-title"><i class="fas fa-th"></i> RREF — Reduced Row Echelon Form</div>
            <div class="matrix-display">
    `;
    
    results.rrefMatrix.forEach(row => {
        html += `<div class="matrix-row">`;
        row.forEach(cell => {
            const val = parseFloat(cell.toFixed(4));
            const isPivot = Math.abs(val - 1) < 1e-8 || (Math.abs(val) > 1e-8 && val !== 0);
            const isOne = Math.abs(val - 1) < 1e-8;
            html += `<div class="matrix-cell${isOne ? ' pivot-cell' : ''}">${val}</div>`;
        });
        html += `</div>`;
    });
    
    html += `
            </div>
            <p style="margin-top:var(--spacing-sm)">Columns with a leading 1 (highlighted) correspond to linearly independent vectors (pivot columns).</p>
        </div>
    `;
    
    // Add dimension info for higher dimensions
    if (currentDimension > 3) {
        html += `
            <div class="dimension-info">
                <h4><i class="fas fa-info-circle"></i> Higher Dimension Note</h4>
                <p>For ${currentDimension}D vectors, graphical representation is not available. Analysis is performed purely algebraically using rank, RREF, and determinant methods.</p>
                <p>Maximum possible rank in ℝ<sup>${currentDimension}</sup> is <strong>${currentDimension}</strong>.</p>
            </div>
        `;
    }
    
    // Add dependency relation if dependent
    if (results.dependencyRelation) {
        html += `
            <div class="result-item" style="border-left-color:var(--accent-orange)">
                <div class="result-title"><i class="fas fa-project-diagram"></i> Dependency Relation</div>
                <p>${results.dependencyRelation}</p>
            </div>
        `;
    }
    
    mathResults.innerHTML = html;
}

function clearResults() {
    mathResults.innerHTML = `
        <div class="placeholder-content">
            <i class="fas fa-calculator"></i>
            <p>Enter vectors and click "Analyze Vectors" to see mathematical results</p>
        </div>
    `;
    
    if (currentDimension <= 3) {
        graphPlaceholder.style.display = 'flex';
        graphCanvas.style.display = 'none';
        
        // Clear canvas
        const ctx = graphCanvas.getContext('2d');
        ctx.clearRect(0, 0, graphCanvas.width, graphCanvas.height);
    }
}

// ===== Graph Functions (Only for 2D and 3D) =====
function drawGraph() {
    if (currentDimension > 3) return;
    
    const ctx = graphCanvas.getContext('2d');
    const width = graphCanvas.width;
    const height = graphCanvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Show canvas, hide placeholder
    graphPlaceholder.style.display = 'none';
    graphCanvas.style.display = 'block';
    
    // Draw based on dimension
    if (currentDimension === 2) {
        draw2DGraph(ctx, width, height);
    } else if (currentDimension === 3) {
        draw3DGraph(ctx, width, height);
    }
}

function draw2DGraph(ctx, width, height) {
    const padding = 60;
    const graphWidth = width - 2 * padding;
    const graphHeight = height - 2 * padding;
    const originX = width / 2;
    const originY = height / 2;

    // Background
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, width, height);

    // Find max magnitude for scaling
    let maxMagnitude = 0;
    vectors.forEach(vector => {
        const magnitude = Math.sqrt(vector[0] ** 2 + vector[1] ** 2);
        if (magnitude > maxMagnitude) maxMagnitude = magnitude;
    });
    if (maxMagnitude === 0) maxMagnitude = 1;

    const scale = Math.min(graphWidth, graphHeight) / 2 / maxMagnitude * 0.72;
    const gridStep = maxMagnitude / 3;
    const gridPixelStep = gridStep * scale;

    // Draw grid lines
    ctx.strokeStyle = 'rgba(148,163,184,0.3)';
    ctx.lineWidth = 1;
    for (let i = -4; i <= 4; i++) {
        const px = originX + i * gridPixelStep;
        const py = originY + i * gridPixelStep;
        ctx.beginPath();
        ctx.moveTo(px, padding);
        ctx.lineTo(px, height - padding);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(padding, py);
        ctx.lineTo(width - padding, py);
        ctx.stroke();
    }

    // Draw X axis
    ctx.strokeStyle = 'rgba(30,58,95,0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padding, originY);
    ctx.lineTo(width - padding, originY);
    ctx.stroke();

    // Draw Y axis
    ctx.beginPath();
    ctx.moveTo(originX, padding);
    ctx.lineTo(originX, height - padding);
    ctx.stroke();

    // Axis arrows
    ctx.fillStyle = 'rgba(30,58,95,0.5)';
    // X arrow
    ctx.beginPath();
    ctx.moveTo(width - padding, originY);
    ctx.lineTo(width - padding - 8, originY - 4);
    ctx.lineTo(width - padding - 8, originY + 4);
    ctx.closePath();
    ctx.fill();
    // Y arrow
    ctx.beginPath();
    ctx.moveTo(originX, padding);
    ctx.lineTo(originX - 4, padding + 8);
    ctx.lineTo(originX + 4, padding + 8);
    ctx.closePath();
    ctx.fill();

    // Axis labels
    ctx.fillStyle = 'rgba(30,58,95,0.7)';
    ctx.font = 'bold 13px Inter, Arial';
    ctx.textAlign = 'center';
    ctx.fillText('x', width - padding + 14, originY + 4);
    ctx.fillText('y', originX + 4, padding - 10);

    // Tick marks & numbers
    ctx.fillStyle = '#64748b';
    ctx.font = '10px Inter, Arial';
    ctx.textAlign = 'center';
    for (let i = -3; i <= 3; i++) {
        if (i === 0) continue;
        const tickVal = (i * gridStep).toFixed(1);
        const px = originX + i * gridPixelStep;
        const py = originY + i * gridPixelStep;
        // X tick
        ctx.strokeStyle = 'rgba(30,58,95,0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(px, originY - 4);
        ctx.lineTo(px, originY + 4);
        ctx.stroke();
        ctx.fillText(tickVal, px, originY + 16);
        // Y tick
        ctx.beginPath();
        ctx.moveTo(originX - 4, py);
        ctx.lineTo(originX + 4, py);
        ctx.stroke();
        ctx.textAlign = 'right';
        ctx.fillText(-parseFloat(tickVal), originX - 8, py + 4);
        ctx.textAlign = 'center';
    }

    // Origin label
    ctx.fillStyle = 'rgba(30,58,95,0.6)';
    ctx.font = '11px Inter, Arial';
    ctx.textAlign = 'right';
    ctx.fillText('O', originX - 6, originY + 14);

    // Vector colors (accessible palette)
    const colors = ['#2563eb', '#dc2626', '#16a34a', '#d97706', '#7c3aed', '#0ea5e9', '#db2777'];

    // Draw vectors
    vectors.forEach((vector, index) => {
        const x = vector[0] * scale;
        const y = -vector[1] * scale;
        const endX = originX + x;
        const endY = originY + y;

        // Shadow effect for depth
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.15)';
        ctx.shadowBlur = 4;
        ctx.strokeStyle = colors[index % colors.length];
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(originX, originY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        ctx.restore();

        drawArrowhead(ctx, originX, originY, endX, endY, 10, colors[index % colors.length]);

        if (showLabels) {
            ctx.fillStyle = colors[index % colors.length];
            ctx.font = 'bold 13px Inter, Arial';
            ctx.textAlign = 'left';
            const labelOffset = 14;
            ctx.fillText(`v${index + 1}(${vector[0]},${vector[1]})`, endX + labelOffset, endY - 4);
        }
    });

    // Draw legend below
    drawGraphLegend(ctx, width, height, colors);
}

function drawGraphLegend(ctx, width, height, colors) {
    const legendX = 10;
    const legendY = height - 10;
    const itemWidth = 90;
    const totalWidth = Math.min(vectors.length, 7) * itemWidth;
    const startX = Math.max(legendX, (width - totalWidth) / 2);

    ctx.font = 'bold 11px Inter, Arial';
    vectors.forEach((vector, index) => {
        if (index >= 7) return;
        const lx = startX + index * itemWidth;
        const ly = legendY - 18;
        // Dot
        ctx.fillStyle = colors[index % colors.length];
        ctx.beginPath();
        ctx.arc(lx + 6, ly + 6, 5, 0, Math.PI * 2);
        ctx.fill();
        // Label
        ctx.fillStyle = '#334155';
        ctx.textAlign = 'left';
        ctx.fillText(`v${index + 1}`, lx + 16, ly + 10);
    });
}

function draw3DGraph(ctx, width, height) {
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Background
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, width, height);
    
    // Convert rotation angles to radians
    const radX = graphRotation.x * Math.PI / 180;
    const radY = graphRotation.y * Math.PI / 180;
    const radZ = graphRotation.z * Math.PI / 180;
    
    const rotX = [
        [1, 0, 0],
        [0, Math.cos(radX), -Math.sin(radX)],
        [0, Math.sin(radX), Math.cos(radX)]
    ];
    
    const rotY = [
        [Math.cos(radY), 0, Math.sin(radY)],
        [0, 1, 0],
        [-Math.sin(radY), 0, Math.cos(radY)]
    ];
    
    const rotZ = [
        [Math.cos(radZ), -Math.sin(radZ), 0],
        [Math.sin(radZ), Math.cos(radZ), 0],
        [0, 0, 1]
    ];
    
    const multiplyMatrices = (a, b) => {
        const result = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
        for (let i = 0; i < 3; i++)
            for (let j = 0; j < 3; j++)
                for (let k = 0; k < 3; k++)
                    result[i][j] += a[i][k] * b[k][j];
        return result;
    };
    
    const rotation = multiplyMatrices(multiplyMatrices(rotZ, rotY), rotX);
    
    // Find max vector magnitude for scaling
    let maxMagnitude = 0;
    vectors.forEach(vector => {
        const magnitude = Math.sqrt(vector[0] ** 2 + vector[1] ** 2 + vector[2] ** 2);
        if (magnitude > maxMagnitude) maxMagnitude = magnitude;
    });
    if (maxMagnitude === 0) maxMagnitude = 1;
    
    const scale = Math.min(width, height) / 3 / maxMagnitude * 0.75;
    
    const project = (x, y, z) => {
        const rx = rotation[0][0] * x + rotation[0][1] * y + rotation[0][2] * z;
        const ry = rotation[1][0] * x + rotation[1][1] * y + rotation[1][2] * z;
        const rz = rotation[2][0] * x + rotation[2][1] * y + rotation[2][2] * z;
        const distance = 5;
        const factor = distance / (distance + rz);
        return {
            x: centerX + rx * factor * scale,
            y: centerY - ry * factor * scale,
            depth: rz
        };
    };
    
    // Draw grid plane (XZ) for visual grounding
    const gridLines = 3;
    const gridSpacing = maxMagnitude / 2;
    ctx.strokeStyle = 'rgba(148,163,184,0.2)';
    ctx.lineWidth = 1;
    for (let i = -gridLines; i <= gridLines; i++) {
        const p1 = project(i * gridSpacing, 0, -gridLines * gridSpacing);
        const p2 = project(i * gridSpacing, 0,  gridLines * gridSpacing);
        const p3 = project(-gridLines * gridSpacing, 0, i * gridSpacing);
        const p4 = project( gridLines * gridSpacing, 0, i * gridSpacing);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(p3.x, p3.y);
        ctx.lineTo(p4.x, p4.y);
        ctx.stroke();
    }
    
    // Draw coordinate axes
    const axisLength = maxMagnitude * 1.3;
    const axes = [
        { end: [axisLength, 0, 0], color: '#dc2626', label: 'x' },
        { end: [0, axisLength, 0], color: '#16a34a', label: 'y' },
        { end: [0, 0, axisLength], color: '#2563eb', label: 'z' }
    ];
    
    axes.forEach(axis => {
        const start = project(0, 0, 0);
        const end = project(...axis.end);
        ctx.strokeStyle = axis.color;
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
        // Arrowhead
        drawArrowhead(ctx, start.x, start.y, end.x, end.y, 8, axis.color);
        if (showLabels) {
            ctx.fillStyle = axis.color;
            ctx.font = 'bold 13px Inter, Arial';
            ctx.textAlign = 'center';
            ctx.fillText(axis.label, end.x + 12, end.y + 4);
        }
    });
    
    // Negative axis stubs (dashed)
    const negAxes = [
        { end: [-axisLength * 0.5, 0, 0], color: '#dc2626' },
        { end: [0, -axisLength * 0.5, 0], color: '#16a34a' },
        { end: [0, 0, -axisLength * 0.5], color: '#2563eb' }
    ];
    ctx.setLineDash([4, 4]);
    negAxes.forEach(axis => {
        const start = project(0, 0, 0);
        const end = project(...axis.end);
        ctx.strokeStyle = axis.color + '60';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
    });
    ctx.setLineDash([]);
    
    // Draw vectors (accessible palette)
    const colors = ['#1e3a5f', '#d97706', '#7c3aed', '#0ea5e9', '#db2777', '#059669'];
    
    vectors.forEach((vector, index) => {
        const start = project(0, 0, 0);
        const end = project(vector[0], vector[1], vector[2]);
        
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.18)';
        ctx.shadowBlur = 5;
        ctx.strokeStyle = colors[index % colors.length];
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
        ctx.restore();
        
        drawArrowhead(ctx, start.x, start.y, end.x, end.y, 10, colors[index % colors.length]);
        
        if (showLabels) {
            ctx.fillStyle = colors[index % colors.length];
            ctx.font = 'bold 12px Inter, Arial';
            ctx.textAlign = 'left';
            ctx.fillText(`v${index + 1}`, end.x + 10, end.y - 4);
        }
    });
    
    // Origin dot
    const o = project(0, 0, 0);
    ctx.fillStyle = '#1e3a5f';
    ctx.beginPath();
    ctx.arc(o.x, o.y, 4, 0, Math.PI * 2);
    ctx.fill();
    if (showLabels) {
        ctx.fillStyle = 'rgba(30,58,95,0.7)';
        ctx.font = '11px Inter, Arial';
        ctx.textAlign = 'right';
        ctx.fillText('O', o.x - 6, o.y + 14);
    }
    
    // Legend
    const legendColors = ['#1e3a5f', '#d97706', '#7c3aed', '#0ea5e9', '#db2777', '#059669'];
    drawGraphLegend(ctx, width, height, legendColors);
}

function drawArrowhead(ctx, fromX, fromY, toX, toY, size, color) {
    const angle = Math.atan2(toY - fromY, toX - fromX);
    
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(
        toX - size * Math.cos(angle - Math.PI / 6),
        toY - size * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
        toX - size * Math.cos(angle + Math.PI / 6),
        toY - size * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fill();
}

function drawGraphPlaceholder() {
    const ctx = graphCanvas.getContext('2d');
    const width = graphCanvas.width;
    const height = graphCanvas.height;
    
    // Draw a simple coordinate system in the placeholder
    ctx.strokeStyle = 'rgba(44, 62, 80, 0.1)';
    ctx.lineWidth = 1;
    
    // Draw grid
    const gridSize = 40;
    for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }
    
    for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
}

function toggleRotation() {
    if (currentDimension !== 3) {
        showAlert('warning', 'Rotation Not Available', '3D rotation is only available for 3D vectors');
        return;
    }
    
    isRotating = !isRotating;
    const icon = rotateBtn.querySelector('i');
    
    if (isRotating) {
        icon.classList.remove('fa-sync-alt');
        icon.classList.add('fa-pause');
        startRotation();
        showAlert('info', '3D Rotation Started', 'The 3D graph is now rotating automatically');
    } else {
        icon.classList.remove('fa-pause');
        icon.classList.add('fa-sync-alt');
        showAlert('info', '3D Rotation Stopped', 'The 3D graph rotation has been stopped');
    }
}

function startRotation() {
    if (!isRotating || currentDimension !== 3) return;
    
    graphRotation.y += 1;
    if (graphRotation.y >= 360) graphRotation.y = 0;
    
    drawGraph();
    
    if (isRotating) {
        requestAnimationFrame(() => {
            setTimeout(startRotation, 50);
        });
    }
}

function toggleLabels() {
    showLabels = !showLabels;
    toggleLabelsBtn.classList.toggle('active', showLabels);
    
    if (currentDimension <= 3 && graphCanvas.style.display !== 'none') {
        drawGraph();
        showAlert('info', 'Labels Toggled', `Vector labels are now ${showLabels ? 'visible' : 'hidden'}`);
    }
}

// ===== Utility Functions =====
function generateRandomVectors() {
    vectors = vectors.map(() => {
        const vector = Array(currentDimension);
        
        for (let i = 0; i < currentDimension; i++) {
            // Generate random number between -3 and 3
            vector[i] = (Math.random() * 6 - 3).toFixed(2);
        }
        
        return vector.map(x => parseFloat(x));
    });
    
    updateVectorInputs();
    clearResults();
    
    showAlert('success', 'Random Vectors Generated', `${vectors.length} random vectors created in ${currentDimension}D space`);
}

function loadExample(example) {
    let exampleName = '';
    
    switch(example) {
        case '2D-dependent':
            dimensionInput.value = 2;
            dimensionInput.dispatchEvent(new Event('change'));
            vectors = [[1, 2], [2, 4], [3, 6]]; // All multiples
            exampleName = '2D Dependent Vectors';
            break;
        case '2D-independent':
            dimensionInput.value = 2;
            dimensionInput.dispatchEvent(new Event('change'));
            vectors = [[1, 0], [0, 1], [1, 1]]; // Basis + combination
            exampleName = '2D Independent Vectors';
            break;
        case '3D-dependent':
            dimensionInput.value = 3;
            dimensionInput.dispatchEvent(new Event('change'));
            vectors = [[1, 2, 3], [2, 4, 6], [3, 6, 9]]; // All multiples
            exampleName = '3D Dependent Vectors';
            break;
        case '3D-independent':
            dimensionInput.value = 3;
            dimensionInput.dispatchEvent(new Event('change'));
            vectors = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]; // Standard basis
            exampleName = '3D Independent Vectors';
            break;
        case '4D-dependent':
            dimensionInput.value = 4;
            dimensionInput.dispatchEvent(new Event('change'));
            vectors = [[1, 2, 3, 4], [2, 4, 6, 8], [3, 6, 9, 12]];
            exampleName = '4D Dependent Vectors';
            break;
        case '4D-independent':
            dimensionInput.value = 4;
            dimensionInput.dispatchEvent(new Event('change'));
            vectors = [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]];
            exampleName = '4D Independent Vectors';
            break;
    }
    
    updateVectorInputs();
    updateVectorCount();
    updateVectorControls();
    clearResults();
    
    showAlert('success', 'Example Loaded', `${exampleName} loaded successfully`);
}

function exportResults() {
    if (!validateVectors()) {
        showAlert('error', 'Export Failed', 'Please enter valid vectors before exporting');
        return;
    }
    
    try {
        const results = calculateLinearAlgebraResults();
        let text = `Linear Algebra Vector Analysis — Virtual Lab\n`;
        text += `Generated: ${new Date().toLocaleString()}\n\n`;
        text += `Dimension: ${results.dimension}D\n`;
        text += `Number of vectors: ${vectors.length}\n\n`;
        
        text += `Vectors:\n`;
        vectors.forEach((vector, index) => {
            text += `  v${index + 1} = (${vector.map(x => x.toFixed(4)).join(', ')})\n`;
        });
        
        text += `\nAnalysis Results:\n`;
        text += `  Rank: ${results.rank} of ${vectors.length}\n`;
        text += `  Linear Dependency: ${results.isLinearlyIndependent ? 'Independent' : 'Dependent'}\n`;
        
        if (results.determinant !== null) {
            text += `  Determinant: ${results.determinant.toFixed(6)}\n`;
        }
        
        text += `\nReduced Row Echelon Form:\n`;
        results.rrefMatrix.forEach(row => {
            text += `  [${row.map(val => val.toFixed(4)).join(', ')}]\n`;
        });
        
        if (results.dependencyRelation) {
            text += `\nDependency Relation:\n  ${results.dependencyRelation}\n`;
        }
        
        // Create and download file
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vector-analysis-${results.dimension}D-${new Date().getTime()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showAlert('success', 'Export Successful', 'Analysis results exported as text file');
    } catch (error) {
        showAlert('error', 'Export Failed', 'An error occurred during export');
        console.error('Export error:', error);
    }
}

function exportGraph() {
    if (currentDimension > 3) {
        showAlert('warning', 'Graph Export Not Available', 'Graphical export is only available for 2D and 3D vectors');
        return;
    }
    
    if (graphCanvas.style.display === 'none') {
        showAlert('warning', 'Graph Not Available', 'Please analyze vectors first to generate a graph');
        return;
    }
    
    try {
        const url = graphCanvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = url;
        a.download = `vector-graph-${currentDimension}D-${new Date().getTime()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        showAlert('success', 'Graph Exported', 'Vector graph exported as PNG image');
    } catch (error) {
        showAlert('error', 'Export Failed', 'An error occurred while exporting the graph');
        console.error('Graph export error:', error);
    }
}

function exportGraphImage() {
    exportGraph(); // Same function as exportGraph
}

function copyResults() {
    if (!validateVectors()) {
        showAlert('error', 'Copy Failed', 'Please enter valid vectors first');
        return;
    }
    
    try {
        const results = calculateLinearAlgebraResults();
        let text = `Linear Algebra Vector Analysis\n`;
        text += `Dimension: ${results.dimension}D\n`;
        text += `Vectors: ${vectors.map((v, i) => `v${i+1}=(${v.map(x => x.toFixed(2)).join(',')})`).join(', ')}\n`;
        text += `Rank: ${results.rank}/${vectors.length}\n`;
        text += `Status: ${results.isLinearlyIndependent ? 'Independent' : 'Dependent'}\n`;
        
        if (results.determinant !== null) {
            text += `Determinant: ${results.determinant.toFixed(4)}\n`;
        }
        
        navigator.clipboard.writeText(text)
            .then(() => showAlert('success', 'Copied to Clipboard', 'Analysis results copied to clipboard'))
            .catch(err => {
                console.error('Could not copy text: ', err);
                showAlert('error', 'Copy Failed', 'Failed to copy results to clipboard');
            });
    } catch (error) {
        showAlert('error', 'Copy Failed', 'An error occurred while copying results');
        console.error('Copy error:', error);
    }
}

// Mobile-specific utility function
function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
}

// Clean up on page unload
window.addEventListener('beforeunload', function() {
    // Remove event listeners to prevent memory leaks
    window.removeEventListener('resize', handleResize);
});

// Initialize on page load
window.addEventListener('load', function() {
    // Final initialization
    updateCanvasSize();
});
