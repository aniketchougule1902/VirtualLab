// script.js
document.addEventListener('DOMContentLoaded', function() {
    // State variables
    let currentDimension = '2D';
    let vectors = [];
    let isDarkTheme = true;
    let graphRotation = { x: 30, y: 45, z: 0 };
    let isRotating = false;
    let showLabels = true;
    
    // DOM Elements
    const themeToggle = document.getElementById('themeToggle');
    const helpBtn = document.getElementById('helpBtn');
    const helpModal = document.getElementById('helpModal');
    const aboutModal = document.getElementById('aboutModal');
    const aboutLink = document.getElementById('aboutLink');
    const dimensionBtns = document.querySelectorAll('.dimension-btn');
    const vectorInputsContainer = document.getElementById('vectorInputs');
    const addVectorBtn = document.getElementById('addVectorBtn');
    const removeVectorBtn = document.getElementById('removeVectorBtn');
    const clearVectorsBtn = document.getElementById('clearVectorsBtn');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const randomBtn = document.getElementById('randomBtn');
    const mathResults = document.getElementById('mathResults');
    const graphCanvas = document.getElementById('graphCanvas');
    const graphPlaceholder = document.getElementById('graphPlaceholder');
    const rotateBtn = document.getElementById('rotateBtn');
    const exportGraphBtn = document.getElementById('exportGraphBtn');
    const toggleLabelsBtn = document.getElementById('toggleLabelsBtn');
    const exportResultsBtn = document.getElementById('exportResultsBtn');
    const exportGraphImageBtn = document.getElementById('exportGraphImageBtn');
    const copyResultsBtn = document.getElementById('copyResultsBtn');
    const exampleBtns = document.querySelectorAll('.example-btn');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    
    // Initialize the application
    function init() {
        // Set initial theme
        document.documentElement.setAttribute('data-theme', 'dark');
        
        // Create initial vector inputs
        addVector();
        addVector();
        
        // Set up event listeners
        setupEventListeners();
        
        // Draw initial graph placeholder
        drawGraphPlaceholder();
    }
    
    // Set up all event listeners
    function setupEventListeners() {
        // Theme toggle
        themeToggle.addEventListener('click', toggleTheme);
        
        // Modal controls
        helpBtn.addEventListener('click', () => showModal(helpModal));
        aboutLink.addEventListener('click', (e) => {
            e.preventDefault();
            showModal(aboutModal);
        });
        
        // Dimension selection
        dimensionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                dimensionBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentDimension = btn.dataset.dim;
                
                // Clear vectors when changing dimension
                vectors = [];
                vectorInputsContainer.innerHTML = '';
                addVector();
                addVector();
                
                // Update UI
                updateVectorInputs();
                clearResults();
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
        
        // Graph controls
        rotateBtn.addEventListener('click', toggleRotation);
        exportGraphBtn.addEventListener('click', exportGraph);
        toggleLabelsBtn.addEventListener('click', toggleLabels);
        
        // Export buttons
        exportResultsBtn.addEventListener('click', exportResults);
        exportGraphImageBtn.addEventListener('click', exportGraphImage);
        copyResultsBtn.addEventListener('click', copyResults);
        
        // Example buttons
        exampleBtns.forEach(btn => {
            btn.addEventListener('click', () => loadExample(btn.dataset.example));
        });
        
        // Close modal buttons
        closeModalBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const modal = btn.closest('.modal');
                hideModal(modal);
            });
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                hideModal(e.target);
            }
        });
    }
    
    // Toggle between dark and light themes
    function toggleTheme() {
        isDarkTheme = !isDarkTheme;
        const icon = themeToggle.querySelector('i');
        
        if (isDarkTheme) {
            document.documentElement.setAttribute('data-theme', 'dark');
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        }
    }
    
    // Show modal
    function showModal(modal) {
        modal.classList.add('active');
    }
    
    // Hide modal
    function hideModal(modal) {
        modal.classList.remove('active');
    }
    
    // Add a new vector input
    function addVector() {
        const vectorCount = vectors.length;
        
        if (currentDimension === '2D' && vectorCount >= 5) {
            alert('Maximum 5 vectors allowed for 2D visualization');
            return;
        }
        
        if (currentDimension === '3D' && vectorCount >= 4) {
            alert('Maximum 4 vectors allowed for 3D visualization');
            return;
        }
        
        // Create new vector with default values
        const newVector = currentDimension === '2D' ? [0, 0] : [0, 0, 0];
        vectors.push(newVector);
        
        // Update UI
        updateVectorInputs();
        updateVectorControls();
    }
    
    // Remove the last vector
    function removeVector() {
        if (vectors.length <= 2) {
            alert('At least 2 vectors are required');
            return;
        }
        
        vectors.pop();
        
        // Update UI
        updateVectorInputs();
        updateVectorControls();
    }
    
    // Clear all vectors
    function clearVectors() {
        if (vectors.length <= 2) {
            // Reset to two zero vectors
            vectors = currentDimension === '2D' ? [[0, 0], [0, 0]] : [[0, 0, 0], [0, 0, 0]];
        } else {
            // Keep only two zero vectors
            vectors = currentDimension === '2D' ? [[0, 0], [0, 0]] : [[0, 0, 0], [0, 0, 0]];
        }
        
        // Update UI
        updateVectorInputs();
        updateVectorControls();
        clearResults();
    }
    
    // Update vector inputs in the UI
    function updateVectorInputs() {
        vectorInputsContainer.innerHTML = '';
        
        vectors.forEach((vector, index) => {
            const vectorElement = document.createElement('div');
            vectorElement.className = 'vector-input';
            
            const label = document.createElement('div');
            label.className = 'vector-label';
            label.textContent = `Vector ${index + 1}:`;
            
            const components = document.createElement('div');
            components.className = 'vector-components';
            
            // Create input for each component
            vector.forEach((component, compIndex) => {
                const compInput = document.createElement('input');
                compInput.type = 'number';
                compInput.className = 'comp-input';
                compInput.value = component;
                compInput.dataset.vectorIndex = index;
                compInput.dataset.componentIndex = compIndex;
                compInput.placeholder = currentDimension === '2D' 
                    ? (compIndex === 0 ? 'x' : 'y') 
                    : (compIndex === 0 ? 'x' : compIndex === 1 ? 'y' : 'z');
                
                compInput.addEventListener('input', (e) => {
                    const vectorIndex = parseInt(e.target.dataset.vectorIndex);
                    const componentIndex = parseInt(e.target.dataset.componentIndex);
                    const value = parseFloat(e.target.value) || 0;
                    
                    vectors[vectorIndex][componentIndex] = value;
                });
                
                components.appendChild(compInput);
            });
            
            vectorElement.appendChild(label);
            vectorElement.appendChild(components);
            vectorInputsContainer.appendChild(vectorElement);
        });
    }
    
    // Update vector control buttons state
    function updateVectorControls() {
        const maxVectors = currentDimension === '2D' ? 5 : 4;
        removeVectorBtn.disabled = vectors.length <= 2;
        addVectorBtn.disabled = vectors.length >= maxVectors;
    }
    
    // Clear results display
    function clearResults() {
        mathResults.innerHTML = `
            <div class="placeholder-content">
                <i class="fas fa-calculator"></i>
                <p>Enter vectors and click "Analyze Vectors" to see mathematical results</p>
            </div>
        `;
        
        graphPlaceholder.style.display = 'flex';
        graphCanvas.style.display = 'none';
        
        // Clear canvas
        const ctx = graphCanvas.getContext('2d');
        ctx.clearRect(0, 0, graphCanvas.width, graphCanvas.height);
    }
    
    // Analyze vectors for linear dependency
    function analyzeVectors() {
        // Validate vectors
        if (!validateVectors()) {
            return;
        }
        
        // Perform linear algebra calculations
        const results = calculateLinearAlgebraResults();
        
        // Display mathematical results
        displayMathematicalResults(results);
        
        // Draw graphical representation
        drawGraph();
    }
    
    // Validate vector inputs
    function validateVectors() {
        // Check if all vectors have at least one non-zero component
        const allZero = vectors.every(vector => 
            vector.every(component => component === 0)
        );
        
        if (allZero) {
            alert('Please enter at least one non-zero vector');
            return false;
        }
        
        return true;
    }
    
    // Calculate linear algebra results
    function calculateLinearAlgebraResults() {
        const results = {
            vectors: [...vectors],
            dimension: currentDimension,
            rank: 0,
            isLinearlyIndependent: false,
            determinant: null,
            rrefMatrix: [],
            dependencyRelation: null
        };
        
        // Calculate rank
        results.rank = calculateRank(vectors);
        
        // Determine linear dependency
        results.isLinearlyIndependent = results.rank === vectors.length;
        
        // Calculate determinant for square matrices
        if (currentDimension === '2D' && vectors.length === 2) {
            results.determinant = calculate2DDeterminant(vectors[0], vectors[1]);
        } else if (currentDimension === '3D' && vectors.length === 3) {
            results.determinant = calculate3DDeterminant(vectors[0], vectors[1], vectors[2]);
        }
        
        // Calculate RREF
        results.rrefMatrix = calculateRREF(vectors);
        
        // Find dependency relation if dependent
        if (!results.isLinearlyIndependent) {
            results.dependencyRelation = findDependencyRelation(vectors);
        }
        
        return results;
    }
    
    // Calculate rank of a matrix
    function calculateRank(vectors) {
        // Convert vectors to matrix (rows as vectors)
        const matrix = vectors.map(v => [...v]);
        const rows = matrix.length;
        const cols = matrix[0].length;
        
        // Apply Gaussian elimination
        let rank = 0;
        
        for (let col = 0; col < cols && rank < rows; col++) {
            // Find pivot
            let pivotRow = -1;
            for (let row = rank; row < rows; row++) {
                if (Math.abs(matrix[row][col]) > 1e-10) {
                    pivotRow = row;
                    break;
                }
            }
            
            if (pivotRow === -1) continue;
            
            // Swap rows
            if (pivotRow !== rank) {
                [matrix[rank], matrix[pivotRow]] = [matrix[pivotRow], matrix[rank]];
            }
            
            // Normalize pivot row
            const pivot = matrix[rank][col];
            for (let j = col; j < cols; j++) {
                matrix[rank][j] /= pivot;
            }
            
            // Eliminate other rows
            for (let row = 0; row < rows; row++) {
                if (row !== rank && Math.abs(matrix[row][col]) > 1e-10) {
                    const factor = matrix[row][col];
                    for (let j = col; j < cols; j++) {
                        matrix[row][j] -= factor * matrix[rank][j];
                    }
                }
            }
            
            rank++;
        }
        
        return rank;
    }
    
    // Calculate determinant of 2x2 matrix
    function calculate2DDeterminant(v1, v2) {
        return v1[0] * v2[1] - v1[1] * v2[0];
    }
    
    // Calculate determinant of 3x3 matrix
    function calculate3DDeterminant(v1, v2, v3) {
        return v1[0] * (v2[1] * v3[2] - v2[2] * v3[1]) -
               v1[1] * (v2[0] * v3[2] - v2[2] * v3[0]) +
               v1[2] * (v2[0] * v3[1] - v2[1] * v3[0]);
    }
    
    // Calculate Reduced Row Echelon Form
    function calculateRREF(vectors) {
        const matrix = vectors.map(v => [...v]);
        const rows = matrix.length;
        const cols = matrix[0].length;
        
        let lead = 0;
        for (let r = 0; r < rows; r++) {
            if (lead >= cols) break;
            
            let i = r;
            while (Math.abs(matrix[i][lead]) < 1e-10) {
                i++;
                if (i === rows) {
                    i = r;
                    lead++;
                    if (lead === cols) return matrix;
                }
            }
            
            // Swap rows
            [matrix[r], matrix[i]] = [matrix[i], matrix[r]];
            
            // Normalize row
            const val = matrix[r][lead];
            for (let j = 0; j < cols; j++) {
                matrix[r][j] /= val;
            }
            
            // Eliminate other rows
            for (let i = 0; i < rows; i++) {
                if (i !== r) {
                    const val = matrix[i][lead];
                    for (let j = 0; j < cols; j++) {
                        matrix[i][j] -= val * matrix[r][j];
                    }
                }
            }
            
            lead++;
        }
        
        return matrix;
    }
    
    // Find dependency relation
    function findDependencyRelation(vectors) {
        // For simplicity, we'll return a generic relation
        // In a real application, you would solve the linear system
        const rank = calculateRank(vectors);
        return `At least ${vectors.length - rank} vector(s) can be expressed as a linear combination of the others.`;
    }
    
    // Display mathematical results
    function displayMathematicalResults(results) {
        let html = `
            <div class="result-item">
                <div class="result-title"><i class="fas fa-ruler-combined"></i> Dimension</div>
                <div class="result-value">${results.dimension}</div>
            </div>
            
            <div class="result-item">
                <div class="result-title"><i class="fas fa-layer-group"></i> Rank of Matrix</div>
                <div class="result-value">${results.rank} / ${vectors.length}</div>
                <p>The maximum number of linearly independent vectors in the set.</p>
            </div>
            
            <div class="result-item">
                <div class="result-title"><i class="fas fa-link"></i> Linear Dependency</div>
                <div class="result-value ${results.isLinearlyIndependent ? 'independent' : 'dependent'}">
                    ${results.isLinearlyIndependent ? 'LINEARLY INDEPENDENT' : 'LINEARLY DEPENDENT'}
                </div>
                <p>${results.isLinearlyIndependent ? 
                    'No vector in the set can be written as a linear combination of the others.' : 
                    'At least one vector in the set can be written as a linear combination of the others.'}</p>
            </div>
        `;
        
        // Add determinant if available
        if (results.determinant !== null) {
            html += `
                <div class="result-item">
                    <div class="result-title"><i class="fas fa-divide"></i> Determinant</div>
                    <div class="result-value">${results.determinant.toFixed(4)}</div>
                    <p>${Math.abs(results.determinant) < 1e-10 ? 
                        'Zero determinant indicates linear dependency.' : 
                        'Non-zero determinant indicates linear independence.'}</p>
                </div>
            `;
        }
        
        // Add RREF matrix
        html += `
            <div class="result-item">
                <div class="result-title"><i class="fas fa-th"></i> Reduced Row Echelon Form (RREF)</div>
                <div class="matrix-display">
        `;
        
        results.rrefMatrix.forEach(row => {
            html += `<div class="matrix-row">`;
            row.forEach(cell => {
                html += `<div class="matrix-cell">${cell.toFixed(2)}</div>`;
            });
            html += `</div>`;
        });
        
        html += `
                </div>
                <p>Pivot columns correspond to linearly independent vectors.</p>
            </div>
        `;
        
        // Add dependency relation if dependent
        if (results.dependencyRelation) {
            html += `
                <div class="result-item">
                    <div class="result-title"><i class="fas fa-project-diagram"></i> Dependency Relation</div>
                    <p>${results.dependencyRelation}</p>
                </div>
            `;
        }
        
        mathResults.innerHTML = html;
    }
    
    // Draw graph
    function drawGraph() {
        const ctx = graphCanvas.getContext('2d');
        const width = graphCanvas.width;
        const height = graphCanvas.height;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Show canvas, hide placeholder
        graphPlaceholder.style.display = 'none';
        graphCanvas.style.display = 'block';
        
        // Draw based on dimension
        if (currentDimension === '2D') {
            draw2DGraph(ctx, width, height);
        } else {
            draw3DGraph(ctx, width, height);
        }
    }
    
    // Draw 2D graph
    function draw2DGraph(ctx, width, height) {
        const padding = 50;
        const graphWidth = width - 2 * padding;
        const graphHeight = height - 2 * padding;
        
        // Draw coordinate system
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        
        // X axis
        ctx.beginPath();
        ctx.moveTo(padding, height / 2);
        ctx.lineTo(width - padding, height / 2);
        ctx.stroke();
        
        // Y axis
        ctx.beginPath();
        ctx.moveTo(width / 2, padding);
        ctx.lineTo(width / 2, height - padding);
        ctx.stroke();
        
        // Axis labels
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('x', width - padding + 10, height / 2 - 5);
        ctx.fillText('y', width / 2 + 10, padding - 10);
        
        // Find max vector magnitude for scaling
        let maxMagnitude = 0;
        vectors.forEach(vector => {
            const magnitude = Math.sqrt(vector[0] ** 2 + vector[1] ** 2);
            if (magnitude > maxMagnitude) maxMagnitude = magnitude;
        });
        
        const scale = maxMagnitude > 0 ? Math.min(graphWidth, graphHeight) / 2 / maxMagnitude * 0.8 : 1;
        
        // Draw vectors
        const colors = ['#6c63ff', '#ff6584', '#36d1dc', '#4cd964', '#ff9f40'];
        
        vectors.forEach((vector, index) => {
            const x = vector[0] * scale;
            const y = -vector[1] * scale; // Invert y for canvas coordinate system
            
            const startX = width / 2;
            const startY = height / 2;
            const endX = startX + x;
            const endY = startY + y;
            
            // Draw vector line
            ctx.strokeStyle = colors[index % colors.length];
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
            
            // Draw arrowhead
            drawArrowhead(ctx, startX, startY, endX, endY, 10, colors[index % colors.length]);
            
            // Draw vector label
            if (showLabels) {
                ctx.fillStyle = colors[index % colors.length];
                ctx.font = 'bold 16px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(`v${index + 1}`, endX + 15, endY + 5);
            }
        });
        
        // Draw origin label
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '12px Arial';
        ctx.fillText('O', width / 2 - 10, height / 2 + 20);
    }
    
    // Draw 3D graph
    function draw3DGraph(ctx, width, height) {
        const padding = 50;
        const centerX = width / 2;
        const centerY = height / 2;
        
        // Clear with a subtle gradient
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, 'rgba(26, 26, 46, 0.5)');
        gradient.addColorStop(1, 'rgba(22, 33, 62, 0.5)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        
        // Convert rotation angles to radians
        const radX = graphRotation.x * Math.PI / 180;
        const radY = graphRotation.y * Math.PI / 180;
        const radZ = graphRotation.z * Math.PI / 180;
        
        // Rotation matrices
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
        
        // Combine rotations (Z * Y * X)
        const multiplyMatrices = (a, b) => {
            const result = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    for (let k = 0; k < 3; k++) {
                        result[i][j] += a[i][k] * b[k][j];
                    }
                }
            }
            return result;
        };
        
        const rotation = multiplyMatrices(multiplyMatrices(rotZ, rotY), rotX);
        
        // Find max vector magnitude for scaling
        let maxMagnitude = 0;
        vectors.forEach(vector => {
            const magnitude = Math.sqrt(vector[0] ** 2 + vector[1] ** 2 + vector[2] ** 2);
            if (magnitude > maxMagnitude) maxMagnitude = magnitude;
        });
        
        const scale = maxMagnitude > 0 ? Math.min(width, height) / 3 / maxMagnitude * 0.8 : 1;
        
        // Project 3D point to 2D with perspective
        const project = (x, y, z) => {
            // Apply rotation
            const rx = rotation[0][0] * x + rotation[0][1] * y + rotation[0][2] * z;
            const ry = rotation[1][0] * x + rotation[1][1] * y + rotation[1][2] * z;
            const rz = rotation[2][0] * x + rotation[2][1] * y + rotation[2][2] * z;
            
            // Apply perspective
            const distance = 5;
            const factor = distance / (distance + rz);
            const px = rx * factor * scale;
            const py = ry * factor * scale;
            
            return {
                x: centerX + px,
                y: centerY - py, // Invert y for canvas coordinate system
                depth: rz
            };
        };
        
        // Draw coordinate axes
        const axes = [
            { start: [0, 0, 0], end: [2, 0, 0], color: '#ff6584', label: 'x' },
            { start: [0, 0, 0], end: [0, 2, 0], color: '#4cd964', label: 'y' },
            { start: [0, 0, 0], end: [0, 0, 2], color: '#36d1dc', label: 'z' }
        ];
        
        axes.forEach(axis => {
            const start = project(...axis.start);
            const end = project(...axis.end);
            
            // Draw axis line
            ctx.strokeStyle = axis.color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();
            
            // Draw axis label
            if (showLabels) {
                ctx.fillStyle = axis.color;
                ctx.font = 'bold 16px Arial';
                ctx.fillText(axis.label, end.x + 10, end.y + 10);
            }
        });
        
        // Draw vectors
        const colors = ['#6c63ff', '#ff9f40', '#9d4edd', '#ff595e'];
        
        vectors.forEach((vector, index) => {
            const start = project(0, 0, 0);
            const end = project(vector[0], vector[1], vector[2]);
            
            // Draw vector line
            ctx.strokeStyle = colors[index % colors.length];
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();
            
            // Draw arrowhead
            drawArrowhead(ctx, start.x, start.y, end.x, end.y, 10, colors[index % colors.length]);
            
            // Draw vector label
            if (showLabels) {
                ctx.fillStyle = colors[index % colors.length];
                ctx.font = 'bold 16px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(`v${index + 1}`, end.x + 15, end.y + 5);
            }
        });
        
        // Draw origin label
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '12px Arial';
        ctx.fillText('O', centerX - 15, centerY + 20);
    }
    
    // Draw arrowhead for vectors
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
    
    // Draw graph placeholder
    function drawGraphPlaceholder() {
        const ctx = graphCanvas.getContext('2d');
        const width = graphCanvas.width;
        const height = graphCanvas.height;
        
        // Draw a simple coordinate system in the placeholder
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
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
    
    // Toggle graph rotation
    function toggleRotation() {
        isRotating = !isRotating;
        const icon = rotateBtn.querySelector('i');
        
        if (isRotating) {
            icon.classList.remove('fa-sync-alt');
            icon.classList.add('fa-pause');
            startRotation();
        } else {
            icon.classList.remove('fa-pause');
            icon.classList.add('fa-sync-alt');
        }
    }
    
    // Start automatic rotation for 3D graph
    function startRotation() {
        if (!isRotating || currentDimension !== '3D') return;
        
        graphRotation.y += 1;
        if (graphRotation.y >= 360) graphRotation.y = 0;
        
        drawGraph();
        
        if (isRotating) {
            requestAnimationFrame(() => {
                setTimeout(startRotation, 50);
            });
        }
    }
    
    // Toggle labels on graph
    function toggleLabels() {
        showLabels = !showLabels;
        toggleLabelsBtn.classList.toggle('active', showLabels);
        
        if (graphCanvas.style.display !== 'none') {
            drawGraph();
        }
    }
    
    // Generate random vectors
    function generateRandomVectors() {
        const count = vectors.length;
        
        vectors = vectors.map(() => {
            if (currentDimension === '2D') {
                const angle = Math.random() * 2 * Math.PI;
                const magnitude = 1 + Math.random() * 3;
                return [
                    Math.cos(angle) * magnitude,
                    Math.sin(angle) * magnitude
                ];
            } else {
                // Generate random 3D vector
                const theta = Math.random() * 2 * Math.PI;
                const phi = Math.random() * Math.PI;
                const magnitude = 1 + Math.random() * 3;
                return [
                    magnitude * Math.sin(phi) * Math.cos(theta),
                    magnitude * Math.sin(phi) * Math.sin(theta),
                    magnitude * Math.cos(phi)
                ];
            }
        });
        
        updateVectorInputs();
        clearResults();
    }
    
    // Load example vectors
    function loadExample(example) {
        switch(example) {
            case '2D-dependent':
                currentDimension = '2D';
                dimensionBtns.forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.dim === '2D');
                });
                vectors = [[1, 2], [2, 4]]; // v2 = 2 * v1
                break;
            case '2D-independent':
                currentDimension = '2D';
                dimensionBtns.forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.dim === '2D');
                });
                vectors = [[1, 0], [0, 1]]; // Standard basis
                break;
            case '3D-dependent':
                currentDimension = '3D';
                dimensionBtns.forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.dim === '3D');
                });
                vectors = [[1, 2, 3], [2, 4, 6], [3, 6, 9]]; // All multiples
                break;
            case '3D-independent':
                currentDimension = '3D';
                dimensionBtns.forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.dim === '3D');
                });
                vectors = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]; // Standard basis
                break;
        }
        
        updateVectorInputs();
        updateVectorControls();
        clearResults();
    }
    
    // Export analysis results as text
    function exportResults() {
        if (!validateVectors()) {
            alert('Please enter valid vectors first');
            return;
        }
        
        const results = calculateLinearAlgebraResults();
        let text = `Linear Algebra Vector Analysis - MathVortexLabs\n`;
        text += `Generated: ${new Date().toLocaleString()}\n\n`;
        text += `Dimension: ${results.dimension}\n`;
        text += `Number of vectors: ${vectors.length}\n\n`;
        
        text += `Vectors:\n`;
        vectors.forEach((vector, index) => {
            text += `  v${index + 1} = (${vector.join(', ')})\n`;
        });
        
        text += `\nAnalysis Results:\n`;
        text += `  Rank: ${results.rank} of ${vectors.length}\n`;
        text += `  Linear Dependency: ${results.isLinearlyIndependent ? 'Independent' : 'Dependent'}\n`;
        
        if (results.determinant !== null) {
            text += `  Determinant: ${results.determinant.toFixed(4)}\n`;
        }
        
        text += `\nReduced Row Echelon Form:\n`;
        results.rrefMatrix.forEach(row => {
            text += `  [${row.map(val => val.toFixed(2)).join(', ')}]\n`;
        });
        
        if (results.dependencyRelation) {
            text += `\nDependency Relation:\n  ${results.dependencyRelation}\n`;
        }
        
        // Create and download file
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vector-analysis-${new Date().getTime()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    // Export graph as image
    function exportGraphImage() {
        if (graphCanvas.style.display === 'none') {
            alert('Please analyze vectors first to generate a graph');
            return;
        }
        
        const url = graphCanvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = url;
        a.download = `vector-graph-${new Date().getTime()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
    
    // Copy results to clipboard
    function copyResults() {
        if (!validateVectors()) {
            alert('Please enter valid vectors first');
            return;
        }
        
        const results = calculateLinearAlgebraResults();
        let text = `Linear Algebra Vector Analysis\n`;
        text += `Dimension: ${results.dimension}\n`;
        text += `Vectors: ${vectors.map((v, i) => `v${i+1}=(${v.join(',')})`).join(', ')}\n`;
        text += `Rank: ${results.rank}/${vectors.length}\n`;
        text += `Status: ${results.isLinearlyIndependent ? 'Independent' : 'Dependent'}\n`;
        
        if (results.determinant !== null) {
            text += `Determinant: ${results.determinant.toFixed(4)}\n`;
        }
        
        navigator.clipboard.writeText(text)
            .then(() => alert('Results copied to clipboard!'))
            .catch(err => console.error('Could not copy text: ', err));
    }
    
    // Initialize the application
    init();
});
