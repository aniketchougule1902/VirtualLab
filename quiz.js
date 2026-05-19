document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    const quizSection = document.querySelector('.quiz-section');
    const questionBlocks = document.querySelectorAll('.quiz-section .example-box');
    const quizItems = [];

    questionBlocks.forEach((block, index) => {
        const questionEl = block.querySelector('h4');
        const paragraphs = Array.from(block.querySelectorAll('p'));
        const optionsPara = paragraphs.find(p => p.textContent.includes('Options:'));
        const answerPara = paragraphs.find(p => p.textContent.includes('Correct Option:'));
        const solutionList = block.querySelector('ol');

        if (!questionEl || !optionsPara || !answerPara || !solutionList) {
            return;
        }

        const optionsText = optionsPara.textContent.replace('Options:', '').trim();
        const markerRegex = /([A-Z])\)\s/g;
        const markers = [...optionsText.matchAll(markerRegex)];
        const correctOption = answerPara.textContent.replace('Correct Option:', '').trim().charAt(0).toUpperCase();

        if (markers.length === 0 || !correctOption) {
            return;
        }

        const options = markers.map((marker, markerIndex) => {
            const start = marker.index;
            const end = markerIndex + 1 < markers.length ? markers[markerIndex + 1].index : optionsText.length;
            return optionsText.slice(start, end).trim();
        });

        const questionTitle = questionEl.cloneNode(true);
        const optionsWrapper = document.createElement('div');
        optionsWrapper.className = 'quiz-options';

        options.forEach(option => {
            const optionLetter = option.charAt(0);
            const optionText = option.replace(/^[A-Z]\)\s*/, '').trim();
            const label = document.createElement('label');
            label.className = 'quiz-option';

            const input = document.createElement('input');
            input.type = 'radio';
            input.name = `quiz-${index}`;
            input.value = optionLetter;

            const textSpan = document.createElement('span');
            textSpan.textContent = `${optionLetter}) ${optionText}`;

            label.appendChild(input);
            label.appendChild(textSpan);
            optionsWrapper.appendChild(label);
        });

        const feedback = document.createElement('div');
        feedback.className = 'quiz-feedback';

        const solutionContainer = document.createElement('div');
        solutionContainer.className = 'quiz-solution';
        solutionContainer.style.display = 'none';

        const solutionTitle = document.createElement('p');
        solutionTitle.className = 'quiz-solution-title';
        solutionTitle.textContent = 'Stepwise Solution:';

        solutionContainer.appendChild(solutionTitle);
        solutionContainer.appendChild(solutionList.cloneNode(true));

        quizItems.push({
            block,
            optionsWrapper,
            feedback,
            solutionContainer,
            correctOption,
            inputName: `quiz-${index}`
        });

        block.replaceChildren(questionTitle, optionsWrapper, feedback, solutionContainer);
    });

    if (!quizSection || quizItems.length === 0) {
        return;
    }

    const summaryBox = document.createElement('div');
    summaryBox.className = 'quiz-summary';
    summaryBox.style.display = 'none';

    const actionsWrapper = document.createElement('div');
    actionsWrapper.className = 'quiz-actions';

    const submitButton = document.createElement('button');
    submitButton.type = 'button';
    submitButton.className = 'btn btn-primary';
    submitButton.textContent = 'Submit Answers';

    const resetButton = document.createElement('button');
    resetButton.type = 'button';
    resetButton.className = 'btn btn-secondary';
    resetButton.textContent = 'Retake Quiz';
    resetButton.addEventListener('click', () => {
        window.location.reload();
    });

    actionsWrapper.append(submitButton, resetButton);
    quizSection.append(summaryBox, actionsWrapper);

    submitButton.addEventListener('click', () => {
        let score = 0;
        let unanswered = 0;

        quizItems.forEach(item => {
            const selectedOption = item.optionsWrapper.querySelector(`input[name="${item.inputName}"]:checked`);
            const labels = Array.from(item.optionsWrapper.querySelectorAll('.quiz-option'));
            const selectedValue = selectedOption ? selectedOption.value : null;

            labels.forEach(label => {
                const input = label.querySelector('input');
                label.classList.remove('correct-answer', 'user-incorrect');

                if (input.value === item.correctOption) {
                    label.classList.add('correct-answer');
                }

                if (selectedValue && input.value === selectedValue && selectedValue !== item.correctOption) {
                    label.classList.add('user-incorrect');
                }

                input.disabled = true;
            });

            if (!selectedValue) {
                unanswered += 1;
                item.feedback.className = 'quiz-feedback warning';
                item.feedback.textContent = `Not attempted. Correct option: ${item.correctOption}.`;
            } else if (selectedValue === item.correctOption) {
                score += 1;
                item.feedback.className = 'quiz-feedback correct';
                item.feedback.textContent = 'Correct answer.';
            } else {
                item.feedback.className = 'quiz-feedback incorrect';
                item.feedback.textContent = `Incorrect. Correct option: ${item.correctOption}.`;
            }

            item.solutionContainer.style.display = 'block';
        });

        const total = quizItems.length;
        const percentage = Math.round((score / total) * 100);

        summaryBox.innerHTML = `
            <h3>Your Score</h3>
            <p class="quiz-score">${score} / ${total} (${percentage}%)</p>
            <p>${score} correct, ${total - score - unanswered} incorrect, ${unanswered} not attempted.</p>
        `;
        summaryBox.style.display = 'block';
        submitButton.disabled = true;
        submitButton.textContent = 'Submitted';
        summaryBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
});
